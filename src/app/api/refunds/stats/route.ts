import { NextRequest, NextResponse } from "next/server"
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"

interface RefundStats {
  totalRefunds: number
  totalAmount: number
  pendingRefunds: number
  pendingAmount: number
  avgProcessingTime: number
  successRate: number
  topReasons: {
    reason: string
    count: number
    percentage: number
    amount: number
  }[]
  monthlyTrends: {
    month: string
    refunds: number
    amount: number
    rate: number
  }[]
  automationMetrics: {
    automatedPercentage: number
    manualReviewPercentage: number
    avgAutomationTime: number
    avgManualTime: number
  }
  performanceMetrics: {
    refundRate: number // percentage of orders that get refunded
    averageRefundAmount: number
    customerSatisfactionPost: number // post-refund satisfaction
    repeatCustomerRate: number // customers who buy again after refund
  }
  timeDistribution: {
    timeRange: string
    count: number
    percentage: number
  }[]
  statusDistribution: {
    status: string
    count: number
    percentage: number
    averageAmount: number
  }[]
  gatewayPerformance: {
    gateway: string
    refunds: number
    totalAmount: number
    avgProcessingTime: number
    successRate: number
  }[]
}

// GET refund statistics
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || '30d'

    // Mock refund statistics
    const stats: RefundStats = {
      totalRefunds: 142,
      totalAmount: 8947.65,
      pendingRefunds: 7,
      pendingAmount: 456.80,
      avgProcessingTime: 18.5, // hours
      successRate: 94.2,
      
      topReasons: [
        {
          reason: "customer_request",
          count: 67,
          percentage: 47.2,
          amount: 3421.50
        },
        {
          reason: "defective_product",
          count: 34,
          percentage: 23.9,
          amount: 2845.75
        },
        {
          reason: "shipping_issue",
          count: 23,
          percentage: 16.2,
          amount: 1567.90
        },
        {
          reason: "duplicate_order",
          count: 12,
          percentage: 8.5,
          amount: 678.25
        },
        {
          reason: "fraud",
          count: 4,
          percentage: 2.8,
          amount: 312.50
        },
        {
          reason: "other",
          count: 2,
          percentage: 1.4,
          amount: 121.75
        }
      ],
      
      monthlyTrends: [
        {
          month: "Septiembre 2024",
          refunds: 98,
          amount: 6234.50,
          rate: 5.2 // percentage increase/decrease
        },
        {
          month: "Octubre 2024",
          refunds: 112,
          amount: 7456.75,
          rate: 14.3
        },
        {
          month: "Noviembre 2024",
          refunds: 127,
          amount: 8123.40,
          rate: 13.4
        },
        {
          month: "Diciembre 2024",
          refunds: 142,
          amount: 8947.65,
          rate: 11.8
        }
      ],
      
      automationMetrics: {
        automatedPercentage: 73.2,
        manualReviewPercentage: 26.8,
        avgAutomationTime: 0.8, // hours
        avgManualTime: 4.5 // hours
      },
      
      performanceMetrics: {
        refundRate: 2.8, // 2.8% of orders get refunded
        averageRefundAmount: 63.01,
        customerSatisfactionPost: 87.5, // satisfaction after refund process
        repeatCustomerRate: 68.4 // customers who buy again after getting refund
      },
      
      timeDistribution: [
        {
          timeRange: "< 1 hora",
          count: 89,
          percentage: 62.7
        },
        {
          timeRange: "1-4 horas",
          count: 26,
          percentage: 18.3
        },
        {
          timeRange: "4-24 horas",
          count: 18,
          percentage: 12.7
        },
        {
          timeRange: "1-3 días",
          count: 7,
          percentage: 4.9
        },
        {
          timeRange: "> 3 días",
          count: 2,
          percentage: 1.4
        }
      ],
      
      statusDistribution: [
        {
          status: "completed",
          count: 98,
          percentage: 69.0,
          averageAmount: 58.45
        },
        {
          status: "approved",
          count: 18,
          percentage: 12.7,
          averageAmount: 67.20
        },
        {
          status: "processing",
          count: 12,
          percentage: 8.5,
          averageAmount: 72.80
        },
        {
          status: "pending",
          count: 7,
          percentage: 4.9,
          averageAmount: 65.26
        },
        {
          status: "rejected",
          count: 5,
          percentage: 3.5,
          averageAmount: 89.40
        },
        {
          status: "failed",
          count: 2,
          percentage: 1.4,
          averageAmount: 45.75
        }
      ],
      
      gatewayPerformance: [
        {
          gateway: "stripe",
          refunds: 78,
          totalAmount: 4923.45,
          avgProcessingTime: 0.6,
          successRate: 97.4
        },
        {
          gateway: "paypal",
          refunds: 34,
          totalAmount: 2145.80,
          avgProcessingTime: 1.2,
          successRate: 94.1
        },
        {
          gateway: "redsys",
          refunds: 23,
          totalAmount: 1456.75,
          avgProcessingTime: 2.1,
          successRate: 91.3
        },
        {
          gateway: "bizum",
          refunds: 7,
          totalAmount: 421.65,
          avgProcessingTime: 0.3,
          successRate: 100.0
        }
      ]
    }

    // Adjust stats based on timeframe
    if (timeframe === '7d') {
      stats.totalRefunds = Math.round(stats.totalRefunds * 0.23)
      stats.totalAmount = stats.totalAmount * 0.23
      stats.pendingRefunds = Math.round(stats.pendingRefunds * 0.4)
      stats.pendingAmount = stats.pendingAmount * 0.4
    } else if (timeframe === '90d') {
      stats.totalRefunds = Math.round(stats.totalRefunds * 2.8)
      stats.totalAmount = stats.totalAmount * 2.8
      stats.pendingRefunds = Math.round(stats.pendingRefunds * 1.2)
      stats.pendingAmount = stats.pendingAmount * 1.2
    } else if (timeframe === '1y') {
      stats.totalRefunds = Math.round(stats.totalRefunds * 11.5)
      stats.totalAmount = stats.totalAmount * 11.5
      stats.pendingRefunds = Math.round(stats.pendingRefunds * 0.8)
      stats.pendingAmount = stats.pendingAmount * 0.8
    }

    // Add enhanced analytics
    const enhancedStats = {
      ...stats,
      
      // Financial impact
      financialImpact: {
        totalRefunded: stats.totalAmount,
        refundedPercentageOfRevenue: 2.8,
        averageDailyRefunds: stats.totalRefunds / 30,
        projectedMonthlyRefunds: stats.totalAmount * 1.12,
        costOfRefundProcessing: stats.totalRefunds * 3.50 // estimated cost per refund
      },
      
      // Operational metrics
      operational: {
        staffHoursSpent: stats.totalRefunds * 0.75, // hours
        automationSavings: (stats.totalRefunds * stats.automationMetrics.automatedPercentage / 100) * 2.5, // hours saved
        customerServiceLoad: stats.totalRefunds * 0.4, // refunds requiring customer service
        escalationRate: 8.5 // percentage requiring supervisor approval
      },
      
      // Quality indicators
      qualityIndicators: {
        firstContactResolution: 89.2,
        customerSatisfactionWithProcess: 91.7,
        averageCustomerRating: 4.3,
        complaintRate: 2.1, // complaints about refund process
        processImprovementSuggestions: [
          "Reducir tiempo de procesamiento manual",
          "Mejorar comunicación automática con clientes",
          "Implementar más reglas de automatización"
        ]
      },
      
      // Risk analysis
      riskAnalysis: {
        fraudRefundRate: 2.8,
        chargebackRisk: "Low",
        repeatRefundCustomers: 12,
        highValueRefundAlerts: 3,
        suspiciousPatterns: [
          "3 solicitudes de reembolso por defecto en 24h",
          "1 cliente con 4 reembolsos en 30 días"
        ]
      },
      
      // Comparison metrics
      comparison: {
        vsLastMonth: {
          refundsChange: 11.8, // percentage
          amountChange: 10.2,
          processingTimeChange: -5.4 // negative means improvement
        },
        vsIndustryAverage: {
          refundRate: "Below Average", // 2.8% vs 3.2% industry
          processingTime: "Above Average", // 18.5h vs 24h industry
          automationLevel: "Above Average" // 73.2% vs 45% industry
        }
      }
    }

    return NextResponse.json(enhancedStats)

  } catch (error) {
    console.error("Error fetching refund stats:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}