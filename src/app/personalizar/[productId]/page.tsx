"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { 
  ArrowLeft, 
  ShoppingCart, 
  Share2, 
  Save, 
  Eye,
  Package,
  Grid3x3,
  Palette,
  Type,
  Image as ImageIcon,
  Square,
  Download,
  Info,
  Plus,
  Minus
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { toast } from "react-hot-toast"
import ZakekeAdvancedEditor from "@/components/editor/ZakekeAdvancedEditor"

interface Product {
  id: string
  name: string
  basePrice: number
  images: string[]
  description?: string
  sides: ProductSide[]
  isPersonalizable: boolean
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
  maxColors: number
  basePrice: number
}

interface CustomerDesign {
  id?: string
  productId: string
  designData: any
  selectedVariant?: string
  quantity: number
  totalPrice: number
  previewImages: string[]
}

export default function PersonalizarProducto() {
  const params = useParams()
  const router = useRouter()
  const productId = params.productId as string
  
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [design, setDesign] = useState<CustomerDesign | null>(null)
  const [selectedSide, setSelectedSide] = useState<ProductSide | null>(null)
  const [selectedArea, setSelectedArea] = useState<PrintArea | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [showEditor, setShowEditor] = useState(false)

  useEffect(() => {
    if (productId) {
      fetchProduct()
    }
  }, [productId])

  const fetchProduct = async () => {
    try {
      // Fetch product with sides and print areas
      const [productRes, sidesRes] = await Promise.all([
        fetch(`/api/products/${productId}`),
        fetch(`/api/personalization/sides?productId=${productId}`)
      ])

      const productData = await productRes.json()
      const sidesData = await sidesRes.json()

      if (productRes.ok && sidesData.success) {
        const productWithSides = {
          ...productData.product,
          sides: sidesData.data || []
        }
        
        setProduct(productWithSides)
        
        // Set first side as active
        if (sidesData.data?.length > 0) {
          setSelectedSide(sidesData.data[0])
          if (sidesData.data[0].printAreas?.length > 0) {
            setSelectedArea(sidesData.data[0].printAreas[0])
          }
        }
      } else {
        toast.error('Producto no encontrado')
        router.push('/productos')
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      toast.error('Error al cargar el producto')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveDesign = async (designData: any) => {
    if (!product) return

    setSaving(true)
    try {
      const response = await fetch('/api/customer-designs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          designData,
          quantity,
          status: 'DRAFT'
        })
      })

      if (response.ok) {
        const data = await response.json()
        setDesign(data.design)
        toast.success('Diseño guardado exitosamente')
      } else {
        toast.error('Error al guardar el diseño')
      }
    } catch (error) {
      console.error('Error saving design:', error)
      toast.error('Error al guardar el diseño')
    } finally {
      setSaving(false)
    }
  }

  const handleAddToCart = async () => {
    if (!design || !product) {
      toast.error('Completa tu diseño primero')
      return
    }

    try {
      // Here we would add the customized product to cart
      // This would include the design data and calculated price
      toast.success('Producto personalizado agregado al carrito')
      router.push('/carrito')
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error('Error al agregar al carrito')
    }
  }

  const calculatePrice = () => {
    if (!product) return 0
    
    let total = product.basePrice
    
    // Add pricing for selected areas
    if (selectedArea) {
      total += selectedArea.basePrice
    }
    
    // Multiply by quantity
    total *= quantity
    
    return total
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando producto...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Producto no encontrado</h3>
            <p className="text-gray-600 mb-4">Este producto no existe o no está disponible para personalización</p>
            <Button asChild>
              <Link href="/productos">
                Ver Productos
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!product.isPersonalizable || product.sides.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="text-center py-8">
            <Palette className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Producto no personalizable</h3>
            <p className="text-gray-600 mb-4">Este producto aún no está configurado para personalización</p>
            <Button asChild>
              <Link href={`/productos/${product.id}`}>
                Ver Producto
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/productos/${product.id}`}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Link>
              </Button>
              
              <div>
                <h1 className="text-xl font-bold">Personalizar: {product.name}</h1>
                <p className="text-sm text-gray-600">
                  Diseña tu producto único con nuestro editor visual
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline">
                ${calculatePrice().toFixed(2)}
              </Badge>
              
              <Button onClick={handleAddToCart} disabled={!design}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Agregar al Carrito
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {!showEditor ? (
          /* Product Configuration */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Product Info */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Vista del Producto</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                    <Image
                      src={selectedSide?.image2D || getProductImage()}
                      alt={product.name}
                      width={400}
                      height={400}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  
                  {/* Side Selector */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Lado del producto:</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {product.sides.map((side) => (
                        <button
                          key={side.id}
                          onClick={() => {
                            setSelectedSide(side)
                            setSelectedArea(side.printAreas[0] || null)
                          }}
                          className={`p-3 rounded-lg border-2 text-left transition-all ${
                            selectedSide?.id === side.id
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="font-medium text-sm">
                            {side.displayName || side.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {side.printAreas.length} área{side.printAreas.length !== 1 ? 's' : ''}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Product Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    Información del Producto
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold">{product.name}</h3>
                    {product.description && (
                      <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Precio base:</span>
                      <div className="font-semibold">${product.basePrice.toFixed(2)}</div>
                    </div>
                    
                    <div>
                      <span className="text-gray-500">Lados personalizables:</span>
                      <div className="font-semibold">{product.sides.length}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Customization Options */}
            <div className="space-y-6">
              {selectedSide && (
                <Card>
                  <CardHeader>
                    <CardTitle>Áreas de Personalización</CardTitle>
                    <p className="text-sm text-gray-600">
                      Selecciona qué área quieres personalizar en: {selectedSide.displayName || selectedSide.name}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedSide.printAreas.map((area) => (
                      <div
                        key={area.id}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedArea?.id === area.id
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedArea(area)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{area.displayName || area.name}</h4>
                          <Badge variant="secondary">{area.printingMethod}</Badge>
                        </div>
                        
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>Dimensiones: {area.width} × {area.height}px</div>
                          {area.basePrice > 0 && (
                            <div>Precio: +${area.basePrice.toFixed(2)}</div>
                          )}
                        </div>
                        
                        <div className="flex gap-2 mt-2">
                          {area.allowText && (
                            <Badge variant="outline" className="text-xs">
                              <Type className="h-3 w-3 mr-1" />
                              Texto
                            </Badge>
                          )}
                          {area.allowImages && (
                            <Badge variant="outline" className="text-xs">
                              <ImageIcon className="h-3 w-3 mr-1" />
                              Imágenes
                            </Badge>
                          )}
                          {area.allowShapes && (
                            <Badge variant="outline" className="text-xs">
                              <Square className="h-3 w-3 mr-1" />
                              Formas
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Quantity & Price */}
              <Card>
                <CardHeader>
                  <CardTitle>Cantidad y Precio</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Cantidad:</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-12 text-center">{quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuantity(quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 pt-2 border-t">
                    <div className="flex justify-between text-sm">
                      <span>Precio base:</span>
                      <span>${product.basePrice.toFixed(2)}</span>
                    </div>
                    {selectedArea && selectedArea.basePrice > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Personalización:</span>
                        <span>+${selectedArea.basePrice.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span>Cantidad:</span>
                      <span>× {quantity}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>${calculatePrice().toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Start Design Button */}
              <Card>
                <CardContent className="pt-6">
                  <Button 
                    onClick={() => setShowEditor(true)}
                    disabled={!selectedArea}
                    className="w-full"
                    size="lg"
                  >
                    <Palette className="h-5 w-5 mr-2" />
                    Comenzar a Diseñar
                  </Button>
                  
                  {!selectedArea && (
                    <p className="text-sm text-gray-500 text-center mt-2">
                      Selecciona un área de personalización para continuar
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* Design Editor */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setShowEditor(false)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Configuración
              </Button>
              
              <div className="flex items-center gap-2">
                <Button variant="outline">
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Borrador
                </Button>
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Vista Previa
                </Button>
              </div>
            </div>

            <ZakekeAdvancedEditor
              productId={product.id}
              sides={product.sides}
              onSave={handleSaveDesign}
              initialDesign={design?.designData}
            />
          </div>
        )}
      </div>
    </div>
  )
}