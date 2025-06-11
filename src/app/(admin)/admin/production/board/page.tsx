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
  PlayCircle
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Input } from "@/components/ui/Input"
import fetcher from "@/lib/fetcher"
import { formatPrice, formatDate } from "@/lib/utils"
import { toast } from "react-hot-toast"

interface ProductionTask {
  id: string
  orderId: string
  orderNumber: string
  customerName: string
  taskType: 'printing' | 'cutting' | 'design' | 'assembly' | 'quality_check' | 'packaging'
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'paused' | 'completed' | 'blocked'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignedTo?: string
  estimatedTime: number
  actualTime?: number
  startedAt?: string
  completedAt?: string
  dueDate: string
  dependencies: string[]
  materials: Array<{
    id: string
    name: string
    quantity: number
    unit: string
    available: number
  }>
  equipment?: string
  progress: number
  notes?: string
  productionStage: string
  orderValue: number
}

interface ProductionStats {
  totalTasks: number
  pendingTasks: number
  inProgressTasks: number
  completedToday: number
  blockedTasks: number
  averageCompletionTime: number
  onTimeDeliveryRate: number
  equipmentUtilization: number
  activeWorkers: number
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

  const { data: tasks, error: tasksError, mutate: mutateTasks } = useSWR<ProductionTask[]>(
    '/api/production/tasks',
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

  const taskTypes = [
    { value: 'all', label: 'Todos los tipos' },
    { value: 'design', label: 'Diseño' },
    { value: 'printing', label: 'Impresión' },
    { value: 'cutting', label: 'Corte' },
    { value: 'assembly', label: 'Ensamblaje' },
    { value: 'quality_check', label: 'Control de Calidad' },
    { value: 'packaging', label: 'Empaquetado' }
  ]

  const priorities = [
    { value: 'all', label: 'Todas las prioridades' },
    { value: 'low', label: 'Baja' },
    { value: 'medium', label: 'Media' },
    { value: 'high', label: 'Alta' },
    { value: 'urgent', label: 'Urgente' }
  ]

  const statuses = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'pending', label: 'Pendiente' },
    { value: 'in_progress', label: 'En Progreso' },
    { value: 'paused', label: 'Pausada' },
    { value: 'completed', label: 'Completada' },
    { value: 'blocked', label: 'Bloqueada' }
  ]

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'design': return <Palette className="w-4 h-4" />
      case 'printing': return <Printer className="w-4 h-4" />
      case 'cutting': return <Scissors className="w-4 h-4" />
      case 'assembly': return <Package className="w-4 h-4" />
      case 'quality_check': return <CheckCircle className="w-4 h-4" />
      case 'packaging': return <Package className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const getTaskTypeColor = (type: string) => {
    switch (type) {
      case 'design': return 'bg-purple-100 text-purple-800'
      case 'printing': return 'bg-blue-100 text-blue-800'
      case 'cutting': return 'bg-orange-100 text-orange-800'
      case 'assembly': return 'bg-green-100 text-green-800'
      case 'quality_check': return 'bg-yellow-100 text-yellow-800'
      case 'packaging': return 'bg-indigo-100 text-indigo-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { label: 'Baja', variant: 'secondary' as const },
      medium: { label: 'Media', variant: 'default' as const },
      high: { label: 'Alta', variant: 'default' as const },
      urgent: { label: 'Urgente', variant: 'destructive' as const }
    }
    const config = priorityConfig[priority as keyof typeof priorityConfig] || { label: priority, variant: 'secondary' as const }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pendiente', variant: 'secondary' as const, icon: <Clock className="w-3 h-3" /> },
      in_progress: { label: 'En Progreso', variant: 'default' as const, icon: <PlayCircle className="w-3 h-3" /> },
      paused: { label: 'Pausada', variant: 'secondary' as const, icon: <PauseCircle className="w-3 h-3" /> },
      completed: { label: 'Completada', variant: 'default' as const, icon: <CheckCircle className="w-3 h-3" /> },
      blocked: { label: 'Bloqueada', variant: 'destructive' as const, icon: <AlertTriangle className="w-3 h-3" /> }
    }
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'secondary' as const, icon: null }
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {config.label}
      </Badge>
    )
  }

  const handleTaskAction = async (taskId: string, action: string) => {
    try {
      const response = await fetch(`/api/production/tasks/${taskId}/${action}`, {
        method: 'POST'
      })

      if (!response.ok) throw new Error(`Error al ${action} tarea`)

      mutateTasks()
      mutateStats()
      toast.success(`Tarea ${action === 'start' ? 'iniciada' : action === 'pause' ? 'pausada' : 'completada'} correctamente`)
    } catch (error) {
      toast.error(`Error al ${action} la tarea`)
    }
  }

  const filteredTasks = tasks?.filter(task => {
    const matchesSearch = !searchTerm || 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter
    const matchesType = typeFilter === 'all' || task.taskType === typeFilter
    const matchesAssignee = assigneeFilter === 'all' || task.assignedTo === assigneeFilter
    
    return matchesSearch && matchesStatus && matchesPriority && matchesType && matchesAssignee
  }) || []

  const groupedTasks = {
    pending: filteredTasks.filter(task => task.status === 'pending'),
    in_progress: filteredTasks.filter(task => task.status === 'in_progress'),
    paused: filteredTasks.filter(task => task.status === 'paused'),
    completed: filteredTasks.filter(task => task.status === 'completed'),
    blocked: filteredTasks.filter(task => task.status === 'blocked')
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🏭 Cola de Producción</h1>
          <p className="text-gray-600 mt-1">
            Gestión de tareas, workflow y recursos de producción
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { mutateTasks(); mutateStats() }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button>
            <Activity className="h-4 w-4 mr-2" />
            Nueva Tarea
          </Button>
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
                  <p className="text-sm font-medium text-gray-600">Tareas Totales</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalTasks || 0}</p>
                  <div className="flex items-center gap-1 mt-1 text-blue-600">
                    <TrendingUp className="w-3 h-3" />
                    <span className="text-sm font-medium">{stats.pendingTasks || 0} pendientes</span>
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
                  <p className="text-sm font-medium text-gray-600">En Progreso</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.inProgressTasks || 0}</p>
                  <div className="flex items-center gap-1 mt-1 text-green-600">
                    <PlayCircle className="w-3 h-3" />
                    <span className="text-sm font-medium">{stats.activeWorkers || 0} trabajadores activos</span>
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
                  <p className="text-sm font-medium text-gray-600">Completadas Hoy</p>
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
                  <p className="text-2xl font-bold text-gray-900">{(stats.averageCompletionTime || 0).toFixed(1)}h</p>
                  <div className="flex items-center gap-1 mt-1 text-purple-600">
                    <Timer className="w-3 h-3" />
                    <span className="text-sm font-medium">por tarea</span>
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
                  <p className="text-sm font-medium text-gray-600">Bloqueadas</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.blockedTasks || 0}</p>
                  <div className="flex items-center gap-1 mt-1 text-red-600">
                    <AlertTriangle className="w-3 h-3" />
                    <span className="text-sm font-medium">requieren atención</span>
                  </div>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
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
              {taskTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
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
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {Object.entries(groupedTasks).map(([status, statusTasks]) => (
            <Card key={status}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    {status === 'pending' && <Clock className="w-5 h-5 text-gray-500" />}
                    {status === 'in_progress' && <PlayCircle className="w-5 h-5 text-blue-500" />}
                    {status === 'paused' && <PauseCircle className="w-5 h-5 text-yellow-500" />}
                    {status === 'completed' && <CheckCircle className="w-5 h-5 text-green-500" />}
                    {status === 'blocked' && <AlertTriangle className="w-5 h-5 text-red-500" />}
                    {statuses.find(s => s.value === status)?.label}
                  </span>
                  <Badge variant="outline">{statusTasks.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {statusTasks.map((task) => (
                    <div key={task.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`p-1 rounded ${getTaskTypeColor(task.taskType)}`}>
                            {getTaskTypeIcon(task.taskType)}
                          </span>
                          <div>
                            <h4 className="font-medium text-sm">{task.title}</h4>
                            <p className="text-xs text-gray-500">#{task.orderNumber}</p>
                          </div>
                        </div>
                        {getPriorityBadge(task.priority)}
                      </div>
                      
                      <p className="text-xs text-gray-600 mb-3">{task.description}</p>
                      
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Cliente:</span>
                          <span className="font-medium">{task.customerName}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Valor:</span>
                          <span className="font-medium">{formatPrice(task.orderValue)}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Vencimiento:</span>
                          <span className="font-medium">{formatDate(new Date(task.dueDate))}</span>
                        </div>
                        {task.assignedTo && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">Asignado:</span>
                            <span className="font-medium">{task.assignedTo}</span>
                          </div>
                        )}
                      </div>

                      {task.progress > 0 && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-gray-500">Progreso</span>
                            <span className="font-medium">{task.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-primary-500 h-2 rounded-full" 
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                          {task.status === 'pending' && (
                            <Button size="sm" onClick={() => handleTaskAction(task.id, 'start')}>
                              <Play className="w-3 h-3" />
                            </Button>
                          )}
                          {task.status === 'in_progress' && (
                            <>
                              <Button size="sm" variant="outline" onClick={() => handleTaskAction(task.id, 'pause')}>
                                <Pause className="w-3 h-3" />
                              </Button>
                              <Button size="sm" onClick={() => handleTaskAction(task.id, 'complete')}>
                                <CheckCircle className="w-3 h-3" />
                              </Button>
                            </>
                          )}
                          {task.status === 'paused' && (
                            <Button size="sm" onClick={() => handleTaskAction(task.id, 'resume')}>
                              <Play className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                        <Button size="sm" variant="ghost">
                          <MoreHorizontal className="w-3 h-3" />
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
            <CardTitle>Lista de Tareas ({filteredTasks.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTasks.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay tareas</h3>
                <p className="text-gray-500">No se encontraron tareas con los filtros aplicados</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2">Tarea</th>
                      <th className="text-left py-3 px-2">Pedido</th>
                      <th className="text-left py-3 px-2">Cliente</th>
                      <th className="text-left py-3 px-2">Tipo</th>
                      <th className="text-left py-3 px-2">Estado</th>
                      <th className="text-left py-3 px-2">Prioridad</th>
                      <th className="text-left py-3 px-2">Asignado</th>
                      <th className="text-left py-3 px-2">Progreso</th>
                      <th className="text-left py-3 px-2">Vencimiento</th>
                      <th className="text-left py-3 px-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTasks.map((task) => (
                      <tr key={task.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-2">
                          <div>
                            <p className="font-medium">{task.title}</p>
                            <p className="text-sm text-gray-500">{task.description}</p>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <div>
                            <p className="font-medium">#{task.orderNumber}</p>
                            <p className="text-sm text-gray-500">{formatPrice(task.orderValue)}</p>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <p className="font-medium">{task.customerName}</p>
                        </td>
                        <td className="py-3 px-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTaskTypeColor(task.taskType)}`}>
                            {getTaskTypeIcon(task.taskType)}
                            {taskTypes.find(t => t.value === task.taskType)?.label}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          {getStatusBadge(task.status)}
                        </td>
                        <td className="py-3 px-2">
                          {getPriorityBadge(task.priority)}
                        </td>
                        <td className="py-3 px-2">
                          {task.assignedTo ? (
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <span className="text-sm">{task.assignedTo}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">Sin asignar</span>
                          )}
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-primary-500 h-2 rounded-full" 
                                style={{ width: `${task.progress}%` }}
                              />
                            </div>
                            <span className="text-xs">{task.progress}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <div>
                            <p className="text-sm">{formatDate(new Date(task.dueDate))}</p>
                            {new Date(task.dueDate) < new Date() && task.status !== 'completed' && (
                              <Badge variant="destructive" className="text-xs mt-1">Vencida</Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex gap-1">
                            {task.status === 'pending' && (
                              <Button size="sm" onClick={() => handleTaskAction(task.id, 'start')}>
                                <Play className="w-3 h-3" />
                              </Button>
                            )}
                            {task.status === 'in_progress' && (
                              <>
                                <Button size="sm" variant="outline" onClick={() => handleTaskAction(task.id, 'pause')}>
                                  <Pause className="w-3 h-3" />
                                </Button>
                                <Button size="sm" onClick={() => handleTaskAction(task.id, 'complete')}>
                                  <CheckCircle className="w-3 h-3" />
                                </Button>
                              </>
                            )}
                            {task.status === 'paused' && (
                              <Button size="sm" onClick={() => handleTaskAction(task.id, 'resume')}>
                                <Play className="w-3 h-3" />
                              </Button>
                            )}
                            <Button size="sm" variant="ghost">
                              <MoreHorizontal className="w-3 h-3" />
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