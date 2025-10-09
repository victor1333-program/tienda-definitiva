import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { StatsService } from "@/lib/stats-service"

export async function GET() {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const stats = await StatsService.getStats('payment-gateways')
    return NextResponse.json(stats)

  } catch (error) {
    console.error("Error fetching payment stats:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}