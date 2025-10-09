import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db as prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const status = searchParams.get('status'); // 'all', 'active', 'inactive', 'pending'
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: any = {};

    if (productId) {
      where.productId = productId;
    }

    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    } else if (status === 'pending') {
      where.requiresApproval = true;
      where.publishedAt = null;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { product: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const [designVariants, total] = await Promise.all([
      prisma.productDesignVariant.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              basePrice: true,
              stock: true
            }
          },
          template: {
            select: {
              id: true,
              name: true,
              category: true
            }
          },
          creator: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          categories: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true
                }
              }
            }
          },
          _count: {
            select: {
              orderItems: true
            }
          }
        },
        orderBy: {
          [sortBy]: 'desc'
        },
        skip,
        take: limit,
      }),
      prisma.productDesignVariant.count({ where })
    ]);

    return NextResponse.json({
      designVariants: designVariants.map(variant => ({
        ...variant,
        totalPrice: variant.basePrice + variant.designSurcharge,
        salesCount: variant._count.orderItems
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching admin design variants:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { action, variantIds, data } = await request.json();

    switch (action) {
      case 'bulk-activate':
        await prisma.productDesignVariant.updateMany({
          where: { id: { in: variantIds } },
          data: { isActive: true }
        });
        break;

      case 'bulk-deactivate':
        await prisma.productDesignVariant.updateMany({
          where: { id: { in: variantIds } },
          data: { isActive: false }
        });
        break;

      case 'bulk-feature':
        await prisma.productDesignVariant.updateMany({
          where: { id: { in: variantIds } },
          data: { featured: true }
        });
        break;

      case 'bulk-unfeature':
        await prisma.productDesignVariant.updateMany({
          where: { id: { in: variantIds } },
          data: { featured: false }
        });
        break;

      case 'bulk-delete':
        // Verificar que no tengan órdenes
        const variantsWithOrders = await prisma.productDesignVariant.findMany({
          where: {
            id: { in: variantIds },
            orderItems: { some: {} }
          },
          select: { id: true, name: true }
        });

        if (variantsWithOrders.length > 0) {
          return NextResponse.json(
            { 
              error: 'No se pueden eliminar variantes con órdenes asociadas',
              variantsWithOrders 
            },
            { status: 400 }
          );
        }

        await prisma.productDesignVariant.deleteMany({
          where: { id: { in: variantIds } }
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Acción no válida' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error in bulk action:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}