import { NextRequest, NextResponse } from "next/server"
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { sendAdvancedEmail, EmailType } from "@/lib/email-advanced"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const {
      to,
      subject,
      type,
      data,
      priority = 'normal',
      attachments = []
    } = await request.json()

    // Validate required fields
    if (!to || !subject || !type || !data) {
      return NextResponse.json(
        { error: "Faltan campos requeridos: to, subject, type, data" },
        { status: 400 }
      )
    }

    // Validate email type
    const validTypes: EmailType[] = [
      'ORDER_CONFIRMATION',
      'ORDER_STATUS_UPDATE',
      'PRODUCTION_ALERT',
      'STOCK_ALERT',
      'PAYMENT_CONFIRMATION',
      'SHIPPING_NOTIFICATION',
      'QUALITY_ISSUE',
      'CUSTOMER_NOTIFICATION',
      'ADMIN_ALERT',
      'SYSTEM_NOTIFICATION',
      'WELCOME',
      'PASSWORD_RESET'
    ]

    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Tipo de email no válido. Tipos válidos: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Send email
    const success = await sendAdvancedEmail({
      to,
      subject,
      type,
      data,
      priority,
      attachments
    })

    if (success) {
      return NextResponse.json({
        success: true,
        message: "Email enviado correctamente",
        timestamp: new Date().toISOString()
      })
    } else {
      return NextResponse.json(
        { error: "Error al enviar el email" },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error("Error in email send API:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}