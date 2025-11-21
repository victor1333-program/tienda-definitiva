'use client'

import { useState, useEffect, memo, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingCart, Eye, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface Product {
  id: string
  name: string
  slug: string
  basePrice: number
  comparePrice?: number | null
  images: string[]
  featured: boolean
  topSelling: boolean
  category: {
    id: string
    name: string
    slug: string
  } | null
  hasDiscount: boolean
  discountPercentage: number | null
}

const FeaturedProducts = memo(function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedProducts()
  }, [])

  const fetchFeaturedProducts = useCallback(async () => {
    try {
      const response = await fetch('/api/products/public?featured=true&limit=8')

      if (!response.ok) {
        throw new Error('Error al obtener productos destacados')
      }

      const data = await response.json()
      setProducts(data.products)
    } catch (error) {
      console.error('Error fetching featured products:', error)
      setProducts([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }, [])

  const formatPrice = useCallback((price: number) => `${price.toFixed(2)}€`, [])

  const getProductImage = useCallback((product: Product) => {
    if (product.images && product.images.length > 0) {
      return product.images[0]
    }
    return '/placeholder-product.png'
  }, [])

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="h-8 bg-gray-200 rounded-lg w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-80 animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-orange-500"></div>
            <span className="text-orange-600 font-semibold text-sm uppercase tracking-wider">
              Destacados
            </span>
            <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-orange-500"></div>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Productos <span className="text-orange-600">Destacados</span>
          </h2>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Descubre nuestra selección especial de productos personalizados que han conquistado el corazón de nuestros clientes
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {products.map((product) => (
            <Card key={product.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="relative">
                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <Image
                    src={getProductImage(product)}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-product.png'
                    }}
                  />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {product.featured && (
                      <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        DESTACADO
                      </span>
                    )}
                    {product.topSelling && (
                      <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        TOP VENTAS
                      </span>
                    )}
                    {product.hasDiscount && product.discountPercentage && (
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        -{product.discountPercentage}%
                      </span>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110">
                      <Heart className="w-4 h-4 text-gray-600 hover:text-red-500" />
                    </button>
                    <Link href={`/products/${product.slug}`}>
                      <button className="bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110">
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                    </Link>
                  </div>

                  {/* Quick Add to Cart */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white px-6 rounded-full shadow-lg">
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      Añadir
                    </Button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  {product.category && (
                    <div className="text-xs text-orange-600 font-medium mb-1 uppercase tracking-wide">
                      {product.category.name}
                    </div>
                  )}

                  <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-orange-600 transition-colors">
                    {product.name}
                  </h3>

                  {/* Price */}
                  <div className="flex items-center gap-2">
                    {product.hasDiscount && product.comparePrice ? (
                      <>
                        <span className="text-lg font-bold text-orange-600">
                          {formatPrice(product.basePrice)}
                        </span>
                        <span className="text-sm text-gray-400 line-through">
                          {formatPrice(product.comparePrice)}
                        </span>
                      </>
                    ) : (
                      <span className="text-lg font-bold text-gray-900">
                        {formatPrice(product.basePrice)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link href="/categories/destacados">
            <Button 
              size="lg" 
              variant="outline"
              className="group border-2 border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white px-8 py-3 rounded-full transition-all duration-300 hover:shadow-lg hover:scale-105"
            >
              Ver Todos los Destacados
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
})

export default FeaturedProducts