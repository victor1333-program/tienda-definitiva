"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Package, ArrowLeft, Check } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface Product {
  id: string
  name: string
  slug: string
  images?: string[]
  category?: {
    id: string
    name: string
    slug: string
  }
}

export default function NuevoProductoPersonalizable() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    const filtered = products.filter(product => {
      const nameMatch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
      const categoryMatch = product.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
      return nameMatch || categoryMatch
    })
    setFilteredProducts(filtered)
  }, [products, searchTerm])

  const fetchProducts = async () => {
    try {
      console.log('Fetching products from /api/products/public...')
      
      // Obtener todos los productos usando la API pública
      const productsResponse = await fetch('/api/products/public?limit=100')
      console.log('Products response received:', {
        status: productsResponse.status,
        ok: productsResponse.ok,
        headers: Object.fromEntries(productsResponse.headers.entries())
      })
      
      const productsData = await productsResponse.json()
      console.log('Products data parsed:', {
        type: typeof productsData,
        isObject: typeof productsData === 'object',
        isNull: productsData === null,
        keys: productsData ? Object.keys(productsData) : 'null',
        hasProducts: !!productsData?.products,
        productsLength: productsData?.products?.length || 0,
        fullData: productsData
      })
      
      // Obtener productos que ya tienen personalización configurada
      let sidesData = { success: false, data: [] }
      try {
        const sidesResponse = await fetch('/api/personalization/sides')
        if (sidesResponse.ok) {
          sidesData = await sidesResponse.json()
        }
      } catch (error) {
        console.log('Could not fetch personalization sides (this is ok if none exist yet):', error)
      }
      
      if (productsResponse.ok && productsData && productsData.products && Array.isArray(productsData.products)) {
        let availableProducts = productsData.products
        console.log('Found', availableProducts.length, 'products')
        
        // Si hay productos con personalización, excluirlos de la lista
        if (sidesData.success && sidesData.data) {
          const personalizableProductIds = new Set(
            sidesData.data.map((side: any) => side.product.id)
          )
          
          // Filtrar productos que NO estén ya personalizados
          availableProducts = availableProducts.filter(
            (product: Product) => !personalizableProductIds.has(product.id)
          )
          
          console.log('After filtering out personalized products:', availableProducts.length)
        }
        
        setProducts(availableProducts)
      } else {
        console.error('Error en respuesta:', {
          status: productsResponse.status,
          ok: productsResponse.ok,
          dataType: typeof productsData,
          data: productsData
        })
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const getProductImage = (product: Product) => {
    try {
      if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        return product.images[0]
      }
    } catch (error) {
      console.error('Error parsing product images:', error)
    }
    return '/placeholder-product.png'
  }

  const handleAddProduct = async () => {
    if (!selectedProduct) return

    setSaving(true)
    try {
      // Aquí añadiremos la lógica para marcar el producto como personalizable
      // Por ahora redirigimos a la configuración
      router.push(`/admin/personalizacion/productos/${selectedProduct.id}`)
    } catch (error) {
      console.error('Error adding personalizable product:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Añadir Producto Personalizable</h1>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando productos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/admin/personalizacion/productos">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Añadir Producto Personalizable</h1>
            <p className="text-gray-600 mt-1">Selecciona un producto de tu tienda para hacerlo personalizable</p>
          </div>
        </div>
        {selectedProduct && (
          <Button onClick={handleAddProduct} disabled={saving}>
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Check className="h-4 w-4 mr-2" />
            )}
            Configurar Producto
          </Button>
        )}
      </div>

      {/* Selected Product */}
      {selectedProduct && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800">Producto Seleccionado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 relative bg-white rounded-lg overflow-hidden">
                <Image
                  src={getProductImage(selectedProduct)}
                  alt={selectedProduct.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-orange-900">{selectedProduct.name}</h3>
                {selectedProduct.category && (
                  <p className="text-sm text-orange-700">{selectedProduct.category.name}</p>
                )}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedProduct(null)}
              >
                Cambiar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Producto</CardTitle>
          <CardDescription>
            Busca y selecciona el producto que quieres hacer personalizable
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar productos por nombre o categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <Card 
            key={product.id} 
            className={`hover:shadow-lg transition-all cursor-pointer ${
              selectedProduct?.id === product.id 
                ? 'ring-2 ring-orange-500 bg-orange-50' 
                : 'hover:bg-gray-50'
            }`}
            onClick={() => setSelectedProduct(product)}
          >
            <CardHeader className="p-4">
              <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden mb-3">
                <Image
                  src={getProductImage(product)}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
                {selectedProduct?.id === product.id && (
                  <div className="absolute top-2 right-2 bg-orange-500 text-white rounded-full p-1">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>
              <div>
                <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                {product.category && (
                  <CardDescription>{product.category.name}</CardDescription>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="p-4 pt-0">
              <Button 
                variant={selectedProduct?.id === product.id ? "default" : "outline"}
                size="sm"
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedProduct(product)
                }}
              >
                <Package className="h-4 w-4 mr-2" />
                {selectedProduct?.id === product.id ? 'Seleccionado' : 'Seleccionar'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No se encontraron productos disponibles' : 'No hay productos disponibles para personalizar'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? 'Prueba con otros términos de búsqueda entre los productos que aún no tienen personalización'
                : 'Todos los productos de tu tienda ya tienen personalización configurada, o no tienes productos creados'
              }
            </p>
            {!searchTerm && (
              <div className="space-y-4">
                <Button asChild>
                  <Link href="/admin/products">
                    <Package className="h-4 w-4 mr-2" />
                    Ver Todos los Productos
                  </Link>
                </Button>
                <div className="text-sm text-gray-500">
                  <p>Si necesitas más productos para personalizar:</p>
                  <Button asChild variant="outline" className="mt-2">
                    <Link href="/admin/products/new">
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