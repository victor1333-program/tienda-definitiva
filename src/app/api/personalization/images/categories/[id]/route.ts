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

    // Verificar que la categoría existe
    const existingCategory = await prisma.personalizationImageCategory.findUnique({
      where: { category: categoryId }
    })

    if (!existingCategory) {
      return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 })
    }

    // Verificar que no hay imágenes usando esta categoría
    const imagesCount = await prisma.personalizationImage.count({
      where: { category: categoryId }
    })

    if (imagesCount > 0) {
      return NextResponse.json(
        { error: `No se puede eliminar la categoría porque tiene ${imagesCount} imagen(es) asociada(s)` },
        { status: 400 }
      )
    }

    // Eliminar la categoría
    await prisma.personalizationImageCategory.delete({
      where: { category: categoryId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting image category:', error)
    return NextResponse.json(
      { error: 'Error al eliminar categoría' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const categoryId = resolvedParams.id
    const body = await request.json()
    const { label } = body

    if (!label || !label.trim()) {
      return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 })
    }

    // Verificar que la categoría existe
    const existingCategory = await prisma.personalizationImageCategory.findUnique({
      where: { category: categoryId }
    })

    if (!existingCategory) {
      return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 })
    }

    // Actualizar la categoría
    const updatedCategory = await prisma.personalizationImageCategory.update({
      where: { category: categoryId },
      data: {
        label: label.trim()
      }
    })

    return NextResponse.json({
      category: updatedCategory.category,
      label: updatedCategory.label,
      isPredefined: false
    })
  } catch (error) {
    console.error('Error updating image category:', error)
    return NextResponse.json(
      { error: 'Error al actualizar categoría' },
      { status: 500 }
    )
  }
}