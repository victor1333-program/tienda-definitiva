import { NextRequest, NextResponse } from "next/server"
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const session = await auth()
    
    if (!session?.user || session.user.role === 'CUSTOMER') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const discount = await db.discount.findUnique({
      where: {
        id: id
      }
    })

    if (!discount) {
      return NextResponse.json({ error: 'Descuento no encontrado' }, { status: 404 })
    }

    // Generate mock analytics data since we don't have order relations yet
    const analytics = {
      totalRevenue: discount.usedCount * 50, // Mock: average order of 50€
      totalSavings: (() => {
        if (discount.isPercentage) {
          return discount.usedCount * 50 * (discount.value / 100)
        } else if (discount.type === 'PRODUCT_DISCOUNT' || discount.type === 'CATEGORY_DISCOUNT') {
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role === 'CUSTOMER') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()

    // Check if discount exists
    const existingDiscount = await db.discount.findUnique({
      where: { id: id }
    })

    if (!existingDiscount) {
      return NextResponse.json({ error: 'Descuento no encontrado' }, { status: 404 })
    }

    // If it's just a status toggle, handle it simply
    if (body.hasOwnProperty('isActive') && Object.keys(body).length === 1) {
      const updatedDiscount = await db.discount.update({
        where: { id: id },
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
      isPercentage: body.isPercentage !== undefined ? body.isPercentage : existingDiscount.isPercentage,
      minOrderAmount: body.minOrderAmount !== undefined ? (body.minOrderAmount ? parseFloat(body.minOrderAmount) : null) : existingDiscount.minOrderAmount,
      minOrderQuantity: body.minOrderQuantity !== undefined ? (body.minOrderQuantity ? parseInt(body.minOrderQuantity) : null) : existingDiscount.minOrderQuantity,
      maxUses: body.maxUses !== undefined ? (body.maxUses ? parseInt(body.maxUses) : null) : existingDiscount.maxUses,
      usesPerCustomer: body.usesPerCustomer !== undefined ? (body.usesPerCustomer ? parseInt(body.usesPerCustomer) : null) : existingDiscount.usesPerCustomer,
      oneTimePerCustomer: body.oneTimePerCustomer !== undefined ? body.oneTimePerCustomer : existingDiscount.oneTimePerCustomer,
      isActive: body.isActive !== undefined ? body.isActive : existingDiscount.isActive,
      validFrom: body.validFrom ? new Date(body.validFrom) : existingDiscount.validFrom,
      validUntil: body.validUntil !== undefined ? (body.validUntil ? new Date(body.validUntil) : null) : existingDiscount.validUntil,
      targetType: body.targetType || existingDiscount.targetType,
      targetProductIds: body.targetProductIds !== undefined ? body.targetProductIds : (existingDiscount.targetProductIds as string[] || []),
      targetCategoryIds: body.targetCategoryIds !== undefined ? body.targetCategoryIds : (existingDiscount.targetCategoryIds as string[] || []),
      countries: body.countries !== undefined ? body.countries : (existingDiscount.countries as string[] || []),
      allCountries: body.allCountries !== undefined ? body.allCountries : existingDiscount.allCountries,
      description: body.description !== undefined ? body.description : existingDiscount.description,
      internalNotes: body.internalNotes !== undefined ? body.internalNotes : existingDiscount.internalNotes
    }

    // Check if code is unique (excluding current discount)
    if (data.code !== existingDiscount.code) {
      const existingCode = await db.discount.findFirst({
        where: { 
          code: data.code,
          id: { not: id }
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
      where: { id: id },
      data: {
        code: data.code,
        name: data.name,
        type: data.type,
        value: data.value,
        isPercentage: data.isPercentage,
        minOrderAmount: data.minOrderAmount,
        minOrderQuantity: data.minOrderQuantity,
        maxUses: data.maxUses,
        usesPerCustomer: data.usesPerCustomer,
        oneTimePerCustomer: data.oneTimePerCustomer,
        validFrom: data.validFrom,
        validUntil: data.validUntil,
        targetType: data.targetType,
        targetProductIds: data.targetProductIds,
        targetCategoryIds: data.targetCategoryIds,
        countries: data.countries,
        allCountries: data.allCountries,
        description: data.description,
        internalNotes: data.internalNotes
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role === 'CUSTOMER') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Check if discount exists
    const existingDiscount = await db.discount.findUnique({
      where: { id: id }
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
      where: { id: id }
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