import { NextRequest, NextResponse } from 'next/server'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const session = await auth()
    
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const orderId = resolvedParams.id

    // Obtener el pedido específico con todos sus detalles de personalización
    const order = await db.order.findUnique({
      where: { id: orderId },
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
                sku: true,
                images: true
              }
            },
            variant: {
              select: {
                id: true,
                name: true
              }
            },
            designElements: {
              include: {
                printArea: {
                  include: {
                    side: {
                      select: {
                        id: true,
                        name: true,
                        image2D: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Pedido no encontrado' },
        { status: 404 }
      )
    }

    // Verificar que el pedido tenga elementos de personalización
    const hasPersonalization = order.orderItems.some(item => 
      item.designElements.length > 0
    )

    if (!hasPersonalization) {
      return NextResponse.json(
        { success: false, error: 'Este pedido no tiene elementos de personalización' },
        { status: 400 }
      )
    }

    // Filtrar solo los order items que tienen elementos de diseño
    const orderWithPersonalization = {
      ...order,
      orderItems: order.orderItems.filter(item => item.designElements.length > 0)
    }

    return NextResponse.json({
      success: true,
      order: orderWithPersonalization
    })

  } catch (error) {
    console.error('Error fetching order details:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}