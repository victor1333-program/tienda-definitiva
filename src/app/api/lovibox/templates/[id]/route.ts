import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const updateTemplateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  level: z.enum(['BASIC', 'PREMIUM', 'VIP']).optional(),
  theme: z.enum(['ROMANTIC', 'FAMILY', 'FRIENDSHIP', 'CELEBRATION', 'SEASONAL', 'WELLNESS', 'CREATIVE', 'GOURMET', 'ADVENTURE', 'CUSTOM']).optional(),
  month: z.number().min(1).max(12).optional(),
  year: z.number().min(2024).optional(),
  image: z.string().optional(),
  socialImage: z.string().optional(),
  marketingText: z.string().optional(),
  basicPrice: z.number().positive().optional(),
  premiumPrice: z.number().positive().optional(),
  vipPrice: z.number().positive().optional(),
  status: z.enum(['DRAFT', 'PLANNING', 'DESIGN', 'PRODUCTION', 'READY', 'SHIPPING', 'COMPLETED', 'CANCELED']).optional(),
  isActive: z.boolean().optional(),
  productionStartDate: z.string().datetime().optional(),
  shippingStartDate: z.string().datetime().optional()
});

// GET /api/lovibox/templates/[id] - Obtener template específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    
    const resolvedParams = await params;
    const template = await db.loviBoxTemplate.findUnique({
      where: { id: resolvedParams.id },
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
                slug: true,
                images: true,
                basePrice: true,
                description: true,
                variants: {
                  select: {
                    id: true,
                    sku: true,
                    colorName: true,
                    size: true,
                    price: true,
                    stock: true,
                    images: true
                  }
                }
              }
            }
          },
          orderBy: {
            displayOrder: 'asc'
          }
        },
        deliveries: {
          select: {
            id: true,
            status: true,
            scheduledDate: true,
            subscription: {
              select: {
                id: true,
                customer: {
                  select: {
                    name: true,
                    email: true
                  }
                }
              }
            }
          },
          take: 10,
          orderBy: {
            scheduledDate: 'desc'
          }
        },
        productionTasks: {
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            dueDate: 'asc'
          }
        },
        _count: {
          select: {
            deliveries: true,
            productionTasks: true
          }
        }
      }
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(template);

  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PATCH /api/lovibox/templates/[id] - Actualizar template
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const validatedData = updateTemplateSchema.parse(body);

    // Verificar que el template existe
    const existingTemplate = await db.loviBoxTemplate.findUnique({
      where: { id: resolvedParams.id }
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Template no encontrado' },
        { status: 404 }
      );
    }

    const template = await db.loviBoxTemplate.update({
      where: { id: resolvedParams.id },
      data: {
        ...validatedData,
        productionStartDate: validatedData.productionStartDate ? new Date(validatedData.productionStartDate) : undefined,
        shippingStartDate: validatedData.shippingStartDate ? new Date(validatedData.shippingStartDate) : undefined
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
        },
        _count: {
          select: {
            deliveries: true,
            productionTasks: true
          }
        }
      }
    });

    return NextResponse.json(template);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating template:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/lovibox/templates/[id] - Eliminar template
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar que el template existe
    const existingTemplate = await db.loviBoxTemplate.findUnique({
      where: { id: resolvedParams.id },
      include: {
        _count: {
          select: {
            deliveries: true
          }
        }
      }
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Template no encontrado' },
        { status: 404 }
      );
    }

    // No permitir eliminar si tiene entregas asociadas
    if (existingTemplate._count.deliveries > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar un template que tiene entregas asociadas' },
        { status: 400 }
      );
    }

    await db.loviBoxTemplate.delete({
      where: { id: resolvedParams.id }
    });

    return NextResponse.json({ message: 'Template eliminado correctamente' });

  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}