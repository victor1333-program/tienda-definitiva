/**
 * Sistema avanzado de tracking de movimientos de inventario
 * Registra todos los cambios de stock con detalles completos
 */

import { db as prisma } from '@/lib/db'

export interface InventoryMovement {
  id?: string
  productId: string
  variantId?: string | null
  type: InventoryMovementType
  quantity: number
  previousStock: number
  newStock: number
  unitCost?: number
  totalValue?: number
  reason: string
  reference?: string
  orderId?: string
  userId?: string
  supplierId?: string
  notes?: string
  batchNumber?: string
  expirationDate?: Date
  locationFrom?: string
  locationTo?: string
  createdAt?: Date
}

export type InventoryMovementType = 
  | 'PURCHASE'           // Compra a proveedor
  | 'SALE'              // Venta a cliente
  | 'RETURN_IN'         // Devolución de cliente
  | 'RETURN_OUT'        // Devolución a proveedor
  | 'ADJUSTMENT'        // Ajuste de inventario
  | 'TRANSFER'          // Transferencia entre ubicaciones
  | 'DAMAGED'           // Producto dañado
  | 'EXPIRED'           // Producto vencido
  | 'LOST'              // Producto perdido
  | 'FOUND'             // Producto encontrado
  | 'PRODUCTION'        // Producción interna
  | 'CONSUMPTION'       // Consumo en producción
  | 'RESERVATION'       // Reserva de stock
  | 'RELEASE'           // Liberación de reserva

/**
 * Registra un movimiento de inventario con tracking completo
 */
