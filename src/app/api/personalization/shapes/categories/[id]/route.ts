import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    
    const resolvedParams = await params;
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const categoryId = resolvedParams.id

    // Verificar si la categoría tiene formas asociadas (excluyendo placeholders)
    const shapesCount = await prisma.personalizationShape.count({
      where: { 
        category: categoryId,
        NOT: {
          name: {
            startsWith: '__categoria_placeholder_'
          }
        }
      }
    })

    if (shapesCount > 0) {
      return NextResponse.json(
        { error: `No se puede eliminar la categoría porque contiene ${shapesCount} forma(s)` },
        { status: 400 }
      )
    }

    // Verificar que no sea una categoría predefinida
    const predefinedCategories = ['geometricas', 'decorativas', 'letras', 'marcos', 'naturaleza', 'general']
    if (predefinedCategories.includes(categoryId)) {
      return NextResponse.json(
        { error: 'No se pueden eliminar las categorías predefinidas' },
        { status: 400 }
      )
    }

    // Eliminar el placeholder de la categoría si existe
    try {
      await prisma.personalizationShape.deleteMany({
        where: {
          category: categoryId,
          name: {
            startsWith: '__categoria_placeholder_'
          }
        }
      })
    } catch (error) {
      console.error('Error deleting category placeholder:', error)
      // No fallar si no se puede eliminar el placeholder
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: 'Error al eliminar categoría' },
      { status: 500 }
    )
  }
}