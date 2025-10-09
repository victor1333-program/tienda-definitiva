import { NextRequest, NextResponse } from "next/server"
import { db as prisma } from '@/lib/db'
import { createRedsysPayment } from '@/lib/redsys'
import { sendOrderStatusUpdateEmail } from '@/lib/order-emails'
import { OrderStatus } from '@prisma/client'

interface RedsysNotification {
  Ds_SignatureVersion: string
  Ds_MerchantParameters: string
  Ds_Signature: string
}

// POST - Handle Redsys webhook notifications
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    

    // Parse form data or JSON based on content type
    let notification: RedsysNotification
    const contentType = request.headers.get('content-type') || ''
    
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = new URLSearchParams(body)
      notification = {
        Ds_SignatureVersion: formData.get('Ds_SignatureVersion') || '',
        Ds_MerchantParameters: formData.get('Ds_MerchantParameters') || '',
        Ds_Signature: formData.get('Ds_Signature') || ''
      }
    } else {
      notification = JSON.parse(body)
    }

    // Validate required parameters
    if (!notification.Ds_MerchantParameters || !notification.Ds_Signature) {
      console.error("Missing required Redsys parameters")
      return NextResponse.json({ error: "Parámetros requeridos faltantes" }, { status: 400 })
    }

    // Decode merchant parameters
    let merchantParams
    try {
      const decodedParams = Buffer.from(notification.Ds_MerchantParameters, 'base64').toString('utf-8')
      merchantParams = JSON.parse(decodedParams)
    } catch (error) {
      console.error("Error decoding merchant parameters:", error)
      return NextResponse.json({ error: "Error decodificando parámetros" }, { status: 400 })
    }

    // Crear instancia de Redsys para validar la firma
    const redsysPayment = await createRedsysPayment(prisma)
    if (!redsysPayment) {
      console.error("Redsys not configured")
      return NextResponse.json({ error: "Redsys no configurado" }, { status: 500 })
    }

    // Validar firma de Redsys
    const verification = redsysPayment.verifyResponse(
      notification.Ds_MerchantParameters,
      notification.Ds_Signature,
      notification.Ds_SignatureVersion
    )

    if (!verification.valid) {
      console.error("Invalid Redsys signature:", verification.error)
      return NextResponse.json({ error: "Firma inválida" }, { status: 400 })
    }

    // Extract transaction details from verified data
    const transactionData = verification.data
    const {
      DS_MERCHANT_ORDER: orderNumber,
      DS_AMOUNT: amount,
      DS_CURRENCY: currency,
      DS_RESPONSE: responseCode,
      DS_MERCHANT_MERCHANTCODE: merchantCode,
      DS_TERMINAL: terminal,
      DS_TRANSACTIONTYPE: transactionType,
      DS_SECUREPAYMENT: securePayment,
      DS_AUTHORISATIONCODE: authCode,
      DS_CARD_COUNTRY: cardCountry,
      DS_CARD_BRAND: cardBrand
    } = transactionData

    // Interpretar código de respuesta usando nuestra librería
    const responseResult = redsysPayment.interpretResponseCode(responseCode)
    const isAuthorized = responseResult.success

    console.log(`📧 Redsys notification - Order: ${orderNumber}, Response: ${responseCode}, Success: ${isAuthorized}`)

    // Buscar pedido por orderNumber
    const order = await prisma.order.findFirst({
      where: { orderNumber: orderNumber },
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
      console.error(`Order not found: ${orderNumber}`)
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 })
    }

    // Actualizar estado del pedido y pago en una transacción
    const result = await prisma.$transaction(async (tx) => {
      // Actualizar registro de pago
      await tx.payment.updateMany({
        where: {
          orderId: order.id,
          method: 'REDSYS',
          status: 'PENDING'
        },
        data: {
          status: isAuthorized ? 'COMPLETED' : 'FAILED',
          gatewayTransactionId: authCode || responseCode,
          gatewayResponse: JSON.stringify({
            responseCode,
            message: responseResult.message,
            authCode,
            cardBrand,
            cardCountry,
            securePayment
          }),
          completedAt: isAuthorized ? new Date() : undefined
        }
      })

      // Actualizar estado del pedido
      let newOrderStatus: OrderStatus = order.status as OrderStatus
      
      if (isAuthorized) {
        newOrderStatus = 'CONFIRMED' // Pago confirmado, listo para procesamiento
      } else {
        newOrderStatus = 'CANCELLED' // Pago falló, cancelar pedido
      }

      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: {
          status: newOrderStatus,
          paymentStatus: isAuthorized ? 'PAID' : 'FAILED',
          paidAt: isAuthorized ? new Date() : undefined
        }
      })

      return { updatedOrder, previousStatus: order.status }
    })

    // Enviar email de notificación (fuera de la transacción)
    try {
      await sendOrderStatusUpdateEmail(
        {
          id: order.id,
          orderNumber: order.orderNumber,
          status: result.updatedOrder.status as OrderStatus,
          totalAmount: order.totalAmount,
          customerEmail: order.user?.email || '',
          customerName: order.user?.name || 'Cliente',
          shippingAddress: order.address ? {
            fullName: order.address.fullName || order.user?.name || '',
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
          updatedAt: result.updatedOrder.updatedAt
        },
        result.updatedOrder.status as OrderStatus,
        result.previousStatus as OrderStatus
      )
    } catch (emailError) {
      console.error('Error sending order confirmation email:', emailError)
      // No fallar el webhook por esto
    }

    // Return success response to Redsys
    return NextResponse.json({ 
      success: true,
      message: "Notificación procesada correctamente",
      orderId: orderNumber,
      status: isAuthorized ? 'completed' : 'failed',
      paymentStatus: responseResult.message
    })

  } catch (error) {
    console.error("Error processing Redsys webhook:", error)
    
    // Return error but don't expose internal details
    return NextResponse.json(
      { error: "Error procesando notificación" },
      { status: 500 }
    )
  }
}


// GET - Test webhook endpoint
export async function GET() {
  return NextResponse.json({
    service: "Redsys Webhook Handler",
    status: "active",
    timestamp: new Date().toISOString(),
    endpoint: "/api/webhooks/redsys",
    methods: ["POST"],
    description: "Endpoint para recibir notificaciones de Redsys TPV"
  })
}