"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import {
  Zap,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Factory,
  Target,
  Settings,
  RefreshCw,
  Play,
  Pause,
  RotateCcw,
  Users,
  Package,
  Timer,
  Activity,
  Lightbulb,
  Wrench,
  Award,
  ArrowUp,
  ArrowDown,
  Minus,
  Plus,
  Eye,
  Download,
  Calendar
} from "lucide-react"

interface ProcessStep {
  id: string
  name: string
  description: string
  category: 'preparation' | 'production' | 'quality' | 'packaging' | 'shipping'
  estimatedTime: number // minutes
  actualTime: number // minutes
  efficiency: number // percentage
  bottleneckRisk: 'low' | 'medium' | 'high'
  workers: number
  resources: string[]
  dependencies: string[]
  automationLevel: number // 0-100
  qualityImpact: number // 1-10
}

interface OptimizationRecommendation {
  id: string
  stepId: string
  type: 'automation' | 'resource' | 'workflow' | 'skill' | 'equipment'
  title: string
  description: string
  impact: 'low' | 'medium' | 'high'
  effort: 'low' | 'medium' | 'high'
  estimatedSavings: number // minutes per day
  cost: number // euros
  priority: number // 1-10
  status: 'pending' | 'analyzing' | 'approved' | 'in_progress' | 'completed' | 'rejected'
  timeline: string
}

interface ProductionMetrics {
  totalProcessingTime: number
  averageCycleTime: number
  throughput: number // orders per day
  efficiency: number // percentage
  bottlenecks: ProcessStep[]
  waitingTime: number
  activeTime: number
  setupTime: number
  qualityTime: number
  potentialSavings: number
}

interface TimeAnalysis {
  step: ProcessStep
  historicalData: {
    date: string
    time: number
    efficiency: number
    issues: string[]
  }[]
  trends: {
    direction: 'up' | 'down' | 'stable'
    percentage: number
    period: string
  }
  predictions: {
    nextWeek: number
    nextMonth: number
    optimized: number
  }
}

