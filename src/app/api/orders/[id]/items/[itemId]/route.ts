import { NextRequest, NextResponse } from 'next/server'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db as prisma } from '@/lib/db'
import { updateProductionStatus } from '@/lib/order-utils'
import { ProductionStatus } from '@prisma/client'

interface Params {
  params: {
    id: string
    itemId: string
  }
}

// GET: Obtener item específico del pedido
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role === 'CUSTOMER') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const orderItem = await prisma.orderItem.findFirst({
      where: { 
        id: params.itemId,
        orderId: params.id
      },
      include: {
        product: {
          include: {
            category: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        variant: true,
        design: true,
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            customerName: true
          }
        }
      }
    })

    if (!orderItem) {
      return NextResponse.json(
        { error: 'Item del pedido no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ orderItem })

  } catch (error) {
    console.error('Error fetching order item:', error)
    return NextResponse.json(
      { error: 'Error al obtener item del pedido' },
      { status: 500 }
    )
  }
}

// PATCH: Actualizar item específico
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role === 'CUSTOMER') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Verificar que el item existe
    const existingItem = await prisma.orderItem.findFirst({
      where: { 
        id: params.itemId,
        orderId: params.id
      },
      include: {
        product: {
          select: {
            name: true
          }
        },
        order: {
          select: {
            orderNumber: true
          }
        }
      }
    })

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Item del pedido no encontrado' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { productionStatus, productionNotes, customizationData, estimatedCompletionDate, assignedToId } = body

    const updateData: any = {}
    
    if (productionStatus) {
      updateData.productionStatus = productionStatus as ProductionStatus
    }
    if (productionNotes !== undefined) {
      updateData.productionNotes = productionNotes
    }
    if (customizationData !== undefined) {
      updateData.customizationData = customizationData
    }
    if (estimatedCompletionDate !== undefined) {
      updateData.estimatedCompletionDate = estimatedCompletionDate ? new Date(estimatedCompletionDate) : null
    }
    if (assignedToId !== undefined) {
      updateData.assignedToId = assignedToId || null
    }

    // Si se marca como completado, añadir fecha de finalización
    if (productionStatus === 'COMPLETED' && existingItem.productionStatus !== 'COMPLETED') {
      updateData.actualCompletionDate = new Date()
    }

    // Actualizar item
    const updatedItem = await prisma.orderItem.update({
      where: { id: params.itemId },
      data: updateData,
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
            color: true,
            material: true
          }
        },
        design: {
          select: {
            id: true,
            name: true,
            imageUrl: true
          }
        }
      }
    })

    // Crear evento en el timeline si cambió el estado de producción
    if (productionStatus && productionStatus !== existingItem.productionStatus) {
      const statusLabels = {
        PENDING: 'Pendiente',
        IN_PROGRESS: 'En Progreso',
        COMPLETED: 'Completado',
        ON_HOLD: 'En Espera'
      }

      const description = `Estado de producción de "${existingItem.product.name}" cambiado a ${statusLabels[productionStatus]}`
      
      await prisma.orderTimeline.create({
        data: {
          orderId: params.id,
          action: 'PRODUCTION_STATUS_CHANGED',
          description,
          metadata: {
            itemId: params.itemId,
            productName: existingItem.product.name,
            oldStatus: existingItem.productionStatus,
            newStatus: productionStatus,
            notes: productionNotes
          },
          userId: session.user.id
        }
      })
    }

    // Verificar si todos los items del pedido están completados para actualizar el pedido
    const allItems = await prisma.orderItem.findMany({
      where: { orderId: params.id },
      select: { productionStatus: true }
    })

    const allCompleted = allItems.every(item => item.productionStatus === 'COMPLETED')
    const hasInProgress = allItems.some(item => item.productionStatus === 'IN_PROGRESS')

    // Actualizar estado del pedido si es necesario
    let newOrderStatus = null
    if (allCompleted) {
      newOrderStatus = 'READY_FOR_PICKUP'
    } else if (hasInProgress) {
      newOrderStatus = 'IN_PRODUCTION'
    }

    if (newOrderStatus) {
      const currentOrder = await prisma.order.findUnique({
        where: { id: params.id },
        select: { status: true }
      })

      if (currentOrder && currentOrder.status !== newOrderStatus) {
        await prisma.order.update({
          where: { id: params.id },
          data: { status: newOrderStatus }
        })

        // Añadir evento al timeline para el cambio de estado del pedido
        const orderStatusLabels = {
          READY_FOR_PICKUP: 'Listo para Recoger',
          IN_PRODUCTION: 'En Producción'
        }

        await prisma.orderTimeline.create({
          data: {
            orderId: params.id,
            action: 'ORDER_STATUS_AUTO_UPDATED',
            description: `Estado del pedido actualizado automáticamente a ${orderStatusLabels[newOrderStatus]} basado en el progreso de producción`,
            metadata: {
              trigger: 'production_progress',
              newStatus: newOrderStatus
            },
            userId: session.user.id
          }
        })
      }
    }

    return NextResponse.json({
      orderItem: updatedItem,
      message: 'Item actualizado correctamente'
    })

  } catch (error) {
    console.error('Error updating order item:', error)
    return NextResponse.json(
      { error: 'Error al actualizar item del pedido' },
      { status: 500 }
    )
  }
}