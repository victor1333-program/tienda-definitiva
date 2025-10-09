"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  ArrowLeft,
  Save,
  Mail,
  Settings,
  Eye,
  Send,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  FileText,
  Palette,
  Database,
  Globe,
  Shield,
  Clock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-hot-toast"

interface EmailTemplate {
  id: string
  name: string
  subject: string
  htmlContent: string
  textContent: string
  variables: string[]
  enabled: boolean
  lastModified: Date
}

interface EmailSettings {
  // SMTP Configuration
  smtp: {
    enabled: boolean
    host: string
    port: number
    secure: boolean
    username: string
    password: string
    fromEmail: string
    fromName: string
    replyTo: string
    testMode: boolean
  }
  
  // Email Templates
  templates: {
    orderConfirmation: EmailTemplate
    orderShipped: EmailTemplate
    orderDelivered: EmailTemplate
    orderCancelled: EmailTemplate
    paymentConfirmation: EmailTemplate
    paymentFailed: EmailTemplate
    quoteRequest: EmailTemplate
    quoteReady: EmailTemplate
    welcomeEmail: EmailTemplate
    passwordReset: EmailTemplate
    invoiceReady: EmailTemplate
    lowStock: EmailTemplate
    newOrder: EmailTemplate
    dailyReport: EmailTemplate
  }
  
  // Email Preferences
  preferences: {
    enableCustomerEmails: boolean
    enableAdminNotifications: boolean
    enableOrderUpdates: boolean
    enableMarketingEmails: boolean
    enableTransactionalEmails: boolean
    enableSystemAlerts: boolean
    batchSize: number
    sendDelay: number
    retryAttempts: number
    enableEmailQueue: boolean
  }
  
  // Branding
  branding: {
    logoUrl: string
    headerColor: string
    footerColor: string
    linkColor: string
    backgroundColor: string
    fontFamily: string
    companyAddress: string
    socialLinks: {
      facebook: string
      instagram: string
      twitter: string
      website: string
    }
  }
  
  // Advanced Settings
  advanced: {
    enableDKIM: boolean
    dkimPrivateKey: string
    dkimDomain: string
    enableSPF: boolean
    enableDMARC: boolean
    bounceHandling: boolean
    unsubscribeLink: boolean
    trackingPixel: boolean
    linkTracking: boolean
  }
}

