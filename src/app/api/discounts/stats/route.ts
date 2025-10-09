import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { StatsService } from "@/lib/stats-service"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role === 'CUSTOMER') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const stats = await StatsService.getStats('discounts')
    return NextResponse.json(stats)

  } catch (error) {
    console.error('Error fetching discount stats:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}