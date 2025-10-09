"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { 
  Users,
  Clock,
  Target,
  Zap,
  Settings,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Play,
  Pause,
  RotateCcw,
  User,
  Calendar,
  Activity,
  Brain,
  Award,
  Factory,
  Timer,
  BarChart3,
  ArrowRight,
  Plus,
  Edit,
  Eye,
  Star,
  Wrench
} from "lucide-react"

interface Worker {
  id: string
  name: string
  avatar?: string
  email: string
  department: string
  skills: string[]
  skillLevels: { [skill: string]: number } // 1-5 scale
  currentWorkload: number // 0-100%
  maxCapacity: number // hours per day
  efficiency: number // 0-100%
  qualityScore: number // 0-10
  availability: 'available' | 'busy' | 'break' | 'offline'
  shiftStart: string
  shiftEnd: string
  currentTasks: number
  completedToday: number
  avgTaskTime: number // minutes
  certifications: string[]
}

interface Task {
  id: string
  title: string
  description: string
  orderNumber: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  estimatedTime: number // minutes
  requiredSkills: string[]
  difficulty: number // 1-5
  deadline: string
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'paused'
  assignedTo?: string
  assignedAt?: string
  startedAt?: string
  completedAt?: string
  progress: number // 0-100%
  category: string
  customer: string
  dependencies: string[]
  tools: string[]
}

interface AssignmentRule {
  id: string
  name: string
  description: string
  isActive: boolean
  priority: number
  conditions: {
    skillMatch: number // minimum skill level required
    workloadLimit: number // max workload percentage
    preferredWorkers: string[]
    timeOfDay: string[]
    maxTasksPerWorker: number
  }
  actions: {
    autoAssign: boolean
    notifyWorker: boolean
    escalateIfUnassigned: number // minutes
    redistributeOnOverload: boolean
  }
}

