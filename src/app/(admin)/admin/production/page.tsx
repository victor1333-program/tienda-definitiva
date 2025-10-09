'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-hot-toast"
import {
  Settings,
  Package,
  Users,
  Clock,
  TrendingUp,
  BarChart3,
  Activity,
  Zap,
  Brain,
  Target,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Filter,
  Calendar,
  Play,
  Pause,
  Square,
  MoreHorizontal,
  Eye,
  Edit3,
  UserCheck,
  Timer,
  Layers,
  Truck,
  Bell,
  Award,
  ChevronRight,
  Building2,
  MapPin,
  Phone,
  Mail
} from "lucide-react"
import BarChart from "@/components/charts/BarChart"
import LineChart from "@/components/charts/LineChart"
import DonutChart from "@/components/charts/DonutChart"

interface ProductionOrder {
  id: string
  orderNumber: string
  productName: string
  quantity: number
  status: 'PENDING' | 'IN_PROGRESS' | 'QUALITY_CHECK' | 'COMPLETED' | 'CANCELLED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  estimatedTime: number
  actualTime?: number
  startedAt?: string
  completedAt?: string
  createdAt: string
  assignedTo?: {
    id: string
    name: string
    email: string
  }
  customer?: {
    name: string
    email: string
  }
  materials?: Array<{
    id: string
    name: string
    quantity: number
    unit: string
    status: 'AVAILABLE' | 'RESERVED' | 'INSUFFICIENT'
  }>
  qualityChecks?: Array<{
    id: string
    checkName: string
    status: 'PENDING' | 'PASSED' | 'FAILED'
    checkedBy?: string
    checkedAt?: string
  }>
  tasks?: Array<{
    id: string
    name: string
    description?: string
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
    estimatedTime: number
    actualTime?: number
    assignedTo?: {
      name: string
    }
  }>
}

interface ProductionStats {
  totalOrders: number
  pendingOrders: number
  inProgressOrders: number
  completedOrders: number
  averageCompletionTime: number
  onTimeDeliveryRate: number
  qualityPassRate: number
  resourceUtilization: number
  activeWorkers: number
  dailyCapacity: number
  currentLoad: number
}

interface Worker {
  id: string
  name: string
  email: string
  department: string
  status: 'AVAILABLE' | 'BUSY' | 'OFFLINE'
  currentTask?: string
  efficiency: number
  completedTasksToday: number
  skillLevel: 'JUNIOR' | 'INTERMEDIATE' | 'SENIOR' | 'EXPERT'
}

