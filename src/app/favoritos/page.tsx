'use client'

import { useState, useEffect } from 'react'
import { Heart, ShoppingCart, Eye, Trash2, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useWishlist } from '@/components/ui/Wishlist'
import { useCartStore } from '@/lib/store'
import { ProductCardSkeleton } from '@/components/ui/LoadingSkeleton'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'react-hot-toast'

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
  variants: Array<{
    id: string
    name: string
    price: number
    stock: number
  }>
  isCustomizable: boolean
}

export default function FavoritosPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { wishlist } = useWishlist()
  const { addItem } = useCartStore()

  useEffect(() => {
    loadWishlistProducts()
  }, [wishlist])

  const loadWishlistProducts = async () => {
    if (wishlist.length === 0) {
      setProducts([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const productPromises = wishlist.map(async (id: string) => {
        const response = await fetch(`/api/products/${id}`)
        if (response.ok) {
          return response.json()
        }
        return null
      })

      const results = await Promise.all(productPromises)
      setProducts(results.filter(Boolean))
    } catch (error) {
      console.error('Error loading wishlist products:', error)
      toast.error('Error al cargar tus productos favoritos')
    } finally {
      setLoading(false)
    }
  }

  const removeFromWishlist = (productId: string) => {
    const updatedWishlist = wishlist.filter(id => id !== productId)
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist))
    setProducts(products.filter(p => p.id !== productId))
    window.dispatchEvent(new CustomEvent('wishlistUpdated'))
    toast.success('Eliminado de favoritos')
  }

  const handleAddToCart = (product: Product) => {
    const variant = product.variants[0]
    if (!variant || variant.stock <= 0) {
      toast.error('Producto no disponible')
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

  const clearWishlist = () => {
    localStorage.setItem('wishlist', JSON.stringify([]))
    setProducts([])
    window.dispatchEvent(new CustomEvent('wishlistUpdated'))
    toast.success('Lista de favoritos limpiada')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Favoritos</h1>
            <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Heart className="w-8 h-8 text-red-500 fill-current" />
                Mis Favoritos
              </h1>
              <p className="text-gray-600">
                {products.length} producto{products.length !== 1 ? 's' : ''} en tu lista de favoritos
              </p>
            </div>
            
            {products.length > 0 && (
              <Button 
                variant="outline" 
                onClick={clearWishlist}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Limpiar lista
              </Button>
            )}
          </div>
        </div>

        {products.length === 0 ? (
          /* Empty State */
          <div className="text-center max-w-md mx-auto py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Tu lista de favoritos está vacía
            </h2>
            <p className="text-gray-600 mb-8">
              Explora nuestro catálogo y guarda los productos que más te gusten
            </p>
            <div className="space-y-3">
              <Link href="/productos">
                <Button className="w-full">
                  <Package className="w-4 h-4 mr-2" />
                  Explorar Productos
                </Button>
              </Link>
              <Link href="/personalizador">
                <Button variant="outline" className="w-full">
                  🎨 Crear Diseño Personalizado
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white">
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  <Image
                    src={product.images[0] || '/placeholder-product.png'}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  
                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      <Link href={`/productos/${product.id}`}>
                        <Button size="sm" className="bg-white/95 hover:bg-white text-gray-800 shadow-lg">
                          <Eye className="w-3 h-3 mr-1" />
                          Ver
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        onClick={() => handleAddToCart(product)}
                        disabled={!product.variants[0] || product.variants[0].stock <= 0}
                        className="bg-primary-600 hover:bg-primary-700 text-white shadow-lg"
                      >
                        <ShoppingCart className="w-3 h-3 mr-1" />
                        Comprar
                      </Button>
                    </div>
                  </div>

                  {/* Remove from Wishlist */}
                  <button
                    onClick={() => removeFromWishlist(product.id)}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110 hover:bg-red-600"
                    title="Eliminar de favoritos"
                  >
                    <Heart className="w-4 h-4 fill-current" />
                  </button>

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {product.isCustomizable && (
                      <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
                        Personalizable
                      </span>
                    )}
                    {product.variants[0]?.stock <= 5 && product.variants[0]?.stock > 0 && (
                      <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                        Últimas unidades
                      </span>
                    )}
                    {(!product.variants[0] || product.variants[0].stock <= 0) && (
                      <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded-full">
                        Agotado
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="mb-2">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {product.category.name}
                    </span>
                  </div>
                  
                  <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                    {product.name}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xl font-bold text-primary-600">
                        {product.basePrice.toFixed(2)}€
                      </span>
                      {product.variants.length > 1 && (
                        <span className="text-sm text-gray-500 ml-1">desde</span>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Link href={`/productos/${product.id}`}>
                        <Button size="sm" variant="outline">
                          <Eye className="w-3 h-3" />
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        onClick={() => handleAddToCart(product)}
                        disabled={!product.variants[0] || product.variants[0].stock <= 0}
                      >
                        <ShoppingCart className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Recommendations */}
        {products.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              También te puede interesar
            </h2>
            <div className="text-center">
              <Link href="/productos">
                <Button variant="outline" size="lg">
                  <Package className="w-5 h-5 mr-2" />
                  Ver más productos
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}