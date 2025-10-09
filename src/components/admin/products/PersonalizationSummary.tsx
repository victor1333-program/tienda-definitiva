"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  Settings, 
  Palette, 
  Image, 
  Shapes, 
  Type, 
  DollarSign,
  Eye,
  ExternalLink,
  AlertTriangle,
  Info
} from "lucide-react"
import Link from "next/link"
import { toast } from "react-hot-toast"

interface PersonalizationSummaryProps {
  productId: string
  productName: string
}

interface ConfigurationSummary {
  isPersonalizable: boolean
  hasActiveAreas: boolean
  hasActiveSides: boolean
  hasPricingRules: boolean
  hasTemplates: boolean
  hasShapes: boolean
  hasImages: boolean
  hasFonts: boolean
  areas: any[]
  sides: any[]
  pricingRules: any[]
  templates: any[]
  shapes: any[]
  images: any[]
  fonts: any[]
}

export default function PersonalizationSummary({ productId, productName }: PersonalizationSummaryProps) {
  const [summary, setSummary] = useState<ConfigurationSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPersonalizationSummary()
  }, [productId])

  const fetchPersonalizationSummary = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/products/${productId}/personalization-summary`)
      
      if (!response.ok) {
        throw new Error('Error al cargar el resumen de personalización')
      }
      
      const data = await response.json()
      setSummary(data)
    } catch (error) {
      console.error('Error fetching personalization summary:', error)
      setError(error instanceof Error ? error.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const togglePersonalizable = async () => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          isPersonalizable: !summary?.isPersonalizable 
        })
      })

      if (response.ok) {
        toast.success(
          summary?.isPersonalizable 
            ? 'Personalización desactivada' 
            : 'Personalización activada'
        )
        fetchPersonalizationSummary()
      } else {
        toast.error('Error al actualizar configuración')
      }
    } catch (error) {
      toast.error('Error al actualizar configuración')
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">Error al cargar configuración</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <Button onClick={fetchPersonalizationSummary} variant="outline">
            Intentar de nuevo
          </Button>
        </CardContent>
      </Card>
    )
  }

  const configItems = [
    {
      id: 'personalizable',
      title: 'Personalización de Producto',
      description: 'Permite que el producto sea personalizable por los clientes',
      status: summary?.isPersonalizable,
      count: null,
      icon: Palette,
      configUrl: `/admin/products/${productId}/edit`,
      actionText: 'Configurar en General',
      isToggleable: true
    },
    {
      id: 'sides',
      title: 'Lados del Producto',
      description: 'Lados configurados para personalización',
      status: summary?.hasActiveSides,
      count: summary?.sides?.length || 0,
      icon: Eye,
      configUrl: `/admin/personalizacion/productos`,
      actionText: 'Gestionar Lados'
    },
    {
      id: 'areas',
      title: 'Áreas de Personalización',
      description: 'Áreas específicas donde los clientes pueden personalizar',
      status: summary?.hasActiveAreas,
      count: summary?.areas?.length || 0,
      icon: Settings,
      configUrl: `/admin/personalizacion/productos`,
      actionText: 'Gestionar Áreas'
    },
    {
      id: 'pricing',
      title: 'Reglas de Precios',
      description: 'Reglas de precios para personalización configuradas',
      status: summary?.hasPricingRules,
      count: summary?.pricingRules?.length || 0,
      icon: DollarSign,
      configUrl: '/admin/personalizacion/herramientas/reglas-precios',
      actionText: 'Gestionar Precios'
    },
    {
      id: 'templates',
      title: 'Plantillas Prediseñadas',
      description: 'Plantillas asignadas a este producto',
      status: summary?.hasTemplates,
      count: summary?.templates?.length || 0,
      icon: Settings,
      configUrl: '/admin/personalizacion/templates',
      actionText: 'Gestionar Plantillas'
    },
    {
      id: 'shapes',
      title: 'Formas y Máscaras',
      description: 'Formas disponibles para este producto',
      status: summary?.hasShapes,
      count: summary?.shapes?.length || 0,
      icon: Shapes,
      configUrl: '/admin/personalizacion/herramientas/shapes',
      actionText: 'Gestionar Formas'
    },
    {
      id: 'images',
      title: 'Galerías de Imágenes',
      description: 'Imágenes prediseñadas disponibles para este producto',
      status: summary?.hasImages,
      count: summary?.images?.length || 0,
      icon: Image,
      configUrl: '/admin/personalizacion/herramientas/imagenes',
      actionText: 'Gestionar Imágenes'
    },
    {
      id: 'fonts',
      title: 'Fuentes Personalizadas',
      description: 'Fuentes disponibles para personalización de texto',
      status: summary?.hasFonts,
      count: summary?.fonts?.length || 0,
      icon: Type,
      configUrl: '/admin/personalizacion/fuentes',
      actionText: 'Gestionar Fuentes'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🎨 Resumen de Personalización</h2>
          <p className="text-gray-600 mt-1">
            Estado actual de la configuración de personalización para "{productName}"
          </p>
        </div>
        <Badge 
          variant={summary?.isPersonalizable ? "default" : "secondary"}
          className="text-sm px-3 py-1"
        >
          {summary?.isPersonalizable ? "✅ Personalizable" : "❌ No Personalizable"}
        </Badge>
      </div>

      {/* Status Overview */}
      <Card className={`border-2 ${summary?.isPersonalizable ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                summary?.isPersonalizable ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
              }`}>
                <Palette className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Estado de Personalización
                </h3>
                <p className={`text-sm ${summary?.isPersonalizable ? 'text-green-700' : 'text-gray-600'}`}>
                  {summary?.isPersonalizable 
                    ? "Este producto está configurado para ser personalizable por los clientes" 
                    : "Este producto no está habilitado para personalización"
                  }
                </p>
              </div>
            </div>
            <Button 
              onClick={togglePersonalizable}
              variant={summary?.isPersonalizable ? "destructive" : "default"}
              className="ml-4"
            >
              {summary?.isPersonalizable ? "Desactivar" : "Activar"} Personalización
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {configItems.map((item) => {
          const IconComponent = item.icon
          return (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      item.status ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.status ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={item.status ? "default" : "secondary"}>
                      {item.status ? "Configurado" : "No configurado"}
                    </Badge>
                    {item.count !== null && (
                      <Badge variant="outline">
                        {item.count} elemento{item.count !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                  
                  <Button variant="outline" size="sm" asChild>
                    <Link href={item.configUrl} className="flex items-center gap-1">
                      {item.actionText}
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Acciones Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" asChild className="h-auto p-4">
              <Link href="/admin/personalizacion/productos" className="flex flex-col items-center gap-2">
                <Eye className="w-6 h-6" />
                <span className="font-medium">Configurar Lados y Áreas</span>
                <span className="text-xs text-gray-500">Gestionar áreas de personalización</span>
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="h-auto p-4">
              <Link href="/admin/personalizacion/herramientas" className="flex flex-col items-center gap-2">
                <Palette className="w-6 h-6" />
                <span className="font-medium">Herramientas de Personalización</span>
                <span className="text-xs text-gray-500">Gestionar formas, imágenes y precios</span>
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="h-auto p-4">
              <Link href="/admin/personalizacion/templates" className="flex flex-col items-center gap-2">
                <Settings className="w-6 h-6" />
                <span className="font-medium">Plantillas Prediseñadas</span>
                <span className="text-xs text-gray-500">Crear y gestionar plantillas</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-1" />
            <div>
              <h4 className="font-medium text-blue-900 mb-2">ℹ️ Información sobre Personalización</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Para que un producto sea personalizable, debe estar marcado como "Personalizable" en la configuración general</li>
                <li>• Los lados y áreas de personalización se configuran en la sección de Personalización → Productos</li>
                <li>• Las herramientas (formas, imágenes, fuentes) se configuran globalmente y se pueden asignar a productos específicos</li>
                <li>• Las reglas de precios permiten agregar costos adicionales por personalización</li>
                <li>• Las plantillas prediseñadas ofrecen diseños base que los clientes pueden modificar</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}