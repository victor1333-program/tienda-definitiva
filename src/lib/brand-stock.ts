import { db as prisma } from '@/lib/db'
import { BrandMovementType, AllocationStatus } from '@prisma/client'

export interface BrandStockSummary {
  variantId: string
  totalStock: number
  brands: {
    id: string
    brand: string
    quantity: number
    costPrice: number
    location?: string
    isPreferred: boolean
    priority: number
  }[]
}

export interface AllocationResult {
  success: boolean
  allocations: {
    brandStockId: string
    brand: string
    quantity: number
    costPrice: number
  }[]
  totalCost: number
  error?: string
}

// Calcular stock total agregado para una variante
export async function getVariantTotalStock(variantId: string): Promise<number> {
  const result = await prisma.brandStock.aggregate({
    where: {
      variantId,
      isActive: true,
      quantity: { gt: 0 }
    },
    _sum: {
      quantity: true
    }
  })

  return result._sum.quantity || 0
}

// Obtener resumen detallado de stock por marcas
export async function getBrandStockSummary(variantId: string): Promise<BrandStockSummary> {
  const brandStocks = await prisma.brandStock.findMany({
    where: {
      variantId,
      isActive: true
    },
    include: {
      supplier: {
        select: { name: true }
      }
    },
    orderBy: [
      { isPreferred: 'desc' },
      { priority: 'asc' },
      { costPrice: 'asc' }
    ]
  })

  const totalStock = brandStocks.reduce((sum, stock) => sum + stock.quantity, 0)

  return {
    variantId,
    totalStock,
    brands: brandStocks.map(stock => ({
      id: stock.id,
      brand: stock.brand,
      quantity: stock.quantity,
      costPrice: stock.costPrice,
      location: stock.location,
      isPreferred: stock.isPreferred,
      priority: stock.priority
    }))
  }
}

// Lógica de selección automática de marcas para un pedido
export async function allocateStockForOrder(
  variantId: string, 
  requestedQuantity: number
): Promise<AllocationResult> {
  // Obtener stock disponible ordenado por criterios de selección
  const availableStock = await prisma.brandStock.findMany({
    where: {
      variantId,
      isActive: true,
      quantity: { gt: 0 }
    },
    orderBy: [
      { isPreferred: 'desc' },  // Preferidas primero
      { priority: 'asc' },      // Menor prioridad = mayor preferencia
      { costPrice: 'asc' },     // Más barato primero
      { quantity: 'desc' }      // Mayor stock disponible
    ]
  })

  // Verificar si hay suficiente stock total
  const totalAvailable = availableStock.reduce((sum, stock) => sum + stock.quantity, 0)
  
  if (totalAvailable < requestedQuantity) {
    return {
      success: false,
      allocations: [],
      totalCost: 0,
      error: `Stock insuficiente. Disponible: ${totalAvailable}, Solicitado: ${requestedQuantity}`
    }
  }

  // Realizar asignación automática
  let remaining = requestedQuantity
  const allocations = []
  let totalCost = 0

  for (const stock of availableStock) {
    if (remaining <= 0) break

    const toAllocate = Math.min(remaining, stock.quantity)
    
    allocations.push({
      brandStockId: stock.id,
      brand: stock.brand,
      quantity: toAllocate,
      costPrice: stock.costPrice
    })

    totalCost += toAllocate * stock.costPrice
    remaining -= toAllocate
  }

  return {
    success: true,
    allocations,
    totalCost
  }
}

