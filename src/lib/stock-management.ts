/**
 * Sistema de gestión de stock para órdenes
 * Maneja reserva y liberación de stock por variantes
 */

import { db as prisma } from '@/lib/db'
import { recordInventoryMovement, InventoryMovementType } from './inventory-tracking'

export interface OrderItem {
  id: string
  productId: string
  variantId?: string | null
  quantity: number
  productName?: string
}

export type StockOperation = 'reserve' | 'release'

/**
 * Actualiza el stock para los items de una orden
 */
export async function updateStockForOrder(
  orderItems: OrderItem[],
  operation: StockOperation,
  tx?: typeof prisma
): Promise<{
  success: boolean
  errors: string[]
  updatedItems: Array<{
    productId: string
    variantId?: string | null
    previousStock: number
    newStock: number
    quantityChanged: number
  }>
}> {
  const client = tx || prisma
  const errors: string[] = []
  const updatedItems: Array<{
    productId: string
    variantId?: string | null
    previousStock: number
    newStock: number
    quantityChanged: number
  }> = []

  try {
    for (const item of orderItems) {
      const quantityChange = operation === 'reserve' ? -item.quantity : item.quantity

      if (item.variantId) {
        // Manejar stock por variante
        try {
          const variant = await client.productVariant.findUnique({
            where: { id: item.variantId },
            select: { stock: true, id: true }
          })

          if (!variant) {
            errors.push(`Variante ${item.variantId} no encontrada`)
            continue
          }

          const previousStock = variant.stock || 0
          const newStock = Math.max(0, previousStock + quantityChange)

          // Verificar si hay suficiente stock para reservar
          if (operation === 'reserve' && previousStock < item.quantity) {
            errors.push(
              `Stock insuficiente para variante ${item.variantId}: disponible ${previousStock}, solicitado ${item.quantity}`
            )
            continue
          }

          await client.productVariant.update({
            where: { id: item.variantId },
            data: { stock: newStock }
          })

          // Registrar movimiento de inventario
          await recordInventoryMovement({
            productId: item.productId,
            variantId: item.variantId,
            type: operation === 'reserve' ? 'RESERVATION' : 'RELEASE',
            quantity: quantityChange,
            previousStock,
            newStock,
            reason: operation === 'reserve' 
              ? 'Reserva por pedido' 
              : 'Liberación por cancelación/devolución',
            reference: `ORDER_${Date.now()}`,
            notes: `${operation === 'reserve' ? 'Reservado' : 'Liberado'} para ${item.productName || 'producto'}`
          }, client)

          updatedItems.push({
            productId: item.productId,
            variantId: item.variantId,
            previousStock,
            newStock,
            quantityChanged: quantityChange
          })

        } catch (error) {
          console.error(`Error updating variant stock ${item.variantId}:`, error)
          errors.push(`Error actualizando stock de variante ${item.variantId}`)
        }
      } else {
        // Manejar stock a nivel de producto
        try {
          const product = await client.product.findUnique({
            where: { id: item.productId },
            select: { stock: true, id: true, name: true }
          })

          if (!product) {
            errors.push(`Producto ${item.productId} no encontrado`)
            continue
          }

          const previousStock = product.stock || 0
          const newStock = Math.max(0, previousStock + quantityChange)

          // Verificar si hay suficiente stock para reservar
          if (operation === 'reserve' && previousStock < item.quantity) {
            errors.push(
              `Stock insuficiente para producto ${product.name}: disponible ${previousStock}, solicitado ${item.quantity}`
            )
            continue
          }

          await client.product.update({
            where: { id: item.productId },
            data: { stock: newStock }
          })

          // Registrar movimiento de inventario
          await recordInventoryMovement({
            productId: item.productId,
            variantId: null,
            type: operation === 'reserve' ? 'RESERVATION' : 'RELEASE',
            quantity: quantityChange,
            previousStock,
            newStock,
            reason: operation === 'reserve' 
              ? 'Reserva por pedido' 
              : 'Liberación por cancelación/devolución',
            reference: `ORDER_${Date.now()}`,
            notes: `${operation === 'reserve' ? 'Reservado' : 'Liberado'} para ${item.productName || 'producto'}`
          }, client)

          updatedItems.push({
            productId: item.productId,
            variantId: null,
            previousStock,
            newStock,
            quantityChanged: quantityChange
          })

        } catch (error) {
          console.error(`Error updating product stock ${item.productId}:`, error)
          errors.push(`Error actualizando stock de producto ${item.productId}`)
        }
      }
    }

    return {
      success: errors.length === 0,
      errors,
      updatedItems
    }

  } catch (error) {
    console.error('Error in stock management transaction:', error)
    return {
      success: false,
      errors: ['Error interno en gestión de stock'],
      updatedItems: []
    }
  }
}

