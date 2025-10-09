import { NextRequest, NextResponse } from "next/server"
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"

function generateWorkerPerformance(name: string, index: number) {
  const baseEfficiency = 70 + Math.random() * 25 // 70-95%
  const ordersCompleted = Math.floor(5 + Math.random() * 20) // 5-25 orders
  const averageTime = 6 + Math.random() * 4 // 6-10 hours
  const qualityScore = 7 + Math.random() * 3 // 7-10
  const defectRate = Math.random() * 3 // 0-3%
  const revenuePerOrder = 80 + Math.random() * 120 // €80-200 per order
  const totalRevenue = ordersCompleted * revenuePerOrder
  
  return {
    id: `worker-${index}`,
    name,
    ordersCompleted,
    averageTime: Number(averageTime.toFixed(1)),
    efficiency: Number(baseEfficiency.toFixed(1)),
    qualityScore: Number(qualityScore.toFixed(1)),
    defectRate: Number(defectRate.toFixed(1)),
    totalRevenue: Number(totalRevenue.toFixed(0))
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "month"

    const workers = [
      'María González',
      'Carlos Ruiz', 
      'Ana López',
      'Luis Martín',
      'Carmen Jiménez',
      'Pedro Castillo',
      'Sofía Morales',
      'Roberto Vega',
      'Elena Vargas',
      'Diego Herrera'
    ]

    const workerPerformances = workers.map((name, index) => 
      generateWorkerPerformance(name, index)
    )

    // Sort by efficiency (highest first)
    workerPerformances.sort((a, b) => b.efficiency - a.efficiency)

    // Adjust data based on period
    const periodMultipliers = {
      week: 0.25,
      month: 1,
      quarter: 3,
      year: 12
    }

    const multiplier = periodMultipliers[period as keyof typeof periodMultipliers] || 1

    const adjustedWorkers = workerPerformances.map(worker => ({
      ...worker,
      ordersCompleted: Math.floor(worker.ordersCompleted * multiplier),
      totalRevenue: Math.floor(worker.totalRevenue * multiplier)
    }))

    return NextResponse.json(adjustedWorkers)

  } catch (error) {
    console.error("Error fetching worker performance:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}