// Aplicar asignaciones y crear registros de movimiento
export async function applyStockAllocations(
  orderItemId: string,
  allocations: AllocationResult['allocations'],
  userId?: string
) {
  const results = await prisma.$transaction(async (tx) => {
    const allocationRecords = []

    for (const allocation of allocations) {
      // Obtener stock actual
      const brandStock = await tx.brandStock.findUnique({
        where: { id: allocation.brandStockId }
      })

      if (!brandStock || brandStock.quantity < allocation.quantity) {
        throw new Error(`Stock insuficiente para marca ${allocation.brand}`)
      }

      // Actualizar stock
      const updatedStock = await tx.brandStock.update({
        where: { id: allocation.brandStockId },
        data: {
          quantity: { decrement: allocation.quantity }
        }
      })

      // Crear registro de asignación
      const allocationRecord = await tx.orderItemAllocation.create({
        data: {
          orderItemId,
          brandStockId: allocation.brandStockId,
          quantity: allocation.quantity,
          status: AllocationStatus.ALLOCATED
        }
      })

      // Registrar movimiento de stock
      await tx.brandStockMovement.create({
        data: {
          brandStockId: allocation.brandStockId,
          type: BrandMovementType.SALE,
          quantity: -allocation.quantity,
          previousStock: brandStock.quantity,
          newStock: updatedStock.quantity,
          orderItemId,
          reason: `Venta - Pedido ${orderItemId}`,
          userId
        }
      })

      allocationRecords.push(allocationRecord)
    }

    return allocationRecords
  })

  return results
}

// Actualizar stock agregado en ProductVariant
export async function updateVariantAggregatedStock(variantId: string) {
  const totalStock = await getVariantTotalStock(variantId)
  
  await prisma.productVariant.update({
    where: { id: variantId },
    data: { stock: totalStock }
  })

  return totalStock
}

// Añadir stock de una nueva marca
export async function addBrandStock(data: {
  variantId: string
  brand: string
  supplierId?: string
  supplierSku?: string
  quantity: number
  costPrice: number
  salePrice?: number
  location?: string
  batch?: string
  isPreferred?: boolean
  priority?: number
  minStock?: number
  maxStock?: number
  notes?: string
  userId?: string
}) {
  const result = await prisma.$transaction(async (tx) => {
    // Crear registro de stock de marca
    const brandStock = await tx.brandStock.create({
      data: {
        variantId: data.variantId,
        brand: data.brand,
        supplierId: data.supplierId,
        supplierSku: data.supplierSku,
        quantity: data.quantity,
        costPrice: data.costPrice,
        salePrice: data.salePrice,
        location: data.location,
        batch: data.batch,
        isPreferred: data.isPreferred || false,
        priority: data.priority || 0,
        minStock: data.minStock || 5,
        maxStock: data.maxStock,
        notes: data.notes,
        lastRestock: new Date()
      }
    })

    // Registrar movimiento de entrada
    await tx.brandStockMovement.create({
      data: {
        brandStockId: brandStock.id,
        type: BrandMovementType.PURCHASE,
        quantity: data.quantity,
        previousStock: 0,
        newStock: data.quantity,
        reason: 'Stock inicial',
        userId: data.userId
      }
    })

    return brandStock
  })

  // Actualizar stock agregado
  await updateVariantAggregatedStock(data.variantId)

  return result
}

// Ajustar stock de una marca específica
export async function adjustBrandStock(
  brandStockId: string,
  newQuantity: number,
  reason: string,
  userId?: string
) {
  const result = await prisma.$transaction(async (tx) => {
    const currentStock = await tx.brandStock.findUnique({
      where: { id: brandStockId }
    })

    if (!currentStock) {
      throw new Error('Stock de marca no encontrado')
    }

    const quantityDiff = newQuantity - currentStock.quantity

    // Actualizar stock
    const updatedStock = await tx.brandStock.update({
      where: { id: brandStockId },
      data: { 
        quantity: newQuantity,
        lastRestock: quantityDiff > 0 ? new Date() : currentStock.lastRestock
      }
    })

    // Registrar movimiento
    await tx.brandStockMovement.create({
      data: {
        brandStockId,
        type: BrandMovementType.ADJUSTMENT,
        quantity: quantityDiff,
        previousStock: currentStock.quantity,
        newStock: newQuantity,
        reason,
        userId
      }
    })

    return updatedStock
  })

  // Actualizar stock agregado en la variante
  await updateVariantAggregatedStock(result.variantId)

  return result
}