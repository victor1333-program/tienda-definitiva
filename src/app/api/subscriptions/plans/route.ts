import { NextRequest, NextResponse } from 'next/server'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db } from '@/lib/db'

// GET: Obtener planes de suscripción
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const typeId = searchParams.get('typeId')
    const typeSlug = searchParams.get('typeSlug')

    let where: any = { isActive: true }

    if (typeId) {
      where.subscriptionTypeId = typeId
    } else if (typeSlug) {
      where.subscriptionType = { slug: typeSlug }
    }

    const plans = await db.subscriptionPlan.findMany({
      where,
      include: {
        subscriptionType: true,
        _count: {
          select: {
            userSubscriptions: {
              where: { status: 'ACTIVE' }
            }
          }
        }
      },
      orderBy: [
        { subscriptionType: { sortOrder: 'asc' } },
        { sortOrder: 'asc' }
      ]
    })

    return NextResponse.json(plans)
  } catch (error) {
    console.error('Error fetching subscription plans:', error)
    return NextResponse.json(
      { error: 'Error al obtener planes de suscripción' },
      { status: 500 }
    )
  }
}

// POST: Crear nuevo plan de suscripción (solo admin)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const {
      subscriptionTypeId,
      name,
      slug,
      description,
      price,
      billingCycle,
      features,
      limits,
      isActive = true,
      sortOrder = 0
    } = await request.json()

    if (!subscriptionTypeId || !name || !slug || !price || !billingCycle) {
      return NextResponse.json(
        { error: 'Campos requeridos: subscriptionTypeId, name, slug, price, billingCycle' },
        { status: 400 }
      )
    }

    const plan = await db.subscriptionPlan.create({
      data: {
        subscriptionTypeId,
        name,
        slug,
        description,
        price,
        billingCycle,
        features: features || {},
        limits: limits || {},
        isActive,
        sortOrder
      },
      include: {
        subscriptionType: true
      }
    })

    return NextResponse.json(plan)
  } catch (error) {
    console.error('Error creating subscription plan:', error)
    return NextResponse.json(
      { error: 'Error al crear plan de suscripción' },
      { status: 500 }
    )
  }
}