export default function EmailSettingsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('smtp')
  const [testingConnection, setTestingConnection] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null)
  
  const [settings, setSettings] = useState<EmailSettings>({
    smtp: {
      enabled: false,
      host: "",
      port: 587,
      secure: false,
      username: "",
      password: "",
      fromEmail: "",
      fromName: "Mi Tienda",
      replyTo: "",
      testMode: true
    },
    templates: {
      orderConfirmation: {
        id: 'order-confirmation',
        name: 'Confirmación de Pedido',
        subject: 'Pedido #{orderNumber} confirmado',
        htmlContent: '<h1>¡Gracias por tu pedido!</h1><p>Tu pedido #{orderNumber} ha sido confirmado.</p>',
        textContent: 'Gracias por tu pedido! Tu pedido #{orderNumber} ha sido confirmado.',
        variables: ['orderNumber', 'customerName', 'orderTotal', 'orderDate'],
        enabled: true,
        lastModified: new Date()
      },
      orderShipped: {
        id: 'order-shipped',
        name: 'Pedido Enviado',
        subject: 'Tu pedido #{orderNumber} ha sido enviado',
        htmlContent: '<h1>¡Tu pedido está en camino!</h1><p>Número de seguimiento: {trackingNumber}</p>',
        textContent: 'Tu pedido está en camino! Número de seguimiento: {trackingNumber}',
        variables: ['orderNumber', 'trackingNumber', 'carrier', 'estimatedDelivery'],
        enabled: true,
        lastModified: new Date()
      },
      orderDelivered: {
        id: 'order-delivered',
        name: 'Pedido Entregado',
        subject: 'Tu pedido #{orderNumber} ha sido entregado',
        htmlContent: '<h1>¡Pedido entregado!</h1><p>Tu pedido ha sido entregado correctamente.</p>',
        textContent: 'Pedido entregado! Tu pedido ha sido entregado correctamente.',
        variables: ['orderNumber', 'customerName', 'deliveryDate'],
        enabled: true,
        lastModified: new Date()
      },
      orderCancelled: {
        id: 'order-cancelled',
        name: 'Pedido Cancelado',
        subject: 'Pedido #{orderNumber} cancelado',
        htmlContent: '<h1>Pedido cancelado</h1><p>Tu pedido ha sido cancelado. El reembolso se procesará en 3-5 días.</p>',
        textContent: 'Pedido cancelado. Tu pedido ha sido cancelado. El reembolso se procesará en 3-5 días.',
        variables: ['orderNumber', 'customerName', 'refundAmount'],
        enabled: true,
        lastModified: new Date()
      },
      paymentConfirmation: {
        id: 'payment-confirmation',
        name: 'Confirmación de Pago',
        subject: 'Pago confirmado para pedido #{orderNumber}',
        htmlContent: '<h1>Pago confirmado</h1><p>Hemos recibido tu pago de {amount}.</p>',
        textContent: 'Pago confirmado. Hemos recibido tu pago de {amount}.',
        variables: ['orderNumber', 'amount', 'paymentMethod'],
        enabled: true,
        lastModified: new Date()
      },
      paymentFailed: {
        id: 'payment-failed',
        name: 'Pago Fallido',
        subject: 'Problema con el pago del pedido #{orderNumber}',
        htmlContent: '<h1>Problema con el pago</h1><p>No hemos podido procesar tu pago. Por favor, inténtalo de nuevo.</p>',
        textContent: 'Problema con el pago. No hemos podido procesar tu pago. Por favor, inténtalo de nuevo.',
        variables: ['orderNumber', 'customerName', 'errorMessage'],
        enabled: true,
        lastModified: new Date()
      },
      quoteRequest: {
        id: 'quote-request',
        name: 'Solicitud de Presupuesto',
        subject: 'Hemos recibido tu solicitud de presupuesto',
        htmlContent: '<h1>Solicitud recibida</h1><p>Procesaremos tu solicitud y te responderemos pronto.</p>',
        textContent: 'Solicitud recibida. Procesaremos tu solicitud y te responderemos pronto.',
        variables: ['customerName', 'quoteNumber', 'projectDescription'],
        enabled: true,
        lastModified: new Date()
      },
      quoteReady: {
        id: 'quote-ready',
        name: 'Presupuesto Listo',
        subject: 'Tu presupuesto #{quoteNumber} está listo',
        htmlContent: '<h1>Presupuesto listo</h1><p>Tu presupuesto está disponible para revisión.</p>',
        textContent: 'Presupuesto listo. Tu presupuesto está disponible para revisión.',
        variables: ['customerName', 'quoteNumber', 'total', 'validUntil'],
        enabled: true,
        lastModified: new Date()
      },
      welcomeEmail: {
        id: 'welcome-email',
        name: 'Bienvenida',
        subject: '¡Bienvenido a {storeName}!',
        htmlContent: '<h1>¡Bienvenido!</h1><p>Gracias por registrarte en nuestra tienda.</p>',
        textContent: '¡Bienvenido! Gracias por registrarte en nuestra tienda.',
        variables: ['customerName', 'storeName'],
        enabled: true,
        lastModified: new Date()
      },
      passwordReset: {
        id: 'password-reset',
        name: 'Restablecer Contraseña',
        subject: 'Restablece tu contraseña',
        htmlContent: '<h1>Restablecer contraseña</h1><p>Haz clic en el enlace para restablecer tu contraseña: {resetLink}</p>',
        textContent: 'Restablecer contraseña. Haz clic en el enlace para restablecer tu contraseña: {resetLink}',
        variables: ['customerName', 'resetLink', 'expirationTime'],
        enabled: true,
        lastModified: new Date()
      },
      invoiceReady: {
        id: 'invoice-ready',
        name: 'Factura Lista',
        subject: 'Factura #{invoiceNumber} disponible',
        htmlContent: '<h1>Factura disponible</h1><p>Tu factura está lista para descargar.</p>',
        textContent: 'Factura disponible. Tu factura está lista para descargar.',
        variables: ['customerName', 'invoiceNumber', 'downloadLink'],
        enabled: true,
        lastModified: new Date()
      },
      lowStock: {
        id: 'low-stock',
        name: 'Stock Bajo',
        subject: 'Alerta: Stock bajo en {productName}',
        htmlContent: '<h1>Stock bajo</h1><p>El producto {productName} tiene stock bajo: {currentStock} unidades.</p>',
        textContent: 'Stock bajo. El producto {productName} tiene stock bajo: {currentStock} unidades.',
        variables: ['productName', 'currentStock', 'minStock'],
        enabled: true,
        lastModified: new Date()
      },
      newOrder: {
        id: 'new-order',
        name: 'Nuevo Pedido (Admin)',
        subject: 'Nuevo pedido #{orderNumber}',
        htmlContent: '<h1>Nuevo pedido</h1><p>Se ha recibido un nuevo pedido #{orderNumber} por {customerName}.</p>',
        textContent: 'Nuevo pedido. Se ha recibido un nuevo pedido #{orderNumber} por {customerName}.',
        variables: ['orderNumber', 'customerName', 'orderTotal'],
        enabled: true,
        lastModified: new Date()
      },
      dailyReport: {
        id: 'daily-report',
        name: 'Reporte Diario',
        subject: 'Reporte diario - {date}',
        htmlContent: '<h1>Reporte del día</h1><p>Pedidos: {ordersCount}, Ventas: {totalSales}</p>',
        textContent: 'Reporte del día. Pedidos: {ordersCount}, Ventas: {totalSales}',
        variables: ['date', 'ordersCount', 'totalSales', 'newCustomers'],
        enabled: false,
        lastModified: new Date()
      }
    },
    preferences: {
      enableCustomerEmails: true,
      enableAdminNotifications: true,
      enableOrderUpdates: true,
      enableMarketingEmails: false,
      enableTransactionalEmails: true,
      enableSystemAlerts: true,
      batchSize: 50,
      sendDelay: 5,
      retryAttempts: 3,
      enableEmailQueue: true
    },
    branding: {
      logoUrl: "",
      headerColor: "#1f2937",
      footerColor: "#f3f4f6",
      linkColor: "#3b82f6",
      backgroundColor: "#ffffff",
      fontFamily: "Arial, sans-serif",
      companyAddress: "",
      socialLinks: {
        facebook: "",
        instagram: "",
        twitter: "",
        website: ""
      }
    },
    advanced: {
      enableDKIM: false,
      dkimPrivateKey: "",
      dkimDomain: "",
      enableSPF: false,
      enableDMARC: false,
      bounceHandling: true,
      unsubscribeLink: true,
      trackingPixel: false,
      linkTracking: false
    }
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings/email')
      if (response.ok) {
        const data = await response.json()
        setSettings(prev => ({ ...prev, ...data }))
      }
    } catch (error) {
      console.error('Error loading email settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      console.log('🔄 Guardando configuración de email...', settings)
      
      const response = await fetch('/api/settings/email', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      console.log('📥 Response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ Error response:', errorData)
        throw new Error(errorData.error || 'Error al guardar configuración')
      }

      const result = await response.json()
      console.log('✅ Success response:', result)
      
      toast.success('✅ Configuración de email guardada correctamente')
    } catch (error) {
      console.error('💥 Error al guardar:', error)
      toast.error('❌ Error al guardar la configuración: ' + (error instanceof Error ? error.message : 'Error desconocido'))
    } finally {
      setIsSaving(false)
    }
  }

  const testConnection = async () => {
    setTestingConnection(true)
    try {
      const testData = {
        ...settings.smtp,
        testEmail: settings.smtp.fromEmail
      }
      
      const response = await fetch('/api/settings/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      })
      
      if (response.ok) {
        const result = await response.json()
        toast.success('✅ Conexión SMTP exitosa - Email de prueba enviado')
      } else {
        const error = await response.json()
        toast.error('❌ Error en la conexión SMTP: ' + (error.error || 'Error desconocido'))
      }
    } catch (error) {
      console.error('Error testing connection:', error)
      toast.error('❌ Error al probar la conexión')
    } finally {
      setTestingConnection(false)
    }
  }

  const sendTestEmail = async () => {
    try {
      const response = await fetch('/api/settings/email/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          templateType: 'orderConfirmation',
          testEmail: settings.smtp.fromEmail
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        toast.success('📧 Email de prueba enviado correctamente')
      } else {
        const error = await response.json()
        toast.error('❌ Error al enviar email de prueba: ' + (error.error || 'Error desconocido'))
      }
    } catch (error) {
      console.error('Error sending test email:', error)
      toast.error('❌ Error al enviar email de prueba')
    }
  }

  const handleSMTPChange = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      smtp: { ...prev.smtp, [field]: value }
    }))
  }

  const handlePreferencesChange = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      preferences: { ...prev.preferences, [field]: value }
    }))
  }

  const handleBrandingChange = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      branding: { ...prev.branding, [field]: value }
    }))
  }

  const handleAdvancedChange = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      advanced: { ...prev.advanced, [field]: value }
    }))
  }

  const updateTemplate = (templateId: string, updates: Partial<EmailTemplate>) => {
    setSettings(prev => ({
      ...prev,
      templates: {
        ...prev.templates,
        [templateId]: { ...prev.templates[templateId as keyof typeof prev.templates], ...updates }
      }
    }))
  }

  const tabs = [
    { id: 'smtp', label: 'Configuración SMTP', icon: <Settings className="w-4 h-4" /> },
    { id: 'templates', label: 'Plantillas', icon: <FileText className="w-4 h-4" /> },
    { id: 'preferences', label: 'Preferencias', icon: <Mail className="w-4 h-4" /> },
    { id: 'branding', label: 'Diseño', icon: <Palette className="w-4 h-4" /> },
    { id: 'advanced', label: 'Avanzado', icon: <Shield className="w-4 h-4" /> }
  ]

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando configuración de email...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Configuración de Email</h1>
            <p className="text-gray-600 mt-1">
              Configura SMTP, plantillas y preferencias de email
            </p>
          </div>
        </div>
        <div className="flex gap-2">
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
      <div className={`border-l-4 p-4 ${settings.smtp.enabled ? 'bg-green-50 border-green-400' : 'bg-yellow-50 border-yellow-400'}`}>
        <div className="flex items-center">
          {settings.smtp.enabled ? (
            <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2" />
          )}
          <div>
            <p className={`text-sm ${settings.smtp.enabled ? 'text-green-700' : 'text-yellow-700'}`}>
              <strong>Estado SMTP:</strong> {settings.smtp.enabled ? 'Configurado y activo' : 'No configurado'}.
              {settings.smtp.testMode && ' Modo de pruebas activado.'}
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
            </button>
          ))}
        </nav>
      </div>

      {/* SMTP Configuration */}
      {activeTab === 'smtp' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configuración SMTP
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.smtp.enabled}
                    onChange={(e) => handleSMTPChange('enabled', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="font-medium">Habilitar SMTP</span>
                </label>
                {settings.smtp.enabled && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={testConnection}
                    disabled={testingConnection}
                  >
                    {testingConnection ? 'Probando...' : 'Probar Conexión'}
                  </Button>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Servidor SMTP
                </label>
                <Input
                  value={settings.smtp.host}
                  onChange={(e) => handleSMTPChange('host', e.target.value)}
                  placeholder="smtp.gmail.com"
                  disabled={!settings.smtp.enabled}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Puerto
                  </label>
                  <Input
                    type="number"
                    value={settings.smtp.port}
                    onChange={(e) => handleSMTPChange('port', parseInt(e.target.value))}
                    disabled={!settings.smtp.enabled}
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.smtp.secure}
                      onChange={(e) => handleSMTPChange('secure', e.target.checked)}
                      className="mr-2"
                      disabled={!settings.smtp.enabled}
                    />
                    <span>Conexión segura (SSL/TLS)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Usuario
                </label>
                <Input
                  value={settings.smtp.username}
                  onChange={(e) => handleSMTPChange('username', e.target.value)}
                  placeholder="usuario@ejemplo.com"
                  disabled={!settings.smtp.enabled}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <Input
                  type="password"
                  value={settings.smtp.password}
                  onChange={(e) => handleSMTPChange('password', e.target.value)}
                  disabled={!settings.smtp.enabled}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configuración del Remitente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email del Remitente
                </label>
                <Input
                  type="email"
                  value={settings.smtp.fromEmail}
                  onChange={(e) => handleSMTPChange('fromEmail', e.target.value)}
                  placeholder="noreply@mitienda.com"
                  disabled={!settings.smtp.enabled}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Remitente
                </label>
                <Input
                  value={settings.smtp.fromName}
                  onChange={(e) => handleSMTPChange('fromName', e.target.value)}
                  placeholder="Mi Tienda"
                  disabled={!settings.smtp.enabled}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email de Respuesta
                </label>
                <Input
                  type="email"
                  value={settings.smtp.replyTo}
                  onChange={(e) => handleSMTPChange('replyTo', e.target.value)}
                  placeholder="info@mitienda.com"
                  disabled={!settings.smtp.enabled}
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.smtp.testMode}
                    onChange={(e) => handleSMTPChange('testMode', e.target.checked)}
                    className="mr-2"
                    disabled={!settings.smtp.enabled}
                  />
                  <span>Modo de Pruebas</span>
                </label>
              </div>

              {settings.smtp.enabled && (
                <Button onClick={sendTestEmail} className="w-full">
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Email de Prueba
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="grid gap-4">
            {Object.entries(settings.templates).map(([key, template]) => (
              <Card key={key}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{template.name}</h3>
                      <p className="text-sm text-gray-600">ID: {template.id}</p>
                    </div>
                    <div className="flex gap-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={template.enabled}
                          onChange={(e) => updateTemplate(key, { enabled: e.target.checked })}
                          className="mr-2"
                        />
                        <span className="text-sm">Activo</span>
                      </label>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPreviewTemplate(previewTemplate === key ? null : key)}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        {previewTemplate === key ? 'Ocultar' : 'Preview'}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Asunto
                      </label>
                      <Input
                        value={template.subject}
                        onChange={(e) => updateTemplate(key, { subject: e.target.value })}
                        disabled={!template.enabled}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Variables Disponibles
                      </label>
                      <div className="flex flex-wrap gap-1">
                        {template.variables.map(variable => (
                          <Badge key={variable} variant="secondary" className="text-xs">
                            {`{${variable}}`}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {previewTemplate === key && (
                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Contenido HTML
                        </label>
                        <textarea
                          value={template.htmlContent}
                          onChange={(e) => updateTemplate(key, { htmlContent: e.target.value })}
                          rows={6}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm"
                          disabled={!template.enabled}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Contenido de Texto
                        </label>
                        <textarea
                          value={template.textContent}
                          onChange={(e) => updateTemplate(key, { textContent: e.target.value })}
                          rows={4}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          disabled={!template.enabled}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Tipos de Email</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.preferences.enableCustomerEmails}
                  onChange={(e) => handlePreferencesChange('enableCustomerEmails', e.target.checked)}
                  className="mr-2"
                />
                <span>Emails a Clientes</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.preferences.enableAdminNotifications}
                  onChange={(e) => handlePreferencesChange('enableAdminNotifications', e.target.checked)}
                  className="mr-2"
                />
                <span>Notificaciones de Admin</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.preferences.enableOrderUpdates}
                  onChange={(e) => handlePreferencesChange('enableOrderUpdates', e.target.checked)}
                  className="mr-2"
                />
                <span>Actualizaciones de Pedidos</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.preferences.enableTransactionalEmails}
                  onChange={(e) => handlePreferencesChange('enableTransactionalEmails', e.target.checked)}
                  className="mr-2"
                />
                <span>Emails Transaccionales</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.preferences.enableMarketingEmails}
                  onChange={(e) => handlePreferencesChange('enableMarketingEmails', e.target.checked)}
                  className="mr-2"
                />
                <span>Emails de Marketing</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.preferences.enableSystemAlerts}
                  onChange={(e) => handlePreferencesChange('enableSystemAlerts', e.target.checked)}
                  className="mr-2"
                />
                <span>Alertas del Sistema</span>
              </label>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configuración Avanzada</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tamaño de Lote
                </label>
                <Input
                  type="number"
                  value={settings.preferences.batchSize}
                  onChange={(e) => handlePreferencesChange('batchSize', parseInt(e.target.value))}
                />
                <p className="text-xs text-gray-500 mt-1">Emails enviados por lote</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Retraso entre Envíos (segundos)
                </label>
                <Input
                  type="number"
                  value={settings.preferences.sendDelay}
                  onChange={(e) => handlePreferencesChange('sendDelay', parseInt(e.target.value))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Intentos de Reenvío
                </label>
                <Input
                  type="number"
                  value={settings.preferences.retryAttempts}
                  onChange={(e) => handlePreferencesChange('retryAttempts', parseInt(e.target.value))}
                />
              </div>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.preferences.enableEmailQueue}
                  onChange={(e) => handlePreferencesChange('enableEmailQueue', e.target.checked)}
                  className="mr-2"
                />
                <span>Habilitar Cola de Emails</span>
              </label>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}