import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"

const RESERVATION_DURATION_MINUTES = 45

export async function POST(request: NextRequest) {
  try {
    const { sessionId, variantId, quantity } = await request.json()

    if (!sessionId || !variantId || !quantity || quantity <= 0) {
      return NextResponse.json(
        { error: 'Datos de reserva inválidos' },
        { status: 400 }
      )
    }

    const session = await auth()
    const userAgent = request.headers.get('user-agent')
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'

    // 1. Verificar que la variante existe
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId }
    })

    if (!variant) {
      return NextResponse.json(
        { error: 'Variante de producto no encontrada' },
        { status: 404 }
      )
    }

    // 2. Limpiar reservas expiradas antes de continuar
    await prisma.stockReservation.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    })

    // 3. Calcular stock disponible
    const activeReservations = await prisma.stockReservation.aggregate({
      where: {
        variantId,
        expiresAt: {
          gt: new Date()
        }
      },
      _sum: {
        quantity: true
      }
    })

    const reservedQuantity = activeReservations._sum.quantity || 0
    const availableStock = variant.stock - reservedQuantity

    if (availableStock < quantity) {
      return NextResponse.json({
        error: 'Stock insuficiente',
        availableStock,
        requestedQuantity: quantity,
        reservedQuantity
      }, { status: 400 })
    }

    // 4. Verificar si ya existe una reserva para esta sesión y variante
    const existingReservation = await prisma.stockReservation.findFirst({
      where: {
        sessionId,
        variantId,
        expiresAt: {
          gt: new Date()
        }
      }
    })

    const expiresAt = new Date(Date.now() + RESERVATION_DURATION_MINUTES * 60 * 1000)

    let reservation

    if (existingReservation) {
      // Actualizar reserva existente
      reservation = await prisma.stockReservation.update({
        where: { id: existingReservation.id },
        data: {
          quantity,
          expiresAt,
          userId: session?.user?.id
        }
      })
    } else {
      // Crear nueva reserva
      reservation = await prisma.stockReservation.create({
        data: {
          sessionId,
          variantId,
          quantity,
          expiresAt,
          userId: session?.user?.id,
          userAgent,
          ipAddress
        }
      })
    }

    return NextResponse.json({
      success: true,
      reservation: {
        id: reservation.id,
        quantity: reservation.quantity,
        expiresAt: reservation.expiresAt,
        remainingMinutes: Math.ceil((reservation.expiresAt.getTime() - Date.now()) / (60 * 1000))
      },
      availableStock: availableStock - quantity
    })

  } catch (error) {
    console.error('Error en reserva de stock:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { sessionId, variantId } = await request.json()

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID requerido' },
        { status: 400 }
      )
    }

    const whereClause: any = {
      sessionId,
      expiresAt: {
        gt: new Date()
      }
    }

    if (variantId) {
      whereClause.variantId = variantId
    }

    // Eliminar reservas activas para esta sesión
    const result = await prisma.stockReservation.deleteMany({
      where: whereClause
    })

    return NextResponse.json({
      success: true,
      releasedReservations: result.count
    })

  } catch (error) {
    console.error('Error al liberar stock:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}