export default function ProductionPage() {
  const [orders, setOrders] = useState<ProductionOrder[]>([])
  const [filteredOrders, setFilteredOrders] = useState<ProductionOrder[]>([])
  const [workers, setWorkers] = useState<Worker[]>([])
  const [stats, setStats] = useState<ProductionStats>({
    totalOrders: 0,
    pendingOrders: 0,
    inProgressOrders: 0,
    completedOrders: 0,
    averageCompletionTime: 0,
    onTimeDeliveryRate: 0,
    qualityPassRate: 0,
    resourceUtilization: 0,
    activeWorkers: 0,
    dailyCapacity: 0,
    currentLoad: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedPriority, setSelectedPriority] = useState('all')
  const [activeTab, setActiveTab] = useState('overview')
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<ProductionOrder | null>(null)

  useEffect(() => {
    loadProductionData()
  }, [])

  const loadProductionData = async () => {
    setIsLoading(true)
    try {
      const [ordersResponse, workersResponse, statsResponse] = await Promise.all([
        fetch('/api/production/orders'),
        fetch('/api/production/workers'),
        fetch('/api/production/stats')
      ])

      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json()
        setOrders(ordersData.orders || [])
      }

      if (workersResponse.ok) {
        const workersData = await workersResponse.json()
        setWorkers(workersData.workers || [])
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData.stats || stats)
      }
    } catch (error) {
      console.error('Error loading production data:', error)
      toast.error('Error al cargar datos de producción')
    } finally {
      setIsLoading(false)
    }
  }

  const optimizeProduction = async () => {
    setIsOptimizing(true)
    try {
      const response = await fetch('/api/production/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(`Optimización completada: ${result.optimizationsApplied} mejoras aplicadas`)
        loadProductionData()
      } else {
        toast.error('Error en la optimización')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error en la optimización')
    } finally {
      setIsOptimizing(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: ProductionOrder['status']) => {
    try {
      const response = await fetch(`/api/production/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        toast.success('Estado actualizado correctamente')
        loadProductionData()
      } else {
        toast.error('Error al actualizar estado')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al actualizar estado')
    }
  }

  // Filter orders
  useEffect(() => {
    let filtered = orders

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer?.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(order => order.status === selectedStatus)
    }

    if (selectedPriority !== 'all') {
      filtered = filtered.filter(order => order.priority === selectedPriority)
    }

    setFilteredOrders(filtered)
  }, [orders, searchTerm, selectedStatus, selectedPriority])

  const getStatusColor = (status: ProductionOrder['status']) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800'
      case 'QUALITY_CHECK': return 'bg-purple-100 text-purple-800'
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: ProductionOrder['priority']) => {
    switch (priority) {
      case 'LOW': return 'bg-gray-100 text-gray-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'HIGH': return 'bg-orange-100 text-orange-800'
      case 'URGENT': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getWorkerStatusColor = (status: Worker['status']) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-100 text-green-800'
      case 'BUSY': return 'bg-orange-100 text-orange-800'
      case 'OFFLINE': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Prepare chart data
  const orderStatusData = [
    { label: 'Pendientes', value: stats.pendingOrders, color: '#f59e0b' },
    { label: 'En Progreso', value: stats.inProgressOrders, color: '#3b82f6' },
    { label: 'Completadas', value: stats.completedOrders, color: '#10b981' }
  ]

  const efficiencyData = orders
    .filter(o => o.completedAt && o.estimatedTime && o.actualTime)
    .slice(-10)
    .map(o => ({
      label: `#${o.orderNumber.substring(0, 8)}`,
      value: Math.round((o.estimatedTime! / (o.actualTime! || 1)) * 100),
      color: (o.estimatedTime! <= (o.actualTime! || 0)) ? '#10b981' : '#ef4444'
    }))

  const productionTimelineData = [
    { label: 'Lun', value: Math.floor(Math.random() * 20) + 10, color: '#3b82f6' },
    { label: 'Mar', value: Math.floor(Math.random() * 20) + 10, color: '#3b82f6' },
    { label: 'Mié', value: Math.floor(Math.random() * 20) + 10, color: '#3b82f6' },
    { label: 'Jue', value: Math.floor(Math.random() * 20) + 10, color: '#3b82f6' },
    { label: 'Vie', value: Math.floor(Math.random() * 20) + 10, color: '#3b82f6' },
    { label: 'Sáb', value: Math.floor(Math.random() * 15) + 5, color: '#3b82f6' },
    { label: 'Dom', value: Math.floor(Math.random() * 10) + 2, color: '#3b82f6' }
  ]

  const tabs = [
    { id: 'overview', label: 'Resumen', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'orders', label: 'Órdenes', icon: <Package className="w-4 h-4" /> },
    { id: 'workers', label: 'Personal', icon: <Users className="w-4 h-4" /> },
    { id: 'optimization', label: 'Optimización', icon: <Brain className="w-4 h-4" /> }
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando sistema de producción inteligente...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🤖 Producción Inteligente</h1>
          <p className="text-gray-600 mt-1">
            Sistema automatizado de gestión y optimización de producción
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={optimizeProduction}
            disabled={isOptimizing}
          >
            <Brain className="w-4 h-4 mr-2" />
            {isOptimizing ? 'Optimizando...' : 'Optimizar IA'}
          </Button>
          <Button variant="outline" onClick={loadProductionData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
          <Button onClick={() => window.open('/admin/production/board', '_blank')}>
            <Eye className="w-4 h-4 mr-2" />
            Tablero Kanban
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
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Enhanced Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50"></div>
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Capacidad Diaria</CardTitle>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Target className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round((stats.currentLoad / stats.dailyCapacity) * 100)}%
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {stats.currentLoad}/{stats.dailyCapacity} órdenes
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50"></div>
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Eficiencia</CardTitle>
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl font-bold text-green-600">
                  {stats.onTimeDeliveryRate.toFixed(1)}%
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Entregas a tiempo
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-violet-50"></div>
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Calidad</CardTitle>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Award className="h-4 w-4 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl font-bold text-purple-600">
                  {stats.qualityPassRate.toFixed(1)}%
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Tasa de aprobación
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-amber-50"></div>
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Personal Activo</CardTitle>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Users className="h-4 w-4 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl font-bold text-orange-600">{stats.activeWorkers}</div>
                <p className="text-xs text-gray-600 mt-1">
                  Trabajadores disponibles
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Estado de Órdenes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DonutChart
                  data={orderStatusData}
                  title="Distribución de Órdenes"
                  size={180}
                  formatValue={(value) => `${value} órdenes`}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Producción Semanal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={productionTimelineData}
                  title="Órdenes por Día"
                  formatValue={(value) => `${value} órdenes`}
                />
              </CardContent>
            </Card>
          </div>

          {/* Eficiencia Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Eficiencia de Órdenes Recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart
                data={efficiencyData}
                title="% de Eficiencia (Tiempo Estimado vs Real)"
                formatValue={(value) => `${value}%`}
              />
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Acciones Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border border-gray-200 rounded-lg hover:border-orange-300 transition-colors cursor-pointer"
                     onClick={() => window.open('/admin/production/board', '_blank')}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Layers className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Tablero Kanban</h3>
                      <p className="text-sm text-gray-600">Gestión visual de tareas</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg hover:border-orange-300 transition-colors cursor-pointer"
                     onClick={() => window.open('/admin/production/material-stock', '_blank')}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Package className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Stock de Materiales</h3>
                      <p className="text-sm text-gray-600">Control de inventario</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg hover:border-orange-300 transition-colors cursor-pointer"
                     onClick={() => window.open('/admin/suppliers', '_blank')}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Truck className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Proveedores</h3>
                      <p className="text-sm text-gray-600">Gestión de suministros</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <>
          {/* Filtros */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar por número de orden, producto o cliente..."
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
                    <option value="PENDING">Pendiente</option>
                    <option value="IN_PROGRESS">En Progreso</option>
                    <option value="QUALITY_CHECK">Control Calidad</option>
                    <option value="COMPLETED">Completada</option>
                    <option value="CANCELLED">Cancelada</option>
                  </select>
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="all">Todas las prioridades</option>
                    <option value="LOW">Baja</option>
                    <option value="MEDIUM">Media</option>
                    <option value="HIGH">Alta</option>
                    <option value="URGENT">Urgente</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Orders List */}
          <Card>
            <CardHeader>
              <CardTitle>Órdenes de Producción</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredOrders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No hay órdenes</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm ? 'No se encontraron órdenes con ese término de búsqueda' : 'No hay órdenes de producción'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-gray-900">#{order.orderNumber}</h3>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status === 'PENDING' ? 'Pendiente' :
                             order.status === 'IN_PROGRESS' ? 'En Progreso' :
                             order.status === 'QUALITY_CHECK' ? 'Control Calidad' :
                             order.status === 'COMPLETED' ? 'Completada' : 'Cancelada'}
                          </Badge>
                          <Badge className={getPriorityColor(order.priority)}>
                            {order.priority === 'LOW' ? 'Baja' :
                             order.priority === 'MEDIUM' ? 'Media' :
                             order.priority === 'HIGH' ? 'Alta' : 'Urgente'}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Package className="w-4 h-4" />
                            <span>{order.productName}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Layers className="w-4 h-4" />
                            <span>{order.quantity} unidades</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{order.estimatedTime}h estimadas</span>
                          </div>
                          
                          {order.assignedTo && (
                            <div className="flex items-center gap-1">
                              <UserCheck className="w-4 h-4" />
                              <span>{order.assignedTo.name}</span>
                            </div>
                          )}
                          
                          {order.customer && (
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>{order.customer.name}</span>
                            </div>
                          )}
                          
                          <div className="text-xs text-gray-500">
                            Creado: {new Date(order.createdAt).toLocaleDateString('es-ES')}
                          </div>
                        </div>

                        {order.tasks && order.tasks.length > 0 && (
                          <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                            <span>Tareas:</span>
                            <span>{order.tasks.filter(t => t.status === 'COMPLETED').length}/{order.tasks.length} completadas</span>
                            <div className="w-20 bg-gray-200 rounded-full h-1.5">
                              <div 
                                className="bg-blue-600 h-1.5 rounded-full" 
                                style={{ width: `${(order.tasks.filter(t => t.status === 'COMPLETED').length / order.tasks.length) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        {order.status === 'PENDING' && (
                          <Button
                            size="sm"
                            onClick={() => updateOrderStatus(order.id, 'IN_PROGRESS')}
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Iniciar
                          </Button>
                        )}
                        {order.status === 'IN_PROGRESS' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateOrderStatus(order.id, 'QUALITY_CHECK')}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            A Calidad
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit3 className="w-4 h-4" />
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Personal de Producción
            </CardTitle>
          </CardHeader>
          <CardContent>
            {workers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay trabajadores</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No hay personal registrado en el sistema
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {workers.map((worker) => (
                  <div
                    key={worker.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{worker.name}</h3>
                          <p className="text-sm text-gray-500">{worker.department}</p>
                        </div>
                      </div>
                      <Badge className={getWorkerStatusColor(worker.status)}>
                        {worker.status === 'AVAILABLE' ? 'Disponible' :
                         worker.status === 'BUSY' ? 'Ocupado' : 'Offline'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Eficiencia:</span>
                        <span className="font-medium">{worker.efficiency}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Tareas hoy:</span>
                        <span className="font-medium">{worker.completedTasksToday}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Nivel:</span>
                        <span className="font-medium">
                          {worker.skillLevel === 'JUNIOR' ? 'Junior' :
                           worker.skillLevel === 'INTERMEDIATE' ? 'Intermedio' :
                           worker.skillLevel === 'SENIOR' ? 'Senior' : 'Experto'}
                        </span>
                      </div>
                      {worker.currentTask && (
                        <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                          <span className="text-blue-600">Tarea actual: {worker.currentTask}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Optimization Tab */}
      {activeTab === 'optimization' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Optimización Inteligente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Análisis Automático</h3>
                  <div className="space-y-3">
                    <div className="p-3 border-l-4 border-blue-500 bg-blue-50">
                      <h4 className="font-medium text-blue-800">Carga de Trabajo</h4>
                      <p className="text-sm text-blue-700">
                        Capacidad actual: {Math.round((stats.currentLoad / stats.dailyCapacity) * 100)}%
                      </p>
                    </div>
                    <div className="p-3 border-l-4 border-green-500 bg-green-50">
                      <h4 className="font-medium text-green-800">Eficiencia</h4>
                      <p className="text-sm text-green-700">
                        {stats.onTimeDeliveryRate.toFixed(1)}% de entregas a tiempo
                      </p>
                    </div>
                    <div className="p-3 border-l-4 border-purple-500 bg-purple-50">
                      <h4 className="font-medium text-purple-800">Calidad</h4>
                      <p className="text-sm text-purple-700">
                        {stats.qualityPassRate.toFixed(1)}% de aprobación en controles
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Recomendaciones IA</h3>
                  <div className="space-y-3">
                    <div className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-yellow-600" />
                        <span className="font-medium text-gray-900">Redistribución de Tareas</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Reasignar 3 órdenes urgentes para optimizar tiempos
                      </p>
                    </div>
                    <div className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-gray-900">Planificación Predictiva</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Ajustar horarios basado en patrones históricos
                      </p>
                    </div>
                    <div className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-gray-900">Gestión de Personal</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Asignar tareas según expertise y disponibilidad
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <Button
                  onClick={optimizeProduction}
                  disabled={isOptimizing}
                  className="w-full"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  {isOptimizing ? 'Aplicando Optimizaciones...' : 'Ejecutar Optimización Completa'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}