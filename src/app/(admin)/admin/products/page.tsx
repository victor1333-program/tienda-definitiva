"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import useSWR from "swr"
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff,
  Download,
  Upload,
  ExternalLink,
  Copy,
  Palette
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import fetcher from "@/lib/fetcher"
import { formatPrice } from "@/lib/utils"
import { toast } from "react-hot-toast"

interface Product {
  id: string
  name: string
  slug: string
  description?: string
  basePrice: number
  images: string
  isActive: boolean
  featured: boolean
  personalizationType: string
  materialType: string
  stock: number
  createdAt: string
  category: {
    id: string
    name: string
  }
  variants: Array<{
    id: string
    sku: string
    size?: string
    color?: string
    stock: number
    price?: number
  }>
}

export default function ProductsPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [debouncedSearch, setDebouncedSearch] = useState("")

  // Debounce search to prevent rapid API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 500)
    
    return () => clearTimeout(timer)
  }, [search])

  // Reset to first page when search or category changes
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch, selectedCategory])

  // Construir URL de consulta
  const queryParams = new URLSearchParams({
    page: currentPage.toString(),
    limit: "10",
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(selectedCategory && { category: selectedCategory }),
  })

  const { data, error, mutate } = useSWR(
    `/api/products?${queryParams}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 0,
      dedupingInterval: 2000
    }
  )

  const { data: categoriesData } = useSWR("/api/categories", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 0,
    dedupingInterval: 2000
  })

  const products: Product[] = data?.data?.products || data?.products || []
  const totalPages = data?.data?.pages || data?.pages || 1
  const total = data?.data?.total || data?.total || 0

  const categories = categoriesData?.categories || []

  // Manejo de selección múltiple
  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(products.map(p => p.id))
    }
  }

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  // Acciones masivas
  const handleMassAction = async (action: string) => {
    if (selectedProducts.length === 0) return

    try {
      let response
      
      switch (action) {
        case "activate":
          response = await fetch("/api/products", {
            method: "PATCH",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "updateStatus",
              ids: selectedProducts,
              isActive: true
            })
          })
          break
        case "deactivate":
          response = await fetch("/api/products", {
            method: "PATCH", 
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "updateStatus",
              ids: selectedProducts,
              isActive: false
            })
          })
          break
        case "delete":
          if (!confirm("¿Estás seguro de que quieres eliminar los productos seleccionados?")) {
            return
          }
          response = await fetch("/api/products", {
            method: "DELETE",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids: selectedProducts })
          })
          break
      }

      if (response?.ok) {
        mutate()
        setSelectedProducts([])
      }
    } catch (error) {
      console.error("Error en acción masiva:", error)
    }
  }

  // Duplicar producto
  const handleDuplicateProduct = async (productId: string) => {
    if (!confirm("¿Estás seguro de que quieres duplicar este producto?")) {
      return
    }

    try {
      const response = await fetch(`/api/products/${productId}/duplicate`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      })

      if (response.ok) {
        const { duplicatedProduct, message } = await response.json()
        mutate()
        toast.success(`${message} - ${duplicatedProduct.name} (${duplicatedProduct.sku})`)
      } else {
        const error = await response.json()
        toast.error(`Error al duplicar el producto: ${error.error || 'Error desconocido'}`)
      }
    } catch (error) {
      console.error("Error duplicando producto:", error)
      toast.error("Error al duplicar el producto. Verifica la conexión.")
    }
  }

  // Mostrar stock principal (las variantes requieren consulta separada)
  const getProductStock = (product: any) => {
    const mainStock = product.stock || 0
    const variantCount = product._count?.variants || 0
    
    if (variantCount > 0) {
      return `${mainStock} (+${variantCount} variantes)`
    }
    return mainStock.toString()
  }

  // Parsear imágenes
  const getProductImages = (imagesString: string) => {
    try {
      const images = JSON.parse(imagesString)
      return Array.isArray(images) ? images : []
    } catch {
      return []
    }
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          Error al cargar los productos
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 w-full">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
          <p className="text-gray-600 text-sm">
            Gestiona tu catálogo de productos personalizados
          </p>
        </div>
        <button 
          onClick={(e) => {
            e.preventDefault()
            console.log('Navegando a /admin/products/new')
            window.location.href = '/admin/products/new'
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors cursor-pointer z-10 relative"
        >
          <Plus className="h-4 w-4" />
          Nuevo Producto
        </button>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros y búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar productos..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="md:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="">Todas las categorías</option>
                {categories.map((category: any) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Acciones masivas */}
      {selectedProducts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-orange-800">
                {selectedProducts.length} producto(s) seleccionado(s)
              </span>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleMassAction("activate")}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Activar
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleMassAction("deactivate")}
                >
                  <EyeOff className="h-4 w-4 mr-1" />
                  Desactivar
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleMassAction("delete")}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Eliminar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de productos */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              Productos ({total})
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Importar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!data ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
              <p className="text-gray-600 mt-2">Cargando productos...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No se encontraron productos</p>
            </div>
          ) : (
            <>
              {/* Tabla */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left p-3">
                        <input
                          type="checkbox"
                          checked={selectedProducts.length === products.length}
                          onChange={handleSelectAll}
                          className="rounded"
                        />
                      </th>
                      <th className="text-left p-3">Producto</th>
                      <th className="text-left p-3">Categorías</th>
                      <th className="text-left p-3">Material</th>
                      <th className="text-left p-3">Precio</th>
                      <th className="text-left p-3">Stock</th>
                      <th className="text-left p-3">Estado</th>
                      <th className="text-left p-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => {
                      const images = getProductImages(product.images)
                      const stock = getProductStock(product)
                      
                      return (
                        <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="p-3">
                            <input
                              type="checkbox"
                              checked={selectedProducts.includes(product.id)}
                              onChange={() => handleSelectProduct(product.id)}
                              className="rounded"
                            />
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                                {images.length > 0 ? (
                                  <img 
                                    src={images[0]} 
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-gray-400 text-xs">Sin imagen</span>
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{product.name}</p>
                                <p className="text-sm text-gray-500">{product.slug}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-1">
                              {product.categories && product.categories.length > 0 ? (
                                product.categories.map((pc: any) => (
                                  <span key={pc.category.id} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    {pc.category.name}
                                    {pc.isPrimary && <span className="ml-1 text-blue-600">★</span>}
                                  </span>
                                ))
                              ) : (
                                <span className="text-sm text-gray-400">Sin categoría</span>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {product.materialType || 'Material no especificado'}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="font-medium text-gray-900">
                              {formatPrice(product.basePrice)}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`font-medium ${(product.stock || 0) < 10 ? 'text-red-600' : 'text-gray-900'}`}>
                              {stock}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              product.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {product.isActive ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <Link href={`/admin/products/${product.id}/edit`}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  title="Editar producto"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Link href={`/admin/personalizacion/productos/${product.id}`}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  title="Configurar personalización"
                                  className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                >
                                  <Palette className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => window.open(`/productos/${product.id}`, '_blank')}
                                title="Ver en tienda"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDuplicateProduct(product.id)}
                                title="Duplicar producto"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-gray-600">
                    Página {currentPage} de {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}