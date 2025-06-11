'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { toast } from "react-hot-toast"
import {
  FileText,
  Download,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Users,
  Package,
  DollarSign,
  Target,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Filter,
  Search,
  Factory,
  Activity,
  Zap,
  Timer,
  Award,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from "lucide-react"
import BarChart from "@/components/charts/BarChart"
import LineChart from "@/components/charts/LineChart"
import DonutChart from "@/components/charts/DonutChart"

interface ProductionMetrics {
  totalOrders: number
  completedOrders: number
  averageProductionTime: number
  onTimeDelivery: number
  defectRate: number
  efficiency: number
  costPerUnit: number
  totalRevenue: number
  profitMargin: number
  resourceUtilization: number
}

interface ProductionReport {
  id: string
  orderNumber: string
  productName: string
  category: string
  startDate: string
  completionDate?: string
  estimatedTime: number
  actualTime?: number
  status: 'COMPLETED' | 'IN_PROGRESS' | 'DELAYED' | 'CANCELLED'
  cost: number
  revenue: number
  profit: number
  efficiency: number
  defects: number
  qualityScore: number
  worker: string
  materials: {
    name: string
    quantity: number
    cost: number
  }[]
  timeBreakdown: {
    design: number
    cutting: number
    printing: number
    assembly: number
    quality: number
  }
}

interface WorkerPerformance {
  id: string
  name: string
  ordersCompleted: number
  averageTime: number
  efficiency: number
  qualityScore: number
  defectRate: number
  totalRevenue: number
}

export default function ProductionReportsPage() {
  const [metrics, setMetrics] = useState<ProductionMetrics>({
    totalOrders: 0,
    completedOrders: 0,
    averageProductionTime: 0,
    onTimeDelivery: 0,
    defectRate: 0,
    efficiency: 0,
    costPerUnit: 0,
    totalRevenue: 0,
    profitMargin: 0,
    resourceUtilization: 0
  })
  const [reports, setReports] = useState<ProductionReport[]>([])
  const [workers, setWorkers] = useState<WorkerPerformance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    loadProductionData()
  }, [selectedPeriod])

  const loadProductionData = async () => {
    setIsLoading(true)
    try {
      const [metricsResponse, reportsResponse, workersResponse] = await Promise.all([
        fetch(`/api/production-reports/metrics?period=${selectedPeriod}`),
        fetch(`/api/production-reports/orders?period=${selectedPeriod}`),
        fetch(`/api/production-reports/workers?period=${selectedPeriod}`)
      ])

      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json()
        setMetrics(metricsData)
      }

      if (reportsResponse.ok) {
        const reportsData = await reportsResponse.json()
        setReports(reportsData)
      }

      if (workersResponse.ok) {
        const workersData = await workersResponse.json()
        setWorkers(workersData)
      }
    } catch (error) {
      console.error('Error loading production data:', error)
      toast.error('Error al cargar datos de producción')
    } finally {
      setIsLoading(false)
    }
  }

  const exportReport = async () => {
    setIsExporting(true)
    try {
      const response = await fetch(`/api/production-reports/export?period=${selectedPeriod}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period: selectedPeriod,
          includeCharts: true,
          format: 'pdf'
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `reporte-produccion-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        toast.success('Reporte exportado correctamente')
      } else {
        toast.error('Error al exportar reporte')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al exportar reporte')
    } finally {
      setIsExporting(false)
    }
  }

  // Filter reports
  const filteredReports = reports.filter(report => {
    const matchesSearch = report.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.worker.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = selectedStatus === 'all' || report.status === selectedStatus
    
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800'
      case 'DELAYED': return 'bg-orange-100 text-orange-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getEfficiencyIcon = (efficiency: number) => {
    if (efficiency >= 90) return { icon: 'up', color: 'text-green-600' }
    if (efficiency >= 70) return { icon: 'neutral', color: 'text-yellow-600' }
    return { icon: 'down', color: 'text-red-600' }
  }

  // Prepare chart data
  const efficiencyTrendData = [
    { label: 'Sem 1', value: 78, color: '#3b82f6' },
    { label: 'Sem 2', value: 82, color: '#3b82f6' },
    { label: 'Sem 3', value: 85, color: '#3b82f6' },
    { label: 'Sem 4', value: 88, color: '#3b82f6' },
    { label: 'Actual', value: metrics.efficiency, color: '#10b981' }
  ]

  const categoryPerformanceData = [
    { label: 'Textil', value: 45, color: '#3b82f6' },
    { label: 'Sublimación', value: 35, color: '#8b5cf6' },
    { label: 'Láser', value: 20, color: '#f59e0b' }
  ]

  const workerEfficiencyData = workers.slice(0, 6).map(worker => ({
    label: worker.name.split(' ')[0],
    value: worker.efficiency,
    color: worker.efficiency >= 85 ? '#10b981' : worker.efficiency >= 70 ? '#f59e0b' : '#ef4444'
  }))

  const costAnalysisData = [
    { label: 'Materiales', value: 45, color: '#3b82f6' },
    { label: 'Mano de Obra', value: 35, color: '#8b5cf6' },
    { label: 'Equipos', value: 15, color: '#f59e0b' },
    { label: 'Overhead', value: 5, color: '#ef4444' }
  ]

  const tabs = [
    { id: 'overview', label: 'Resumen' },
    { id: 'orders', label: 'Órdenes' },
    { id: 'workers', label: 'Personal' },
    { id: 'costs', label: 'Costos' }
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando reportes de producción...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🏭 Reportes de Producción</h1>
          <p className="text-gray-600 mt-1">
            Análisis completo de rendimiento, costos y eficiencia de producción
          </p>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="week">Esta semana</option>
            <option value="month">Este mes</option>
            <option value="quarter">Este trimestre</option>
            <option value="year">Este año</option>
          </select>
          <Button
            variant="outline"
            onClick={exportReport}
            disabled={isExporting}
          >
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? 'Exportando...' : 'Exportar PDF'}
          </Button>
          <Button variant="outline" onClick={loadProductionData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.id === 'overview' && <BarChart3 className="w-4 h-4" />}
              {tab.id === 'orders' && <Package className="w-4 h-4" />}
              {tab.id === 'workers' && <Users className="w-4 h-4" />}
              {tab.id === 'costs' && <DollarSign className="w-4 h-4" />}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50"></div>
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Eficiencia Global</CardTitle>
                <div className="p-2 bg-blue-100 rounded-lg">
                  {(() => {
                    const iconData = getEfficiencyIcon(metrics.efficiency)
                    if (iconData.icon === 'up') return <ArrowUpRight className={`w-4 h-4 ${iconData.color}`} />
                    if (iconData.icon === 'neutral') return <Minus className={`w-4 h-4 ${iconData.color}`} />
                    return <ArrowDownRight className={`w-4 h-4 ${iconData.color}`} />
                  })()}
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl font-bold text-gray-900">{metrics.efficiency.toFixed(1)}%</div>
                <p className="text-xs text-gray-600 mt-1">
                  {metrics.efficiency >= 85 ? '+2.3% vs mes anterior' : metrics.efficiency >= 70 ? '+0.8% vs mes anterior' : '-1.2% vs mes anterior'}
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50"></div>
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Entregas a Tiempo</CardTitle>
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl font-bold text-green-600">{metrics.onTimeDelivery.toFixed(1)}%</div>
                <p className="text-xs text-gray-600 mt-1">
                  {metrics.completedOrders} de {metrics.totalOrders} órdenes
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-amber-50"></div>
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Tasa de Defectos</CardTitle>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl font-bold text-orange-600">{metrics.defectRate.toFixed(2)}%</div>
                <p className="text-xs text-gray-600 mt-1">
                  Meta: <2.5%
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-violet-50"></div>
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Margen de Beneficio</CardTitle>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <DollarSign className="h-4 w-4 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl font-bold text-purple-600">{metrics.profitMargin.toFixed(1)}%</div>
                <p className="text-xs text-gray-600 mt-1">
                  €{metrics.totalRevenue.toLocaleString('es-ES')} ingresos
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Tendencia de Eficiencia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LineChart
                  data={efficiencyTrendData}
                  title="Eficiencia Semanal (%)"
                  formatValue={(value) => `${value}%`}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Rendimiento por Categoría
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DonutChart
                  data={categoryPerformanceData}
                  title="Órdenes Completadas"
                  size={180}
                  formatValue={(value) => `${value} órdenes`}
                />
              </CardContent>
            </Card>
          </div>

          {/* Worker Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Eficiencia del Personal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart
                data={workerEfficiencyData}
                title="Eficiencia por Trabajador (%)"
                formatValue={(value) => `${value}%`}
              />
            </CardContent>
          </Card>

          {/* Quick Insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Tiempo Promedio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {metrics.averageProductionTime.toFixed(1)}h
                </div>
                <p className="text-sm text-gray-600">
                  Por orden de producción
                </p>
                <div className="mt-3 text-xs text-gray-500">
                  Meta: 8.5h | Actual: {metrics.averageProductionTime.toFixed(1)}h
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Costo por Unidad
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  €{metrics.costPerUnit.toFixed(2)}
                </div>
                <p className="text-sm text-gray-600">
                  Costo promedio unitario
                </p>
                <div className="mt-3 text-xs text-gray-500">
                  -5.2% vs mes anterior
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Utilización de Recursos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {metrics.resourceUtilization.toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600">
                  Capacidad utilizada
                </p>
                <div className="mt-3 text-xs text-gray-500">
                  Óptimo: 85-95%
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <>
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar por número de orden, producto o trabajador..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="COMPLETED">Completado</option>
                    <option value="IN_PROGRESS">En Progreso</option>
                    <option value="DELAYED">Retrasado</option>
                    <option value="CANCELLED">Cancelado</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Orders Table */}
          <Card>
            <CardHeader>
              <CardTitle>Órdenes de Producción</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredReports.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No hay órdenes</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm ? 'No se encontraron órdenes con ese término' : 'No hay órdenes en este período'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredReports.map((report) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-gray-900">#{report.orderNumber}</h3>
                          <Badge className={getStatusColor(report.status)}>
                            {report.status === 'COMPLETED' ? 'Completado' :
                             report.status === 'IN_PROGRESS' ? 'En Progreso' :
                             report.status === 'DELAYED' ? 'Retrasado' : 'Cancelado'}
                          </Badge>
                          <div className="flex items-center gap-1">
                            {(() => {
                              const iconData = getEfficiencyIcon(report.efficiency)
                              if (iconData.icon === 'up') return <ArrowUpRight className={`w-4 h-4 ${iconData.color}`} />
                              if (iconData.icon === 'neutral') return <Minus className={`w-4 h-4 ${iconData.color}`} />
                              return <ArrowDownRight className={`w-4 h-4 ${iconData.color}`} />
                            })()}
                            <span className="text-sm font-medium">{report.efficiency}%</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="text-gray-500">Producto:</span>
                            <p className="font-medium">{report.productName}</p>
                          </div>
                          
                          <div>
                            <span className="text-gray-500">Trabajador:</span>
                            <p className="font-medium">{report.worker}</p>
                          </div>
                          
                          <div>
                            <span className="text-gray-500">Tiempo:</span>
                            <p className="font-medium">
                              {report.actualTime ? `${report.actualTime}h` : `${report.estimatedTime}h (est.)`}
                            </p>
                          </div>
                          
                          <div>
                            <span className="text-gray-500">Costo:</span>
                            <p className="font-medium">€{report.cost.toFixed(2)}</p>
                          </div>
                          
                          <div>
                            <span className="text-gray-500">Beneficio:</span>
                            <p className={`font-medium ${report.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              €{report.profit.toFixed(2)}
                            </p>
                          </div>
                          
                          <div>
                            <span className="text-gray-500">Calidad:</span>
                            <p className="font-medium">{report.qualityScore}/10</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Workers Tab */}
      {activeTab === 'workers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workers.map((worker) => (
            <Card key={worker.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{worker.name}</span>
                  <div className="flex items-center gap-1">
                    {(() => {
                      const iconData = getEfficiencyIcon(worker.efficiency)
                      if (iconData.icon === 'up') return <ArrowUpRight className={`w-4 h-4 ${iconData.color}`} />
                      if (iconData.icon === 'neutral') return <Minus className={`w-4 h-4 ${iconData.color}`} />
                      return <ArrowDownRight className={`w-4 h-4 ${iconData.color}`} />
                    })()}
                    <span className="text-sm font-medium">{worker.efficiency}%</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Órdenes:</span>
                    <p className="font-medium text-lg">{worker.ordersCompleted}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Tiempo Prom:</span>
                    <p className="font-medium text-lg">{worker.averageTime.toFixed(1)}h</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Calidad:</span>
                    <p className="font-medium text-lg">{worker.qualityScore.toFixed(1)}/10</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Defectos:</span>
                    <p className="font-medium text-lg">{worker.defectRate.toFixed(1)}%</p>
                  </div>
                </div>
                
                <div className="pt-2 border-t">
                  <span className="text-gray-500 text-sm">Ingresos Generados:</span>
                  <p className="font-bold text-xl text-green-600">€{worker.totalRevenue.toLocaleString('es-ES')}</p>
                </div>
                
                {worker.efficiency >= 90 && (
                  <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                    <Award className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700 font-medium">Top Performer</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Costs Tab */}
      {activeTab === 'costs' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Distribución de Costos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DonutChart
                  data={costAnalysisData}
                  title="Desglose de Costos"
                  size={200}
                  formatValue={(value) => `${value}%`}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Análisis de Rentabilidad</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">€{metrics.totalRevenue.toLocaleString('es-ES')}</div>
                    <div className="text-sm text-blue-700">Ingresos Totales</div>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">€{(metrics.totalRevenue * (100 - metrics.profitMargin) / 100).toLocaleString('es-ES')}</div>
                    <div className="text-sm text-red-700">Costos Totales</div>
                  </div>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">€{(metrics.totalRevenue * metrics.profitMargin / 100).toLocaleString('es-ES')}</div>
                  <div className="text-sm text-green-700">Beneficio Neto ({metrics.profitMargin.toFixed(1)}%)</div>
                </div>
                
                <div className="pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Costo por unidad:</span>
                    <span className="font-medium">€{metrics.costPerUnit.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Margen promedio:</span>
                    <span className="font-medium">{metrics.profitMargin.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>ROI producción:</span>
                    <span className="font-medium text-green-600">+{(metrics.profitMargin * 1.2).toFixed(1)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}