'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Heart,
  ShoppingCart,
  Star,
  Eye,
  ArrowUpDown,
  Palette,
  Scale
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/lib/store'
import { WishlistButton } from '@/components/ui/Wishlist'
import { ProductCardSkeleton, ProductListSkeleton } from '@/components/ui/LoadingSkeleton'

interface Product {
  id: string
  name: string
  description: string
  basePrice: number
  images: string[]
  category: {
    id: string
    name: string
    slug: string
  }
  isCustomizable: boolean
  tags: string[]
  // Stock principal (para productos sin variantes)
  stock: number
  trackInventory: boolean
  variants: {
    id: string
    name: string
    price: number
    color?: string
    size?: string
    material?: string
    stock: number
  }[]
  rating?: number
  reviewCount?: number
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 })
  const [sortBy, setSortBy] = useState('name')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showCustomizable, setShowCustomizable] = useState(false)
  
  const { addItem } = useCartStore()

  const categories = [
    { value: 'all', label: 'Todas las categorías' },
    { value: 'bodas-eventos', label: 'Bodas & Eventos' },
    { value: 'comuniones-bautizos', label: 'Comuniones & Bautizos' },
    { value: 'baby-shower', label: 'Baby Shower' },
    { value: 'textil-personalizado', label: 'Textil Personalizado' },
    { value: 'tazas-accesorios', label: 'Tazas & Accesorios' }
  ]

  const sortOptions = [
    { value: 'name', label: 'Nombre A-Z' },
    { value: 'price-asc', label: 'Precio: Menor a Mayor' },
    { value: 'price-desc', label: 'Precio: Mayor a Menor' },
    { value: 'newest', label: 'Más Recientes' },
    { value: 'popular', label: 'Más Populares' }
  ]

  useEffect(() => {
    fetchProducts()
  }, [searchTerm, categoryFilter, sortBy, showCustomizable])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        visibility: 'public',
        status: 'active',
        ...(searchTerm && { search: searchTerm }),
        ...(categoryFilter !== 'all' && { category: categoryFilter }),
        ...(showCustomizable && { customizable: 'true' }),
        sortBy
      })

      const response = await fetch(`/api/products/public?${params}`)
      if (!response.ok) throw new Error('Error al cargar productos')
      
      const data = await response.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al cargar los productos')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (product: Product, variantId?: string) => {
    // Si tiene variantes, usar la variante seleccionada
    if (product.variants && product.variants.length > 0) {
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
    } else {
      // Producto sin variantes, usar stock principal
      if (product.stock <= 0) {
        toast.error('Producto agotado')
        return
      }

      addItem({
        id: product.id,
        productId: product.id,
        variantId: undefined,
        name: product.name,
        variant: 'Estándar',
        price: product.basePrice,
        image: product.images[0] || '/placeholder-product.png',
        quantity: 1
      })
    }

    toast.success('Producto añadido al carrito')
  }

  const filteredProducts = products.filter(product => {
    const matchesPrice = product.basePrice >= priceRange.min && product.basePrice <= priceRange.max
    return matchesPrice
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
      
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Nuestros Productos</h1>
          <p className="text-gray-600">Descubre nuestra amplia gama de productos personalizables</p>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
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

            <div className="flex gap-1 border rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
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
                          <Button size="sm" variant="outline" className="bg-white/95 hover:bg-white border-gray-300 text-gray-800 hover:text-gray-900 shadow-lg">
                            <Eye className="w-3 h-3 mr-1" />
                            Ver
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          onClick={() => handleAddToCart(product)}
                          disabled={(product.variants.length > 0 ? product.variants[0]?.stock : product.stock) <= 0}
                          className="bg-primary-600 hover:bg-primary-700 text-white shadow-lg"
                        >
                          <ShoppingCart className="w-3 h-3 mr-1" />
                          Comprar
                        </Button>
                        {product.isCustomizable && (
                          <Link href={`/personalizador?productId=${product.id}`}>
                            <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg">
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
                      {(() => {
                        const availableStock = product.variants.length > 0 ? product.variants[0]?.stock : product.stock
                        return (
                          <>
                            {availableStock <= 5 && availableStock > 0 && (
                              <Badge variant="destructive">Últimas unidades</Badge>
                            )}
                            {availableStock <= 0 && (
                              <Badge variant="secondary">Agotado</Badge>
                            )}
                          </>
                        )
                      })()}
                    </div>

                    {/* Wishlist & Comparison */}
                    <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <WishlistButton productId={product.id} />
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="mb-2">
                      <Badge variant="outline" className="text-xs">
                        {product.category.name}
                      </Badge>
                    </div>
                    
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
                          <Badge variant="outline" className="text-xs">
                            {product.category.name}
                          </Badge>
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
                          disabled={(product.variants.length > 0 ? product.variants[0]?.stock : product.stock) <= 0}
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
            <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
              🛍️
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron productos</h3>
            <p className="text-gray-500 mb-4">
              Intenta cambiar los filtros o el término de búsqueda
            </p>
            <Button onClick={() => {
              setSearchTerm('')
              setCategoryFilter('all')
              setShowCustomizable(false)
              setPriceRange({ min: 0, max: 1000 })
            }}>
              Limpiar Filtros
            </Button>
          </div>
        )}
      </div>
  )
}