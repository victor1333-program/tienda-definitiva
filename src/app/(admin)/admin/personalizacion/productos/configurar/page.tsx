"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Search, Settings, Grid3x3, Package, CheckCircle, Plus } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { toast } from "react-hot-toast"

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

export default function ConfigurarProductoPersonalizacion() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    const filtered = products.filter(product => {
      const nameMatch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
      const categoryMatch = product.categories?.some(cat => 
        cat.category.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      return nameMatch || categoryMatch
    })
    setFilteredProducts(filtered)
  }, [products, searchTerm])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products?limit=100')
      const data = await response.json()
      
      if (response.ok && data.products) {
        setProducts(data.products || [])
      } else {
        console.error('Error en respuesta:', data)
        toast.error('Error al cargar productos')
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Error al cargar productos')
    } finally {
      setLoading(false)
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
      return { status: 'Sin configurar', color: 'bg-gray-500', count: 0, ready: false }
    } else if (sidesCount === 1) {
      return { status: 'Básica', color: 'bg-blue-500', count: sidesCount, ready: true }
    } else {
      return { status: 'Avanzada', color: 'bg-green-500', count: sidesCount, ready: true }
    }
  }

  const handleConfigureProduct = (productId: string) => {
    router.push(`/admin/personalizacion/productos/${productId}`)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/admin/personalizacion/productos">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Configurar Producto para Personalización</h1>
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
      <div className="flex items-center gap-4">
        <Button variant="outline" asChild>
          <Link href="/admin/personalizacion/productos">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Configurar Producto para Personalización</h1>
          <p className="text-gray-600 mt-1">Selecciona un producto para configurar sus lados y áreas de impresión</p>
        </div>
      </div>

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900 flex items-center gap-2">
            <Settings className="h-5 w-5" />
            ¿Cómo configurar personalización?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-blue-800">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
              <p><strong>Selecciona un producto</strong> de la lista de abajo</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
              <p><strong>Define los lados</strong> del producto (frontal, trasero, lateral, etc.)</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
              <p><strong>Configura las áreas de impresión</strong> en cada lado</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
              <p><strong>Establece permisos</strong> de qué se puede personalizar en cada área</p>
            </div>
          </div>
        </CardContent>
      </Card>

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
            <Card key={product.id} className="hover:shadow-lg transition-shadow cursor-pointer">
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
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      {personalization.count} lado{personalization.count !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600">
                  {personalization.ready 
                    ? `Producto ya configurado con ${personalization.count} lado${personalization.count !== 1 ? 's' : ''}`
                    : 'Producto sin configurar para personalización'
                  }
                </p>

                {/* Action Button */}
                <Button
                  onClick={() => handleConfigureProduct(product.id)}
                  className="w-full"
                  variant={personalization.ready ? "outline" : "default"}
                >
                  {personalization.ready ? (
                    <>
                      <Settings className="h-4 w-4 mr-2" />
                      Modificar Configuración
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Configurar Personalización
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No se encontraron productos' : 'No hay productos disponibles'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? 'Prueba con otros términos de búsqueda'
                : 'Necesitas tener productos creados antes de poder configurar personalización'
              }
            </p>
            {!searchTerm && (
              <Button asChild>
                <Link href="/admin/products/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Producto
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stats Footer */}
      {products.length > 0 && (
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">{products.length}</div>
                <p className="text-sm text-gray-600">Total Productos</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {products.filter(p => (p.sides?.length || 0) > 0).length}
                </div>
                <p className="text-sm text-gray-600">Ya Configurados</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {products.filter(p => (p.sides?.length || 0) === 0).length}
                </div>
                <p className="text-sm text-gray-600">Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}