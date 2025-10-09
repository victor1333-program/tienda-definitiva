import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withRateLimit, rateLimitConfigs } from '@/lib/rate-limit'
import { apiSecurityHeaders } from '@/lib/security-headers'

async function dashboardStatsHandler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30d' // 7d, 30d, 90d, 1y

    // Calcular fechas según el período
    const now = new Date()
    let startDate: Date

    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default: // 30d
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    const previousStartDate = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()))

    // Consultas paralelas para mejorar rendimiento
    const [
      // Estadísticas actuales
      totalProducts,
      totalOrders,
      totalCustomers,
      totalRevenue,
      pendingOrders,
      lowStockProducts,
      
      // Estadísticas del período anterior para comparación
      previousOrders,
      previousRevenue,
      previousCustomers,

      // Datos de ayer
      yesterdayRevenue,
      yesterdayOrders,

      // Órdenes por estado
      ordersByStatus,

      // Top productos
      topProducts,

      // Productos más vendidos
      topSellingProducts
    ] = await Promise.all([
      // Total de productos activos
      db.product.count({
        where: { isActive: true }
      }),

      // Total de órdenes en el período
      db.order.count({
        where: {
          createdAt: { gte: startDate }
        }
      }),

      // Total de clientes únicos en el período
      db.user.count({
        where: {
          role: 'CUSTOMER',
          createdAt: { gte: startDate }
        }
      }),

      // Revenue total en el período
      db.order.aggregate({
        where: {
          createdAt: { gte: startDate },
          status: { not: 'CANCELLED' }
        },
        _sum: { totalAmount: true }
      }),

      // Órdenes pendientes
      db.order.count({
        where: {
          status: { in: ['PENDING', 'CONFIRMED', 'IN_PRODUCTION'] }
        }
      }),

      // Productos con stock bajo (< 5)
      db.productVariant.count({
        where: {
          stock: { lt: 5 },
          product: { isActive: true }
        }
      }),

      // Órdenes del período anterior
      db.order.count({
        where: {
          createdAt: { gte: previousStartDate, lt: startDate }
        }
      }),

      // Revenue del período anterior
      db.order.aggregate({
        where: {
          createdAt: { gte: previousStartDate, lt: startDate },
          status: { not: 'CANCELLED' }
        },
        _sum: { totalAmount: true }
      }),

      // Clientes del período anterior
      db.user.count({
        where: {
          role: 'CUSTOMER',
          createdAt: { gte: previousStartDate, lt: startDate }
        }
      }),

      // Revenue de ayer
      db.order.aggregate({
        where: {
          createdAt: {
            gte: new Date(now.getTime() - 24 * 60 * 60 * 1000),
            lt: now
          },
          status: { not: 'CANCELLED' }
        },
        _sum: { totalAmount: true }
      }),

      // Órdenes de ayer
      db.order.count({
        where: {
          createdAt: {
            gte: new Date(now.getTime() - 24 * 60 * 60 * 1000),
            lt: now
          }
        }
      }),

      // Distribución por estado
      db.order.groupBy({
        by: ['status'],
        _count: { status: true },
        where: {
          createdAt: { gte: startDate }
        }
      }),

      // Productos con más stock
      db.product.findMany({
        take: 5,
        include: {
          variants: {
            select: { stock: true }
          }
        },
        where: { isActive: true },
        orderBy: { createdAt: 'desc' }
      }),

      // Productos más vendidos (aproximación basada en órdenes recientes)
      db.orderItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true },
        _count: { productId: true },
        where: {
          order: {
            createdAt: { gte: startDate },
            status: { not: 'CANCELLED' }
          }
        },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5
      })
    ])

    // Calcular cambios porcentuales
    const revenueChange = previousRevenue._sum.totalAmount 
      ? ((((totalRevenue._sum.totalAmount || 0) - (previousRevenue._sum.totalAmount || 0)) / (previousRevenue._sum.totalAmount || 1)) * 100)
      : 0

    const ordersChange = previousOrders > 0 
      ? (((totalOrders - previousOrders) / previousOrders) * 100)
      : 0

    const customersChange = previousCustomers > 0
      ? (((totalCustomers - previousCustomers) / previousCustomers) * 100)
      : 0

    // Obtener información de productos top vendidos
    const topSellingProductsInfo = await Promise.all(
      topSellingProducts.map(async (item) => {
        const product = await db.product.findUnique({
          where: { id: item.productId },
          select: { name: true, slug: true }
        })
        return {
          ...product,
          totalSold: item._sum.quantity || 0,
          orders: item._count.productId
        }
      })
    )

    // Revenue por los últimos 7 días para el gráfico
    const last7Days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000)
      
      const dayRevenue = await db.order.aggregate({
        where: {
          createdAt: { gte: date, lt: nextDate },
          status: { not: 'CANCELLED' }
        },
        _sum: { totalAmount: true }
      })

      last7Days.push({
        date: date.toISOString().split('T')[0],
        revenue: dayRevenue._sum.totalAmount || 0
      })
    }

    const stats = {
      totalProducts,
      totalOrders,
      totalCustomers,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      pendingOrders,
      lowStockProducts,
      revenueChange: Math.round(revenueChange * 10) / 10,
      ordersChange: Math.round(ordersChange * 10) / 10,
      customersChange: Math.round(customersChange * 10) / 10,
      customersLastWeek: totalCustomers - previousCustomers,
      revenueYesterday: yesterdayRevenue._sum.totalAmount || 0,
      ordersYesterday: yesterdayOrders,
      ordersByStatus: ordersByStatus.map(item => ({
        status: item.status,
        count: item._count.status
      })),
      topSellingProducts: topSellingProductsInfo,
      revenueChart: last7Days,
      period,
      lastUpdated: new Date().toISOString()
    }

    return apiSecurityHeaders(NextResponse.json(stats))

  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return apiSecurityHeaders(NextResponse.json(
      { message: 'Error al obtener estadísticas del dashboard' },
      { status: 500 }
    ))
  } finally {
    await db.$disconnect()
  }
}

export const GET = withRateLimit(rateLimitConfigs.api, dashboardStatsHandler)