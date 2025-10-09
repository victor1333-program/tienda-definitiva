import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    
    const resolvedParams = await params;
    const macroCategory = await prisma.personalizationImageMacroCategory.findUnique({
      where: { id: resolvedParams.id },
      include: {
        categories: {
          include: {
            _count: {
              select: { images: true }
            }
          },
          orderBy: { sortOrder: 'asc' }
        },
        _count: {
          select: { 
            images: true,
            categories: true 
          }
        }
      }
    })

    if (!macroCategory) {
      return NextResponse.json(
        { error: 'Macrocategoría no encontrada' },
        { status: 404 }
      )
    }

    const formattedMacroCategory = {
      id: macroCategory.id,
      slug: macroCategory.slug,
      name: macroCategory.name,
      description: macroCategory.description,
      icon: macroCategory.icon,
      sortOrder: macroCategory.sortOrder,
      isActive: macroCategory.isActive,
      createdAt: macroCategory.createdAt,
      updatedAt: macroCategory.updatedAt,
      totalImages: macroCategory._count.images,
      totalCategories: macroCategory._count.categories,
      categories: macroCategory.categories.map(cat => ({
        id: cat.id,
        slug: cat.slug,
        name: cat.name,
        description: cat.description,
        sortOrder: cat.sortOrder,
        isActive: cat.isActive,
        imageCount: cat._count.images
      }))
    }

    return NextResponse.json(formattedMacroCategory)
  } catch (error) {
    console.error('Error fetching macro category:', error)
    return NextResponse.json(
      { error: 'Error al obtener macrocategoría' },
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

    const body = await request.json()
    const { name, description, icon, sortOrder, isActive } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 })
    }

    // Crear nuevo slug si el nombre cambió
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim()

    // Verificar que no exista otra macrocategoría con el mismo slug
    const existingMacroCategory = await prisma.personalizationImageMacroCategory.findFirst({
      where: { 
        slug,
        NOT: { id: resolvedParams.id }
      }
    })

    if (existingMacroCategory) {
      return NextResponse.json(
        { error: 'Ya existe una macrocategoría con ese nombre' },
        { status: 400 }
      )
    }

    // Actualizar la macrocategoría
    const updatedMacroCategory = await prisma.personalizationImageMacroCategory.update({
      where: { id: resolvedParams.id },
      data: {
        slug,
        name: name.trim(),
        description: description?.trim() || null,
        icon: icon?.trim() || null,
        sortOrder: sortOrder || 0,
        isActive: isActive !== undefined ? isActive : true
      },
      include: {
        _count: {
          select: { 
            images: true,
            categories: true 
          }
        }
      }
    })

    return NextResponse.json({
      id: updatedMacroCategory.id,
      slug: updatedMacroCategory.slug,
      name: updatedMacroCategory.name,
      description: updatedMacroCategory.description,
      icon: updatedMacroCategory.icon,
      sortOrder: updatedMacroCategory.sortOrder,
      isActive: updatedMacroCategory.isActive,
      createdAt: updatedMacroCategory.createdAt,
      updatedAt: updatedMacroCategory.updatedAt,
      totalImages: updatedMacroCategory._count.images,
      totalCategories: updatedMacroCategory._count.categories
    })
  } catch (error) {
    console.error('Error updating macro category:', error)
    return NextResponse.json(
      { error: 'Error al actualizar macrocategoría' },
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
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar si la macrocategoría tiene imágenes o categorías
    const macroCategory = await prisma.personalizationImageMacroCategory.findUnique({
      where: { id: resolvedParams.id },
      include: {
        _count: {
          select: { 
            images: true,
            categories: true 
          }
        }
      }
    })

    if (!macroCategory) {
      return NextResponse.json(
        { error: 'Macrocategoría no encontrada' },
        { status: 404 }
      )
    }

    if (macroCategory._count.images > 0 || macroCategory._count.categories > 0) {
      return NextResponse.json(
        { 
          error: `No se puede eliminar la macrocategoría "${macroCategory.name}" porque contiene ${macroCategory._count.categories} categoría(s) y ${macroCategory._count.images} imagen(es)` 
        },
        { status: 400 }
      )
    }

    // Eliminar la macrocategoría
    await prisma.personalizationImageMacroCategory.delete({
      where: { id: resolvedParams.id }
    })

    return NextResponse.json({ message: 'Macrocategoría eliminada exitosamente' })
  } catch (error) {
    console.error('Error deleting macro category:', error)
    return NextResponse.json(
      { error: 'Error al eliminar macrocategoría' },
      { status: 500 }
    )
  }
}