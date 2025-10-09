"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Package, 
  Grid3x3, 
  Save, 
  Download, 
  Undo, 
  Redo, 
  Type, 
  Image, 
  Shapes, 
  Palette,
  Layers,
  Settings,
  Eye,
  Plus
} from "lucide-react"
import { toast } from "react-hot-toast"
import ZakekeCanvas from "@/components/editor/ZakekeCanvas"
import ToolboxPanel from "@/components/editor/ToolboxPanel"
import LayersPanel from "@/components/editor/LayersPanel"
import PropertiesPanel from "@/components/editor/PropertiesPanel"
import ImageLibrary from "@/components/editor/ImageLibrary"
import ShapesLibrary from "@/components/editor/ShapesLibrary"

interface Product {
  id: string
  name: string
  sides: ProductSide[]
}

interface ProductSide {
  id: string
  name: string
  displayName?: string
  image2D?: string
  printAreas: PrintArea[]
}

interface PrintArea {
  id: string
  name: string
  displayName?: string
  x: number
  y: number
  width: number
  height: number
  printingMethod: string
  allowText: boolean
  allowImages: boolean
  allowShapes: boolean
  allowClipart: boolean
}

export default function EditorVisual() {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedSide, setSelectedSide] = useState<ProductSide | null>(null)
  const [selectedArea, setSelectedArea] = useState<PrintArea | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'tools' | 'layers' | 'properties'>('tools')
  const [showImageLibrary, setShowImageLibrary] = useState(false)
  const [showShapesLibrary, setShowShapesLibrary] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      // Por ahora cargaremos productos con lados configurados
      const response = await fetch('/api/personalization/sides')
      const data = await response.json()
      
      if (data.success) {
        // Agrupar lados por producto
        const productMap = new Map<string, Product>()
        
        data.data.forEach((side: any) => {
          const productId = side.product.id
          if (!productMap.has(productId)) {
            productMap.set(productId, {
              id: productId,
              name: side.product.name,
              sides: []
            })
          }
          productMap.get(productId)!.sides.push(side)
        })
        
        setProducts(Array.from(productMap.values()))
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }

  const handleProductChange = (productId: string) => {
    const product = products.find(p => p.id === productId)
    setSelectedProduct(product || null)
    setSelectedSide(product?.sides[0] || null)
    setSelectedArea(null)
  }

  const handleSideChange = (sideId: string) => {
    const side = selectedProduct?.sides.find(s => s.id === sideId)
    setSelectedSide(side || null)
    setSelectedArea(side?.printAreas[0] || null)
  }

  const handleSaveDesign = async () => {
    if (!selectedArea) {
      toast.error('Selecciona un área de impresión')
      return
    }

    // Aquí implementaremos el guardado
    toast.success('Diseño guardado exitosamente')
  }

  const handleExportDesign = async () => {
    if (!selectedArea) {
      toast.error('Selecciona un área de impresión')
      return
    }

    // Aquí implementaremos la exportación
    toast.success('Diseño exportado exitosamente')
  }

  const handleSelectImage = (image: any) => {
    // Lógica para agregar la imagen al canvas
    console.log('Imagen seleccionada:', image)
    toast.success(`Imagen "${image.name}" agregada al diseño`)
    setShowImageLibrary(false)
  }

  const handleSelectShape = (shape: any) => {
    // Lógica para agregar la forma al canvas
    console.log('Forma seleccionada:', shape)
    toast.success('Forma agregada al diseño')
    setShowShapesLibrary(false)
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-white h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Editor de Personalización</h2>
          <p className="text-sm text-gray-600">Configurar áreas de personalización de productos</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Product Selector */}
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-gray-500" />
            <Select value={selectedProduct?.id || ""} onValueChange={handleProductChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Seleccionar producto" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <button
            onClick={handleExportDesign}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar
          </button>
          <button
            onClick={handleSaveDesign}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Guardar
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-1 mr-4">
          <button
            className="p-2 rounded bg-blue-100 text-blue-700"
            title="Seleccionar (V)"
          >
            <Package className="h-4 w-4" />
          </button>
          <button
            className="p-2 rounded hover:bg-gray-200"
            title="Texto (T)"
          >
            <Type className="h-4 w-4" />
          </button>
          <button
            className="p-2 rounded hover:bg-gray-200"
            title="Imagen (I)"
          >
            <Image className="h-4 w-4" />
          </button>
          <button
            className="p-2 rounded hover:bg-gray-200"
            title="Formas (S)"
          >
            <Shapes className="h-4 w-4" />
          </button>
        </div>

        <div className="w-px h-6 bg-gray-300 mr-4" />

        <div className="flex items-center gap-1">
          <button 
            className="p-2 rounded hover:bg-gray-200" 
            title="Deshacer (Ctrl+Z)"
          >
            <Undo className="h-4 w-4" />
          </button>
          <button 
            className="p-2 rounded hover:bg-gray-200" 
            title="Rehacer (Ctrl+Y)"
          >
            <Redo className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1" />

        {/* Side Selector */}
        {selectedProduct && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Lado:</span>
            <Select value={selectedSide?.id || ""} onValueChange={handleSideChange}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Lado" />
              </SelectTrigger>
              <SelectContent>
                    {selectedProduct.sides.map((side) => (
                      <SelectItem key={side.id} value={side.id}>
                        {side.displayName || side.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Area Info */}
            {selectedArea && (
              <Badge variant="outline" className="ml-2">
                {selectedArea.displayName || selectedArea.name}
              </Badge>
            )}
      </div>

      {/* Canvas Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Elements Library */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configuración
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('tools')}
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 ${
                  activeTab === 'tools' ? 'bg-orange-100 text-orange-700' : 'hover:bg-gray-100'
                }`}
              >
                <Type className="h-4 w-4" />
                Herramientas
              </button>
              <button
                onClick={() => setActiveTab('layers')}
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 ${
                  activeTab === 'layers' ? 'bg-orange-100 text-orange-700' : 'hover:bg-gray-100'
                }`}
              >
                <Layers className="h-4 w-4" />
                Capas
              </button>
              <button
                onClick={() => setActiveTab('properties')}
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 ${
                  activeTab === 'properties' ? 'bg-orange-100 text-orange-700' : 'hover:bg-gray-100'
                }`}
              >
                <Settings className="h-4 w-4" />
                Propiedades
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'tools' && (
              <ToolboxPanel 
                selectedArea={selectedArea}
                onToolSelect={(tool) => console.log('Tool selected:', tool)}
                productId={selectedProduct?.id || ''}
                onOpenImageLibrary={() => setShowImageLibrary(true)}
                onOpenShapesLibrary={() => setShowShapesLibrary(true)}
              />
            )}
            {activeTab === 'layers' && (
              <LayersPanel
                elements={[]}
                onElementSelect={(id) => console.log('Element selected:', id)}
              />
            )}
            {activeTab === 'properties' && (
              <PropertiesPanel
                selectedElement={null}
                onPropertyChange={(property, value) => console.log('Property changed:', property, value)}
              />
            )}
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col bg-gray-100">
          {selectedArea ? (
            <ZakekeCanvas
              area={selectedArea}
              sideImage={selectedSide?.image2D}
              onElementsChange={(elements) => console.log('Elements changed:', elements)}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <Card className="w-96">
                <CardHeader className="text-center">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <CardTitle>Selecciona un Producto</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <p className="text-gray-600">
                    Elige un producto y lado para comenzar a diseñar
                  </p>
                  
                  {products.length === 0 && (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-500">
                        No hay productos configurados para personalización
                      </p>
                      <Button asChild>
                        <a href="/admin/personalizacion/productos">
                          <Plus className="h-4 w-4 mr-2" />
                          Configurar Productos
                        </a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Modales */}
      {selectedProduct && (
        <>
          <ImageLibrary
            isOpen={showImageLibrary}
            onClose={() => setShowImageLibrary(false)}
            onSelectImage={handleSelectImage}
            productId={selectedProduct.id}
            allowUpload={false}
          />
          
          <ShapesLibrary
            isOpen={showShapesLibrary}
            onClose={() => setShowShapesLibrary(false)}
            onSelectShape={handleSelectShape}
          />
        </>
      )}
    </div>
  )
}