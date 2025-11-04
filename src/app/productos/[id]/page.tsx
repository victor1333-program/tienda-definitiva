'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ShoppingCart, 
  Heart, 
  Share2, 
  Star, 
  Truck, 
  Shield, 
  ArrowLeft,
  Plus,
  Minus,
  Palette,
  Eye,
  MessageSquare,
  ThumbsUp,
  ChevronLeft,
  ChevronRight,
  Scale
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/lib/store'
import { WishlistButton } from '@/components/ui/Wishlist'
import { Reviews } from '@/components/ui/Reviews'
import { WhatsAppProductButton } from '@/components/WhatsAppButton'
import SizeTable, { SizeTableData } from '@/components/ui/SizeTable'
import { generateSizeTableData } from '@/components/admin/products/AdvancedVariantsManager'
import TemplatePreviewRenderer from '@/components/templates/TemplatePreviewRenderer'
import TemplatePreview from '@/components/common/TemplatePreview'

interface ProductVariant {
  id: string
  name: string
  price: number
  colorName?: string
  colorHex?: string
  size?: string
  material?: string
  stock: number
  sku: string
  width?: number
  height?: number
  images?: string[] // Imágenes específicas de la variante
}

interface VariantGroup {
  id: string
  name: string
  type: 'size' | 'color' | 'custom'
  options: VariantOption[]
  showSizeTable?: boolean
}

interface VariantOption {
  id: string
  name: string
  value: string
  colorHex?: string
  measurements?: {
    width?: number
    length?: number
  }
}

interface Product {
  id: string
  name: string
  description: string
  longDescription?: string
  basePrice: number
  images: string[]
  category: {
    id: string
    name: string
    slug: string
  }
  tags: string[]
  isPersonalizable?: boolean
  personalizationData?: any
  personalizationSettings?: any
  personalization?: {
    id: string
    name: string
    allowText: boolean
    allowImages: boolean
    maxImages: number
    maxFileSize: number
  }
  variants: ProductVariant[]
  variantGroups?: VariantGroup[] // Añadir grupos de variantes
  variantGroupsConfig?: any // Configuración de grupos de variantes desde la BD
  // Stock principal (para productos sin variantes)
  stock: number
  trackInventory: boolean
  rating?: number
  reviewCount?: number
  specifications?: {
    material?: string
    dimensions?: string
    weight?: string
    careInstructions?: string
  }
  reviews?: {
    id: string
    user: { name: string; avatar?: string }
    rating: number
    comment: string
    createdAt: string
    helpful: number
  }[]
}

