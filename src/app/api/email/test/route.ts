import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { testEmailConfig, sendAdvancedEmail } from "@/lib/email-advanced"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Test email configuration
    const isConfigValid = await testEmailConfig()

    return NextResponse.json({
      success: isConfigValid,
      message: isConfigValid ? "Configuración de email válida" : "Error en la configuración de email",
      config: {
        host: process.env.SMTP_HOST || 'No configurado',
        port: process.env.SMTP_PORT || 'No configurado',
        user: process.env.SMTP_USER ? '***' + process.env.SMTP_USER.slice(-10) : 'No configurado',
        secure: process.env.SMTP_SECURE || 'false'
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error("Error testing email config:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { testEmail } = await request.json()

    if (!testEmail) {
      return NextResponse.json(
        { error: "Se requiere el campo testEmail" },
        { status: 400 }
      )
    }

    // Send test email
    const success = await sendAdvancedEmail({
      to: testEmail,
      subject: "\ud83d\udce7 Email de Prueba - Lovilike",
      type: 'SYSTEM_NOTIFICATION',
      data: {
        message: "Este es un email de prueba del sistema de notificaciones de Lovilike.",
        timestamp: new Date().toISOString(),
        systemInfo: {
          environment: process.env.NODE_ENV || 'development',
          version: '1.0.0'
        }
      },
      priority: 'normal'
    })

    if (success) {
      return NextResponse.json({
        success: true,
        message: `Email de prueba enviado a ${testEmail}`,
        timestamp: new Date().toISOString()
      })
    } else {
      return NextResponse.json(
        { error: "Error al enviar email de prueba" },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error("Error sending test email:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}