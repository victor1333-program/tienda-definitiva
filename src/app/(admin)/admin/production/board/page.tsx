"use client"

import { useState } from "react"
import useSWR from "swr"
import { 
  Clock,
  Play,
  Pause,
  CheckCircle,
  AlertTriangle,
  Users,
  Package,
  Settings,
  Filter,
  Search,
  RefreshCw,
  Calendar,
  Target,
  Activity,
  Timer,
  Truck,
  Printer,
  Scissors,
  Palette,
  Zap,
  User,
  MoreHorizontal,
  ArrowRight,
  TrendingUp,
  PauseCircle,
  Globe,
  Store,
  PlayCircle,
  Plus,
  X,
  Eye
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import fetcher from "@/lib/fetcher"
import { formatPrice, formatDate } from "@/lib/utils"
import { toast } from "react-hot-toast"

interface ProductionOrder {
  id: string
  orderNumber: string
  status: 'PENDING' | 'CONFIRMED' | 'IN_PRODUCTION' | 'READY_FOR_PICKUP' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED'
  orderSource: 'ONLINE' | 'STORE'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  totalAmount: number
  shippingCost: number
  taxAmount: number
  
  // Cliente
  customerEmail: string
  customerName: string
  customerPhone?: string
  
  // Fechas
  createdAt: string
  estimatedCompletionDate?: string
  productionStartedAt?: string
  productionCompletedAt?: string
  
  // Notas
  customerNotes?: string
  adminNotes?: string
  boardNotes?: string
  
  // Items del pedido con personalizaciones
  orderItems: Array<{
    id: string
    quantity: number
    unitPrice: number
    totalPrice: number
    customizationData?: any
    productionNotes?: string
    productionStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD'
    product: {
      id: string
      name: string
      images: string
    }
    variant?: {
      id: string
      size?: string
      colorName?: string
      material?: string
    }
    design?: {
      id: string
      name: string
      thumbnailUrl: string
    }
  }>
}

interface ProductionStats {
  totalOrders: number
  pendingOrders: number
  inProductionOrders: number
  completedToday: number
  readyForPickup: number
  averageProductionTime: number
  onTimeDeliveryRate: number
  totalValue: number
  onlineVsStore: {
    online: number
    store: number
  }
}

interface Equipment {
  id: string
  name: string
  type: string
  status: 'available' | 'in_use' | 'maintenance' | 'offline'
  currentTask?: string
  utilizationRate: number
}

export default function ProductionBoardPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')
  const [showNewTaskModal, setShowNewTaskModal] = useState(false)
  const [newTaskForm, setNewTaskForm] = useState({
    orderId: '',
    taskType: '',
    title: '',
    description: '',
    priority: 'medium',
    assignedTo: '',
    estimatedTime: '',
    dueDate: '',
    materials: []
  })

  const { data: orders, error: ordersError, mutate: mutateOrders } = useSWR<ProductionOrder[]>(
    '/api/production/orders',
    fetcher
  )

  const { data: stats, error: statsError, mutate: mutateStats } = useSWR<ProductionStats>(
    '/api/production/stats',
    fetcher
  )

  const { data: equipment, error: equipmentError } = useSWR<Equipment[]>(
    '/api/production/equipment',
    fetcher
  )

  const orderSources = [
    { value: 'all', label: 'Todos los orígenes' },
    { value: 'ONLINE', label: 'Online' },
    { value: 'STORE', label: 'Tienda Física' }
  ]

  const priorities = [
    { value: 'all', label: 'Todas las prioridades' },
    { value: 'LOW', label: 'Baja' },
    { value: 'MEDIUM', label: 'Media' },
    { value: 'HIGH', label: 'Alta' },
    { value: 'URGENT', label: 'Urgente' }
  ]

  const statuses = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'PENDING', label: 'Pendiente' },
    { value: 'CONFIRMED', label: 'Confirmado' },
    { value: 'IN_PRODUCTION', label: 'En Producción' },
    { value: 'READY_FOR_PICKUP', label: 'Listo para Recoger' }
  ]

  // Mapeo de estados para el tablero
  const statusMapping = {
    'PENDING': 'pending',
    'CONFIRMED': 'pending', 
    'IN_PRODUCTION': 'in_progress',
    'READY_FOR_PICKUP': 'completed'
  }

  const getOrderSourceIcon = (source: string) => {
    switch (source) {
      case 'ONLINE': return <Globe className="w-4 h-4" />
      case 'STORE': return <Store className="w-4 h-4" />
      default: return <Package className="w-4 h-4" />
    }
  }

  const getOrderSourceColor = (source: string) => {
    switch (source) {
      case 'ONLINE': return 'bg-blue-100 text-blue-800'
      case 'STORE': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      LOW: { label: 'Baja', variant: 'secondary' as const },
      MEDIUM: { label: 'Media', variant: 'default' as const },
      HIGH: { label: 'Alta', variant: 'default' as const },
      URGENT: { label: 'Urgente', variant: 'destructive' as const }
    }
    const config = priorityConfig[priority as keyof typeof priorityConfig] || { label: priority, variant: 'secondary' as const }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getStatusBadge = (status: string) => {
    const boardStatus = statusMapping[status as keyof typeof statusMapping] || 'pending'
    const statusConfig = {
      pending: { label: 'Pendiente', variant: 'secondary' as const, icon: <Clock className="w-3 h-3" /> },
      in_progress: { label: 'En Producción', variant: 'default' as const, icon: <PlayCircle className="w-3 h-3" /> },
      completed: { label: 'Listo', variant: 'default' as const, icon: <CheckCircle className="w-3 h-3" /> }
    }
    const config = statusConfig[boardStatus as keyof typeof statusConfig] || { label: status, variant: 'secondary' as const, icon: null }
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {config.label}
      </Badge>
    )
  }

  const handleOrderAction = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) throw new Error(`Error al actualizar estado del pedido`)

      mutateOrders()
      mutateStats()
      
      const statusLabels = {
        'CONFIRMED': 'confirmado',
        'IN_PRODUCTION': 'iniciado en producción',
        'READY_FOR_PICKUP': 'marcado como listo'
      }
      
      toast.success(`Pedido ${statusLabels[newStatus as keyof typeof statusLabels] || 'actualizado'} correctamente`)
    } catch (error) {
      toast.error(`Error al actualizar el pedido`)
    }
  }

  const handleCreateTask = async () => {
    try {
      // Validate required fields
      if (!newTaskForm.title || !newTaskForm.taskType || !newTaskForm.dueDate) {
        toast.error('Por favor completa todos los campos requeridos')
        return
      }

      const response = await fetch('/api/production/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newTaskForm,
          estimatedTime: parseInt(newTaskForm.estimatedTime) || 0,
          status: 'pending',
          progress: 0
        })
      })

      if (!response.ok) {
        throw new Error('Error al crear la tarea')
      }

      const newTask = await response.json()
      
      mutateTasks()
      mutateStats()
      setShowNewTaskModal(false)
      setNewTaskForm({
        orderId: '',
        taskType: '',
        title: '',
        description: '',
        priority: 'medium',
        assignedTo: '',
        estimatedTime: '',
        dueDate: '',
        materials: []
      })
      
      toast.success('Tarea creada correctamente')
    } catch (error) {
      toast.error('Error al crear la tarea')
    }
  }

  const resetForm = () => {
    setNewTaskForm({
      orderId: '',
      taskType: '',
      title: '',
      description: '',
      priority: 'medium',
      assignedTo: '',
      estimatedTime: '',
      dueDate: '',
      materials: []
    })
  }

  // Debug: Log the data
  console.log('Orders data:', orders)
  console.log('Orders error:', ordersError)
  console.log('Stats data:', stats)

  const filteredOrders = orders?.filter(order => {
    const matchesSearch = !searchTerm || 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || order.priority === priorityFilter
    const matchesSource = typeFilter === 'all' || order.orderSource === typeFilter
    
    return matchesSearch && matchesStatus && matchesPriority && matchesSource
  }) || []

  console.log('Filtered orders:', filteredOrders)

  const groupedOrders = {
    pending: filteredOrders.filter(order => statusMapping[order.status] === 'pending'),
    in_progress: filteredOrders.filter(order => statusMapping[order.status] === 'in_progress'),
    completed: filteredOrders.filter(order => statusMapping[order.status] === 'completed')
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🏭 Cola de Producción</h1>
          <p className="text-gray-600 mt-1">
            Gestión de tareas, workflow y recursos de producción
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { mutateOrders(); mutateStats() }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Dialog open={showNewTaskModal} onOpenChange={setShowNewTaskModal}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Tarea
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Crear Nueva Tarea de Producción</DialogTitle>
                <DialogDescription>
                  Completa los detalles para crear una nueva tarea en el tablero de producción.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Título de la Tarea *</Label>
                    <Input
                      id="title"
                      value={newTaskForm.title}
                      onChange={(e) => setNewTaskForm({...newTaskForm, title: e.target.value})}
                      placeholder="Ej: Impresión de diseño personalizado"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="taskType">Tipo de Tarea *</Label>
                    <Select
                      value={newTaskForm.taskType}
                      onValueChange={(value) => setNewTaskForm({...newTaskForm, taskType: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="design">Diseño</SelectItem>
                        <SelectItem value="printing">Impresión</SelectItem>
                        <SelectItem value="cutting">Corte</SelectItem>
                        <SelectItem value="assembly">Ensamblaje</SelectItem>
                        <SelectItem value="quality_check">Control de Calidad</SelectItem>
                        <SelectItem value="packaging">Empaquetado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="priority">Prioridad</Label>
                    <Select
                      value={newTaskForm.priority}
                      onValueChange={(value) => setNewTaskForm({...newTaskForm, priority: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baja</SelectItem>
                        <SelectItem value="medium">Media</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="estimatedTime">Tiempo Estimado (horas)</Label>
                    <Input
                      id="estimatedTime"
                      type="number"
                      value={newTaskForm.estimatedTime}
                      onChange={(e) => setNewTaskForm({...newTaskForm, estimatedTime: e.target.value})}
                      placeholder="Ej: 2"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="orderId">ID del Pedido</Label>
                    <Input
                      id="orderId"
                      value={newTaskForm.orderId}
                      onChange={(e) => setNewTaskForm({...newTaskForm, orderId: e.target.value})}
                      placeholder="Ej: ORD-001"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="assignedTo">Asignado a</Label>
                    <Input
                      id="assignedTo"
                      value={newTaskForm.assignedTo}
                      onChange={(e) => setNewTaskForm({...newTaskForm, assignedTo: e.target.value})}
                      placeholder="Nombre del trabajador"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="dueDate">Fecha de Vencimiento *</Label>
                    <Input
                      id="dueDate"
                      type="datetime-local"
                      value={newTaskForm.dueDate}
                      onChange={(e) => setNewTaskForm({...newTaskForm, dueDate: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={newTaskForm.description}
                      onChange={(e) => setNewTaskForm({...newTaskForm, description: e.target.value})}
                      placeholder="Describe los detalles de la tarea..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowNewTaskModal(false)
                    resetForm()
                  }}
                >
                  Cancelar
                </Button>
                <Button onClick={handleCreateTask}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Tarea
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      {!stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pedidos Totales</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalOrders || 0}</p>
                  <div className="flex items-center gap-1 mt-1 text-blue-600">
                    <TrendingUp className="w-3 h-3" />
                    <span className="text-sm font-medium">{stats.pendingOrders || 0} pendientes</span>
                  </div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">En Producción</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.inProductionOrders || 0}</p>
                  <div className="flex items-center gap-1 mt-1 text-green-600">
                    <PlayCircle className="w-3 h-3" />
                    <span className="text-sm font-medium">activos</span>
                  </div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <PlayCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Listos Hoy</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completedToday || 0}</p>
                  <div className="flex items-center gap-1 mt-1 text-emerald-600">
                    <CheckCircle className="w-3 h-3" />
                    <span className="text-sm font-medium">{(stats.onTimeDeliveryRate || 0).toFixed(1)}% a tiempo</span>
                  </div>
                </div>
                <div className="p-3 bg-emerald-50 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tiempo Promedio</p>
                  <p className="text-2xl font-bold text-gray-900">{(stats.averageProductionTime || 0).toFixed(1)}h</p>
                  <div className="flex items-center gap-1 mt-1 text-purple-600">
                    <Timer className="w-3 h-3" />
                    <span className="text-sm font-medium">por pedido</span>
                  </div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <Timer className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Valor Total</p>
                  <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.totalValue || 0)}</p>
                  <div className="flex items-center gap-1 mt-1 text-green-600">
                    <TrendingUp className="w-3 h-3" />
                    <span className="text-sm font-medium">en producción</span>
                  </div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Equipment Status - Commented out for future implementation */}
      {/* 
      {equipment && equipment.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Estado del Equipamiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {equipment.map((item) => (
                <div key={item.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    <Badge 
                      variant={item.status === 'available' ? 'default' : 
                               item.status === 'in_use' ? 'secondary' : 'destructive'}
                    >
                      {item.status === 'available' ? 'Disponible' :
                       item.status === 'in_use' ? 'En Uso' :
                       item.status === 'maintenance' ? 'Mantenimiento' : 'Offline'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{item.type}</p>
                  {item.currentTask && (
                    <p className="text-xs text-gray-500 mb-2">Tarea actual: {item.currentTask}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Utilización</span>
                    <span className="text-xs font-medium">{item.utilizationRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-primary-500 h-2 rounded-full" 
                      style={{ width: `${item.utilizationRate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      */}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros y Vista
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar tareas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              {statuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              {priorities.map(priority => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              {orderSources.map(source => (
                <option key={source.value} value={source.value}>
                  {source.label}
                </option>
              ))}
            </select>

            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="all">Todos los asignados</option>
              {/* Aquí se cargarían dinámicamente los usuarios */}
            </select>

            <div className="flex gap-2">
              <Button
                variant={viewMode === 'kanban' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('kanban')}
              >
                Kanban
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                Lista
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
          {Object.entries(groupedOrders).map(([status, statusOrders]) => (
            <Card key={status}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    {status === 'pending' && <Clock className="w-5 h-5 text-gray-500" />}
                    {status === 'in_progress' && <PlayCircle className="w-5 h-5 text-blue-500" />}
                    {status === 'completed' && <CheckCircle className="w-5 h-5 text-green-500" />}
                    {status === 'pending' ? 'Pendientes' : 
                     status === 'in_progress' ? 'En Producción' : 
                     status === 'completed' ? 'Listos' : status}
                  </span>
                  <Badge variant="outline">{statusOrders.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {statusOrders.map((order) => (
                    <div key={order.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`p-1 rounded ${getOrderSourceColor(order.orderSource)}`}>
                            {getOrderSourceIcon(order.orderSource)}
                          </span>
                          <div>
                            <h4 className="font-medium text-sm">#{order.orderNumber}</h4>
                            <p className="text-xs text-gray-500">{order.orderItems.length} productos</p>
                          </div>
                        </div>
                        {getPriorityBadge(order.priority)}
                      </div>
                      
                      <p className="text-xs text-gray-600 mb-3">{order.customerNotes || 'Sin notas del cliente'}</p>
                      
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Cliente:</span>
                          <span className="font-medium">{order.customerName}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Valor:</span>
                          <span className="font-medium">{formatPrice(order.totalAmount)}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Creado:</span>
                          <span className="font-medium">{formatDate(new Date(order.createdAt))}</span>
                        </div>
                        {order.estimatedCompletionDate && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">Estimado:</span>
                            <span className="font-medium">{formatDate(new Date(order.estimatedCompletionDate))}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                          {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
                            <Button size="sm" onClick={() => handleOrderAction(order.id, 'IN_PRODUCTION')}>
                              <Play className="w-3 h-3" />
                            </Button>
                          )}
                          {order.status === 'IN_PRODUCTION' && (
                            <Button size="sm" onClick={() => handleOrderAction(order.id, 'READY_FOR_PICKUP')}>
                              <CheckCircle className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => window.open(`/admin/orders/${order.id}`, '_blank')}>
                          <Eye className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Lista de Pedidos ({filteredOrders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredOrders.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay pedidos</h3>
                <p className="text-gray-500">No se encontraron pedidos con los filtros aplicados</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2">Pedido</th>
                      <th className="text-left py-3 px-2">Cliente</th>
                      <th className="text-left py-3 px-2">Productos</th>
                      <th className="text-left py-3 px-2">Origen</th>
                      <th className="text-left py-3 px-2">Estado</th>
                      <th className="text-left py-3 px-2">Prioridad</th>
                      <th className="text-left py-3 px-2">Valor</th>
                      <th className="text-left py-3 px-2">Creado</th>
                      <th className="text-left py-3 px-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-2">
                          <div>
                            <p className="font-medium">#{order.orderNumber}</p>
                            <p className="text-sm text-gray-500">{order.customerNotes ? order.customerNotes.substring(0, 50) + '...' : 'Sin notas'}</p>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <div>
                            <p className="font-medium">{order.customerName}</p>
                            <p className="text-sm text-gray-500">{order.customerEmail}</p>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <div>
                            <p className="font-medium">{order.orderItems.length} productos</p>
                            <p className="text-sm text-gray-500">
                              {order.orderItems.slice(0, 2).map(item => item.product.name).join(', ')}
                              {order.orderItems.length > 2 && '...'}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getOrderSourceColor(order.orderSource)}`}>
                            {getOrderSourceIcon(order.orderSource)}
                            {orderSources.find(s => s.value === order.orderSource)?.label}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          {getStatusBadge(order.status)}
                        </td>
                        <td className="py-3 px-2">
                          {getPriorityBadge(order.priority)}
                        </td>
                        <td className="py-3 px-2">
                          <p className="font-medium">{formatPrice(order.totalAmount)}</p>
                        </td>
                        <td className="py-3 px-2">
                          <div>
                            <p className="text-sm">{formatDate(new Date(order.createdAt))}</p>
                            {order.estimatedCompletionDate && (
                              <p className="text-xs text-gray-500">Est: {formatDate(new Date(order.estimatedCompletionDate))}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex gap-1">
                            {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
                              <Button size="sm" onClick={() => handleOrderAction(order.id, 'IN_PRODUCTION')}>
                                <Play className="w-3 h-3" />
                              </Button>
                            )}
                            {order.status === 'IN_PRODUCTION' && (
                              <Button size="sm" onClick={() => handleOrderAction(order.id, 'READY_FOR_PICKUP')}>
                                <CheckCircle className="w-3 h-3" />
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" onClick={() => window.open(`/admin/orders/${order.id}`, '_blank')}>
                              <Eye className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}