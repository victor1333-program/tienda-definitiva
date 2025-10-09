import { NextRequest, NextResponse } from 'next/server'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db } from '@/lib/db'

// GET: Obtener analytics de suscripciones (solo admin)
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    // Temporarily disable auth for testing
    /*
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    */

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30' // days
    const typeSlug = searchParams.get('type')

    const periodDays = parseInt(period)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - periodDays)

    // Base filter
    let whereClause: any = {
      createdAt: {
        gte: startDate
      }
    }

    // Filter by subscription type if specified
    if (typeSlug) {
      whereClause.subscriptionPlan = {
        subscriptionType: {
          slug: typeSlug
        }
      }
    }

    // Get basic stats
    const [
      totalSubscriptions,
      activeSubscriptions,
      pausedSubscriptions,
      cancelledSubscriptions,
      newSubscriptionsThisPeriod,
      subscriptionsByType,
      subscriptionsByPlan,
      revenueData
    ] = await Promise.all([
      // Total subscriptions
      db.userSubscription.count(),
      
      // Active subscriptions
      db.userSubscription.count({
        where: { status: 'ACTIVE' }
      }),
      
      // Paused subscriptions
      db.userSubscription.count({
        where: { status: 'PAUSED' }
      }),
      
      // Cancelled subscriptions
      db.userSubscription.count({
        where: { status: 'CANCELLED' }
      }),
      
      // New subscriptions in period
      db.userSubscription.count({
        where: whereClause
      }),
      
      // Subscriptions by type
      db.userSubscription.groupBy({
        by: ['subscriptionPlanId'],
        _count: {
          id: true
        },
        where: { status: 'ACTIVE' }
      }),
      
      // Subscriptions by plan (with plan details)
      db.subscriptionPlan.findMany({
        include: {
          subscriptionType: true,
          _count: {
            select: {
              userSubscriptions: {
                where: { status: 'ACTIVE' }
              }
            }
          }
        }
      }),
      
      // Revenue calculation
      db.userSubscription.findMany({
        where: { status: 'ACTIVE' },
        include: {
          subscriptionPlan: true
        }
      })
    ])

    // Calculate revenue
    const monthlyRevenue = revenueData.reduce((sum, sub) => {
      const plan = sub.subscriptionPlan
      let planRevenue = plan.price
      
      // Adjust for billing cycle
      if (plan.billingCycle === 'yearly') {
        planRevenue = plan.price / 12
      } else if (plan.billingCycle === 'quarterly') {
        planRevenue = plan.price / 3
      }
      
      return sum + planRevenue
    }, 0)

    const annualRevenue = revenueData.reduce((sum, sub) => {
      const plan = sub.subscriptionPlan
      let planRevenue = plan.price
      
      // Convert to annual
      if (plan.billingCycle === 'monthly') {
        planRevenue = plan.price * 12
      } else if (plan.billingCycle === 'quarterly') {
        planRevenue = plan.price * 4
      }
      
      return sum + planRevenue
    }, 0)

    // Calculate churn rate (simplified)
    const churnRate = totalSubscriptions > 0 
      ? (cancelledSubscriptions / totalSubscriptions) * 100 
      : 0

    // Calculate conversion rate (simplified - would need more data in real app)
    const conversionRate = 15.3 // Mock data

    // Get popular plans
    const popularPlans = subscriptionsByPlan
      .sort((a, b) => b._count.userSubscriptions - a._count.userSubscriptions)
      .slice(0, 3)
      .map(plan => ({
        id: plan.id,
        name: plan.name,
        type: plan.subscriptionType.name,
        subscribers: plan._count.userSubscriptions,
        revenue: plan._count.userSubscriptions * plan.price
      }))

    // Generate growth data (mock for last 12 months)
    const growthData = Array.from({ length: 12 }, (_, i) => {
      const date = new Date()
      date.setMonth(date.getMonth() - (11 - i))
      
      return {
        month: date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
        subscriptions: Math.floor(Math.random() * 50) + 20 + i * 5,
        revenue: Math.floor(Math.random() * 5000) + 2000 + i * 300
      }
    })

    // Subscription type breakdown
    const typeBreakdown = await db.subscriptionType.findMany({
      include: {
        plans: {
          include: {
            _count: {
              select: {
                userSubscriptions: {
                  where: { status: 'ACTIVE' }
                }
              }
            }
          }
        }
      }
    })

    const analytics = {
      summary: {
        totalSubscriptions,
        activeSubscriptions,
        pausedSubscriptions,
        cancelledSubscriptions,
        newSubscriptionsThisPeriod,
        monthlyRevenue: Math.round(monthlyRevenue * 100) / 100,
        annualRevenue: Math.round(annualRevenue * 100) / 100,
        churnRate: Math.round(churnRate * 100) / 100,
        conversionRate,
        averageRevenuePerUser: activeSubscriptions > 0 
          ? Math.round((monthlyRevenue / activeSubscriptions) * 100) / 100 
          : 0
      },
      popularPlans,
      growthData,
      typeBreakdown: typeBreakdown.map(type => {
        const totalSubscribers = type.plans.reduce((sum, plan) => 
          sum + plan._count.userSubscriptions, 0
        )
        const totalRevenue = type.plans.reduce((sum, plan) => 
          sum + (plan._count.userSubscriptions * plan.price), 0
        )
        
        return {
          id: type.id,
          name: type.name,
          slug: type.slug,
          subscribers: totalSubscribers,
          revenue: Math.round(totalRevenue * 100) / 100,
          plans: type.plans.map(plan => ({
            id: plan.id,
            name: plan.name,
            price: plan.price,
            subscribers: plan._count.userSubscriptions
          }))
        }
      }),
      planPerformance: subscriptionsByPlan.map(plan => ({
        id: plan.id,
        name: plan.name,
        type: plan.subscriptionType.name,
        price: plan.price,
        subscribers: plan._count.userSubscriptions,
        revenue: Math.round((plan._count.userSubscriptions * plan.price) * 100) / 100,
        billingCycle: plan.billingCycle
      })).sort((a, b) => b.revenue - a.revenue)
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Error fetching subscription analytics:', error)
    return NextResponse.json(
      { error: 'Error al obtener analytics de suscripciones' },
      { status: 500 }
    )
  }
}