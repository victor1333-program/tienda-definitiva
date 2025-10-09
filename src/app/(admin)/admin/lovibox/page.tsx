"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Gift, 
  Users, 
  TrendingUp, 
  Package, 
  Heart, 
  AlertCircle,
  Calendar,
  Truck,
  Star,
  Target,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle
} from "lucide-react";
import Link from "next/link";

interface AnalyticsData {
  overview: {
    totalSubscriptions: number;
    activeSubscriptions: number;
    pausedSubscriptions: number;
    canceledSubscriptions: number;
    churnRate: number;
    mrr: number;
    arpu: number;
  };
  growth: {
    newSubscriptionsInPeriod: number;
    canceledInPeriod: number;
    netGrowth: number;
  };
  levelDistribution: Array<{
    level: string;
    count: number;
    percentage: number;
  }>;
  deliveries: {
    totalDeliveries: number;
    successfulDeliveries: number;
    failedDeliveries: number;
    deliverySuccessRate: number;
  };
  engagement: {
    averageRating: number | null;
    totalRatings: number;
    nfcScans: number;
    nfcScanRate: number;
  };
  financial: {
    totalRevenue: number;
    totalPayments: number;
  };
}

interface RecentActivity {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: string;
  createdAt: string;
  isRead: boolean;
  actionUrl?: string;
}

export default function LoviBoxDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
    fetchRecentActivity();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/lovibox/analytics?period=30');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const response = await fetch('/api/notifications?limit=5');
      if (response.ok) {
        const data = await response.json();
        setRecentActivity(data.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'BASIC': return 'bg-pink-100 text-pink-800';
      case 'PREMIUM': return 'bg-yellow-100 text-yellow-800';
      case 'VIP': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelName = (level: string) => {
    switch (level) {
      case 'BASIC': return 'Básica';
      case 'PREMIUM': return 'Premium';
      case 'VIP': return 'VIP';
      default: return level;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Gift className="h-8 w-8 text-orange-500" />
            Dashboard de Suscripciones
          </h1>
          <p className="text-gray-600 mt-1">
            Sistema de suscripciones y cajas misteriosas personalizadas
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/admin/lovibox/subscriptions/new">
              <Heart className="h-4 w-4 mr-2" />
              Nueva Suscripción
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/lovibox/templates/new">
              <Package className="h-4 w-4 mr-2" />
              Nuevo Template
            </Link>
          </Button>
        </div>
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suscripciones Activas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Number(analytics?.overview.activeSubscriptions) || 0}</div>
            <p className="text-xs text-muted-foreground">
              {analytics?.growth.netGrowth ? (
                <span className={`flex items-center ${Number(analytics.growth.netGrowth) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Number(analytics.growth.netGrowth) >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(Number(analytics.growth.netGrowth))} este mes
                </span>
              ) : 'Sin cambios este mes'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MRR (Ingresos Mensuales)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics?.overview.mrr || 0)}</div>
            <p className="text-xs text-muted-foreground">
              ARPU: {formatCurrency(analytics?.overview.arpu || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Entrega</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Number(analytics?.deliveries.deliverySuccessRate) || 0}%</div>
            <p className="text-xs text-muted-foreground">
              {Number(analytics?.deliveries.successfulDeliveries) || 0} de {Number(analytics?.deliveries.totalDeliveries) || 0} entregas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfacción</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.engagement.averageRating ? (
                <span className="flex items-center gap-1">
                  {Number(analytics.engagement.averageRating).toFixed(1)}
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                </span>
              ) : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {Number(analytics?.engagement.totalRatings) || 0} valoraciones
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribución por niveles */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Distribución por Niveles
            </CardTitle>
            <CardDescription>
              Suscripciones activas por nivel de servicio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics?.levelDistribution?.map((level) => (
                <div key={level.level} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className={getLevelColor(level.level)}>
                      {getLevelName(level.level)}
                    </Badge>
                    <span className="text-sm text-gray-600">{Number(level.count)} suscripciones</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full" 
                        style={{ width: `${Number(level.percentage)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{Number(level.percentage)}%</span>
                  </div>
                </div>
              )) || []}
            </div>
          </CardContent>
        </Card>

        {/* Métricas de engagement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Engagement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Churn Rate</span>
              <span className={`font-medium ${(Number(analytics?.overview.churnRate) || 0) > 10 ? 'text-red-600' : 'text-green-600'}`}>
                {(Number(analytics?.overview.churnRate) || 0).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Escaneos NFC</span>
              <span className="font-medium">{(Number(analytics?.engagement.nfcScanRate) || 0).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pausadas</span>
              <span className="font-medium">{Number(analytics?.overview.pausedSubscriptions) || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actividad reciente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div key={String(activity.id)} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.priority === 'HIGH' ? 'bg-red-500' : 
                      activity.priority === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{String(activity.message)}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.createdAt).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No hay actividad reciente
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Acciones rápidas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Acciones Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/admin/lovibox/subscriptions">
                <Users className="h-4 w-4 mr-2" />
                Gestionar Suscripciones
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/admin/lovibox/templates">
                <Package className="h-4 w-4 mr-2" />
                Templates de Cajas
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/admin/lovibox/deliveries">
                <Truck className="h-4 w-4 mr-2" />
                Programar Entregas
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/admin/lovibox/analytics">
                <TrendingUp className="h-4 w-4 mr-2" />
                Analytics Detallados
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Footer con estadísticas adicionales */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-orange-600">{Number(analytics?.overview.totalSubscriptions) || 0}</div>
              <div className="text-sm text-gray-600">Total Suscripciones</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(Number(analytics?.financial.totalRevenue) || 0)}</div>
              <div className="text-sm text-gray-600">Ingresos (30d)</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{Number(analytics?.deliveries.totalDeliveries) || 0}</div>
              <div className="text-sm text-gray-600">Entregas (30d)</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{Number(analytics?.engagement.nfcScans) || 0}</div>
              <div className="text-sm text-gray-600">Escaneos NFC</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}