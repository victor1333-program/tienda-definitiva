import { NextRequest, NextResponse } from 'next/server'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db as prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar si el modo prueba está activo
    const testModeSetting = await prisma.setting.findUnique({
      where: { key: 'test_mode' }
    })

    if (!testModeSetting?.value) {
      return NextResponse.json(
        { error: 'El modo prueba no está activo' },
        { status: 400 }
      )
    }

    const { orderId, amount, paymentMethod, customerEmail } = await request.json()

    if (!orderId || !amount || !paymentMethod) {
      return NextResponse.json(
        { error: 'Datos de pago incompletos' },
        { status: 400 }
      )
    }

    // Verificar que la orden existe
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Orden no encontrada' },
        { status: 404 }
      )
    }

    // Simular diferentes escenarios de pago
    const scenarios = [
      { success: true, probability: 0.85, message: 'Pago simulado exitoso' },
      { success: false, probability: 0.1, message: 'Tarjeta rechazada (simulación)' },
      { success: false, probability: 0.05, message: 'Fondos insuficientes (simulación)' }
    ]

    const random = Math.random()
    let cumulativeProbability = 0
    let selectedScenario = scenarios[0] // Por defecto exitoso

    for (const scenario of scenarios) {
      cumulativeProbability += scenario.probability
      if (random <= cumulativeProbability) {
        selectedScenario = scenario
        break
      }
    }

    if (selectedScenario.success) {
      // Actualizar orden como pagada (simulación)
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'PAID',
          status: 'CONFIRMED',
          stripePaymentId: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          adminNotes: `${order.adminNotes || ''}\n🧪 PAGO SIMULADO - No se ha cobrado dinero real`.trim()
        }
      })

      // Obtener items del pedido para liberar reservas
      const orderWithItems = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          orderItems: {
            include: {
              variant: true
            }
          }
        }
      })

      // Liberar todas las reservas de stock y reducir stock real
      if (orderWithItems) {
        for (const orderItem of orderWithItems.orderItems) {
          if (orderItem.variant) {
            // Reducir stock real
            await prisma.productVariant.update({
              where: { id: orderItem.variant.id },
              data: {
                stock: {
                  decrement: orderItem.quantity
                }
              }
            })

            // Limpiar reservas para esta variante
            await prisma.stockReservation.deleteMany({
              where: {
                variantId: orderItem.variant.id
              }
            })
          }
        }
      }
      
      return NextResponse.json({
        success: true,
        paymentId: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        message: 'Pago simulado procesado exitosamente',
        simulationMode: true,
        order: {
          id: orderId,
          status: 'CONFIRMED',
          paymentStatus: 'PAID'
        }
      })
    } else {
      // Simular fallo de pago
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'FAILED',
          adminNotes: `${order.adminNotes || ''}\n🧪 PAGO SIMULADO FALLIDO - ${selectedScenario.message}`.trim()
        }
      })

      return NextResponse.json({
        success: false,
        error: selectedScenario.message,
        simulationMode: true,
        order: {
          id: orderId,
          status: 'PENDING',
          paymentStatus: 'FAILED'
        }
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Error en simulación de pago:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}