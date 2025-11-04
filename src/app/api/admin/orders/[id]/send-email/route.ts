import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/auth"
import { db as prisma } from '@/lib/db'
import { sendOrderStatusUpdateEmail } from '@/lib/order-emails'
import { OrderStatus } from '@prisma/client'

interface SendEmailRequest {
  type: 'status_update' | 'custom'
  customMessage?: string
  templateId?: string
  subject?: string
  htmlContent?: string
}

// POST: Enviar email manual desde admin
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user.role !== 'ADMIN' && role !== 'SUPER_ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json() as SendEmailRequest

    // Buscar pedido completo
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true
              }
            },
            variant: {
              select: {
                id: true,
                sku: true,
                size: true,
                colorName: true,
                colorHex: true,
                colorDisplay: true
              }
            }
          }
        },
        address: true
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
    }

    if (!order.user?.email) {
      return NextResponse.json({ error: 'El cliente no tiene email configurado' }, { status: 400 })
    }

    let emailSent = false
    let emailError: string | undefined

    if (body.type === 'status_update') {
      // Enviar email de actualización de estado actual
      try {
        const result = await sendOrderStatusUpdateEmail(
          {
            id: order.id,
            orderNumber: order.orderNumber,
            status: order.status as OrderStatus,
            totalAmount: order.totalAmount,
            customerEmail: order.user.email,
            customerName: order.user.name || 'Cliente',
            shippingAddress: order.address ? {
              fullName: order.address.fullName || order.user.name || '',
              address: order.address.address || '',
              city: order.address.city || '',
              postalCode: order.address.postalCode || ''
            } : undefined,
            orderItems: order.orderItems.map(item => ({
              productName: item.productName,
              quantity: item.quantity,
              unitPrice: item.unitPrice
            })),
            createdAt: order.createdAt,
            updatedAt: order.updatedAt
          },
          order.status as OrderStatus,
          'PENDING' // Simular estado anterior para forzar envío
        )

        emailSent = result.success
        if (!result.success) {
          emailError = result.error
        }
      } catch (error) {
        emailError = error instanceof Error ? error.message : 'Error desconocido'
      }

    } else if (body.type === 'custom') {
      // Enviar email personalizado (implementación futura)
      return NextResponse.json({
        error: 'Emails personalizados aún no implementados'
      }, { status: 501 })
    }

    if (emailSent) {
      // Registrar la acción en logs (opcional)
      try {
        await prisma.notification.create({
          data: {
            userId: order.user.id,
            type: 'EMAIL_SENT',
            title: 'Email enviado desde Admin',
            message: `Email de ${body.type} enviado manualmente por administrador`,
            metadata: JSON.stringify({
              orderId: order.id,
              orderNumber: order.orderNumber,
              adminUserId: session.user.id,
              emailType: body.type,
              customMessage: body.customMessage
            })
          }
        })
      } catch (logError) {
        console.error('Error creating notification log:', logError)
        // No fallar la operación por esto
      }

      return NextResponse.json({
        success: true,
        message: 'Email enviado exitosamente',
        details: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          recipient: order.user.email,
          type: body.type
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        error: emailError || 'Error enviando email'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Error in admin send email:', error)
    return NextResponse.json({
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}