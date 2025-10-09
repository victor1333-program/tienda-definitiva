import { NextRequest, NextResponse } from 'next/server'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db as prisma } from '@/lib/db'

// GET: Obtener inventario completo (productos base + variantes)
export async function GET(request: NextRequest) {
  try {
    // DESARROLLO: Comentado temporalmente para pruebas
    // const session = await auth()
    // if (!session?.user || session.user.role === 'CUSTOMER') {
    //   return NextResponse.json(
    //     { error: 'No autorizado' },
    //     { status: 401 }
    //   )
    // }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search')
    const lowStock = searchParams.get('lowStock') === 'true'
    const category = searchParams.get('category')
    const variantId = searchParams.get('variantId')

    const skip = (page - 1) * limit

    // Filtro para movimientos de inventario
    const where: any = {}
    
    if (variantId) {
      where.variantId = variantId
    }

    // Obtener productos con sus variantes
    const whereProduct: any = {
      isActive: true
    }

    if (search) {
      whereProduct.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (category) {
      whereProduct.categories = {
        some: {
          categoryId: category
        }
      }
    }

    // Obtener movimientos con paginación
    const [movements, total] = await Promise.all([
      prisma.inventoryMovement.findMany({
        where,
        include: {
          variant: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.inventoryMovement.count({ where })
    ])

    // Estadísticas de los movimientos
    const stats = await prisma.inventoryMovement.groupBy({
      by: ['type'],
      where,
      _sum: { quantity: true },
      _count: { id: true }
    })

    const summary = {
      totalMovements: total,
      byType: stats.reduce((acc, stat) => {
        acc[stat.type] = {
          count: stat._count.id,
          totalQuantity: stat._sum.quantity || 0
        }
        return acc
      }, {} as any)
    }

    return NextResponse.json({
      movements,
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
    console.error('Error fetching inventory movements:', error)
    return NextResponse.json(
      { error: 'Error al obtener movimientos de inventario' },
      { status: 500 }
    )
  }
}

// POST: Crear movimiento de inventario
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
      variantId,
      type,
      quantity,
      reason
    } = body

    // Validaciones
    if (!variantId || !type || !quantity || quantity <= 0) {
      return NextResponse.json(
        { error: 'Variante, tipo, cantidad son requeridos y cantidad debe ser mayor a 0' },
        { status: 400 }
      )
    }

    if (!['IN', 'OUT', 'ADJUSTMENT', 'RETURN'].includes(type)) {
      return NextResponse.json(
        { error: 'Tipo de movimiento no válido' },
        { status: 400 }
      )
    }

    // Verificar que la variante existe
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId }
    })

    if (!variant) {
      return NextResponse.json(
        { error: 'Variante no encontrada' },
        { status: 404 }
      )
    }

    // Para movimientos de salida, verificar stock suficiente
    if ((type === 'OUT' || type === 'ADJUSTMENT') && variant.stock < quantity) {
      return NextResponse.json(
        { error: 'Stock insuficiente para realizar el movimiento' },
        { status: 400 }
      )
    }

    // Calcular nuevo stock
    let newStock = variant.stock
    switch (type) {
      case 'IN':
      case 'RETURN':
        newStock += quantity
        break
      case 'OUT':
        newStock -= quantity
        break
      case 'ADJUSTMENT':
        // Para ajustes, la cantidad puede ser positiva o negativa
        newStock = quantity
        break
    }

    // Usar transacción para actualizar stock y crear movimiento
    const result = await prisma.$transaction(async (tx) => {
      // Actualizar stock de la variante
      const updatedVariant = await tx.productVariant.update({
        where: { id: variantId },
        data: { stock: newStock }
      })

      // Crear movimiento de inventario
      const movement = await tx.inventoryMovement.create({
        data: {
          variantId,
          type,
          quantity,
          reason: reason || `Movimiento de tipo ${type}`,
          userId: session.user.id
        },
        include: {
          variant: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true
                }
              }
            }
          }
        }
      })

      return { movement, updatedVariant }
    })

    return NextResponse.json({
      movement: result.movement,
      newStock: result.updatedVariant.stock,
      message: 'Movimiento de inventario creado correctamente'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating inventory movement:', error)
    return NextResponse.json(
      { error: 'Error al crear movimiento de inventario' },
      { status: 500 }
    )
  }
}

// PATCH: Operaciones masivas de inventario
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
    const { action, movements } = body

    if (!action || !movements || !Array.isArray(movements)) {
      return NextResponse.json(
        { error: 'Acción y movimientos son requeridos' },
        { status: 400 }
      )
    }

    let results = []

    switch (action) {
      case 'bulk_create':
        // Crear múltiples movimientos de inventario
        for (const movementData of movements) {
          const { variantId, type, quantity, reason } = movementData

          // Validar cada movimiento
          if (!variantId || !type || !quantity) {
            continue // Saltar movimientos inválidos
          }

          try {
            // Obtener variante actual
            const variant = await prisma.productVariant.findUnique({
              where: { id: variantId }
            })

            if (!variant) continue

            // Calcular nuevo stock
            let newStock = variant.stock
            switch (type) {
              case 'IN':
              case 'RETURN':
                newStock += quantity
                break
              case 'OUT':
                if (variant.stock < quantity) continue // Saltar si no hay stock
                newStock -= quantity
                break
              case 'ADJUSTMENT':
                newStock = quantity
                break
            }

            // Ejecutar transacción para cada movimiento
            const result = await prisma.$transaction(async (tx) => {
              const updatedVariant = await tx.productVariant.update({
                where: { id: variantId },
                data: { stock: newStock }
              })

              const movement = await tx.inventoryMovement.create({
                data: {
                  variantId,
                  type,
                  quantity,
                  reason: reason || `Movimiento masivo de tipo ${type}`,
                  userId: session.user.id
                }
              })

              return { movement, updatedVariant }
            })

            results.push(result)
          } catch (error) {
            console.error(`Error processing movement for variant ${variantId}:`, error)
            continue
          }
        }
        break

      case 'stock_reset':
        // Resetear stock a valores específicos
        for (const resetData of movements) {
          const { variantId, newStock } = resetData

          if (!variantId || newStock < 0) continue

          try {
            const variant = await prisma.productVariant.findUnique({
              where: { id: variantId }
            })

            if (!variant) continue

            const difference = newStock - variant.stock

            if (difference !== 0) {
              const result = await prisma.$transaction(async (tx) => {
                const updatedVariant = await tx.productVariant.update({
                  where: { id: variantId },
                  data: { stock: newStock }
                })

                const movement = await tx.inventoryMovement.create({
                  data: {
                    variantId,
                    type: 'ADJUSTMENT',
                    quantity: Math.abs(difference),
                    reason: `Reset de stock masivo (${variant.stock} → ${newStock})`,
                    userId: session.user.id
                  }
                })

                return { movement, updatedVariant }
              })

              results.push(result)
            }
          } catch (error) {
            console.error(`Error resetting stock for variant ${variantId}:`, error)
            continue
          }
        }
        break

      default:
        return NextResponse.json(
          { error: 'Acción no válida' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      message: `Operación '${action}' completada. ${results.length} movimiento(s) procesado(s)`,
      results: results.length,
      details: results
    })

  } catch (error) {
    console.error('Error in bulk inventory operation:', error)
    return NextResponse.json(
      { error: 'Error en operación masiva de inventario' },
      { status: 500 }
    )
  }
}