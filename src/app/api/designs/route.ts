import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db as prisma } from '@/lib/db'

// GET: Obtener diseños
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const isPublic = searchParams.get('isPublic')
    const isTemplate = searchParams.get('isTemplate')
    const productId = searchParams.get('productId')
    const userId = searchParams.get('userId')

    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (category) {
      where.category = category
    }

    if (isPublic !== null) {
      where.isPublic = isPublic === 'true'
    }

    if (isTemplate !== null) {
      where.isTemplate = isTemplate === 'true'
    }

    if (productId) {
      where.productId = productId
    }

    if (userId) {
      where.createdById = userId
    }

    // Obtener diseños con paginación
    const [designs, total] = await Promise.all([
      prisma.design.findMany({
        where,
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          product: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          },
          _count: {
            select: {
              orderItems: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.design.count({ where })
    ])

    return NextResponse.json({
      designs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error('Error fetching designs:', error)
    return NextResponse.json(
      { error: 'Error al obtener diseños' },
      { status: 500 }
    )
  }
}

// POST: Crear diseño
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      name,
      description,
      elements = [],
      canvasSize = { width: 800, height: 600 },
      canvasBackground = '#ffffff',
      isPublic = false,
      isTemplate = false,
      tags = [],
      category,
      productId,
      variantId,
      templateId
    } = body

    // Validaciones
    if (!name) {
      return NextResponse.json(
        { error: 'Nombre es requerido' },
        { status: 400 }
      )
    }

    // Verificar que el producto existe si se especifica
    if (productId) {
      const product = await prisma.product.findUnique({
        where: { id: productId }
      })
      if (!product) {
        return NextResponse.json(
          { error: 'Producto no encontrado' },
          { status: 404 }
        )
      }
    }

    // Verificar que la variante existe si se especifica
    if (variantId) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: variantId }
      })
      if (!variant) {
        return NextResponse.json(
          { error: 'Variante no encontrada' },
          { status: 404 }
        )
      }
    }

    // Crear diseño
    const design = await prisma.design.create({
      data: {
        name,
        description,
        designData: {
          elements,
          canvasSize,
          canvasBackground
        },
        isPublic,
        isTemplate,
        tags: JSON.stringify(tags),
        category,
        productId,
        createdById: session.user.id
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        product: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    })

    return NextResponse.json({
      id: design.id,
      name: design.name,
      description: design.description,
      elements,
      canvasSize,
      canvasBackground,
      isPublic: design.isPublic,
      isTemplate: design.isTemplate,
      tags,
      category: design.category,
      productId: design.productId,
      createdAt: design.createdAt.toISOString(),
      updatedAt: design.updatedAt.toISOString(),
      user: design.createdBy,
      product: design.product
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating design:', error)
    return NextResponse.json(
      { error: 'Error al crear diseño' },
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
    const { action, designIds } = body

    if (!action || !designIds || !Array.isArray(designIds)) {
      return NextResponse.json(
        { error: 'Acción e IDs de diseños son requeridos' },
        { status: 400 }
      )
    }

    let result

    switch (action) {
      case 'make_public':
        result = await prisma.design.updateMany({
          where: { id: { in: designIds } },
          data: { isPublic: true }
        })
        break

      case 'make_private':
        result = await prisma.design.updateMany({
          where: { id: { in: designIds } },
          data: { isPublic: false }
        })
        break

      case 'make_template':
        result = await prisma.design.updateMany({
          where: { id: { in: designIds } },
          data: { isTemplate: true }
        })
        break

      case 'remove_template':
        result = await prisma.design.updateMany({
          where: { id: { in: designIds } },
          data: { isTemplate: false }
        })
        break

      case 'delete':
        // Verificar que no tienen pedidos asociados
        const designsWithOrders = await prisma.design.findMany({
          where: {
            id: { in: designIds },
            orderItems: { some: {} }
          }
        })

        if (designsWithOrders.length > 0) {
          return NextResponse.json(
            { error: 'No se pueden eliminar diseños con pedidos asociados' },
            { status: 400 }
          )
        }

        result = await prisma.design.deleteMany({
          where: { id: { in: designIds } }
        })
        break

      default:
        return NextResponse.json(
          { error: 'Acción no válida' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      message: `Operación '${action}' completada en ${result.count} diseño(s)`,
      count: result.count
    })

  } catch (error) {
    console.error('Error in batch design operation:', error)
    return NextResponse.json(
      { error: 'Error en operación masiva' },
      { status: 500 }
    )
  }
}