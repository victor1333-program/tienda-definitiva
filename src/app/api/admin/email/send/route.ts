import { NextRequest, NextResponse } from 'next/server'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { emailService } from '@/lib/email-service'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== 'ADMIN' && role !== 'SUPER_ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { 
      templateType, 
      to, 
      variables, 
      customSubject, 
      customHtml, 
      customText 
    } = await req.json()

    if (!to) {
      return NextResponse.json({ error: 'Destinatario requerido' }, { status: 400 })
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(to)) {
      return NextResponse.json({ error: 'Formato de email inválido' }, { status: 400 })
    }

    let emailSent = false

    if (templateType) {
      // Enviar usando template
      const testVariables = getTestVariables(templateType, variables)
      emailSent = await emailService.sendTemplateEmail(templateType, to, testVariables)
    } else if (customSubject && customHtml) {
      // Enviar email personalizado
      emailSent = await emailService.sendEmail({
        to,
        subject: customSubject,
        html: customHtml,
        text: customText
      })
    } else {
      return NextResponse.json({ 
        error: 'Se requiere templateType o customSubject/customHtml' 
      }, { status: 400 })
    }

    if (!emailSent) {
      return NextResponse.json({ 
        success: false, 
        message: 'Error al enviar el email' 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: `Email enviado exitosamente a ${to}` 
    })

  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Error interno del servidor' 
    }, { status: 500 })
  }
}

function getTestVariables(templateType: string, customVariables?: Record<string, any>): Record<string, any> {
  const baseVariables = {
    siteUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    customerName: 'Cliente de Prueba',
    ...customVariables
  }

  switch (templateType) {
    case 'ORDER_CONFIRMATION':
      return {
        ...baseVariables,
        orderNumber: 'TEST-001',
        orderDate: new Date().toLocaleDateString('es-ES'),
        orderTotal: '€45.99',
        orderStatus: 'Confirmado',
        orderItems: `
          <div style="padding: 15px; border-bottom: 1px solid #eee;">
            <div style="display: flex; justify-content: space-between;">
              <div>
                <strong>Camiseta DTF Personalizada</strong>
                <br><small>SKU: CAM-DTF-001-M-Blanco | M | Blanco</small>
                <br><small>Cantidad: 2</small>
              </div>
              <div style="text-align: right;">
                <strong>€25.98</strong>
              </div>
            </div>
          </div>
          <div style="padding: 15px; border-bottom: 1px solid #eee;">
            <div style="display: flex; justify-content: space-between;">
              <div>
                <strong>Taza Mágica Personalizada</strong>
                <br><small>SKU: TAZ-SUB-001-325ml-Negro | 325ml | Negro → Blanco</small>
                <br><small>Cantidad: 1</small>
              </div>
              <div style="text-align: right;">
                <strong>€11.99</strong>
              </div>
            </div>
          </div>
        `,
        orderItemsText: 'Camiseta DTF Personalizada - Cantidad: 2 - €25.98\nTaza Mágica Personalizada - Cantidad: 1 - €11.99',
        shippingAddress: 'Calle Ejemplo 123, Hellín, Albacete, 02400',
        shippingMethod: 'Envío estándar (1-2 días)',
        orderId: 'test-order-123'
      }

    case 'ORDER_SHIPPED':
      return {
        ...baseVariables,
        orderNumber: 'TEST-001',
        trackingNumber: 'CP123456789ES',
        carrier: 'Correos',
        shippedDate: new Date().toLocaleDateString('es-ES'),
        estimatedDelivery: 'En 2-3 días laborables',
        trackingUrl: 'https://www.correos.es/ss/Satellite/site/pagina-localizador_envios',
        shippingAddress: 'Calle Ejemplo 123, Hellín, Albacete, 02400'
      }

    case 'WELCOME':
      return {
        ...baseVariables,
        discountExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES')
      }

    case 'PASSWORD_RESET':
      return {
        ...baseVariables,
        userName: baseVariables.customerName,
        resetLink: `${baseVariables.siteUrl}/auth/reset-password?token=test-token-123`
      }

    default:
      return baseVariables
  }
}