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
  customerName: string
  status: 'COMPLETED' | 'IN_PROGRESS' | 'DELAYED' | 'CANCELLED'
  startDate: string
  endDate?: string
  estimatedTime: number
  actualTime?: number
  efficiency: number
  defectCount: number
  worker: string
  cost: number
  revenue: number
  margin: number
  stages: {
    design: number
    printing: number
    cutting: number
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

  const renderEfficiencyIcon = (efficiency: number) => {
    if (efficiency >= 90) return <ArrowUpRight className="w-4 h-4 text-green-600" />
    if (efficiency >= 70) return <Minus className="w-4 h-4 text-yellow-600" />
    return <ArrowDownRight className="w-4 h-4 text-red-600" />
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
        <div className="flex items-center gap-3">
          <select 
            value={selectedPeriod} 
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="week">Última semana</option>
            <option value="month">Último mes</option>
            <option value="quarter">Trimestre</option>
            <option value="year">Año</option>
          </select>
          <Button variant="outline" onClick={loadProductionData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
          <Button onClick={exportReport} disabled={isExporting}>
            {isExporting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Exportar PDF
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

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50"></div>
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Eficiencia Global</CardTitle>
                <div className="p-2 bg-blue-100 rounded-lg">
                  {renderEfficiencyIcon(metrics.efficiency)}
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl font-bold text-gray-900">{(metrics.efficiency || 0).toFixed(1)}%</div>
                <p className="text-xs text-gray-600 mt-1">
                  Meta: 85% | Actual: {(metrics.efficiency || 0).toFixed(1)}%
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50"></div>
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Entregas a Tiempo</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl font-bold text-gray-900">{(metrics.onTimeDelivery || 0).toFixed(1)}%</div>
                <p className="text-xs text-gray-600 mt-1">
                  {metrics.completedOrders || 0} de {metrics.totalOrders || 0} órdenes
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-violet-50"></div>
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Tiempo Promedio</CardTitle>
                <Timer className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl font-bold text-gray-900">{(metrics.averageProductionTime || 0).toFixed(1)}h</div>
                <p className="text-xs text-gray-600 mt-1">
                  Por orden completada
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-amber-50"></div>
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Margen Promedio</CardTitle>
                <DollarSign className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl font-bold text-gray-900">{(metrics.profitMargin || 0).toFixed(1)}%</div>
                <p className="text-xs text-gray-600 mt-1">
                  Ingresos: €{(metrics.totalRevenue || 0).toFixed(0)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tendencia de Eficiencia</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={efficiencyTrendData}
                  title="Eficiencia por Semana"
                  formatType="percentage"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rendimiento por Categoría</CardTitle>
              </CardHeader>
              <CardContent>
                <DonutChart
                  data={categoryPerformanceData}
                  title="Órdenes por Tipo"
                  formatType="number"
                />
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Órdenes de Producción</CardTitle>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar órdenes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <select 
                  value={selectedStatus} 
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">Todos los estados</option>
                  <option value="COMPLETED">Completado</option>
                  <option value="IN_PROGRESS">En progreso</option>
                  <option value="DELAYED">Retrasado</option>
                  <option value="CANCELLED">Cancelado</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-gray-900">#{report.orderNumber}</h3>
                      <Badge className={getStatusColor(report.status)}>
                        {report.status === 'COMPLETED' ? 'Completado' :
                         report.status === 'IN_PROGRESS' ? 'En Progreso' :
                         report.status === 'DELAYED' ? 'Retrasado' : 'Cancelado'}
                      </Badge>
                      <div className="flex items-center gap-1">
                        {renderEfficiencyIcon(report.efficiency)}
                        <span className="text-sm font-medium">{report.efficiency}%</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Producto:</span> {report.productName}
                      </div>
                      <div>
                        <span className="font-medium">Cliente:</span> {report.customerName}
                      </div>
                      <div>
                        <span className="font-medium">Trabajador:</span> {report.worker}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right space-y-1">
                    <div className="text-sm font-medium">€{(report.revenue || 0).toFixed(2)}</div>
                    <div className="text-xs text-gray-500">
                      Margen: {(report.margin || 0).toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}