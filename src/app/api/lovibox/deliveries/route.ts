import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const createDeliverySchema = z.object({
  subscriptionId: z.string().min(1, 'ID de suscripción requerido'),
  templateId: z.string().min(1, 'ID de template requerido'),
  scheduledDate: z.string().datetime('Fecha programada requerida'),
  shippingAddress: z.object({
    name: z.string().min(1),
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().default('ES')
  }),
  actualProducts: z.any().optional(),
  totalValue: z.number().positive().default(0),
  internalNotes: z.string().optional(),
  deliveryNotes: z.string().optional()
});

const bulkCreateSchema = z.object({
  templateId: z.string().min(1, 'ID de template requerido'),
  scheduledDate: z.string().datetime('Fecha programada requerida'),
  subscriptionIds: z.array(z.string()).min(1, 'Al menos una suscripción requerida'),
  carrier: z.string().optional(),
  internalNotes: z.string().optional()
});

// GET /api/lovibox/deliveries - Listar entregas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const status = searchParams.get('status');
    const templateId = searchParams.get('templateId');
    const subscriptionId = searchParams.get('subscriptionId');
    const search = searchParams.get('search');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (templateId) {
      where.templateId = templateId;
    }

    if (subscriptionId) {
      where.subscriptionId = subscriptionId;
    }

    if (dateFrom || dateTo) {
      where.scheduledDate = {};
      if (dateFrom) {
        where.scheduledDate.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.scheduledDate.lte = new Date(dateTo);
      }
    }

    if (search) {
      where.OR = [
        {
          trackingNumber: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          subscription: {
            customer: {
              email: {
                contains: search,
                mode: 'insensitive'
              }
            }
          }
        },
        {
          subscription: {
            customer: {
              name: {
                contains: search,
                mode: 'insensitive'
              }
            }
          }
        }
      ];
    }

    const [deliveries, total] = await Promise.all([
      db.loviBoxDelivery.findMany({
        where,
        skip,
        take: limit,
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
              theme: true,
              image: true
            }
          }
        },
        orderBy: {
          scheduledDate: 'desc'
        }
      }),
      db.loviBoxDelivery.count({ where })
    ]);

    return NextResponse.json({
      deliveries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching deliveries:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/lovibox/deliveries - Crear nueva entrega
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Verificar si es creación masiva
    if (body.subscriptionIds && Array.isArray(body.subscriptionIds)) {
      return await handleBulkCreate(body);
    }
    
    const validatedData = createDeliverySchema.parse(body);

    // Verificar que la suscripción y template existen
    const [subscription, template] = await Promise.all([
      db.loviBoxSubscription.findUnique({
        where: { id: validatedData.subscriptionId },
        include: { customer: true }
      }),
      db.loviBoxTemplate.findUnique({
        where: { id: validatedData.templateId }
      })
    ]);

    if (!subscription) {
      return NextResponse.json(
        { error: 'Suscripción no encontrada' },
        { status: 404 }
      );
    }

    if (!template) {
      return NextResponse.json(
        { error: 'Template no encontrado' },
        { status: 404 }
      );
    }

    const delivery = await db.loviBoxDelivery.create({
      data: {
        subscriptionId: validatedData.subscriptionId,
        templateId: validatedData.templateId,
        scheduledDate: new Date(validatedData.scheduledDate),
        shippingAddress: validatedData.shippingAddress,
        actualProducts: validatedData.actualProducts,
        totalValue: validatedData.totalValue,
        internalNotes: validatedData.internalNotes,
        deliveryNotes: validatedData.deliveryNotes
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
            theme: true,
            image: true
          }
        }
      }
    });

    return NextResponse.json(delivery, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating delivery:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Función auxiliar para creación masiva
async function handleBulkCreate(body: any) {
  try {
    const validatedData = bulkCreateSchema.parse(body);

    // Verificar que el template existe
    const template = await db.loviBoxTemplate.findUnique({
      where: { id: validatedData.templateId }
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que todas las suscripciones existen
    const subscriptions = await db.loviBoxSubscription.findMany({
      where: {
        id: { in: validatedData.subscriptionIds },
        status: 'ACTIVE'
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

    if (subscriptions.length !== validatedData.subscriptionIds.length) {
      const foundIds = subscriptions.map(s => s.id);
      const missingIds = validatedData.subscriptionIds.filter(id => !foundIds.includes(id));
      return NextResponse.json(
        { error: `Suscripciones no encontradas o inactivas: ${missingIds.join(', ')}` },
        { status: 400 }
      );
    }

    // Crear entregas en lote
    const deliveries = await Promise.all(
      subscriptions.map(subscription => 
        db.loviBoxDelivery.create({
          data: {
            subscriptionId: subscription.id,
            templateId: validatedData.templateId,
            scheduledDate: new Date(validatedData.scheduledDate),
            shippingAddress: subscription.shippingAddress,
            carrier: validatedData.carrier,
            internalNotes: validatedData.internalNotes,
            totalValue: template.basicPrice // Valor por defecto, se puede ajustar
          },
          include: {
            subscription: {
              include: {
                customer: {
                  select: {
                    id: true,
                    name: true,
                    email: true
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
        })
      )
    );

    // Crear notificación
    await db.notification.create({
      data: {
        type: 'SYSTEM_ALERT',
        title: 'Entregas creadas masivamente',
        message: `${deliveries.length} entregas programadas para ${template.name}`,
        priority: 'MEDIUM',
        actionUrl: `/admin/lovibox/deliveries?templateId=${template.id}`,
        metadata: JSON.stringify({ 
          templateId: template.id,
          deliveryCount: deliveries.length
        })
      }
    });

    return NextResponse.json({
      message: `${deliveries.length} entregas creadas correctamente`,
      deliveries
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error in bulk delivery creation:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}