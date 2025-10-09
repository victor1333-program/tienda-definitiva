import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const createTemplateSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  slug: z.string().min(1, 'Slug requerido'),
  description: z.string().optional(),
  level: z.enum(['BASIC', 'PREMIUM', 'VIP']),
  theme: z.enum(['ROMANTIC', 'FAMILY', 'FRIENDSHIP', 'CELEBRATION', 'SEASONAL', 'WELLNESS', 'CREATIVE', 'GOURMET', 'ADVENTURE', 'CUSTOM']),
  month: z.number().min(1).max(12).optional(),
  year: z.number().min(2024).optional(),
  image: z.string().optional(),
  socialImage: z.string().optional(),
  marketingText: z.string().optional(),
  basicPrice: z.number().positive('Precio básico debe ser positivo'),
  premiumPrice: z.number().positive('Precio premium debe ser positivo'),
  vipPrice: z.number().positive('Precio VIP debe ser positivo'),
  productionStartDate: z.string().datetime().optional(),
  shippingStartDate: z.string().datetime().optional(),
  products: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.number().positive().default(1),
    costPerUnit: z.number().positive(),
    isPersonalizable: z.boolean().default(false),
    personalizationCost: z.number().optional(),
    designData: z.any().optional(),
    productionNotes: z.string().optional(),
    displayOrder: z.number().default(0),
    isMainProduct: z.boolean().default(false)
  })).default([])
});

// GET /api/lovibox/templates - Listar templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const level = searchParams.get('level');
    const theme = searchParams.get('theme');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    const skip = (page - 1) * limit;

    const where: any = {};

    if (level) {
      where.level = level;
    }

    if (theme) {
      where.theme = theme;
    }

    if (status) {
      where.status = status;
    }

    if (month) {
      where.month = parseInt(month);
    }

    if (year) {
      where.year = parseInt(year);
    }

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          description: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ];
    }

    const [templates, total] = await Promise.all([
      db.loviBoxTemplate.findMany({
        where,
        skip,
        take: limit,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          products: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                  basePrice: true
                }
              }
            },
            orderBy: {
              displayOrder: 'asc'
            }
          },
          _count: {
            select: {
              deliveries: true,
              productionTasks: true
            }
          }
        },
        orderBy: [
          { year: 'desc' },
          { month: 'desc' },
          { createdAt: 'desc' }
        ]
      }),
      db.loviBoxTemplate.count({ where })
    ]);

    return NextResponse.json({
      templates,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/lovibox/templates - Crear nuevo template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createTemplateSchema.parse(body);

    // Verificar que el slug es único
    const existingTemplate = await db.loviBoxTemplate.findUnique({
      where: { slug: validatedData.slug }
    });

    if (existingTemplate) {
      return NextResponse.json(
        { error: 'Ya existe un template con este slug' },
        { status: 400 }
      );
    }

    // Verificar que los productos existen
    if (validatedData.products.length > 0) {
      const productIds = validatedData.products.map(p => p.productId);
      const existingProducts = await db.product.findMany({
        where: {
          id: { in: productIds }
        },
        select: { id: true }
      });

      const foundIds = existingProducts.map(p => p.id);
      const missingIds = productIds.filter(id => !foundIds.includes(id));

      if (missingIds.length > 0) {
        return NextResponse.json(
          { error: `Productos no encontrados: ${missingIds.join(', ')}` },
          { status: 400 }
        );
      }
    }

    const template = await db.loviBoxTemplate.create({
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description,
        level: validatedData.level,
        theme: validatedData.theme,
        month: validatedData.month,
        year: validatedData.year,
        image: validatedData.image,
        socialImage: validatedData.socialImage,
        marketingText: validatedData.marketingText,
        basicPrice: validatedData.basicPrice,
        premiumPrice: validatedData.premiumPrice,
        vipPrice: validatedData.vipPrice,
        productionStartDate: validatedData.productionStartDate ? new Date(validatedData.productionStartDate) : undefined,
        shippingStartDate: validatedData.shippingStartDate ? new Date(validatedData.shippingStartDate) : undefined,
        products: {
          create: validatedData.products
        }
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        products: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                basePrice: true
              }
            }
          },
          orderBy: {
            displayOrder: 'asc'
          }
        }
      }
    });

    // Crear notificación
    await db.notification.create({
      data: {
        type: 'SYSTEM_ALERT',
        title: 'Nuevo template LoviBox',
        message: `Template "${validatedData.name}" creado para ${validatedData.level}`,
        priority: 'MEDIUM',
        actionUrl: `/admin/lovibox/templates/${template.id}`,
        metadata: JSON.stringify({ templateId: template.id })
      }
    });

    return NextResponse.json(template, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating template:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}