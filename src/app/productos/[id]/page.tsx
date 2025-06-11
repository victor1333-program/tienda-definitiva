'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
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
  ChevronRight
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/lib/store'

interface ProductVariant {
  id: string
  name: string
  price: number
  color?: string
  size?: string
  material?: string
  stock: number
  sku: string
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
  isCustomizable: boolean
  tags: string[]
  variants: ProductVariant[]
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
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews'>('description')
  
  const { addItem } = useCartStore()

  useEffect(() => {
    if (productId) {
      fetchProduct()
    }
  }, [productId])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/products/${productId}?include=variants,reviews,category`)
      if (!response.ok) throw new Error('Producto no encontrado')
      
      const data = await response.json()
      setProduct(data)
      
      // Seleccionar la primera variante por defecto
      if (data.variants && data.variants.length > 0) {
        setSelectedVariant(data.variants[0])
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al cargar el producto')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return

    if (selectedVariant.stock < quantity) {
      toast.error('Stock insuficiente')
      return
    }

    addItem({
      id: `${product.id}-${selectedVariant.id}`,
      productId: product.id,
      variantId: selectedVariant.id,
      name: product.name,
      variant: selectedVariant.name,
      price: selectedVariant.price,
      image: product.images[0] || '/placeholder-product.png',
      quantity
    })

    toast.success('Producto añadido al carrito')
  }

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return
    if (selectedVariant && newQuantity > selectedVariant.stock) {
      toast.error('Stock insuficiente')
      return
    }
    setQuantity(newQuantity)
  }

  const nextImage = () => {
    if (product && product.images.length > 1) {
      setSelectedImageIndex((prev) => (prev + 1) % product.images.length)
    }
  }

  const prevImage = () => {
    if (product && product.images.length > 1) {
      setSelectedImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length)
    }
  }

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

  if (!product) {
    return (
      <div className="min-h-screen">
        <Header />
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
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-primary-500">Inicio</Link>
          <span>/</span>
          <Link href="/productos" className="hover:text-primary-500">Productos</Link>
          <span>/</span>
          <Link href={`/categoria/${product.category.slug}`} className="hover:text-primary-500">
            {product.category.name}
          </Link>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        {/* Back Button */}
        <Link href="/productos" className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-500 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Volver a productos
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative mb-4">
              <Image
                src={product.images[selectedImageIndex] || '/placeholder-product.png'}
                alt={product.name}
                fill
                className="object-cover"
              />
              
              {/* Image Navigation */}
              {product.images.length > 1 && (
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
              {product.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {product.images.map((_, index) => (
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
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(0, 4).map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 ${
                      index === selectedImageIndex ? 'border-primary-500' : 'border-transparent'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      width={100}
                      height={100}
                      className="w-full h-full object-cover"
                    />
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
              {product.isCustomizable && (
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
              <span className="text-3xl font-bold text-primary-600">
                {selectedVariant ? selectedVariant.price.toFixed(2) : product.basePrice.toFixed(2)}€
              </span>
              {product.variants.length > 1 && !selectedVariant && (
                <span className="text-gray-500 ml-2">desde</span>
              )}
            </div>

            {/* Variants */}
            {product.variants.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Opciones disponibles:</h3>
                <div className="grid grid-cols-1 gap-2">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`p-3 border rounded-lg text-left hover:border-primary-500 transition-colors ${
                        selectedVariant?.id === variant.id 
                          ? 'border-primary-500 bg-primary-50' 
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
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

            {/* Quantity */}
            {selectedVariant && selectedVariant.stock > 0 && (
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
                    disabled={selectedVariant && quantity >= selectedVariant.stock}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-500">
                    ({selectedVariant.stock} disponibles)
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3 mb-6">
              <Button
                onClick={handleAddToCart}
                disabled={!selectedVariant || selectedVariant.stock <= 0}
                className="w-full"
                size="lg"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {selectedVariant?.stock <= 0 ? 'Agotado' : 'Añadir al carrito'}
              </Button>

              {product.isCustomizable && (
                <Link href={`/personalizador?productId=${product.id}`} className="block">
                  <Button
                    variant="outline"
                    className="w-full bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                    size="lg"
                  >
                    <Palette className="w-5 h-5 mr-2" />
                    Personalizar este producto
                  </Button>
                </Link>
              )}

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Heart className="w-4 h-4 mr-2" />
                  Favoritos
                </Button>
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
              {['description', 'specifications', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab === 'description' && 'Descripción'}
                  {tab === 'specifications' && 'Especificaciones'}
                  {tab === 'reviews' && `Valoraciones (${product.reviewCount || 0})`}
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
              <div>
                {product.reviews && product.reviews.length > 0 ? (
                  <div className="space-y-6">
                    {product.reviews.map((review) => (
                      <Card key={review.id} className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium">
                              {review.user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{review.user.name}</span>
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`w-4 h-4 ${
                                      i < review.rating 
                                        ? 'text-yellow-400 fill-current' 
                                        : 'text-gray-300'
                                    }`} 
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString('es-ES')}
                              </span>
                            </div>
                            
                            <p className="text-gray-600 mb-3">{review.comment}</p>
                            
                            <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                              <ThumbsUp className="w-4 h-4" />
                              Útil ({review.helpful})
                            </button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Aún no hay valoraciones para este producto.</p>
                    <p className="text-sm text-gray-400 mt-1">¡Sé el primero en valorarlo!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}