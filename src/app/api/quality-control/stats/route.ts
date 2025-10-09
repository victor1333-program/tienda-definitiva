import { NextRequest, NextResponse } from "next/server"
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"

interface QualityStats {
  totalChecks: number
  passRate: number
  averageScore: number
  defectRate: number
  avgCheckTime: number
  topDefects: { type: string; count: number }[]
  inspectorPerformance: { name: string; checks: number; passRate: number }[]
  monthlyTrends: {
    month: string
    totalChecks: number
    passRate: number
    averageScore: number
  }[]
  categoryPerformance: {
    category: string
    totalChecks: number
    passRate: number
    averageScore: number
  }[]
  timeDistribution: {
    timeRange: string
    count: number
  }[]
}

// GET quality control statistics
export async function GET() {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Mock quality control statistics
    const stats: QualityStats = {
      totalChecks: 1247,
      passRate: 87.3, // Percentage of approved products
      averageScore: 91.2, // Average quality score
      defectRate: 12.7, // Percentage of products with defects
      avgCheckTime: 22, // Average time per quality check in minutes
      topDefects: [
        { type: "Sublimación defectuosa", count: 45 },
        { type: "Costuras irregulares", count: 38 },
        { type: "Colores incorrectos", count: 32 },
        { type: "Bordado descentrado", count: 28 },
        { type: "Material dañado", count: 24 },
        { type: "Medidas incorrectas", count: 19 },
        { type: "Impresión borrosa", count: 16 },
        { type: "Acabado deficiente", count: 14 },
        { type: "Etiquetas mal colocadas", count: 12 },
        { type: "Funcionalidad comprometida", count: 8 }
      ],
      inspectorPerformance: [
        {
          name: "Sofía Morales",
          checks: 342,
          passRate: 94.2
        },
        {
          name: "Ana López",
          checks: 298,
          passRate: 89.6
        },
        {
          name: "Luis Martín",
          checks: 267,
          passRate: 91.8
        },
        {
          name: "Carlos Ruiz",
          checks: 189,
          passRate: 85.7
        },
        {
          name: "Miguel Torres",
          checks: 151,
          passRate: 88.1
        }
      ],
      monthlyTrends: [
        {
          month: "Julio 2024",
          totalChecks: 98,
          passRate: 82.1,
          averageScore: 88.4
        },
        {
          month: "Agosto 2024",
          totalChecks: 124,
          passRate: 84.7,
          averageScore: 89.2
        },
        {
          month: "Septiembre 2024",
          totalChecks: 156,
          passRate: 86.5,
          averageScore: 90.1
        },
        {
          month: "Octubre 2024",
          totalChecks: 178,
          passRate: 87.9,
          averageScore: 91.0
        },
        {
          month: "Noviembre 2024",
          totalChecks: 203,
          passRate: 88.7,
          averageScore: 91.8
        },
        {
          month: "Diciembre 2024",
          totalChecks: 189,
          passRate: 89.4,
          averageScore: 92.3
        }
      ],
      categoryPerformance: [
        {
          category: "Textil",
          totalChecks: 456,
          passRate: 89.5,
          averageScore: 92.1
        },
        {
          category: "Sublimación",
          totalChecks: 298,
          passRate: 83.9,
          averageScore: 89.4
        },
        {
          category: "Bordado",
          totalChecks: 234,
          passRate: 91.2,
          averageScore: 93.7
        },
        {
          category: "Láser",
          totalChecks: 156,
          passRate: 88.5,
          averageScore: 90.8
        },
        {
          category: "Impresión",
          totalChecks: 103,
          passRate: 85.4,
          averageScore: 88.9
        }
      ],
      timeDistribution: [
        { timeRange: "< 10 min", count: 89 },
        { timeRange: "10-15 min", count: 234 },
        { timeRange: "15-20 min", count: 398 },
        { timeRange: "20-25 min", count: 287 },
        { timeRange: "25-30 min", count: 156 },
        { timeRange: "30-40 min", count: 67 },
        { timeRange: "> 40 min", count: 16 }
      ]
    }

    // Add calculated metrics
    const enhancedStats = {
      ...stats,
      // Quality trends
      qualityTrend: {
        direction: "up", // up, down, stable
        percentage: 5.2, // Improvement percentage
        period: "vs mes anterior"
      },
      
      // Efficiency metrics
      efficiency: {
        checksPerDay: Math.round(stats.totalChecks / 30), // Assuming 30 days
        checksPerInspector: Math.round(stats.totalChecks / stats.inspectorPerformance.length),
        averageResolutionTime: 1.8, // Days to resolve defects
        reworkRate: 8.3 // Percentage requiring rework
      },
      
      // Cost impact
      costImpact: {
        defectCostReduction: 15420.50, // Euro saved by catching defects
        timeOptimization: 12.4, // Percentage time optimization
        customerSatisfactionIncrease: 8.7 // Percentage increase
      },
      
      // Targets and goals
      targets: {
        passRateTarget: 90.0,
        averageScoreTarget: 95.0,
        defectRateTarget: 8.0,
        avgCheckTimeTarget: 20
      },
      
      // Performance indicators
      kpis: {
        qualityIndex: 91.2, // Overall quality index
        consistencyScore: 87.5, // How consistent quality is
        improvementRate: 5.2, // Monthly improvement rate
        inspectorUtilization: 78.4 // Inspector time utilization
      }
    }

    return NextResponse.json(enhancedStats)

  } catch (error) {
    console.error("Error fetching quality stats:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}