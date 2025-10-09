import { NextRequest, NextResponse } from 'next/server'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db } from '@/lib/db';
// GET: Obtener suscripciones del usuario autenticado
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const subscriptions = await db.userSubscription.findMany({
      where: { userId: session.user.id },
      include: {
        subscriptionPlan: {
          include: {
            subscriptionType: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(subscriptions)
  } catch (error) {
    console.error('Error fetching user subscriptions:', error)
    return NextResponse.json(
      { error: 'Error al obtener suscripciones del usuario' },
      { status: 500 }
    )
  }
}

// POST: Crear nueva suscripción para el usuario
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const {
      subscriptionPlanId,
      billingCycle = 'monthly',
      metadata = {}
    } = await request.json()

    if (!subscriptionPlanId) {
      return NextResponse.json(
        { error: 'subscriptionPlanId es requerido' },
        { status: 400 }
      )
    }

    // Verificar que el plan existe
    const plan = await db.subscriptionPlan.findUnique({
      where: { id: subscriptionPlanId },
      include: { subscriptionType: true }
    })

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan de suscripción no encontrado' },
        { status: 404 }
      )
    }

    // Verificar si el usuario ya tiene una suscripción activa del mismo tipo
    const existingSubscription = await db.userSubscription.findFirst({
      where: {
        userId: session.user.id,
        status: 'ACTIVE',
        subscriptionPlan: {
          subscriptionTypeId: plan.subscriptionTypeId
        }
      }
    })

    if (existingSubscription) {
      return NextResponse.json(
        { error: 'Ya tienes una suscripción activa de este tipo' },
        { status: 400 }
      )
    }

    // Calcular fechas
    const startDate = new Date()
    let nextBillingDate = new Date(startDate)
    
    switch (billingCycle) {
      case 'monthly':
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1)
        break
      case 'quarterly':
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 3)
        break
      case 'yearly':
        nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1)
        break
    }

    // Crear la suscripción
    const subscription = await db.userSubscription.create({
      data: {
        userId: session.user.id,
        subscriptionPlanId,
        status: 'ACTIVE',
        startsAt: startDate,
        nextBillingDate,
        autoRenew: true,
        metadata: {
          ...metadata,
          billingCycle,
          initialPrice: plan.price
        }
      },
      include: {
        subscriptionPlan: {
          include: {
            subscriptionType: true
          }
        }
      }
    })

    return NextResponse.json(subscription)
  } catch (error) {
    console.error('Error creating user subscription:', error)
    return NextResponse.json(
      { error: 'Error al crear suscripción' },
      { status: 500 }
    )
  }
}