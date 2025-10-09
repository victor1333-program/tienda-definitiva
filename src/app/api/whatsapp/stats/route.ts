import { NextRequest, NextResponse } from "next/server"
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"

interface WhatsAppStats {
  totalSent: number
  delivered: number
  failed: number
  responseRate: number
  dailyVolume: number
  averageDeliveryTime: number
  topAlertTypes: { type: string; count: number }[]
  hourlyDistribution: { hour: number; count: number }[]
}

// GET WhatsApp statistics
export async function GET() {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // In a real implementation, these would be calculated from actual message data
    // For demo purposes, we'll provide realistic mock statistics
    
    const currentDate = new Date()
    const lastWeek = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    // Calculate mock stats based on recent activity
    const totalSent = 147
    const delivered = 132
    const failed = 8
    const read = 98
    
    const stats: WhatsAppStats = {
      totalSent,
      delivered,
      failed,
      responseRate: Math.round((read / delivered) * 100),
      dailyVolume: Math.round(totalSent / 7), // Average per day
      averageDeliveryTime: 2.3, // seconds
      topAlertTypes: [
        { type: "stock_alert", count: 45 },
        { type: "order_update", count: 38 },
        { type: "production_alert", count: 28 },
        { type: "material_alert", count: 22 },
        { type: "quality_alert", count: 14 }
      ],
      hourlyDistribution: [
        { hour: 0, count: 2 },
        { hour: 1, count: 1 },
        { hour: 2, count: 0 },
        { hour: 3, count: 1 },
        { hour: 4, count: 0 },
        { hour: 5, count: 2 },
        { hour: 6, count: 4 },
        { hour: 7, count: 8 },
        { hour: 8, count: 15 },
        { hour: 9, count: 22 },
        { hour: 10, count: 18 },
        { hour: 11, count: 16 },
        { hour: 12, count: 12 },
        { hour: 13, count: 10 },
        { hour: 14, count: 14 },
        { hour: 15, count: 16 },
        { hour: 16, count: 18 },
        { hour: 17, count: 15 },
        { hour: 18, count: 8 },
        { hour: 19, count: 6 },
        { hour: 20, count: 4 },
        { hour: 21, count: 3 },
        { hour: 22, count: 2 },
        { hour: 23, count: 1 }
      ]
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error("Error fetching WhatsApp stats:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}