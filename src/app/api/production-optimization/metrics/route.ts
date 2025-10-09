import { NextRequest, NextResponse } from "next/server"
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"

interface ProductionMetrics {
  totalProcessingTime: number
  averageCycleTime: number
  throughput: number
  efficiency: number
  bottlenecks: {
    id: string
    name: string
    actualTime: number
    estimatedTime: number
    efficiency: number
    bottleneckRisk: string
    workers: number
  }[]
  waitingTime: number
  activeTime: number
  setupTime: number
  qualityTime: number
  potentialSavings: number
  trends: {
    efficiency: { direction: string; percentage: number; period: string }
    throughput: { direction: string; percentage: number; period: string }
    quality: { direction: string; percentage: number; period: string }
  }
  costAnalysis: {
    laborCostPerOrder: number
    materialCostPerOrder: number
    overheadCostPerOrder: number
    totalCostPerOrder: number
    profitMargin: number
  }
  benchmarks: {
    industryAverage: {
      processingTime: number
      efficiency: number
      throughput: number
    }
    bestPractice: {
      processingTime: number
      efficiency: number
      throughput: number
    }
  }
}

// GET production optimization metrics
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || '7d'

    // Mock production metrics based on process steps
    const metrics: ProductionMetrics = {
      totalProcessingTime: 168, // sum of all step actual times
      averageCycleTime: 185, // including waiting times
      throughput: 12, // orders per day
      efficiency: 84.3, // overall efficiency percentage
      bottlenecks: [
        {
          id: "step-002",
          name: "Diseño y Personalización",
          actualTime: 32,
          estimatedTime: 25,
          efficiency: 78.1,
          bottleneckRisk: "high",
          workers: 1
        },
        {
          id: "step-004",
          name: "Corte y Confección",
          actualTime: 35,
          estimatedTime: 30,
          efficiency: 85.7,
          bottleneckRisk: "medium",
          workers: 2
        },
        {
          id: "step-009",
          name: "Preparación Envío",
          actualTime: 7,
          estimatedTime: 5,
          efficiency: 71.4,
          bottleneckRisk: "medium",
          workers: 1
        }
      ],
      waitingTime: 17, // time waiting between processes
      activeTime: 140, // actual working time
      setupTime: 18, // machine/equipment setup
      qualityTime: 12, // quality control time
      potentialSavings: 28, // estimated time savings with optimizations
      trends: {
        efficiency: {
          direction: "up",
          percentage: 5.2,
          period: "vs mes anterior"
        },
        throughput: {
          direction: "up",
          percentage: 8.7,
          period: "vs mes anterior"
        },
        quality: {
          direction: "up",
          percentage: 3.1,
          period: "vs mes anterior"
        }
      },
      costAnalysis: {
        laborCostPerOrder: 45.60,
        materialCostPerOrder: 12.30,
        overheadCostPerOrder: 8.90,
        totalCostPerOrder: 66.80,
        profitMargin: 38.2
      },
      benchmarks: {
        industryAverage: {
          processingTime: 195,
          efficiency: 78.5,
          throughput: 10
        },
        bestPractice: {
          processingTime: 145,
          efficiency: 92.0,
          throughput: 18
        }
      }
    }

    // Adjust metrics based on timeframe
    if (timeframe === '24h') {
      metrics.throughput = Math.round(metrics.throughput * 0.8)
      metrics.efficiency = metrics.efficiency - 2.1
    } else if (timeframe === '30d') {
      metrics.throughput = Math.round(metrics.throughput * 1.1)
      metrics.efficiency = metrics.efficiency + 1.5
    } else if (timeframe === '90d') {
      metrics.throughput = Math.round(metrics.throughput * 1.25)
      metrics.efficiency = metrics.efficiency + 3.2
    }

    // Add advanced analytics
    const enhancedMetrics = {
      ...metrics,
      
      // Performance indicators
      kpis: {
        oee: metrics.efficiency * 0.95, // Overall Equipment Effectiveness
        takt: Math.round((8 * 60) / metrics.throughput), // Takt time in minutes
        leadTime: metrics.totalProcessingTime + metrics.waitingTime,
        valueStreamEfficiency: (metrics.activeTime / metrics.totalProcessingTime) * 100
      },
      
      // Capacity analysis
      capacity: {
        currentUtilization: 78.5,
        theoreticalMax: Math.round(metrics.throughput * 1.35),
        practicalMax: Math.round(metrics.throughput * 1.15),
        constraintStep: "Diseño y Personalización",
        bottleneckCapacity: 8.5 // orders per day limited by bottleneck
      },
      
      // Quality metrics
      quality: {
        firstPassYield: 87.3,
        reworkRate: 8.2,
        defectRate: 4.7,
        customerSatisfaction: 92.1,
        qualityCostPerOrder: 3.20
      },
      
      // Optimization opportunities
      opportunities: [
        {
          area: "Automatización de diseño",
          impact: "high",
          effort: "medium",
          savings: 12,
          description: "Implementar plantillas automatizadas para diseños comunes"
        },
        {
          area: "Flujo de trabajo",
          impact: "medium",
          effort: "low",
          savings: 8,
          description: "Reorganizar estaciones para reducir movimientos"
        },
        {
          area: "Capacitación",
          impact: "medium",
          effort: "medium",
          savings: 6,
          description: "Entrenamiento especializado para operadores"
        },
        {
          area: "Equipamiento",
          impact: "high",
          effort: "high",
          savings: 15,
          description: "Upgrade de máquinas bordadoras"
        }
      ],
      
      // Forecast data
      forecast: {
        nextWeek: {
          expectedThroughput: Math.round(metrics.throughput * 1.05),
          expectedEfficiency: metrics.efficiency + 1.2,
          confidence: 85
        },
        nextMonth: {
          expectedThroughput: Math.round(metrics.throughput * 1.12),
          expectedEfficiency: metrics.efficiency + 2.8,
          confidence: 75
        },
        withOptimizations: {
          expectedThroughput: Math.round(metrics.throughput * 1.28),
          expectedEfficiency: metrics.efficiency + 8.5,
          timeframe: "3 meses"
        }
      },
      
      // Resource utilization
      resources: {
        humanResources: {
          totalWorkers: 9,
          utilization: 82.4,
          skillDistribution: {
            expert: 3,
            intermediate: 4,
            beginner: 2
          },
          bottleneckWorkers: 1
        },
        equipment: {
          totalMachines: 12,
          utilization: 76.8,
          maintenanceHours: 4.5,
          downtimePercentage: 3.2
        },
        materials: {
          wastePercentage: 2.8,
          inventoryTurnover: 8.5,
          stockoutEvents: 2
        }
      }
    }

    return NextResponse.json(enhancedMetrics)

  } catch (error) {
    console.error("Error fetching production metrics:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}