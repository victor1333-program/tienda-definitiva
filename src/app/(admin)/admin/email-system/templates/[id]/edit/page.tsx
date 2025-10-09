"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ColoredSwitch } from "@/components/ui/ColoredSwitch"
import { toast } from "react-hot-toast"
import { 
  Save, 
  ArrowLeft, 
  Eye, 
  FileText, 
  Code,
  AlertCircle,
  CheckCircle
} from "lucide-react"
import { sanitizeHTML } from "@/lib/html-sanitizer"

interface EmailTemplate {
  id: string
  type: string
  name: string
  description: string
  subject: string
  isActive: boolean
  variables: string[]
  lastModified: string
  htmlContent?: string
  textContent?: string
}

export default function EditEmailTemplatePage() {
  const params = useParams()
  const router = useRouter()
  const templateId = params.id as string
  
  const [template, setTemplate] = useState<EmailTemplate | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    loadTemplate()
  }, [templateId])

  const loadTemplate = async () => {
    try {
      const response = await fetch(`/api/admin/email/templates/${templateId}`)
      if (response.ok) {
        const data = await response.json()
        setTemplate(data.template)
      } else {
        toast.error('Template no encontrado')
        router.push('/admin/email-system')
      }
    } catch (error) {
      console.error('Error loading template:', error)
      toast.error('Error al cargar el template')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!template) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/admin/email/templates/${templateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template)
      })

      if (response.ok) {
        toast.success('Template actualizado correctamente')
        setHasChanges(false)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al actualizar el template')
      }
    } catch (error) {
      console.error('Error saving template:', error)
      toast.error('Error al guardar el template')
    } finally {
      setIsSaving(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    if (!template) return
    
    setTemplate({
      ...template,
      [field]: value
    })
    setHasChanges(true)
  }

  const getVariableBadges = () => {
    if (!template?.variables) return []
    
    return template.variables.map(variable => (
      <Badge key={variable} variant="outline" className="text-xs cursor-pointer" 
        onClick={() => {
          // Copy variable to clipboard
          navigator.clipboard.writeText(`{{${variable}}}`)
          toast.success(`Variable {{${variable}}} copiada`)
        }}
      >
        {`{{${variable}}}`}
      </Badge>
    ))
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      </div>
    )
  }

  if (!template) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Template no encontrado</h3>
            <p className="text-gray-600 mb-6">El template que buscas no existe o ha sido eliminado.</p>
            <Button onClick={() => router.push('/admin/email-system')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Sistema de Email
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.push('/admin/email-system')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Editar Template de Email</h1>
              <p className="text-gray-600">{template.name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className="w-4 h-4 mr-2" />
              {showPreview ? 'Editar' : 'Vista Previa'}
            </Button>
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
                  Guardar Cambios
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuración del Template */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Configuración
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre del Template</Label>
                <Input
                  id="name"
                  value={template.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Nombre descriptivo"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Descripción</Label>
                <textarea
                  id="description"
                  value={template.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Descripción del template"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <div>
                <Label htmlFor="subject">Asunto del Email</Label>
                <Input
                  id="subject"
                  value={template.subject}
                  onChange={(e) => handleChange('subject', e.target.value)}
                  placeholder="Asunto del email"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Estado</Label>
                  <p className="text-sm text-gray-600">Template activo para envío</p>
                </div>
                <ColoredSwitch
                  checked={template.isActive}
                  onCheckedChange={(checked) => handleChange('isActive', checked)}
                  activeColor="green"
                  inactiveColor="gray"
                />
              </div>
            </CardContent>
          </Card>

          {/* Variables Disponibles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                Variables Disponibles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                Haz clic en una variable para copiarla al portapapeles
              </p>
              <div className="flex flex-wrap gap-2">
                {getVariableBadges()}
              </div>
              {template.variables.length === 0 && (
                <p className="text-sm text-gray-500 italic">No hay variables definidas</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Editor de Contenido */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {showPreview ? 'Vista Previa' : 'Contenido del Template'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {showPreview ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded border">
                    <h4 className="font-medium mb-2">Asunto:</h4>
                    <p className="text-sm">{template.subject}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded border min-h-[400px]">
                    <h4 className="font-medium mb-2">Contenido HTML:</h4>
                    <div 
                      className="prose max-w-none text-sm"
                      dangerouslySetInnerHTML={{ 
                        __html: sanitizeHTML(template.htmlContent || '<p>No hay contenido HTML definido</p>') 
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="htmlContent">Contenido HTML</Label>
                    <textarea
                      id="htmlContent"
                      value={template.htmlContent || ''}
                      onChange={(e) => handleChange('htmlContent', e.target.value)}
                      placeholder="Contenido HTML del email..."
                      rows={20}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono text-sm"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="textContent">Contenido de Texto (opcional)</Label>
                    <textarea
                      id="textContent"
                      value={template.textContent || ''}
                      onChange={(e) => handleChange('textContent', e.target.value)}
                      placeholder="Versión en texto plano del email..."
                      rows={10}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono text-sm"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}