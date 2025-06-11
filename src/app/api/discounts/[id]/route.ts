import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role === 'CUSTOMER') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const discount = await db.discount.findUnique({
      where: {
        id: params.id
      }
    })

    if (!discount) {
      return NextResponse.json({ error: 'Descuento no encontrado' }, { status: 404 })
    }

    // Generate mock analytics data since we don't have order relations yet
    const analytics = {
      totalRevenue: discount.usedCount * 50, // Mock: average order of 50€
      totalSavings: (() => {
        if (discount.type === 'PERCENTAGE') {
          return discount.usedCount * 50 * (discount.value / 100)
        } else if (discount.type === 'FIXED_AMOUNT') {
          return discount.usedCount * Math.min(discount.value, 50)
        } else if (discount.type === 'FREE_SHIPPING') {
          return discount.usedCount * 5 // Mock shipping cost
        }
        return 0
      })(),
      conversionRate: discount.usedCount > 0 ? Math.min(discount.usedCount * 2, 100) : 0,
      avgOrderValue: 50,
      usageByDay: [],
      usageByHour: [],
      topCustomers: [],
      recentUsage: []
    }

    const discountWithAnalytics = {
      ...discount,
      analytics
    }

    return NextResponse.json(discountWithAnalytics)

  } catch (error) {
    console.error('Error fetching discount:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role === 'CUSTOMER') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()

    // Check if discount exists
    const existingDiscount = await db.discount.findUnique({
      where: { id: params.id }
    })

    if (!existingDiscount) {
      return NextResponse.json({ error: 'Descuento no encontrado' }, { status: 404 })
    }

    // If it's just a status toggle, handle it simply
    if (body.hasOwnProperty('isActive') && Object.keys(body).length === 1) {
      const updatedDiscount = await db.discount.update({
        where: { id: params.id },
        data: { isActive: body.isActive }
      })

      return NextResponse.json(updatedDiscount)
    }

    // For full updates, validate and prepare the data
    const data = {
      code: body.code?.toUpperCase() || existingDiscount.code,
      name: body.name || existingDiscount.name,
      type: body.type || existingDiscount.type,
      value: body.value !== undefined ? parseFloat(body.value) : existingDiscount.value,
      minOrderAmount: body.minOrderAmount !== undefined ? (body.minOrderAmount ? parseFloat(body.minOrderAmount) : null) : existingDiscount.minOrderAmount,
      maxOrderAmount: body.maxOrderAmount !== undefined ? (body.maxOrderAmount ? parseFloat(body.maxOrderAmount) : null) : existingDiscount.maxOrderAmount,
      maxUses: body.maxUses !== undefined ? (body.maxUses ? parseInt(body.maxUses) : null) : existingDiscount.maxUses,
      usesPerCustomer: body.usesPerCustomer !== undefined ? (body.usesPerCustomer ? parseInt(body.usesPerCustomer) : null) : existingDiscount.usesPerCustomer,
      isActive: body.isActive !== undefined ? body.isActive : existingDiscount.isActive,
      validFrom: body.validFrom ? new Date(body.validFrom) : existingDiscount.validFrom,
      validUntil: body.validUntil !== undefined ? (body.validUntil ? new Date(body.validUntil) : null) : existingDiscount.validUntil,
      targetType: body.targetType || existingDiscount.targetType,
      targetIds: body.targetIds !== undefined ? body.targetIds : (existingDiscount.targetIds as string[] || []),
      excludeIds: body.excludeIds !== undefined ? body.excludeIds : (existingDiscount.excludeIds as string[] || []),
      stackable: body.stackable !== undefined ? body.stackable : existingDiscount.stackable,
      firstTimeOnly: body.firstTimeOnly !== undefined ? body.firstTimeOnly : existingDiscount.firstTimeOnly,
      autoApply: body.autoApply !== undefined ? body.autoApply : existingDiscount.autoApply,
      description: body.description !== undefined ? body.description : existingDiscount.description,
      internalNotes: body.internalNotes !== undefined ? body.internalNotes : existingDiscount.internalNotes,
      geographicRestrictions: body.geographicRestrictions !== undefined ? body.geographicRestrictions : (existingDiscount.geographicRestrictions as string[] || []),
      deviceRestrictions: body.deviceRestrictions !== undefined ? body.deviceRestrictions : (existingDiscount.deviceRestrictions as string[] || []),
      timeRestrictions: body.timeRestrictions !== undefined ? body.timeRestrictions : existingDiscount.timeRestrictions
    }

    // Check if code is unique (excluding current discount)
    if (data.code !== existingDiscount.code) {
      const existingCode = await db.discount.findFirst({
        where: { 
          code: data.code,
          id: { not: params.id }
        }
      })

      if (existingCode) {
        return NextResponse.json(
          { error: 'El código de descuento ya existe' },
          { status: 400 }
        )
      }
    }

    // Validate dates
    if (data.validUntil && data.validUntil <= data.validFrom) {
      return NextResponse.json(
        { error: 'La fecha de fin debe ser posterior a la fecha de inicio' },
        { status: 400 }
      )
    }

    // Update discount
    const updatedDiscount = await db.discount.update({
      where: { id: params.id },
      data: {
        code: data.code,
        name: data.name,
        type: data.type,
        value: data.value,
        minOrderAmount: data.minOrderAmount,
        maxOrderAmount: data.maxOrderAmount,
        maxUses: data.maxUses,
        usesPerCustomer: data.usesPerCustomer,
        validFrom: data.validFrom,
        validUntil: data.validUntil,
        targetType: data.targetType || 'ALL',
        targetIds: data.targetIds || [],
        excludeIds: data.excludeIds || [],
        stackable: data.stackable || false,
        firstTimeOnly: data.firstTimeOnly || false,
        autoApply: data.autoApply || false,
        description: data.description || '',
        internalNotes: data.internalNotes || '',
        geographicRestrictions: data.geographicRestrictions || [],
        deviceRestrictions: data.deviceRestrictions || [],
        timeRestrictions: data.timeRestrictions || null
      }
    })

    return NextResponse.json(updatedDiscount)

  } catch (error) {
    console.error('Error updating discount:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role === 'CUSTOMER') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Check if discount exists
    const existingDiscount = await db.discount.findUnique({
      where: { id: params.id }
    })

    if (!existingDiscount) {
      return NextResponse.json({ error: 'Descuento no encontrado' }, { status: 404 })
    }

    // Check if discount has been used
    if (existingDiscount.usedCount > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar un descuento que ya ha sido utilizado' },
        { status: 400 }
      )
    }

    // Delete discount
    await db.discount.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Descuento eliminado correctamente' })

  } catch (error) {
    console.error('Error deleting discount:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}