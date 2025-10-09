import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category');

    const where: any = {
      isActive: true,
      isPublic: true,
      featured: true
    };

    if (category) {
      where.categories = {
        some: {
          category: {
            slug: category
          }
        }
      };
    }

    const featuredVariants = await prisma.productDesignVariant.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            stock: true,
            variants: {
              where: { isActive: true },
              select: {
                id: true,
                size: true,
                colorName: true,
                colorHex: true,
                stock: true
              }
            }
          }
        },
        template: {
          select: {
            id: true,
            name: true,
            category: true
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
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' }
      ],
      take: limit
    });

    return NextResponse.json({
      featuredVariants: featuredVariants.map(variant => ({
        ...variant,
        totalPrice: variant.basePrice + variant.designSurcharge,
        salesCount: variant._count.orderItems,
        availableStock: variant.product.variants.reduce((sum, v) => sum + v.stock, 0)
      }))
    });

  } catch (error) {
    console.error('Error fetching featured design variants:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}