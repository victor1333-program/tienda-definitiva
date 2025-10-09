'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Grid3X3, 
  List, 
  Heart,
  ShoppingCart,
  Star,
  Eye,
  ArrowLeft,
  Palette,
  Filter
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
  isCustomizable: boolean
  tags: string[]
  variants: {
    id: string
    name: string
    price: number
    stock: number
  }[]
  rating?: number
  reviewCount?: number
}

interface Category {
  id: string
  name: string
  slug: string
  description: string
  image?: string
  productCount: number
}

const categoryInfo: Record<string, {
  title: string
  description: string
  icon: string
  features: string[]
}> = {
  'textiles-dtf': {
    title: 'Textiles DTF',
    description: 'Impresión DTF de alta calidad en camisetas, sudaderas y todo tipo de textiles',
    icon: '👕',
    features: [
      'Colores vibrantes que no se desvanecen',
      'Tacto suave y duradero',
      'Resistente a lavados',
      'Personalización completa'
    ]
  },
  'sublimacion': {
    title: 'Sublimación',
    description: 'Productos sublimados con colores brillantes y diseños duraderos',
    icon: '☕',
    features: [
      'Colores brillantes y nítidos',
      'Resistente al calor y lavado',
      'Ideal para tazas y textiles sintéticos',
      'Personalización de alta calidad'
    ]
  },
  'corte-laser': {
    title: 'Corte Láser',
    description: 'Productos grabados y cortados con precisión láser',
    icon: '🔷',
    features: [
      'Precisión milimétrica',
      'Acabados profesionales',
      'Gran variedad de materiales',
      'Personalización detallada'
    ]
  },
  'eventos-especiales': {
    title: 'Eventos Especiales',
    description: 'Productos personalizados para bodas, cumpleaños y celebraciones',
    icon: '🎉',
    features: [
      'Diseños únicos para tu evento',
      'Múltiples técnicas disponibles',
      'Precios especiales por cantidad',
      'Entrega garantizada'
    ]
  },
  'empresas': {
    title: 'Empresas',
    description: 'Soluciones profesionales para uniformes y merchandising corporativo',
    icon: '🏢',
    features: [
      'Precios mayoristas',
      'Calidad profesional',
      'Grandes volúmenes',
      'Facturación empresarial'
    ]
  }
}

