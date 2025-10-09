import { db as prisma } from '@/lib/db'
import { OrderStatus, ProductionStatus } from '@prisma/client'
import { allocateStockForOrder, applyStockAllocations, updateVariantAggregatedStock } from '@/lib/brand-stock'

// Transiciones válidas de estado de pedido
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['IN_PRODUCTION', 'CANCELLED'],
  IN_PRODUCTION: ['READY_FOR_PICKUP', 'SHIPPED', 'CANCELLED'],
  READY_FOR_PICKUP: ['DELIVERED', 'CANCELLED'],
  SHIPPED: ['DELIVERED', 'CANCELLED'],
  DELIVERED: ['REFUNDED'],
  CANCELLED: [], // Estado final
  REFUNDED: []   // Estado final
}

// Función para validar transición de estado
export function isValidStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
  return ORDER_STATUS_TRANSITIONS[currentStatus].includes(newStatus)
}

// Función para generar número de pedido único
export async function generateOrderNumber(): Promise<string> {
  const today = new Date()
  const year = today.getFullYear().toString().slice(-2)
  const month = (today.getMonth() + 1).toString().padStart(2, '0')
  const day = today.getDate().toString().padStart(2, '0')
  
  // Contar pedidos del día
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
  
  const todayOrdersCount = await prisma.order.count({
    where: {
      createdAt: {
        gte: startOfDay,
        lt: endOfDay
      }
    }
  })
  
  const sequence = (todayOrdersCount + 1).toString().padStart(3, '0')
  return `LV${year}${month}${day}-${sequence}`
}

// Función para calcular total del pedido
export function calculateOrderTotal(items: any[], shippingCost: number = 0, taxRate: number = 0): {
  subtotal: number
  taxAmount: number
  shippingCost: number
  totalAmount: number
} {
  const subtotal = items.reduce((sum, item) => {
    return sum + (item.unitPrice * item.quantity)
  }, 0)
  
  const taxAmount = subtotal * taxRate
  const totalAmount = subtotal + taxAmount + shippingCost
  
  return {
    subtotal,
    taxAmount,
    shippingCost,
    totalAmount
  }
}

// Función para actualizar stock cuando se crea un pedido (ahora usa sistema multi-marca)
export async function updateStockForOrder(orderItems: any[], operation: 'reserve' | 'release', userId?: string) {
  for (const item of orderItems) {
    if (item.variantId) {
      if (operation === 'reserve') {
        // Para reservas, usar el sistema de asignación automática de marcas
        const allocationResult = await allocateStockForOrder(item.variantId, item.quantity)
        
        if (!allocationResult.success) {
          throw new Error(allocationResult.error || `No se pudo asignar stock para variante ${item.variantId}`)
        }

        // Aplicar las asignaciones (esto actualizará automáticamente el stock agregado)
        await applyStockAllocations(item.id, allocationResult.allocations, userId)
        
      } else if (operation === 'release') {
        // Para liberaciones, devolver el stock a las marcas específicas
        const allocations = await prisma.orderItemAllocation.findMany({
          where: { orderItemId: item.id },
          include: { brandStock: true }
        })

        await prisma.$transaction(async (tx) => {
          for (const allocation of allocations) {
            // Devolver stock a la marca específica
            await tx.brandStock.update({
              where: { id: allocation.brandStockId },
              data: { quantity: { increment: allocation.quantity } }
            })

            // Registrar movimiento
            await tx.brandStockMovement.create({
              data: {
                brandStockId: allocation.brandStockId,
                type: 'RETURN',
                quantity: allocation.quantity,
                previousStock: allocation.brandStock.quantity,
                newStock: allocation.brandStock.quantity + allocation.quantity,
                reason: 'Liberación por cancelación de pedido',
                orderItemId: item.id,
                userId
              }
            })

            // Actualizar estado de asignación
            await tx.orderItemAllocation.update({
              where: { id: allocation.id },
              data: { status: 'CANCELLED' }
            })
          }
        })

        // Actualizar stock agregado de la variante
        await updateVariantAggregatedStock(item.variantId)
      }
      
      // Crear movimiento de inventario tradicional para compatibilidad
      await prisma.inventoryMovement.create({
        data: {
          variantId: item.variantId,
          type: operation === 'reserve' ? 'OUT' : 'IN',
          quantity: item.quantity,
          reason: operation === 'reserve' ? 'Reserva por pedido (multi-marca)' : 'Liberación por cancelación (multi-marca)'
        }
      })
    }
  }
}

