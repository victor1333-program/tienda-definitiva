import { db as prisma } from '@/lib/db'
import { OrderStatus, ProductionStatus } from '@prisma/client'

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

// Función para actualizar stock cuando se crea un pedido
export async function updateStockForOrder(orderItems: any[], operation: 'reserve' | 'release') {
  const multiplier = operation === 'reserve' ? -1 : 1
  
  for (const item of orderItems) {
    if (item.variantId) {
      // Actualizar stock de variante específica
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId }
      })
      
      if (!variant) {
        throw new Error(`Variante ${item.variantId} no encontrada`)
      }
      
      const newStock = variant.stock + (item.quantity * multiplier)
      
      if (operation === 'reserve' && newStock < 0) {
        throw new Error(`Stock insuficiente para ${variant.sku}`)
      }
      
      await prisma.productVariant.update({
        where: { id: item.variantId },
        data: { stock: newStock }
      })
      
      // Crear movimiento de inventario
      await prisma.inventoryMovement.create({
        data: {
          variantId: item.variantId,
          type: operation === 'reserve' ? 'OUT' : 'IN',
          quantity: item.quantity,
          reason: operation === 'reserve' ? 'Reserva por pedido' : 'Liberación por cancelación'
        }
      })
    }
  }
}

// Función para validar disponibilidad de stock
export async function validateStockAvailability(orderItems: any[]): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = []
  
  for (const item of orderItems) {
    if (item.variantId) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId },
        include: {
          product: {
            select: { name: true }
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
      
      if (variant.stock < item.quantity) {
        errors.push(`Stock insuficiente para ${variant.product.name} (${variant.sku}). Disponible: ${variant.stock}, Solicitado: ${item.quantity}`)
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