'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'react-hot-toast'
import WhatsAppWidget from '@/components/WhatsAppWidget'
import { 
  MessageCircle,
  Settings,
  Phone,
  Users,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  Eye,
  Save
} from 'lucide-react'

interface WhatsAppConfig {
  phone: string
  businessName: string
  welcomeMessage: string
  availability: {
    enabled: boolean
    schedule: string
    timezone: string
  }
  quickReplies: string[]
  enabled: boolean
  notifications: {
    newOrders: boolean
    lowStock: boolean
    customerMessages: boolean
    paymentIssues: boolean
  }
  businessProfile: {
    description: string
    address: string
    website: string
    email: string
  }
}

export default function WhatsAppConfigPage() {
  const [config, setConfig] = useState<WhatsAppConfig>({
    phone: '+34611066997',
    businessName: 'Lovilike Personalizados',
    welcomeMessage: '¡Hola! 👋 Bienvenido a Lovilike Personalizados.\n\n¿En qué podemos ayudarte? Somos especialistas en productos personalizados para eventos especiales.',
    availability: {
      enabled: true,
      schedule: 'Lunes a Viernes: 9:00 - 18:00',
      timezone: 'Europe/Madrid'
    },
    quickReplies: [
      '¿Cómo personalizar mi producto?',
      'Información sobre envíos y tiempos',
      'Consultar estado de mi pedido',
      'Precios y descuentos disponibles',
      'Hablar con un diseñador'
    ],
    enabled: true,
    notifications: {
      newOrders: true,
      lowStock: true,
      customerMessages: true,
      paymentIssues: true
    },
    businessProfile: {
      description: 'Especialistas en productos personalizados de alta calidad para bodas, comuniones, bautizos y eventos especiales.',
      address: 'España',
      website: 'https://lovilike.com',
      email: 'info@lovilike.es'
    }
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [stats, setStats] = useState({
    totalMessages: 127,
    messagesSentToday: 8,
    responseRate: 94.5,
    avgResponseTime: '2.3 min'
  })

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/whatsapp/config')
      if (response.ok) {
        const data = await response.json()
        setConfig(data)
      }
    } catch (error) {
      console.error('Error loading WhatsApp config:', error)
      toast.error('Error al cargar la configuración')
    } finally {
      setIsLoading(false)
    }
  }

  const saveConfig = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/whatsapp/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })

      if (response.ok) {
        toast.success('Configuración guardada correctamente')
      } else {
        throw new Error('Error al guardar')
      }
    } catch (error) {
      console.error('Error saving config:', error)
      toast.error('Error al guardar la configuración')
    } finally {
      setIsSaving(false)
    }
  }

  const updateQuickReply = (index: number, value: string) => {
    const newReplies = [...config.quickReplies]
    newReplies[index] = value
    setConfig(prev => ({
      ...prev,
      quickReplies: newReplies
    }))
  }

  const addQuickReply = () => {
    if (config.quickReplies.length < 10) {
      setConfig(prev => ({
        ...prev,
        quickReplies: [...prev.quickReplies, '']
      }))
    }
  }

  const removeQuickReply = (index: number) => {
    if (config.quickReplies.length > 1) {
      const newReplies = config.quickReplies.filter((_, i) => i !== index)
      setConfig(prev => ({
        ...prev,
        quickReplies: newReplies
      }))
    }
  }

  const sendTestMessage = () => {
    const testMessage = encodeURIComponent('🧪 Mensaje de prueba desde el panel de administración de Lovilike Personalizados.')
    const phoneFormatted = config.phone.replace(/[^\d+]/g, '')
    const whatsappURL = `https://wa.me/${phoneFormatted}?text=${testMessage}`
    window.open(whatsappURL, '_blank')
    toast.success('Mensaje de prueba enviado')
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando configuración de WhatsApp...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <MessageCircle className="w-8 h-8 text-green-600" />
            Configuración WhatsApp
          </h1>
          <p className="text-gray-600 mt-2">
            Configura la integración de WhatsApp Business para tu tienda
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye className="w-4 h-4 mr-2" />
            {showPreview ? 'Ocultar' : 'Vista previa'}
          </Button>
          <Button onClick={sendTestMessage} variant="outline">
            <Send className="w-4 h-4 mr-2" />
            Enviar prueba
          </Button>
          <Button onClick={saveConfig} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Mensajes Totales</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalMessages}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hoy</p>
                <p className="text-2xl font-bold text-blue-600">{stats.messagesSentToday}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tasa Respuesta</p>
                <p className="text-2xl font-bold text-purple-600">{stats.responseRate}%</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tiempo Respuesta</p>
                <p className="text-2xl font-bold text-orange-600">{stats.avgResponseTime}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration */}
        <div className="space-y-6">
          {/* Basic Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configuración Básica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">WhatsApp Habilitado</Label>
                  <p className="text-xs text-gray-500">Activar/desactivar el widget de WhatsApp</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      config.enabled ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        config.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Número de WhatsApp</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={config.phone}
                  onChange={(e) => setConfig(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+34611066997"
                />
              </div>

              <div>
                <Label htmlFor="businessName">Nombre del Negocio</Label>
                <Input
                  id="businessName"
                  value={config.businessName}
                  onChange={(e) => setConfig(prev => ({ ...prev, businessName: e.target.value }))}
                  placeholder="Lovilike Personalizados"
                />
              </div>

              <div>
                <Label htmlFor="schedule">Horario de Atención</Label>
                <Input
                  id="schedule"
                  value={config.availability.schedule}
                  onChange={(e) => setConfig(prev => ({ 
                    ...prev, 
                    availability: { ...prev.availability, schedule: e.target.value }
                  }))}
                  placeholder="Lunes a Viernes: 9:00 - 18:00"
                />
              </div>
            </CardContent>
          </Card>

          {/* Welcome Message */}
          <Card>
            <CardHeader>
              <CardTitle>Mensaje de Bienvenida</CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="welcomeMessage">Mensaje</Label>
              <textarea
                id="welcomeMessage"
                value={config.welcomeMessage}
                onChange={(e) => setConfig(prev => ({ ...prev, welcomeMessage: e.target.value }))}
                className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                rows={4}
                placeholder="¡Hola! 👋 Bienvenido a nuestro negocio..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Usa emojis y saltos de línea para hacer el mensaje más atractivo
              </p>
            </CardContent>
          </Card>

          {/* Quick Replies */}
          <Card>
            <CardHeader>
              <CardTitle>Respuestas Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {config.quickReplies.map((reply, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={reply}
                    onChange={(e) => updateQuickReply(index, e.target.value)}
                    placeholder={`Respuesta rápida ${index + 1}`}
                    className="flex-1"
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => removeQuickReply(index)}
                    disabled={config.quickReplies.length <= 1}
                  >
                    ×
                  </Button>
                </div>
              ))}
              <Button 
                variant="outline" 
                onClick={addQuickReply}
                disabled={config.quickReplies.length >= 10}
                className="w-full"
              >
                + Agregar respuesta rápida
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Notifications & Preview */}
        <div className="space-y-6">
          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Notificaciones Automáticas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'newOrders', label: 'Nuevos pedidos', icon: Package },
                { key: 'lowStock', label: 'Stock bajo', icon: Package },
                { key: 'customerMessages', label: 'Mensajes de clientes', icon: Users },
                { key: 'paymentIssues', label: 'Problemas de pago', icon: XCircle }
              ].map(({ key, label, icon: Icon }) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                  <button
                    onClick={() => setConfig(prev => ({ 
                      ...prev, 
                      notifications: { 
                        ...prev.notifications, 
                        [key]: !prev.notifications[key as keyof typeof prev.notifications] 
                      }
                    }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      config.notifications[key as keyof typeof config.notifications] ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        config.notifications[key as keyof typeof config.notifications] ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Preview */}
          {showPreview && (
            <Card>
              <CardHeader>
                <CardTitle>Vista Previa del Widget</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 min-h-[300px]">
                  <p className="text-sm text-gray-600 mb-4">
                    Así se verá el widget de WhatsApp en tu tienda:
                  </p>
                  <WhatsAppWidget config={config} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Integration Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Estado de la Integración
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Widget de WhatsApp</span>
                <Badge variant={config.enabled ? 'default' : 'secondary'}>
                  {config.enabled ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Número configurado</span>
                <Badge variant="default">
                  {config.phone}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Horario de atención</span>
                <Badge variant="outline">
                  Configurado
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Notificaciones</span>
                <Badge variant="default">
                  {Object.values(config.notifications).filter(Boolean).length} activas
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}