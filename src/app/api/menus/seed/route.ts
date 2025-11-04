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

    // Verificar si ya existe un menú
    const existingMenu = await db.menu.findFirst({
      where: { location: 'HEADER' }
    })

    if (existingMenu) {
      return NextResponse.json({ 
        message: 'Ya existe un menú principal',
        menu: existingMenu
      })
    }

    // Obtener categorías activas para integrarlas automáticamente
    const categories = await db.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    })

    // Crear menú principal
    const menu = await db.menu.create({
      data: {
        name: 'Menú Principal',
        slug: 'main-menu',
        description: 'Menú principal del sitio web',
        location: 'HEADER',
        isActive: true,
        sortOrder: 0,
        maxDepth: 3,
        showOnMobile: true
      }
    })

    // Crear elementos del menú
    const menuItems = [
      // 1. Inicio
      {
        label: 'Inicio',
        linkType: 'HOME',
        target: 'SELF',
        sortOrder: 0,
        isActive: true,
        icon: 'Home'
      },
      // 2. Productos (con categorías como hijos)
      {
        label: 'Productos',
        linkType: 'PAGE',
        pageType: 'CATALOG',
        target: 'SELF',
        sortOrder: 1,
        isActive: true,
        icon: 'Package'
      },
      // 3. Personalizador
      {
        label: 'Personalizador',
        linkType: 'CUSTOMIZER',
        target: 'SELF',
        sortOrder: 2,
        isActive: true,
        icon: 'Palette',
        badge: 'Nuevo'
      },
      // 4. Contacto
      {
        label: 'Contacto',
        linkType: 'PAGE',
        pageType: 'CONTACT',
        target: 'SELF',
        sortOrder: 3,
        isActive: true,
        icon: 'Mail'
      }
    ]

    // Crear elementos principales
    const createdItems = []
    for (const item of menuItems) {
      const createdItem = await db.menuItem.create({
        data: {
          ...item,
          menuId: menu.id
        }
      })
      createdItems.push(createdItem)
    }

    // Encontrar el elemento "Productos" para añadir categorías como hijos
    const productosItem = createdItems.find(item => item.label === 'Productos')
    
    if (productosItem) {
      // Crear subelementos para cada categoría
      for (let i = 0; i < categories.length; i++) {
        const category = categories[i]
        await db.menuItem.create({
          data: {
            menuId: menu.id,
            parentId: productosItem.id,
            label: category.name,
            linkType: 'CATEGORY',
            categoryId: category.id,
            target: 'SELF',
            sortOrder: i,
            isActive: true,
            icon: category.icon || 'Package'
          }
        })
      }
    }

    // Obtener el menú completo con sus elementos
    const completeMenu = await db.menu.findUnique({
      where: { id: menu.id },
      include: {
        items: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            },
            children: {
              include: {
                category: {
                  select: {
                    id: true,
                    name: true,
                    slug: true
                  }
                }
              },
              orderBy: { sortOrder: 'asc' }
            }
          },
          orderBy: { sortOrder: 'asc' }
        }
      }
    })

    return NextResponse.json({
      message: 'Menú principal creado exitosamente',
      menu: completeMenu
    })

  } catch (error) {
    console.error('Error creating seed menu:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}