import { NextRequest, NextResponse } from 'next/server'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db } from '@/lib/db'

// Agregar producto a categoría
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const session = await auth()
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes((session.user as any).role)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { categorySlug, categoryId } = await request.json()
    const productId = id

    let category
    if (categoryId) {
      // Buscar por ID directamente
      category = await db.category.findUnique({
        where: { id: categoryId }
      })
    } else if (categorySlug) {
      // Buscar por slug (compatibilidad hacia atrás)
      category = await db.category.findUnique({
        where: { slug: categorySlug }
      })
    } else {
      return NextResponse.json({ error: 'Se requiere categoryId o categorySlug' }, { status: 400 })
    }

    if (!category) {
      return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 })
    }

    // Verificar si el producto existe
    const product = await db.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    // Verificar si la relación ya existe
    const existingRelation = await db.productCategory.findUnique({
      where: {
        productId_categoryId: {
          productId,
          categoryId: category.id
        }
      }
    })

    if (existingRelation) {
      return NextResponse.json({ 
        message: 'El producto ya está en esta categoría',
        relation: existingRelation 
      })
    }

    // Crear la relación
    const relation = await db.productCategory.create({
      data: {
        productId,
        categoryId: category.id,
        sortOrder: 0
      }
    })

    return NextResponse.json({
      message: `Producto agregado a la categoría ${category.name}`,
      relation
    })

  } catch (error) {
    console.error('Error adding product to category:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Remover producto de categoría
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes((session.user as any).role)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const productId = id
    const body = await request.json().catch(() => ({}))
    const { categorySlug, categoryId } = body

    // Si no se proporciona ni categoryId ni categorySlug, eliminar todas las categorías
    if (!categorySlug && !categoryId) {
      const deletedRelations = await db.productCategory.deleteMany({
        where: { productId }
      })

      return NextResponse.json({
        message: `Todas las categorías removidas del producto`,
        deletedCount: deletedRelations.count
      })
    }

    let category
    if (categoryId) {
      // Buscar por ID directamente
      category = await db.category.findUnique({
        where: { id: categoryId }
      })
    } else if (categorySlug) {
      // Buscar por slug (compatibilidad hacia atrás)
      category = await db.category.findUnique({
        where: { slug: categorySlug }
      })
    }

    if (!category) {
      return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 })
    }

    // Eliminar la relación si existe
    const deletedRelation = await db.productCategory.deleteMany({
      where: {
        productId,
        categoryId: category.id
      }
    })

    if (deletedRelation.count === 0) {
      return NextResponse.json({ 
        message: 'El producto no estaba en esta categoría' 
      })
    }

    return NextResponse.json({
      message: `Producto removido de la categoría ${category.name}`,
      deletedCount: deletedRelation.count
    })

  } catch (error) {
    console.error('Error removing product from category:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}