export async function recordInventoryMovement(
  movement: InventoryMovement,
  tx?: typeof prisma
): Promise<{ success: boolean; movementId?: string; error?: string }> {
  const client = tx || prisma

  try {
    // Validar datos básicos
    if (!movement.productId) {
      throw new Error('Product ID es requerido')
    }

    if (typeof movement.quantity !== 'number' || movement.quantity === 0) {
      throw new Error('Cantidad debe ser un número diferente de cero')
    }

    if (typeof movement.previousStock !== 'number' || typeof movement.newStock !== 'number') {
      throw new Error('Stock anterior y nuevo son requeridos')
    }

    // Calcular valor total si se proporciona costo unitario
    const totalValue = movement.unitCost ? Math.abs(movement.quantity) * movement.unitCost : undefined

    // Crear registro de movimiento
    const inventoryMovement = await client.materialMovement.create({
      data: {
        productId: movement.productId,
        variantId: movement.variantId,
        movementType: movement.type,
        quantity: movement.quantity,
        previousStock: movement.previousStock,
        newStock: movement.newStock,
        unitCost: movement.unitCost,
        totalValue: totalValue || movement.totalValue,
        reason: movement.reason,
        reference: movement.reference,
        orderId: movement.orderId,
        userId: movement.userId,
        supplierId: movement.supplierId,
        notes: movement.notes,
        batchNumber: movement.batchNumber,
        expirationDate: movement.expirationDate,
        locationFrom: movement.locationFrom,
        locationTo: movement.locationTo
      }
    })

    return {
      success: true,
      movementId: inventoryMovement.id
    }

  } catch (error) {
    console.error('Error recording inventory movement:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

/**
 * Registra múltiples movimientos de inventario en una transacción
 */
export async function recordBulkInventoryMovements(
  movements: InventoryMovement[]
): Promise<{ 
  success: boolean
  recordedCount: number
  movementIds: string[]
  errors: string[]
}> {
  const movementIds: string[] = []
  const errors: string[] = []

  try {
    const result = await prisma.$transaction(async (tx) => {
      for (const movement of movements) {
        try {
          const result = await recordInventoryMovement(movement, tx)
          if (result.success && result.movementId) {
            movementIds.push(result.movementId)
          } else {
            errors.push(result.error || 'Error desconocido en movimiento')
          }
        } catch (error) {
          errors.push(error instanceof Error ? error.message : 'Error desconocido')
        }
      }

      return { movementIds, errors }
    })

    return {
      success: errors.length === 0,
      recordedCount: result.movementIds.length,
      movementIds: result.movementIds,
      errors: result.errors
    }

  } catch (error) {
    return {
      success: false,
      recordedCount: 0,
      movementIds: [],
      errors: [error instanceof Error ? error.message : 'Error en transacción']
    }
  }
}

/**
 * Obtiene el historial de movimientos de un producto/variante
 */
export async function getInventoryHistory(
  productId: string,
  variantId?: string,
  options: {
    limit?: number
    offset?: number
    dateFrom?: Date
    dateTo?: Date
    movementTypes?: InventoryMovementType[]
  } = {}
): Promise<{
  movements: any[]
  total: number
  summary: {
    totalIn: number
    totalOut: number
    netMovement: number
    averageCost?: number
  }
}> {
  try {
    const {
      limit = 50,
      offset = 0,
      dateFrom,
      dateTo,
      movementTypes
    } = options

    // Construir filtros
    const where: any = { productId }
    
    if (variantId) {
      where.variantId = variantId
    }

    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) where.createdAt.gte = dateFrom
      if (dateTo) where.createdAt.lte = dateTo
    }

    if (movementTypes && movementTypes.length > 0) {
      where.movementType = { in: movementTypes }
    }

    // Obtener movimientos
    const [movements, total] = await Promise.all([
      prisma.materialMovement.findMany({
        where,
        include: {
          user: {
            select: { name: true, email: true }
          },
          order: {
            select: { orderNumber: true }
          },
          supplier: {
            select: { name: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.materialMovement.count({ where })
    ])

    // Calcular resumen
    const allMovements = await prisma.materialMovement.findMany({
      where,
      select: {
        quantity: true,
        unitCost: true,
        totalValue: true
      }
    })

    const totalIn = allMovements
      .filter(m => m.quantity > 0)
      .reduce((sum, m) => sum + m.quantity, 0)

    const totalOut = Math.abs(allMovements
      .filter(m => m.quantity < 0)
      .reduce((sum, m) => sum + m.quantity, 0))

    const netMovement = totalIn - totalOut

    // Calcular costo promedio ponderado
    const totalValue = allMovements
      .filter(m => m.totalValue && m.quantity > 0)
      .reduce((sum, m) => sum + (m.totalValue || 0), 0)

    const totalQuantityWithValue = allMovements
      .filter(m => m.totalValue && m.quantity > 0)
      .reduce((sum, m) => sum + m.quantity, 0)

    const averageCost = totalQuantityWithValue > 0 ? totalValue / totalQuantityWithValue : undefined

    return {
      movements,
      total,
      summary: {
        totalIn,
        totalOut,
        netMovement,
        averageCost
      }
    }

  } catch (error) {
    console.error('Error getting inventory history:', error)
    throw error
  }
}

/**
 * Genera un reporte de movimientos de inventario
 */
export async function generateInventoryReport(
  filters: {
    dateFrom?: Date
    dateTo?: Date
    productIds?: string[]
    movementTypes?: InventoryMovementType[]
    userId?: string
    supplierId?: string
  } = {}
): Promise<{
  summary: {
    totalMovements: number
    totalValueIn: number
    totalValueOut: number
    netValue: number
    topProducts: Array<{
      productId: string
      productName: string
      totalMovements: number
      netQuantity: number
    }>
  }
  movements: any[]
}> {
  try {
    const where: any = {}

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {}
      if (filters.dateFrom) where.createdAt.gte = filters.dateFrom
      if (filters.dateTo) where.createdAt.lte = filters.dateTo
    }

    if (filters.productIds && filters.productIds.length > 0) {
      where.productId = { in: filters.productIds }
    }

    if (filters.movementTypes && filters.movementTypes.length > 0) {
      where.movementType = { in: filters.movementTypes }
    }

    if (filters.userId) {
      where.userId = filters.userId
    }

    if (filters.supplierId) {
      where.supplierId = filters.supplierId
    }

    // Obtener todos los movimientos para el reporte
    const movements = await prisma.materialMovement.findMany({
      where,
      include: {
        user: { select: { name: true } },
        order: { select: { orderNumber: true } },
        supplier: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calcular resumen
    const totalMovements = movements.length
    const totalValueIn = movements
      .filter(m => m.quantity > 0 && m.totalValue)
      .reduce((sum, m) => sum + (m.totalValue || 0), 0)
    
    const totalValueOut = Math.abs(movements
      .filter(m => m.quantity < 0 && m.totalValue)
      .reduce((sum, m) => sum + (m.totalValue || 0), 0))
    
    const netValue = totalValueIn - totalValueOut

    // Productos con más movimientos
    const productMovements = movements.reduce((acc, movement) => {
      const key = movement.productId
      if (!acc[key]) {
        acc[key] = {
          productId: movement.productId,
          totalMovements: 0,
          netQuantity: 0
        }
      }
      acc[key].totalMovements++
      acc[key].netQuantity += movement.quantity
      return acc
    }, {} as Record<string, any>)

    const topProducts = Object.values(productMovements)
      .sort((a: any, b: any) => b.totalMovements - a.totalMovements)
      .slice(0, 10)

    return {
      summary: {
        totalMovements,
        totalValueIn,
        totalValueOut,
        netValue,
        topProducts
      },
      movements
    }

  } catch (error) {
    console.error('Error generating inventory report:', error)
    throw error
  }
}

/**
 * Obtiene alertas de inventario basadas en movimientos
 */
export async function getInventoryAlerts(): Promise<{
  lowStock: any[]
  unusualMovements: any[]
  expiringSoon: any[]
}> {
  try {
    // Productos con stock bajo
    const lowStock = await prisma.product.findMany({
      where: {
        OR: [
          { stock: { lte: prisma.product.fields.minStock } },
          { 
            variants: {
              some: {
                stock: { lte: 5 } // Threshold configurable
              }
            }
          }
        ]
      },
      select: {
        id: true,
        name: true,
        stock: true,
        minStock: true,
        variants: {
          where: { stock: { lte: 5 } },
          select: {
            id: true,
            sku: true,
            size: true,
            colorName: true,
            stock: true
          }
        }
      }
    })

    // Movimientos inusuales (grandes cantidades en poco tiempo)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    const recentMovements = await prisma.materialMovement.findMany({
      where: {
        createdAt: { gte: yesterday },
        OR: [
          { quantity: { gte: 100 } },  // Entradas grandes
          { quantity: { lte: -50 } }   // Salidas grandes
        ]
      },
      include: {
        user: { select: { name: true } }
      }
    })

    // Productos próximos a vencer (si se maneja fecha de expiración)
    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)

    const expiringSoon = await prisma.materialMovement.findMany({
      where: {
        expirationDate: {
          gte: new Date(),
          lte: nextMonth
        },
        newStock: { gt: 0 } // Solo productos que aún tienen stock
      },
      distinct: ['productId', 'batchNumber'],
      include: {
        product: {
          select: { name: true }
        }
      }
    })

    return {
      lowStock,
      unusualMovements: recentMovements,
      expiringSoon
    }

  } catch (error) {
    console.error('Error getting inventory alerts:', error)
    return {
      lowStock: [],
      unusualMovements: [],
      expiringSoon: []
    }
  }
}