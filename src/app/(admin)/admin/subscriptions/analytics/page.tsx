"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Activity,
  Calendar,
  BarChart3,
  PieChart,
  Download,
  RefreshCw,
  ArrowUp,
  ArrowDown
} from "lucide-react"

interface AnalyticsData {
  summary: {
    totalSubscriptions: number
    activeSubscriptions: number
    pausedSubscriptions: number
    cancelledSubscriptions: number
    newSubscriptionsThisPeriod: number
    monthlyRevenue: number
    annualRevenue: number
    churnRate: number
    conversionRate: number
    averageRevenuePerUser: number
  }
  popularPlans: Array<{
    id: string
    name: string
    type: string
    subscribers: number
    revenue: number
  }>
  growthData: Array<{
    month: string
    subscriptions: number
    revenue: number
  }>
  typeBreakdown: Array<{
    id: string
    name: string
    slug: string
    subscribers: number
    revenue: number
    plans: Array<{
      id: string
      name: string
      price: number
      subscribers: number
    }>
  }>
  planPerformance: Array<{
    id: string
    name: string
    type: string
    price: number
    subscribers: number
    revenue: number
    billingCycle: string
  }>
}

export default function SubscriptionAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('30')
  const [selectedType, setSelectedType] = useState('all')

  useEffect(() => {
    fetchAnalytics()
  }, [selectedPeriod, selectedType])

  const fetchAnalytics = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        period: selectedPeriod,
        ...(selectedType !== 'all' && { type: selectedType })
      })
      
      const response = await fetch(`/api/subscriptions/analytics?${params}`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-ES').format(num)
  }

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Error al cargar analytics</p>
        <Button onClick={fetchAnalytics} className="mt-4">
          Reintentar
        </Button>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📊 Analytics de Suscripciones</h1>
          <p className="text-gray-600 mt-1">
            Métricas detalladas y análisis de rendimiento
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex gap-2">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="7">Últimos 7 días</option>
              <option value="30">Últimos 30 días</option>
              <option value="90">Últimos 90 días</option>
              <option value="365">Último año</option>
            </select>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">Todos los tipos</option>
              <option value="lovibox">Lovibox</option>
              <option value="empresas">Empresas</option>
            </select>
          </div>
          <Button variant="outline" onClick={fetchAnalytics}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Suscripciones Activas</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatNumber(analytics.summary.activeSubscriptions)}
                </p>
                <p className="text-xs text-gray-500">
                  {formatNumber(analytics.summary.totalSubscriptions)} total
                </p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Ingresos Mensuales</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(analytics.summary.monthlyRevenue)}
                </p>
                <div className="flex items-center text-xs text-green-500">
                  <ArrowUp className="w-3 h-3 mr-1" />
                  +12.5% vs mes anterior
                </div>
              </div>
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Nuevas Suscripciones</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatNumber(analytics.summary.newSubscriptionsThisPeriod)}
                </p>
                <p className="text-xs text-gray-500">
                  En los últimos {selectedPeriod} días
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tasa de Cancelación</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatPercentage(analytics.summary.churnRate)}
                </p>
                <div className="flex items-center text-xs text-red-500">
                  <ArrowDown className="w-3 h-3 mr-1" />
                  -2.1% vs mes anterior
                </div>
              </div>
              <Activity className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">ARPU</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(analytics.summary.averageRevenuePerUser)}
                </p>
                <p className="text-xs text-gray-500">
                  Por usuario/mes
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Crecimiento de Suscripciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between space-x-2">
              {analytics.growthData.slice(-6).map((data, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div 
                    className="bg-orange-500 w-full rounded-t"
                    style={{ 
                      height: `${(data.subscriptions / Math.max(...analytics.growthData.map(d => d.subscriptions))) * 200}px`,
                      minHeight: '20px'
                    }}
                  ></div>
                  <span className="text-xs text-gray-600 mt-2 text-center">
                    {data.month}
                  </span>
                  <span className="text-xs font-medium text-gray-900">
                    {data.subscriptions}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Type Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Distribución por Tipo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.typeBreakdown.map((type, index) => {
                const totalSubscribers = analytics.typeBreakdown.reduce((sum, t) => sum + t.subscribers, 0)
                const percentage = totalSubscribers > 0 ? (type.subscribers / totalSubscribers) * 100 : 0
                
                return (
                  <div key={type.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{type.name}</span>
                      <div className="text-right">
                        <span className="font-semibold">{type.subscribers}</span>
                        <span className="text-sm text-gray-500 ml-1">
                          ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          index === 0 ? 'bg-orange-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-gray-600">
                      Ingresos: {formatCurrency(type.revenue)}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Plans */}
        <Card>
          <CardHeader>
            <CardTitle>Planes Más Populares</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.popularPlans.map((plan, index) => (
                <div key={plan.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{plan.name}</p>
                      <p className="text-sm text-gray-600">{plan.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{plan.subscribers} suscriptores</p>
                    <p className="text-sm text-gray-600">{formatCurrency(plan.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Plan Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Rendimiento por Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Plan</th>
                    <th className="text-right py-2">Precio</th>
                    <th className="text-right py-2">Suscriptores</th>
                    <th className="text-right py-2">Ingresos</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.planPerformance.slice(0, 5).map((plan) => (
                    <tr key={plan.id} className="border-b">
                      <td className="py-2">
                        <div>
                          <p className="font-medium">{plan.name}</p>
                          <p className="text-xs text-gray-500">{plan.type}</p>
                        </div>
                      </td>
                      <td className="text-right py-2">
                        {formatCurrency(plan.price)}
                        <div className="text-xs text-gray-500">/{plan.billingCycle}</div>
                      </td>
                      <td className="text-right py-2 font-medium">
                        {plan.subscribers}
                      </td>
                      <td className="text-right py-2 font-semibold">
                        {formatCurrency(plan.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}