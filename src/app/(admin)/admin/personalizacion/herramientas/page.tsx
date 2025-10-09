"use client"

import { useState } from "react"
import { 
  Grid3x3, 
  Palette, 
  Scissors, 
  Shapes, 
  Type, 
  Image, 
  Layout, 
  DollarSign, 
  View, 
  ChevronRight,
  Settings
} from "lucide-react"

export default function HerramientasPage() {
  const [selectedTool, setSelectedTool] = useState<string | null>(null)

  const tools = [
    {
      id: "collage",
      title: "Diseños de collage",
      description: "Deja que tus clientes suban imágenes en una plantilla de collage para personalizar tus productos.",
      icon: Grid3x3,
      enabled: false,
      route: "/admin/personalizacion/herramientas/collage"
    },
    {
      id: "background",
      title: "Edición de fondo del producto",
      description: "Permita que sus clientes usen colores e imágenes para llenar toda el área de impresión de su producto.",
      icon: Palette,
      enabled: false,
      route: "/admin/personalizacion/herramientas/background"
    },
    {
      id: "background-remover",
      title: "Eliminador de fondo + recoloreo de imagen",
      description: "Permita que sus clientes eliminen el fondo de sus imágenes y permítales / forzarlos a convertir imágenes multicolor en imágenes de un solo color.",
      icon: Scissors,
      enabled: false,
      route: "/admin/personalizacion/herramientas/background-remover"
    },
    {
      id: "shapes",
      title: "Formas y máscaras",
      description: "Crea y gestiona una galería de formas que tus clientes pueden utilizar para decorar tus productos o para enmascarar las imágenes.",
      icon: Shapes,
      enabled: true,
      route: "/admin/personalizacion/herramientas/shapes"
    },
    {
      id: "fonts",
      title: "Fuentes",
      description: "Administre las fuentes existentes, cargue sus propias fuentes.",
      icon: Type,
      enabled: true,
      route: "/admin/personalizacion/fuentes"
    },
    {
      id: "clipart",
      title: "Imágenes y galerías Prediseñadas",
      description: "Cree y administre galerías de imágenes, imágenes prediseñadas y obras de arte que sus clientes puedan usar para personalizar sus productos.",
      icon: Image,
      enabled: true,
      route: "/admin/personalizacion/herramientas/imagenes"
    },
    {
      id: "templates",
      title: "Plantillas prediseñadas",
      description: "Una poderosa herramienta para crear plantillas con textos e imágenes editables para tus productos.",
      icon: Layout,
      enabled: true,
      route: "/admin/personalizacion/templates"
    },
    {
      id: "pricing",
      title: "Reglas de precios",
      description: "Le permite crear reglas para agregar un precio de margen de beneficio a sus productos personalizables.",
      icon: DollarSign,
      enabled: true,
      route: "/admin/personalizacion/herramientas/reglas-precios"
    },
    {
      id: "3d-ar",
      title: "Vista previa 3D y AR",
      description: "Activate a 3D view for your products to enhance your customers' experience. You can also enable Augmented Reality and Virtual Try-On from here.",
      icon: View,
      enabled: false,
      route: "/admin/personalizacion/herramientas/3d-ar"
    }
  ]

  const handleToolClick = (tool: any) => {
    if (tool.enabled) {
      window.location.href = tool.route
    } else {
      setSelectedTool(tool.id)
    }
  }

  return (
    <div className="p-6 space-y-6 pb-32">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Herramientas de Personalización</h1>
          <p className="text-gray-600 mt-1">
            Gestiona las herramientas disponibles para la personalización de productos
          </p>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => {
          const IconComponent = tool.icon
          return (
            <div
              key={tool.id}
              className={`relative bg-white rounded-xl border-2 p-6 transition-all duration-200 cursor-pointer ${
                tool.enabled
                  ? "border-orange-200 hover:border-orange-300 hover:shadow-lg"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => handleToolClick(tool)}
            >
              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                {tool.enabled ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Disponible
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Próximamente
                  </span>
                )}
              </div>

              {/* Icon */}
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                tool.enabled 
                  ? "bg-orange-100 text-orange-600" 
                  : "bg-gray-100 text-gray-400"
              }`}>
                <IconComponent className="h-6 w-6" />
              </div>

              {/* Content */}
              <div className="space-y-3">
                <h3 className={`text-lg font-semibold ${
                  tool.enabled ? "text-gray-900" : "text-gray-500"
                }`}>
                  {tool.title}
                </h3>
                
                <p className={`text-sm leading-relaxed ${
                  tool.enabled ? "text-gray-600" : "text-gray-400"
                }`}>
                  {tool.description}
                </p>

                {/* Action Button */}
                <div className="pt-2">
                  <button
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      tool.enabled
                        ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                        : "bg-gray-100 text-gray-500 cursor-not-allowed"
                    }`}
                    disabled={!tool.enabled}
                  >
                    <Settings className="h-4 w-4" />
                    Gestionar
                    {tool.enabled && <ChevronRight className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Disabled Overlay */}
              {!tool.enabled && (
                <div className="absolute inset-0 bg-gray-50/50 rounded-xl pointer-events-none" />
              )}
            </div>
          )
        })}
      </div>

      {/* Coming Soon Modal */}
      {selectedTool && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl text-center max-w-md mx-4">
            <div className="mb-4">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="h-8 w-8 text-yellow-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Próximamente</h2>
              <p className="text-gray-600">
                Esta herramienta estará disponible en futuras actualizaciones. 
                Estamos trabajando para ofrecerte las mejores funcionalidades.
              </p>
            </div>
            <button 
              onClick={() => setSelectedTool(null)} 
              className="w-full bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  )
}