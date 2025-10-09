import { NextRequest, NextResponse } from 'next/server'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db } from '@/lib/db';
// GET: Obtener detalles de una suscripción específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subscriptionId: string }> }
) {
  try {
    
    const resolvedParams = await params;
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const subscription = await db.userSubscription.findFirst({
      where: {
        id: resolvedParams.subscriptionId,
        userId: session.user.id
      },
      include: {
        subscriptionPlan: {
          include: {
            subscriptionType: true
          }
        }
      }
    })

    if (!subscription) {
      return NextResponse.json(
        { error: 'Suscripción no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(subscription)
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json(
      { error: 'Error al obtener suscripción' },
      { status: 500 }
    )
  }
}

// PUT: Actualizar suscripción (cambiar plan, pausar, etc.)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ subscriptionId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { action, subscriptionPlanId, metadata } = await request.json()

    // Verificar que la suscripción pertenece al usuario
    const subscription = await db.userSubscription.findFirst({
      where: {
        id: resolvedParams.subscriptionId,
        userId: session.user.id
      },
      include: {
        subscriptionPlan: {
          include: {
            subscriptionType: true
          }
        }
      }
    })

    if (!subscription) {
      return NextResponse.json(
        { error: 'Suscripción no encontrada' },
        { status: 404 }
      )
    }

    let updateData: any = {}

    switch (action) {
      case 'pause':
        if (subscription.status !== 'ACTIVE') {
          return NextResponse.json(
            { error: 'Solo se pueden pausar suscripciones activas' },
            { status: 400 }
          )
        }
        updateData = {
          status: 'PAUSED',
          metadata: {
            ...subscription.metadata,
            pausedAt: new Date().toISOString(),
            ...metadata
          }
        }
        break

      case 'resume':
        if (subscription.status !== 'PAUSED') {
          return NextResponse.json(
            { error: 'Solo se pueden reanudar suscripciones pausadas' },
            { status: 400 }
          )
        }
        
        // Calcular nueva fecha de facturación
        const nextBillingDate = new Date()
        const billingCycle = subscription.metadata?.billingCycle || 'monthly'
        
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

        updateData = {
          status: 'ACTIVE',
          nextBillingDate,
          metadata: {
            ...subscription.metadata,
            resumedAt: new Date().toISOString(),
            pausedAt: null,
            ...metadata
          }
        }
        break

      case 'cancel':
        updateData = {
          status: 'CANCELLED',
          endsAt: new Date(),
          autoRenew: false,
          metadata: {
            ...subscription.metadata,
            cancelledAt: new Date().toISOString(),
            ...metadata
          }
        }
        break

      case 'change_plan':
        if (!subscriptionPlanId) {
          return NextResponse.json(
            { error: 'subscriptionPlanId es requerido para cambiar de plan' },
            { status: 400 }
          )
        }

        // Verificar que el nuevo plan existe y es del mismo tipo
        const newPlan = await db.subscriptionPlan.findUnique({
          where: { id: subscriptionPlanId },
          include: { subscriptionType: true }
        })

        if (!newPlan) {
          return NextResponse.json(
            { error: 'Plan no encontrado' },
            { status: 404 }
          )
        }

        if (newPlan.subscriptionTypeId !== subscription.subscriptionPlan.subscriptionTypeId) {
          return NextResponse.json(
            { error: 'No se puede cambiar a un plan de diferente tipo' },
            { status: 400 }
          )
        }

        updateData = {
          subscriptionPlanId,
          metadata: {
            ...subscription.metadata,
            planChangedAt: new Date().toISOString(),
            previousPlanId: subscription.subscriptionPlanId,
            ...metadata
          }
        }
        break

      default:
        return NextResponse.json(
          { error: 'Acción no válida' },
          { status: 400 }
        )
    }

    const updatedSubscription = await db.userSubscription.update({
      where: { id: resolvedParams.subscriptionId },
      data: updateData,
      include: {
        subscriptionPlan: {
          include: {
            subscriptionType: true
          }
        }
      }
    })

    return NextResponse.json(updatedSubscription)
  } catch (error) {
    console.error('Error updating subscription:', error)
    return NextResponse.json(
      { error: 'Error al actualizar suscripción' },
      { status: 500 }
    )
  }
}

// DELETE: Cancelar suscripción (equivalente a PUT con action: 'cancel')
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ subscriptionId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const subscription = await db.userSubscription.findFirst({
      where: {
        id: resolvedParams.subscriptionId,
        userId: session.user.id
      }
    })

    if (!subscription) {
      return NextResponse.json(
        { error: 'Suscripción no encontrada' },
        { status: 404 }
      )
    }

    const updatedSubscription = await db.userSubscription.update({
      where: { id: resolvedParams.subscriptionId },
      data: {
        status: 'CANCELLED',
        endsAt: new Date(),
        autoRenew: false,
        metadata: {
          ...subscription.metadata,
          cancelledAt: new Date().toISOString()
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

    return NextResponse.json(updatedSubscription)
  } catch (error) {
    console.error('Error cancelling subscription:', error)
    return NextResponse.json(
      { error: 'Error al cancelar suscripción' },
      { status: 500 }
    )
  }
}