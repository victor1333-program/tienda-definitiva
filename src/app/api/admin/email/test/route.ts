import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/auth"
import { emailService } from '@/lib/email-service'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { testEmail } = await req.json()

    if (!testEmail) {
      return NextResponse.json({
        success: false,
        message: 'Email de prueba requerido'
      }, { status: 400 })
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(testEmail)) {
      return NextResponse.json({
        success: false,
        message: 'Formato de email inválido'
      }, { status: 400 })
    }

    // Intentar enviar email de prueba
    const success = await emailService.sendEmail({
      to: testEmail,
      subject: 'Email de Prueba - Lovilike',
      text: `Este es un email de prueba del sistema de notificaciones de Lovilike.

Si recibes este mensaje, significa que la configuración SMTP está funcionando correctamente.

Fecha y hora: ${new Date().toLocaleString('es-ES')}

Saludos,
El equipo de Lovilike`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
              .success-badge { background: #10b981; color: white; padding: 10px 20px; border-radius: 6px; display: inline-block; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 ¡Email de Prueba!</h1>
              </div>
              <div class="content">
                <div class="success-badge">✓ Configuración SMTP Correcta</div>
                <p>Este es un email de prueba del sistema de notificaciones de Lovilike.</p>
                <p>Si recibes este mensaje, significa que la configuración SMTP está funcionando correctamente.</p>
                <p><strong>Fecha y hora:</strong> ${new Date().toLocaleString('es-ES')}</p>
                <p style="margin-top: 30px;">Saludos,<br><strong>El equipo de Lovilike</strong></p>
              </div>
              <div class="footer">
                <p>Este es un mensaje automático de prueba. No es necesario responder.</p>
              </div>
            </div>
          </body>
        </html>
      `
    })

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Email de prueba enviado exitosamente. Revisa tu bandeja de entrada.'
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'Error al enviar email de prueba. Verifica la configuración SMTP.'
      })
    }

  } catch (error) {
    console.error('Error sending test email:', error)
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Error interno del servidor'
    }, { status: 500 })
  }
}
