import { NextRequest, NextResponse } from "next/server"
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { EmailAlertSystem } from "@/lib/email-advanced"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { alertType, data } = await request.json()

    if (!alertType) {
      return NextResponse.json(
        { error: "Se requiere el campo alertType" },
        { status: 400 }
      )
    }

    const alertSystem = EmailAlertSystem.getInstance()
    const adminEmails = ['admin@lovilike.com', 'alerts@lovilike.com'] // In production, fetch from database

    let success = false
    let message = ''

    switch (alertType) {
      case 'STOCK_ALERT':
        if (!data.items || !Array.isArray(data.items)) {
          return NextResponse.json(
            { error: "Se requiere el campo items como array" },
            { status: 400 }
          )
        }
        await alertSystem.sendStockAlert(data.items, adminEmails)
        success = true
        message = `Alerta de stock enviada para ${data.items.length} productos`
        break

      case 'PRODUCTION_ALERT':
        if (!data.productionOrder || !data.alertType || !data.message) {
          return NextResponse.json(
            { error: "Se requieren los campos: productionOrder, alertType, message" },
            { status: 400 }
          )
        }
        await alertSystem.sendProductionAlert(
          data.productionOrder,
          data.alertType,
          data.message,
          adminEmails
        )
        success = true
        message = `Alerta de producción enviada para ${data.productionOrder}`
        break

      case 'SYSTEM_ALERT':
        if (!data.alertType || !data.description || !data.severity) {
          return NextResponse.json(
            { error: "Se requieren los campos: alertType, description, severity" },
            { status: 400 }
          )
        }
        await alertSystem.sendSystemAlert(
          data.alertType,
          data.description,
          data.severity,
          adminEmails
        )
        success = true
        message = `Alerta del sistema enviada: ${data.alertType}`
        break

      default:
        return NextResponse.json(
          { error: "Tipo de alerta no válido. Tipos: STOCK_ALERT, PRODUCTION_ALERT, SYSTEM_ALERT" },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success,
      message,
      alertType,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error("Error in email alerts API:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// Get alert statistics
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // In a real implementation, this would fetch from database
    const alertStats = {
      totalAlerts: 45,
      stockAlerts: 12,
      productionAlerts: 8,
      systemAlerts: 25,
      last24Hours: {
        total: 8,
        stock: 3,
        production: 2,
        system: 3
      },
      emailsSent: {
        today: 23,
        thisWeek: 156,
        thisMonth: 672
      },
      deliveryRate: 98.5,
      averageResponseTime: '2.3 minutos'
    }

    return NextResponse.json({
      success: true,
      stats: alertStats,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error("Error fetching alert stats:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}