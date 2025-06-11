'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { toast } from "react-hot-toast"
import {
  Mail,
  Send,
  Settings,
  TestTube,
  AlertTriangle,
  CheckCircle,
  Users,
  BarChart3,
  RefreshCw,
  Download,
  Upload,
  Eye,
  Clock,
  Shield,
  Zap,
  Bell,
  MessageSquare,
  Package,
  Truck,
  CreditCard,
  Factory
} from "lucide-react"
import BarChart from "@/components/charts/BarChart"
import DonutChart from "@/components/charts/DonutChart"

interface EmailStats {
  totalAlerts: number
  stockAlerts: number
  productionAlerts: number
  systemAlerts: number
  last24Hours: {
    total: number
    stock: number
    production: number
    system: number
  }
  emailsSent: {
    today: number
    thisWeek: number
    thisMonth: number
  }
  deliveryRate: number
  averageResponseTime: string
}

interface EmailConfig {
  host: string
  port: string
  user: string
  secure: string
}

export default function EmailSystemPage() {
  const [stats, setStats] = useState<EmailStats>({
    totalAlerts: 0,
    stockAlerts: 0,
    productionAlerts: 0,
    systemAlerts: 0,
    last24Hours: { total: 0, stock: 0, production: 0, system: 0 },
    emailsSent: { today: 0, thisWeek: 0, thisMonth: 0 },
    deliveryRate: 0,
    averageResponseTime: '0 min'
  })
  const [emailConfig, setEmailConfig] = useState<EmailConfig>({ host: '', port: '', user: '', secure: '' })
  const [isLoading, setIsLoading] = useState(true)
  const [isTestingConfig, setIsTestingConfig] = useState(false)
  const [isSendingTest, setIsSendingTest] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [isConfigValid, setIsConfigValid] = useState(false)

  // Form states for sending emails
  const [emailForm, setEmailForm] = useState({
    to: '',
    subject: '',
    type: 'SYSTEM_NOTIFICATION',
    message: ''
  })

  useEffect(() => {
    loadEmailStats()
    testEmailConfiguration()
  }, [])

  const loadEmailStats = async () => {
    try {
      const response = await fetch('/api/email/alerts')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error loading email stats:', error)
    }
  }

  const testEmailConfiguration = async () => {
    setIsTestingConfig(true)
    try {
      const response = await fetch('/api/email/test')
      if (response.ok) {
        const data = await response.json()
        setIsConfigValid(data.success)
        setEmailConfig(data.config)
        
        if (data.success) {
          toast.success('Configuración de email válida')
        } else {
          toast.error('Error en la configuración de email')
        }
      }
    } catch (error) {
      console.error('Error testing email config:', error)
      toast.error('Error al probar configuración')
    } finally {
      setIsTestingConfig(false)
      setIsLoading(false)
    }
  }

  const sendTestEmail = async () => {
    if (!testEmail) {
      toast.error('Por favor ingresa un email para la prueba')
      return
    }

    setIsSendingTest(true)
    try {
      const response = await fetch('/api/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testEmail })
      })

      if (response.ok) {
        toast.success(`Email de prueba enviado a ${testEmail}`)
        setTestEmail('')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al enviar email de prueba')
      }
    } catch (error) {
      console.error('Error sending test email:', error)
      toast.error('Error al enviar email de prueba')
    } finally {
      setIsSendingTest(false)
    }
  }

  const sendCustomEmail = async () => {
    if (!emailForm.to || !emailForm.subject || !emailForm.message) {
      toast.error('Por favor completa todos los campos')
      return
    }

    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emailForm.to,
          subject: emailForm.subject,
          type: emailForm.type,
          data: {
            message: emailForm.message,
            timestamp: new Date().toISOString()
          }
        })
      })

      if (response.ok) {
        toast.success('Email enviado correctamente')
        setEmailForm({ to: '', subject: '', type: 'SYSTEM_NOTIFICATION', message: '' })
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al enviar email')
      }
    } catch (error) {
      console.error('Error sending email:', error)
      toast.error('Error al enviar email')
    }
  }

  const triggerStockAlert = async () => {
    try {
      const response = await fetch('/api/email/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alertType: 'STOCK_ALERT',
          data: {
            items: [
              { name: 'Camiseta Básica Blanca', sku: 'CAM-001', currentStock: 2, minimumStock: 10 },
              { name: 'Taza Cerámica 350ml', sku: 'TAZ-002', currentStock: 0, minimumStock: 15 }
            ]
          }
        })
      })

      if (response.ok) {
        toast.success('Alerta de stock enviada')
        loadEmailStats()
      } else {
        toast.error('Error al enviar alerta')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al enviar alerta')
    }
  }

  const triggerProductionAlert = async () => {
    try {
      const response = await fetch('/api/email/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alertType: 'PRODUCTION_ALERT',
          data: {
            productionOrder: 'PROD-2024-006',
            alertType: 'DELAY',
            message: 'Retraso en la producción debido a mantenimiento de equipo de serigrafía. Se estima 2-4 horas adicionales.'
          }
        })
      })

      if (response.ok) {
        toast.success('Alerta de producción enviada')
        loadEmailStats()
      } else {
        toast.error('Error al enviar alerta')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al enviar alerta')
    }
  }

  // Prepare chart data
  const alertsData = [
    { label: 'Stock', value: stats.stockAlerts, color: '#f59e0b' },
    { label: 'Producción', value: stats.productionAlerts, color: '#3b82f6' },
    { label: 'Sistema', value: stats.systemAlerts, color: '#8b5cf6' }
  ]

  const emailVolumeData = [
    { label: 'Hoy', value: stats.emailsSent.today, color: '#10b981' },
    { label: 'Esta Semana', value: stats.emailsSent.thisWeek, color: '#3b82f6' },
    { label: 'Este Mes', value: stats.emailsSent.thisMonth, color: '#8b5cf6' }
  ]

  const last24HoursData = [
    { label: 'Stock', value: stats.last24Hours.stock, color: '#f59e0b' },
    { label: 'Producción', value: stats.last24Hours.production, color: '#3b82f6' },
    { label: 'Sistema', value: stats.last24Hours.system, color: '#8b5cf6' }
  ]

  const tabs = [
    { id: 'overview', label: 'Resumen', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'send', label: 'Enviar Email', icon: <Send className="w-4 h-4" /> },
    { id: 'alerts', label: 'Alertas', icon: <Bell className="w-4 h-4" /> },
    { id: 'config', label: 'Configuración', icon: <Settings className="w-4 h-4" /> }
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando sistema de emails...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📧 Sistema de Emails</h1>
          <p className="text-gray-600 mt-1">
            Gestión avanzada de notificaciones y comunicaciones por email
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={testEmailConfiguration}
            disabled={isTestingConfig}
          >
            <TestTube className="w-4 h-4 mr-2" />
            {isTestingConfig ? 'Probando...' : 'Probar Config'}
          </Button>
          <Button variant="outline" onClick={loadEmailStats}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
          <Badge className={isConfigValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
            {isConfigValid ? '✅ Configurado' : '❌ Error Config'}
          </Badge>
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
                <CardTitle className="text-sm font-medium text-gray-700">Emails Hoy</CardTitle>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Mail className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl font-bold text-gray-900">{stats.emailsSent.today}</div>
                <p className="text-xs text-gray-600 mt-1">
                  Enviados en las últimas 24h
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50"></div>
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Tasa de Entrega</CardTitle>
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl font-bold text-green-600">{stats.deliveryRate}%</div>
                <p className="text-xs text-gray-600 mt-1">
                  Emails entregados correctamente
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-amber-50"></div>
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Alertas Activas</CardTitle>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Bell className="h-4 w-4 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl font-bold text-orange-600">{stats.totalAlerts}</div>
                <p className="text-xs text-gray-600 mt-1">
                  Alertas generadas total
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-violet-50"></div>
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Tiempo Respuesta</CardTitle>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Clock className="h-4 w-4 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl font-bold text-purple-600">{stats.averageResponseTime}</div>
                <p className="text-xs text-gray-600 mt-1">
                  Tiempo promedio de envío
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
                  Tipos de Alertas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DonutChart
                  data={alertsData}
                  title="Distribución de Alertas"
                  size={180}
                  formatValue={(value) => `${value} alertas`}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Volumen de Emails
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={emailVolumeData}
                  title="Emails Enviados"
                  formatValue={(value) => `${value} emails`}
                />
              </CardContent>
            </Card>
          </div>

          {/* Recent Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Alertas Últimas 24 Horas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart
                data={last24HoursData}
                title="Alertas por Tipo"
                formatValue={(value) => `${value} alertas`}
              />
            </CardContent>
          </Card>
        </>
      )}

      {/* Send Email Tab */}
      {activeTab === 'send' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Enviar Email Personalizado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Destinatario</label>
                <Input
                  type="email"
                  placeholder="email@ejemplo.com"
                  value={emailForm.to}
                  onChange={(e) => setEmailForm({ ...emailForm, to: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asunto</label>
                <Input
                  placeholder="Asunto del email"
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Email</label>
                <select
                  value={emailForm.type}
                  onChange={(e) => setEmailForm({ ...emailForm, type: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="SYSTEM_NOTIFICATION">Notificación del Sistema</option>
                  <option value="ADMIN_ALERT">Alerta de Administrador</option>
                  <option value="CUSTOMER_NOTIFICATION">Notificación a Cliente</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
                <textarea
                  rows={6}
                  placeholder="Contenido del mensaje..."
                  value={emailForm.message}
                  onChange={(e) => setEmailForm({ ...emailForm, message: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              
              <Button onClick={sendCustomEmail} className="w-full">
                <Send className="w-4 h-4 mr-2" />
                Enviar Email
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Email de Prueba</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TestTube className="w-5 h-5 text-blue-600" />
                  <h3 className="font-medium text-blue-900">Probar Configuración</h3>
                </div>
                <p className="text-sm text-blue-700">
                  Envía un email de prueba para verificar que el sistema funciona correctamente.
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email de Prueba</label>
                <Input
                  type="email"
                  placeholder="tu-email@ejemplo.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
              </div>
              
              <Button
                onClick={sendTestEmail}
                disabled={isSendingTest || !testEmail}
                className="w-full"
                variant="outline"
              >
                <TestTube className="w-4 h-4 mr-2" />
                {isSendingTest ? 'Enviando...' : 'Enviar Prueba'}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Alertas de Stock</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-5 h-5 text-orange-600" />
                  <h3 className="font-medium text-orange-900">Alerta de Inventario</h3>
                </div>
                <p className="text-sm text-orange-700">
                  Envía alertas automáticas cuando el stock de productos esté por debajo del mínimo.
                </p>
              </div>
              
              <Button onClick={triggerStockAlert} className="w-full">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Simular Alerta de Stock
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alertas de Producción</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Factory className="w-5 h-5 text-blue-600" />
                  <h3 className="font-medium text-blue-900">Alerta de Producción</h3>
                </div>
                <p className="text-sm text-blue-700">
                  Notifica sobre retrasos, errores o actualizaciones en el proceso de producción.
                </p>
              </div>
              
              <Button onClick={triggerProductionAlert} className="w-full">
                <Factory className="w-4 h-4 mr-2" />
                Simular Alerta de Producción
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Configuration Tab */}
      {activeTab === 'config' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configuración de Email
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Configuración SMTP</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Host:</span>
                    <span className="text-sm font-medium">{emailConfig.host}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Puerto:</span>
                    <span className="text-sm font-medium">{emailConfig.port}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Usuario:</span>
                    <span className="text-sm font-medium">{emailConfig.user}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Seguro:</span>
                    <span className="text-sm font-medium">{emailConfig.secure}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Estado del Sistema</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Estado:</span>
                    <Badge className={isConfigValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {isConfigValid ? 'Configurado' : 'Error'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Última prueba:</span>
                    <span className="text-sm font-medium">{new Date().toLocaleString('es-ES')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Emails hoy:</span>
                    <span className="text-sm font-medium">{stats.emailsSent.today}</span>
                  </div>
                </div>
                
                <Button
                  onClick={testEmailConfiguration}
                  disabled={isTestingConfig}
                  className="w-full"
                  variant="outline"
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  {isTestingConfig ? 'Probando...' : 'Probar Configuración'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}