'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Star, Heart, ShoppingCart, Eye, ArrowRight, TrendingUp, Flame } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  discountPrice?: number
  image: string
  rating: number
  reviewsCount: number
  salesCount: number
  category: string
  trendingPosition: number
}

export default function TopSellingProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTopSellingProducts()
  }, [])

  const fetchTopSellingProducts = async () => {
    try {
      // Simulamos la carga de productos más vendidos
      // En producción esto vendría de la API
      const mockProducts: Product[] = [
        {
          id: '9',
          name: 'Taza Mágica Cambio Color',
          slug: 'taza-magica-cambio-color',
          price: 32.99,
          discountPrice: 27.99,
          image: '/images/products/taza-magica.jpg',
          rating: 4.9,
          reviewsCount: 342,
          salesCount: 1247,
          category: 'Tazas',
          trendingPosition: 1
        },
        {
          id: '10',
          name: 'Pack Camisetas Familia',
          slug: 'pack-camisetas-familia',
          price: 89.99,
          discountPrice: 74.99,
          image: '/images/products/pack-camisetas-familia.jpg',
          rating: 4.8,
          reviewsCount: 298,
          salesCount: 986,
          category: 'Textil',
          trendingPosition: 2
        },
        {
          id: '11',
          name: 'Invitaciones Boda Elegantes',
          slug: 'invitaciones-boda-elegantes',
          price: 45.99,
          image: '/images/products/invitaciones-boda.jpg',
          rating: 4.9,
          reviewsCount: 456,
          salesCount: 823,
          category: 'Bodas',
          trendingPosition: 3
        },
        {
          id: '12',
          name: 'Pegatinas Personalizadas',
          slug: 'pegatinas-personalizadas',
          price: 19.99,
          discountPrice: 15.99,
          image: '/images/products/pegatinas-personalizadas.jpg',
          rating: 4.7,
          reviewsCount: 523,
          salesCount: 756,
          category: 'Decoración',
          trendingPosition: 4
        },
        {
          id: '13',
          name: 'Llavero Foto Personalizado',
          slug: 'llavero-foto-personalizado',
          price: 12.99,
          image: '/images/products/llavero-foto.jpg',
          rating: 4.6,
          reviewsCount: 689,
          salesCount: 645,
          category: 'Accesorios',
          trendingPosition: 5
        },
        {
          id: '14',
          name: 'Calendario Personalizado 2024',
          slug: 'calendario-personalizado-2024',
          price: 24.99,
          discountPrice: 19.99,
          image: '/images/products/calendario-personalizado.jpg',
          rating: 4.8,
          reviewsCount: 234,
          salesCount: 578,
          category: 'Papelería',
          trendingPosition: 6
        },
        {
          id: '15',
          name: 'Delantal Cocina Personalizado',
          slug: 'delantal-cocina-personalizado',
          price: 28.99,
          image: '/images/products/delantal-cocina.jpg',
          rating: 4.7,
          reviewsCount: 167,
          salesCount: 467,
          category: 'Hogar',
          trendingPosition: 7
        },
        {
          id: '16',
          name: 'Puzzle Foto Personalizado',
          slug: 'puzzle-foto-personalizado',
          price: 35.99,
          discountPrice: 29.99,
          image: '/images/products/puzzle-foto.jpg',
          rating: 4.9,
          reviewsCount: 145,
          salesCount: 389,
          category: 'Juegos',
          trendingPosition: 8
        }
      ]

      setProducts(mockProducts)
    } catch (error) {
      console.error('Error fetching top selling products:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => `${price.toFixed(2)}€`

  const formatSalesCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`
    }
    return count.toString()
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ))
  }

  const getTrendingIcon = (position: number) => {
    if (position <= 3) {
      return <Flame className="w-4 h-4 text-red-500" />
    }
    return <TrendingUp className="w-4 h-4 text-orange-500" />
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
          {products.map((product) => (
            <Card key={product.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 relative">
              {/* Trending Position Badge */}
              <div className="absolute top-0 left-0 z-10">
                <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-3 py-2 rounded-br-lg flex items-center gap-1">
                  {getTrendingIcon(product.trendingPosition)}
                  #{product.trendingPosition}
                </div>
              </div>

              <div className="relative">
                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-product.png'
                    }}
                  />
                  
                  {/* Discount Badge */}
                  {product.discountPrice && (
                    <div className="absolute top-3 right-3">
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        -{Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
                      </span>
                    </div>
                  )}

                  {/* Sales Count Badge */}
                  <div className="absolute bottom-3 left-3">
                    <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {formatSalesCount(product.salesCount)} vendidos
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
                  <div className="text-xs text-red-600 font-medium mb-1 uppercase tracking-wide">
                    {product.category}
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                    {product.name}
                  </h3>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex gap-0.5">
                      {renderStars(product.rating)}
                    </div>
                    <span className="text-sm text-gray-500">
                      ({product.reviewsCount})
                    </span>
                  </div>
                  
                  {/* Price */}
                  <div className="flex items-center gap-2">
                    {product.discountPrice ? (
                      <>
                        <span className="text-lg font-bold text-red-600">
                          {formatPrice(product.discountPrice)}
                        </span>
                        <span className="text-sm text-gray-400 line-through">
                          {formatPrice(product.price)}
                        </span>
                      </>
                    ) : (
                      <span className="text-lg font-bold text-gray-900">
                        {formatPrice(product.price)}
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