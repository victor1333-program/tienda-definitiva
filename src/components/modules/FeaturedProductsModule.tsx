"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Package, Star, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Product {
  id: string
  name: string
  slug: string
  basePrice: number
  image?: string
  description?: string
  isActive: boolean
  category?: {
    name: string
  }
}

interface FeaturedProductsProps {
  title: string
  subtitle: string
  productIds: string[]
  layout: 'carousel' | 'grid'
  itemsPerRow: 2 | 3 | 4 | 5
  showPrice: boolean
  showAddToCart: boolean
  showRating?: boolean
  maxProducts?: number
  sortBy?: 'manual' | 'price-asc' | 'price-desc' | 'name'
}

export default function FeaturedProductsModule(props: FeaturedProductsProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products')
        if (response.ok) {
          const allProducts = await response.json()
          let selectedProducts = allProducts.filter((prod: Product) => 
            props.productIds.includes(prod.id)
          )

          // Aplicar ordenamiento
          if (props.sortBy) {
            switch (props.sortBy) {
              case 'name':
                selectedProducts.sort((a: Product, b: Product) => a.name.localeCompare(b.name))
                break
              case 'price-asc':
                selectedProducts.sort((a: Product, b: Product) => a.basePrice - b.basePrice)
                break
              case 'price-desc':
                selectedProducts.sort((a: Product, b: Product) => b.basePrice - a.basePrice)
                break
              // 'manual' mantiene el orden original
            }
          }

          setProducts(selectedProducts)
        }
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setLoading(false)
      }
    }

    if (props.productIds.length > 0) {
      fetchProducts()
    } else {
      setLoading(false)
    }
  }, [props.productIds, props.sortBy])

  const handleAddToCart = (productId: string) => {
    // Aquí implementarías la lógica para agregar al carrito
    console.log('Add to cart:', productId)
  }

  if (loading) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto mb-8"></div>
            <div className={`grid gap-6 ${
              props.itemsPerRow === 2 ? 'grid-cols-2' :
              props.itemsPerRow === 3 ? 'grid-cols-3' :
              props.itemsPerRow === 4 ? 'grid-cols-4' :
              'grid-cols-5'
            }`}>
              {[...Array(props.itemsPerRow * 2)].map((_, i) => (
                <div key={i} className="bg-gray-300 aspect-square rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (!products.length) {
    return null
  }

  const gridClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'
  }

  const displayedProducts = products.slice(0, props.maxProducts || 12)

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {props.title}
          </h2>
          {props.subtitle && (
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {props.subtitle}
            </p>
          )}
        </div>

        {/* Products Grid/Carousel */}
        <div className={`${
          props.layout === 'carousel' 
            ? 'flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory'
            : `grid gap-6 ${gridClasses[props.itemsPerRow]}`
        }`}>
          {displayedProducts.map((product) => (
            <div
              key={product.id}
              className={`group ${
                props.layout === 'carousel' ? 'flex-none w-72 snap-start' : ''
              }`}
            >
              <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group-hover:transform group-hover:scale-105">
                {/* Product Image */}
                <Link href={`/productos/${product.id}`} className="block">
                  <div className="aspect-square overflow-hidden bg-gray-100">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={400}
                        height={400}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                        <Package className="w-16 h-16 text-blue-500" />
                      </div>
                    )}
                  </div>
                </Link>

                {/* Product Info */}
                <div className="p-6">
                  <Link href={`/productos/${product.id}`}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                      {product.name}
                    </h3>
                  </Link>

                  {product.category && (
                    <p className="text-sm text-gray-500 mb-2">
                      {product.category.name}
                    </p>
                  )}

                  {/* Rating */}
                  {props.showRating && (
                    <div className="flex items-center gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className="w-4 h-4 fill-yellow-400 text-yellow-400" 
                        />
                      ))}
                      <span className="text-xs text-gray-500 ml-1">(4.5)</span>
                    </div>
                  )}

                  {/* Price and Actions */}
                  <div className="flex items-center justify-between">
                    {props.showPrice && (
                      <div className="flex flex-col">
                        <span className="text-2xl font-bold text-orange-600">
                          €{product.basePrice.toFixed(2)}
                        </span>
                      </div>
                    )}

                    {props.showAddToCart && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAddToCart(product.id)}
                          className="bg-orange-500 hover:bg-orange-600 text-white"
                        >
                          <ShoppingCart className="w-4 h-4 mr-1" />
                          Agregar
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex gap-2">
                      <Link
                        href={`/productos/${product.id}`}
                        className="flex-1 text-center py-2 px-4 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Ver Detalles
                      </Link>
                      {props.showAddToCart && (
                        <button
                          onClick={() => handleAddToCart(product.id)}
                          className="flex-1 text-center py-2 px-4 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors"
                        >
                          Comprar Ahora
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center mt-12">
          <Link
            href="/productos"
            className="inline-flex items-center px-6 py-3 text-lg font-semibold text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
          >
            Ver Todos los Productos
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}