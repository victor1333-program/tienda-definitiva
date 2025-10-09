import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const updateDeliverySchema = z.object({
  status: z.enum(['PENDING', 'PREPARING', 'READY', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED', 'FAILED', 'RETURNED']).optional(),
  trackingNumber: z.string().optional(),
  carrier: z.string().optional(),
  shippingCost: z.number().optional(),
  weight: z.number().optional(),
  preparedDate: z.string().datetime().optional(),
  shippedDate: z.string().datetime().optional(),
  deliveredDate: z.string().datetime().optional(),
  actualProducts: z.any().optional(),
  totalValue: z.number().optional(),
  customerRating: z.number().min(1).max(5).optional(),
  customerFeedback: z.string().optional(),
  nfcScanned: z.boolean().optional(),
  nfcScanDate: z.string().datetime().optional(),
  internalNotes: z.string().optional(),
  deliveryNotes: z.string().optional()
});

// GET /api/lovibox/deliveries/[id] - Obtener entrega específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    
    const resolvedParams = await params;
    const delivery = await db.loviBoxDelivery.findUnique({
      where: { id: resolvedParams.id },
      include: {
        subscription: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                image: true
              }
            },
            preferences: true
          }
        },
        template: {
          include: {
            products: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    images: true,
                    basePrice: true,
                    description: true
                  }
                }
              },
              orderBy: {
                displayOrder: 'asc'
              }
            }
          }
        }
      }
    });

    if (!delivery) {
      return NextResponse.json(
        { error: 'Entrega no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(delivery);

  } catch (error) {
    console.error('Error fetching delivery:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PATCH /api/lovibox/deliveries/[id] - Actualizar entrega
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const validatedData = updateDeliverySchema.parse(body);

    // Verificar que la entrega existe
    const existingDelivery = await db.loviBoxDelivery.findUnique({
      where: { id: resolvedParams.id },
      include: {
        subscription: {
          include: {
            customer: true
          }
        },
        template: true
      }
    });

    if (!existingDelivery) {
      return NextResponse.json(
        { error: 'Entrega no encontrada' },
        { status: 404 }
      );
    }

    const delivery = await db.loviBoxDelivery.update({
      where: { id: resolvedParams.id },
      data: {
        ...validatedData,
        preparedDate: validatedData.preparedDate ? new Date(validatedData.preparedDate) : undefined,
        shippedDate: validatedData.shippedDate ? new Date(validatedData.shippedDate) : undefined,
        deliveredDate: validatedData.deliveredDate ? new Date(validatedData.deliveredDate) : undefined,
        nfcScanDate: validatedData.nfcScanDate ? new Date(validatedData.nfcScanDate) : undefined
      },
      include: {
        subscription: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true
              }
            }
          }
        },
        template: {
          select: {
            id: true,
            name: true,
            level: true,
            theme: true
          }
        }
      }
    });

    // Crear notificación si cambió el estado
    if (validatedData.status && validatedData.status !== existingDelivery.status) {
      const statusMessages = {
        PENDING: 'pendiente',
        PREPARING: 'en preparación',
        READY: 'lista para envío',
        SHIPPED: 'enviada',
        IN_TRANSIT: 'en tránsito',
        DELIVERED: 'entregada',
        FAILED: 'falló',
        RETURNED: 'devuelta'
      };

      await db.notification.create({
        data: {
          type: 'SHIPPING_UPDATE',
          title: 'Estado de entrega actualizado',
          message: `Entrega para ${existingDelivery.subscription.customer.name || existingDelivery.subscription.customer.email} ${statusMessages[validatedData.status]}`,
          priority: validatedData.status === 'DELIVERED' ? 'HIGH' : 'MEDIUM',
          actionUrl: `/admin/lovibox/deliveries/${delivery.id}`,
          metadata: JSON.stringify({ 
            deliveryId: delivery.id,
            oldStatus: existingDelivery.status,
            newStatus: validatedData.status
          })
        }
      });

      // Si se entregó, actualizar métricas de la suscripción
      if (validatedData.status === 'DELIVERED') {
        await db.loviBoxSubscription.update({
          where: { id: existingDelivery.subscriptionId },
          data: {
            totalBoxesReceived: {
              increment: 1
            }
          }
        });
      }
    }

    return NextResponse.json(delivery);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating delivery:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/lovibox/deliveries/[id] - Cancelar entrega
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const existingDelivery = await db.loviBoxDelivery.findUnique({
      where: { id: resolvedParams.id },
      include: {
        subscription: {
          include: {
            customer: true
          }
        }
      }
    });

    if (!existingDelivery) {
      return NextResponse.json(
        { error: 'Entrega no encontrada' },
        { status: 404 }
      );
    }

    // Solo permitir cancelación si no está enviada o entregada
    if (['SHIPPED', 'IN_TRANSIT', 'DELIVERED'].includes(existingDelivery.status)) {
      return NextResponse.json(
        { error: 'No se puede cancelar una entrega que ya fue enviada o entregada' },
        { status: 400 }
      );
    }

    await db.loviBoxDelivery.delete({
      where: { id: resolvedParams.id }
    });

    // Crear notificación de cancelación
    await db.notification.create({
      data: {
        type: 'SHIPPING_UPDATE',
        title: 'Entrega cancelada',
        message: `Entrega para ${existingDelivery.subscription.customer.name || existingDelivery.subscription.customer.email} cancelada`,
        priority: 'MEDIUM',
        metadata: JSON.stringify({ deliveryId: resolvedParams.id })
      }
    });

    return NextResponse.json({ message: 'Entrega cancelada correctamente' });

  } catch (error) {
    console.error('Error canceling delivery:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}