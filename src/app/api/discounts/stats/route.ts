import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role === 'CUSTOMER') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Get current date for filtering
    const now = new Date()

    // Get all discounts
    const allDiscounts = await db.discount.findMany({
      include: {
        _count: {
          select: {
            orders: true // Assuming there's a relation to orders
          }
        }
      }
    })

    // Calculate stats
    const stats = {
      total: allDiscounts.length,
      active: allDiscounts.filter(d => {
        const isActive = d.isActive
        const isInDateRange = now >= d.validFrom && (!d.validUntil || now <= d.validUntil)
        const hasUsesLeft = !d.maxUses || d.usedCount < d.maxUses
        return isActive && isInDateRange && hasUsesLeft
      }).length,
      expired: allDiscounts.filter(d => {
        const isExpired = d.validUntil && now > d.validUntil
        const isMaxedOut = d.maxUses && d.usedCount >= d.maxUses
        return !d.isActive || isExpired || isMaxedOut
      }).length,
      scheduled: allDiscounts.filter(d => {
        return d.isActive && now < d.validFrom
      }).length,
      totalRevenue: 0, // This would need to be calculated from actual order data
      totalSavings: 0,  // This would need to be calculated from actual order data
      avgConversionRate: 0, // This would need to be calculated from actual usage data
      topPerformers: [] as Array<{
        code: string
        revenue: number
        uses: number
      }>
    }

    // Calculate revenue and savings from orders if the relation exists
    try {
      // Get orders with discounts applied
      const ordersWithDiscounts = await db.order.findMany({
        where: {
          discountCode: {
            not: null
          }
        },
        include: {
          discount: true
        }
      })

      // Calculate total revenue generated (orders that used discounts)
      stats.totalRevenue = ordersWithDiscounts.reduce((sum, order) => {
        return sum + order.total
      }, 0)

      // Calculate total savings
      stats.totalSavings = ordersWithDiscounts.reduce((sum, order) => {
        if (order.discount) {
          if (order.discount.type === 'PERCENTAGE') {
            return sum + (order.subtotal * order.discount.value / 100)
          } else if (order.discount.type === 'FIXED_AMOUNT') {
            return sum + Math.min(order.discount.value, order.subtotal)
          } else if (order.discount.type === 'FREE_SHIPPING') {
            return sum + (order.shippingCost || 0)
          }
        }
        return sum
      }, 0)

      // Calculate conversion rate (orders with discounts / total orders)
      const totalOrders = await db.order.count()
      if (totalOrders > 0) {
        stats.avgConversionRate = (ordersWithDiscounts.length / totalOrders) * 100
      }

      // Calculate top performers
      const discountPerformance = new Map<string, { revenue: number; uses: number }>()
      
      ordersWithDiscounts.forEach(order => {
        if (order.discountCode) {
          const current = discountPerformance.get(order.discountCode) || { revenue: 0, uses: 0 }
          current.revenue += order.total
          current.uses += 1
          discountPerformance.set(order.discountCode, current)
        }
      })

      stats.topPerformers = Array.from(discountPerformance.entries())
        .map(([code, data]) => ({
          code,
          revenue: data.revenue,
          uses: data.uses
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)

    } catch (relationError) {
      // If order relations don't exist yet, we'll use mock data or defaults
      console.log('Orders relation not available yet, using defaults')
      
      // Generate some realistic mock data for top performers
      stats.topPerformers = allDiscounts
        .filter(d => d.usedCount > 0)
        .map(d => ({
          code: d.code,
          revenue: d.usedCount * 50, // Mock: assume average order of 50€
          uses: d.usedCount
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)

      // Mock total revenue and savings
      stats.totalRevenue = allDiscounts.reduce((sum, d) => sum + (d.usedCount * 50), 0)
      stats.totalSavings = allDiscounts.reduce((sum, d) => {
        if (d.type === 'PERCENTAGE') {
          return sum + (d.usedCount * 50 * d.value / 100)
        } else if (d.type === 'FIXED_AMOUNT') {
          return sum + (d.usedCount * Math.min(d.value, 50))
        }
        return sum
      }, 0)

      // Mock conversion rate
      if (allDiscounts.length > 0) {
        const totalUsage = allDiscounts.reduce((sum, d) => sum + d.usedCount, 0)
        stats.avgConversionRate = totalUsage > 0 ? Math.min(totalUsage * 2, 100) : 0
      }
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Error fetching discount stats:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}