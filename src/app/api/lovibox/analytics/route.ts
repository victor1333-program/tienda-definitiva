import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
// GET /api/lovibox/analytics - Obtener métricas y analytics de LoviBox
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // días
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    const now = new Date();
    const fromDate = dateFrom ? new Date(dateFrom) : new Date(now.getTime() - parseInt(period) * 24 * 60 * 60 * 1000);
    const toDate = dateTo ? new Date(dateTo) : now;

    // Métricas generales de suscripciones
    const [
      totalSubscriptions,
      activeSubscriptions,
      pausedSubscriptions,
      canceledSubscriptions,
      newSubscriptionsInPeriod,
      canceledInPeriod
    ] = await Promise.all([
      // Total de suscripciones
      db.loviBoxSubscription.count(),
      
      // Suscripciones activas
      db.loviBoxSubscription.count({
        where: { status: 'ACTIVE' }
      }),
      
      // Suscripciones pausadas
      db.loviBoxSubscription.count({
        where: { status: 'PAUSED' }
      }),
      
      // Suscripciones canceladas
      db.loviBoxSubscription.count({
        where: { status: 'CANCELED' }
      }),
      
      // Nuevas suscripciones en el período
      db.loviBoxSubscription.count({
        where: {
          createdAt: {
            gte: fromDate,
            lte: toDate
          }
        }
      }),
      
      // Canceladas en el período
      db.loviBoxSubscription.count({
        where: {
          status: 'CANCELED',
          endDate: {
            gte: fromDate,
            lte: toDate
          }
        }
      })
    ]);

    // Distribución por niveles
    const distributionByLevel = await db.loviBoxSubscription.groupBy({
      by: ['level'],
      where: { status: 'ACTIVE' },
      _count: {
        id: true
      }
    });

    // Métricas financieras
    const [revenueData, paymentsStats] = await Promise.all([
      // Ingresos por período
      db.loviBoxPayment.aggregate({
        where: {
          status: 'COMPLETED',
          paymentDate: {
            gte: fromDate,
            lte: toDate
          }
        },
        _sum: {
          amount: true
        },
        _count: {
          id: true
        }
      }),
      
      // Estadísticas de pagos
      db.loviBoxPayment.groupBy({
        by: ['status'],
        _count: {
          id: true
        },
        _sum: {
          amount: true
        }
      })
    ]);

    // Calcular MRR (Monthly Recurring Revenue)
    const mrrData = await db.loviBoxSubscription.aggregate({
      where: { status: 'ACTIVE' },
      _sum: {
        monthlyPrice: true
      }
    });

    // Métricas de entregas
    const [deliveriesStats, deliveryStatusDistribution] = await Promise.all([
      // Estadísticas generales de entregas
      db.loviBoxDelivery.aggregate({
        where: {
          scheduledDate: {
            gte: fromDate,
            lte: toDate
          }
        },
        _count: {
          id: true
        }
      }),
      
      // Distribución por estado de entrega
      db.loviBoxDelivery.groupBy({
        by: ['status'],
        where: {
          scheduledDate: {
            gte: fromDate,
            lte: toDate
          }
        },
        _count: {
          id: true
        }
      })
    ]);

    // Entregas exitosas vs fallidas
    const successfulDeliveries = await db.loviBoxDelivery.count({
      where: {
        status: 'DELIVERED',
        deliveredDate: {
          gte: fromDate,
          lte: toDate
        }
      }
    });

    const failedDeliveries = await db.loviBoxDelivery.count({
      where: {
        status: { in: ['FAILED', 'RETURNED'] },
        scheduledDate: {
          gte: fromDate,
          lte: toDate
        }
      }
    });

    // Rating promedio y escaneos NFC
    const [ratingData, nfcScans] = await Promise.all([
      db.loviBoxDelivery.aggregate({
        where: {
          customerRating: { not: null },
          deliveredDate: {
            gte: fromDate,
            lte: toDate
          }
        },
        _avg: {
          customerRating: true
        },
        _count: {
          customerRating: true
        }
      }),
      
      db.loviBoxDelivery.count({
        where: {
          nfcScanned: true,
          nfcScanDate: {
            gte: fromDate,
            lte: toDate
          }
        }
      })
    ]);

    // Top templates por entregas
    const topTemplates = await db.loviBoxTemplate.findMany({
      select: {
        id: true,
        name: true,
        level: true,
        theme: true,
        image: true,
        _count: {
          select: {
            deliveries: {
              where: {
                scheduledDate: {
                  gte: fromDate,
                  lte: toDate
                }
              }
            }
          }
        }
      },
      orderBy: {
        deliveries: {
          _count: 'desc'
        }
      },
      take: 5
    });

    // Crecimiento mensual (últimos 6 meses)
    const growthData = await Promise.all(
      Array.from({ length: 6 }, (_, i) => {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        
        return Promise.all([
          // Nuevas suscripciones del mes
          db.loviBoxSubscription.count({
            where: {
              createdAt: {
                gte: monthStart,
                lte: monthEnd
              }
            }
          }),
          // Cancelaciones del mes
          db.loviBoxSubscription.count({
            where: {
              status: 'CANCELED',
              endDate: {
                gte: monthStart,
                lte: monthEnd
              }
            }
          }),
          // Ingresos del mes
          db.loviBoxPayment.aggregate({
            where: {
              status: 'COMPLETED',
              paymentDate: {
                gte: monthStart,
                lte: monthEnd
              }
            },
            _sum: {
              amount: true
            }
          })
        ]).then(([newSubs, canceled, revenue]) => ({
          month: monthStart.toISOString().slice(0, 7), // YYYY-MM
          newSubscriptions: newSubs,
          canceledSubscriptions: canceled,
          netGrowth: newSubs - canceled,
          revenue: revenue._sum.amount || 0
        }));
      })
    );

    // Calcular churn rate
    const churnRate = activeSubscriptions > 0 
      ? (canceledInPeriod / (activeSubscriptions + canceledInPeriod)) * 100 
      : 0;

    // ARPU (Average Revenue Per User)
    const arpu = activeSubscriptions > 0 
      ? (mrrData._sum.monthlyPrice || 0) / activeSubscriptions 
      : 0;

    // Success rate de entregas
    const totalScheduledDeliveries = successfulDeliveries + failedDeliveries;
    const deliverySuccessRate = totalScheduledDeliveries > 0 
      ? (successfulDeliveries / totalScheduledDeliveries) * 100 
      : 0;

    const analytics = {
      // Métricas principales
      overview: {
        totalSubscriptions,
        activeSubscriptions,
        pausedSubscriptions,
        canceledSubscriptions,
        churnRate: parseFloat(churnRate.toFixed(2)),
        mrr: mrrData._sum.monthlyPrice || 0,
        arpu: parseFloat(arpu.toFixed(2))
      },

      // Crecimiento
      growth: {
        newSubscriptionsInPeriod,
        canceledInPeriod,
        netGrowth: newSubscriptionsInPeriod - canceledInPeriod,
        monthlyData: growthData.reverse() // Más reciente al final
      },

      // Distribución por niveles
      levelDistribution: distributionByLevel.map(item => ({
        level: item.level,
        count: item._count.id,
        percentage: activeSubscriptions > 0 
          ? parseFloat(((item._count.id / activeSubscriptions) * 100).toFixed(1))
          : 0
      })),

      // Finanzas
      financial: {
        totalRevenue: revenueData._sum.amount || 0,
        totalPayments: revenueData._count || 0,
        paymentsBreakdown: paymentsStats.map(stat => ({
          status: stat.status,
          count: stat._count.id,
          amount: stat._sum.amount || 0
        }))
      },

      // Entregas
      deliveries: {
        totalDeliveries: deliveriesStats._count || 0,
        successfulDeliveries,
        failedDeliveries,
        deliverySuccessRate: parseFloat(deliverySuccessRate.toFixed(2)),
        statusDistribution: deliveryStatusDistribution.map(item => ({
          status: item.status,
          count: item._count.id
        }))
      },

      // Engagement
      engagement: {
        averageRating: ratingData._avg.customerRating 
          ? parseFloat(ratingData._avg.customerRating.toFixed(2)) 
          : null,
        totalRatings: ratingData._count || 0,
        nfcScans,
        nfcScanRate: deliveriesStats._count > 0 
          ? parseFloat(((nfcScans / deliveriesStats._count) * 100).toFixed(2))
          : 0
      },

      // Top performers
      topTemplates: topTemplates.map(template => ({
        ...template,
        deliveryCount: template._count.deliveries
      })),

      // Metadata
      period: {
        from: fromDate.toISOString(),
        to: toDate.toISOString(),
        days: Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24))
      }
    };

    return NextResponse.json(analytics);

  } catch (error) {
    console.error('Error fetching LoviBox analytics:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}