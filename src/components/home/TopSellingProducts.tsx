'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingCart, Eye, ArrowRight, TrendingUp, Flame } from 'lucide-react'
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

export default function TopSellingProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTopSellingProducts()
  }, [])

  const fetchTopSellingProducts = async () => {
    try {
      const response = await fetch('/api/products/public?topSelling=true&limit=8')

      if (!response.ok) {
        throw new Error('Error al obtener productos top ventas')
      }

      const data = await response.json()
      setProducts(data.products)
    } catch (error) {
      console.error('Error fetching top selling products:', error)
      setProducts([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => `${price.toFixed(2)}€`

  const getProductImage = (product: Product) => {
    if (product.images && product.images.length > 0) {
      return product.images[0]
    }
    return '/placeholder-product.png'
  }

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-b from-orange-50 to-white">
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
    <section className="py-16 bg-gradient-to-b from-orange-50 to-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Flame className="w-6 h-6 text-red-500" />
            <span className="text-red-600 font-semibold text-sm uppercase tracking-wider">
              Más Vendidos
            </span>
            <Flame className="w-6 h-6 text-red-500" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            <span className="text-red-600">Top</span> Ventas
          </h2>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Los productos más populares elegidos por miles de clientes satisfechos. ¡Únete a la tendencia!
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {products.map((product, index) => (
            <Card key={product.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 relative">
              {/* Trending Position Badge */}
              <div className="absolute top-0 left-0 z-10">
                <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-3 py-2 rounded-br-lg flex items-center gap-1">
                  <Flame className="w-4 h-4" />
                  #{index + 1}
                </div>
              </div>

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

                  {/* Discount Badge */}
                  {product.hasDiscount && product.discountPercentage && (
                    <div className="absolute top-3 right-3">
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        -{product.discountPercentage}%
                      </span>
                    </div>
                  )}

                  {/* Top Selling Badge */}
                  <div className="absolute bottom-3 left-3">
                    <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Más Vendido
                    </span>
                  </div>

                  {/* Quick Actions */}
                  <div className="absolute top-12 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
                  <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white px-4 rounded-full shadow-lg">
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      Comprar
                    </Button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  {product.category && (
                    <div className="text-xs text-red-600 font-medium mb-1 uppercase tracking-wide">
                      {product.category.name}
                    </div>
                  )}

                  <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-red-600 transition-colors">
                    {product.name}
                  </h3>

                  {/* Price */}
                  <div className="flex items-center gap-2">
                    {product.hasDiscount && product.comparePrice ? (
                      <>
                        <span className="text-lg font-bold text-red-600">
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
          <Link href="/categories/top-ventas">
            <Button 
              size="lg" 
              className="group bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-8 py-3 rounded-full transition-all duration-300 hover:shadow-lg hover:scale-105"
            >
              <Flame className="mr-2 w-5 h-5" />
              Ver Todos los Más Vendidos
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}