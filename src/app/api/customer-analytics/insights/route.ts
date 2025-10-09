import { NextRequest, NextResponse } from "next/server"
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"

interface CustomerInsight {
  id: string
  type: 'opportunity' | 'risk' | 'trend' | 'recommendation'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  actionRequired: boolean
  priority: number
  data?: any
}

// GET customer insights
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "month"

    // AI-powered insights that would be generated from customer data analysis
    const insights: CustomerInsight[] = [
      {
        id: "churn-risk-increase",
        type: "risk",
        title: "Incremento en Riesgo de Abandono",
        description: "Se ha detectado un aumento del 23% en clientes con riesgo de abandono en el segmento 'En Riesgo'. Recomendamos implementar campañas de retención personalizadas inmediatamente.",
        impact: "high",
        actionRequired: true,
        priority: 1,
        data: {
          affectedCustomers: 134,
          riskIncrease: 23,
          potentialRevenueLoss: 21680
        }
      },
      {
        id: "high-value-opportunity",
        type: "opportunity",
        title: "Oportunidad con Clientes de Alto Valor",
        description: "Los clientes 'Campeones' han incrementado su frecuencia de compra en un 18%. Es el momento ideal para lanzar productos premium o programas VIP.",
        impact: "high",
        actionRequired: false,
        priority: 2,
        data: {
          segmentGrowth: 18,
          revenueOpportunity: 45200,
          recommendedActions: ["Programa VIP", "Productos Premium", "Early Access"]
        }
      },
      {
        id: "seasonal-trend",
        type: "trend",
        title: "Patrón Estacional Detectado",
        description: "Los datos muestran un incremento del 34% en pedidos de productos personalizados durante este período. Preparar inventario y capacidad de producción.",
        impact: "medium",
        actionRequired: true,
        priority: 3,
        data: {
          trendIncrease: 34,
          productCategories: ["Camisetas", "Tazas", "Accesorios"],
          durationWeeks: 6
        }
      },
      {
        id: "new-customer-conversion",
        type: "recommendation",
        title: "Mejorar Conversión de Nuevos Clientes",
        description: "Solo el 34% de los nuevos clientes realizan una segunda compra. Implementar secuencia de emails de bienvenida y descuentos para segunda compra.",
        impact: "medium",
        actionRequired: true,
        priority: 4,
        data: {
          currentConversionRate: 34,
          targetConversionRate: 55,
          potentialRevenue: 12800
        }
      },
      {
        id: "geographic-expansion",
        type: "opportunity",
        title: "Expansión Geográfica",
        description: "Valencia y Sevilla muestran alta demanda pero baja penetración. Oportunidad para campañas de marketing localizadas.",
        impact: "medium",
        actionRequired: false,
        priority: 5,
        data: {
          cities: ["Valencia", "Sevilla"],
          demandIncrease: 67,
          marketPenetration: 12
        }
      },
      {
        id: "product-recommendation-engine",
        type: "recommendation",
        title: "Motor de Recomendaciones",
        description: "Implementar sistema de recomendaciones personalizadas podría incrementar el valor promedio del pedido en un 15-25%.",
        impact: "high",
        actionRequired: false,
        priority: 6,
        data: {
          expectedAOVIncrease: 20,
          implementationCost: 8500,
          roi: 340
        }
      },
      {
        id: "mobile-optimization",
        type: "trend",
        title: "Crecimiento de Compras Móviles",
        description: "Las compras desde dispositivos móviles han crecido un 45% pero tienen menor tasa de conversión. Optimizar experiencia móvil.",
        impact: "medium",
        actionRequired: true,
        priority: 7,
        data: {
          mobileTrafficGrowth: 45,
          mobileConversionRate: 2.3,
          desktopConversionRate: 4.1
        }
      },
      {
        id: "customer-support-impact",
        type: "trend",
        title: "Impacto del Soporte al Cliente",
        description: "Clientes que interactúan con soporte tienen 40% mayor retención. Proactivizar el contacto con clientes en riesgo.",
        impact: "low",
        actionRequired: false,
        priority: 8,
        data: {
          retentionIncrease: 40,
          supportInteractionRate: 23,
          satisfactionScore: 4.7
        }
      }
    ]

    // Filter and adjust insights based on period
    const periodInsights = insights.filter(insight => {
      // Some insights are more relevant for different periods
      if (period === 'week' && insight.type === 'trend') return false
      if (period === 'year' && insight.id === 'seasonal-trend') return false
      return true
    })

    // Sort by priority
    periodInsights.sort((a, b) => a.priority - b.priority)

    return NextResponse.json(periodInsights)

  } catch (error) {
    console.error("Error fetching customer insights:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}