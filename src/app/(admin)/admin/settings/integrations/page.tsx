"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ColoredSwitch } from "@/components/ui/ColoredSwitch"
import { toast } from "react-hot-toast"
import { 
  Plug, 
  Save,
  Settings,
  ExternalLink,
  Key,
  TestTube,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Zap,
  Mail,
  CreditCard,
  Truck,
  BarChart3,
  MessageSquare,
  Phone,
  Cloud,
  Database,
  ShoppingCart,
  Package,
  Calendar,
  Users,
  Globe,
  Lock
} from "lucide-react"

interface Integration {
  id: string
  name: string
  description: string
  category: 'payment' | 'shipping' | 'marketing' | 'analytics' | 'communication' | 'storage' | 'automation'
  icon: React.ElementType
  status: 'connected' | 'disconnected' | 'error' | 'pending'
  isEnabled: boolean
  settings: Record<string, any>
  lastSync?: string
  apiEndpoint?: string
  webhookUrl?: string
  requiresAuth: boolean
  documentation?: string
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [hasChanges, setHasChanges] = useState(false)

  // Mock data
  useEffect(() => {
    const mockIntegrations: Integration[] = [
      // Payment Gateways
      {
        id: "stripe",
        name: "Stripe",
        description: "Procesamiento de pagos online con tarjetas de crédito y débito",
        category: "payment",
        icon: CreditCard,
        status: "connected",
        isEnabled: true,
        requiresAuth: true,
        settings: {
          publishableKey: "pk_test_***************",
          secretKey: "sk_test_***************",
          webhookSecret: "whsec_***************",
          currency: "EUR",
          captureMethod: "automatic"
        },
        lastSync: "2025-06-13T14:30:00Z",
        webhookUrl: "https://api.stripe.com/v1/webhooks",
        documentation: "https://stripe.com/docs"
      },
      {
        id: "paypal",
        name: "PayPal",
        description: "Pagos a través de PayPal y tarjetas principales",
        category: "payment",
        icon: CreditCard,
        status: "disconnected",
        isEnabled: false,
        requiresAuth: true,
        settings: {
          clientId: "",
          clientSecret: "",
          environment: "sandbox"
        },
        documentation: "https://developer.paypal.com/docs"
      },

      // Shipping
      {
        id: "correos",
        name: "Correos",
        description: "Integración con Correos para envíos nacionales",
        category: "shipping",
        icon: Truck,
        status: "connected",
        isEnabled: true,
        requiresAuth: true,
        settings: {
          apiKey: "***************",
          contractNumber: "12345678",
          defaultService: "standard",
          trackingEnabled: true
        },
        lastSync: "2025-06-13T12:15:00Z",
        documentation: "https://correos.es/api"
      },
      {
        id: "seur",
        name: "SEUR",
        description: "Envíos express y logística con SEUR",
        category: "shipping",
        icon: Truck,
        status: "pending",
        isEnabled: false,
        requiresAuth: true,
        settings: {
          username: "",
          password: "",
          accountNumber: "",
          franchise: ""
        },
        documentation: "https://seur.com/api"
      },

      // Marketing
      {
        id: "mailchimp",
        name: "Mailchimp",
        description: "Email marketing y automatización",
        category: "marketing",
        icon: Mail,
        status: "connected",
        isEnabled: true,
        requiresAuth: true,
        settings: {
          apiKey: "***************",
          audienceId: "abc123456",
          server: "us1",
          syncCustomers: true,
          doubleOptIn: false
        },
        lastSync: "2025-06-13T10:45:00Z",
        documentation: "https://mailchimp.com/developer"
      },
      {
        id: "facebook-ads",
        name: "Facebook Ads",
        description: "Publicidad en Facebook e Instagram",
        category: "marketing",
        icon: BarChart3,
        status: "error",
        isEnabled: false,
        requiresAuth: true,
        settings: {
          accessToken: "",
          adAccountId: "",
          pixelId: "",
          conversionTracking: true
        },
        documentation: "https://developers.facebook.com/docs/marketing-apis"
      },

      // Analytics
      {
        id: "google-analytics",
        name: "Google Analytics",
        description: "Análisis web y seguimiento de conversiones",
        category: "analytics",
        icon: BarChart3,
        status: "connected",
        isEnabled: true,
        requiresAuth: true,
        settings: {
          trackingId: "GA-***************",
          measurementId: "G-***************",
          enhancedEcommerce: true,
          cookieConsent: true
        },
        lastSync: "2025-06-13T14:00:00Z",
        documentation: "https://developers.google.com/analytics"
      },
      {
        id: "hotjar",
        name: "Hotjar",
        description: "Heatmaps y grabaciones de sesiones",
        category: "analytics",
        icon: BarChart3,
        status: "disconnected",
        isEnabled: false,
        requiresAuth: true,
        settings: {
          siteId: "",
          trackingCode: ""
        },
        documentation: "https://help.hotjar.com/hc/en-us/categories/115001323967"
      },

      // Communication
      {
        id: "whatsapp-business",
        name: "WhatsApp Business",
        description: "Comunicación con clientes vía WhatsApp",
        category: "communication",
        icon: MessageSquare,
        status: "connected",
        isEnabled: true,
        requiresAuth: true,
        settings: {
          phoneNumberId: "***************",
          accessToken: "***************",
          webhookSecret: "***************",
          autoReplies: true
        },
        lastSync: "2025-06-13T13:20:00Z",
        documentation: "https://developers.facebook.com/docs/whatsapp"
      },
      {
        id: "zendesk",
        name: "Zendesk",
        description: "Sistema de tickets y soporte al cliente",
        category: "communication",
        icon: Users,
        status: "disconnected",
        isEnabled: false,
        requiresAuth: true,
        settings: {
          subdomain: "",
          email: "",
          apiToken: ""
        },
        documentation: "https://developer.zendesk.com/documentation"
      },

      // Storage & Cloud
      {
        id: "aws-s3",
        name: "Amazon S3",
        description: "Almacenamiento en la nube para archivos y backups",
        category: "storage",
        icon: Cloud,
        status: "connected",
        isEnabled: true,
        requiresAuth: true,
        settings: {
          accessKeyId: "***************",
          secretAccessKey: "***************",
          bucketName: "lovilike-assets",
          region: "eu-west-1"
        },
        lastSync: "2025-06-13T14:30:00Z",
        documentation: "https://docs.aws.amazon.com/s3"
      },

      // Automation
      {
        id: "zapier",
        name: "Zapier",
        description: "Automatización de flujos de trabajo",
        category: "automation",
        icon: Zap,
        status: "connected",
        isEnabled: true,
        requiresAuth: true,
        settings: {
          webhookUrl: "https://hooks.zapier.com/hooks/catch/****/****",
          triggerEvents: ["order_created", "customer_registered"],
          rateLimitPerMinute: 100
        },
        lastSync: "2025-06-13T11:30:00Z",
        documentation: "https://zapier.com/developer"
      }
    ]
    
    setIntegrations(mockIntegrations)
    setIsLoading(false)
  }, [])

