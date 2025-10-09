"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { 
  Plus, Save, Eye, Smartphone, Monitor, Tablet,
  Image as ImageIcon, Grid3X3, Package, Star, 
  MessageSquare, Trophy, Type, Video, MapPin,
  Move, Edit2, Trash2, Copy, Settings, Globe
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ColoredSwitch } from "@/components/ui/ColoredSwitch"
import { toast } from "react-hot-toast"

// Definición de tipos de módulos disponibles
export interface ModuleType {
  id: string
  name: string
  icon: React.ElementType
  category: 'content' | 'marketing' | 'info'
  description: string
  defaultProps: Record<string, any>
}

// Definición de un módulo instanciado en la página
export interface PageModule {
  id: string
  type: string
  order: number
  props: Record<string, any>
  isVisible: boolean
  isCollapsed?: boolean
}

// Definición de configuración de página
export interface PageConfig {
  id: string
  modules: PageModule[]
  theme: {
    primaryColor: string
    secondaryColor: string
    fontFamily: string
  }
  seo: {
    title: string
    description: string
    keywords: string
  }
}

interface PageBuilderProps {
  pageConfig?: PageConfig
  onSave?: (config: PageConfig) => void
  onPublish?: (config: PageConfig) => void
  previewMode?: boolean
  isSaving?: boolean
  setIsSaving?: (loading: boolean) => void
}

// Módulos disponibles
const availableModules: ModuleType[] = [
  // Módulos de Contenido
  {
    id: 'hero-banner',
    name: 'Banner Hero',
    icon: ImageIcon,
    category: 'content',
    description: 'Banner principal con imagen de fondo, título y botones',
    defaultProps: {
      backgroundImage: '',
      title: 'Bienvenido a nuestra tienda',
      subtitle: 'Descubre productos únicos y personalizados',
      buttonText: 'Ver productos',
      buttonLink: '/productos',
      height: 'large',
      textAlign: 'center',
      overlay: 0.3
    }
  },
  {
    id: 'featured-categories',
    name: 'Categorías Destacadas',
    icon: Grid3X3,
    category: 'content',
    description: 'Grid de categorías principales con imágenes',
    defaultProps: {
      title: 'Nuestras Categorías',
      subtitle: 'Explora nuestra amplia gama de productos',
      categories: [],
      columns: 3,
      showDescription: true,
      style: 'cards'
    }
  },
  {
    id: 'featured-products',
    name: 'Productos Destacados',
    icon: Package,
    category: 'content',
    description: 'Carrusel o grid de productos seleccionados',
    defaultProps: {
      title: 'Productos Destacados',
      subtitle: 'Los mejores productos seleccionados para ti',
      productIds: [],
      layout: 'carousel',
      itemsPerRow: 4,
      showPrice: true,
      showAddToCart: true
    }
  },
  {
    id: 'top-sellers',
    name: 'Top Ventas',
    icon: Star,
    category: 'content',
    description: 'Productos más vendidos automáticamente',
    defaultProps: {
      title: 'Los Más Vendidos',
      subtitle: 'Productos favoritos de nuestros clientes',
      limit: 8,
      layout: 'grid',
      period: '30days',
      showSales: true
    }
  },
  // Módulos de Marketing
  {
    id: 'testimonials',
    name: 'Testimonios',
    icon: MessageSquare,
    category: 'marketing',
    description: 'Reseñas y testimonios de clientes',
    defaultProps: {
      title: 'Lo que dicen nuestros clientes',
      subtitle: 'Testimonios reales de clientes satisfechos',
      testimonials: [],
      layout: 'carousel',
      showStars: true,
      autoplay: true
    }
  },
  {
    id: 'why-choose-us',
    name: '¿Por qué Elegir?',
    icon: Trophy,
    category: 'marketing',
    description: 'Beneficios y ventajas competitivas',
    defaultProps: {
      title: '¿Por qué elegirnos?',
      subtitle: 'Las razones por las que somos tu mejor opción',
      benefits: [
        { icon: 'truck', title: 'Envío Gratis', description: 'En pedidos superiores a 50€' },
        { icon: 'shield', title: 'Garantía Total', description: '30 días de garantía' },
        { icon: 'heart', title: 'Hecho con Amor', description: 'Productos artesanales' }
      ],
      layout: 'grid',
      columns: 3
    }
  },
  {
    id: 'rich-text',
    name: 'Texto Enriquecido',
    icon: Type,
    category: 'info',
    description: 'Contenido HTML personalizable',
    defaultProps: {
      content: '<h2>Título de ejemplo</h2><p>Contenido de ejemplo que puedes personalizar.</p>',
      textAlign: 'left',
      backgroundColor: 'transparent',
      padding: 'medium'
    }
  },
  {
    id: 'video-section',
    name: 'Video Promocional',
    icon: Video,
    category: 'marketing',
    description: 'Video embebido con descripción',
    defaultProps: {
      title: 'Conoce más sobre nosotros',
      videoUrl: '',
      videoType: 'youtube',
      thumbnail: '',
      autoplay: false,
      controls: true
    }
  },
  {
    id: 'contact-info',
    name: 'Información de Contacto',
    icon: MapPin,
    category: 'info',
    description: 'Datos de contacto y ubicación',
    defaultProps: {
      title: 'Contacta con nosotros',
      address: '',
      phone: '',
      email: '',
      hours: '',
      showMap: true,
      mapLocation: ''
    }
  }
]

