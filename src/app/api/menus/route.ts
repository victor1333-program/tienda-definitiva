import { NextRequest, NextResponse } from 'next/server'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const location = searchParams.get('location') || 'HEADER'
    const includeInactive = searchParams.get('includeInactive') === 'true'

    const menus = await db.menu.findMany({
      where: {
        location: location as any,
        ...(includeInactive ? {} : { isActive: true })
      },
      include: {
        items: {
          where: includeInactive ? {} : { isActive: true },
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
            },
            children: {
              where: includeInactive ? {} : { isActive: true },
              orderBy: { sortOrder: 'asc' },
              include: {
                category: {
                  select: {
                    id: true,
                    name: true,
                    slug: true
                  }
                },
                children: {
                  where: includeInactive ? {} : { isActive: true },
                  orderBy: { sortOrder: 'asc' },
                  include: {
                    category: {
                      select: {
                        id: true,
                        name: true,
                        slug: true
                      }
                    }
                  }
                }
              }
            }
          },
          orderBy: { sortOrder: 'asc' }
        }
      },
      orderBy: { sortOrder: 'asc' }
    })

    return NextResponse.json(menus)
  } catch (error) {
    console.error('Error fetching menus:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const data = await request.json()

    const menu = await db.menu.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        location: data.location || 'HEADER',
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder || 0,
        maxDepth: data.maxDepth || 3,
        showOnMobile: data.showOnMobile ?? true
      }
    })

    return NextResponse.json(menu)
  } catch (error) {
    console.error('Error creating menu:', error)
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
    const { id, ...updateData } = data

    const menu = await db.menu.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(menu)
  } catch (error) {
    console.error('Error updating menu:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}