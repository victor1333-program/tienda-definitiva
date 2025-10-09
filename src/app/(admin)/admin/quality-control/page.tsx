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
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { 
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Camera,
  FileImage,
  Clock,
  User,
  Award,
  Target,
  TrendingUp,
  BarChart3,
  Settings,
  Plus,
  Edit,
  Search,
  Filter,
  Download,
  RefreshCw,
  Star,
  Zap,
  CheckSquare,
  Shield,
  Activity
} from "lucide-react"

interface QualityCheck {
  id: string
  orderNumber: string
  productName: string
  category: string
  customer: string
  inspector: string
  checkDate: string
  status: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'needs_review'
  overallScore: number // 0-100
  checklistItems: QualityCheckItem[]
  defects: QualityDefect[]
  photos: string[]
  comments: string
  approvedBy?: string
  approvedAt?: string
  productionBatch: string
  estimatedTime: number
  actualTime?: number
}

interface QualityCheckItem {
  id: string
  category: string
  description: string
  isRequired: boolean
  status: 'pending' | 'passed' | 'failed' | 'not_applicable'
  notes?: string
  weight: number // Importance weight 1-10
  criteria: string[]
}

interface QualityDefect {
  id: string
  type: string
  description: string
  severity: 'minor' | 'major' | 'critical'
  location: string
  photo?: string
  correctionAction: string
  status: 'open' | 'in_progress' | 'resolved'
  assignedTo?: string
}

interface QualityTemplate {
  id: string
  name: string
  description: string
  category: string
  isActive: boolean
  checklistItems: QualityCheckItem[]
  estimatedDuration: number // minutes
  requiredCertifications: string[]
}

interface QualityStats {
  totalChecks: number
  passRate: number
  averageScore: number
  defectRate: number
  avgCheckTime: number
  topDefects: { type: string; count: number }[]
  inspectorPerformance: { name: string; checks: number; passRate: number }[]
}

