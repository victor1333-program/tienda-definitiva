import { NextRequest, NextResponse } from "next/server"
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "month"

    // Calculate metrics based on period
    const baseMetrics = {
      week: {
        totalOrders: 25,
        completedOrders: 22,
        averageProductionTime: 7.2,
        onTimeDelivery: 88.0,
        defectRate: 2.1,
        efficiency: 87.5,
        costPerUnit: 34.50,
        totalRevenue: 15420,
        profitMargin: 32.8,
        resourceUtilization: 78.5
      },
      month: {
        totalOrders: 120,
        completedOrders: 108,
        averageProductionTime: 7.8,
        onTimeDelivery: 90.0,
        defectRate: 1.8,
        efficiency: 89.2,
        costPerUnit: 32.75,
        totalRevenue: 67850,
        profitMargin: 35.2,
        resourceUtilization: 82.3
      },
      quarter: {
        totalOrders: 350,
        completedOrders: 315,
        averageProductionTime: 8.1,
        onTimeDelivery: 87.5,
        defectRate: 2.3,
        efficiency: 86.8,
        costPerUnit: 35.20,
        totalRevenue: 189750,
        profitMargin: 33.8,
        resourceUtilization: 79.8
      },
      year: {
        totalOrders: 1420,
        completedOrders: 1278,
        averageProductionTime: 8.4,
        onTimeDelivery: 85.2,
        defectRate: 2.7,
        efficiency: 84.5,
        costPerUnit: 36.80,
        totalRevenue: 758900,
        profitMargin: 31.5,
        resourceUtilization: 77.2
      }
    }

    const metrics = baseMetrics[period as keyof typeof baseMetrics] || baseMetrics.month

    return NextResponse.json(metrics)

  } catch (error) {
    console.error("Error fetching production metrics:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}