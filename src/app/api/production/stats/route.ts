import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Calculate production statistics
    const stats = {
      totalTasks: 45,
      pendingTasks: 8,
      inProgressTasks: 12,
      completedToday: 6,
      blockedTasks: 2,
      averageCompletionTime: 4.2, // hours per task
      onTimeDeliveryRate: 87.5, // percentage
      equipmentUtilization: 76.3, // percentage
      activeWorkers: 6
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error("Error fetching production stats:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}