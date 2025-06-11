import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

interface PaymentStats {
  totalTransactions: number
  totalVolume: number
  successRate: number
  averageProcessingTime: number
  topGateways: {
    gateway: string
    volume: number
    transactions: number
    successRate: number
    averageAmount: number
    fees: number
  }[]
  recentTransactions: {
    id: string
    amount: number
    currency: string
    gateway: string
    method: string
    status: string
    customer: string
    date: string
    processingTime: number
    fees: number
  }[]
  monthlyTrends: {
    month: string
    volume: number
    transactions: number
    fees: number
    successRate: number
    averageAmount: number
  }[]
  paymentMethods: {
    method: string
    percentage: number
    volume: number
    transactions: number
  }[]
  countryDistribution: {
    country: string
    transactions: number
    volume: number
    percentage: number
  }[]
  hourlyDistribution: {
    hour: number
    transactions: number
    volume: number
  }[]
}

// GET payment statistics
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Mock payment statistics
    const stats: PaymentStats = {
      totalTransactions: 15847,
      totalVolume: 342875.50,
      successRate: 96.8,
      averageProcessingTime: 2.3, // seconds
      
      topGateways: [
        {
          gateway: "stripe",
          volume: 198532.25,
          transactions: 8945,
          successRate: 97.8,
          averageAmount: 22.19,
          fees: 3970.65
        },
        {
          gateway: "paypal",
          volume: 89456.75,
          transactions: 3821,
          successRate: 95.2,
          averageAmount: 23.42,
          fees: 2593.84
        },
        {
          gateway: "redsys",
          volume: 45628.30,
          transactions: 2456,
          successRate: 98.1,
          averageAmount: 18.58,
          fees: 547.54
        },
        {
          gateway: "bizum",
          volume: 9258.20,
          transactions: 625,
          successRate: 99.2,
          averageAmount: 14.81,
          fees: 46.29
        }
      ],
      
      recentTransactions: [
        {
          id: "txn_1PK2345",
          amount: 47.50,
          currency: "EUR",
          gateway: "stripe",
          method: "card",
          status: "completed",
          customer: "María González",
          date: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          processingTime: 1.8,
          fees: 0.92
        },
        {
          id: "txn_PP789",
          amount: 23.90,
          currency: "EUR",
          gateway: "paypal",
          method: "paypal",
          status: "completed",
          customer: "Carlos Ruiz",
          date: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
          processingTime: 3.2,
          fees: 1.04
        },
        {
          id: "txn_BZ456",
          amount: 15.75,
          currency: "EUR",
          gateway: "bizum",
          method: "bizum",
          status: "completed",
          customer: "Ana López",
          date: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
          processingTime: 0.9,
          fees: 0.08
        },
        {
          id: "txn_RS123",
          amount: 156.80,
          currency: "EUR",
          gateway: "redsys",
          method: "card",
          status: "pending",
          customer: "Luis Martín",
          date: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
          processingTime: 0.0,
          fees: 1.88
        },
        {
          id: "txn_ST890",
          amount: 89.20,
          currency: "EUR",
          gateway: "stripe",
          method: "card",
          status: "failed",
          customer: "Carmen Jiménez",
          date: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
          processingTime: 4.1,
          fees: 0.00
        },
        {
          id: "txn_PP234",
          amount: 34.50,
          currency: "EUR",
          gateway: "paypal",
          method: "paypal",
          status: "completed",
          customer: "Miguel Torres",
          date: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          processingTime: 2.7,
          fees: 1.35
        }
      ],
      
      monthlyTrends: [
        {
          month: "Septiembre 2024",
          volume: 245670.80,
          transactions: 11234,
          fees: 4913.42,
          successRate: 95.8,
          averageAmount: 21.87
        },
        {
          month: "Octubre 2024",
          volume: 287456.30,
          transactions: 13089,
          fees: 5748.13,
          successRate: 96.2,
          averageAmount: 21.96
        },
        {
          month: "Noviembre 2024",
          volume: 321890.75,
          transactions: 14567,
          fees: 6437.82,
          successRate: 96.5,
          averageAmount: 22.09
        },
        {
          month: "Diciembre 2024",
          volume: 342875.50,
          transactions: 15847,
          fees: 6857.51,
          successRate: 96.8,
          averageAmount: 21.64
        }
      ],
      
      paymentMethods: [
        {
          method: "Tarjeta de Crédito/Débito",
          percentage: 68.5,
          volume: 234879.52,
          transactions: 10855
        },
        {
          method: "PayPal",
          percentage: 24.1,
          volume: 82632.11,
          transactions: 3821
        },
        {
          method: "Bizum",
          percentage: 3.9,
          volume: 13374.01,
          transactions: 618
        },
        {
          method: "Transferencia Bancaria",
          percentage: 2.8,
          volume: 9596.68,
          transactions: 443
        },
        {
          method: "Apple Pay",
          percentage: 0.5,
          volume: 1713.93,
          transactions: 79
        },
        {
          method: "Google Pay",
          percentage: 0.2,
          volume: 679.25,
          transactions: 31
        }
      ],
      
      countryDistribution: [
        {
          country: "España",
          transactions: 12678,
          volume: 274301.75,
          percentage: 80.0
        },
        {
          country: "Francia",
          transactions: 1585,
          volume: 34287.50,
          percentage: 10.0
        },
        {
          country: "Alemania",
          transactions: 948,
          volume: 20543.62,
          percentage: 6.0
        },
        {
          country: "Italia",
          transactions: 475,
          volume: 10287.50,
          percentage: 3.0
        },
        {
          country: "Portugal",
          transactions: 161,
          volume: 3455.13,
          percentage: 1.0
        }
      ],
      
      hourlyDistribution: [
        { hour: 0, transactions: 123, volume: 2456.78 },
        { hour: 1, transactions: 89, volume: 1789.45 },
        { hour: 2, transactions: 67, volume: 1234.67 },
        { hour: 3, transactions: 45, volume: 987.23 },
        { hour: 4, transactions: 34, volume: 678.90 },
        { hour: 5, transactions: 56, volume: 1123.45 },
        { hour: 6, transactions: 98, volume: 1967.89 },
        { hour: 7, transactions: 167, volume: 3345.67 },
        { hour: 8, transactions: 234, volume: 4689.23 },
        { hour: 9, transactions: 345, volume: 6912.45 },
        { hour: 10, transactions: 456, volume: 9134.67 },
        { hour: 11, transactions: 567, volume: 11356.89 },
        { hour: 12, transactions: 678, volume: 13579.12 },
        { hour: 13, transactions: 654, volume: 13089.34 },
        { hour: 14, transactions: 543, volume: 10867.56 },
        { hour: 15, transactions: 632, volume: 12645.78 },
        { hour: 16, transactions: 721, volume: 14423.90 },
        { hour: 17, transactions: 812, volume: 16245.12 },
        { hour: 18, transactions: 903, volume: 18067.34 },
        { hour: 19, transactions: 856, volume: 17123.56 },
        { hour: 20, transactions: 789, volume: 15789.78 },
        { hour: 21, transactions: 687, volume: 13745.90 },
        { hour: 22, transactions: 432, volume: 8645.12 },
        { hour: 23, transactions: 298, volume: 5967.34 }
      ]
    }

    // Add calculated metrics
    const enhancedStats = {
      ...stats,
      
      // Performance metrics
      performance: {
        transactionGrowth: 12.7, // percentage vs previous month
        volumeGrowth: 15.2,
        successRateImprovement: 0.3,
        averageProcessingImprovement: -0.2 // negative means faster
      },
      
      // Financial metrics
      financial: {
        totalFees: 6857.51,
        averageFeePerTransaction: 0.43,
        feePercentageOfVolume: 2.0,
        netRevenue: stats.totalVolume - 6857.51,
        projectedMonthlyVolume: stats.totalVolume * 1.08
      },
      
      // Risk metrics
      risk: {
        chargebackRate: 0.12, // percentage
        fraudRate: 0.08,
        disputeRate: 0.15,
        averageDisputeAmount: 45.67,
        riskScore: "Low" // Low, Medium, High
      },
      
      // Customer metrics
      customers: {
        uniqueCustomers: 8934,
        returningCustomerRate: 34.5,
        averageOrderValue: 21.64,
        customerLifetimeValue: 127.89
      },
      
      // Operational metrics
      operations: {
        peakHour: 18,
        peakDay: "Viernes",
        averageDailyTransactions: 528,
        systemUptime: 99.97,
        webhookSuccessRate: 98.5
      }
    }

    return NextResponse.json(enhancedStats)

  } catch (error) {
    console.error("Error fetching payment stats:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}