import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const variantId = searchParams.get('variantId')
    const sessionId = searchParams.get('sessionId')

    if (!variantId) {
      return NextResponse.json(
        { error: 'Variant ID requerido' },
        { status: 400 }
      )
    }

    // 1. Limpiar reservas expiradas
    await prisma.stockReservation.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    })

    // 2. Obtener información de la variante
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      select: {
        id: true,
        stock: true,
        stockReservations: {
          where: {
            expiresAt: {
              gt: new Date()
            }
          },
          select: {
            sessionId: true,
            quantity: true,
            expiresAt: true
          }
        }
      }
    })

    if (!variant) {
      return NextResponse.json(
        { error: 'Variante no encontrada' },
        { status: 404 }
      )
    }

    // 3. Calcular stock reservado por otros usuarios
    const otherReservations = variant.stockReservations.filter(
      res => !sessionId || res.sessionId !== sessionId
    )
    
    const reservedByOthers = otherReservations.reduce(
      (total, res) => total + res.quantity, 
      0
    )

    // 4. Calcular stock reservado por esta sesión
    const myReservations = sessionId 
      ? variant.stockReservations.filter(res => res.sessionId === sessionId)
      : []
    
    const reservedByMe = myReservations.reduce(
      (total, res) => total + res.quantity, 
      0
    )

    // 5. Stock disponible para esta sesión
    const availableStock = variant.stock - reservedByOthers

    return NextResponse.json({
      variantId,
      totalStock: variant.stock,
      availableStock,
      reservedByOthers,
      reservedByMe,
      myReservations: myReservations.map(res => ({
        quantity: res.quantity,
        expiresAt: res.expiresAt,
        remainingMinutes: Math.ceil((res.expiresAt.getTime() - Date.now()) / (60 * 1000))
      }))
    })

  } catch (error) {
    console.error('Error al consultar stock disponible:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}