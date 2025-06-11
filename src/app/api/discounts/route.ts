import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db as prisma } from '@/lib/db'
import { paginationSchema } from '@/lib/validations'

// GET: Obtener descuentos
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role === 'CUSTOMER') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const isActive = searchParams.get('isActive')
    const type = searchParams.get('type')
    const expired = searchParams.get('expired')

    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {}
    const now = new Date()

    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (isActive !== null) {
      where.isActive = isActive === 'true'
    }

    if (type) {
      where.type = type
    }

    if (expired === 'true') {
      where.validUntil = { lt: now }
    } else if (expired === 'false') {
      where.OR = [
        { validUntil: null },
        { validUntil: { gte: now } }
      ]
    }

    // Obtener descuentos con paginación
    const [discounts, total] = await Promise.all([
      prisma.discount.findMany({
        where,
        orderBy: [
          { isActive: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.discount.count({ where })
    ])

    // Calcular estadísticas
    const stats = await prisma.discount.groupBy({
      by: ['type'],
      where,
      _count: { id: true },
      _sum: { usedCount: true }
    })

    const summary = {
      totalDiscounts: total,
      byType: stats.reduce((acc, stat) => {
        acc[stat.type] = {
          count: stat._count.id,
          totalUses: stat._sum.usedCount || 0
        }
        return acc
      }, {} as any),
      activeCount: await prisma.discount.count({
        where: { ...where, isActive: true }
      }),
      expiredCount: await prisma.discount.count({
        where: { ...where, validUntil: { lt: now } }
      })
    }

    return NextResponse.json({
      discounts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      summary
    })

  } catch (error) {
    console.error('Error fetching discounts:', error)
    return NextResponse.json(
      { error: 'Error al obtener descuentos' },
      { status: 500 }
    )
  }
}

// POST: Crear descuento
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role === 'CUSTOMER') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Basic validation
    if (!body.code || !body.name || !body.type || body.value === undefined) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: code, name, type, value' },
        { status: 400 }
      )
    }

    const data = {
      code: body.code.toUpperCase(),
      name: body.name,
      type: body.type,
      value: parseFloat(body.value),
      minOrderAmount: body.minOrderAmount ? parseFloat(body.minOrderAmount) : null,
      maxOrderAmount: body.maxOrderAmount ? parseFloat(body.maxOrderAmount) : null,
      maxUses: body.maxUses ? parseInt(body.maxUses) : null,
      usesPerCustomer: body.usesPerCustomer ? parseInt(body.usesPerCustomer) : null,
      isActive: body.isActive !== false,
      validFrom: new Date(body.validFrom),
      validUntil: body.validUntil ? new Date(body.validUntil) : null,
      targetType: body.targetType || 'ALL',
      targetIds: body.targetIds || [],
      excludeIds: body.excludeIds || [],
      stackable: body.stackable || false,
      firstTimeOnly: body.firstTimeOnly || false,
      autoApply: body.autoApply || false,
      description: body.description || '',
      internalNotes: body.internalNotes || '',
      geographicRestrictions: body.geographicRestrictions || [],
      deviceRestrictions: body.deviceRestrictions || [],
      timeRestrictions: body.timeRestrictions || null
    }

    // Validate percentage
    if (data.type === 'PERCENTAGE' && data.value > 100) {
      return NextResponse.json(
        { error: 'El porcentaje no puede ser mayor a 100' },
        { status: 400 }
      )
    }

    // Validate dates
    if (data.validUntil && data.validUntil <= data.validFrom) {
      return NextResponse.json(
        { error: 'La fecha de fin debe ser posterior a la fecha de inicio' },
        { status: 400 }
      )
    }

    // Verificar que el código no existe
    const existingCode = await prisma.discount.findUnique({
      where: { code: data.code }
    })

    if (existingCode) {
      return NextResponse.json(
        { error: 'Ya existe un descuento con ese código' },
        { status: 400 }
      )
    }

    // Crear descuento con todos los campos
    const discount = await prisma.discount.create({
      data: {
        code: data.code,
        name: data.name,
        type: data.type,
        value: data.value,
        minOrderAmount: data.minOrderAmount,
        maxOrderAmount: data.maxOrderAmount,
        maxUses: data.maxUses,
        usesPerCustomer: data.usesPerCustomer,
        isActive: data.isActive,
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

    return NextResponse.json({
      discount,
      message: 'Descuento creado correctamente'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating discount:', error)
    return NextResponse.json(
      { error: 'Error al crear descuento' },
      { status: 500 }
    )
  }
}

// PATCH: Operaciones masivas
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role === 'CUSTOMER') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, discountIds } = body

    if (!action || !discountIds || !Array.isArray(discountIds)) {
      return NextResponse.json(
        { error: 'Acción e IDs de descuentos son requeridos' },
        { status: 400 }
      )
    }

    let result

    switch (action) {
      case 'activate':
        result = await prisma.discount.updateMany({
          where: { id: { in: discountIds } },
          data: { isActive: true }
        })
        break

      case 'deactivate':
        result = await prisma.discount.updateMany({
          where: { id: { in: discountIds } },
          data: { isActive: false }
        })
        break

      case 'reset_usage':
        result = await prisma.discount.updateMany({
          where: { id: { in: discountIds } },
          data: { usedCount: 0 }
        })
        break

      case 'delete':
        // Los descuentos pueden eliminarse incluso si se han usado
        result = await prisma.discount.deleteMany({
          where: { id: { in: discountIds } }
        })
        break

      default:
        return NextResponse.json(
          { error: 'Acción no válida' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      message: `Operación '${action}' completada en ${result.count} descuento(s)`,
      count: result.count
    })

  } catch (error) {
    console.error('Error in batch discount operation:', error)
    return NextResponse.json(
      { error: 'Error en operación masiva' },
      { status: 500 }
    )
  }
}

