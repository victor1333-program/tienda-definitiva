import { NextRequest, NextResponse } from 'next/server'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { emailService } from '@/lib/email-service'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = params

    // Mapear IDs a tipos de template
    const templateTypeMap: Record<string, string> = {
      'order_confirmation': 'ORDER_CONFIRMATION',
      'order_shipped': 'ORDER_SHIPPED',
      'welcome': 'WELCOME',
      'password_reset': 'PASSWORD_RESET'
    }

    const templateType = templateTypeMap[id]
    if (!templateType) {
      return NextResponse.json({ error: 'Template no encontrado' }, { status: 404 })
    }

    // Obtener template con contenido completo
    const templates = {
      'order_confirmation': {
        id: 'order_confirmation',
        type: 'ORDER_CONFIRMATION',
        name: 'Confirmación de Pedido',
        description: 'Email enviado automáticamente cuando se confirma un pedido',
        subject: '✅ Pedido confirmado #{orderNumber} - Lovilike',
        isActive: true,
        variables: ['orderNumber', 'orderDate', 'orderTotal', 'orderStatus', 'orderItems', 'shippingAddress', 'shippingMethod'],
        lastModified: new Date().toISOString(),
        htmlContent: `
          <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #f97316;">¡Pedido Confirmado!</h1>
              <p>Hola,</p>
              <p>Tu pedido <strong>#{{orderNumber}}</strong> ha sido confirmado y está siendo procesado.</p>
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Detalles del Pedido:</h3>
                <p><strong>Número:</strong> {{orderNumber}}</p>
                <p><strong>Fecha:</strong> {{orderDate}}</p>
                <p><strong>Total:</strong> {{orderTotal}}</p>
                <p><strong>Estado:</strong> {{orderStatus}}</p>
              </div>
              <p>Te mantendremos informado sobre el estado de tu pedido.</p>
              <p>Gracias por confiar en Lovilike Personalizados.</p>
            </body>
          </html>
        `,
        textContent: `
          ¡Pedido Confirmado!
          
          Hola,
          
          Tu pedido #{{orderNumber}} ha sido confirmado y está siendo procesado.
          
          Detalles del Pedido:
          - Número: {{orderNumber}}
          - Fecha: {{orderDate}}
          - Total: {{orderTotal}}
          - Estado: {{orderStatus}}
          
          Te mantendremos informado sobre el estado de tu pedido.
          
          Gracias por confiar en Lovilike Personalizados.
        `
      },
      'order_shipped': {
        id: 'order_shipped',
        type: 'ORDER_SHIPPED',
        name: 'Pedido Enviado',
        description: 'Email enviado cuando un pedido es despachado',
        subject: '📦 Tu pedido #{orderNumber} ha sido enviado - Lovilike',
        isActive: true,
        variables: ['orderNumber', 'trackingNumber', 'carrier', 'shippedDate', 'estimatedDelivery', 'trackingUrl'],
        lastModified: new Date().toISOString(),
        htmlContent: `
          <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #f97316;">📦 ¡Tu pedido está en camino!</h1>
              <p>Hola,</p>
              <p>Tu pedido <strong>#{{orderNumber}}</strong> ha sido enviado y está en camino.</p>
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Información de Envío:</h3>
                <p><strong>Número de seguimiento:</strong> {{trackingNumber}}</p>
                <p><strong>Transportista:</strong> {{carrier}}</p>
                <p><strong>Fecha de envío:</strong> {{shippedDate}}</p>
                <p><strong>Entrega estimada:</strong> {{estimatedDelivery}}</p>
              </div>
              <p><a href="{{trackingUrl}}" style="background: #f97316; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Rastrear Pedido</a></p>
              <p>Gracias por tu compra.</p>
            </body>
          </html>
        `,
        textContent: `
          ¡Tu pedido está en camino!
          
          Hola,
          
          Tu pedido #{{orderNumber}} ha sido enviado y está en camino.
          
          Información de Envío:
          - Número de seguimiento: {{trackingNumber}}
          - Transportista: {{carrier}}
          - Fecha de envío: {{shippedDate}}
          - Entrega estimada: {{estimatedDelivery}}
          
          Puedes rastrear tu pedido en: {{trackingUrl}}
          
          Gracias por tu compra.
        `
      },
      'welcome': {
        id: 'welcome',
        type: 'WELCOME',
        name: 'Bienvenida',
        description: 'Email de bienvenida para nuevos clientes',
        subject: '🎉 ¡Bienvenido a Lovilike Personalizados!',
        isActive: true,
        variables: ['customerName', 'siteUrl', 'discountExpiry'],
        lastModified: new Date().toISOString(),
        htmlContent: `
          <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #f97316;">🎉 ¡Bienvenido {{customerName}}!</h1>
              <p>Nos alegra tenerte en la familia Lovilike Personalizados.</p>
              <p>Aquí podrás encontrar productos únicos y personalizados para cada ocasión especial.</p>
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>¿Qué puedes hacer ahora?</h3>
                <ul>
                  <li>Explora nuestro catálogo de productos</li>
                  <li>Personaliza tus artículos favoritos</li>
                  <li>Aprovecha ofertas especiales</li>
                </ul>
              </div>
              <p><a href="{{siteUrl}}" style="background: #f97316; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Comenzar a Explorar</a></p>
              <p>¡Esperamos verte pronto!</p>
            </body>
          </html>
        `,
        textContent: `
          ¡Bienvenido {{customerName}}!
          
          Nos alegra tenerte en la familia Lovilike Personalizados.
          
          Aquí podrás encontrar productos únicos y personalizados para cada ocasión especial.
          
          ¿Qué puedes hacer ahora?
          - Explora nuestro catálogo de productos
          - Personaliza tus artículos favoritos
          - Aprovecha ofertas especiales
          
          Visita: {{siteUrl}}
          
          ¡Esperamos verte pronto!
        `
      },
      'password_reset': {
        id: 'password_reset',
        type: 'PASSWORD_RESET',
        name: 'Recuperación de Contraseña',
        description: 'Email para restablecer contraseña',
        subject: 'Restablece tu Contraseña - Lovilike',
        isActive: true,
        variables: ['userName', 'resetLink'],
        lastModified: new Date().toISOString(),
        htmlContent: `
          <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #f97316;">Restablece tu Contraseña</h1>
              <p>Hola {{userName}},</p>
              <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p>Para restablecer tu contraseña, haz clic en el siguiente enlace:</p>
                <p><a href="{{resetLink}}" style="background: #f97316; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Restablecer Contraseña</a></p>
                <p style="margin-top: 15px; font-size: 12px; color: #666;">Este enlace expirará en 24 horas por seguridad.</p>
              </div>
              <p>Si no solicitaste este cambio, puedes ignorar este email.</p>
              <p>Saludos,<br>El equipo de Lovilike</p>
            </body>
          </html>
        `,
        textContent: `
          Restablece tu Contraseña
          
          Hola {{userName}},
          
          Recibimos una solicitud para restablecer la contraseña de tu cuenta.
          
          Para restablecer tu contraseña, visita el siguiente enlace:
          {{resetLink}}
          
          Este enlace expirará en 24 horas por seguridad.
          
          Si no solicitaste este cambio, puedes ignorar este email.
          
          Saludos,
          El equipo de Lovilike
        `
      }
    }

    const template = templates[id as keyof typeof templates]
    if (!template) {
      return NextResponse.json({ error: 'Template no encontrado' }, { status: 404 })
    }

    return NextResponse.json({ template })

  } catch (error) {
    console.error('Error getting email template:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = params
    const { 
      name, 
      subject, 
      htmlContent, 
      textContent, 
      isActive 
    } = await req.json()

    // Validaciones básicas
    if (!name || !subject || !htmlContent) {
      return NextResponse.json({ 
        error: 'Campos requeridos: nombre, asunto y contenido HTML' 
      }, { status: 400 })
    }

    // Actualizar plantilla en base de datos
    const template = await db.emailTemplate.update({
      where: { id },
      data: {
        name,
        description,
        subject,
        htmlContent,
        textContent,
        variables: variables || {},
        isActive: isActive ?? true,
        lastEditedBy: session.user.id
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        editor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Template actualizado exitosamente',
      template: {
        id: template.id,
        type: template.type,
        name: template.name,
        description: template.description,
        subject: template.subject,
        htmlContent: template.htmlContent,
        textContent: template.textContent,
        variables: template.variables,
        isActive: template.isActive,
        createdAt: template.createdAt.toISOString(),
        updatedAt: template.updatedAt.toISOString(),
        creator: template.creator,
        editor: template.editor
      }
    })

  } catch (error) {
    console.error('Error updating email template:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = params

    // Verificar si el template existe y si es eliminable
    const existingTemplate = await db.emailTemplate.findUnique({
      where: { id }
    })

    if (!existingTemplate) {
      return NextResponse.json({ 
        error: 'Template no encontrado' 
      }, { status: 404 })
    }

    // No permitir eliminar templates por defecto
    if (existingTemplate.isDefault) {
      return NextResponse.json({ 
        error: 'No se pueden eliminar templates por defecto del sistema' 
      }, { status: 400 })
    }

    // Eliminar template de base de datos
    await db.emailTemplate.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Template eliminado exitosamente'
    })

  } catch (error) {
    console.error('Error deleting email template:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}