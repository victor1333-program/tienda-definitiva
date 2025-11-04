import { NextRequest, NextResponse } from 'next/server'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const userRole = (session?.user as any)?.role
    if (!session?.user || (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar si ya existen las categorías del sistema
    const existingSystemCategories = await db.category.findMany({
      where: { isSystem: true }
    })

    if (existingSystemCategories.length > 0) {
      return NextResponse.json({ 
        message: 'Las categorías del sistema ya existen',
        categories: existingSystemCategories
      })
    }

    // Crear categorías del sistema
    const systemCategories = [
      {
        name: 'Productos Destacados',
        slug: 'productos-destacados',
        description: 'Nuestra selección de productos más especiales y recomendados',
        icon: 'Star',
        isSystem: true,
        categoryType: 'FEATURED',
        isActive: true,
        sortOrder: -2 // Para que aparezcan al principio
      },
      {
        name: 'Top Ventas',
        slug: 'top-ventas',
        description: 'Los productos más vendidos y populares entre nuestros clientes',
        icon: 'TrendingUp',
        isSystem: true,
        categoryType: 'TOP_SALES',
        isActive: true,
        sortOrder: -1 // Para que aparezcan al principio
      }
    ]

    const createdCategories = []
    for (const category of systemCategories) {
      const created = await db.category.create({
        data: category
      })
      createdCategories.push(created)
    }

    return NextResponse.json({
      message: 'Categorías del sistema creadas exitosamente',
      categories: createdCategories
    })

  } catch (error) {
    console.error('Error creating system categories:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}