import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/auth"
import { db as prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Data log removed
    
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No hay sesión activa' },
        { status: 401 }
      )
    }
    
    if (!['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      // User log removed
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }
    
    // Authentication log removed

    // Obtener productos personalizables
    const products = await prisma.product.findMany({
      where: {
        isPersonalizable: true,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        slug: true,
        basePrice: true,
        isPersonalizable: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    // Obtener plantillas Zakeke
    const templates = await prisma.zakekeTemplate.findMany({
      where: {
        isActive: true,
        isPublic: true
      },
      select: {
        id: true,
        name: true,
        category: true,
        thumbnailUrl: true,
        templateData: true,
        productTypes: true
      },
      orderBy: [
        { usageCount: 'desc' },
        { name: 'asc' }
      ]
    })

    // Obtener categorías
    const categories = await prisma.category.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        name: true,
        slug: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    // Data log removed
    return NextResponse.json({
      success: true,
      data: {
        products,
        templates,
        categories
      }
    })
  } catch (error) {
    console.error('Error fetching form data:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}