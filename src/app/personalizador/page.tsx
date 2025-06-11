'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import DesignCanvas from '@/components/editor/DesignCanvas'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  ShoppingCart, 
  ArrowLeft, 
  Save, 
  Eye,
  Package,
  Palette,
  Shirt,
  Coffee,
  Zap
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/lib/store'

interface Product {
  id: string
  name: string
  description: string
  basePrice: number
  images: string[]
  category: {
    name: string
    slug: string
  }
  variants: {
    id: string
    name: string
    price: number
    stock: number
  }[]
}

interface CustomDesign {
  elements: any[]
  canvasSize: { width: number; height: number }
  canvasBackground: string
}

function PersonalizadorContent() {
  const searchParams = useSearchParams()
  const productId = searchParams.get('productId')
  const templateId = searchParams.get('templateId')
  
  const [product, setProduct] = useState<Product | null>(null)
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [design, setDesign] = useState<CustomDesign | null>(null)
  const [designPrice, setDesignPrice] = useState(0)
  const [savedDesignId, setSavedDesignId] = useState<string | null>(null)
  
  const { addItem } = useCartStore()

  const categoryFeatures = {
    'textiles-dtf': {
      icon: <Shirt className="w-6 h-6" />,
      name: 'DTF',
      description: 'Ideal para textiles con colores vibrantes',
      techniques: ['Impresión DTF', 'Colores ilimitados', 'Tacto suave']
    },
    'sublimacion': {
      icon: <Coffee className="w-6 h-6" />,
      name: 'Sublimación', 
      description: 'Perfecto para productos sintéticos',
      techniques: ['Sublimación', 'Colores brillantes', 'Resistente al calor']
    },
    'corte-laser': {
      icon: <Zap className="w-6 h-6" />,
      name: 'Láser',
      description: 'Grabado y corte de precisión',
      techniques: ['Corte láser', 'Grabado', 'Múltiples materiales']
    }
  }

  useEffect(() => {
    if (productId) {
      fetchProduct()
    } else {
      setLoading(false)
    }
  }, [productId])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/products/${productId}?include=variants,category`)
      if (!response.ok) throw new Error('Producto no encontrado')
      
      const data = await response.json()
      setProduct(data)
      
      if (data.variants && data.variants.length > 0) {
        setSelectedVariant(data.variants[0].id)
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al cargar el producto')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveDesign = async (designData: CustomDesign) => {
    try {
      const response = await fetch('/api/designs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Diseño personalizado - ${product?.name || 'Sin producto'}`,
          description: 'Diseño creado en el personalizador',
          designData,
          productId,
          variantId: selectedVariant,
          isTemplate: false,
          isPublic: false
        })
      })

      if (!response.ok) throw new Error('Error al guardar diseño')

      const savedDesign = await response.json()
      setSavedDesignId(savedDesign.id)
      setDesign(designData)
      
      toast.success('Diseño guardado correctamente')
      return savedDesign.id
    } catch (error) {
      toast.error('Error al guardar el diseño')
      throw error
    }
  }

  const handleAddToCart = async () => {
    if (!product || !selectedVariant) {
      toast.error('Selecciona un producto y variante')
      return
    }

    if (!design) {
      toast.error('Crea tu diseño primero')
      return
    }

    try {
      // Guardar el diseño si no está guardado
      let currentDesignId = savedDesignId
      if (!currentDesignId) {
        currentDesignId = await handleSaveDesign(design)
      }

      const variant = product.variants.find(v => v.id === selectedVariant)
      if (!variant) {
        toast.error('Variante no encontrada')
        return
      }

      // Calcular precio final (producto + personalización)
      const personalizationFee = 5 // Tarifa de personalización
      const finalPrice = variant.price + personalizationFee

      addItem({
        id: `${product.id}-${variant.id}-${currentDesignId}`,
        productId: product.id,
        variantId: variant.id,
        name: product.name,
        variant: variant.name,
        price: finalPrice,
        image: product.images[0] || '/placeholder-product.png',
        quantity: 1,
        customDesignId: currentDesignId,
        isCustomized: true
      })

      toast.success('Producto personalizado añadido al carrito')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al añadir al carrito')
    }
  }

  const categoryInfo = product?.category?.slug 
    ? categoryFeatures[product.category.slug as keyof typeof categoryFeatures]
    : null

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href={product ? `/productos/${product.id}` : '/productos'}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {product ? 'Volver al producto' : 'Volver a productos'}
              </Button>
            </Link>
            
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                🎨 Personalizador
              </h1>
              {product && (
                <p className="text-gray-600">
                  Personalizando: {product.name}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Canvas Editor - Takes most space */}
          <div className="xl:col-span-3">
            <Card className="p-4">
              <DesignCanvas
                productId={productId || undefined}
                variantId={selectedVariant || undefined}
                templateId={templateId || undefined}
                onSave={setDesign}
                readOnly={false}
              />
            </Card>
          </div>

          {/* Product Info Sidebar */}
          <div className="space-y-6">
            {/* Product Selection */}
            {!productId && (
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  1. Selecciona un producto
                </h3>
                <p className="text-gray-600 mb-4">
                  Elige un producto para personalizar desde nuestro catálogo
                </p>
                <Link href="/productos">
                  <Button className="w-full">
                    <Package className="w-4 h-4 mr-2" />
                    Ver Productos
                  </Button>
                </Link>
              </Card>
            )}

            {/* Product Info */}
            {product && (
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Producto seleccionado
                </h3>
                
                <div className="mb-4">
                  <Image
                    src={product.images[0] || '/placeholder-product.png'}
                    alt={product.name}
                    width={200}
                    height={200}
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                </div>

                <h4 className="font-medium text-gray-900 mb-2">
                  {product.name}
                </h4>
                
                <p className="text-sm text-gray-600 mb-4">
                  {product.description}
                </p>

                {/* Category Info */}
                {categoryInfo && (
                  <div className="bg-blue-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      {categoryInfo.icon}
                      <span className="font-medium text-blue-900">
                        {categoryInfo.name}
                      </span>
                    </div>
                    <p className="text-sm text-blue-700 mb-2">
                      {categoryInfo.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {categoryInfo.techniques.map((technique, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {technique}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Variant Selection */}
                {product.variants.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Opciones disponibles:
                    </label>
                    <div className="space-y-2">
                      {product.variants.map((variant) => (
                        <button
                          key={variant.id}
                          onClick={() => setSelectedVariant(variant.id)}
                          className={`w-full p-3 border rounded-lg text-left transition-colors ${
                            selectedVariant === variant.id 
                              ? 'border-primary-500 bg-primary-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium">{variant.name}</div>
                              <div className="text-sm text-gray-600">
                                {variant.price.toFixed(2)}€
                              </div>
                            </div>
                            <div className="text-sm text-gray-500">
                              {variant.stock > 0 ? `${variant.stock} disponibles` : 'Agotado'}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price Summary */}
                {selectedVariant && (
                  <div className="border-t pt-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Producto base:</span>
                        <span>{product.variants.find(v => v.id === selectedVariant)?.price.toFixed(2)}€</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Personalización:</span>
                        <span>5.00€</span>
                      </div>
                      <div className="flex justify-between font-semibold text-base border-t pt-2">
                        <span>Total:</span>
                        <span className="text-primary-600">
                          {((product.variants.find(v => v.id === selectedVariant)?.price || 0) + 5).toFixed(2)}€
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Acciones rápidas
              </h3>
              
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    // Preview functionality could be added here
                    toast.info('Vista previa disponible en el canvas')
                  }}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Vista previa
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setDesign && handleSaveDesign(design!)}
                  disabled={!design}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Guardar diseño
                </Button>
                
                <Button 
                  className="w-full"
                  onClick={handleAddToCart}
                  disabled={!product || !selectedVariant || !design}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Añadir al carrito
                </Button>
              </div>
            </Card>

            {/* Tips */}
            <Card className="p-6 bg-yellow-50 border-yellow-200">
              <h3 className="font-semibold text-yellow-900 mb-3">
                💡 Consejos para personalizar
              </h3>
              <ul className="text-sm text-yellow-800 space-y-2">
                <li>• Usa imágenes de alta resolución (300 DPI)</li>
                <li>• Los colores brillantes funcionan mejor</li>
                <li>• Mantén el texto legible y grande</li>
                <li>• Revisa la vista previa antes de comprar</li>
              </ul>
            </Card>

            {/* Help */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                ¿Necesitas ayuda?
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Nuestro equipo está disponible para ayudarte con tu diseño personalizado.
              </p>
              <div className="space-y-2">
                <a 
                  href="tel:611066997" 
                  className="block text-sm text-primary-600 hover:text-primary-700"
                >
                  📞 611 066 997
                </a>
                <a 
                  href="mailto:info@lovilike.es" 
                  className="block text-sm text-primary-600 hover:text-primary-700"
                >
                  ✉️ info@lovilike.es
                </a>
                <Link 
                  href="/contacto" 
                  className="block text-sm text-primary-600 hover:text-primary-700"
                >
                  💬 Formulario de contacto
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default function PersonalizadorPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <PersonalizadorContent />
    </Suspense>
  )
}