/**
 * Verifica la disponibilidad de stock antes de crear una orden
 */
export async function checkStockAvailability(
  orderItems: OrderItem[]
): Promise<{
  available: boolean
  insufficientItems: Array<{
    productId: string
    variantId?: string | null
    productName?: string
    requested: number
    available: number
  }>
}> {
  const insufficientItems: Array<{
    productId: string
    variantId?: string | null
    productName?: string
    requested: number
    available: number
  }> = []

  try {
    for (const item of orderItems) {
      let availableStock = 0
      let productName = item.productName || 'Producto desconocido'

      if (item.variantId) {
        // Verificar stock por variante
        const variant = await prisma.productVariant.findUnique({
          where: { id: item.variantId },
          select: { 
            stock: true,
            product: {
              select: { name: true }
            }
          }
        })

        if (variant) {
          availableStock = variant.stock || 0
          productName = variant.product.name
        }
      } else {
        // Verificar stock por producto
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { stock: true, name: true }
        })

        if (product) {
          availableStock = product.stock || 0
          productName = product.name
        }
      }

      if (availableStock < item.quantity) {
        insufficientItems.push({
          productId: item.productId,
          variantId: item.variantId || null,
          productName,
          requested: item.quantity,
          available: availableStock
        })
      }
    }

    return {
      available: insufficientItems.length === 0,
      insufficientItems
    }

  } catch (error) {
    console.error('Error checking stock availability:', error)
    return {
      available: false,
      insufficientItems: []
    }
  }
}

/**
 * Crea alertas de stock bajo automáticamente
 */
export async function createLowStockAlerts(updatedItems: Array<{
  productId: string
  variantId?: string | null
  newStock: number
}>): Promise<void> {
  try {
    for (const item of updatedItems) {
      // Definir umbrales de stock bajo
      const lowStockThreshold = 5
      const criticalStockThreshold = 2

      if (item.newStock <= criticalStockThreshold) {
        // Stock crítico - crear alerta de alta prioridad
        await prisma.stockAlert.upsert({
          where: {
            productId_variantId: {
              productId: item.productId,
              variantId: item.variantId
            }
          },
          update: {
            currentStock: item.newStock,
            priority: 'HIGH',
            status: 'ACTIVE',
            updatedAt: new Date()
          },
          create: {
            productId: item.productId,
            variantId: item.variantId,
            currentStock: item.newStock,
            minThreshold: criticalStockThreshold,
            priority: 'HIGH',
            status: 'ACTIVE',
            message: `Stock crítico: ${item.newStock} unidades restantes`
          }
        })
      } else if (item.newStock <= lowStockThreshold) {
        // Stock bajo - crear alerta de prioridad media
        await prisma.stockAlert.upsert({
          where: {
            productId_variantId: {
              productId: item.productId,
              variantId: item.variantId
            }
          },
          update: {
            currentStock: item.newStock,
            priority: 'MEDIUM',
            status: 'ACTIVE',
            updatedAt: new Date()
          },
          create: {
            productId: item.productId,
            variantId: item.variantId,
            currentStock: item.newStock,
            minThreshold: lowStockThreshold,
            priority: 'MEDIUM',
            status: 'ACTIVE',
            message: `Stock bajo: ${item.newStock} unidades restantes`
          }
        })
      } else {
        // Stock suficiente - resolver alertas existentes
        await prisma.stockAlert.updateMany({
          where: {
            productId: item.productId,
            variantId: item.variantId,
            status: 'ACTIVE'
          },
          data: {
            status: 'RESOLVED',
            resolvedAt: new Date(),
            updatedAt: new Date()
          }
        })
      }
    }
  } catch (error) {
    console.error('Error creating low stock alerts:', error)
  }
}