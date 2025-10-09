import { NextRequest, NextResponse } from "next/server"
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"

interface LoyaltyStats {
  totalMembers: number
  activeMembers: number
  pointsIssued: number
  rewardsRedeemed: number
  averagePoints: number
  conversionRate: number
  tierDistribution: {
    tier: string
    count: number
    percentage: number
  }[]
  monthlyGrowth: {
    month: string
    newMembers: number
    pointsIssued: number
    rewardsRedeemed: number
  }[]
  topRewards: {
    rewardName: string
    timesRedeemed: number
    pointsUsed: number
  }[]
  engagement: {
    dailyActive: number
    weeklyActive: number
    monthlyActive: number
    averageSessionTime: number
  }
}

// GET loyalty program statistics
export async function GET() {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Mock loyalty program statistics
    const stats: LoyaltyStats = {
      totalMembers: 2847,
      activeMembers: 1923, // Members with activity in last 30 days
      pointsIssued: 485690,
      rewardsRedeemed: 1456,
      averagePoints: 856,
      conversionRate: 24.3, // Percentage of customers who are loyalty members
      tierDistribution: [
        {
          tier: "Bronce",
          count: 1685,
          percentage: 59.2
        },
        {
          tier: "Plata",
          count: 798,
          percentage: 28.0
        },
        {
          tier: "Oro",
          count: 298,
          percentage: 10.5
        },
        {
          tier: "Platino",
          count: 66,
          percentage: 2.3
        }
      ],
      monthlyGrowth: [
        {
          month: "Julio 2024",
          newMembers: 127,
          pointsIssued: 28450,
          rewardsRedeemed: 89
        },
        {
          month: "Agosto 2024",
          newMembers: 156,
          pointsIssued: 34230,
          rewardsRedeemed: 105
        },
        {
          month: "Septiembre 2024",
          newMembers: 189,
          pointsIssued: 42180,
          rewardsRedeemed: 134
        },
        {
          month: "Octubre 2024",
          newMembers: 203,
          pointsIssued: 48560,
          rewardsRedeemed: 156
        },
        {
          month: "Noviembre 2024",
          newMembers: 245,
          pointsIssued: 56780,
          rewardsRedeemed: 187
        },
        {
          month: "Diciembre 2024",
          newMembers: 198,
          pointsIssued: 52340,
          rewardsRedeemed: 165
        }
      ],
      topRewards: [
        {
          rewardName: "10% Descuento",
          timesRedeemed: 456,
          pointsUsed: 91200
        },
        {
          rewardName: "5% Descuento",
          timesRedeemed: 389,
          pointsUsed: 38900
        },
        {
          rewardName: "Envío Gratuito",
          timesRedeemed: 298,
          pointsUsed: 44700
        },
        {
          rewardName: "15% Descuento",
          timesRedeemed: 156,
          pointsUsed: 46800
        },
        {
          rewardName: "Taza Cerámica",
          timesRedeemed: 89,
          pointsUsed: 44500
        },
        {
          rewardName: "Envío Express",
          timesRedeemed: 67,
          pointsUsed: 16750
        },
        {
          rewardName: "Camiseta Premium",
          timesRedeemed: 34,
          pointsUsed: 27200
        },
        {
          rewardName: "Consulta de Diseño",
          timesRedeemed: 12,
          pointsUsed: 12000
        },
        {
          rewardName: "Evento VIP",
          timesRedeemed: 8,
          pointsUsed: 16000
        }
      ],
      engagement: {
        dailyActive: 267,
        weeklyActive: 892,
        monthlyActive: 1923,
        averageSessionTime: 8.5 // minutes
      }
    }

    // Add calculated fields
    const enhancedStats = {
      ...stats,
      // Calculate additional metrics
      pointsPerMember: Math.round(stats.pointsIssued / stats.totalMembers),
      rewardRedemptionRate: Number(((stats.rewardsRedeemed / stats.totalMembers) * 100).toFixed(1)),
      averageRewardValue: Math.round(stats.pointsIssued / stats.rewardsRedeemed || 0),
      engagementRate: Number(((stats.activeMembers / stats.totalMembers) * 100).toFixed(1)),
      
      // Calculate growth trends
      memberGrowthRate: {
        lastMonth: 12.4, // Percentage growth
        last3Months: 38.7,
        yearToDate: 156.3
      },
      
      // Financial impact
      estimatedRevenue: {
        fromLoyaltyMembers: 124567.80,
        averageOrderIncrease: 18.5, // Percentage increase vs non-members
        repeatPurchaseRate: 67.3
      },
      
      // Program health indicators
      healthScore: {
        overall: 87, // Out of 100
        engagement: 82,
        growth: 91,
        retention: 89,
        satisfaction: 86
      }
    }

    return NextResponse.json(enhancedStats)

  } catch (error) {
    console.error("Error fetching loyalty stats:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}