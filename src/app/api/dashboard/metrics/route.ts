import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withRateLimit, rateLimitConfigs } from '@/lib/rate-limit'
import { apiSecurityHeaders } from '@/lib/security-headers'

async function dashboardMetricsHandler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30d'

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
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    // Métricas avanzadas
    const [
      // Métricas de conversión
      conversionData,
      
      // Revenue mensual histórico
      monthlyRevenue,
      
      // Productos por categoría
      productsByCategory,
      
      // Órdenes por método de pago
      ordersByPaymentMethod,
      
      // Clientes nuevos vs recurrentes
      customerMetrics,
      
      // Métricas de stock
      stockMetrics,
      
      // Rendimiento por día de la semana
      weekdayPerformance
    ] = await Promise.all([
      // Datos para calcular conversión
      Promise.all([
        db.user.count({ where: { role: 'CUSTOMER' } }),
        db.order.count({ where: { status: { not: 'CANCELLED' } } })
      ]),

      // Revenue por mes (últimos 12 meses)
      Promise.all(
        Array.from({ length: 12 }, (_, i) => {
          const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
          const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
          
          return db.order.aggregate({
            where: {
              createdAt: { gte: monthStart, lte: monthEnd },
              status: { not: 'CANCELLED' }
            },
            _sum: { totalAmount: true },
            _count: { id: true }
          }).then(result => ({
            month: monthStart.toISOString().slice(0, 7),
            revenue: result._sum.totalAmount || 0,
            orders: result._count
          }))
        })
      ),

      // Productos por categoría
      db.productCategory.findMany({
        include: {
          products: {
            where: { product: { isActive: true } },
            include: { product: true }
          }
        }
      }),

      // Órdenes por método de pago
      db.order.groupBy({
        by: ['paymentMethod'],
        _count: { paymentMethod: true },
        _sum: { totalAmount: true },
        where: {
          createdAt: { gte: startDate },
          status: { not: 'CANCELLED' }
        }
      }),

      // Clientes nuevos vs recurrentes en el período
      Promise.all([
        db.user.count({
          where: {
            role: 'CUSTOMER',
            createdAt: { gte: startDate }
          }
        }),
        db.order.groupBy({
          by: ['customerId'],
          _count: { customerId: true },
          where: {
            createdAt: { gte: startDate },
            status: { not: 'CANCELLED' }
          },
          having: { customerId: { _count: { gt: 1 } } }
        })
      ]),

      // Métricas de inventario
      Promise.all([
        db.productVariant.aggregate({
          _sum: { stock: true },
          _avg: { stock: true },
          _count: { id: true }
        }),
        db.productVariant.count({ where: { stock: { lte: 5 } } }),
        db.productVariant.count({ where: { stock: { gte: 50 } } })
      ]),

      // Performance por día de la semana
      Promise.all(
        Array.from({ length: 7 }, (_, i) => {
          return db.order.aggregate({
            where: {
              createdAt: { gte: startDate },
              status: { not: 'CANCELLED' }
            },
            _sum: { totalAmount: true },
            _count: { id: true }
          })
        })
      )
    ])

    // Procesar datos
    const [totalCustomers, totalOrders] = conversionData
    const conversionRate = totalCustomers > 0 ? (totalOrders / totalCustomers) * 100 : 0

    // Calcular ticket promedio
    const totalRevenue = await db.order.aggregate({
      where: {
        createdAt: { gte: startDate },
        status: { not: 'CANCELLED' }
      },
      _sum: { totalAmount: true },
      _count: { id: true }
    })

    const averageOrderValue = totalRevenue._count > 0 
      ? (totalRevenue._sum.totalAmount || 0) / totalRevenue._count 
      : 0

    // Procesar categorías
    const categoryData = productsByCategory.map(category => ({
      name: category.name,
      productCount: category.products.length,
      slug: category.slug
    }))

    // Procesar clientes nuevos vs recurrentes
    const [newCustomers, returningCustomersData] = customerMetrics
    const returningCustomers = returningCustomersData.length

    // Procesar métricas de stock
    const [stockAgg, lowStock, highStock] = stockMetrics
    const totalStock = stockAgg._sum.stock || 0
    const averageStock = stockAgg._avg.stock || 0
    const totalVariants = stockAgg._count

    // Calcular métricas de crecimiento
    const previousPeriodStart = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()))
    
    const previousRevenue = await db.order.aggregate({
      where: {
        createdAt: { gte: previousPeriodStart, lt: startDate },
        status: { not: 'CANCELLED' }
      },
      _sum: { totalAmount: true }
    })

    const revenueGrowth = previousRevenue._sum.totalAmount 
      ? (((totalRevenue._sum.totalAmount || 0) - (previousRevenue._sum.totalAmount || 0)) / (previousRevenue._sum.totalAmount || 1)) * 100
      : 0

    const metrics = {
      period,
      businessMetrics: {
        conversionRate: Math.round(conversionRate * 100) / 100,
        averageOrderValue: Math.round(averageOrderValue * 100) / 100,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        totalOrders: totalRevenue._count,
        revenueGrowth: Math.round(revenueGrowth * 100) / 100
      },
      customerMetrics: {
        totalCustomers,
        newCustomers,
        returningCustomers,
        customerRetentionRate: totalCustomers > 0 ? Math.round((returningCustomers / totalCustomers) * 10000) / 100 : 0
      },
      inventoryMetrics: {
        totalStock,
        averageStock: Math.round(averageStock * 100) / 100,
        totalVariants,
        lowStockProducts: lowStock,
        highStockProducts: highStock,
        stockTurnover: 'N/A' // Requiere histórico de ventas
      },
      categoryDistribution: categoryData,
      paymentMethods: ordersByPaymentMethod.map(method => ({
        method: method.paymentMethod,
        count: method._count.paymentMethod,
        revenue: method._sum.totalAmount || 0
      })),
      monthlyTrends: monthlyRevenue.reverse(), // Más reciente primero
      lastUpdated: new Date().toISOString()
    }

    return apiSecurityHeaders(NextResponse.json(metrics))

  } catch (error) {
    console.error('Error fetching dashboard metrics:', error)
    return apiSecurityHeaders(NextResponse.json(
      { message: 'Error al obtener métricas del dashboard' },
      { status: 500 }
    ))
  } finally {
    await db.$disconnect()
  }
}

export const GET = withRateLimit(rateLimitConfigs.api, dashboardMetricsHandler)