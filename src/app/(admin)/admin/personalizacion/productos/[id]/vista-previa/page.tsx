"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Settings, Printer, Palette, Eye, Play, Save } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { toast } from "react-hot-toast"

interface Product {
  id: string
  name: string
  images?: string
  categories?: Array<{
    category: {
      id: string
      name: string
    }
  }>
}

interface ProductSide {
  id: string
  name: string
  image2D?: string
  printAreas?: PrintArea[]
}

interface PrintArea {
  id: string
  name: string
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

interface PrintingMethod {
  id: string
  name: string
  isActive: boolean
  applicableProducts?: string[]
}

export default function VistaPrevia() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string
  
  const [product, setProduct] = useState<Product | null>(null)
  const [sides, setSides] = useState<ProductSide[]>([])
  const [printingMethods, setPrintingMethods] = useState<PrintingMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPrintingMethod, setSelectedPrintingMethod] = useState<string>('')
  const [showPrintingMethodConfig, setShowPrintingMethodConfig] = useState(false)

  useEffect(() => {
    if (productId) {
      fetchProduct()
      fetchProductSides()
      fetchPrintingMethods()
    }
  }, [productId])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${productId}`)
      const data = await response.json()
      
      if (response.ok) {
        setProduct(data.product || data)
      } else {
        toast.error('Error al cargar el producto')
        router.push('/admin/personalizacion/productos')
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      toast.error('Error al cargar el producto')
    }
  }

  const fetchProductSides = async () => {
    try {
      const response = await fetch(`/api/personalization/sides?productId=${productId}`)
      const data = await response.json()
      
      if (response.ok) {
        setSides(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching sides:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPrintingMethods = async () => {
    try {
      const response = await fetch('/api/printing-methods')
      const data = await response.json()
      
      if (response.ok && Array.isArray(data)) {
        // Filtrar métodos activos y aplicables al producto
        const applicableMethods = data.filter(method => {
          if (!method.isActive) return false
          
          // Si no tiene productos específicos, aplica a todos
          if (!method.applicableProducts || method.applicableProducts.length === 0) {
            return true
          }
          
          // Si tiene productos específicos, verificar si incluye este producto
          let applicableProducts = method.applicableProducts
          if (typeof applicableProducts === 'string') {
            try {
              applicableProducts = JSON.parse(applicableProducts)
            } catch (e) {
              return false
            }
          }
          
          return Array.isArray(applicableProducts) && applicableProducts.includes(productId)
        })
        
        setPrintingMethods(applicableMethods)
      }
    } catch (error) {
      console.error('Error fetching printing methods:', error)
    }
  }

  const getProductImage = () => {
    try {
      if (product?.images) {
        const images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images
        if (Array.isArray(images) && images.length > 0) {
          return images[0]
        }
      }
    } catch (error) {
      console.error('Error parsing product images:', error)
    }
    return '/placeholder-product.png'
  }

  const handleSavePrintingMethod = () => {
    if (!selectedPrintingMethod) {
      toast.error('Selecciona un método de impresión')
      return
    }
    
    const selectedMethod = printingMethods.find(method => method.id === selectedPrintingMethod)
    const methodName = selectedMethod?.name || selectedPrintingMethod
    
    // Aquí guardarías el método de impresión seleccionado
    toast.success(`Método de impresión "${methodName}" configurado`)
    setShowPrintingMethodConfig(false)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href={`/admin/personalizacion/productos/${productId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Vista Previa del Producto</h1>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando vista previa...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" asChild>
          <Link href={`/admin/personalizacion/productos/${productId}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Vista Previa del Producto</h1>
          <p className="text-gray-600 mt-1">{product?.name}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <Button
          onClick={() => router.push(`/admin/personalizacion/productos/${productId}/editor-herramientas`)}
          size="lg"
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Palette className="h-5 w-5 mr-2" />
          Explorar las herramientas de personalización
        </Button>
        <Button
          onClick={() => setShowPrintingMethodConfig(true)}
          variant="outline"
          size="lg"
          className="border-orange-300 text-orange-700 hover:bg-orange-50"
        >
          <Printer className="h-5 w-5 mr-2" />
          Configurar un método de impresión
        </Button>
      </div>

      {/* Printing Method Configuration Modal */}
      {showPrintingMethodConfig && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-900">Configurar Método de Impresión</CardTitle>
            <CardDescription>
              Selecciona el método de impresión que afectará las opciones de personalización
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {printingMethods.length === 0 ? (
              <div className="text-center py-8">
                <Printer className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No hay métodos de impresión configurados
                </h3>
                <p className="text-gray-600 mb-4">
                  Este producto no tiene métodos de impresión configurados o no hay métodos activos disponibles.
                </p>
                <Button asChild variant="outline">
                  <Link href="/admin/personalizacion/metodos-impresion">
                    Configurar Métodos de Impresión
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {printingMethods.map((method) => (
                  <Card 
                    key={method.id}
                    className={`cursor-pointer transition-all ${
                      selectedPrintingMethod === method.id 
                        ? 'border-orange-500 bg-orange-100' 
                        : 'hover:border-orange-300'
                    }`}
                    onClick={() => setSelectedPrintingMethod(method.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 mt-1 ${
                          selectedPrintingMethod === method.id 
                            ? 'border-orange-500 bg-orange-500' 
                            : 'border-gray-300'
                        }`}>
                          {selectedPrintingMethod === method.id && (
                            <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{method.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Método de impresión configurado
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            {printingMethods.length > 0 && (
              <div className="flex gap-3 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setShowPrintingMethodConfig(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSavePrintingMethod}
                  className="bg-orange-600 hover:bg-orange-700"
                  disabled={!selectedPrintingMethod}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Método
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Product Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Image */}
        <Card>
          <CardHeader>
            <CardTitle>Vista del Producto</CardTitle>
            <CardDescription>Así verán los clientes el producto</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
              <Image
                src={getProductImage()}
                alt={product?.name || 'Producto'}
                fill
                className="object-cover"
              />
              {/* Overlay de áreas de personalización */}
              {sides.map((side) => 
                side.printAreas?.map((area) => (
                  <div
                    key={area.id}
                    className="absolute border-2 border-dashed border-blue-500 bg-blue-500/20"
                    style={{
                      left: `${area.x}%`,
                      top: `${area.y}%`,
                      width: `${area.width}%`,
                      height: `${area.height}%`
                    }}
                  >
                    <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                      {area.name}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Product Details */}
        <Card>
          <CardHeader>
            <CardTitle>Detalles de Personalización</CardTitle>
            <CardDescription>Configuración actual del producto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Product Info */}
            <div>
              <h4 className="font-semibold mb-2">Información del Producto</h4>
              <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nombre:</span>
                  <span className="font-medium">{product?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Código:</span>
                  <span className="font-mono text-sm">{productId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Categoría:</span>
                  <span>
                    {product?.categories && product.categories.length > 0 
                      ? product.categories[0].category.name 
                      : 'Sin categoría'}
                  </span>
                </div>
              </div>
            </div>

            {/* Sides Info */}
            <div>
              <h4 className="font-semibold mb-2">Lados Configurados</h4>
              <div className="space-y-2">
                {sides.map((side) => (
                  <div key={side.id} className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{side.name}</span>
                      <Badge variant="secondary">
                        {side.printAreas?.length || 0} áreas
                      </Badge>
                    </div>
                    {side.printAreas && side.printAreas.length > 0 && (
                      <div className="space-y-1">
                        {side.printAreas.map((area) => (
                          <div key={area.id} className="text-sm text-gray-600 flex justify-between">
                            <span>• {area.name}</span>
                            <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                              {area.printingMethod}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Customization Options */}
            <div>
              <h4 className="font-semibold mb-2">Opciones de Personalización</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {sides.reduce((total, side) => 
                      total + (side.printAreas?.filter(area => area.allowText).length || 0), 0
                    )}
                  </div>
                  <div className="text-sm text-green-700">Áreas con Texto</div>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {sides.reduce((total, side) => 
                      total + (side.printAreas?.filter(area => area.allowImages).length || 0), 0
                    )}
                  </div>
                  <div className="text-sm text-purple-700">Áreas con Imágenes</div>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {sides.reduce((total, side) => 
                      total + (side.printAreas?.filter(area => area.allowShapes).length || 0), 0
                    )}
                  </div>
                  <div className="text-sm text-orange-700">Áreas con Formas</div>
                </div>
                <div className="bg-pink-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-pink-600">
                    {sides.reduce((total, side) => 
                      total + (side.printAreas?.filter(area => area.allowClipart).length || 0), 0
                    )}
                  </div>
                  <div className="text-sm text-pink-700">Áreas con Clipart</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer View Simulation */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-900 flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Simulación de Vista del Cliente
          </CardTitle>
          <CardDescription>
            Esta es una aproximación de cómo verán los clientes el producto personalizable
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-white p-6 rounded-lg border-2 border-dashed border-green-300">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-bold">{product?.name}</h3>
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center relative group cursor-pointer"
                   onClick={() => window.open(`/productos/${productId}`, '_blank')}>
                <div className="text-center text-gray-500 group-hover:text-green-600 transition-colors">
                  <Play className="h-12 w-12 mx-auto mb-2" />
                  <p className="font-medium">Vista interactiva del producto</p>
                  <p className="text-sm">Haz click para abrir la vista del cliente</p>
                </div>
                <div className="absolute inset-0 bg-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
              </div>
              <div className="flex justify-center gap-2">
                {sides.map((side) => (
                  <Button key={side.id} variant="outline" size="sm">
                    {side.name}
                  </Button>
                ))}
              </div>
              <div className="flex gap-3 justify-center">
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => window.open(`/productos/${productId}`, '_blank')}
                >
                  Ver Página del Producto
                </Button>
                <Button 
                  variant="outline"
                  className="border-purple-300 text-purple-700 hover:bg-purple-50"
                  onClick={() => window.open(`/editor/${productId}`, '_blank')}
                >
                  <Palette className="h-4 w-4 mr-2" />
                  Abrir Editor
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                💡 Estas opciones abren la vista real que verían tus clientes
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}