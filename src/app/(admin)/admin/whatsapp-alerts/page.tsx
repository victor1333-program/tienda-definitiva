"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { 
  MessageCircle,
  AlertTriangle,
  Settings,
  Send,
  Phone,
  Users,
  Package,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Smartphone,
  Zap,
  Target,
  Activity,
  Bell
} from "lucide-react"

interface WhatsAppConfig {
  phoneNumber: string
  businessApiToken: string
  webhookToken: string
  isConnected: boolean
  enabledAlerts: {
    stockAlerts: boolean
    orderUpdates: boolean
    paymentReminders: boolean
    productionAlerts: boolean
    customerService: boolean
    emergencyAlerts: boolean
  }
}

interface AlertTemplate {
  id: string
  name: string
  type: string
  message: string
  variables: string[]
  enabled: boolean
  priority: 'low' | 'medium' | 'high' | 'critical'
}

interface SentMessage {
  id: string
  recipient: string
  message: string
  type: string
  status: 'sent' | 'delivered' | 'read' | 'failed'
  timestamp: string
  priority: string
}

export default function WhatsAppAlertsPage() {
  const [config, setConfig] = useState<WhatsAppConfig>({
    phoneNumber: "+34612345678",
    businessApiToken: "",
    webhookToken: "",
    isConnected: false,
    enabledAlerts: {
      stockAlerts: true,
      orderUpdates: true,
      paymentReminders: false,
      productionAlerts: true,
      customerService: false,
      emergencyAlerts: true
    }
  })
  
  const [templates, setTemplates] = useState<AlertTemplate[]>([])
  const [sentMessages, setSentMessages] = useState<SentMessage[]>([])
  const [testNumber, setTestNumber] = useState("")
  const [testMessage, setTestMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    totalSent: 0,
    delivered: 0,
    failed: 0,
    responseRate: 0
  })

  useEffect(() => {
    loadWhatsAppConfig()
    loadAlertTemplates()
    loadSentMessages()
    loadStats()
  }, [])

  const loadWhatsAppConfig = async () => {
    try {
      const response = await fetch('/api/whatsapp/config')
      if (response.ok) {
        const data = await response.json()
        setConfig(data)
      }
    } catch (error) {
      console.error('Error loading WhatsApp config:', error)
    }
  }

  const loadAlertTemplates = async () => {
    try {
      const response = await fetch('/api/whatsapp/templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data)
      }
    } catch (error) {
      console.error('Error loading templates:', error)
    }
  }

  const loadSentMessages = async () => {
    try {
      const response = await fetch('/api/whatsapp/messages')
      if (response.ok) {
        const data = await response.json()
        setSentMessages(data)
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const loadStats = async () => {
    try {
      const response = await fetch('/api/whatsapp/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const saveConfig = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/whatsapp/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })
      
      if (response.ok) {
        toast.success('Configuración guardada correctamente')
        loadWhatsAppConfig()
      } else {
        toast.error('Error al guardar la configuración')
      }
    } catch (error) {
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const testConnection = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/whatsapp/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: config.phoneNumber })
      })
      
      if (response.ok) {
        toast.success('Conexión WhatsApp verificada exitosamente')
        setConfig(prev => ({ ...prev, isConnected: true }))
      } else {
        toast.error('Error al verificar la conexión')
        setConfig(prev => ({ ...prev, isConnected: false }))
      }
    } catch (error) {
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const sendTestMessage = async () => {
    if (!testNumber || !testMessage) {
      toast.error('Completa el número y mensaje')
      return
    }
    
    setLoading(true)
    try {
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: testNumber,
          message: testMessage,
          type: 'test'
        })
      })
      
      if (response.ok) {
        toast.success('Mensaje de prueba enviado')
        setTestNumber('')
        setTestMessage('')
        loadSentMessages()
        loadStats()
      } else {
        toast.error('Error al enviar el mensaje')
      }
    } catch (error) {
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const toggleAlert = (alertType: keyof typeof config.enabledAlerts) => {
    setConfig(prev => ({
      ...prev,
      enabledAlerts: {
        ...prev.enabledAlerts,
        [alertType]: !prev.enabledAlerts[alertType]
      }
    }))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <Clock className="h-4 w-4 text-blue-500" />
      case 'delivered': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'read': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">WhatsApp Business</h1>
          <p className="text-gray-600 mt-2">Gestión de alertas críticas y comunicaciones</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={config.isConnected ? "default" : "destructive"} className="px-3 py-1">
            <Smartphone className="h-4 w-4 mr-1" />
            {config.isConnected ? 'Conectado' : 'Desconectado'}
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Mensajes Enviados</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSent}</p>
              </div>
              <Send className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Entregados</p>
                <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Fallidos</p>
                <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tasa Respuesta</p>
                <p className="text-2xl font-bold text-orange-600">{stats.responseRate}%</p>
              </div>
              <Activity className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="config" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="config">Configuración</TabsTrigger>
          <TabsTrigger value="alerts">Tipos de Alertas</TabsTrigger>
          <TabsTrigger value="test">Pruebas</TabsTrigger>
          <TabsTrigger value="messages">Historial</TabsTrigger>
        </TabsList>

        {/* Configuration Tab */}
        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuración de WhatsApp Business API
              </CardTitle>
              <CardDescription>
                Configura tu integración con WhatsApp Business para enviar alertas automáticas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="phone">Número de Teléfono Business</Label>
                  <Input
                    id="phone"
                    placeholder="+34612345678"
                    value={config.phoneNumber}
                    onChange={(e) => setConfig(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="token">Token de API Business</Label>
                  <Input
                    id="token"
                    type="password"
                    placeholder="Ingresa tu token de WhatsApp Business API"
                    value={config.businessApiToken}
                    onChange={(e) => setConfig(prev => ({ ...prev, businessApiToken: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="webhook">Token de Webhook</Label>
                  <Input
                    id="webhook"
                    type="password"
                    placeholder="Token para verificar webhooks"
                    value={config.webhookToken}
                    onChange={(e) => setConfig(prev => ({ ...prev, webhookToken: e.target.value }))}
                  />
                </div>
              </div>
              
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Para usar WhatsApp Business API necesitas tener una cuenta verificada de Meta Business.
                  Consulta la documentación de Meta para obtener tus tokens.
                </AlertDescription>
              </Alert>
              
              <div className="flex gap-3">
                <Button onClick={saveConfig} disabled={loading}>
                  <Settings className="h-4 w-4 mr-2" />
                  Guardar Configuración
                </Button>
                <Button variant="outline" onClick={testConnection} disabled={loading}>
                  <Zap className="h-4 w-4 mr-2" />
                  Verificar Conexión
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alert Types Tab */}
        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Tipos de Alertas Automáticas
              </CardTitle>
              <CardDescription>
                Configura qué tipos de alertas quieres enviar automáticamente por WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium">Alertas de Stock</p>
                        <p className="text-sm text-gray-600">Notificar cuando productos estén por agotarse</p>
                      </div>
                    </div>
                    <Switch
                      checked={config.enabledAlerts.stockAlerts}
                      onCheckedChange={() => toggleAlert('stockAlerts')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Target className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium">Actualizaciones de Pedidos</p>
                        <p className="text-sm text-gray-600">Estado de pedidos y entregas</p>
                      </div>
                    </div>
                    <Switch
                      checked={config.enabledAlerts.orderUpdates}
                      onCheckedChange={() => toggleAlert('orderUpdates')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-5 w-5 text-yellow-500" />
                      <div>
                        <p className="font-medium">Recordatorios de Pago</p>
                        <p className="text-sm text-gray-600">Pagos pendientes y vencimientos</p>
                      </div>
                    </div>
                    <Switch
                      checked={config.enabledAlerts.paymentReminders}
                      onCheckedChange={() => toggleAlert('paymentReminders')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Settings className="h-5 w-5 text-purple-500" />
                      <div>
                        <p className="font-medium">Alertas de Producción</p>
                        <p className="text-sm text-gray-600">Problemas en la línea de producción</p>
                      </div>
                    </div>
                    <Switch
                      checked={config.enabledAlerts.productionAlerts}
                      onCheckedChange={() => toggleAlert('productionAlerts')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-orange-500" />
                      <div>
                        <p className="font-medium">Atención al Cliente</p>
                        <p className="text-sm text-gray-600">Consultas y soporte técnico</p>
                      </div>
                    </div>
                    <Switch
                      checked={config.enabledAlerts.customerService}
                      onCheckedChange={() => toggleAlert('customerService')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      <div>
                        <p className="font-medium">Alertas de Emergencia</p>
                        <p className="text-sm text-gray-600">Problemas críticos del sistema</p>
                      </div>
                    </div>
                    <Switch
                      checked={config.enabledAlerts.emergencyAlerts}
                      onCheckedChange={() => toggleAlert('emergencyAlerts')}
                    />
                  </div>
                </div>
                
                <Button onClick={saveConfig} disabled={loading}>
                  <Settings className="h-4 w-4 mr-2" />
                  Guardar Preferencias
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Test Tab */}
        <TabsContent value="test" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Enviar Mensaje de Prueba
              </CardTitle>
              <CardDescription>
                Prueba la conexión enviando un mensaje a un número específico
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="testNumber">Número de Destino</Label>
                  <Input
                    id="testNumber"
                    placeholder="+34612345678"
                    value={testNumber}
                    onChange={(e) => setTestNumber(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="testMessage">Mensaje de Prueba</Label>
                <textarea
                  id="testMessage"
                  className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Escribe tu mensaje de prueba aquí..."
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                />
              </div>
              
              <Button onClick={sendTestMessage} disabled={loading || !config.isConnected}>
                <Send className="h-4 w-4 mr-2" />
                Enviar Mensaje de Prueba
              </Button>
              
              {!config.isConnected && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Debes configurar y verificar la conexión WhatsApp antes de enviar mensajes.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Messages History Tab */}
        <TabsContent value="messages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Historial de Mensajes
              </CardTitle>
              <CardDescription>
                Registro de todos los mensajes enviados por WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sentMessages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay mensajes enviados aún</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sentMessages.map((message) => (
                      <div key={message.id} className="flex items-start gap-4 p-4 border rounded-lg">
                        <div className="flex-shrink-0 pt-1">
                          {getStatusIcon(message.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{message.recipient}</p>
                              <p className="text-sm text-gray-600 mt-1">{message.message}</p>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <Badge className={getPriorityColor(message.priority)}>
                                {message.priority}
                              </Badge>
                              <Badge variant="outline">{message.type}</Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>Estado: {message.status}</span>
                            <span>{new Date(message.timestamp).toLocaleString('es-ES')}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}