"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import {
  RotateCcw,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw,
  Settings,
  TrendingUp,
  TrendingDown,
  Calendar,
  CreditCard,
  User,
  Package,
  MessageCircle,
  FileText,
  Zap,
  Target,
  BarChart3,
  Activity,
  Shield,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Percent,
  Timer,
  Mail,
  Phone,
  MapPin
} from "lucide-react"

interface Refund {
  id: string
  orderId: string
  orderNumber: string
  customerId: string
  customerName: string
  customerEmail: string
  originalAmount: number
  refundAmount: number
  currency: string
  reason: 'customer_request' | 'defective_product' | 'shipping_issue' | 'duplicate_order' | 'fraud' | 'other'
  status: 'pending' | 'processing' | 'approved' | 'rejected' | 'completed' | 'failed' | 'cancelled'
  type: 'full' | 'partial'
  method: 'original_payment' | 'store_credit' | 'bank_transfer' | 'cash'
  requestDate: string
  processedDate?: string
  completedDate?: string
  processedBy?: string
  approvedBy?: string
  gatewayId?: string
  transactionId?: string
  refundTransactionId?: string
  notes: string
  customerNotes?: string
  attachments: string[]
  timeline: {
    status: string
    timestamp: string
    description: string
    user?: string
  }[]
  automation: {
    isAutomatic: boolean
    ruleId?: string
    confidence: number
  }
}

interface RefundRule {
  id: string
  name: string
  description: string
  isEnabled: boolean
  priority: number
  conditions: {
    orderAge: number // days
    maxAmount: number
    reasons: string[]
    customerTier: string[]
    productCategories: string[]
  }
  actions: {
    autoApprove: boolean
    requiresReview: boolean
    notifyCustomer: boolean
    refundMethod: string
    processingTime: number // hours
  }
  statistics: {
    totalProcessed: number
    successRate: number
    averageTime: number
  }
}

interface RefundStats {
  totalRefunds: number
  totalAmount: number
  pendingRefunds: number
  pendingAmount: number
  avgProcessingTime: number
  successRate: number
  topReasons: {
    reason: string
    count: number
    percentage: number
    amount: number
  }[]
  monthlyTrends: {
    month: string
    refunds: number
    amount: number
    rate: number
  }[]
  automationMetrics: {
    automatedPercentage: number
    manualReviewPercentage: number
    avgAutomationTime: number
    avgManualTime: number
  }
}

