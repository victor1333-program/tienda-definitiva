import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"

export async function GET() {
  try {
    const macroCategories = await prisma.personalizationImageMacroCategory.findMany({
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
      },
      orderBy: { sortOrder: 'asc' }
    })

    const formattedMacroCategories = macroCategories.map(macro => ({
      id: macro.id,
      slug: macro.slug,
      name: macro.name,
      description: macro.description,
      icon: macro.icon,
      sortOrder: macro.sortOrder,
      isActive: macro.isActive,
      createdAt: macro.createdAt,
      updatedAt: macro.updatedAt,
      totalImages: macro._count.images,
      totalCategories: macro._count.categories,
      categories: macro.categories.map(cat => ({
        id: cat.id,
        slug: cat.slug,
        name: cat.name,
        description: cat.description,
        sortOrder: cat.sortOrder,
        isActive: cat.isActive,
        imageCount: cat._count.images
      }))
    }))

    return NextResponse.json(formattedMacroCategories)
  } catch (error) {
    console.error('Error fetching macro categories:', error)
    return NextResponse.json(
      { error: 'Error al obtener macrocategorías' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, icon, sortOrder } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 })
    }

    // Crear slug para la macrocategoría
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim()

    // Verificar que no exista una macrocategoría con el mismo slug
    const existingMacroCategory = await prisma.personalizationImageMacroCategory.findUnique({
      where: { slug }
    })

    if (existingMacroCategory) {
      return NextResponse.json(
        { error: 'Ya existe una macrocategoría con ese nombre' },
        { status: 400 }
      )
    }

    // Crear la macrocategoría
    const newMacroCategory = await prisma.personalizationImageMacroCategory.create({
      data: {
        slug,
        name: name.trim(),
        description: description?.trim() || null,
        icon: icon?.trim() || null,
        sortOrder: sortOrder || 0
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
      id: newMacroCategory.id,
      slug: newMacroCategory.slug,
      name: newMacroCategory.name,
      description: newMacroCategory.description,
      icon: newMacroCategory.icon,
      sortOrder: newMacroCategory.sortOrder,
      isActive: newMacroCategory.isActive,
      createdAt: newMacroCategory.createdAt,
      updatedAt: newMacroCategory.updatedAt,
      totalImages: newMacroCategory._count.images,
      totalCategories: newMacroCategory._count.categories,
      categories: []
    })
  } catch (error) {
    console.error('Error creating macro category:', error)
    return NextResponse.json(
      { error: 'Error al crear macrocategoría' },
      { status: 500 }
    )
  }
}