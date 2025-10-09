"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  ArrowLeft,
  Save,
  Bell,
  Mail,
  MessageSquare,
  Clock,
  AlertTriangle,
  CheckCircle,
  Info,
  Package,
  Users,
  CreditCard,
  TrendingDown,
  Settings,
  RefreshCw,
  TestTube,
  Volume2,
  VolumeX
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-hot-toast"

interface NotificationSettings {
  // Email notifications
  email: {
    enabled: boolean
    newOrders: boolean
    paymentIssues: boolean
    lowStock: boolean
    customerMessages: boolean
    systemAlerts: boolean
    dailyReports: boolean
    weeklyReports: boolean
  }
  
  // In-app notifications
  inApp: {
    enabled: boolean
    newOrders: boolean
    paymentIssues: boolean
    lowStock: boolean
    customerMessages: boolean
    systemAlerts: boolean
    sound: boolean
  }
  
  // WhatsApp notifications (future feature)
  whatsapp: {
    enabled: boolean
    phoneNumber: string
    urgentOnly: boolean
    businessHours: boolean
  }
  
  // Notification preferences
  preferences: {
    frequency: 'instant' | 'hourly' | 'daily'
    quietHours: {
      enabled: boolean
      start: string
      end: string
    }
    categories: {
      orders: { priority: 'high' | 'medium' | 'low'; enabled: boolean }
      payments: { priority: 'high' | 'medium' | 'low'; enabled: boolean }
      inventory: { priority: 'high' | 'medium' | 'low'; enabled: boolean }
      customers: { priority: 'high' | 'medium' | 'low'; enabled: boolean }
      system: { priority: 'high' | 'medium' | 'low'; enabled: boolean }
      production: { priority: 'high' | 'medium' | 'low'; enabled: boolean }
    }
  }
  
  // Thresholds
  thresholds: {
    lowStockThreshold: number
    highValueOrderThreshold: number
    paymentFailureThreshold: number
    responseTimeThreshold: number
  }
}