export default function RefundsPage() {
  const [refunds, setRefunds] = useState<Refund[]>([])
  const [refundRules, setRefundRules] = useState<RefundRule[]>([])
  const [stats, setStats] = useState<RefundStats>({
    totalRefunds: 0,
    totalAmount: 0,
    pendingRefunds: 0,
    pendingAmount: 0,
    avgProcessingTime: 0,
    successRate: 0,
    topReasons: [],
    monthlyTrends: [],
    automationMetrics: {
      automatedPercentage: 0,
      manualReviewPercentage: 0,
      avgAutomationTime: 0,
      avgManualTime: 0
    }
  })
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterReason, setFilterReason] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [timeframe, setTimeframe] = useState('30d')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showNewRefund, setShowNewRefund] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadRefunds()
    loadRefundRules()
    loadRefundStats()
  }, [timeframe, filterStatus, filterReason])

  const loadRefunds = async () => {
    try {
      const response = await fetch(`/api/refunds?timeframe=${timeframe}&status=${filterStatus}&reason=${filterReason}&search=${searchTerm}`)
      if (response.ok) {
        const data = await response.json()
        setRefunds(data)
      }
    } catch (error) {
      console.error('Error loading refunds:', error)
    }
  }

  const loadRefundRules = async () => {
    try {
      const response = await fetch('/api/refunds/rules')
      if (response.ok) {
        const data = await response.json()
        setRefundRules(data)
      }
    } catch (error) {
      console.error('Error loading refund rules:', error)
    }
  }

  const loadRefundStats = async () => {
    try {
      const response = await fetch(`/api/refunds/stats?timeframe=${timeframe}`)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error loading refund stats:', error)
    }
  }

  const processRefund = async (refundId: string, action: 'approve' | 'reject', notes?: string) => {
    setIsProcessing(true)
    try {
      const response = await fetch(`/api/refunds/${refundId}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, notes })
      })
      
      if (response.ok) {
        toast.success(`Reembolso ${action === 'approve' ? 'aprobado' : 'rechazado'} correctamente`)
        loadRefunds()
        loadRefundStats()
      } else {
        toast.error('Error al procesar reembolso')
      }
    } catch (error) {
      toast.error('Error de conexión')
    } finally {
      setIsProcessing(false)
    }
  }

  const createRefund = async (refundData: any) => {
    try {
      const response = await fetch('/api/refunds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(refundData)
      })
      
      if (response.ok) {
        toast.success('Reembolso creado correctamente')
        loadRefunds()
        loadRefundStats()
        setShowNewRefund(false)
      } else {
        toast.error('Error al crear reembolso')
      }
    } catch (error) {
      toast.error('Error de conexión')
    }
  }

  const bulkProcess = async (refundIds: string[], action: 'approve' | 'reject') => {
    setLoading(true)
    try {
      const response = await fetch('/api/refunds/bulk-process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refundIds, action })
      })
      
      if (response.ok) {
        toast.success(`${refundIds.length} reembolsos procesados correctamente`)
        loadRefunds()
        loadRefundStats()
      } else {
        toast.error('Error en procesamiento masivo')
      }
    } catch (error) {
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />
      case 'processing': return <Activity className="h-4 w-4 text-blue-500" />
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />
      case 'completed': return <CheckCircle className="h-4 w-4 text-emerald-500" />
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'cancelled': return <XCircle className="h-4 w-4 text-gray-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-emerald-100 text-emerald-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getReasonIcon = (reason: string) => {
    switch (reason) {
      case 'customer_request': return <User className="h-4 w-4 text-blue-500" />
      case 'defective_product': return <Package className="h-4 w-4 text-red-500" />
      case 'shipping_issue': return <MapPin className="h-4 w-4 text-orange-500" />
      case 'duplicate_order': return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'fraud': return <Shield className="h-4 w-4 text-red-600" />
      default: return <MessageCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const formatCurrency = (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const filteredRefunds = refunds.filter(refund => {
    const matchesStatus = filterStatus === 'all' || refund.status === filterStatus
    const matchesReason = filterReason === 'all' || refund.reason === filterReason
    const matchesSearch = searchTerm === '' || 
      refund.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesReason && matchesSearch
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Reembolsos</h1>
          <p className="text-gray-600 mt-2">Proceso automatizado de devoluciones y reembolsos</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 días</SelectItem>
              <SelectItem value="30d">30 días</SelectItem>
              <SelectItem value="90d">90 días</SelectItem>
              <SelectItem value="1y">1 año</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => loadRefundStats()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Dialog open={showNewRefund} onOpenChange={setShowNewRefund}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Reembolso
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Reembolso</DialogTitle>
                <DialogDescription>
                  Procesar manualmente un reembolso para un pedido
                </DialogDescription>
              </DialogHeader>
              {/* Formulario de nuevo reembolso aquí */}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Reembolsos</p>
                <p className="text-xl font-bold">{stats.totalRefunds}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Monto Total</p>
                <p className="text-xl font-bold">{formatCurrency(stats.totalAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Pendientes</p>
                <p className="text-xl font-bold">{stats.pendingRefunds}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">T. Procesamiento</p>
                <p className="text-xl font-bold">{stats.avgProcessingTime}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              <div>
                <p className="text-sm text-gray-600">Tasa Éxito</p>
                <p className="text-xl font-bold">{stats.successRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Automatizados</p>
                <p className="text-xl font-bold">{stats.automationMetrics.automatedPercentage.toFixed(0)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="refunds" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="refunds">Reembolsos</TabsTrigger>
          <TabsTrigger value="automation">Automatización</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="rules">Reglas</TabsTrigger>
          <TabsTrigger value="settings">Configuración</TabsTrigger>
        </TabsList>

        {/* Refunds Tab */}
        <TabsContent value="refunds" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Buscar por orden, cliente o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="pending">Pendientes</SelectItem>
                    <SelectItem value="processing">Procesando</SelectItem>
                    <SelectItem value="approved">Aprobados</SelectItem>
                    <SelectItem value="rejected">Rechazados</SelectItem>
                    <SelectItem value="completed">Completados</SelectItem>
                    <SelectItem value="failed">Fallidos</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterReason} onValueChange={setFilterReason}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Motivo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los motivos</SelectItem>
                    <SelectItem value="customer_request">Solicitud cliente</SelectItem>
                    <SelectItem value="defective_product">Producto defectuoso</SelectItem>
                    <SelectItem value="shipping_issue">Problema envío</SelectItem>
                    <SelectItem value="duplicate_order">Pedido duplicado</SelectItem>
                    <SelectItem value="fraud">Fraude</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Refunds List */}
          <div className="space-y-4">
            {filteredRefunds.map((refund) => (
              <Card key={refund.id} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedRefund(refund)}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 pt-1">
                      {getReasonIcon(refund.reason)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">Pedido {refund.orderNumber}</h3>
                          <p className="text-gray-600">{refund.customerName} • {refund.customerEmail}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(refund.status)}>
                            {refund.status.replace('_', ' ')}
                          </Badge>
                          {refund.automation.isAutomatic && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                              <Zap className="h-3 w-3 mr-1" />
                              Auto
                            </Badge>
                          )}
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Reembolso</p>
                            <p className="font-bold text-lg">{formatCurrency(refund.refundAmount, refund.currency)}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Tipo</p>
                          <p className="font-medium capitalize">{refund.type}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Motivo</p>
                          <p className="font-medium">
                            {refund.reason.replace('_', ' ').charAt(0).toUpperCase() + refund.reason.replace('_', ' ').slice(1)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Método</p>
                          <p className="font-medium">
                            {refund.method.replace('_', ' ').charAt(0).toUpperCase() + refund.method.replace('_', ' ').slice(1)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Solicitado</p>
                          <p className="font-medium">{new Date(refund.requestDate).toLocaleDateString('es-ES')}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Monto Original</p>
                          <p className="font-medium">{formatCurrency(refund.originalAmount, refund.currency)}</p>
                        </div>
                      </div>
                      
                      {refund.notes && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 mb-1">Notas:</p>
                          <p className="text-sm bg-gray-50 p-2 rounded">{refund.notes}</p>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(refund.status)}
                          {refund.automation.isAutomatic && (
                            <span className="text-sm text-blue-600">
                              Confianza: {refund.automation.confidence}%
                            </span>
                          )}
                          {refund.attachments.length > 0 && (
                            <Badge variant="outline">
                              <FileText className="h-3 w-3 mr-1" />
                              {refund.attachments.length} archivos
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3 mr-1" />
                            Ver Detalles
                          </Button>
                          {refund.status === 'pending' && (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-red-600 hover:bg-red-50"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  processRefund(refund.id, 'reject')
                                }}
                                disabled={isProcessing}
                              >
                                Rechazar
                              </Button>
                              <Button 
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  processRefund(refund.id, 'approve')
                                }}
                                disabled={isProcessing}
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Aprobar
                              </Button>
                            </>
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

        {/* Automation Tab */}
        <TabsContent value="automation" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Automation Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Automatización</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Procesamiento Automático</span>
                      <span className="font-semibold">{stats.automationMetrics.automatedPercentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={stats.automationMetrics.automatedPercentage} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Revisión Manual</span>
                      <span className="font-semibold">{stats.automationMetrics.manualReviewPercentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={stats.automationMetrics.manualReviewPercentage} className="h-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-gray-600">Tiempo Auto</p>
                      <p className="font-bold text-lg">{stats.automationMetrics.avgAutomationTime}min</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tiempo Manual</p>
                      <p className="font-bold text-lg">{stats.automationMetrics.avgManualTime}h</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Processing Flow */}
            <Card>
              <CardHeader>
                <CardTitle>Flujo de Procesamiento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <MessageCircle className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Solicitud Recibida</p>
                      <p className="text-sm text-gray-600">Cliente o sistema inicia reembolso</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Zap className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Evaluación Automática</p>
                      <p className="text-sm text-gray-600">Reglas analizan la solicitud</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Procesamiento</p>
                      <p className="text-sm text-gray-600">Automático o revisión manual</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <CreditCard className="h-4 w-4 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Reembolso</p>
                      <p className="text-sm text-gray-600">Procesamiento de pago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Reasons */}
            <Card>
              <CardHeader>
                <CardTitle>Motivos Principales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.topReasons.map((reason, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getReasonIcon(reason.reason)}
                        <div>
                          <p className="font-medium">
                            {reason.reason.replace('_', ' ').charAt(0).toUpperCase() + reason.reason.replace('_', ' ').slice(1)}
                          </p>
                          <p className="text-sm text-gray-600">{reason.count} casos</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(reason.amount)}</p>
                        <p className="text-sm text-gray-600">{reason.percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Monthly Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Tendencias Mensuales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.monthlyTrends.map((trend, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{trend.month}</p>
                        <p className="text-sm text-gray-600">{trend.refunds} reembolsos</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(trend.amount)}</p>
                        <div className="flex items-center gap-1">
                          {trend.rate > 0 ? (
                            <TrendingUp className="h-3 w-3 text-red-500" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-green-500" />
                          )}
                          <span className={`text-sm ${
                            trend.rate > 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {Math.abs(trend.rate).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Rules Tab */}
        <TabsContent value="rules" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Reglas de Automatización</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Regla
            </Button>
          </div>
          
          <div className="space-y-4">
            {refundRules.map((rule) => (
              <Card key={rule.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-lg">{rule.name}</h4>
                      <p className="text-gray-600">{rule.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={rule.isEnabled ? "default" : "secondary"}>
                        {rule.isEnabled ? 'Activa' : 'Inactiva'}
                      </Badge>
                      <Switch
                        checked={rule.isEnabled}
                        onCheckedChange={(enabled) => {
                          // Update rule status
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Prioridad</p>
                      <p className="font-medium">{rule.priority}/10</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Procesados</p>
                      <p className="font-medium">{rule.statistics.totalProcessed}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tasa Éxito</p>
                      <p className="font-medium">{rule.statistics.successRate.toFixed(1)}%</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">
                      Máx: {formatCurrency(rule.conditions.maxAmount)}
                    </Badge>
                    <Badge variant="outline">
                      {rule.conditions.orderAge} días
                    </Badge>
                    <Badge variant="outline">
                      {rule.actions.autoApprove ? 'Auto-aprobar' : 'Revisar'}
                    </Badge>
                    <Badge variant="outline">
                      {rule.actions.processingTime}h proceso
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Reembolsos</CardTitle>
              <CardDescription>
                Ajustes generales para el procesamiento automático de reembolsos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="max-auto-amount">Monto Máximo Automático</Label>
                    <Input
                      id="max-auto-amount"
                      type="number"
                      placeholder="100.00"
                      className="mt-1"
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      Reembolsos superiores requieren revisión manual
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="processing-timeout">Tiempo Máximo Procesamiento</Label>
                    <Input
                      id="processing-timeout"
                      type="number"
                      placeholder="72"
                      className="mt-1"
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      Horas antes de escalado automático
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="notification-email">Email Notificaciones</Label>
                    <Input
                      id="notification-email"
                      type="email"
                      placeholder="refunds@empresa.com"
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Notificar Cliente Automáticamente</Label>
                      <p className="text-sm text-gray-600">Enviar emails de estado automáticamente</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Reembolsos Instantáneos</Label>
                      <p className="text-sm text-gray-600">Para montos menores a 20€</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Requiere Evidencia</Label>
                      <p className="text-sm text-gray-600">Para productos defectuosos</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Integración Contabilidad</Label>
                      <p className="text-sm text-gray-600">Sincronizar con sistema contable</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 pt-4 border-t">
                <Button>
                  <Settings className="h-4 w-4 mr-2" />
                  Guardar Configuración
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Reportes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}