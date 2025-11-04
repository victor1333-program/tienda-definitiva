import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db as prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);

    // Estadísticas generales
    const [
      totalVariants,
      activeVariants,
      featuredVariants,
      pendingApproval,
      totalSales,
      recentVariants
    ] = await Promise.all([
      // Total de variantes
      prisma.productDesignVariant.count(),
      
      // Variantes activas
      prisma.productDesignVariant.count({
        where: { isActive: true, isPublic: true }
      }),
      
      // Variantes destacadas
      prisma.productDesignVariant.count({
        where: { featured: true, isActive: true }
      }),
      
      // Pendientes de aprobación
      prisma.productDesignVariant.count({
        where: { requiresApproval: true, publishedAt: null }
      }),
      
      // Total de ventas de variantes
      prisma.orderItem.aggregate({
        where: {
          designVariantId: { not: null },
          order: {
            createdAt: { gte: dateFrom }
          }
        },
        _sum: { quantity: true },
        _count: true
      }),
      
      // Variantes creadas recientemente
      prisma.productDesignVariant.count({
        where: {
          createdAt: { gte: dateFrom }
        }
      })
    ]);

    // Top variantes más vendidas
    const topSelling = await prisma.productDesignVariant.findMany({
      include: {
        product: {
          select: { name: true, slug: true }
        },
        _count: {
          select: { orderItems: true }
        }
      },
      orderBy: {
        orderItems: {
          _count: 'desc'
        }
      },
      take: 10
    });

    // Ventas por complejidad
    const salesByComplexity = await prisma.productDesignVariant.groupBy({
      by: ['designComplexity'],
      _count: { id: true },
      _sum: { 
        orderItems: {
          _count: true
        }
      }
    });

    // Ingresos por variantes en el período
    const revenueData = await prisma.orderItem.groupBy({
      by: ['designVariantId'],
      where: {
        designVariantId: { not: null },
        order: {
          createdAt: { gte: dateFrom },
          status: { not: 'CANCELLED' }
        }
      },
      _sum: {
        totalPrice: true,
        quantity: true
      }
    });

    const totalRevenue = revenueData.reduce((sum, item) => sum + (item._sum.totalPrice || 0), 0);

    // Distribución por categorías
    const categoryDistribution = await prisma.productDesignCategory.groupBy({
      by: ['categoryId'],
      _count: { designVariantId: true },
      include: {
        category: {
          select: { name: true, slug: true }
        }
      }
    });

    const stats = {
      overview: {
        totalVariants,
        activeVariants,
        featuredVariants,
        pendingApproval,
        recentVariants,
        conversionRate: totalVariants > 0 ? Math.round((activeVariants / totalVariants) * 100) : 0
      },
      sales: {
        totalOrders: totalSales._count,
        totalUnits: totalSales._sum.quantity || 0,
        totalRevenue,
        averageOrderValue: totalSales._count > 0 ? totalRevenue / totalSales._count : 0
      },
      topSelling: topSelling.map(variant => ({
        id: variant.id,
        name: variant.name,
        slug: variant.slug,
        productName: variant.product.name,
        salesCount: variant._count.orderItems,
        totalPrice: variant.basePrice + variant.designSurcharge
      })),
      complexityBreakdown: salesByComplexity,
      categoryDistribution,
      trends: {
        period: `${days} días`,
        newVariants: recentVariants,
        salesGrowth: totalSales._count // Se podría comparar con período anterior
      }
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching design variants stats:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}