  const categories = [
    { id: "all", name: "Todas", icon: Globe },
    { id: "payment", name: "Pagos", icon: CreditCard },
    { id: "shipping", name: "Envíos", icon: Truck },
    { id: "marketing", name: "Marketing", icon: Mail },
    { id: "analytics", name: "Análisis", icon: BarChart3 },
    { id: "communication", name: "Comunicación", icon: MessageSquare },
    { id: "storage", name: "Almacenamiento", icon: Cloud },
    { id: "automation", name: "Automatización", icon: Zap }
  ]

  const filteredIntegrations = integrations.filter(integration => {
    const matchesCategory = selectedCategory === "all" || integration.category === selectedCategory
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      connected: { label: "Conectado", color: "bg-green-100 text-green-800", icon: CheckCircle },
      disconnected: { label: "Desconectado", color: "bg-gray-100 text-gray-800", icon: XCircle },
      error: { label: "Error", color: "bg-red-100 text-red-800", icon: AlertCircle },
      pending: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800", icon: AlertCircle }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.disconnected
    const Icon = config.icon
    
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const toggleIntegration = (integrationId: string) => {
    setIntegrations(integrations.map(integration =>
      integration.id === integrationId
        ? { ...integration, isEnabled: !integration.isEnabled }
        : integration
    ))
    setHasChanges(true)
    toast.success("Estado de integración actualizado")
  }

  const testConnection = async (integrationId: string) => {
    toast.loading("Probando conexión...")
    
    // Simular test de conexión
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const success = Math.random() > 0.3 // 70% de éxito
    
    if (success) {
      setIntegrations(integrations.map(integration =>
        integration.id === integrationId
          ? { ...integration, status: 'connected', lastSync: new Date().toISOString() }
          : integration
      ))
      toast.dismiss()
      toast.success("Conexión exitosa")
    } else {
      setIntegrations(integrations.map(integration =>
        integration.id === integrationId
          ? { ...integration, status: 'error' }
          : integration
      ))
      toast.dismiss()
      toast.error("Error en la conexión")
    }
  }

  const formatLastSync = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success("Configuración de integraciones guardada correctamente")
      setHasChanges(false)
    } catch (error) {
      toast.error("Error al guardar la configuración")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Integraciones</h1>
            <p className="text-gray-600">Conecta tu tienda con servicios externos</p>
          </div>
          
          {hasChanges && (
            <Button 
              onClick={handleSave}
              disabled={isLoading}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Buscar integraciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto">
              {categories.map((category) => {
                const Icon = category.icon
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    className={`flex items-center gap-2 whitespace-nowrap ${
                      selectedCategory === category.id ? "bg-orange-600 hover:bg-orange-700" : ""
                    }`}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <Icon className="w-4 h-4" />
                    {category.name}
                  </Button>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de integraciones */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando integraciones...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredIntegrations.map((integration) => {
            const Icon = integration.icon
            
            return (
              <Card key={integration.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Icon className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{integration.name}</CardTitle>
                        <p className="text-sm text-gray-600">{integration.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getStatusBadge(integration.status)}
                      <ColoredSwitch
                        checked={integration.isEnabled}
                        onCheckedChange={() => toggleIntegration(integration.id)}
                        activeColor="green"
                        inactiveColor="gray"
                      />
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Información de estado */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        {integration.requiresAuth ? "Requiere autenticación" : "Configuración simple"}
                      </span>
                    </div>
                    
                    {integration.lastSync && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-gray-600">
                          Última sincronización: {formatLastSync(integration.lastSync)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Configuración básica */}
                  {integration.isEnabled && integration.status === 'connected' && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">Integración activa</span>
                      </div>
                      <div className="text-xs text-green-700 space-y-1">
                        {Object.entries(integration.settings).slice(0, 2).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                            <span className="font-mono">
                              {typeof value === 'string' && value.includes('*') ? value : '✓ Configurado'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Error de conexión */}
                  {integration.status === 'error' && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium text-red-800">Error de conexión</span>
                      </div>
                      <p className="text-xs text-red-700">
                        Verifica la configuración y las credenciales de acceso
                      </p>
                    </div>
                  )}

                  {/* Acciones */}
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => testConnection(integration.id)}
                      disabled={!integration.isEnabled}
                    >
                      <TestTube className="w-4 h-4 mr-2" />
                      Probar
                    </Button>
                    
                    <Button size="sm" variant="outline">
                      <Settings className="w-4 h-4 mr-2" />
                      Configurar
                    </Button>
                    
                    {integration.documentation && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open(integration.documentation, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Docs
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Información adicional */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            Información de Seguridad
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-800">Seguridad de Datos</span>
            </div>
            <p className="text-sm text-blue-700">
              Todas las credenciales se almacenan de forma segura y encriptada. 
              Las integraciones solo tienen acceso a los datos que específicamente autorices.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-gray-400" />
              <span>Autenticación OAuth 2.0</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-gray-400" />
              <span>Encriptación TLS 1.3</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-gray-400" />
              <span>Auditoría de accesos</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}