// Función para validar disponibilidad de stock (ahora usa sistema multi-marca)
export async function validateStockAvailability(orderItems: any[]): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = []
  
  for (const item of orderItems) {
    if (item.variantId) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId },
        include: {
          product: {
            select: { name: true }
          },
          brandStocks: {
            where: { 
              isActive: true,
              quantity: { gt: 0 }
            }
          }
        }
      })
      
      if (!variant) {
        errors.push(`Variante ${item.variantId} no encontrada`)
        continue
      }
      
      if (!variant.isActive) {
        errors.push(`${variant.product.name} (${variant.sku}) no está disponible`)
        continue
      }
      
      // Verificar si hay asignación posible usando el sistema multi-marca
      const allocationResult = await allocateStockForOrder(item.variantId, item.quantity)
      
      if (!allocationResult.success) {
        const totalStock = variant.brandStocks.reduce((sum, bs) => sum + bs.quantity, 0)
        errors.push(`Stock insuficiente para ${variant.product.name} (${variant.sku}). Disponible: ${totalStock}, Solicitado: ${item.quantity}`)
      }
    } else {
      // Verificar que el producto existe y está activo
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      })
      
      if (!product) {
        errors.push(`Producto ${item.productId} no encontrado`)
        continue
      }
      
      if (!product.isActive) {
        errors.push(`${product.name} no está disponible`)
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

// Función para actualizar estado de producción de items
export async function updateProductionStatus(orderItemId: string, status: ProductionStatus, notes?: string) {
  await prisma.orderItem.update({
    where: { id: orderItemId },
    data: {
      productionStatus: status,
      ...(notes && { productionNotes: notes })
    }
  })
}

// Función para verificar si todos los items están listos para envío
export async function checkOrderReadyForShipping(orderId: string): Promise<boolean> {
  const orderItems = await prisma.orderItem.findMany({
    where: { orderId }
  })
  
  return orderItems.every(item => 
    item.productionStatus === 'COMPLETED'
  )
}

// Función para obtener estadísticas de pedidos
export async function getOrderStatistics(dateFrom?: Date, dateTo?: Date) {
  const where: any = {}
  
  if (dateFrom || dateTo) {
    where.createdAt = {}
    if (dateFrom) where.createdAt.gte = dateFrom
    if (dateTo) where.createdAt.lte = dateTo
  }
  
  const [
    totalOrders,
    totalRevenue,
    statusCounts,
    paymentStatusCounts,
    averageOrderValue
  ] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.aggregate({
      where,
      _sum: { totalAmount: true }
    }),
    prisma.order.groupBy({
      by: ['status'],
      where,
      _count: { status: true }
    }),
    prisma.order.groupBy({
      by: ['paymentStatus'],
      where,
      _count: { paymentStatus: true }
    }),
    prisma.order.aggregate({
      where,
      _avg: { totalAmount: true }
    })
  ])
  
  return {
    totalOrders,
    totalRevenue: totalRevenue._sum.totalAmount || 0,
    averageOrderValue: averageOrderValue._avg.totalAmount || 0,
    statusDistribution: statusCounts.reduce((acc, item) => {
      acc[item.status] = item._count.status
      return acc
    }, {} as Record<string, number>),
    paymentDistribution: paymentStatusCounts.reduce((acc, item) => {
      acc[item.paymentStatus] = item._count.paymentStatus
      return acc
    }, {} as Record<string, number>)
  }
}

// Función para obtener pedidos pendientes de producción
export async function getPendingProductionOrders() {
  return prisma.order.findMany({
    where: {
      status: 'IN_PRODUCTION',
      orderItems: {
        some: {
          productionStatus: {
            in: ['PENDING', 'IN_PROGRESS']
          }
        }
      }
    },
    include: {
      orderItems: {
        where: {
          productionStatus: {
            in: ['PENDING', 'IN_PROGRESS']
          }
        },
        include: {
          product: true,
          variant: true,
          design: true
        }
      }
    }
  })
}