"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import useSWR from "swr"
import { 
  ArrowLeft,
  Plus, 
  Search, 
  Eye, 
  Trash2,
  Package,
  Star,
  TrendingUp,
  Shield,
  AlertCircle,
  CheckCircle,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-hot-toast"
import fetcher from "@/lib/fetcher"
import Link from "next/link"

interface Product {
  id: string
  name: string
  slug: string
  description: string
  basePrice: number
  isActive: boolean
  isFeatured: boolean
  images: string[]
  _count: {
    orderItems: number
  }
}

interface Category {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  isSystem: boolean
  categoryType: string
}

interface ProductInCategory {
  id: string
  productId: string
  categoryId: string
  product: Product
}

const iconMap: { [key: string]: any } = {
  Star, TrendingUp, Package, Shield
}

export default function CategoryProductsPage() {
  const params = useParams()
  const router = useRouter()
  const categoryId = params.id as string
  
  const [search, setSearch] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [availableProducts, setAvailableProducts] = useState<Product[]>([])
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])

  // Cargar información de la categoría
  const { data: category, error: categoryError } = useSWR(
    categoryId ? `/api/categories/${categoryId}` : null,
    fetcher
  )

  // Cargar productos de la categoría
  const { data: categoryProducts, error: productsError, mutate } = useSWR(
    categoryId ? `/api/categories/${categoryId}/products` : null,
    fetcher
  )

  const products: ProductInCategory[] = categoryProducts || []

  // Cargar productos disponibles para añadir
  useEffect(() => {
    if (showAddModal) {
      fetch('/api/products?includeInactive=false')
        .then(res => res.json())
        .then(data => {
          // Filtrar productos que ya están en la categoría
          const currentProductIds = products.map(p => p.productId)
          const available = data.filter((product: Product) => 
            !currentProductIds.includes(product.id)
          )
          setAvailableProducts(available)
        })
        .catch(error => {
          console.error('Error loading available products:', error)
          toast.error('Error al cargar productos disponibles')
        })
    }
  }, [showAddModal, products])

  const handleAddProducts = async () => {
    if (selectedProducts.length === 0) {
      toast.error('Selecciona al menos un producto')
      return
    }

    try {
      const response = await fetch(`/api/categories/${categoryId}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds: selectedProducts })
      })

      if (response.ok) {
        toast.success(`${selectedProducts.length} productos añadidos`)
        setShowAddModal(false)
        setSelectedProducts([])
        mutate()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al añadir productos')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al añadir productos')
    }
  }

  const handleRemoveProduct = async (productCategoryId: string) => {
    if (!confirm('¿Estás seguro de que quieres quitar este producto de la categoría?')) {
      return
    }

    try {
      const response = await fetch(`/api/categories/${categoryId}/products/${productCategoryId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Producto removido de la categoría')
        mutate()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al remover producto')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al remover producto')
    }
  }

  const getCategoryIcon = (category: Category) => {
    const IconComponent = iconMap[category.icon] || Package
    return IconComponent
  }

  const getCategoryTypeLabel = (categoryType: string) => {
    switch (categoryType) {
      case 'FEATURED':
        return 'Productos Destacados'
      case 'TOP_SALES':
        return 'Top Ventas'
      case 'SPECIAL':
        return 'Especial'
      default:
        return 'Regular'
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  if (categoryError || productsError) {
    return (
      <div className="p-6">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar datos</h3>
          <p className="text-gray-600">Intenta recargar la página</p>
        </div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  const Icon = getCategoryIcon(category)

  const filteredProducts = products.filter(item =>
    item.product.name.toLowerCase().includes(search.toLowerCase()) ||
    item.product.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${category.isSystem ? 'bg-blue-100' : 'bg-gray-100'}`}>
              <Icon className={`w-6 h-6 ${category.isSystem ? 'text-blue-600' : 'text-gray-600'}`} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
              <p className="text-gray-600">{category.description}</p>
            </div>
          </div>
        </div>

        {category.isSystem && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 text-blue-800 mb-2">
              <Shield className="w-4 h-4" />
              <span className="font-medium">Categoría del Sistema</span>
            </div>
            <p className="text-sm text-blue-700">
              Esta es una categoría especial del tipo "{getCategoryTypeLabel(category.categoryType)}". 
              Puedes añadir y quitar productos, pero no eliminar la categoría.
            </p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-gray-600" />
            <span className="text-lg font-medium">{products.length} productos</span>
          </div>
          <Button 
            onClick={() => setShowAddModal(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Añadir Productos
          </Button>
        </div>
      </div>

      {/* Búsqueda */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Buscar productos en esta categoría..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de productos */}
      <Card>
        <CardHeader>
          <CardTitle>Productos en {category.name}</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {search ? 'No se encontraron productos' : 'No hay productos en esta categoría'}
              </h3>
              <p className="text-gray-600">
                {search ? 'Intenta con otros términos de búsqueda' : 'Añade productos para comenzar'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Producto</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Precio Base</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Ventas</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Estado</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            {item.product.images.length > 0 ? (
                              <img 
                                src={item.product.images[0]} 
                                alt={item.product.name}
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                            ) : (
                              <Package className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{item.product.name}</p>
                            <p className="text-sm text-gray-600 truncate max-w-xs">
                              {item.product.description}
                            </p>
                            {item.product.isFeatured && (
                              <Badge className="mt-1 bg-yellow-100 text-yellow-800">
                                <Star className="w-3 h-3 mr-1" />
                                Destacado
                              </Badge>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold">
                          {formatPrice(item.product.basePrice)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600">
                          {item.product._count.orderItems} ventas
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {item.product.isActive ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Activo
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800">
                            Inactivo
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/products/${item.product.slug}`} target="_blank">
                              <Eye className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleRemoveProduct(item.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal para añadir productos */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">Añadir Productos a {category.name}</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 max-h-96 overflow-y-auto">
              {availableProducts.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No hay productos disponibles para añadir</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {availableProducts.map((product) => (
                    <div 
                      key={product.id}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProducts([...selectedProducts, product.id])
                          } else {
                            setSelectedProducts(selectedProducts.filter(id => id !== product.id))
                          }
                        }}
                        className="w-4 h-4 text-orange-600"
                      />
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        {product.images.length > 0 ? (
                          <img 
                            src={product.images[0]} 
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        ) : (
                          <Package className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-600">{formatPrice(product.basePrice)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between p-6 border-t">
              <p className="text-sm text-gray-600">
                {selectedProducts.length} productos seleccionados
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowAddModal(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleAddProducts}
                  disabled={selectedProducts.length === 0}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Añadir Seleccionados
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}