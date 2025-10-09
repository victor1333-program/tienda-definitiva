import { NextRequest, NextResponse } from "next/server"
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db } from '@/lib/db';
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    // Verificar autenticación y autorización
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado - Se requiere autenticación" }, { status: 401 })
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ 
        error: "Acceso denegado - Se requieren permisos de administrador" 
      }, { status: 403 })
    }

    // Solo obtener pedidos que están en el tablero (no SHIPPED, DELIVERED, CANCELLED, REFUNDED)
    const orders = await db.order.findMany({
      where: {
        status: {
          in: ['PENDING', 'CONFIRMED', 'IN_PRODUCTION', 'READY_FOR_PICKUP']
        }
      },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true
              }
            }
          }
        }
      },
      orderBy: [
        { priority: 'desc' }, // URGENT > HIGH > MEDIUM > LOW
        { createdAt: 'asc' }   // Más antiguos primero
      ]
    })

    // Transformar datos para el frontend
    const transformedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      orderSource: order.orderSource,
      priority: order.priority,
      totalAmount: order.totalAmount,
      shippingCost: order.shippingCost,
      taxAmount: order.taxAmount,
      customerEmail: order.customerEmail,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      createdAt: order.createdAt.toISOString(),
      estimatedCompletionDate: order.estimatedCompletionDate?.toISOString(),
      productionStartedAt: order.productionStartedAt?.toISOString(),
      productionCompletedAt: order.productionCompletedAt?.toISOString(),
      customerNotes: order.customerNotes,
      adminNotes: order.adminNotes,
      boardNotes: order.boardNotes,
      orderItems: order.orderItems
    }))

    return NextResponse.json(transformedOrders)

  } catch (error) {
    console.error("Error fetching production orders:", error)
    return NextResponse.json(
      { error: "Error al obtener los pedidos del tablero" },
      { status: 500 }
    )
  } finally {
    await db.$disconnect()
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const data = await request.json()
    
    // In a real implementation, this would create a new production order
    const newOrder = {
      id: `new-${Date.now()}`,
      orderNumber: `PROD-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
      ...data,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    }

    return NextResponse.json({ success: true, order: newOrder })

  } catch (error) {
    console.error("Error creating production order:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}