import { NextRequest, NextResponse } from 'next/server'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener pedidos que tienen items con elementos de diseño (personalización)
    const orders = await db.order.findMany({
      where: {
        orderItems: {
          some: {
            designElements: {
              some: {} // Tiene al menos un elemento de diseño
            }
          }
        }
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
                sku: true,
                images: true
              }
            },
            variant: {
              select: {
                id: true,
                sku: true,
                size: true,
                colorName: true,
                colorHex: true
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Filtrar solo los order items que tienen elementos de diseño
    const ordersWithPersonalization = orders.map(order => ({
      ...order,
      orderItems: order.orderItems.filter(item => item.designElements.length > 0)
    })).filter(order => order.orderItems.length > 0)

    return NextResponse.json({
      success: true,
      orders: ordersWithPersonalization,
      total: ordersWithPersonalization.length
    })

  } catch (error) {
    console.error('Error fetching personalization orders:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}