export default function PageBuilder({ 
  pageConfig, 
  onSave,
  onPublish,
  previewMode = false,
  isSaving = false,
  setIsSaving
}: PageBuilderProps) {
  const [config, setConfig] = useState<PageConfig>(pageConfig || {
    id: 'homepage',
    modules: [],
    theme: {
      primaryColor: '#f97316',
      secondaryColor: '#1f2937',
      fontFamily: 'Inter'
    },
    seo: {
      title: 'Inicio - Mi Tienda',
      description: 'Bienvenido a nuestra tienda online',
      keywords: 'tienda, productos, online'
    }
  })

  const [draggedModule, setDraggedModule] = useState<string | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [devicePreview, setDevicePreview] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [selectedModule, setSelectedModule] = useState<string | null>(null)
  const [showModuleLibrary, setShowModuleLibrary] = useState(false)

  // Sincronizar el estado interno cuando pageConfig cambia
  useEffect(() => {
    if (pageConfig) {
      console.log('🔄 PageBuilder: Updating internal config with new pageConfig:', pageConfig)
      setConfig(pageConfig)
    }
  }, [pageConfig])

  // Añadir módulo nuevo
  const addModule = (moduleType: ModuleType) => {
    console.log('🔥 Adding module:', moduleType.name)
    console.log('🔥 Current config.modules length:', config.modules.length)
    
    const newModule: PageModule = {
      id: `module_${Date.now()}`,
      type: moduleType.id,
      order: config.modules.length,
      props: { ...moduleType.defaultProps },
      isVisible: true
    }

    console.log('🔥 New module created:', newModule)

    const newConfig = {
      ...config,
      modules: [...config.modules, newModule]
    }

    console.log('🔥 New config:', newConfig)
    setConfig(newConfig)

    setShowModuleLibrary(false)
    toast.success(`Módulo ${moduleType.name} agregado`)
  }

  // Reordenar módulos
  const reorderModules = useCallback((startIndex: number, endIndex: number) => {
    const newModules = [...config.modules]
    const [removed] = newModules.splice(startIndex, 1)
    newModules.splice(endIndex, 0, removed)

    // Actualizar order
    const updatedModules = newModules.map((module, index) => ({
      ...module,
      order: index
    }))

    setConfig({
      ...config,
      modules: updatedModules
    })
  }, [config])

  // Eliminar módulo
  const removeModule = (moduleId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este módulo?')) {
      setConfig({
        ...config,
        modules: config.modules.filter(m => m.id !== moduleId)
      })
      
      // Si el módulo eliminado está seleccionado, deseleccionarlo
      if (selectedModule === moduleId) {
        setSelectedModule(null)
      }
      
      toast.success('Módulo eliminado')
    }
  }

  // Duplicar módulo
  const duplicateModule = (moduleId: string) => {
    const originalModule = config.modules.find(m => m.id === moduleId)
    if (!originalModule) return

    const newModule: PageModule = {
      ...originalModule,
      id: `module_${Date.now()}`,
      order: config.modules.length
    }

    setConfig({
      ...config,
      modules: [...config.modules, newModule]
    })

    toast.success('Módulo duplicado')
  }

  // Actualizar propiedades de módulo
  const updateModuleProps = (moduleId: string, newProps: Record<string, any>) => {
    setConfig({
      ...config,
      modules: config.modules.map(module =>
        module.id === moduleId
          ? { ...module, props: { ...module.props, ...newProps } }
          : module
      )
    })
  }

  // Toggle visibilidad de módulo
  const toggleModuleVisibility = (moduleId: string) => {
    setConfig({
      ...config,
      modules: config.modules.map(module =>
        module.id === moduleId
          ? { ...module, isVisible: !module.isVisible }
          : module
      )
    })
  }

  // Drag and Drop functions
  const handleDragStart = (e: React.DragEvent, moduleId: string) => {
    setDraggedModule(moduleId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    
    if (!draggedModule) return
    
    const draggedIndex = config.modules.findIndex(m => m.id === draggedModule)
    if (draggedIndex === -1) return

    const newModules = [...config.modules]
    const [draggedItem] = newModules.splice(draggedIndex, 1)
    newModules.splice(dropIndex, 0, draggedItem)

    // Actualizar order
    const updatedModules = newModules.map((module, index) => ({
      ...module,
      order: index
    }))

    setConfig({
      ...config,
      modules: updatedModules
    })

    setDraggedModule(null)
    setDragOverIndex(null)
    toast.success('Módulo reordenado')
  }

  // Guardar configuración
  const handleSave = async () => {
    console.log('🏗️ PageBuilder handleSave called')
    console.log('🏗️ PageBuilder config at save:', config)
    console.log('🏗️ PageBuilder config.modules length:', config.modules.length)
    
    if (setIsSaving) {
      setIsSaving(true)
    }
    
    try {
      if (onSave) {
        console.log('🏗️ Calling parent onSave with config:', config)
        await onSave(config)
      }
    } finally {
      if (setIsSaving) {
        setIsSaving(false)
      }
    }
  }

  // Publicar configuración
  const handlePublish = async () => {
    console.log('🏗️ PageBuilder handlePublish called')
    console.log('🏗️ PageBuilder config at publish:', config)
    console.log('🏗️ PageBuilder config.modules length at publish:', config.modules.length)
    
    if (setIsSaving) {
      setIsSaving(true)
    }
    
    try {
      if (onPublish) {
        console.log('🏗️ Calling parent onPublish with config:', config)
        await onPublish(config)
      }
    } finally {
      if (setIsSaving) {
        setIsSaving(false)
      }
    }
  }

  const getModuleType = (typeId: string) => {
    return availableModules.find(m => m.id === typeId)
  }

  return (
    <div className="h-screen flex">
      {/* Panel Izquierdo - Herramientas */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header del panel */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">🏗️ Page Builder</h2>
          <p className="text-sm text-gray-600">Arrastra módulos para construir tu página</p>
        </div>

        {/* Controles */}
        <div className="p-4 border-b border-gray-200 space-y-3">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={devicePreview === 'desktop' ? 'default' : 'outline'}
              onClick={() => setDevicePreview('desktop')}
            >
              <Monitor className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={devicePreview === 'tablet' ? 'default' : 'outline'}
              onClick={() => setDevicePreview('tablet')}
            >
              <Tablet className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={devicePreview === 'mobile' ? 'default' : 'outline'}
              onClick={() => setDevicePreview('mobile')}
            >
              <Smartphone className="h-4 w-4" />
            </Button>
          </div>

          <Button
            onClick={() => {
              console.log('🖱️ Agregar Módulo clicked, current showModuleLibrary:', showModuleLibrary)
              setShowModuleLibrary(!showModuleLibrary)
            }}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Módulo
          </Button>
        </div>

        {/* Librería de módulos */}
        {showModuleLibrary && (
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="font-medium mb-3">Módulos Disponibles</h3>
            
            {['content', 'marketing', 'info'].map(category => (
              <div key={category} className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2 capitalize">
                  {category === 'content' && '📝 Contenido'}
                  {category === 'marketing' && '📢 Marketing'}
                  {category === 'info' && 'ℹ️ Información'}
                </h4>
                <div className="space-y-2">
                  {availableModules
                    .filter(module => module.category === category)
                    .map(module => (
                      <div
                        key={module.id}
                        className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                        onClick={() => {
                          console.log('🖱️ Module clicked:', module.name)
                          addModule(module)
                        }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <module.icon className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-sm">{module.name}</span>
                        </div>
                        <p className="text-xs text-gray-600">{module.description}</p>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lista de módulos actuales */}
        {!showModuleLibrary && (
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="font-medium mb-3">Módulos en la Página ({config.modules.length})</h3>
            
            {config.modules.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No hay módulos</p>
                <p className="text-xs">Agrega módulos para empezar</p>
              </div>
            ) : (
              <div className="space-y-2">
                {config.modules
                  .sort((a, b) => a.order - b.order)
                  .map((module, index) => {
                    const moduleType = getModuleType(module.type)
                    if (!moduleType) return null

                    return (
                      <div
                        key={module.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, module.id)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, index)}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          selectedModule === module.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        } ${!module.isVisible ? 'opacity-50' : ''} ${
                          draggedModule === module.id ? 'opacity-50 transform rotate-1' : ''
                        } ${
                          dragOverIndex === index ? 'border-green-500 bg-green-50' : ''
                        }`}
                        onClick={() => setSelectedModule(module.id)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <Move className="h-3 w-3 text-gray-400 cursor-grab hover:text-gray-600" 
                                    title="Arrastra para reordenar" />
                              <span className="text-xs bg-gray-100 px-1 rounded">{index + 1}</span>
                            </div>
                            <moduleType.icon className="h-4 w-4 text-blue-600" />
                            <span className="font-medium text-sm">{moduleType.name}</span>
                          </div>
                          <div className="flex gap-1">
                            <ColoredSwitch
                              checked={module.isVisible}
                              onCheckedChange={() => toggleModuleVisibility(module.id)}
                              activeColor="green"
                              inactiveColor="gray"
                            />
                          </div>
                        </div>
                        
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              duplicateModule(module.id)
                            }}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeModule(module.id)
                            }}
                            className="h-6 w-6 p-0 text-red-600"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </div>
        )}

        {/* Acciones */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="w-full bg-orange-600 hover:bg-orange-700"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Guardar Página
              </>
            )}
          </Button>
          
          <Button 
            onClick={handlePublish}
            disabled={isSaving}
            variant="outline" 
            className="w-full"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                Publicando...
              </>
            ) : (
              <>
                <Globe className="h-4 w-4 mr-2" />
                Publicar
              </>
            )}
          </Button>
          
          <Button variant="outline" className="w-full">
            <Eye className="h-4 w-4 mr-2" />
            Vista Previa
          </Button>
        </div>
      </div>

      {/* Panel Central - Preview */}
      <div className="flex-1 bg-gray-100 overflow-auto">
        <div className="p-4">
          {/* Dispositivo preview container */}
          <div
            className={`mx-auto bg-white shadow-lg transition-all duration-300 ${
              devicePreview === 'desktop' ? 'max-w-full' :
              devicePreview === 'tablet' ? 'max-w-2xl' :
              'max-w-sm'
            }`}
          >
            {/* Preview content */}
            <div className="min-h-screen">
              {config.modules.length === 0 ? (
                <div className="flex items-center justify-center h-96 text-gray-500">
                  <div className="text-center">
                    <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">Página vacía</h3>
                    <p className="text-sm">Agrega módulos para ver el contenido aquí</p>
                  </div>
                </div>
              ) : (
                config.modules
                  .filter(module => module.isVisible)
                  .sort((a, b) => a.order - b.order)
                  .map((module) => {
                    const moduleType = getModuleType(module.type)
                    if (!moduleType) return null

                    return (
                      <div
                        key={module.id}
                        className={`relative group ${
                          selectedModule === module.id ? 'ring-2 ring-blue-500' : ''
                        }`}
                        onClick={() => setSelectedModule(module.id)}
                      >
                        {/* Module content placeholder */}
                        <ModulePreview
                          module={module}
                          moduleType={moduleType}
                          devicePreview={devicePreview}
                        />
                        
                        {/* Module overlay controls */}
                        {selectedModule === module.id && (
                          <div className="absolute top-2 right-2 bg-white shadow-lg rounded-lg p-2 flex gap-1">
                            <Button size="sm" variant="outline" className="h-6 w-6 p-0">
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-6 w-6 p-0">
                              <Settings className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    )
                  })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Panel Derecho - Propiedades */}
      {selectedModule && (() => {
        const module = config.modules.find(m => m.id === selectedModule)
        const moduleType = module ? getModuleType(module.type) : null
        
        if (!module || !moduleType) {
          return null
        }
        
        return (
          <div className="w-80 bg-white border-l border-gray-200 p-4">
            <ModuleProperties
              module={module}
              moduleType={moduleType}
              onUpdate={(newProps) => updateModuleProps(selectedModule, newProps)}
            />
          </div>
        )
      })()}
    </div>
  )
}

// Componente para mostrar preview de módulos
function ModulePreview({
  module,
  moduleType,
  devicePreview
}: {
  module: PageModule
  moduleType: ModuleType
  devicePreview: string
}) {
  const baseClasses = "min-h-[200px] border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center"
  
  return (
    <div className={baseClasses}>
      <div className="text-center">
        <moduleType.icon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
        <h3 className="font-medium text-gray-700">{moduleType.name}</h3>
        <p className="text-sm text-gray-500 mt-1">{moduleType.description}</p>
        
        {/* Mostrar algunas props importantes */}
        <div className="mt-3 space-y-1">
          {module.props.title && (
            <p className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
              Título: {module.props.title}
            </p>
          )}
          {module.props.subtitle && (
            <p className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
              Subtítulo: {module.props.subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// Componente para editar propiedades de módulos
function ModuleProperties({
  module,
  moduleType,
  onUpdate
}: {
  module: PageModule
  moduleType: ModuleType
  onUpdate: (newProps: Record<string, any>) => void
}) {
  // Importar los editores dinámicamente
  const renderEditor = () => {
    switch (moduleType.id) {
      case 'hero-banner':
        const HeroBannerEditor = require('./modules/HeroBannerEditor').default
        return (
          <HeroBannerEditor
            props={module.props}
            onUpdate={onUpdate}
          />
        )
      
      case 'featured-categories':
        const FeaturedCategoriesEditor = require('./modules/FeaturedCategoriesEditor').default
        return (
          <FeaturedCategoriesEditor
            props={module.props}
            onUpdate={onUpdate}
          />
        )
      
      case 'featured-products':
        const FeaturedProductsEditor = require('./modules/FeaturedProductsEditor').default
        return (
          <FeaturedProductsEditor
            props={module.props}
            onUpdate={onUpdate}
          />
        )
      
      case 'testimonials':
        const TestimonialsEditor = require('./modules/TestimonialsEditor').default
        return (
          <TestimonialsEditor
            props={module.props}
            onUpdate={onUpdate}
          />
        )
      
      case 'rich-text':
        const RichTextEditor = require('./modules/RichTextEditor').default
        return (
          <RichTextEditor
            props={module.props}
            onUpdate={onUpdate}
          />
        )
      
      case 'top-sellers':
      case 'why-choose-us':
      case 'video-section':
      case 'contact-info':
        // Estos módulos utilizan editores simplificados por ahora
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-700">
                ✨ Editor específico para <strong>{moduleType.name}</strong> disponible próximamente.
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Por ahora puedes usar la configuración básica desde las propiedades JSON de abajo.
              </p>
            </div>
            
            <div className="space-y-2 text-xs">
              <p className="font-medium">Propiedades actuales:</p>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(module.props, null, 2)}
              </pre>
            </div>
          </div>
        )
      
      default:
        return (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-700">
                🚧 Editor específico para {moduleType.name} en desarrollo.
              </p>
            </div>
            
            <div className="space-y-2 text-xs">
              <p className="font-medium">Propiedades actuales:</p>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(module.props, null, 2)}
              </pre>
            </div>
          </div>
        )
    }
  }

  return (
    <div>
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <moduleType.icon className="h-5 w-5" />
        {moduleType.name}
      </h3>
      
      <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
        {renderEditor()}
      </div>
    </div>
  )
}