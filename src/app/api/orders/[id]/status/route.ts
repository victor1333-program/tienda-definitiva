import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db as prisma } from '@/lib/db'
import { isValidStatusTransition, updateStockForOrder } from '@/lib/order-utils'
import { sendOrderStatusUpdateEmail } from '@/lib/email'
import { OrderStatus } from '@prisma/client'

interface Params {
  params: {
    id: string
  }
}

// PATCH: Actualizar estado del pedido
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role === 'CUSTOMER') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

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
      where: { id: params.id },
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
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      )
    }

    // Validar transición de estado
    if (!isValidStatusTransition(existingOrder.status as OrderStatus, status as OrderStatus)) {
      return NextResponse.json(
        { error: `No se puede cambiar de ${existingOrder.status} a ${status}` },
        { status: 400 }
      )
    }

    // Ejecutar transacción para actualizar estado y manejar stock
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Si se cancela el pedido, liberar stock
      if (status === 'CANCELLED' && existingOrder.status !== 'CANCELLED') {
        await updateStockForOrder(existingOrder.orderItems, 'release')
      }

      // Actualizar estado del pedido
      const order = await tx.order.update({
        where: { id: params.id },
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
                  color: true
                }
              }
            }
          },
          address: true
        }
      })

      return order
    })

    // Enviar email de actualización de estado (no bloquear si falla)
    try {
      await sendOrderStatusUpdateEmail(updatedOrder)
    } catch (emailError) {
      console.error('Error sending order status update email:', emailError)
      // No fallar la actualización si el email falla
    }

    return NextResponse.json({
      order: updatedOrder,
      message: `Estado actualizado a ${status}`
    })

  } catch (error) {
    console.error('Error updating order status:', error)
    return NextResponse.json(
      { error: 'Error al actualizar estado del pedido' },
      { status: 500 }
    )
  }
}

// GET: Obtener estados válidos para transición
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role === 'CUSTOMER') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Obtener pedido actual
    const order = await prisma.order.findUnique({
      where: { id: params.id },
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