import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, cartTotal, cartItems } = body

    if (!code) {
      return NextResponse.json(
        { error: 'Código de descuento requerido' },
        { status: 400 }
      )
    }

    // Buscar descuento por código
    const discount = await db.discount.findUnique({
      where: { 
        code: code.toUpperCase(),
        isActive: true
      }
    })

    if (!discount) {
      return NextResponse.json(
        { error: 'Código de descuento no válido', valid: false },
        { status: 404 }
      )
    }

    const now = new Date()

    // Verificar fechas de validez
    if (discount.validFrom > now) {
      return NextResponse.json(
        { error: 'Este descuento aún no está activo', valid: false },
        { status: 400 }
      )
    }

    if (discount.validUntil && discount.validUntil < now) {
      return NextResponse.json(
        { error: 'Este descuento ha expirado', valid: false },
        { status: 400 }
      )
    }

    // Verificar uso máximo
    if (discount.maxUses && discount.usedCount >= discount.maxUses) {
      return NextResponse.json(
        { error: 'Este descuento ha alcanzado su límite de usos', valid: false },
        { status: 400 }
      )
    }

    // Verificar monto mínimo
    if (discount.minOrderAmount && cartTotal < discount.minOrderAmount) {
      return NextResponse.json(
        { 
          error: `Monto mínimo de compra: €${discount.minOrderAmount}`, 
          valid: false,
          minOrderAmount: discount.minOrderAmount
        },
        { status: 400 }
      )
    }

    // Verificar cantidad mínima
    if (discount.minOrderQuantity && cartItems < discount.minOrderQuantity) {
      return NextResponse.json(
        { 
          error: `Cantidad mínima de artículos: ${discount.minOrderQuantity}`, 
          valid: false,
          minOrderQuantity: discount.minOrderQuantity
        },
        { status: 400 }
      )
    }

    // Calcular descuento
    let discountAmount = 0
    
    if (discount.type === 'FREE_SHIPPING') {
      // Para envío gratis, el descuento se aplicará en el envío
      discountAmount = 0 // Se calculará en el frontend
    } else if (discount.isPercentage) {
      discountAmount = (cartTotal * discount.value) / 100
    } else {
      discountAmount = Math.min(discount.value, cartTotal)
    }

    return NextResponse.json({
      valid: true,
      discount: {
        id: discount.id,
        code: discount.code,
        name: discount.name,
        type: discount.type,
        value: discount.value,
        isPercentage: discount.isPercentage,
        discountAmount,
        description: discount.description
      }
    })

  } catch (error) {
    console.error('Error validating discount:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', valid: false },
      { status: 500 }
    )
  }
}