export default function CategoryPage() {
  const params = useParams()
  const categorySlug = params.slug as string
  
  const [category, setCategory] = useState<Category | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 })
  const [showCustomizable, setShowCustomizable] = useState(false)
  
  const { addItem } = useCartStore()

  const sortOptions = [
    { value: 'name', label: 'Nombre A-Z' },
    { value: 'price-asc', label: 'Precio: Menor a Mayor' },
    { value: 'price-desc', label: 'Precio: Mayor a Menor' },
    { value: 'newest', label: 'Más Recientes' },
    { value: 'popular', label: 'Más Populares' }
  ]

  useEffect(() => {
    if (categorySlug) {
      fetchCategoryAndProducts()
    }
  }, [categorySlug, searchTerm, sortBy, showCustomizable])

  const fetchCategoryAndProducts = async () => {
    try {
      setLoading(true)
      
      // Fetch category info
      const categoryResponse = await fetch(`/api/categories?slug=${categorySlug}`)
      if (categoryResponse.ok) {
        const categoryData = await categoryResponse.json()
        setCategory(categoryData.categories[0] || null)
      }

      // Fetch products
      const params = new URLSearchParams({
        category: categorySlug,
        visibility: 'public',
        status: 'active',
        ...(searchTerm && { search: searchTerm }),
        ...(showCustomizable && { customizable: 'true' }),
        sortBy
      })

      const productsResponse = await fetch(`/api/products/public?${params}`)
      if (!productsResponse.ok) throw new Error('Error al cargar productos')
      
      const data = await productsResponse.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al cargar los productos')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (product: Product, variantId?: string) => {
    const variant = variantId 
      ? product.variants.find(v => v.id === variantId)
      : product.variants[0]

    if (!variant) {
      toast.error('Variante no disponible')
      return
    }

    if (variant.stock <= 0) {
      toast.error('Producto agotado')
      return
    }

    addItem({
      id: `${product.id}-${variant.id}`,
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      variant: variant.name,
      price: variant.price,
      image: product.images[0] || '/placeholder-product.png',
      quantity: 1
    })

    toast.success('Producto añadido al carrito')
  }

  const filteredProducts = products.filter(product => {
    const matchesPrice = product.basePrice >= priceRange.min && product.basePrice <= priceRange.max
    return matchesPrice
  })

  const currentCategoryInfo = categoryInfo[categorySlug] || {
    title: category?.name || 'Categoría',
    description: category?.description || '',
    icon: '📦',
    features: []
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-primary-500">Inicio</Link>
          <span>/</span>
          <Link href="/productos" className="hover:text-primary-500">Productos</Link>
          <span>/</span>
          <span className="text-gray-900">{currentCategoryInfo.title}</span>
        </nav>

        {/* Back Button */}
        <Link href="/productos" className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-500 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Volver a productos
        </Link>

        {/* Category Header */}
        <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-4xl">{currentCategoryInfo.icon}</div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {currentCategoryInfo.title}
              </h1>
              <p className="text-gray-600 mt-2">
                {currentCategoryInfo.description}
              </p>
            </div>
          </div>

          {currentCategoryInfo.features.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              {currentCategoryInfo.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                  {feature}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Filters */}
        <Card className="p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar en esta categoría..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Sort */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode */}
            <div className="flex gap-1 border rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="flex-1"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="flex-1"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Additional Filters */}
          <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showCustomizable}
                onChange={(e) => setShowCustomizable(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Solo productos personalizables</span>
            </label>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Precio:</span>
              <Input
                type="number"
                placeholder="Mín"
                value={priceRange.min}
                onChange={(e) => setPriceRange({...priceRange, min: Number(e.target.value)})}
                className="w-20"
              />
              <span className="text-gray-500">-</span>
              <Input
                type="number"
                placeholder="Máx"
                value={priceRange.max}
                onChange={(e) => setPriceRange({...priceRange, max: Number(e.target.value)})}
                className="w-20"
              />
            </div>
          </div>
        </Card>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} en {currentCategoryInfo.title}
          </p>
        </div>

        {/* Products Grid/List */}
        <div className={
          viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-6"
        }>
          {filteredProducts.map((product) => (
            <Card key={product.id} className={`group overflow-hidden hover:shadow-lg transition-shadow ${
              viewMode === 'list' ? 'p-6' : ''
            }`}>
              {viewMode === 'grid' ? (
                // Grid View
                <div>
                  <div className="aspect-square bg-gray-100 relative overflow-hidden">
                    <Image
                      src={product.images[0] || '/placeholder-product.png'}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                    
                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex gap-2">
                        <Link href={`/productos/${product.id}`}>
                          <Button size="sm" variant="outline" className="bg-white hover:bg-gray-100">
                            <Eye className="w-3 h-3 mr-1" />
                            Ver
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          onClick={() => handleAddToCart(product)}
                          disabled={product.variants[0]?.stock <= 0}
                        >
                          <ShoppingCart className="w-3 h-3 mr-1" />
                          Comprar
                        </Button>
                        {product.isCustomizable && (
                          <Link href={`/personalizador?productId=${product.id}`}>
                            <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                              <Palette className="w-3 h-3 mr-1" />
                              Personalizar
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {product.isCustomizable && (
                        <Badge className="bg-purple-100 text-purple-800">Personalizable</Badge>
                      )}
                      {product.variants[0]?.stock <= 5 && product.variants[0]?.stock > 0 && (
                        <Badge variant="destructive">Últimas unidades</Badge>
                      )}
                      {product.variants[0]?.stock <= 0 && (
                        <Badge variant="secondary">Agotado</Badge>
                      )}
                    </div>

                    {/* Wishlist */}
                    <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                      <Heart className="w-4 h-4 text-gray-600 hover:text-red-500" />
                    </button>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
                      {product.name}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {product.description}
                    </p>

                    {product.rating && (
                      <div className="flex items-center gap-1 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3 h-3 ${
                                i < Math.floor(product.rating!) 
                                  ? 'text-yellow-400 fill-current' 
                                  : 'text-gray-300'
                              }`} 
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">
                          ({product.reviewCount})
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-primary-600">
                          {product.basePrice.toFixed(2)}€
                        </span>
                        {product.variants.length > 1 && (
                          <span className="text-sm text-gray-500 ml-1">desde</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // List View
                <div className="flex items-start gap-6">
                  <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={product.images[0] || '/placeholder-product.png'}
                      alt={product.name}
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {product.isCustomizable && (
                            <Badge className="bg-purple-100 text-purple-800 text-xs">
                              Personalizable
                            </Badge>
                          )}
                        </div>
                        
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {product.name}
                        </h3>
                        
                        <p className="text-gray-600 line-clamp-2 mb-2">
                          {product.description}
                        </p>

                        {product.rating && (
                          <div className="flex items-center gap-1 mb-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-4 h-4 ${
                                    i < Math.floor(product.rating!) 
                                      ? 'text-yellow-400 fill-current' 
                                      : 'text-gray-300'
                                  }`} 
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-500">
                              ({product.reviewCount} valoraciones)
                            </span>
                          </div>
                        )}
                        
                        <div className="text-xl font-bold text-primary-600">
                          {product.basePrice.toFixed(2)}€
                          {product.variants.length > 1 && (
                            <span className="text-sm text-gray-500 ml-1">desde</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        <Link href={`/productos/${product.id}`}>
                          <Button variant="outline" size="sm" className="w-full">
                            <Eye className="w-4 h-4 mr-1" />
                            Ver Detalles
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          onClick={() => handleAddToCart(product)}
                          disabled={product.variants[0]?.stock <= 0}
                          className="w-full"
                        >
                          <ShoppingCart className="w-4 h-4 mr-1" />
                          Añadir al Carrito
                        </Button>
                        {product.isCustomizable && (
                          <Link href={`/personalizador?productId=${product.id}`}>
                            <Button size="sm" className="bg-purple-600 hover:bg-purple-700 w-full">
                              <Palette className="w-4 h-4 mr-1" />
                              Personalizar
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">{currentCategoryInfo.icon}</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay productos en esta categoría
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || showCustomizable 
                ? 'Intenta cambiar los filtros de búsqueda'
                : 'Estamos trabajando en añadir productos a esta categoría'
              }
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => {
                setSearchTerm('')
                setShowCustomizable(false)
                setPriceRange({ min: 0, max: 1000 })
              }}>
                Limpiar Filtros
              </Button>
              <Link href="/productos">
                <Button variant="outline">
                  Ver Todos los Productos
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
  )
}