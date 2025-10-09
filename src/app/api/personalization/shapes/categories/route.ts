import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"

export async function GET(request: NextRequest) {
  try {
    // Obtener categorías únicas de las formas existentes (excluyendo placeholders)
    const categories = await prisma.personalizationShape.groupBy({
      by: ['category'],
      _count: {
        id: true
      },
      where: {
        NOT: {
          name: {
            startsWith: '__categoria_placeholder_'
          }
        }
      },
      orderBy: {
        category: 'asc'
      }
    })

    // Agregar categorías predefinidas si no existen
    const predefinedCategories = [
      { category: 'geometricas', label: 'Geométricas', _count: { id: 0 } },
      { category: 'decorativas', label: 'Decorativas', _count: { id: 0 } },
      { category: 'letras', label: 'Letras', _count: { id: 0 } },
      { category: 'marcos', label: 'Marcos', _count: { id: 0 } },
      { category: 'naturaleza', label: 'Naturaleza', _count: { id: 0 } },
      { category: 'general', label: 'General', _count: { id: 0 } }
    ]

    // Obtener todas las categorías que existen (incluyendo placeholders) para mostrar en la lista
    const allExistingCategories = await prisma.personalizationShape.groupBy({
      by: ['category'],
      orderBy: {
        category: 'asc'
      }
    })

    const categoryMap = new Map(categories.map(cat => [cat.category, cat._count.id]))
    
    const allCategories = predefinedCategories.map(predefined => ({
      category: predefined.category,
      label: predefined.label,
      count: categoryMap.get(predefined.category) || 0,
      isPredefined: true
    }))

    // Agregar categorías personalizadas que no están predefinidas
    allExistingCategories.forEach(cat => {
      if (!predefinedCategories.some(pred => pred.category === cat.category)) {
        allCategories.push({
          category: cat.category,
          label: cat.category.charAt(0).toUpperCase() + cat.category.slice(1).replace(/_/g, ' '),
          count: categoryMap.get(cat.category) || 0,
          isPredefined: false
        })
      }
    })

    return NextResponse.json(allCategories)
  } catch (error) {
    console.error('Error fetching shape categories:', error)
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
    const { name } = body

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Nombre de categoría requerido' }, { status: 400 })
    }

    // Convertir a formato slug (lowercase, sin espacios)
    const categorySlug = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')

    // Verificar si ya existe
    const existingCategory = await prisma.personalizationShape.findFirst({
      where: { category: categorySlug }
    })

    if (existingCategory) {
      return NextResponse.json({ error: 'La categoría ya existe' }, { status: 400 })
    }

    // Crear una forma placeholder para persistir la categoría
    // Esta forma será invisible/inactiva pero permitirá que la categoría persista
    await prisma.personalizationShape.create({
      data: {
        name: `__categoria_placeholder_${categorySlug}`,
        category: categorySlug,
        fileUrl: '/images/placeholder-category.jpg', // Archivo placeholder
        isMask: false,
        tags: ['__placeholder__'],
        isFromLibrary: false,
        isActive: false, // Inactiva para que no aparezca en las formas disponibles
        fileType: 'image/jpeg',
        fileSize: 0
      }
    })

    return NextResponse.json({ 
      category: categorySlug, 
      label: name,
      count: 0,
      isPredefined: false
    })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Error al crear categoría' },
      { status: 500 }
    )
  }
}