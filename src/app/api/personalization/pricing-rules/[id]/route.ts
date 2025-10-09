import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { auth } from '@/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    
    const resolvedParams = await params;
    const session = await auth();
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const pricingRule = await prisma.personalizationPricingRule.findUnique({
      where: { id: resolvedParams.id },
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

    if (!pricingRule) {
      return NextResponse.json(
        { error: 'Regla de precios no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(pricingRule);
  } catch (error) {
    console.error('Error al obtener regla de precios:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, productId, isActive, rules, quantityDiscounts } = body;

    const existingRule = await prisma.personalizationPricingRule.findUnique({
      where: { id: resolvedParams.id },
    });

    if (!existingRule) {
      return NextResponse.json(
        { error: 'Regla de precios no encontrada' },
        { status: 404 }
      );
    }

    await prisma.personalizationPricingRuleItem.deleteMany({
      where: { ruleId: resolvedParams.id },
    });

    await prisma.personalizationQuantityDiscount.deleteMany({
      where: { ruleId: resolvedParams.id },
    });

    const updatedRule = await prisma.personalizationPricingRule.update({
      where: { id: resolvedParams.id },
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

    return NextResponse.json(updatedRule);
  } catch (error) {
    console.error('Error al actualizar regla de precios:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const existingRule = await prisma.personalizationPricingRule.findUnique({
      where: { id: resolvedParams.id },
    });

    if (!existingRule) {
      return NextResponse.json(
        { error: 'Regla de precios no encontrada' },
        { status: 404 }
      );
    }

    await prisma.personalizationPricingRule.delete({
      where: { id: resolvedParams.id },
    });

    return NextResponse.json({ message: 'Regla de precios eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar regla de precios:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}