import { NextRequest, NextResponse } from 'next/server'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db } from '@/lib/db';
// GET: Obtener todos los tipos de suscripción
export async function GET(request: NextRequest) {
  try {
    const subscriptionTypes = await db.subscriptionType.findMany({
      where: { isActive: true },
      include: {
        plans: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' }
        }
      },
      orderBy: { sortOrder: 'asc' }
    })

    return NextResponse.json(subscriptionTypes)
  } catch (error) {
    console.error('Error fetching subscription types:', error)
    return NextResponse.json(
      { error: 'Error al obtener tipos de suscripción' },
      { status: 500 }
    )
  }
}

// POST: Crear nuevo tipo de suscripción (solo admin)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { name, slug, description, isActive = true, sortOrder = 0 } = await request.json()

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Nombre y slug son requeridos' },
        { status: 400 }
      )
    }

    const subscriptionType = await db.subscriptionType.create({
      data: {
        name,
        slug,
        description,
        isActive,
        sortOrder
      }
    })

    return NextResponse.json(subscriptionType)
  } catch (error) {
    console.error('Error creating subscription type:', error)
    return NextResponse.json(
      { error: 'Error al crear tipo de suscripción' },
      { status: 500 }
    )
  }
}