export default function NotificationSettingsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('email')
  
  const [settings, setSettings] = useState<NotificationSettings>({
    email: {
      enabled: true,
      newOrders: true,
      paymentIssues: true,
      lowStock: true,
      customerMessages: false,
      systemAlerts: true,
      dailyReports: false,
      weeklyReports: false
    },
    inApp: {
      enabled: true,
      newOrders: true,
      paymentIssues: true,
      lowStock: true,
      customerMessages: true,
      systemAlerts: true,
      sound: true
    },
    whatsapp: {
      enabled: false,
      phoneNumber: '',
      urgentOnly: true,
      businessHours: true
    },
    preferences: {
      frequency: 'instant',
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00'
      },
      categories: {
        orders: { priority: 'high', enabled: true },
        payments: { priority: 'high', enabled: true },
        inventory: { priority: 'medium', enabled: true },
        customers: { priority: 'medium', enabled: true },
        system: { priority: 'low', enabled: true },
        production: { priority: 'medium', enabled: true }
      }
    },
    thresholds: {
      lowStockThreshold: 10,
      highValueOrderThreshold: 500,
      paymentFailureThreshold: 3,
      responseTimeThreshold: 24
    }
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings/notifications')
      if (response.ok) {
        const data = await response.json()
        setSettings(prev => ({ ...prev, ...data }))
      }
    } catch (error) {
      console.error('Error loading notification settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/settings/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      if (!response.ok) throw new Error('Error al guardar configuración')

      toast.success('Configuración de notificaciones guardada correctamente')
    } catch (error) {
      toast.error('Error al guardar la configuración')
    } finally {
      setIsSaving(false)
    }
  }

  const handleTestNotification = async () => {
    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST'
      })

      if (response.ok) {
        toast.success('Notificación de prueba enviada')
      } else {
        toast.error('Error al enviar notificación de prueba')
      }
    } catch (error) {
      toast.error('Error al enviar notificación de prueba')
    }
  }

  const updateEmailSetting = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      email: { ...prev.email, [key]: value }
    }))
  }

  const updateInAppSetting = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      inApp: { ...prev.inApp, [key]: value }
    }))
  }

  const updateWhatsAppSetting = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      whatsapp: { ...prev.whatsapp, [key]: value }
    }))
  }

  const updatePreference = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      preferences: { ...prev.preferences, [key]: value }
    }))
  }

  const updateCategorySettings = (category: string, updates: any) => {
    setSettings(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        categories: {
          ...prev.preferences.categories,
          [category]: { ...prev.preferences.categories[category as keyof typeof prev.preferences.categories], ...updates }
        }
      }
    }))
  }

  const updateThreshold = (key: string, value: number) => {
    setSettings(prev => ({
      ...prev,
      thresholds: { ...prev.thresholds, [key]: value }
    }))
  }

  const tabs = [
    { id: 'email', label: 'Email', icon: <Mail className="w-4 h-4" /> },
    { id: 'inapp', label: 'En la App', icon: <Bell className="w-4 h-4" /> },
    { id: 'whatsapp', label: 'WhatsApp', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'preferences', label: 'Preferencias', icon: <Settings className="w-4 h-4" /> },
    { id: 'thresholds', label: 'Umbrales', icon: <AlertTriangle className="w-4 h-4" /> }
  ]

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">⚙️ Configuración de Notificaciones</h1>
            <p className="text-gray-600 mt-1">
              Personaliza cómo y cuándo recibir alertas del sistema
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleTestNotification}>
            <TestTube className="h-4 w-4 mr-2" />
            Probar
          </Button>
          <Button variant="outline" onClick={loadSettings}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Recargar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </div>

      {/* Status Banner */}
      <div className="bg-green-50 border-l-4 border-green-400 p-4">
        <div className="flex items-center">
          <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
          <div>
            <p className="text-sm text-green-700">
              <strong>Sistema activo:</strong> Las notificaciones están funcionando correctamente. 
              Última actualización: {new Date().toLocaleString('es-ES')}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              {tab.label}
              {(tab.id === 'email' && settings.email.enabled) ||
               (tab.id === 'inapp' && settings.inApp.enabled) ||
               (tab.id === 'whatsapp' && settings.whatsapp.enabled) ? (
                <Badge className="bg-green-100 text-green-800 text-xs ml-1">ON</Badge>
              ) : null}
            </button>
          ))}
        </nav>
      </div>

      {/* Email Settings */}
      {activeTab === 'email' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Notificaciones por Email
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Habilitar notificaciones por email</h3>
                <p className="text-sm text-gray-600">Recibe alertas importantes en tu correo electrónico</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.email.enabled}
                  onChange={(e) => updateEmailSetting('enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>

            {settings.email.enabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries({
                  newOrders: { label: 'Nuevos pedidos', icon: <Package className="w-4 h-4" /> },
                  paymentIssues: { label: 'Problemas de pago', icon: <CreditCard className="w-4 h-4" /> },
                  lowStock: { label: 'Stock bajo', icon: <TrendingDown className="w-4 h-4" /> },
                  customerMessages: { label: 'Mensajes de clientes', icon: <Users className="w-4 h-4" /> },
                  systemAlerts: { label: 'Alertas del sistema', icon: <AlertTriangle className="w-4 h-4" /> },
                  dailyReports: { label: 'Reportes diarios', icon: <Info className="w-4 h-4" /> },
                  weeklyReports: { label: 'Reportes semanales', icon: <Info className="w-4 h-4" /> }
                }).map(([key, config]) => (
                  <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-gray-500">
                        {config.icon}
                      </div>
                      <span className="text-sm font-medium">{config.label}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.email[key as keyof typeof settings.email] as boolean}
                      onChange={(e) => updateEmailSetting(key, e.target.checked)}
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* In-App Settings */}
      {activeTab === 'inapp' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notificaciones en la Aplicación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Habilitar notificaciones en la app</h3>
                <p className="text-sm text-gray-600">Recibe alertas directamente en el panel de administración</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.inApp.enabled}
                  onChange={(e) => updateInAppSetting('enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>

            {settings.inApp.enabled && (
              <>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Volume2 className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium">Sonidos de notificación</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.inApp.sound}
                    onChange={(e) => updateInAppSetting('sound', e.target.checked)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries({
                    newOrders: { label: 'Nuevos pedidos', icon: <Package className="w-4 h-4" /> },
                    paymentIssues: { label: 'Problemas de pago', icon: <CreditCard className="w-4 h-4" /> },
                    lowStock: { label: 'Stock bajo', icon: <TrendingDown className="w-4 h-4" /> },
                    customerMessages: { label: 'Mensajes de clientes', icon: <Users className="w-4 h-4" /> },
                    systemAlerts: { label: 'Alertas del sistema', icon: <AlertTriangle className="w-4 h-4" /> }
                  }).map(([key, config]) => (
                    <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-gray-500">
                          {config.icon}
                        </div>
                        <span className="text-sm font-medium">{config.label}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.inApp[key as keyof typeof settings.inApp] as boolean}
                        onChange={(e) => updateInAppSetting(key, e.target.checked)}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* WhatsApp Settings */}
      {activeTab === 'whatsapp' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Notificaciones por WhatsApp
              <Badge variant="secondary">Próximamente</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-8">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">WhatsApp Business API</h3>
              <p className="mt-1 text-sm text-gray-500">
                La integración con WhatsApp estará disponible próximamente para alertas críticas
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preferences */}
      {activeTab === 'preferences' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferencias Generales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frecuencia de notificaciones
                </label>
                <select
                  value={settings.preferences.frequency}
                  onChange={(e) => updatePreference('frequency', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="instant">Instantáneas</option>
                  <option value="hourly">Cada hora</option>
                  <option value="daily">Diarias</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium">Horario silencioso</h3>
                    <p className="text-sm text-gray-600">No recibir notificaciones durante estas horas</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.preferences.quietHours.enabled}
                    onChange={(e) => updatePreference('quietHours', { 
                      ...settings.preferences.quietHours, 
                      enabled: e.target.checked 
                    })}
                  />
                </div>

                {settings.preferences.quietHours.enabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Desde
                      </label>
                      <Input
                        type="time"
                        value={settings.preferences.quietHours.start}
                        onChange={(e) => updatePreference('quietHours', { 
                          ...settings.preferences.quietHours, 
                          start: e.target.value 
                        })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hasta
                      </label>
                      <Input
                        type="time"
                        value={settings.preferences.quietHours.end}
                        onChange={(e) => updatePreference('quietHours', { 
                          ...settings.preferences.quietHours, 
                          end: e.target.value 
                        })}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Prioridad por Categorías</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(settings.preferences.categories).map(([category, config]) => (
                  <div key={category} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="font-medium capitalize">{category}</span>
                      <Badge 
                        variant={config.priority === 'high' ? 'destructive' : 
                                config.priority === 'medium' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {config.priority === 'high' ? 'Alta' :
                         config.priority === 'medium' ? 'Media' : 'Baja'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <select
                        value={config.priority}
                        onChange={(e) => updateCategorySettings(category, { priority: e.target.value })}
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                      >
                        <option value="high">Alta</option>
                        <option value="medium">Media</option>
                        <option value="low">Baja</option>
                      </select>
                      <input
                        type="checkbox"
                        checked={config.enabled}
                        onChange={(e) => updateCategorySettings(category, { enabled: e.target.checked })}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Thresholds */}
      {activeTab === 'thresholds' && (
        <Card>
          <CardHeader>
            <CardTitle>Umbrales de Alerta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Umbral de stock bajo (unidades)
                </label>
                <Input
                  type="number"
                  value={settings.thresholds.lowStockThreshold}
                  onChange={(e) => updateThreshold('lowStockThreshold', parseInt(e.target.value))}
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Alerta cuando un producto tenga menos de estas unidades
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pedido de alto valor (€)
                </label>
                <Input
                  type="number"
                  value={settings.thresholds.highValueOrderThreshold}
                  onChange={(e) => updateThreshold('highValueOrderThreshold', parseInt(e.target.value))}
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Alerta para pedidos superiores a este importe
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fallos de pago consecutivos
                </label>
                <Input
                  type="number"
                  value={settings.thresholds.paymentFailureThreshold}
                  onChange={(e) => updateThreshold('paymentFailureThreshold', parseInt(e.target.value))}
                  min="1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Alerta después de este número de fallos consecutivos
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiempo de respuesta (horas)
                </label>
                <Input
                  type="number"
                  value={settings.thresholds.responseTimeThreshold}
                  onChange={(e) => updateThreshold('responseTimeThreshold', parseInt(e.target.value))}
                  min="1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Alerta si no hay respuesta en este tiempo
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}