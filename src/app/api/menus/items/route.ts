import { NextRequest, NextResponse } from 'next/server'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const data = await request.json()

    // Validar que la categoría existe si se proporciona categoryId
    if (data.categoryId) {
      const categoryExists = await db.category.findUnique({
        where: { id: data.categoryId }
      })
      if (!categoryExists) {
        return NextResponse.json({ error: 'La categoría especificada no existe' }, { status: 400 })
      }
    }

    // Validar que el producto existe si se proporciona productId
    if (data.productId) {
      const productExists = await db.product.findUnique({
        where: { id: data.productId }
      })
      if (!productExists) {
        return NextResponse.json({ error: 'El producto especificado no existe' }, { status: 400 })
      }
    }

    const menuItem = await db.menuItem.create({
      data: {
        menuId: data.menuId,
        label: data.label,
        url: data.url,
        target: data.target || 'SELF',
        linkType: data.linkType,
        categoryId: data.categoryId || null,
        productId: data.productId || null,
        pageType: data.pageType,
        parentId: data.parentId || null,
        sortOrder: data.sortOrder || 0,
        isActive: data.isActive ?? true,
        cssClass: data.cssClass || null,
        icon: data.icon || null,
        badge: data.badge || null,
        title: data.title || null,
        description: data.description || null
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        product: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    })

    return NextResponse.json(menuItem)
  } catch (error) {
    console.error('Error creating menu item:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const data = await request.json()

    if (data.type === 'reorder') {
      // Reordenar múltiples items
      const updates = data.items.map((item: any, index: number) => 
        db.menuItem.update({
          where: { id: item.id },
          data: { 
            sortOrder: index,
            parentId: item.parentId || null
          }
        })
      )

      await db.$transaction(updates)

      return NextResponse.json({ success: true })
    } else {
      // Actualizar un solo item
      const { id, ...updateData } = data

      const menuItem = await db.menuItem.update({
        where: { id },
        data: updateData,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          },
          product: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        }
      })

      return NextResponse.json(menuItem)
    }
  } catch (error) {
    console.error('Error updating menu item:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }

    await db.menuItem.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting menu item:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}