"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useDashboardMetrics, useFormatPrice, useFormatDate, useMetricsCalculations } from "@/hooks/useDashboard"
import {
  Users,
  UserPlus,
  UserCheck,
  TrendingUp,
  TrendingDown,
  Calendar,
  RefreshCw,
  ArrowUpIcon,
  ArrowDownIcon,
  DollarSign,
  ShoppingCart,
  Star,
  Target
} from "lucide-react"

export default function CustomerAnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const { data: metrics, loading, error, refetch } = useDashboardMetrics(selectedPeriod)
  const formatPrice = useFormatPrice()
  const formatDate = useFormatDate()
  const calculations = useMetricsCalculations()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando analíticas de clientes...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <Users className="w-12 h-12 mx-auto mb-2" />
            <p>Error al cargar las analíticas</p>
            <p className="text-sm text-gray-500">{error}</p>
          </div>
          <Button onClick={refetch}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">No hay datos disponibles</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            👥 Customer Analytics
          </h1>
          <p className="text-gray-600 mt-2">
            Análisis detallado del comportamiento de clientes
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={selectedPeriod} 
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-white"
          >
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
            <option value="90d">Últimos 90 días</option>
            <option value="1y">Último año</option>
          </select>
          <Badge variant="outline" className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {selectedPeriod === '7d' ? 'Últimos 7 días' :
             selectedPeriod === '90d' ? 'Últimos 90 días' :
             selectedPeriod === '1y' ? 'Último año' : 'Últimos 30 días'}
          </Badge>
          <Button variant="outline" size="sm" onClick={refetch}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Customer Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Total Clientes
            </CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-gray-900">
              {calculations.formatNumber(metrics.customerMetrics.totalCustomers)}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Base total de clientes
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Clientes Nuevos
            </CardTitle>
            <div className="p-2 bg-green-100 rounded-lg">
              <UserPlus className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-gray-900">
              {calculations.formatNumber(metrics.customerMetrics.newCustomers)}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              En el período seleccionado
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-violet-50"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Clientes Recurrentes
            </CardTitle>
            <div className="p-2 bg-purple-100 rounded-lg">
              <UserCheck className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-gray-900">
              {calculations.formatNumber(metrics.customerMetrics.returningCustomers)}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Compraron más de una vez
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-amber-50"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Tasa de Retención
            </CardTitle>
            <div className="p-2 bg-orange-100 rounded-lg">
              <Target className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-gray-900">
              {calculations.formatPercentage(metrics.customerMetrics.customerRetentionRate, 1)}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Clientes que regresan
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Business Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Métricas de Negocio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-900">Valor Orden Promedio</p>
                <p className="text-xl font-bold text-blue-600">
                  {formatPrice(metrics.businessMetrics.averageOrderValue)}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-900">Tasa de Conversión</p>
                <p className="text-xl font-bold text-green-600">
                  {calculations.formatPercentage(metrics.businessMetrics.conversionRate, 1)}
                </p>
              </div>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Crecimiento de Ingresos</span>
                {metrics.businessMetrics.revenueGrowth >= 0 ? (
                  <ArrowUpIcon className="w-4 h-4 text-green-500" />
                ) : (
                  <ArrowDownIcon className="w-4 h-4 text-red-500" />
                )}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">
                  {formatPrice(metrics.businessMetrics.totalRevenue)}
                </span>
                <span className={`text-sm font-medium ${
                  metrics.businessMetrics.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metrics.businessMetrics.revenueGrowth >= 0 ? '+' : ''}
                  {calculations.formatPercentage(metrics.businessMetrics.revenueGrowth, 1)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Distribución por Categorías
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.categoryDistribution.length > 0 ? (
                metrics.categoryDistribution.slice(0, 6).map((category, index) => {
                  const totalProducts = metrics.categoryDistribution.reduce((sum, c) => sum + c.productCount, 0)
                  const percentage = totalProducts > 0 ? (category.productCount / totalProducts) * 100 : 0
                  const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-purple-500', 'bg-pink-500']
                  
                  return (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium truncate">{category.name}</span>
                        <span>{category.productCount} ({percentage.toFixed(1)}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`${colors[index % colors.length]} h-2 rounded-full`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Sin datos de categorías</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods & Monthly Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Métodos de Pago Preferidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.paymentMethods.length > 0 ? (
                metrics.paymentMethods.map((method, index) => {
                  const total = metrics.paymentMethods.reduce((sum, m) => sum + m.count, 0)
                  const percentage = total > 0 ? (method.count / total) * 100 : 0
                  
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{method.method}</p>
                        <p className="text-sm text-gray-600">{method.count} transacciones</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatPrice(method.revenue)}</p>
                        <p className="text-sm text-gray-600">{percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-8">
                  <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Sin datos de pagos</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tendencias Mensuales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.monthlyTrends.length > 0 ? (
                metrics.monthlyTrends.slice(0, 6).map((trend, index) => {
                  const maxRevenue = Math.max(...metrics.monthlyTrends.map(t => t.revenue))
                  const width = maxRevenue > 0 ? (trend.revenue / maxRevenue) * 100 : 0
                  
                  return (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{formatDate.medium(trend.month + '-01')}</span>
                        <span>{formatPrice(trend.revenue)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                          style={{ width: `${width}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {trend.orders} pedidos
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Sin datos históricos</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Last Updated */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Última actualización: {formatDate.dateTime(metrics.lastUpdated)}
            </span>
            <Button variant="outline" size="sm" onClick={refetch}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar datos
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}