export default function TaskAssignmentPage() {
  const [workers, setWorkers] = useState<Worker[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [rules, setRules] = useState<AssignmentRule[]>([])
  const [selectedTab, setSelectedTab] = useState('overview')
  const [autoAssignmentEnabled, setAutoAssignmentEnabled] = useState(true)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    totalTasks: 0,
    assignedTasks: 0,
    completedToday: 0,
    averageAssignmentTime: 0,
    workloadBalance: 0,
    efficiency: 0
  })

  useEffect(() => {
    loadWorkers()
    loadTasks()
    loadRules()
    loadStats()
  }, [])

  const loadWorkers = async () => {
    try {
      const response = await fetch('/api/task-assignment/workers')
      if (response.ok) {
        const data = await response.json()
        setWorkers(data)
      }
    } catch (error) {
      console.error('Error loading workers:', error)
    }
  }

  const loadTasks = async () => {
    try {
      const response = await fetch('/api/task-assignment/tasks')
      if (response.ok) {
        const data = await response.json()
        setTasks(data)
      }
    } catch (error) {
      console.error('Error loading tasks:', error)
    }
  }

  const loadRules = async () => {
    try {
      const response = await fetch('/api/task-assignment/rules')
      if (response.ok) {
        const data = await response.json()
        setRules(data)
      }
    } catch (error) {
      console.error('Error loading rules:', error)
    }
  }

  const loadStats = async () => {
    try {
      const response = await fetch('/api/task-assignment/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const runAutoAssignment = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/task-assignment/auto-assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        const result = await response.json()
        toast.success(`${result.assignedCount} tareas asignadas automáticamente`)
        loadTasks()
        loadWorkers()
        loadStats()
      } else {
        toast.error('Error en la asignación automática')
      }
    } catch (error) {
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const assignTaskManually = async (taskId: string, workerId: string) => {
    try {
      const response = await fetch('/api/task-assignment/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, workerId })
      })
      
      if (response.ok) {
        toast.success('Tarea asignada correctamente')
        loadTasks()
        loadWorkers()
      } else {
        toast.error('Error al asignar la tarea')
      }
    } catch (error) {
      toast.error('Error de conexión')
    }
  }

  const redistributeWorkload = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/task-assignment/redistribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        const result = await response.json()
        toast.success(`Carga de trabajo redistribuida: ${result.redistributedCount} tareas`)
        loadTasks()
        loadWorkers()
      } else {
        toast.error('Error en la redistribución')
      }
    } catch (error) {
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-gray-500" />
      case 'assigned': return <User className="h-4 w-4 text-blue-500" />
      case 'in_progress': return <Play className="h-4 w-4 text-green-500" />
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'paused': return <Pause className="h-4 w-4 text-yellow-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-green-500'
      case 'busy': return 'bg-red-500'
      case 'break': return 'bg-yellow-500'
      case 'offline': return 'bg-gray-400'
      default: return 'bg-gray-400'
    }
  }

  const pendingTasks = tasks.filter(task => task.status === 'pending')
  const assignedTasks = tasks.filter(task => task.status === 'assigned' || task.status === 'in_progress')
  const availableWorkers = workers.filter(worker => worker.availability === 'available')

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Asignación Automática de Tareas</h1>
          <p className="text-gray-600 mt-2">Distribución inteligente del trabajo de producción</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Label htmlFor="auto-assign">Auto-asignación</Label>
            <Switch
              id="auto-assign"
              checked={autoAssignmentEnabled}
              onCheckedChange={setAutoAssignmentEnabled}
            />
          </div>
          <Button onClick={redistributeWorkload} variant="outline" disabled={loading}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Redistribuir
          </Button>
          <Button onClick={runAutoAssignment} disabled={loading}>
            <Brain className="h-4 w-4 mr-2" />
            Asignar Automáticamente
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Tareas Totales</p>
                <p className="text-xl font-bold">{stats.totalTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Asignadas</p>
                <p className="text-xl font-bold">{stats.assignedTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Completadas Hoy</p>
                <p className="text-xl font-bold">{stats.completedToday}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">T. Asignación</p>
                <p className="text-xl font-bold">{stats.averageAssignmentTime}min</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Balance Carga</p>
                <p className="text-xl font-bold">{stats.workloadBalance}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Eficiencia</p>
                <p className="text-xl font-bold">{stats.efficiency}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="workers">Trabajadores</TabsTrigger>
          <TabsTrigger value="tasks">Tareas</TabsTrigger>
          <TabsTrigger value="rules">Reglas</TabsTrigger>
          <TabsTrigger value="analytics">Analíticas</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Tareas Pendientes ({pendingTasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                {pendingTasks.slice(0, 8).map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{task.title}</h4>
                        <Badge className={getPriorityColor(task.priority)} variant="outline">
                          {task.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">{task.orderNumber} • {task.estimatedTime}min</p>
                      <div className="flex items-center gap-1 mt-1">
                        {task.requiredSkills.slice(0, 2).map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button size="sm">
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Available Workers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Trabajadores Disponibles ({availableWorkers.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                {availableWorkers.map((worker) => (
                  <div key={worker.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {worker.name.charAt(0)}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 h-3 w-3 border-2 border-white rounded-full ${
                        getAvailabilityColor(worker.availability)
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm">{worker.name}</h4>
                        <Badge variant="outline">{worker.department}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-600 mt-1">
                        <span>Carga: {worker.currentWorkload}%</span>
                        <span>Tareas: {worker.currentTasks}</span>
                        <span>Eficiencia: {worker.efficiency}%</span>
                      </div>
                      <Progress value={worker.currentWorkload} className="h-1 mt-2" />
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge className="bg-green-100 text-green-800">
                        <Star className="h-3 w-3 mr-1" />
                        {worker.qualityScore.toFixed(1)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Assignment Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Recomendaciones de Asignación IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-900">Optimización Detectada</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      María González tiene 3 tareas de diseño pendientes y 40% de carga. 
                      Recomendado asignar tarea "Diseño Logo Corporativo" por alta compatibilidad de skills.
                    </p>
                    <Button size="sm" className="mt-2">
                      Aplicar Sugerencia
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 bg-orange-50 rounded-lg">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-orange-900">Sobrecarga Detectada</h4>
                    <p className="text-sm text-orange-700 mt-1">
                      Carlos Ruiz tiene 95% de carga de trabajo. Redistribuir 2 tareas a otros operarios 
                      para optimizar tiempos de entrega.
                    </p>
                    <Button size="sm" variant="outline" className="mt-2">
                      Redistribuir
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workers Tab */}
        <TabsContent value="workers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workers.map((worker) => (
              <Card key={worker.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {worker.name.charAt(0)}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 h-4 w-4 border-2 border-white rounded-full ${
                        getAvailabilityColor(worker.availability)
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{worker.name}</h3>
                      <p className="text-sm text-gray-600">{worker.department}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Carga Actual</p>
                      <Progress value={worker.currentWorkload} className="h-2 mt-1" />
                      <p className="text-xs mt-1">{worker.currentWorkload}%</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Eficiencia</p>
                      <p className="font-semibold text-green-600">{worker.efficiency}%</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Tareas Actuales</p>
                      <p className="font-semibold">{worker.currentTasks}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Calidad</p>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        <span className="font-semibold">{worker.qualityScore.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Habilidades:</p>
                    <div className="flex flex-wrap gap-1">
                      {worker.skills.slice(0, 4).map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-3 w-3 mr-1" />
                      Ver Perfil
                    </Button>
                    <Button size="sm">
                      <Plus className="h-3 w-3 mr-1" />
                      Asignar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Tareas</CardTitle>
              <CardDescription>
                Vista completa de todas las tareas del sistema de producción
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex-shrink-0">
                      {getStatusIcon(task.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{task.title}</h4>
                        <Badge className={getPriorityColor(task.priority)} variant="outline">
                          {task.priority}
                        </Badge>
                        <Badge variant="secondary">{task.category}</Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Pedido</p>
                          <p className="font-medium">{task.orderNumber}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Tiempo Est.</p>
                          <p className="font-medium">{task.estimatedTime} min</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Cliente</p>
                          <p className="font-medium">{task.customer}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Progreso</p>
                          <div className="flex items-center gap-2">
                            <Progress value={task.progress} className="h-2 flex-1" />
                            <span className="text-xs">{task.progress}%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-600">Skills:</span>
                        {task.requiredSkills.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {task.assignedTo && (
                        <div className="text-sm">
                          <p className="text-gray-600">Asignado a:</p>
                          <p className="font-medium">
                            {workers.find(w => w.id === task.assignedTo)?.name || 'N/A'}
                          </p>
                        </div>
                      )}
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rules Tab */}
        <TabsContent value="rules" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Reglas de Asignación</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Regla
            </Button>
          </div>
          
          <div className="space-y-4">
            {rules.map((rule) => (
              <Card key={rule.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{rule.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={rule.isActive ? "default" : "secondary"}>
                        {rule.isActive ? 'Activa' : 'Inactiva'}
                      </Badge>
                      <span className="text-sm text-gray-600">Prioridad: {rule.priority}</span>
                    </div>
                  </div>
                  <CardDescription>{rule.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Condiciones:</p>
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li>• Skill mínimo: {rule.conditions.skillMatch}/5</li>
                        <li>• Carga máxima: {rule.conditions.workloadLimit}%</li>
                        <li>• Tareas máx/trabajador: {rule.conditions.maxTasksPerWorker}</li>
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Acciones:</p>
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li>• Auto-asignar: {rule.actions.autoAssign ? 'Sí' : 'No'}</li>
                        <li>• Notificar trabajador: {rule.actions.notifyWorker ? 'Sí' : 'No'}</li>
                        <li>• Escalar en: {rule.actions.escalateIfUnassigned} min</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      <Edit className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                    <Switch
                      checked={rule.isActive}
                      onCheckedChange={(checked) => {
                        // Handle rule toggle
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Carga de Trabajo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {workers.slice(0, 6).map((worker) => (
                    <div key={worker.id} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>{worker.name}</span>
                        <span className="font-medium">{worker.currentWorkload}%</span>
                      </div>
                      <Progress value={worker.currentWorkload} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Eficiencia por Departamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Factory className="h-5 w-5 text-blue-500" />
                      <span className="font-medium">Producción</span>
                    </div>
                    <span className="font-bold text-blue-600">87%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-green-500" />
                      <span className="font-medium">Diseño</span>
                    </div>
                    <span className="font-bold text-green-600">92%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-5 w-5 text-purple-500" />
                      <span className="font-medium">Mantenimiento</span>
                    </div>
                    <span className="font-bold text-purple-600">78%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-orange-500" />
                      <span className="font-medium">Control Calidad</span>
                    </div>
                    <span className="font-bold text-orange-600">95%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}