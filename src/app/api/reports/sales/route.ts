import { NextRequest, NextResponse } from "next/server"
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "30" // días
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // Calcular fechas
    let dateFilter = {}
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      }
    } else {
      const now = new Date()
      const periodDays = parseInt(period)
      const startPeriod = new Date(now.getTime() - (periodDays * 24 * 60 * 60 * 1000))
      dateFilter = {
        createdAt: {
          gte: startPeriod,
          lte: now
        }
      }
    }

    // Métricas generales
    const totalSales = await db.order.aggregate({
      where: {
        status: { not: "CANCELLED" },
        ...dateFilter
      },
      _sum: {
        totalAmount: true
      },
      _count: {
        id: true
      }
    })

    // Ventas por día
    const salesByDay = await db.order.groupBy({
      by: ['createdAt'],
      where: {
        status: { not: "CANCELLED" },
        ...dateFilter
      },
      _sum: {
        totalAmount: true
      },
      _count: {
        id: true
      }
    })

    // Agrupar por día (simplificado)
    const dailySales = salesByDay.reduce((acc: any, sale) => {
      const date = sale.createdAt.toISOString().split('T')[0]
      if (!acc[date]) {
        acc[date] = { date, totalAmount: 0, orderCount: 0 }
      }
      acc[date].totalAmount += sale._sum.totalAmount || 0
      acc[date].orderCount += sale._count.id
      return acc
    }, {})

    // Ventas por estado
    const salesByStatus = await db.order.groupBy({
      by: ['status'],
      where: dateFilter,
      _sum: {
        totalAmount: true
      },
      _count: {
        id: true
      }
    })

    // Top productos
    const topProducts = await db.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          status: { not: "CANCELLED" },
          ...dateFilter
        }
      },
      _sum: {
        quantity: true,
        unitPrice: true
      },
      _count: {
        id: true
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: 10
    })

    // Obtener información de productos
    const productIds = topProducts.map(item => item.productId)
    const products = await db.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, images: true }
    })

    const enrichedTopProducts = topProducts.map(item => {
      const product = products.find(p => p.id === item.productId)
      return {
        ...item,
        product
      }
    })

    // Clientes más activos
    const topCustomers = await db.order.groupBy({
      by: ['userId'],
      where: {
        status: { not: "CANCELLED" },
        userId: { not: null },
        ...dateFilter
      },
      _sum: {
        totalAmount: true
      },
      _count: {
        id: true
      },
      orderBy: {
        _sum: {
          totalAmount: 'desc'
        }
      },
      take: 10
    })

    // Obtener información de clientes
    const userIds = topCustomers.map(item => item.userId).filter(Boolean) as string[]
    const customers = await db.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true }
    })

    const enrichedTopCustomers = topCustomers.map(item => {
      const customer = customers.find(c => c.id === item.userId)
      return {
        ...item,
        customer
      }
    })

    return NextResponse.json({
      summary: {
        totalRevenue: totalSales._sum.totalAmount || 0,
        totalOrders: totalSales._count.id || 0,
        averageOrderValue: totalSales._count.id > 0 
          ? (totalSales._sum.totalAmount || 0) / totalSales._count.id 
          : 0
      },
      dailySales: Object.values(dailySales),
      salesByStatus: salesByStatus.map(item => ({
        status: item.status,
        totalAmount: item._sum.totalAmount || 0,
        orderCount: item._count.id
      })),
      topProducts: enrichedTopProducts,
      topCustomers: enrichedTopCustomers,
      period: period,
      dateFilter: dateFilter
    })
  } catch (error) {
    console.error("Error al obtener reporte de ventas:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}