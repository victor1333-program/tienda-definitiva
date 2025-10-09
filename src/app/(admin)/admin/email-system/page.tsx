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
  Mail, 
  Save,
  TestTube,
  Settings,
  Send,
  Eye,
  Edit,
  Plus,
  AlertCircle,
  CheckCircle,
  Server,
  Lock,
  User,
  Globe,
  FileText,
  Zap,
  RefreshCw,
  X
} from "lucide-react"

interface EmailConfig {
  smtp_host?: string
  smtp_port?: string
  smtp_secure?: string
  smtp_user?: string
  smtp_password?: string
  from_email?: string
  from_name?: string
}

interface EmailTemplate {
  id: string
  type: string
  name: string
  description: string
  subject: string
  isActive: boolean
  variables: string[]
  lastModified: string
}

export default function EmailSystemPage() {
  const [config, setConfig] = useState<EmailConfig>({})
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testEmail, setTestEmail] = useState("")
  const [hasChanges, setHasChanges] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'success' | 'error'>('unknown')
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [showTemplateModal, setShowTemplateModal] = useState(false)

  useEffect(() => {
    loadEmailConfig()
    loadEmailTemplates()
  }, [])

  const loadEmailConfig = async () => {
    try {
      const response = await fetch('/api/admin/email/config')
      if (response.ok) {
        const data = await response.json()
        setConfig(data.config || {})
      }
    } catch (error) {
      console.error('Error loading email config:', error)
      toast.error('Error al cargar la configuración de email')
    } finally {
      setIsLoading(false)
    }
  }

  const loadEmailTemplates = async () => {
    try {
      const response = await fetch('/api/admin/email/templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates || [])
      }
    } catch (error) {
      console.error('Error loading email templates:', error)
    }
  }

  const handleConfigChange = (field: string, value: any) => {
    setConfig({
      ...config,
      [field]: value
    })
    setHasChanges(true)
    setConnectionStatus('unknown')
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/email/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Configuración guardada exitosamente')
        setHasChanges(false)
        setConnectionStatus(data.connectionTest?.success ? 'success' : 'error')
        
        if (!data.connectionTest?.success) {
          toast.error(`Error de conexión: ${data.connectionTest?.message}`)
        }
      } else {
        toast.error(data.error || 'Error al guardar la configuración')
      }
    } catch (error) {
      console.error('Error saving config:', error)
      toast.error('Error al guardar la configuración')
    } finally {
      setIsSaving(false)
    }
  }

  const handleTestEmail = async () => {
    if (!testEmail) {
      toast.error('Ingresa un email para la prueba')
      return
    }

    setIsTesting(true)
    try {
      const response = await fetch('/api/admin/email/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testEmail }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message)
        setConnectionStatus('success')
      } else {
        toast.error(data.message)
        setConnectionStatus('error')
      }
    } catch (error) {
      console.error('Error testing email:', error)
      toast.error('Error al enviar email de prueba')
      setConnectionStatus('error')
    } finally {
      setIsTesting(false)
    }
  }

  const handleSendTestTemplate = async (templateType: string) => {
    if (!testEmail) {
      toast.error('Ingresa un email para la prueba')
      return
    }

    try {
      const response = await fetch('/api/admin/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          templateType, 
          to: testEmail 
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`Email de prueba enviado: ${templateType}`)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error('Error sending test template:', error)
      toast.error('Error al enviar template de prueba')
    }
  }

  const getConnectionStatusBadge = () => {
    switch (connectionStatus) {
      case 'success':
        return (
          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Conectado
          </Badge>
        )
      case 'error':
        return (
          <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Error
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 flex items-center gap-1">
            <RefreshCw className="w-3 h-3" />
            Sin probar
          </Badge>
        )
    }
  }

  const getTemplateTypeBadge = (type: string) => {
    const typeConfig = {
      'ORDER_CONFIRMATION': { label: 'Pedido Confirmado', color: 'bg-blue-100 text-blue-800' },
      'ORDER_SHIPPED': { label: 'Pedido Enviado', color: 'bg-purple-100 text-purple-800' },
      'WELCOME': { label: 'Bienvenida', color: 'bg-green-100 text-green-800' },
      'PASSWORD_RESET': { label: 'Reset Password', color: 'bg-orange-100 text-orange-800' },
      'CUSTOM': { label: 'Personalizado', color: 'bg-gray-100 text-gray-800' }
    }
    
    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.CUSTOM
    return <Badge className={config.color}>{config.label}</Badge>
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Sistema de Email</h1>
            <p className="text-gray-600">Configuración SMTP y gestión de templates de email</p>
          </div>
          
          <div className="flex items-center gap-3">
            {getConnectionStatusBadge()}
            <Button 
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Configuración
                </>
              )}
            </Button>
          </div>
        </div>
        
        {hasChanges && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">Tienes cambios sin guardar</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuración SMTP */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5" />
              Configuración SMTP
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="smtp_host">Servidor SMTP</Label>
                <Input
                  id="smtp_host"
                  type="text"
                  placeholder="smtp.gmail.com"
                  value={config.smtp_host || ''}
                  onChange={(e) => handleConfigChange('smtp_host', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="smtp_port">Puerto</Label>
                <Input
                  id="smtp_port"
                  type="number"
                  placeholder="587"
                  value={config.smtp_port || ''}
                  onChange={(e) => handleConfigChange('smtp_port', e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Conexión Segura (SSL/TLS)</Label>
                <p className="text-sm text-gray-600">Usar puerto 465 para SSL, 587 para TLS</p>
              </div>
              <ColoredSwitch
                checked={config.smtp_secure === 'true'}
                onCheckedChange={(checked) => handleConfigChange('smtp_secure', checked)}
                activeColor="green"
                inactiveColor="gray"
              />
            </div>
            
            <div>
              <Label htmlFor="smtp_user">Usuario SMTP</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="smtp_user"
                  type="email"
                  placeholder="tu-email@gmail.com"
                  className="pl-10"
                  value={config.smtp_user || ''}
                  onChange={(e) => handleConfigChange('smtp_user', e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="smtp_password">Contraseña SMTP</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="smtp_password"
                  type="password"
                  placeholder="Contraseña o App Password"
                  className="pl-10"
                  value={config.smtp_password || ''}
                  onChange={(e) => handleConfigChange('smtp_password', e.target.value)}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Para Gmail, usa una App Password en lugar de tu contraseña normal
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="from_email">Email de Origen</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="from_email"
                    type="email"
                    placeholder="noreply@lovilike.es"
                    className="pl-10"
                    value={config.from_email || ''}
                    onChange={(e) => handleConfigChange('from_email', e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="from_name">Nombre del Remitente</Label>
                <Input
                  id="from_name"
                  type="text"
                  placeholder="Lovilike Personalizados"
                  value={config.from_name || ''}
                  onChange={(e) => handleConfigChange('from_name', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prueba de Email */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="w-5 h-5" />
              Prueba de Configuración
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="testEmail">Email de Prueba</Label>
              <Input
                id="testEmail"
                type="email"
                placeholder="test@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
            </div>
            
            <Button 
              onClick={handleTestEmail}
              disabled={isTesting || !testEmail}
              className="w-full"
              variant="outline"
            >
              {isTesting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Email de Prueba
                </>
              )}
            </Button>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">💡 Configuración Recomendada</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>Gmail:</strong> smtp.gmail.com:587 (TLS)</p>
                <p><strong>Outlook:</strong> smtp-mail.outlook.com:587</p>
                <p><strong>Yahoo:</strong> smtp.mail.yahoo.com:587</p>
                <p><strong>Otros:</strong> Consulta con tu proveedor</p>
              </div>
            </div>
            
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">⚠️ Importante</h4>
              <p className="text-sm text-yellow-800">
                Para Gmail, activa la verificación en 2 pasos y genera una "Contraseña de aplicación" específica.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Templates de Email */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Templates de Email
            </CardTitle>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Template
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando templates...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {templates.map((template) => (
                <div key={template.id} className="p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{template.name}</h4>
                          {getTemplateTypeBadge(template.type)}
                          {template.isActive ? (
                            <Badge className="bg-green-100 text-green-800">Activo</Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-800">Inactivo</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{template.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Variables: {template.variables.join(', ')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSendTestTemplate(template.type)}
                        disabled={!testEmail}
                        title="Enviar prueba"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        title="Ver template"
                        onClick={() => {
                          setSelectedTemplate(template)
                          setShowTemplateModal(true)
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        title="Editar template"
                        onClick={() => {
                          // Navigate to edit page
                          window.open(`/admin/email-system/templates/${template.id}/edit`, '_blank')
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Template View Modal */}
      {showTemplateModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto mx-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold">{selectedTemplate.name}</h3>
                <p className="text-sm text-gray-600">{selectedTemplate.description}</p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setShowTemplateModal(false)
                  setSelectedTemplate(null)
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Asunto:</Label>
                <p className="text-sm bg-gray-50 p-3 rounded border">{selectedTemplate.subject}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Variables disponibles:</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedTemplate.variables.map((variable, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {variable}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Vista previa del template:</Label>
                <div className="bg-gray-50 p-4 rounded border min-h-[300px] mt-2">
                  <p className="text-sm text-gray-600">
                    La vista previa del contenido del template se mostraría aquí.
                    <br />
                    Tipo: {getTemplateTypeBadge(selectedTemplate.type)}
                    <br />
                    Estado: {selectedTemplate.isActive ? 'Activo' : 'Inactivo'}
                    <br />
                    Última modificación: {new Date(selectedTemplate.lastModified).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button 
                  variant="outline"
                  onClick={() => {
                    window.open(`/admin/email-system/templates/${selectedTemplate.id}/edit`, '_blank')
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar Template
                </Button>
                <Button
                  onClick={() => {
                    setShowTemplateModal(false)
                    setSelectedTemplate(null)
                  }}
                >
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}