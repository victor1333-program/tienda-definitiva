import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'
import { ProductionStatus } from '@prisma/client'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; action: string }> }
) {
  try {
    const { id, action } = await params

    if (!id || !action) {
      return NextResponse.json(
        { error: 'ID de tarea y acción son requeridos' },
        { status: 400 }
      )
    }

    // Find the order item (production task) by ID
    const orderItem = await prisma.orderItem.findUnique({
      where: { id },
      include: {
        order: true,
        product: true
      }
    })

    if (!orderItem) {
      return NextResponse.json(
        { error: 'Tarea de producción no encontrada' },
        { status: 404 }
      )
    }

    let newStatus: ProductionStatus
    let updateData: any = {}
    let orderUpdateData: any = {}

    switch (action) {
      case 'start':
        if (orderItem.productionStatus !== 'PENDING') {
          return NextResponse.json(
            { error: 'Solo se pueden iniciar tareas pendientes' },
            { status: 400 }
          )
        }
        newStatus = 'IN_PROGRESS'
        updateData = { productionStatus: newStatus }
        orderUpdateData = { status: 'IN_PRODUCTION' }
        break

      case 'pause':
        if (orderItem.productionStatus !== 'IN_PROGRESS') {
          return NextResponse.json(
            { error: 'Solo se pueden pausar tareas en progreso' },
            { status: 400 }
          )
        }
        newStatus = 'ON_HOLD'
        updateData = { productionStatus: newStatus }
        break

      case 'resume':
        if (orderItem.productionStatus !== 'ON_HOLD') {
          return NextResponse.json(
            { error: 'Solo se pueden reanudar tareas pausadas' },
            { status: 400 }
          )
        }
        newStatus = 'IN_PROGRESS'
        updateData = { productionStatus: newStatus }
        break

      case 'complete':
        if (orderItem.productionStatus !== 'IN_PROGRESS') {
          return NextResponse.json(
            { error: 'Solo se pueden completar tareas en progreso' },
            { status: 400 }
          )
        }
        newStatus = 'COMPLETED'
        updateData = { productionStatus: newStatus }
        break

      default:
        return NextResponse.json(
          { error: `Acción '${action}' no válida` },
          { status: 400 }
        )
    }

    // Update the order item production status
    const updatedOrderItem = await prisma.orderItem.update({
      where: { id },
      data: updateData
    })

    // Update order status if starting production
    if (action === 'start' && orderItem.order.status === 'CONFIRMED') {
      await prisma.order.update({
        where: { id: orderItem.orderId },
        data: orderUpdateData
      })
    }

    // If completing a task, check if all items for the order are complete
    if (action === 'complete') {
      await checkAndUpdateOrderStatus(orderItem.orderId)
    }

    return NextResponse.json({
      success: true,
      task: updatedOrderItem,
      message: getActionMessage(action),
      newStatus
    })

  } catch (error) {
    console.error(`Error al ${action} tarea:`, error)
    return NextResponse.json(
      { error: `Error interno al ${action} la tarea` },
      { status: 500 }
    )
  }
}

function getActionMessage(action: string): string {
  switch (action) {
    case 'start': return 'Tarea iniciada correctamente'
    case 'pause': return 'Tarea pausada correctamente'
    case 'complete': return 'Tarea completada correctamente'
    case 'resume': return 'Tarea reanudada correctamente'
    default: return 'Acción ejecutada correctamente'
  }
}

// Helper function to check if all items for an order are complete
async function checkAndUpdateOrderStatus(orderId: string) {
  try {
    const allOrderItems = await prisma.orderItem.findMany({
      where: { orderId }
    })

    const completedItems = allOrderItems.filter(item => item.productionStatus === 'COMPLETED')
    
    if (completedItems.length === allOrderItems.length) {
      // All items completed, update order status
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'READY_FOR_PICKUP',
          updatedAt: new Date()
        }
      })
    }
  } catch (error) {
    console.error('Error updating order status:', error)
    // Don't throw here to avoid failing the main task update
  }
}