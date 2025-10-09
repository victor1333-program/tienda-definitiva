import { NextRequest, NextResponse } from 'next/server'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db as prisma } from '@/lib/db'
import { updateStockForOrder, createLowStockAlerts } from '@/lib/stock-management'
import { sendOrderStatusUpdateEmail } from '@/lib/order-emails'
import { OrderStatus } from '@prisma/client'

// PATCH: Actualizar estado del pedido
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    
    // DESHABILITADO TEMPORALMENTE PARA DESARROLLO
    // const session = await auth()
    // if (!session?.user || session.user.role === 'CUSTOMER') {
    //   return NextResponse.json(
    //     { error: 'No autorizado' },
    //     { status: 401 }
    //   )
    // }

    const { id } = await params
    
    const body = await request.json()
    
    const { status, notes } = body

    if (!status) {
      return NextResponse.json(
        { error: 'Estado es requerido' },
        { status: 400 }
      )
    }

    // Verificar que el pedido existe
    const existingOrder = await prisma.order.findUnique({
      where: { id: id },
      include: {
        orderItems: {
          include: {
            product: true,
            variant: true
          }
        }
      }
    })
    

    if (!existingOrder) {
      console.error('❌ Pedido no encontrado con ID:', id)
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      )
    }

    // Validar transición de estado - simplificado para desarrollo
    const validStatuses = ['PENDING', 'CONFIRMED', 'IN_PRODUCTION', 'READY_FOR_PICKUP', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']
    if (!validStatuses.includes(status)) {
      console.error('❌ Estado inválido:', status)
      return NextResponse.json(
        { error: `Estado inválido: ${status}` },
        { status: 400 }
      )
    }

    // Ejecutar transacción para actualizar estado y manejar stock
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Manejar stock cuando se cancela una orden
      if (status === 'CANCELLED' && existingOrder.status !== 'CANCELLED') {
        const stockResult = await updateStockForOrder(
          existingOrder.orderItems.map(item => ({
            id: item.id,
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            productName: item.productName
          })),
          'release',
          tx
        )

        if (!stockResult.success) {
          throw new Error(`Error liberando stock: ${stockResult.errors.join(', ')}`)
        }

        // Crear alertas de stock si es necesario (fuera de la transacción)
        createLowStockAlerts(stockResult.updatedItems).catch(err => 
          console.error('Error creating stock alerts:', err)
        )
      }

      // Actualizar estado del pedido
      const order = await tx.order.update({
        where: { id: id },
        data: {
          status,
          ...(notes && { adminNotes: notes }),
          ...(status === 'SHIPPED' && { 
            // Si no tiene número de seguimiento, generar uno básico
            trackingNumber: existingOrder.trackingNumber || `TRK-${existingOrder.orderNumber}`
          })
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true
                }
              },
              variant: {
                select: {
                  id: true,
                  sku: true,
                  size: true,
                  colorName: true,
                  colorHex: true,
                  colorDisplay: true
                }
              }
            }
          },
          address: true
        }
      })

      return order
    })


    // Enviar email de actualización de estado
    try {
      await sendOrderStatusUpdateEmail(
        {
          id: updatedOrder.id,
          orderNumber: updatedOrder.orderNumber,
          status: updatedOrder.status as OrderStatus,
          totalAmount: updatedOrder.totalAmount,
          customerEmail: updatedOrder.user?.email || '',
          customerName: updatedOrder.user?.name || 'Cliente',
          shippingAddress: updatedOrder.address ? {
            fullName: updatedOrder.address.fullName || updatedOrder.user?.name || '',
            address: updatedOrder.address.address || '',
            city: updatedOrder.address.city || '',
            postalCode: updatedOrder.address.postalCode || ''
          } : undefined,
          orderItems: updatedOrder.orderItems.map(item => ({
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice
          })),
          createdAt: updatedOrder.createdAt,
          updatedAt: updatedOrder.updatedAt
        },
        status as OrderStatus,
        existingOrder.status as OrderStatus
      )
    } catch (emailError) {
      console.error('Error sending order status update email:', emailError)
      // No fallar la actualización si el email falla
    }

    return NextResponse.json({
      order: updatedOrder,
      message: `Estado actualizado a ${status}`
    })

  } catch (error) {
    console.error('❌ Error updating order status:', error)
    console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'No stack available')
    return NextResponse.json(
      { 
        error: 'Error al actualizar estado del pedido',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

// GET: Obtener estados válidos para transición
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // DESHABILITADO TEMPORALMENTE PARA DESARROLLO
    // const session = await auth()
    // if (!session?.user || session.user.role === 'CUSTOMER') {
    //   return NextResponse.json(
    //     { error: 'No autorizado' },
    //     { status: 401 }
    //   )
    // }

    const { id } = await params
    
    // Obtener pedido actual
    const order = await prisma.order.findUnique({
      where: { id: id },
      select: { 
        id: true, 
        status: true,
        orderNumber: true
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      )
    }

    // Obtener estados válidos para transición
    const validTransitions = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['IN_PRODUCTION', 'CANCELLED'],
      IN_PRODUCTION: ['READY_FOR_PICKUP', 'SHIPPED'],
      READY_FOR_PICKUP: ['DELIVERED', 'CANCELLED'],
      SHIPPED: ['DELIVERED', 'CANCELLED'],
      DELIVERED: ['REFUNDED'],
      CANCELLED: [],
      REFUNDED: []
    }

    const currentStatus = order.status as OrderStatus
    const allowedStatuses = validTransitions[currentStatus] || []

    return NextResponse.json({
      currentStatus,
      allowedStatuses,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status
      }
    })

  } catch (error) {
    console.error('Error getting valid statuses:', error)
    return NextResponse.json(
      { error: 'Error al obtener estados válidos' },
      { status: 500 }
    )
  }
}