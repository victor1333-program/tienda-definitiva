"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-hot-toast"
import { 
  BarChart3, 
  PieChart,
  TrendingUp, 
  TrendingDown,
  Download,
  Calendar,
  DollarSign,
  FileText,
  Users,
  ShoppingCart,
  Target,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Eye,
  Printer
} from "lucide-react"

interface FinancialReport {
  period: string
  revenue: number
  expenses: number
  profit: number
  profitMargin: number
  orders: number
  customers: number
  avgOrderValue: number
  growth: {
    revenue: number
    orders: number
    customers: number
  }
}

interface CategoryReport {
  category: string
  revenue: number
  orders: number
  percentage: number
  growth: number
}

export default function FinancialReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [reportType, setReportType] = useState<'overview' | 'detailed' | 'categories' | 'trends'>('overview')
  const [isGenerating, setIsGenerating] = useState(false)
  
  const [overviewReport, setOverviewReport] = useState<FinancialReport>({
    period: "Últimos 30 días",
    revenue: 45230.50,
    expenses: 18650.25,
    profit: 26580.25,
    profitMargin: 58.8,
    orders: 342,
    customers: 256,
    avgOrderValue: 132.25,
    growth: {
      revenue: 16.2,
      orders: 14.8,
      customers: 9.4
    }
  })

  const [categoryReports, setCategoryReports] = useState<CategoryReport[]>([
    {
      category: "Camisetas",
      revenue: 18520.30,
      orders: 156,
      percentage: 41.0,
      growth: 18.5
    },
    {
      category: "Sudaderas",
      revenue: 12340.80,
      orders: 89,
      percentage: 27.3,
      growth: 12.2
    },
    {
      category: "Accesorios",
      revenue: 8750.25,
      orders: 67,
      percentage: 19.4,
      growth: 8.9
    },
    {
      category: "Gorras",
      revenue: 5619.15,
      orders: 30,
      percentage: 12.4,
      growth: -2.1
    }
  ])

  const [monthlyData] = useState([
    { month: "Enero", revenue: 32450, expenses: 15200, profit: 17250 },
    { month: "Febrero", revenue: 35680, expenses: 16800, profit: 18880 },
    { month: "Marzo", revenue: 41230, expenses: 18950, profit: 22280 },
    { month: "Abril", revenue: 38765, expenses: 17650, profit: 21115 },
    { month: "Mayo", revenue: 45230, expenses: 18650, profit: 26580 },
    { month: "Junio", revenue: 48120, expenses: 19200, profit: 28920 }
  ])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const getPeriodLabel = (period: string) => {
    const labels = {
      '7d': 'Últimos 7 días',
      '30d': 'Últimos 30 días',
      '90d': 'Últimos 90 días',
      '1y': 'Último año'
    }
    return labels[period as keyof typeof labels]
  }

  const getGrowthIndicator = (growth: number) => {
    if (growth > 0) {
      return (
        <div className="flex items-center text-green-600">
          <ArrowUpRight className="w-4 h-4 mr-1" />
          <span className="text-sm font-medium">+{growth.toFixed(1)}%</span>
        </div>
      )
    } else if (growth < 0) {
      return (
        <div className="flex items-center text-red-600">
          <ArrowDownRight className="w-4 h-4 mr-1" />
          <span className="text-sm font-medium">{growth.toFixed(1)}%</span>
        </div>
      )
    }
    return (
      <div className="flex items-center text-gray-600">
        <span className="text-sm font-medium">0%</span>
      </div>
    )
  }

  const generateReport = async () => {
    setIsGenerating(true)
    try {
      // Simular generación de reporte
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success("Reporte generado correctamente")
    } catch (error) {
      toast.error("Error al generar el reporte")
    } finally {
      setIsGenerating(false)
    }
  }

  const exportReport = (format: 'pdf' | 'excel' | 'csv') => {
    toast.success(`Exportando reporte en formato ${format.toUpperCase()}`)
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Reportes Financieros</h1>
            <p className="text-gray-600">Análisis detallado del rendimiento financiero</p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={generateReport}
              disabled={isGenerating}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generando...
                </>
              ) : (
                <>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Generar Reporte
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Filtros y configuración */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex gap-2">
              <Label className="flex items-center">Período:</Label>
              {(['7d', '30d', '90d', '1y'] as const).map((period) => (
                <Button
                  key={period}
                  variant={selectedPeriod === period ? 'default' : 'outline'}
                  className={selectedPeriod === period ? 'bg-orange-600 hover:bg-orange-700' : ''}
                  onClick={() => setSelectedPeriod(period)}
                >
                  {getPeriodLabel(period)}
                </Button>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Label className="flex items-center">Tipo:</Label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="overview">Resumen General</option>
                <option value="detailed">Detallado</option>
                <option value="categories">Por Categorías</option>
                <option value="trends">Tendencias</option>
              </select>
            </div>

            <div className="flex gap-2 ml-auto">
              <Button variant="outline" onClick={() => exportReport('pdf')}>
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
              <Button variant="outline" onClick={() => exportReport('excel')}>
                <Download className="w-4 h-4 mr-2" />
                Excel
              </Button>
              <Button variant="outline" onClick={() => exportReport('csv')}>
                <Download className="w-4 h-4 mr-2" />
                CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {reportType === 'overview' && (
        <>
          {/* Métricas principales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Ingresos Totales</p>
                    <p className="text-2xl font-bold">{formatCurrency(overviewReport.revenue)}</p>
                    {getGrowthIndicator(overviewReport.growth.revenue)}
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Gastos Totales</p>
                    <p className="text-2xl font-bold">{formatCurrency(overviewReport.expenses)}</p>
                    <p className="text-sm text-gray-500">
                      {((overviewReport.expenses / overviewReport.revenue) * 100).toFixed(1)}% de ingresos
                    </p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-full">
                    <TrendingDown className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Beneficio Neto</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(overviewReport.profit)}</p>
                    <p className="text-sm text-gray-500">
                      Margen: {overviewReport.profitMargin.toFixed(1)}%
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Pedidos</p>
                    <p className="text-2xl font-bold">{overviewReport.orders}</p>
                    {getGrowthIndicator(overviewReport.growth.orders)}
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <ShoppingCart className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos y análisis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Evolución mensual */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Evolución Mensual
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {monthlyData.slice(-6).map((data) => (
                    <div key={data.month} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{data.month}</span>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">{formatCurrency(data.revenue)}</p>
                          <p className="text-xs text-gray-500">Ingresos</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-green-600">{formatCurrency(data.profit)}</p>
                          <p className="text-xs text-gray-500">Beneficio</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Distribución por categorías */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Ingresos por Categoría
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categoryReports.map((category) => (
                    <div key={category.category} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ 
                            backgroundColor: `hsl(${categoryReports.indexOf(category) * 60}, 70%, 50%)` 
                          }}
                        />
                        <span className="text-sm font-medium">{category.category}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatCurrency(category.revenue)}</p>
                        <p className="text-xs text-gray-500">{category.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {reportType === 'categories' && (
        <Card>
          <CardHeader>
            <CardTitle>Reporte Detallado por Categorías</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Categoría</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Ingresos</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Pedidos</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">% Total</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Crecimiento</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Valor Medio</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryReports.map((category) => (
                    <tr key={category.category} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <span className="font-medium">{category.category}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold">{formatCurrency(category.revenue)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span>{category.orders}</span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{category.percentage}%</Badge>
                      </td>
                      <td className="py-3 px-4">
                        {getGrowthIndicator(category.growth)}
                      </td>
                      <td className="py-3 px-4">
                        <span>{formatCurrency(category.revenue / category.orders)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {reportType === 'detailed' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Desglose detallado */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Análisis Detallado</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Ingresos */}
                <div>
                  <h4 className="font-medium mb-3">Desglose de Ingresos</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ventas Online:</span>
                      <span className="font-medium">{formatCurrency(35400)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ventas Tienda Física:</span>
                      <span className="font-medium">{formatCurrency(9830)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Servicios Personalizados:</span>
                      <span className="font-medium">{formatCurrency(0)}</span>
                    </div>
                    <hr />
                    <div className="flex justify-between font-semibold">
                      <span>Total Ingresos:</span>
                      <span>{formatCurrency(overviewReport.revenue)}</span>
                    </div>
                  </div>
                </div>

                {/* Gastos */}
                <div>
                  <h4 className="font-medium mb-3">Desglose de Gastos</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Materiales y Productos:</span>
                      <span className="font-medium">{formatCurrency(12400)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Personal:</span>
                      <span className="font-medium">{formatCurrency(4200)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Marketing:</span>
                      <span className="font-medium">{formatCurrency(850)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gastos Operativos:</span>
                      <span className="font-medium">{formatCurrency(1200)}</span>
                    </div>
                    <hr />
                    <div className="flex justify-between font-semibold">
                      <span>Total Gastos:</span>
                      <span>{formatCurrency(overviewReport.expenses)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* KPIs adicionales */}
          <Card>
            <CardHeader>
              <CardTitle>KPIs Clave</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">ROI</p>
                <p className="text-2xl font-bold text-green-600">142.5%</p>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Valor Medio Pedido</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(overviewReport.avgOrderValue)}</p>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Clientes Activos</p>
                <p className="text-2xl font-bold text-purple-600">{overviewReport.customers}</p>
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">Tasa Conversión</p>
                <p className="text-2xl font-bold text-orange-600">3.8%</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {reportType === 'trends' && (
        <Card>
          <CardHeader>
            <CardTitle>Análisis de Tendencias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-4">Tendencias Positivas</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">Ingresos en crecimiento</p>
                      <p className="text-sm text-green-700">+16.2% respecto al período anterior</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Users className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">Nuevos clientes</p>
                      <p className="text-sm text-blue-700">+9.4% de crecimiento</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-4">Áreas de Mejora</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                    <Target className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="font-medium text-orange-900">Optimizar costes</p>
                      <p className="text-sm text-orange-700">Reducir gastos operativos</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                    <Percent className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="font-medium text-yellow-900">Diversificar productos</p>
                      <p className="text-sm text-yellow-700">Ampliar categorías menos representadas</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}