export default function ProductDetailPage() {
  const params = useParams()
  const productId = params.id as string
  
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews' | 'size-guide'>('description')
  const [sizeTableData, setSizeTableData] = useState<SizeTableData[]>([])
  const [currentImages, setCurrentImages] = useState<string[]>([]) // Imágenes actuales a mostrar
  const [templateData, setTemplateData] = useState<{
    hasDefaultTemplate: boolean
    defaultTemplates: any[]
    optionalTemplates: any[]
  } | null>(null)
  const [templatePreviewUrl, setTemplatePreviewUrl] = useState<string | null>(null)
  
  const { addItem } = useCartStore()

  useEffect(() => {
    if (productId) {
      fetchProduct()
    }
  }, [productId])

  // Generar datos de tabla de tallas cuando el producto se carga
  useEffect(() => {
    if (product) {
      // Priorizar la configuración de grupos de variantes si existe
      if (product.variantGroupsConfig) {
        try {
          console.log('🔍 Variant Groups Config encontrado:', product.variantGroupsConfig)
          const sizeTableFromGroups = generateSizeTableData(product.variantGroupsConfig)
          console.log('📊 Size Table desde grupos:', sizeTableFromGroups)
          if (sizeTableFromGroups.length > 0) {
            setSizeTableData(sizeTableFromGroups)
            return
          }
        } catch (error) {
          console.warn('Error al generar tabla de tallas desde grupos:', error)
        }
      }
      
      // Fallback a medidas de variantes individuales si existen
      if (product.variants) {
        const uniqueSizes = [...new Set(product.variants.filter(v => v.size).map(v => v.size))]
        
        if (uniqueSizes.length > 0) {
          const hasRealMeasurements = product.variants.some(v => v.width || v.height)
          
          if (hasRealMeasurements) {
            const sizeTableWithMeasures: SizeTableData = {
              groupName: "Guía de Tallas",
              sizes: uniqueSizes.map(size => {
                const variantWithMeasures = product.variants.find(v => 
                  v.size === size && (v.width || v.height)
                )
                return {
                  name: size!,
                  width: variantWithMeasures?.width || undefined,
                  length: variantWithMeasures?.height || undefined
                }
              })
            }
            setSizeTableData([sizeTableWithMeasures])
          } else {
            setSizeTableData([])
          }
        }
      }
    }
  }, [product])

  // Actualizar imágenes cuando cambie la variante seleccionada o las plantillas
  useEffect(() => {
    if (product) {
      let imagesToShow: string[] = []
      let templateImageUsed = false
      
      // 1. Si hay plantilla predeterminada, usar imagen generada de la plantilla
      if (templateData?.hasDefaultTemplate) {
        const template = templateData.defaultTemplates[0]
        if (templatePreviewUrl) {
          // Si hay imagen generada de la plantilla, usarla
          imagesToShow.push(templatePreviewUrl)
          templateImageUsed = true
        } else if (template?.thumbnailUrl) {
          // Si hay thumbnail, usarlo
          imagesToShow.push(template.thumbnailUrl)
          templateImageUsed = true
        }
      }
      
      // 2. Agregar imágenes específicas de la variante
      if (selectedVariant?.images && selectedVariant.images.length > 0) {
        imagesToShow = [...imagesToShow, ...selectedVariant.images]
      } else if (!templateImageUsed) {
        // 3. Solo agregar imágenes del producto si no se usó una imagen de plantilla
        imagesToShow = [...imagesToShow, ...(product.images || [])]
      }
      
      // Eliminar duplicados manteniendo el orden
      const uniqueImages = imagesToShow.filter((img, index) => imagesToShow.indexOf(img) === index)
      
      setCurrentImages(uniqueImages.length > 0 ? uniqueImages : ['/placeholder-product.png'])
      // Reset del índice de imagen cuando cambie la variante
      setSelectedImageIndex(0)
    }
  }, [selectedVariant, product, templateData, templatePreviewUrl])


  const fetchProduct = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/products/public/${productId}?include=variants,reviews,category,personalization`)
      if (!response.ok) throw new Error('Producto no encontrado')
      
      const data = await response.json()
      setProduct(data)
      
      // Seleccionar la primera variante por defecto
      if (data.variants && data.variants.length > 0) {
        setSelectedVariant(data.variants[0])
      }

      // Cargar plantillas si es personalizable
      if (data.isPersonalizable) {
        fetchTemplates()
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al cargar el producto')
    } finally {
      setLoading(false)
    }
  }

  const fetchTemplates = async () => {
    try {
      const response = await fetch(`/api/products/${productId}/templates`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setTemplateData({
            hasDefaultTemplate: data.hasDefaultTemplate,
            defaultTemplates: data.defaultTemplates,
            optionalTemplates: data.optionalTemplates
          })
        }
      }
    } catch (error) {
      console.error('Error loading templates:', error)
    }
  }

  const handleAddToCart = () => {
    if (!product) return

    // Obtener stock disponible (de variante o producto principal)
    const availableStock = selectedVariant ? selectedVariant.stock : product.stock

    if (availableStock < quantity) {
      toast.error('Stock insuficiente')
      return
    }

    // Para productos sin variantes, crear un ID único basado solo en el producto
    const cartItemId = selectedVariant
      ? `${product.id}-${selectedVariant.id}`
      : product.id

    const variantName = selectedVariant
      ? selectedVariant.name
      : 'Estándar'

    addItem({
      id: cartItemId,
      productId: product.id,
      variantId: selectedVariant?.id,
      name: product.name,
      variant: variantName,
      price: selectedVariant ? (Number(selectedVariant.price) || Number(product.basePrice)) : Number(product.basePrice),
      image: product.images[0] || '/placeholder-product.png',
      quantity
    })

    toast.success('Producto añadido al carrito')
  }

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return

    // Obtener stock disponible (de variante o producto principal)
    const availableStock = selectedVariant ? selectedVariant.stock : product.stock

    if (newQuantity > availableStock) {
      toast.error('Stock insuficiente')
      return
    }
    setQuantity(newQuantity)
  }

  const nextImage = () => {
    if (currentImages.length > 1) {
      setSelectedImageIndex((prev) => (prev + 1) % currentImages.length)
    }
  }

  const prevImage = () => {
    if (currentImages.length > 1) {
      setSelectedImageIndex((prev) => (prev - 1 + currentImages.length) % currentImages.length)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Producto no encontrado</h1>
          <Link href="/productos">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a productos
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-orange-500">Inicio</Link>
          <span>/</span>
          <Link href="/productos" className="hover:text-orange-500">Productos</Link>
          <span>/</span>
          <Link href={`/categoria/${product.category.slug}`} className="hover:text-orange-500">
            {product.category.name}
          </Link>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        {/* Back Button */}
        <Link href="/productos" className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-500 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Volver a productos
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative mb-4">
              <Image
                src={currentImages[selectedImageIndex] || '/placeholder-product.png'}
                alt={product.name}
                fill
                className="object-cover"
              />
              
              
              {/* Image Navigation */}
              {currentImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-2 hover:bg-opacity-100"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-2 hover:bg-opacity-100"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Image Indicator */}
              {currentImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {currentImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`w-2 h-2 rounded-full ${
                        index === selectedImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {currentImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {currentImages.slice(0, 4).map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 relative ${
                      index === selectedImageIndex ? 'border-orange-500' : 'border-transparent'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      width={100}
                      height={100}
                      className="w-full h-full object-cover"
                    />
                    {/* Template Badge for first thumbnail */}
                    {templateData?.hasDefaultTemplate && 
                     index === 0 && (
                      <div className="absolute top-1 left-1 w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-4">
              <Badge variant="outline" className="mb-2">
                {product.category.name}
              </Badge>
              {product.isPersonalizable && (
                <Badge className="bg-purple-100 text-purple-800 ml-2">
                  Personalizable
                </Badge>
              )}
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            {product.rating && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating!) 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300'
                      }`} 
                    />
                  ))}
                </div>
                <span className="text-gray-600">
                  {product.rating.toFixed(1)} ({product.reviewCount} valoraciones)
                </span>
              </div>
            )}

            <p className="text-gray-600 mb-6">
              {product.description}
            </p>

            {/* Price */}
            <div className="mb-6">
              <span className="text-3xl font-bold text-orange-600">
                {selectedVariant ? (Number(selectedVariant.price) || Number(product.basePrice)).toFixed(2) : Number(product.basePrice).toFixed(2)}€
              </span>
              {product.variants.length > 1 && !selectedVariant && (
                <span className="text-gray-500 ml-2">desde</span>
              )}
            </div>

            {/* Variants - Redesigned */}
            {product.variants.length > 0 && (
              <div className="mb-6 space-y-4">
                {/* Sizes */}
                {(() => {
                  const uniqueSizes = [...new Set(product.variants.filter(v => v.size).map(v => v.size))]
                  const selectedSize = selectedVariant?.size
                  
                  if (uniqueSizes.length > 0) {
                    return (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-medium text-gray-900">Talla</h3>
                          {sizeTableData.length > 0 && (
                            <button
                              onClick={() => setActiveTab('size-guide')}
                              className="text-sm text-orange-600 hover:text-orange-700 underline"
                            >
                              Ver tabla de tallas
                            </button>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {uniqueSizes.map((size) => {
                            const sizeVariants = product.variants.filter(v => v.size === size)
                            const hasStock = sizeVariants.some(v => v.stock > 0)
                            const isSelected = selectedSize === size
                            
                            return (
                              <button
                                key={size}
                                onClick={() => {
                                  if (hasStock) {
                                    // Select first available variant with this size
                                    const variant = sizeVariants.find(v => v.stock > 0) || sizeVariants[0]
                                    setSelectedVariant(variant)
                                  }
                                }}
                                disabled={!hasStock}
                                className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                                  isSelected
                                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                                    : hasStock
                                    ? 'border-gray-200 text-gray-700 hover:border-orange-300'
                                    : 'border-gray-200 text-gray-400 bg-gray-50 line-through cursor-not-allowed'
                                }`}
                              >
                                {size.toUpperCase()}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  }
                  return null
                })()}

                {/* Colors */}
                {(() => {
                  const uniqueColors = product.variants
                    .filter(v => v.colorName && v.colorHex)
                    .reduce((acc, v) => {
                      if (!acc.find(item => item.colorName === v.colorName)) {
                        acc.push({ 
                          colorName: v.colorName!, 
                          colorHex: v.colorHex!,
                          displayName: v.colorName! 
                        })
                      }
                      return acc
                    }, [] as Array<{ colorName: string; colorHex: string; displayName: string }>)
                  
                  const selectedColor = selectedVariant?.colorName
                  
                  if (uniqueColors.length > 0) {
                    return (
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-3">Color</h3>
                        <div className="flex flex-wrap gap-3">
                          {uniqueColors.map((colorOption, index) => {
                            const colorVariants = product.variants.filter(v => v.colorName === colorOption.colorName)
                            const hasStock = colorVariants.some(v => v.stock > 0)
                            const isSelected = selectedColor === colorOption.colorName
                            
                            return (
                              <button
                                key={`${colorOption.colorName}-${index}`}
                                onClick={() => {
                                  if (hasStock) {
                                    // Select first available variant with this color, preferring current size if available
                                    const preferredVariant = selectedVariant?.size 
                                      ? colorVariants.find(v => v.size === selectedVariant.size && v.stock > 0)
                                      : null
                                    const variant = preferredVariant || colorVariants.find(v => v.stock > 0) || colorVariants[0]
                                    setSelectedVariant(variant)
                                  }
                                }}
                                disabled={!hasStock}
                                className={`group relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                                  isSelected
                                    ? 'border-orange-500 ring-2 ring-orange-200'
                                    : hasStock
                                    ? 'border-gray-300 hover:border-orange-400'
                                    : 'border-gray-200 cursor-not-allowed opacity-50'
                                }`}
                                title={colorOption.displayName}
                              >
                                <div
                                  className={`w-7 h-7 rounded-full ${!hasStock ? 'opacity-50' : ''}`}
                                  style={{ backgroundColor: colorOption.colorHex }}
                                />
                                {!hasStock && (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-8 h-0.5 bg-gray-400 transform rotate-45"></div>
                                  </div>
                                )}
                                {isSelected && (
                                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                  </div>
                                )}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  }
                  return null
                })()}

                {/* Other variants (material, etc.) */}
                {(() => {
                  const otherVariants = product.variants.filter(v => !v.size && !v.color)
                  if (otherVariants.length > 0) {
                    return (
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-3">Opciones</h3>
                        <div className="grid grid-cols-1 gap-2">
                          {otherVariants.map((variant) => (
                            <button
                              key={variant.id}
                              onClick={() => setSelectedVariant(variant)}
                              disabled={variant.stock <= 0}
                              className={`p-3 border rounded-lg text-left transition-colors ${
                                selectedVariant?.id === variant.id 
                                  ? 'border-orange-500 bg-orange-50' 
                                  : variant.stock > 0
                                  ? 'border-gray-200 hover:border-orange-300'
                                  : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium">{variant.name}</div>
                                  <div className="text-sm text-gray-600">{variant.price.toFixed(2)}€</div>
                                  {variant.material && (
                                    <div className="text-xs text-gray-500 mt-1">{variant.material}</div>
                                  )}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {variant.stock > 0 ? (
                                    <span className="text-green-600">Disponible</span>
                                  ) : (
                                    <span className="text-red-500">Agotado</span>
                                  )}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  }
                  return null
                })()}

                {/* Selected variant summary */}
                {selectedVariant && (
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Seleccionado:</div>
                        <div className="text-sm text-gray-600">
                          {selectedVariant.size && selectedVariant.colorName 
                            ? `${selectedVariant.size.toUpperCase()} - ${selectedVariant.colorName}`
                            : selectedVariant.name}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-orange-600">{(Number(selectedVariant.price) || Number(product.basePrice)).toFixed(2)}€</div>
                        <div className="text-xs text-gray-500">
                          {selectedVariant.stock > 0 ? `${selectedVariant.stock} disponibles` : 'Agotado'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quantity */}
            {(() => {
              const availableStock = selectedVariant ? selectedVariant.stock : product.stock
              const hasStock = availableStock > 0

              if (!hasStock) return null

              return (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Cantidad
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= availableStock}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-gray-500">
                      ({availableStock} disponibles)
                    </span>
                  </div>
                </div>
              )
            })()}

            {/* Action Buttons */}
            <div className="space-y-3 mb-6">
              {(() => {
                const availableStock = selectedVariant ? selectedVariant.stock : product.stock
                const hasStock = availableStock > 0
                const needsVariantSelection = product.variants.length > 0 && !selectedVariant

                return (
                  <Button
                    onClick={handleAddToCart}
                    disabled={needsVariantSelection || !hasStock}
                    className="w-full"
                    size="lg"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    {needsVariantSelection
                      ? 'Selecciona una opción'
                      : !hasStock
                      ? 'Agotado'
                      : 'Añadir al carrito'}
                  </Button>
                )
              })()}

              {product.isPersonalizable && (
                <div className="space-y-2">
                  {templateData?.hasDefaultTemplate ? (
                    // Si hay plantilla predeterminada, ir directo con esa plantilla
                    <Link href={`/editor/${product.id}?template=${templateData.defaultTemplates[0]?.id}`} className="block">
                      <Button
                        variant="outline"
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 border-0 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden"
                        size="lg"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative flex items-center justify-center">
                          <Palette className="w-5 h-5 mr-2 animate-pulse" />
                          <span className="font-bold text-lg">✨ ¡Personalízame! ✨</span>
                        </div>
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"></div>
                      </Button>
                    </Link>
                  ) : (
                    // Si no hay plantilla predeterminada, ir al editor normal
                    <Link href={`/editor/${product.id}`} className="block">
                      <Button
                        variant="outline"
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 border-0 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden"
                        size="lg"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative flex items-center justify-center">
                          <Palette className="w-5 h-5 mr-2 animate-pulse" />
                          <span className="font-bold text-lg">✨ ¡Personalízame! ✨</span>
                        </div>
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"></div>
                      </Button>
                    </Link>
                  )}
                  
                </div>
              )}

              <WhatsAppProductButton
                productName={product.name}
                productUrl={typeof window !== 'undefined' ? window.location.href : undefined}
                className="w-full"
                size="lg"
              />

              <div className="flex gap-2">
                <WishlistButton productId={product.id} variant="large" className="flex-1 h-12" />
                <Button variant="outline" size="sm" className="flex-1">
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartir
                </Button>
              </div>
            </div>

            {/* Guarantees */}
            <div className="border-t pt-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Truck className="w-5 h-5 text-green-500" />
                  <span>Envío gratis en pedidos superiores a 30€</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Shield className="w-5 h-5 text-green-500" />
                  <span>Garantía de satisfacción o devolvemos tu dinero</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Eye className="w-5 h-5 text-green-500" />
                  <span>Calidad premium garantizada</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="mt-16">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {[
                'description', 
                'specifications', 
                'reviews',
                ...(sizeTableData.length > 0 ? ['size-guide'] : [])
              ].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab === 'description' && 'Descripción'}
                  {tab === 'specifications' && 'Especificaciones'}
                  {tab === 'reviews' && `Valoraciones (${product.reviewCount || 0})`}
                  {tab === 'size-guide' && (
                    <div className="flex items-center gap-1">
                      <Scale className="w-4 h-4" />
                      Guía de Tallas
                    </div>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="py-8">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <p className="text-gray-600 leading-relaxed">
                  {product.longDescription || product.description}
                </p>
                
                {product.tags && product.tags.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-900 mb-3">Etiquetas:</h4>
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {product.specifications ? (
                  <>
                    {product.specifications.material && (
                      <div>
                        <dt className="font-medium text-gray-900">Material</dt>
                        <dd className="text-gray-600">{product.specifications.material}</dd>
                      </div>
                    )}
                    {product.specifications.dimensions && (
                      <div>
                        <dt className="font-medium text-gray-900">Dimensiones</dt>
                        <dd className="text-gray-600">{product.specifications.dimensions}</dd>
                      </div>
                    )}
                    {product.specifications.weight && (
                      <div>
                        <dt className="font-medium text-gray-900">Peso</dt>
                        <dd className="text-gray-600">{product.specifications.weight}</dd>
                      </div>
                    )}
                    {product.specifications.careInstructions && (
                      <div className="md:col-span-2">
                        <dt className="font-medium text-gray-900">Instrucciones de cuidado</dt>
                        <dd className="text-gray-600">{product.specifications.careInstructions}</dd>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500">No hay especificaciones disponibles.</p>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <Reviews productId={product.id} />
            )}

            {activeTab === 'size-guide' && (
              <div className="space-y-6">
                {sizeTableData.length > 0 ? (
                  <>
                    <div className="text-center mb-8">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Guía de Tallas
                      </h3>
                      <p className="text-gray-600">
                        Consulta nuestras tablas de medidas para encontrar tu talla perfecta
                      </p>
                    </div>
                    {sizeTableData.map((tableData, index) => (
                      <SizeTable 
                        key={index} 
                        data={tableData} 
                        className="mb-6" 
                      />
                    ))}
                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-900 mb-2">
                        💡 Consejos para medir correctamente
                      </h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Mide sobre una superficie plana con la prenda extendida</li>
                        <li>• Toma las medidas en centímetros usando una cinta métrica</li>
                        <li>• Para el ancho: mide de costura a costura en la parte más ancha</li>
                        <li>• Para el largo: mide desde el punto más alto hasta el borde inferior</li>
                        <li>• Si tienes dudas, contáctanos por WhatsApp para asesorarte</li>
                      </ul>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Scale className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No hay guías de tallas disponibles para este producto.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>


        {/* Template Preview Renderer (hidden) - generates template preview image for compatibility */}
        {templateData?.hasDefaultTemplate && templateData.defaultTemplates[0]?.templateData && !templatePreviewUrl && (
          <div className="hidden">
            <TemplatePreviewRenderer
              templateData={templateData.defaultTemplates[0].templateData}
              width={600}
              height={600}
              onImageGenerated={(dataUrl) => setTemplatePreviewUrl(dataUrl)}
            />
          </div>
        )}
      </div>
  )
}