export default function QualityControlPage() {
  const [checks, setChecks] = useState<QualityCheck[]>([])
  const [templates, setTemplates] = useState<QualityTemplate[]>([])
  const [stats, setStats] = useState<QualityStats>({
    totalChecks: 0,
    passRate: 0,
    averageScore: 0,
    defectRate: 0,
    avgCheckTime: 0,
    topDefects: [],
    inspectorPerformance: []
  })
  const [selectedCheck, setSelectedCheck] = useState<QualityCheck | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadQualityChecks()
    loadTemplates()
    loadStats()
  }, [])

  const loadQualityChecks = async () => {
    try {
      const response = await fetch('/api/quality-control/checks')
      if (response.ok) {
        const data = await response.json()
        setChecks(data)
      }
    } catch (error) {
      console.error('Error loading quality checks:', error)
    }
  }

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/quality-control/templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data)
      }
    } catch (error) {
      console.error('Error loading templates:', error)
    }
  }

  const loadStats = async () => {
    try {
      const response = await fetch('/api/quality-control/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const createQualityCheck = async (orderNumber: string, templateId: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/quality-control/checks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber, templateId })
      })
      
      if (response.ok) {
        toast.success('Control de calidad iniciado')
        loadQualityChecks()
      } else {
        toast.error('Error al crear control de calidad')
      }
    } catch (error) {
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const updateCheckStatus = async (checkId: string, status: string, comments?: string) => {
    try {
      const response = await fetch(`/api/quality-control/checks/${checkId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, comments })
      })
      
      if (response.ok) {
        toast.success('Estado actualizado correctamente')
        loadQualityChecks()
        loadStats()
      } else {
        toast.error('Error al actualizar estado')
      }
    } catch (error) {
      toast.error('Error de conexión')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-gray-500" />
      case 'in_progress': return <Activity className="h-4 w-4 text-blue-500" />
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />
      case 'needs_review': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'needs_review': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'minor': return 'bg-yellow-100 text-yellow-800'
      case 'major': return 'bg-orange-100 text-orange-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredChecks = checks.filter(check => {
    const matchesStatus = filterStatus === 'all' || check.status === filterStatus
    const matchesSearch = check.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         check.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         check.customer.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Control de Calidad Digital</h1>
          <p className="text-gray-600 mt-2">Checklist y validaciones automatizadas</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => loadStats()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Control
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Controles</p>
                <p className="text-xl font-bold">{stats.totalChecks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Tasa Éxito</p>
                <p className="text-xl font-bold">{stats.passRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Score Promedio</p>
                <p className="text-xl font-bold">{stats.averageScore.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Tasa Defectos</p>
                <p className="text-xl font-bold">{stats.defectRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">T. Promedio</p>
                <p className="text-xl font-bold">{stats.avgCheckTime}min</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Mejora Mes</p>
                <p className="text-xl font-bold">+5.2%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="checks" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="checks">Controles</TabsTrigger>
          <TabsTrigger value="templates">Plantillas</TabsTrigger>
          <TabsTrigger value="analytics">Analíticas</TabsTrigger>
          <TabsTrigger value="defects">Defectos</TabsTrigger>
        </TabsList>

        {/* Quality Checks Tab */}
        <TabsContent value="checks" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Buscar por orden, producto o cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="pending">Pendientes</SelectItem>
                    <SelectItem value="in_progress">En progreso</SelectItem>
                    <SelectItem value="approved">Aprobados</SelectItem>
                    <SelectItem value="rejected">Rechazados</SelectItem>
                    <SelectItem value="needs_review">Requieren revisión</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Quality Checks List */}
          <div className="space-y-4">
            {filteredChecks.map((check) => (
              <Card key={check.id} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedCheck(check)}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 pt-1">
                      {getStatusIcon(check.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{check.productName}</h3>
                          <p className="text-gray-600">{check.orderNumber} • {check.customer}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(check.status)}>
                            {check.status.replace('_', ' ')}
                          </Badge>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Score</p>
                            <p className="font-bold text-lg">{check.overallScore}/100</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Inspector</p>
                          <p className="font-medium">{check.inspector}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Fecha</p>
                          <p className="font-medium">{new Date(check.checkDate).toLocaleDateString('es-ES')}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Categoría</p>
                          <p className="font-medium">{check.category}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Lote</p>
                          <p className="font-medium">{check.productionBatch}</p>
                        </div>
                      </div>
                      
                      {check.defects.length > 0 && (
                        <div className="flex items-center gap-2 mb-3">
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                          <span className="text-sm text-orange-700">
                            {check.defects.length} defecto(s) detectado(s)
                          </span>
                          <div className="flex gap-1">
                            {check.defects.map((defect, index) => (
                              <Badge key={index} className={getSeverityColor(defect.severity)} variant="outline">
                                {defect.severity}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <CheckSquare className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              {check.checklistItems.filter(item => item.status === 'passed').length}/
                              {check.checklistItems.length} items
                            </span>
                          </div>
                          {check.photos.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Camera className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-600">{check.photos.length} fotos</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3 mr-1" />
                            Ver Detalles
                          </Button>
                          {check.status === 'pending' && (
                            <Button size="sm" onClick={(e) => {
                              e.stopPropagation()
                              updateCheckStatus(check.id, 'in_progress')
                            }}>
                              Iniciar Control
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Plantillas de Control</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Plantilla
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <Badge variant={template.isActive ? "default" : "secondary"}>
                      {template.isActive ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Categoría</span>
                    <span className="font-medium">{template.category}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Items de control</span>
                    <span className="font-medium">{template.checklistItems.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Duración estimada</span>
                    <span className="font-medium">{template.estimatedDuration} min</span>
                  </div>
                  
                  <div className="flex items-center gap-2 pt-2">
                    <Button size="sm" variant="outline">
                      <Edit className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                    <Button size="sm">
                      <Eye className="h-3 w-3 mr-1" />
                      Ver
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Defects */}
            <Card>
              <CardHeader>
                <CardTitle>Defectos Más Frecuentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.topDefects.map((defect, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{defect.type}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-orange-500 h-2 rounded-full" 
                            style={{ width: `${(defect.count / Math.max(...stats.topDefects.map(d => d.count))) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8">{defect.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Inspector Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Rendimiento Inspectores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.inspectorPerformance.map((inspector, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{inspector.name}</span>
                        <Badge className="bg-green-100 text-green-800">
                          {inspector.passRate.toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Controles realizados</span>
                          <p className="font-semibold">{inspector.checks}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Tasa de éxito</span>
                          <Progress value={inspector.passRate} className="h-2 mt-1" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Defects Tab */}
        <TabsContent value="defects" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Defectos</CardTitle>
              <CardDescription>
                Seguimiento y resolución de defectos detectados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {checks.flatMap(check => check.defects).filter(defect => defect.status !== 'resolved').map((defect) => (
                  <div key={defect.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="flex-shrink-0">
                      <Badge className={getSeverityColor(defect.severity)}>
                        {defect.severity}
                      </Badge>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{defect.type}</h4>
                      <p className="text-sm text-gray-600 mt-1">{defect.description}</p>
                      <p className="text-xs text-gray-500 mt-2">Ubicación: {defect.location}</p>
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700">Acción correctiva:</p>
                        <p className="text-sm text-gray-600">{defect.correctionAction}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {defect.photo && (
                        <Button size="sm" variant="outline">
                          <FileImage className="h-3 w-3" />
                        </Button>
                      )}
                      <Button size="sm">
                        Resolver
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}