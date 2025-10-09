import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/auth"
import { db as prisma } from '@/lib/db'
import { createRedsysPayment } from '@/lib/redsys'

interface CreatePaymentRequest {
  orderId: string
  amount: number
  returnUrl?: string
  customerEmail?: string
  customerName?: string
  productDescription?: string
}

// POST: Crear pago con Redsys
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as CreatePaymentRequest
    
    if (!body.orderId || !body.amount) {
      return NextResponse.json({
        success: false,
        error: 'ID de pedido y cantidad son requeridos'
      }, { status: 400 })
    }

    // Verificar que el pedido existe
    const order = await prisma.order.findUnique({
      where: { id: body.orderId },
      include: {
        user: {
          select: { email: true, name: true }
        }
      }
    })

    if (!order) {
      return NextResponse.json({
        success: false,
        error: 'Pedido no encontrado'
      }, { status: 404 })
    }

    // Verificar configuración de Redsys
    const redsysEnabled = await prisma.setting.findUnique({
      where: { key: 'payment_redsys_enabled' }
    })

    if (!redsysEnabled || redsysEnabled.value !== 'true') {
      return NextResponse.json({
        success: false,
        error: 'Redsys no está habilitado'
      }, { status: 400 })
    }

    // Crear instancia de Redsys
    const redsysPayment = await createRedsysPayment(prisma)
    if (!redsysPayment) {
      return NextResponse.json({
        success: false,
        error: 'Error en configuración de Redsys'
      }, { status: 500 })
    }

    // Obtener URLs del sistema
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    
    // Crear pago
    const paymentResult = await redsysPayment.createPaymentForm({
      amount: body.amount,
      orderId: order.orderNumber, // Usar orderNumber en lugar de ID para Redsys
      merchantUrl: `${baseUrl}/api/webhooks/redsys`,
      urlOk: body.returnUrl || `${baseUrl}/checkout/success?orderId=${body.orderId}`,
      urlKo: `${baseUrl}/checkout/error?orderId=${body.orderId}`,
      productDescription: body.productDescription || 'Pedido Lovilike',
      customerName: body.customerName || order.user?.name || 'Cliente',
      customerEmail: body.customerEmail || order.user?.email
    })

    if (!paymentResult.success) {
      return NextResponse.json({
        success: false,
        error: paymentResult.error || 'Error creando pago'
      }, { status: 400 })
    }

    // Guardar datos del pago para seguimiento
    try {
      await prisma.payment.create({
        data: {
          orderId: order.id,
          method: 'REDSYS',
          amount: body.amount,
          currency: 'EUR',
          status: 'PENDING',
          gatewayOrderId: order.orderNumber,
          gatewayData: JSON.stringify({
            merchantParameters: paymentResult.formData?.Ds_MerchantParameters,
            signature: paymentResult.formData?.Ds_Signature?.substring(0, 20) + '...', // Solo parte de la firma por seguridad
            signatureVersion: paymentResult.formData?.Ds_SignatureVersion
          })
        }
      })
    } catch (paymentError) {
      console.error('Error saving payment record:', paymentError)
      // No fallar el pago por esto
    }

    return NextResponse.json({
      success: true,
      redirectUrl: paymentResult.redirectUrl,
      formData: paymentResult.formData,
      message: 'Pago creado correctamente - Redirigiendo a Redsys'
    })

  } catch (error) {
    console.error('Error creating Redsys payment:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error interno del servidor'
    }, { status: 500 })
  }
}