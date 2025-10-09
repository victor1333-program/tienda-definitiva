import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const macroCategoryId = searchParams.get('macroCategoryId')

    const whereClause = macroCategoryId ? { macroCategoryId } : {}

    const categories = await prisma.personalizationImageCategory.findMany({
      where: whereClause,
      include: {
        macroCategory: true,
        _count: {
          select: { images: true }
        }
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    })

    const formattedCategories = categories.map(cat => ({
      id: cat.id,
      slug: cat.slug,
      name: cat.name,
      description: cat.description,
      macroCategoryId: cat.macroCategoryId,
      macroCategory: cat.macroCategory ? {
        id: cat.macroCategory.id,
        slug: cat.macroCategory.slug,
        name: cat.macroCategory.name
      } : null,
      sortOrder: cat.sortOrder,
      isActive: cat.isActive,
      imageCount: cat._count.images,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt
    }))

    return NextResponse.json(formattedCategories)
  } catch (error) {
    console.error('Error fetching image categories:', error)
    return NextResponse.json(
      { error: 'Error al obtener categorías' },
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
    const { name, description, macroCategoryId, sortOrder } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 })
    }

    // Crear slug para la categoría
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim()

    // Verificar que no exista una categoría con el mismo slug
    const existingCategory = await prisma.personalizationImageCategory.findUnique({
      where: { slug }
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Ya existe una categoría con ese nombre' },
        { status: 400 }
      )
    }

    // Verificar que la macrocategoría existe si se proporciona
    if (macroCategoryId) {
      const macroCategory = await prisma.personalizationImageMacroCategory.findUnique({
        where: { id: macroCategoryId }
      })

      if (!macroCategory) {
        return NextResponse.json(
          { error: 'Macrocategoría no encontrada' },
          { status: 400 }
        )
      }
    }

    // Crear la categoría
    const newCategory = await prisma.personalizationImageCategory.create({
      data: {
        slug,
        name: name.trim(),
        description: description?.trim() || null,
        macroCategoryId: macroCategoryId || null,
        sortOrder: sortOrder || 0
      },
      include: {
        macroCategory: true,
        _count: {
          select: { images: true }
        }
      }
    })

    return NextResponse.json({
      id: newCategory.id,
      slug: newCategory.slug,
      name: newCategory.name,
      description: newCategory.description,
      macroCategoryId: newCategory.macroCategoryId,
      macroCategory: newCategory.macroCategory ? {
        id: newCategory.macroCategory.id,
        slug: newCategory.macroCategory.slug,
        name: newCategory.macroCategory.name
      } : null,
      sortOrder: newCategory.sortOrder,
      isActive: newCategory.isActive,
      imageCount: newCategory._count.images,
      createdAt: newCategory.createdAt,
      updatedAt: newCategory.updatedAt
    })
  } catch (error) {
    console.error('Error creating image category:', error)
    return NextResponse.json(
      { error: 'Error al crear categoría' },
      { status: 500 }
    )
  }
}