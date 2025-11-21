import { NextRequest, NextResponse } from 'next/server'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db } from '@/lib/db'

// Obtener productos de una categoría
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const categoryId = id

    const productCategories = await db.productCategory.findMany({
      where: { categoryId },
      include: {
        product: {
          include: {
            _count: {
              select: { orderItems: true }
            }
          }
        }
      },
      orderBy: {
        product: { name: 'asc' }
      }
    })

    return NextResponse.json(productCategories)
  } catch (error) {
    console.error('Error fetching category products:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Añadir productos a una categoría
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const userRole = (session?.user as any)?.role
    if (!session?.user || (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const categoryId = id
    const { productIds } = await request.json()

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: 'Se requiere un array de IDs de productos' },
        { status: 400 }
      )
    }

    // Verificar que la categoría existe
    const category = await db.category.findUnique({
      where: { id: categoryId }
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 404 }
      )
    }

    // Verificar que los productos existen
    const products = await db.product.findMany({
      where: { 
        id: { in: productIds },
        isActive: true
      }
    })

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: 'Algunos productos no fueron encontrados o no están activos' },
        { status: 400 }
      )
    }

    // Obtener relaciones existentes para evitar duplicados
    const existingRelations = await db.productCategory.findMany({
      where: {
        categoryId,
        productId: { in: productIds }
      }
    })

    const existingProductIds = existingRelations.map(rel => rel.productId)
    const newProductIds = productIds.filter(id => !existingProductIds.includes(id))

    if (newProductIds.length === 0) {
      return NextResponse.json(
        { error: 'Todos los productos ya están en esta categoría' },
        { status: 400 }
      )
    }

    // Crear nuevas relaciones
    const newRelations = await Promise.all(
      newProductIds.map(productId =>
        db.productCategory.create({
          data: {
            categoryId,
            productId
          },
          include: {
            product: {
              include: {
                _count: {
                  select: { orderItems: true }
                }
              }
            }
          }
        })
      )
    )

    return NextResponse.json({
      message: `${newRelations.length} productos añadidos a la categoría`,
      added: newRelations
    })

  } catch (error) {
    console.error('Error adding products to category:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}