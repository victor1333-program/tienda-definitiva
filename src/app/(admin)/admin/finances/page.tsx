"use client"

import { useState } from "react"
import useSWR from "swr"
import { 
  Euro,
  ShoppingBag,
  TrendingUp,
  Users,
  Calendar,
  Download,
  BarChart3,
  PieChart,
  Package,
  Star,
  CreditCard,
  Target,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Percent,
  FileText,
  Filter,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Truck
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import LineChart from "@/components/charts/LineChart"
import BarChart from "@/components/charts/BarChart"
import DonutChart from "@/components/charts/DonutChart"
import fetcher from "@/lib/fetcher"
import { formatPrice } from "@/lib/utils"

interface SalesReport {
  summary: {
    totalRevenue: number
    totalOrders: number
    averageOrderValue: number
    totalCustomers: number
    conversionRate: number
    growthRate: number
  }
  dailySales: Array<{
    date: string
    totalAmount: number
    orderCount: number
  }>
  salesByStatus: Array<{
    status: string
    totalAmount: number
    orderCount: number
  }>
  salesByMethod: Array<{
    method: string
    totalAmount: number
    orderCount: number
  }>
  salesByCategory: Array<{
    category: string
    totalAmount: number
    orderCount: number
  }>
  topProducts: Array<{
    productId: string
    _sum: { quantity: number; unitPrice: number }
    _count: { id: number }
    product: {
      id: string
      name: string
      images: string
    }
  }>
  topCustomers: Array<{
    userId: string
    _sum: { totalAmount: number }
    _count: { id: number }
    customer: {
      id: string
      name: string
      email: string
    }
  }>
  monthlyComparison: {
    currentMonth: number
    previousMonth: number
    percentageChange: number
  }
  expenses: {
    totalExpenses: number
    netProfit: number
    profitMargin: number
  }
}

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  icon: React.ReactNode
  color: string
  format?: 'currency' | 'number' | 'percentage'
}

