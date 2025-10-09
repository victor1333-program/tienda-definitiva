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

    // Obtener estadísticas de pedidos en producción
    const [
      totalOrders,
      pendingOrders,
      inProductionOrders,
      readyForPickup,
      completedToday,
      onlineOrders,
      storeOrders,
      totalValue
    ] = await Promise.all([
      // Total de pedidos en el tablero
      db.order.count({
        where: {
          status: { in: ['PENDING', 'CONFIRMED', 'IN_PRODUCTION', 'READY_FOR_PICKUP'] }
        }
      }),
      
      // Pedidos pendientes
      db.order.count({
        where: {
          status: { in: ['PENDING', 'CONFIRMED'] }
        }
      }),
      
      // Pedidos en producción
      db.order.count({
        where: { status: 'IN_PRODUCTION' }
      }),
      
      // Pedidos listos para recoger
      db.order.count({
        where: { status: 'READY_FOR_PICKUP' }
      }),
      
      // Pedidos completados hoy
      db.order.count({
        where: {
          status: 'READY_FOR_PICKUP',
          productionCompletedAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      
      // Pedidos online
      db.order.count({
        where: {
          status: { in: ['PENDING', 'CONFIRMED', 'IN_PRODUCTION', 'READY_FOR_PICKUP'] },
          orderSource: 'ONLINE'
        }
      }),
      
      // Pedidos de tienda
      db.order.count({
        where: {
          status: { in: ['PENDING', 'CONFIRMED', 'IN_PRODUCTION', 'READY_FOR_PICKUP'] },
          orderSource: 'STORE'
        }
      }),
      
      // Valor total en producción
      db.order.aggregate({
        where: {
          status: { in: ['PENDING', 'CONFIRMED', 'IN_PRODUCTION', 'READY_FOR_PICKUP'] }
        },
        _sum: { totalAmount: true }
      })
    ])

    // Calcular tiempo promedio de producción (mock por ahora)
    const averageProductionTime = 24.5 // horas
    const onTimeDeliveryRate = 92.3 // porcentaje

    const stats = {
      totalOrders,
      pendingOrders,
      inProductionOrders,
      completedToday,
      readyForPickup,
      averageProductionTime,
      onTimeDeliveryRate,
      totalValue: totalValue._sum.totalAmount || 0,
      onlineVsStore: {
        online: onlineOrders,
        store: storeOrders
      }
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error("Error fetching production stats:", error)
    return NextResponse.json(
      { error: "Error al obtener estadísticas del tablero" },
      { status: 500 }
    )
  } finally {
    await db.$disconnect()
  }
}