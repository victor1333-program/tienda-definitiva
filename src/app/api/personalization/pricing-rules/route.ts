import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
// getServerSession replaced with auth() - import removed;
import { auth } from "@/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== 'ADMIN' && role !== 'SUPER_ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const pricingRules = await prisma.personalizationPricingRule.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            isPersonalizable: true,
          }
        },
        rules: {
          include: {
            side: {
              select: {
                id: true,
                name: true,
                displayName: true,
              }
            },
            printArea: {
              select: {
                id: true,
                name: true,
                displayName: true,
              }
            }
          }
        },
        quantityDiscounts: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(pricingRules);
  } catch (error) {
    console.error('Error al obtener reglas de precios:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== 'ADMIN' && role !== 'SUPER_ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, productId, isActive, rules, quantityDiscounts } = body;

    if (!name || !description || !productId) {
      return NextResponse.json(
        { error: 'Nombre, descripción y producto son requeridos' },
        { status: 400 }
      );
    }

    const existingRule = await prisma.personalizationPricingRule.findFirst({
      where: {
        name,
        productId,
      },
    });

    if (existingRule) {
      return NextResponse.json(
        { error: 'Ya existe una regla con este nombre para este producto' },
        { status: 400 }
      );
    }

    const pricingRule = await prisma.personalizationPricingRule.create({
      data: {
        name,
        description,
        productId,
        isActive: isActive ?? true,
        rules: {
          create: rules?.map((rule: any) => ({
            type: rule.type,
            sideId: rule.type === 'SIDE' ? rule.sideId : null,
            printAreaId: rule.type === 'AREA' ? rule.printAreaId : null,
            price: rule.price,
          })) || [],
        },
        quantityDiscounts: {
          create: quantityDiscounts?.map((discount: any) => ({
            minQuantity: discount.minQuantity,
            discountType: discount.discountType,
            discountValue: discount.discountValue,
          })) || [],
        },
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            isPersonalizable: true,
          }
        },
        rules: {
          include: {
            side: {
              select: {
                id: true,
                name: true,
                displayName: true,
              }
            },
            printArea: {
              select: {
                id: true,
                name: true,
                displayName: true,
              }
            }
          }
        },
        quantityDiscounts: true,
      },
    });

    return NextResponse.json(pricingRule, { status: 201 });
  } catch (error) {
    console.error('Error al crear regla de precios:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}