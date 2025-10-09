import { NextRequest, NextResponse } from 'next/server'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db as prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const variantId = searchParams.get('variantId')
    const orderItemId = searchParams.get('orderItemId')

    if (!variantId && !orderItemId) {
      return NextResponse.json({ 
        error: 'Se requiere variantId o orderItemId' 
      }, { status: 400 })
    }

    let allocations = []

    if (orderItemId) {
      // Obtener asignaciones para un item específico
      const orderAllocations = await prisma.orderItemAllocation.findMany({
        where: { orderItemId },
        include: {
          brandStock: {
            select: {
              brand: true,
              costPrice: true,
              location: true
            }
          },
          orderItem: {
            include: {
              order: {
                select: {
                  id: true,
                  orderNumber: true,
                  status: true
                }
              }
            }
          }
        },
        orderBy: { allocatedAt: 'desc' }
      })

      if (orderAllocations.length > 0) {
        const totalQuantity = orderAllocations.reduce((sum, alloc) => sum + alloc.quantity, 0)
        const totalCost = orderAllocations.reduce((sum, alloc) => 
          sum + (alloc.quantity * alloc.brandStock.costPrice), 0)

        allocations = [{
          variantId: orderAllocations[0].orderItem.variantId,
          orderItemId,
          allocations: orderAllocations,
          totalQuantity,
          totalCost
        }]
      }

    } else if (variantId) {
      // Obtener todas las asignaciones para una variante
      const variantAllocations = await prisma.orderItemAllocation.findMany({
        where: {
          orderItem: {
            variantId
          }
        },
        include: {
          brandStock: {
            select: {
              brand: true,
              costPrice: true,
              location: true
            }
          },
          orderItem: {
            include: {
              order: {
                select: {
                  id: true,
                  orderNumber: true,
                  status: true
                }
              }
            }
          }
        },
        orderBy: { allocatedAt: 'desc' }
      })

      // Agrupar por orderItemId
      const groupedAllocations = variantAllocations.reduce((acc, allocation) => {
        const key = allocation.orderItemId
        
        if (!acc[key]) {
          acc[key] = {
            variantId,
            orderItemId: key,
            allocations: [],
            totalQuantity: 0,
            totalCost: 0
          }
        }

        acc[key].allocations.push(allocation)
        acc[key].totalQuantity += allocation.quantity
        acc[key].totalCost += allocation.quantity * allocation.brandStock.costPrice

        return acc
      }, {} as Record<string, any>)

      allocations = Object.values(groupedAllocations)
    }

    return NextResponse.json({ allocations })

  } catch (error) {
    console.error('Error al obtener asignaciones:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}