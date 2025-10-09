import { NextRequest, NextResponse } from 'next/server'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db as prisma } from '@/lib/db'
import { updateProductionStatus } from '@/lib/order-utils'
import { ProductionStatus } from '@prisma/client'

interface Params {
  params: {
    id: string
  }
}

// GET: Obtener items del pedido
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role === 'CUSTOMER') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const orderItems = await prisma.orderItem.findMany({
      where: { orderId: params.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            images: true,
            personalizationType: true,
            materialType: true
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
            imageUrl: true,
            designData: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    // Estadísticas de producción
    const productionStats = await prisma.orderItem.groupBy({
      by: ['productionStatus'],
      where: { orderId: params.id },
      _count: { productionStatus: true }
    })

    const stats = productionStats.reduce((acc, stat) => {
      acc[stat.productionStatus] = stat._count.productionStatus
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      orderItems,
      productionStats: stats
    })

  } catch (error) {
    console.error('Error fetching order items:', error)
    return NextResponse.json(
      { error: 'Error al obtener items del pedido' },
      { status: 500 }
    )
  }
}

// PATCH: Actualizar múltiples items
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role === 'CUSTOMER') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, itemIds, productionStatus, notes } = body

    if (!action || !itemIds || !Array.isArray(itemIds)) {
      return NextResponse.json(
        { error: 'Acción e IDs de items son requeridos' },
        { status: 400 }
      )
    }

    let result

    switch (action) {
      case 'update_production_status':
        if (!productionStatus) {
          return NextResponse.json(
            { error: 'Estado de producción es requerido' },
            { status: 400 }
          )
        }

        // Actualizar estado de producción de múltiples items
        const updatePromises = itemIds.map(itemId =>
          updateProductionStatus(itemId, productionStatus as ProductionStatus, notes)
        )

        await Promise.all(updatePromises)
        result = { count: itemIds.length }
        break

      case 'add_production_notes':
        if (!notes) {
          return NextResponse.json(
            { error: 'Notas son requeridas' },
            { status: 400 }
          )
        }

        result = await prisma.orderItem.updateMany({
          where: { 
            id: { in: itemIds },
            orderId: params.id
          },
          data: { productionNotes: notes }
        })
        break

      default:
        return NextResponse.json(
          { error: 'Acción no válida' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      message: `Operación '${action}' completada en ${result.count} item(s)`,
      count: result.count
    })

  } catch (error) {
    console.error('Error in batch order item operation:', error)
    return NextResponse.json(
      { error: 'Error en operación masiva de items' },
      { status: 500 }
    )
  }
}