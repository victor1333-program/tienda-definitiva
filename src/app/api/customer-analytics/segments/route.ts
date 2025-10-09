import { NextRequest, NextResponse } from "next/server"
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"

interface CustomerSegment {
  id: string
  name: string
  description: string
  count: number
  percentage: number
  averageValue: number
  riskScore: number
  color: string
  characteristics: string[]
}

// GET customer segments
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "month"

    // In a real implementation, these would be calculated from actual customer data
    // using ML algorithms or statistical analysis
    const totalCustomers = 1247
    
    const segments: CustomerSegment[] = [
      {
        id: "champions",
        name: "Campeones",
        description: "Clientes de alto valor con alta frecuencia de compra y lealtad excepcional",
        count: 87,
        percentage: (87 / totalCustomers) * 100,
        averageValue: 342.50,
        riskScore: 15,
        color: "#10b981",
        characteristics: [
          "Compras frecuentes",
          "Alto valor promedio",
          "Recomiendan productos",
          "Responden a promociones",
          "Baja probabilidad de abandono"
        ]
      },
      {
        id: "loyal-customers",
        name: "Clientes Leales",
        description: "Clientes consistentes con buen valor y frecuencia regular de compra",
        count: 156,
        percentage: (156 / totalCustomers) * 100,
        averageValue: 198.75,
        riskScore: 25,
        color: "#3b82f6",
        characteristics: [
          "Compras regulares",
          "Valor moderado-alto",
          "Satisfacción alta",
          "Tiempo de cliente largo",
          "Sensibles al servicio"
        ]
      },
      {
        id: "potential-loyalists",
        name: "Potenciales Leales",
        description: "Clientes recientes con alto potencial de convertirse en leales",
        count: 203,
        percentage: (203 / totalCustomers) * 100,
        averageValue: 145.20,
        riskScore: 35,
        color: "#8b5cf6",
        characteristics: [
          "Clientes nuevos",
          "Buen valor inicial",
          "Engagement activo",
          "Responden a marketing",
          "Potencial de crecimiento"
        ]
      },
      {
        id: "new-customers",
        name: "Nuevos Clientes",
        description: "Clientes recién adquiridos que necesitan nutrición y seguimiento",
        count: 178,
        percentage: (178 / totalCustomers) * 100,
        averageValue: 89.30,
        riskScore: 45,
        color: "#06b6d4",
        characteristics: [
          "Primera compra reciente",
          "Explorando productos",
          "Necesitan onboarding",
          "Sensibles a experiencia",
          "Alto potencial"
        ]
      },
      {
        id: "at-risk",
        name: "En Riesgo",
        description: "Clientes que han reducido su actividad y podrían abandonar",
        count: 134,
        percentage: (134 / totalCustomers) * 100,
        averageValue: 156.40,
        riskScore: 75,
        color: "#f59e0b",
        characteristics: [
          "Frecuencia decreciente",
          "Valor histórico bueno",
          "Posible insatisfacción",
          "Necesitan atención",
          "Recuperables"
        ]
      },
      {
        id: "hibernating",
        name: "Hibernando",
        description: "Clientes inactivos con historial de compras que podrían reactivarse",
        count: 298,
        percentage: (298 / totalCustomers) * 100,
        averageValue: 67.80,
        riskScore: 85,
        color: "#64748b",
        characteristics: [
          "Inactividad prolongada",
          "Historial de compras",
          "Bajo engagement",
          "Campañas de reactivación",
          "Valor residual"
        ]
      },
      {
        id: "lost",
        name: "Perdidos",
        description: "Clientes que han abandonado definitivamente",
        count: 191,
        percentage: (191 / totalCustomers) * 100,
        averageValue: 43.20,
        riskScore: 95,
        color: "#ef4444",
        characteristics: [
          "Sin actividad reciente",
          "Bajo valor histórico",
          "No responden",
          "Posibles detractores",
          "Difícil recuperación"
        ]
      }
    ]

    // Adjust segments based on period
    const periodMultipliers = {
      week: 0.15,
      month: 1,
      quarter: 2.8,
      year: 10.5
    }

    const multiplier = periodMultipliers[period as keyof typeof periodMultipliers] || 1
    
    const adjustedSegments = segments.map(segment => ({
      ...segment,
      count: Math.floor(segment.count * multiplier),
      averageValue: segment.averageValue * (0.9 + Math.random() * 0.2) // Add some variance
    }))

    return NextResponse.json(adjustedSegments)

  } catch (error) {
    console.error("Error fetching customer segments:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}