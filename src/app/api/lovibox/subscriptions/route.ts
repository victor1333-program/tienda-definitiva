import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const createSubscriptionSchema = z.object({
  customerId: z.string().min(1, 'ID de cliente requerido'),
  level: z.enum(['BASIC', 'PREMIUM', 'VIP']),
  frequency: z.enum(['WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY']).default('MONTHLY'),
  monthlyPrice: z.number().positive('El precio debe ser positivo'),
  shippingAddress: z.object({
    name: z.string().min(1, 'Nombre requerido'),
    street: z.string().min(1, 'Dirección requerida'),
    city: z.string().min(1, 'Ciudad requerida'),
    state: z.string().min(1, 'Provincia requerida'),
    postalCode: z.string().min(1, 'Código postal requerido'),
    country: z.string().default('ES')
  }),
  specialInstructions: z.string().optional(),
  startDate: z.string().datetime().optional(),
  preferences: z.object({
    preferredColors: z.array(z.string()).default([]),
    avoidColors: z.array(z.string()).default([]),
    productAllergies: z.array(z.string()).default([]),
    favoriteThemes: z.array(z.string()).default([]),
    avoidThemes: z.array(z.string()).default([]),
    includePersonalization: z.boolean().default(true),
    maxPersonalizationCost: z.number().optional(),
    notes: z.string().optional()
  }).optional()
});

// GET /api/lovibox/subscriptions - Listar suscripciones
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const level = searchParams.get('level');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    const where: any = {};

    if (level) {
      where.level = level;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        {
          customer: {
            email: {
              contains: search,
              mode: 'insensitive'
            }
          }
        },
        {
          customer: {
            name: {
              contains: search,
              mode: 'insensitive'
            }
          }
        }
      ];
    }

    const [subscriptions, total] = await Promise.all([
      db.loviBoxSubscription.findMany({
        where,
        skip,
        take: limit,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          },
          preferences: true,
          deliveries: {
            take: 3,
            orderBy: {
              scheduledDate: 'desc'
            },
            select: {
              id: true,
              status: true,
              scheduledDate: true,
              deliveredDate: true
            }
          },
          _count: {
            select: {
              deliveries: true,
              payments: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      db.loviBoxSubscription.count({ where })
    ]);

    return NextResponse.json({
      subscriptions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/lovibox/subscriptions - Crear nueva suscripción
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createSubscriptionSchema.parse(body);

    // Verificar que el cliente existe
    const customer = await db.user.findUnique({
      where: { id: validatedData.customerId }
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      );
    }

    // Calcular siguiente fecha de facturación
    const startDate = validatedData.startDate ? new Date(validatedData.startDate) : new Date();
    const nextBillingDate = new Date(startDate);
    
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

    const subscription = await db.loviBoxSubscription.create({
      data: {
        customerId: validatedData.customerId,
        level: validatedData.level,
        frequency: validatedData.frequency,
        monthlyPrice: validatedData.monthlyPrice,
        startDate,
        nextBillingDate,
        shippingAddress: validatedData.shippingAddress,
        specialInstructions: validatedData.specialInstructions,
        preferences: validatedData.preferences ? {
          create: validatedData.preferences
        } : undefined
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

    // Crear notificación
    await db.notification.create({
      data: {
        type: 'NEW_ORDER',
        title: 'Nueva suscripción LoviBox',
        message: `Nueva suscripción ${validatedData.level} creada para ${customer.name || customer.email}`,
        priority: 'MEDIUM',
        actionUrl: `/admin/lovibox/subscriptions/${subscription.id}`,
        metadata: JSON.stringify({ subscriptionId: subscription.id })
      }
    });

    return NextResponse.json(subscription, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}