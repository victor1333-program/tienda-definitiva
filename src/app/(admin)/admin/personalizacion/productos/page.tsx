"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Settings, Grid3x3, Eye, Edit, Trash2, AlertTriangle, Palette } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import useSWR from "swr"
import fetcher from "@/lib/fetcher"

interface Product {
  id: string
  name: string
  slug: string
  images?: string
  categories?: Array<{
    category: {
      id: string
      name: string
    }
  }>
  sides?: any[]
}

export default function PersonalizacionProductos() {
  const [searchTerm, setSearchTerm] = useState("")
  const [deletingProduct, setDeletingProduct] = useState<string | null>(null)
  
  // Usar SWR para obtener los datos de manera consistente
  const { data, error, isLoading, mutate } = useSWR('/api/personalization/sides', fetcher)
  
  // Procesar los datos para crear lista de productos únicos
  const products = useMemo(() => {
    if (!data?.success || !data?.data || !Array.isArray(data.data)) {
      return []
    }
    
    // Agrupar lados por producto para crear lista de productos únicos
    const productMap = new Map<string, Product>()
    
    data.data.forEach((side: any) => {
      const productId = side.product.id
      const productName = side.product.name
      
      if (!productMap.has(productId)) {
        productMap.set(productId, {
          id: productId,
          name: productName,
          slug: side.product.slug || '',
          images: side.product.images || '[]', // Usar las imágenes del producto
          categories: [],
          sides: []
        })
      }
      
      // Agregar el lado al producto
      productMap.get(productId)!.sides!.push(side)
    })
    
    return Array.from(productMap.values())
  }, [data])

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const nameMatch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
      const categoryMatch = product.categories?.some(cat => 
        cat.category.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      return nameMatch || categoryMatch
    })
  }, [products, searchTerm])

  // Mostrar mensaje de error si hay problemas
  if (error) {
    console.error('Error loading products:', error)
  }

  // Función para eliminar un producto personalizable (eliminar sus lados y áreas)
  const handleDeleteProduct = async (productId: string) => {
    try {
      setDeletingProduct(productId)
      
      // Eliminar todos los lados del producto
      const response = await fetch(`/api/personalization/sides?productId=${productId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al eliminar el producto personalizable')
      }

      // Recargar los datos para actualizar la lista
      await mutate()
      
      // Mostrar mensaje de éxito
      alert(result.message || 'Configuración de personalización eliminada exitosamente')
      
    } catch (error) {
      console.error('Error deleting product:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar el producto personalizable'
      alert(errorMessage)
    } finally {
      setDeletingProduct(null)
    }
  }

  const getProductImage = (product: Product) => {
    try {
      if (product.images) {
        const images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images
        if (Array.isArray(images) && images.length > 0) {
          return images[0]
        }
      }
    } catch (error) {
      console.error('Error parsing product images:', error)
    }
    return '/placeholder-product.png'
  }

  const getPersonalizationStatus = (product: Product) => {
    const sidesCount = product.sides?.length || 0
    if (sidesCount === 0) {
      return { status: 'Sin configurar', color: 'bg-gray-500', count: 0 }
    } else if (sidesCount === 1) {
      return { status: 'Básica', color: 'bg-blue-500', count: sidesCount }
    } else {
      return { status: 'Avanzada', color: 'bg-green-500', count: sidesCount }
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Productos - Personalización</h1>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando productos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Productos - Personalización</h1>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-red-500 mb-4">Error al cargar los productos</div>
            <p className="text-gray-600">{error.message}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
            >
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Productos Personalizables</h1>
          <p className="text-gray-600 mt-1">Productos que tienen configurada personalización con lados y áreas de impresión</p>
        </div>
        <Button asChild>
          <Link href="/admin/products">
            <Plus className="h-4 w-4 mr-2" />
            Seleccionar Producto para Personalizar
          </Link>
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar productos por nombre o categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
      </Card>


      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => {
          const personalization = getPersonalizationStatus(product)
          
          return (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="p-4">
                <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden mb-3">
                  <Image
                    src={getProductImage(product)}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                  {product.categories && product.categories.length > 0 && (
                    <CardDescription>{product.categories[0].category.name}</CardDescription>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="p-4 pt-0 space-y-3">
                {/* Status Badge */}
                <div className="flex items-center justify-between">
                  <Badge className={`${personalization.color} text-white`}>
                    {personalization.status}
                  </Badge>
                  {personalization.count > 0 && (
                    <span className="text-sm text-gray-600">
                      {personalization.count} lado{personalization.count !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Link href={`/admin/personalizacion/productos/${product.id}`}>
                      <Palette className="h-4 w-4 mr-1" />
                      Configurar
                    </Link>
                  </Button>
                  
                  <div className="flex gap-1">
                    {personalization.count > 0 && (
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                      >
                        <Link href={`/admin/personalizacion/productos/${product.id}/preview`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      disabled={deletingProduct === product.id}
                      onClick={() => {
                        if (confirm(`¿Eliminar configuración de personalización para ${product.name}?`)) {
                          handleDeleteProduct(product.id)
                        }
                      }}
                    >
                      {deletingProduct === product.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Grid3x3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No se encontraron productos personalizables' : 'No hay productos configurados para personalización'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? 'Prueba con otros términos de búsqueda entre los productos que tienen personalización configurada'
                : 'Para que un producto aparezca aquí, debe tener al menos un lado configurado con áreas de impresión'
              }
            </p>
            {!searchTerm && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Button asChild className="w-full">
                    <Link href="/admin/products">
                      <Palette className="h-4 w-4 mr-2" />
                      Ver Todos los Productos
                    </Link>
                  </Button>
                  <p className="text-sm text-gray-500">
                    Ve a la lista de productos y haz clic en el botón naranja ⚙️ para configurar personalización. Se creará automáticamente un lado frontal para comenzar.
                  </p>
                </div>
                
                <div className="border-t pt-4">
                  <Button asChild variant="outline">
                    <Link href="/admin/products/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Nuevo Producto
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}