function MetricCard({ title, value, change, icon, color, format = 'number' }: MetricCardProps) {
  const formatValue = (val: string | number) => {
    if (format === 'currency' && typeof val === 'number') {
      return formatPrice(val)
    }
    if (format === 'percentage' && typeof val === 'number') {
      return `${val.toFixed(1)}%`
    }
    return val.toString()
  }

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-600' : 'text-red-600'
  }

  const getChangeIcon = (change: number) => {
    return change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${color}`}>
              {icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatValue(value)}
              </p>
              {change !== undefined && (
                <div className={`flex items-center gap-1 mt-1 ${getChangeColor(change)}`}>
                  {getChangeIcon(change)}
                  <span className="text-sm font-medium">
                    {Math.abs(change).toFixed(1)}%
                  </span>
                  <span className="text-xs text-gray-500">vs mes anterior</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function FinancesPage() {
  const [period, setPeriod] = useState("30")
  const [dateRange, setDateRange] = useState<{startDate?: string, endDate?: string}>({})
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview')

  // Construir URL de consulta
  const queryParams = new URLSearchParams({
    period,
    ...(dateRange.startDate && { startDate: dateRange.startDate }),
    ...(dateRange.endDate && { endDate: dateRange.endDate }),
  })

  const { data: report, error, mutate } = useSWR<SalesReport>(
    `/api/reports/sales?${queryParams}`,
    fetcher
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit"
    })
  }

  const getOrderStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      "PENDING": "Pendiente",
      "CONFIRMED": "Confirmado",
      "IN_PRODUCTION": "En Producción",
      "READY_FOR_PICKUP": "Listo para Recoger",
      "SHIPPED": "Enviado",
      "DELIVERED": "Entregado",
      "CANCELLED": "Cancelado"
    }
    return statusMap[status] || status
  }

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "#fbbf24"
      case "CONFIRMED":
        return "#3b82f6"
      case "IN_PRODUCTION":
        return "#8b5cf6"
      case "READY_FOR_PICKUP":
        return "#6366f1"
      case "SHIPPED":
        return "#f97316"
      case "DELIVERED":
        return "#10b981"
      case "CANCELLED":
        return "#ef4444"
      default:
        return "#6b7280"
    }
  }

  const getPaymentMethodText = (method: string) => {
    const methodMap: { [key: string]: string } = {
      "card": "Tarjeta",
      "transfer": "Transferencia",
      "paypal": "PayPal",
      "cash": "Efectivo"
    }
    return methodMap[method] || method
  }

  const getProductImages = (imagesString: string) => {
    try {
      const images = JSON.parse(imagesString)
      return Array.isArray(images) ? images : []
    } catch {
      return []
    }
  }

  const handleExportReport = async () => {
    try {
      const response = await fetch(`/api/reports/export?${queryParams}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `reporte-financiero-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error al exportar reporte:', error)
    }
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Error al cargar el reporte financiero</h2>
          <p className="text-sm text-gray-600 mb-4">
            Ha ocurrido un error al obtener los datos financieros
          </p>
          <Button onClick={() => mutate()} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">💰 Dashboard Financiero</h1>
          <p className="text-gray-600 mt-1">
            Análisis completo de ventas, ingresos y rendimiento financiero
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === 'overview' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('overview')}
            >
              Resumen
            </Button>
            <Button
              variant={viewMode === 'detailed' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('detailed')}
            >
              Detallado
            </Button>
          </div>
          <Button variant="outline" onClick={() => mutate()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button variant="outline" onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Filtros de período */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Período
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Período predefinido
              </label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="7">Últimos 7 días</option>
                <option value="30">Últimos 30 días</option>
                <option value="90">Últimos 3 meses</option>
                <option value="180">Últimos 6 meses</option>
                <option value="365">Último año</option>
              </select>
            </div>
            
            <div className="flex gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha inicio
                </label>
                <input
                  type="date"
                  value={dateRange.startDate || ""}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha fin
                </label>
                <input
                  type="date"
                  value={dateRange.endDate || ""}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas principales */}
      {report && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Ingresos Totales"
              value={report.summary.totalRevenue}
              change={report.monthlyComparison?.percentageChange}
              icon={<Euro className="h-6 w-6 text-green-600" />}
              color="bg-green-50"
              format="currency"
            />
            
            <MetricCard
              title="Total Pedidos"
              value={report.summary.totalOrders}
              change={10.5}
              icon={<ShoppingBag className="h-6 w-6 text-blue-600" />}
              color="bg-blue-50"
              format="number"
            />

            <MetricCard
              title="Ticket Promedio"
              value={report.summary.averageOrderValue}
              change={5.2}
              icon={<TrendingUp className="h-6 w-6 text-purple-600" />}
              color="bg-purple-50"
              format="currency"
            />

            <MetricCard
              title="Margen de Beneficio"
              value={report.expenses?.profitMargin || 0}
              change={2.1}
              icon={<Percent className="h-6 w-6 text-orange-600" />}
              color="bg-orange-50"
              format="percentage"
            />
          </div>

          {viewMode === 'detailed' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Total Clientes"
                value={report.summary.totalCustomers || 0}
                change={8.3}
                icon={<Users className="h-6 w-6 text-indigo-600" />}
                color="bg-indigo-50"
                format="number"
              />
              
              <MetricCard
                title="Tasa de Conversión"
                value={report.summary.conversionRate || 0}
                change={1.8}
                icon={<Target className="h-6 w-6 text-pink-600" />}
                color="bg-pink-50"
                format="percentage"
              />

              <MetricCard
                title="Beneficio Neto"
                value={report.expenses?.netProfit || 0}
                change={7.2}
                icon={<DollarSign className="h-6 w-6 text-emerald-600" />}
                color="bg-emerald-50"
                format="currency"
              />

              <MetricCard
                title="Gastos Totales"
                value={report.expenses?.totalExpenses || 0}
                change={-3.1}
                icon={<CreditCard className="h-6 w-6 text-red-600" />}
                color="bg-red-50"
                format="currency"
              />
            </div>
          )}

          {/* Gráficos principales */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Evolución de ventas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Evolución de Ventas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LineChart
                  data={report.dailySales.map(day => ({
                    date: day.date,
                    value: day.totalAmount,
                    label: formatDate(day.date)
                  }))}
                  formatValue={(value) => formatPrice(value)}
                  color="#f97316"
                />
              </CardContent>
            </Card>

            {/* Ventas por estado */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Distribución por Estado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DonutChart
                  data={report.salesByStatus.map(status => ({
                    label: getOrderStatusText(status.status),
                    value: status.totalAmount,
                    color: getOrderStatusColor(status.status)
                  }))}
                  formatValue={(value) => formatPrice(value)}
                  size={180}
                />
              </CardContent>
            </Card>
          </div>

          {viewMode === 'detailed' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Ventas por método de pago */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Métodos de Pago
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <BarChart
                    data={report.salesByMethod?.map(method => ({
                      label: getPaymentMethodText(method.method),
                      value: method.totalAmount,
                      color: '#3b82f6'
                    })) || []}
                    formatValue={(value) => formatPrice(value)}
                  />
                </CardContent>
              </Card>

              {/* Ventas por categoría */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Ventas por Categoría
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <BarChart
                    data={report.salesByCategory?.map(category => ({
                      label: category.category,
                      value: category.totalAmount,
                      color: '#8b5cf6'
                    })) || []}
                    formatValue={(value) => formatPrice(value)}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tablas de datos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top productos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Productos Más Vendidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {report.topProducts.slice(0, 5).map((productData, index) => {
                    const images = getProductImages(productData.product?.images || "")
                    return (
                      <div key={productData.productId} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                            {index + 1}
                          </Badge>
                          <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                            {images.length > 0 ? (
                              <img 
                                src={images[0]} 
                                alt={productData.product?.name || "Producto"}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-4 w-4 text-gray-400" />
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {productData.product?.name || "Producto eliminado"}
                          </p>
                          <p className="text-sm text-gray-600">
                            {productData._sum.quantity} unidades • {productData._count.id} pedidos
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary-600">
                            {formatPrice(productData._sum.unitPrice || 0)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Top clientes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Mejores Clientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {report.topCustomers.slice(0, 5).map((customerData, index) => (
                    <div key={customerData.userId} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-medium text-sm">
                            {customerData.customer?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || "?"}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {customerData.customer?.name || "Cliente eliminado"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {customerData._count.id} pedidos realizados
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary-600">
                          {formatPrice(customerData._sum.totalAmount || 0)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resumen de estado de pedidos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Estado Actual de Pedidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
                {report.salesByStatus.map((statusData) => (
                  <div key={statusData.status} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-center mb-2">
                      {statusData.status === 'PENDING' && <Clock className="w-6 h-6 text-yellow-600" />}
                      {statusData.status === 'CONFIRMED' && <CheckCircle className="w-6 h-6 text-blue-600" />}
                      {statusData.status === 'IN_PRODUCTION' && <Activity className="w-6 h-6 text-purple-600" />}
                      {statusData.status === 'READY_FOR_PICKUP' && <Package className="w-6 h-6 text-indigo-600" />}
                      {statusData.status === 'SHIPPED' && <Truck className="w-6 h-6 text-orange-600" />}
                      {statusData.status === 'DELIVERED' && <CheckCircle className="w-6 h-6 text-green-600" />}
                      {statusData.status === 'CANCELLED' && <AlertTriangle className="w-6 h-6 text-red-600" />}
                    </div>
                    <p className="text-xs font-medium text-gray-600 mb-1">
                      {getOrderStatusText(statusData.status)}
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {statusData.orderCount}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatPrice(statusData.totalAmount)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!report && !error && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard financiero...</p>
        </div>
      )}
    </div>
  )
}