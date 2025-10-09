import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const updateSubscriptionSchema = z.object({
  level: z.enum(['BASIC', 'PREMIUM', 'VIP']).optional(),
  frequency: z.enum(['WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY']).optional(),
  status: z.enum(['ACTIVE', 'PAUSED', 'CANCELED', 'EXPIRED', 'PENDING_PAYMENT', 'PENDING_ACTIVATION']).optional(),
  monthlyPrice: z.number().positive().optional(),
  shippingAddress: z.object({
    name: z.string().min(1),
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().default('ES')
  }).optional(),
  specialInstructions: z.string().optional(),
  pausedUntil: z.string().datetime().optional()
});

// GET /api/lovibox/subscriptions/[id] - Obtener suscripción específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const subscription = await db.loviBoxSubscription.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
            createdAt: true
          }
        },
        preferences: true,
        deliveries: {
          orderBy: {
            scheduledDate: 'desc'
          },
          include: {
            template: {
              select: {
                id: true,
                name: true,
                theme: true,
                image: true
              }
            }
          }
        },
        payments: {
          orderBy: {
            billingDate: 'desc'
          },
          take: 10
        },
        _count: {
          select: {
            deliveries: true,
            payments: true
          }
        }
      }
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'Suscripción no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(subscription);

  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PATCH /api/lovibox/subscriptions/[id] - Actualizar suscripción
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateSubscriptionSchema.parse(body);

    // Verificar que la suscripción existe
    const existingSubscription = await db.loviBoxSubscription.findUnique({
      where: { id },
      include: { customer: true }
    });

    if (!existingSubscription) {
      return NextResponse.json(
        { error: 'Suscripción no encontrada' },
        { status: 404 }
      );
    }

    // Calcular nueva fecha de facturación si cambió la frecuencia
    let nextBillingDate = existingSubscription.nextBillingDate;
    if (validatedData.frequency && validatedData.frequency !== existingSubscription.frequency) {
      nextBillingDate = new Date();
      switch (validatedData.frequency) {
        case 'WEEKLY':
          nextBillingDate.setDate(nextBillingDate.getDate() + 7);
          break;
        case 'BIWEEKLY':
          nextBillingDate.setDate(nextBillingDate.getDate() + 14);
          break;
        case 'MONTHLY':
          nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
          break;
        case 'QUARTERLY':
          nextBillingDate.setMonth(nextBillingDate.getMonth() + 3);
          break;
      }
    }

    const subscription = await db.loviBoxSubscription.update({
      where: { id },
      data: {
        ...validatedData,
        nextBillingDate,
        pausedUntil: validatedData.pausedUntil ? new Date(validatedData.pausedUntil) : undefined
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        preferences: true
      }
    });

    // Crear notificación de cambio
    if (validatedData.status && validatedData.status !== existingSubscription.status) {
      const statusMessages = {
        ACTIVE: 'reactivada',
        PAUSED: 'pausada',
        CANCELED: 'cancelada',
        EXPIRED: 'expirada',
        PENDING_PAYMENT: 'pendiente de pago',
        PENDING_ACTIVATION: 'pendiente de activación'
      };

      await db.notification.create({
        data: {
          type: 'ORDER_STATUS_CHANGE',
          title: 'Suscripción actualizada',
          message: `Suscripción de ${existingSubscription.customer.name || existingSubscription.customer.email} ${statusMessages[validatedData.status]}`,
          priority: 'MEDIUM',
          actionUrl: `/admin/lovibox/subscriptions/${subscription.id}`,
          metadata: JSON.stringify({ 
            subscriptionId: subscription.id,
            oldStatus: existingSubscription.status,
            newStatus: validatedData.status
          })
        }
      });
    }

    return NextResponse.json(subscription);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating subscription:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/lovibox/subscriptions/[id] - Cancelar suscripción
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Verificar que la suscripción existe
    const existingSubscription = await db.loviBoxSubscription.findUnique({
      where: { id },
      include: { customer: true }
    });

    if (!existingSubscription) {
      return NextResponse.json(
        { error: 'Suscripción no encontrada' },
        { status: 404 }
      );
    }

    // No eliminar físicamente, solo marcar como cancelada
    const subscription = await db.loviBoxSubscription.update({
      where: { id },
      data: {
        status: 'CANCELED',
        endDate: new Date()
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Crear notificación de cancelación
    await db.notification.create({
      data: {
        type: 'ORDER_STATUS_CHANGE',
        title: 'Suscripción cancelada',
        message: `Suscripción de ${existingSubscription.customer.name || existingSubscription.customer.email} cancelada`,
        priority: 'HIGH',
        actionUrl: `/admin/lovibox/subscriptions/${subscription.id}`,
        metadata: JSON.stringify({ subscriptionId: subscription.id })
      }
    });

    return NextResponse.json(subscription);

  } catch (error) {
    console.error('Error canceling subscription:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}