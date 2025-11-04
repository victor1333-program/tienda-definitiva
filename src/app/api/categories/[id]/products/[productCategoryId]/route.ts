import { NextRequest, NextResponse } from 'next/server'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db } from '@/lib/db'

// Eliminar un producto de una categoría
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; productCategoryId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { productCategoryId } = params

    // Verificar que la relación existe
    const productCategory = await db.productCategory.findUnique({
      where: { id: productCategoryId },
      include: {
        category: true,
        product: true
      }
    })

    if (!productCategory) {
      return NextResponse.json(
        { error: 'Relación producto-categoría no encontrada' },
        { status: 404 }
      )
    }

    // Eliminar la relación
    await db.productCategory.delete({
      where: { id: productCategoryId }
    })

    return NextResponse.json({
      message: `Producto "${productCategory.product.name}" removido de la categoría "${productCategory.category.name}"`
    })

  } catch (error) {
    console.error('Error removing product from category:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}