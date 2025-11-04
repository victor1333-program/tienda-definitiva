import { NextRequest, NextResponse } from 'next/server'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { emailService } from '@/lib/email-service'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== 'ADMIN' && role !== 'SUPER_ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Por ahora devolvemos templates por defecto
    // En el futuro se pueden obtener de la base de datos
    const templates = [
      {
        id: 'order_confirmation',
        type: 'ORDER_CONFIRMATION',
        name: 'Confirmación de Pedido',
        description: 'Email enviado automáticamente cuando se confirma un pedido',
        subject: '✅ Pedido confirmado #{orderNumber} - Lovilike',
        isActive: true,
        variables: ['orderNumber', 'orderDate', 'orderTotal', 'orderStatus', 'orderItems', 'shippingAddress', 'shippingMethod'],
        lastModified: new Date().toISOString()
      },
      {
        id: 'order_shipped',
        type: 'ORDER_SHIPPED',
        name: 'Pedido Enviado',
        description: 'Email enviado cuando un pedido es despachado',
        subject: '📦 Tu pedido #{orderNumber} ha sido enviado - Lovilike',
        isActive: true,
        variables: ['orderNumber', 'trackingNumber', 'carrier', 'shippedDate', 'estimatedDelivery', 'trackingUrl'],
        lastModified: new Date().toISOString()
      },
      {
        id: 'welcome',
        type: 'WELCOME',
        name: 'Bienvenida',
        description: 'Email de bienvenida para nuevos clientes',
        subject: '🎉 ¡Bienvenido a Lovilike Personalizados!',
        isActive: true,
        variables: ['customerName', 'siteUrl', 'discountExpiry'],
        lastModified: new Date().toISOString()
      },
      {
        id: 'password_reset',
        type: 'PASSWORD_RESET',
        name: 'Recuperación de Contraseña',
        description: 'Email para restablecer contraseña',
        subject: 'Restablece tu Contraseña - Lovilike',
        isActive: true,
        variables: ['userName', 'resetLink'],
        lastModified: new Date().toISOString()
      }
    ]

    return NextResponse.json({ templates })

  } catch (error) {
    console.error('Error getting email templates:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== 'ADMIN' && role !== 'SUPER_ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { 
      type, 
      name, 
      description, 
      subject, 
      htmlContent, 
      textContent, 
      variables, 
      isActive 
    } = await req.json()

    // Validaciones básicas
    if (!type || !name || !subject || !htmlContent) {
      return NextResponse.json({ 
        error: 'Campos requeridos: tipo, nombre, asunto y contenido HTML' 
      }, { status: 400 })
    }

    // Guardar plantilla en base de datos
    const template = await db.emailTemplate.create({
      data: {
        type: type as any, // El enum se validará en Prisma
        name,
        description,
        subject,
        htmlContent,
        textContent,
        variables: variables || {},
        isActive: isActive ?? true,
        createdBy: session.user.id
      },
      include: {
        creator: {
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
      message: 'Template creado exitosamente',
      template: {
        id: template.id,
        type: template.type,
        name: template.name,
        description: template.description,
        subject: template.subject,
        htmlContent: template.htmlContent,
        textContent: template.textContent,
        variables: template.variables || {},
        isActive: template.isActive,
        createdAt: template.createdAt.toISOString(),
        updatedAt: template.updatedAt.toISOString(),
        creator: template.creator
      }
    })

  } catch (error) {
    console.error('Error creating email template:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}