export default function ProductionOptimizationPage() {
  const [processSteps, setProcessSteps] = useState<ProcessStep[]>([])
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([])
  const [metrics, setMetrics] = useState<ProductionMetrics>({
    totalProcessingTime: 0,
    averageCycleTime: 0,
    throughput: 0,
    efficiency: 0,
    bottlenecks: [],
    waitingTime: 0,
    activeTime: 0,
    setupTime: 0,
    qualityTime: 0,
    potentialSavings: 0
  })
  const [selectedStep, setSelectedStep] = useState<ProcessStep | null>(null)
  const [analysisMode, setAnalysisMode] = useState<'realtime' | 'historical' | 'simulation'>('realtime')
  const [optimizationRunning, setOptimizationRunning] = useState(false)
  const [timeframe, setTimeframe] = useState('7d')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadProcessSteps()
    loadRecommendations()
    loadMetrics()
  }, [timeframe])

  const loadProcessSteps = async () => {
    try {
      const response = await fetch(`/api/production-optimization/steps?timeframe=${timeframe}`)
      if (response.ok) {
        const data = await response.json()
        setProcessSteps(data)
      }
    } catch (error) {
      console.error('Error loading process steps:', error)
    }
  }

  const loadRecommendations = async () => {
    try {
      const response = await fetch('/api/production-optimization/recommendations')
      if (response.ok) {
        const data = await response.json()
        setRecommendations(data)
      }
    } catch (error) {
      console.error('Error loading recommendations:', error)
    }
  }

  const loadMetrics = async () => {
    try {
      const response = await fetch(`/api/production-optimization/metrics?timeframe=${timeframe}`)
      if (response.ok) {
        const data = await response.json()
        setMetrics(data)
      }
    } catch (error) {
      console.error('Error loading metrics:', error)
    }
  }

  const runOptimizationAnalysis = async () => {
    setOptimizationRunning(true)
    setLoading(true)
    try {
      const response = await fetch('/api/production-optimization/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          analysisType: 'full',
          timeframe,
          includeSimulation: true 
        })
      })
      
      if (response.ok) {
        toast.success('Análisis de optimización completado')
        await loadRecommendations()
        await loadMetrics()
      } else {
        toast.error('Error en el análisis')
      }
    } catch (error) {
      toast.error('Error de conexión')
    } finally {
      setOptimizationRunning(false)
      setLoading(false)
    }
  }

  const applyRecommendation = async (recommendationId: string) => {
    try {
      const response = await fetch(`/api/production-optimization/recommendations/${recommendationId}/apply`, {
        method: 'POST'
      })
      
      if (response.ok) {
        toast.success('Recomendación aplicada')
        loadRecommendations()
      } else {
        toast.error('Error al aplicar recomendación')
      }
    } catch (error) {
      toast.error('Error de conexión')
    }
  }

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return 'text-green-600'
    if (efficiency >= 75) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getBottleneckColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'low': return <ArrowUp className="h-4 w-4 text-green-500" />
      case 'medium': return <TrendingUp className="h-4 w-4 text-yellow-500" />
      case 'high': return <Zap className="h-4 w-4 text-red-500" />
      default: return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const getRecommendationTypeIcon = (type: string) => {
    switch (type) {
      case 'automation': return <Settings className="h-4 w-4 text-blue-500" />
      case 'resource': return <Users className="h-4 w-4 text-green-500" />
      case 'workflow': return <Activity className="h-4 w-4 text-purple-500" />
      case 'skill': return <Award className="h-4 w-4 text-orange-500" />
      case 'equipment': return <Wrench className="h-4 w-4 text-gray-500" />
      default: return <Lightbulb className="h-4 w-4 text-yellow-500" />
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Optimización de Tiempos</h1>
          <p className="text-gray-600 mt-2">Análisis y mejora de procesos productivos</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24 horas</SelectItem>
              <SelectItem value="7d">7 días</SelectItem>
              <SelectItem value="30d">30 días</SelectItem>
              <SelectItem value="90d">90 días</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => loadMetrics()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button 
            onClick={runOptimizationAnalysis}
            disabled={optimizationRunning}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            {optimizationRunning ? (
              <><Activity className="h-4 w-4 mr-2 animate-spin" />Analizando...</>
            ) : (
              <><Zap className="h-4 w-4 mr-2" />Optimizar Procesos</>
            )}
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Tiempo Total</p>
                <p className="text-xl font-bold">{metrics.totalProcessingTime}min</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Eficiencia</p>
                <p className={`text-xl font-bold ${getEfficiencyColor(metrics.efficiency)}`}>
                  {metrics.efficiency.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Rendimiento</p>
                <p className="text-xl font-bold">{metrics.throughput}/día</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Cuellos Botella</p>
                <p className="text-xl font-bold">{metrics.bottlenecks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">T. Espera</p>
                <p className="text-xl font-bold">{metrics.waitingTime}min</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              <div>
                <p className="text-sm text-gray-600">Ahorro Pot.</p>
                <p className="text-xl font-bold">{metrics.potentialSavings}min</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="processes">Procesos</TabsTrigger>
          <TabsTrigger value="recommendations">Recomendaciones</TabsTrigger>
          <TabsTrigger value="analysis">Análisis</TabsTrigger>
          <TabsTrigger value="simulation">Simulación</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Process Flow */}
            <Card>
              <CardHeader>
                <CardTitle>Flujo de Procesos</CardTitle>
                <CardDescription>Estado actual del flujo productivo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {processSteps.slice(0, 6).map((step, index) => (
                    <div key={step.id} className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          step.efficiency >= 90 ? 'bg-green-100 text-green-800' :
                          step.efficiency >= 75 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{step.name}</span>
                          <div className="flex items-center gap-2">
                            <Badge className={getBottleneckColor(step.bottleneckRisk)}>
                              {step.bottleneckRisk}
                            </Badge>
                            <span className="text-sm text-gray-600">{step.actualTime}min</span>
                          </div>
                        </div>
                        <Progress value={step.efficiency} className="h-2 mt-1" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Time Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Tiempos</CardTitle>
                <CardDescription>Análisis del uso del tiempo en producción</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tiempo Activo</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${(metrics.activeTime / metrics.totalProcessingTime) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{metrics.activeTime}min</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tiempo Espera</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full" 
                          style={{ width: `${(metrics.waitingTime / metrics.totalProcessingTime) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{metrics.waitingTime}min</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tiempo Setup</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-500 h-2 rounded-full" 
                          style={{ width: `${(metrics.setupTime / metrics.totalProcessingTime) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{metrics.setupTime}min</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tiempo Calidad</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${(metrics.qualityTime / metrics.totalProcessingTime) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{metrics.qualityTime}min</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">Ahorro Potencial</span>
                    <span className="text-lg font-bold text-green-600">-{metrics.potentialSavings}min</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Reducción estimada aplicando todas las optimizaciones
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Bottlenecks */}
          <Card>
            <CardHeader>
              <CardTitle>Cuellos de Botella Críticos</CardTitle>
              <CardDescription>Procesos que limitan la productividad general</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {metrics.bottlenecks.slice(0, 3).map((bottleneck) => (
                  <div key={bottleneck.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{bottleneck.name}</h4>
                      <Badge className={getBottleneckColor(bottleneck.bottleneckRisk)}>
                        {bottleneck.bottleneckRisk}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tiempo actual:</span>
                        <span className="font-medium">{bottleneck.actualTime}min</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tiempo estimado:</span>
                        <span className="font-medium">{bottleneck.estimatedTime}min</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Eficiencia:</span>
                        <span className={`font-medium ${getEfficiencyColor(bottleneck.efficiency)}`}>
                          {bottleneck.efficiency.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Trabajadores:</span>
                        <span className="font-medium">{bottleneck.workers}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="w-full mt-3" 
                           onClick={() => setSelectedStep(bottleneck)}>
                      <Eye className="h-3 w-3 mr-1" />
                      Analizar
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Processes Tab */}
        <TabsContent value="processes" className="space-y-6">
          <div className="space-y-4">
            {processSteps.map((step) => (
              <Card key={step.id} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedStep(step)}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 pt-1">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        step.category === 'preparation' ? 'bg-blue-100 text-blue-700' :
                        step.category === 'production' ? 'bg-green-100 text-green-700' :
                        step.category === 'quality' ? 'bg-purple-100 text-purple-700' :
                        step.category === 'packaging' ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {step.category === 'preparation' ? <Settings className="h-5 w-5" /> :
                         step.category === 'production' ? <Factory className="h-5 w-5" /> :
                         step.category === 'quality' ? <CheckCircle className="h-5 w-5" /> :
                         step.category === 'packaging' ? <Package className="h-5 w-5" /> :
                         <Activity className="h-5 w-5" />}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{step.name}</h3>
                          <p className="text-gray-600">{step.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getBottleneckColor(step.bottleneckRisk)}>
                            {step.bottleneckRisk} risk
                          </Badge>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Eficiencia</p>
                            <p className={`font-bold text-lg ${getEfficiencyColor(step.efficiency)}`}>
                              {step.efficiency.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Tiempo Estimado</p>
                          <p className="font-medium">{step.estimatedTime}min</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Tiempo Real</p>
                          <p className="font-medium">{step.actualTime}min</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Trabajadores</p>
                          <p className="font-medium">{step.workers}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Automatización</p>
                          <p className="font-medium">{step.automationLevel}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Impacto Calidad</p>
                          <p className="font-medium">{step.qualityImpact}/10</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Wrench className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              {step.resources.length} recursos
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Activity className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              {step.dependencies.length} dependencias
                            </span>
                          </div>
                        </div>
                        
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          Ver Detalles
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recomendaciones de Optimización</h3>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-100 text-blue-800">
                {recommendations.filter(r => r.status === 'pending').length} pendientes
              </Badge>
              <Badge className="bg-green-100 text-green-800">
                {recommendations.filter(r => r.status === 'approved').length} aprobadas
              </Badge>
            </div>
          </div>
          
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <Card key={rec.id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 pt-1">
                      {getRecommendationTypeIcon(rec.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-lg">{rec.title}</h4>
                          <p className="text-gray-600">{rec.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getImpactIcon(rec.impact)}
                          <Badge variant={rec.status === 'pending' ? 'outline' : 'default'}>
                            {rec.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Impacto</p>
                          <p className="font-medium capitalize">{rec.impact}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Esfuerzo</p>
                          <p className="font-medium capitalize">{rec.effort}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Ahorro Diario</p>
                          <p className="font-medium text-green-600">{rec.estimatedSavings}min</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Costo</p>
                          <p className="font-medium">{rec.cost > 0 ? `€${rec.cost}` : 'Gratis'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Timeline</p>
                          <p className="font-medium">{rec.timeline}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Target className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">Prioridad: {rec.priority}/10</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {rec.status === 'pending' && (
                            <>
                              <Button size="sm" variant="outline">
                                Rechazar
                              </Button>
                              <Button size="sm" onClick={() => applyRecommendation(rec.id)}>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Aprobar
                              </Button>
                            </>
                          )}
                          {rec.status === 'approved' && (
                            <Button size="sm" variant="outline">
                              <Play className="h-3 w-3 mr-1" />
                              Implementar
                            </Button>
                          )}
                          {rec.status === 'in_progress' && (
                            <Badge className="bg-blue-100 text-blue-800">
                              En progreso
                            </Badge>
                          )}
                          {rec.status === 'completed' && (
                            <Badge className="bg-green-100 text-green-800">
                              Completado
                            </Badge>
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

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Análisis Detallado de Tiempos</CardTitle>
              <CardDescription>
                Tendencias históricas y proyecciones de optimización
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Historical Trends */}
                <div>
                  <h4 className="font-medium mb-4">Tendencias Históricas</h4>
                  <div className="space-y-3">
                    {processSteps.slice(0, 5).map((step) => (
                      <div key={step.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{step.name}</p>
                          <p className="text-sm text-gray-600">Promedio: {step.actualTime}min</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {Math.random() > 0.5 ? (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          )}
                          <span className={`text-sm font-medium ${
                            Math.random() > 0.5 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {Math.random() > 0.5 ? '+' : '-'}{(Math.random() * 10).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Predictions */}
                <div>
                  <h4 className="font-medium mb-4">Proyecciones</h4>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h5 className="font-medium text-blue-900">Próxima Semana</h5>
                      <p className="text-sm text-blue-700 mt-1">
                        Tiempo total estimado: {metrics.totalProcessingTime - 15}min
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Mejora esperada: 15min menos por orden
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h5 className="font-medium text-green-900">Con Optimizaciones</h5>
                      <p className="text-sm text-green-700 mt-1">
                        Tiempo total optimizado: {metrics.totalProcessingTime - metrics.potentialSavings}min
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        Ahorro total: {metrics.potentialSavings}min por orden
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h5 className="font-medium text-purple-900">Impacto Mensual</h5>
                      <p className="text-sm text-purple-700 mt-1">
                        Ahorro estimado: {(metrics.potentialSavings * metrics.throughput * 30)} min/mes
                      </p>
                      <p className="text-xs text-purple-600 mt-1">
                        Equivale a {Math.round((metrics.potentialSavings * metrics.throughput * 30) / 60)} horas
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Simulation Tab */}
        <TabsContent value="simulation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Simulador de Optimizaciones</CardTitle>
              <CardDescription>
                Prueba diferentes escenarios de optimización antes de implementarlos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Simulation Controls */}
                <div>
                  <h4 className="font-medium mb-4">Configurar Simulación</h4>
                  <div className="space-y-4">
                    <div>
                      <Label>Número de trabajadores adicionales</Label>
                      <Input type="number" min="0" max="10" defaultValue="0" className="mt-1" />
                    </div>
                    <div>
                      <Label>Nivel de automatización (%)</Label>
                      <Input type="number" min="0" max="100" defaultValue="0" className="mt-1" />
                    </div>
                    <div>
                      <Label>Mejora de habilidades (%)</Label>
                      <Input type="number" min="0" max="50" defaultValue="0" className="mt-1" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="new-equipment" />
                      <Label htmlFor="new-equipment">Equipamiento nuevo</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="workflow-optimization" />
                      <Label htmlFor="workflow-optimization">Optimización de flujo</Label>
                    </div>
                    <Button className="w-full">
                      <Play className="h-4 w-4 mr-2" />
                      Ejecutar Simulación
                    </Button>
                  </div>
                </div>

                {/* Simulation Results */}
                <div>
                  <h4 className="font-medium mb-4">Resultados de Simulación</h4>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h5 className="font-medium">Escenario Actual</h5>
                      <div className="mt-2 space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tiempo total:</span>
                          <span>{metrics.totalProcessingTime}min</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Eficiencia:</span>
                          <span>{metrics.efficiency.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Throughput:</span>
                          <span>{metrics.throughput}/día</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-lg bg-green-50">
                      <h5 className="font-medium text-green-900">Escenario Optimizado</h5>
                      <div className="mt-2 space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-green-700">Tiempo total:</span>
                          <span className="text-green-900 font-semibold">
                            {metrics.totalProcessingTime - 25}min
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-700">Eficiencia:</span>
                          <span className="text-green-900 font-semibold">
                            {(metrics.efficiency + 8).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-700">Throughput:</span>
                          <span className="text-green-900 font-semibold">
                            {Math.round(metrics.throughput * 1.15)}/día
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-green-200">
                        <div className="flex justify-between text-sm">
                          <span className="text-green-700">Mejora:</span>
                          <span className="text-green-900 font-semibold">+15% rendimiento</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-lg bg-blue-50">
                      <h5 className="font-medium text-blue-900">ROI Estimado</h5>
                      <div className="mt-2 space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-blue-700">Inversión inicial:</span>
                          <span className="text-blue-900 font-semibold">€2,500</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">Ahorro mensual:</span>
                          <span className="text-blue-900 font-semibold">€1,200</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">ROI en:</span>
                          <span className="text-blue-900 font-semibold">2.1 meses</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}