import { NextRequest, NextResponse } from 'next/server'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db as prisma } from '@/lib/db'

// GET: Obtener variantes de productos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const productId = searchParams.get('productId')
    const sku = searchParams.get('sku')
    const isActive = searchParams.get('isActive')
    const lowStock = searchParams.get('lowStock') // Filtrar por stock bajo

    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {}

    if (productId) {
      where.productId = productId
    }

    if (sku) {
      where.sku = { contains: sku, mode: 'insensitive' }
    }

    if (isActive !== null) {
      where.isActive = isActive === 'true'
    }

    if (lowStock === 'true') {
      where.stock = { lte: 5 } // Stock menor o igual a 5
    }

    // Obtener variantes con paginación
    const [variants, total] = await Promise.all([
      prisma.productVariant.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              basePrice: true,
              isActive: true
            }
          },
          _count: {
            select: {
              orderItems: true,
              inventory: true
            }
          }
        },
        orderBy: [
          { stock: 'asc' }, // Stock bajo primero
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.productVariant.count({ where })
    ])

    // Calcular estadísticas de stock
    const stockStats = await prisma.productVariant.aggregate({
      where,
      _sum: { stock: true },
      _avg: { stock: true },
      _min: { stock: true },
      _max: { stock: true }
    })

    const lowStockCount = await prisma.productVariant.count({
      where: { ...where, stock: { lte: 5 } }
    })

    return NextResponse.json({
      variants,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      stats: {
        totalStock: stockStats._sum.stock || 0,
        averageStock: Math.round(stockStats._avg.stock || 0),
        minStock: stockStats._min.stock || 0,
        maxStock: stockStats._max.stock || 0,
        lowStockCount
      }
    })

  } catch (error) {
    console.error('Error fetching product variants:', error)
    return NextResponse.json(
      { error: 'Error al obtener variantes' },
      { status: 500 }
    )
  }
}

// POST: Crear variante de producto
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role === 'CUSTOMER') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      sku,
      size,
      color,
      material,
      stock = 0,
      price,
      isActive = true,
      productId
    } = body

    // Validaciones
    if (!sku || !productId) {
      return NextResponse.json(
        { error: 'SKU y ID del producto son requeridos' },
        { status: 400 }
      )
    }

    // Verificar que el producto existe
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    // Verificar que el SKU no existe
    const existingSku = await prisma.productVariant.findUnique({
      where: { sku }
    })

    if (existingSku) {
      return NextResponse.json(
        { error: 'El SKU ya existe' },
        { status: 400 }
      )
    }

    // Crear variante
    const variant = await prisma.productVariant.create({
      data: {
        sku,
        size,
        color,
        material,
        stock,
        price,
        isActive,
        productId
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            basePrice: true
          }
        }
      }
    })

    // Crear movimiento de inventario inicial si hay stock
    if (stock > 0) {
      await prisma.inventoryMovement.create({
        data: {
          variantId: variant.id,
          type: 'IN',
          quantity: stock,
          reason: 'Stock inicial',
          userId: session.user.id
        }
      })
    }

    return NextResponse.json({
      variant,
      message: 'Variante creada correctamente'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating product variant:', error)
    return NextResponse.json(
      { error: 'Error al crear variante' },
      { status: 500 }
    )
  }
}

// PATCH: Operaciones masivas en variantes
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role === 'CUSTOMER') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, variantIds, data } = body

    if (!action || !variantIds || !Array.isArray(variantIds)) {
      return NextResponse.json(
        { error: 'Acción e IDs de variantes son requeridos' },
        { status: 400 }
      )
    }

    let result

    switch (action) {
      case 'activate':
        result = await prisma.productVariant.updateMany({
          where: { id: { in: variantIds } },
          data: { isActive: true }
        })
        break

      case 'deactivate':
        result = await prisma.productVariant.updateMany({
          where: { id: { in: variantIds } },
          data: { isActive: false }
        })
        break

      case 'update_stock':
        if (!data?.stock && data?.stock !== 0) {
          return NextResponse.json(
            { error: 'Stock es requerido para esta operación' },
            { status: 400 }
          )
        }

        // Actualizar stock y crear movimientos de inventario
        const variants = await prisma.productVariant.findMany({
          where: { id: { in: variantIds } }
        })

        const updatePromises = variants.map(async (variant) => {
          const difference = data.stock - variant.stock

          await prisma.productVariant.update({
            where: { id: variant.id },
            data: { stock: data.stock }
          })

          if (difference !== 0) {
            await prisma.inventoryMovement.create({
              data: {
                variantId: variant.id,
                type: difference > 0 ? 'IN' : 'OUT',
                quantity: Math.abs(difference),
                reason: `Ajuste masivo de stock`,
                userId: session.user.id
              }
            })
          }
        })

        await Promise.all(updatePromises)
        result = { count: variantIds.length }
        break

      case 'update_price':
        if (!data?.price && data?.price !== 0) {
          return NextResponse.json(
            { error: 'Precio es requerido para esta operación' },
            { status: 400 }
          )
        }

        result = await prisma.productVariant.updateMany({
          where: { id: { in: variantIds } },
          data: { price: data.price }
        })
        break

      case 'delete':
        // Verificar que no tienen pedidos asociados
        const variantsWithOrders = await prisma.productVariant.findMany({
          where: {
            id: { in: variantIds },
            orderItems: { some: {} }
          }
        })

        if (variantsWithOrders.length > 0) {
          return NextResponse.json(
            { error: 'No se pueden eliminar variantes con pedidos asociados' },
            { status: 400 }
          )
        }

        // Eliminar movimientos de inventario primero
        await prisma.inventoryMovement.deleteMany({
          where: { variantId: { in: variantIds } }
        })

        result = await prisma.productVariant.deleteMany({
          where: { id: { in: variantIds } }
        })
        break

      default:
        return NextResponse.json(
          { error: 'Acción no válida' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      message: `Operación '${action}' completada en ${result.count} variante(s)`,
      count: result.count
    })

  } catch (error) {
    console.error('Error in batch variant operation:', error)
    return NextResponse.json(
      { error: 'Error en operación masiva' },
      { status: 500 }
    )
  }
}