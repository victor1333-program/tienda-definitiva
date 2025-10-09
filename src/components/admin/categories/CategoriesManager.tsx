"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import useSWR from "swr"
import { 
  Plus, 
  Search, 
  Eye, 
  Edit2, 
  Trash2,
  Tag,
  Package,
  ToggleLeft,
  ToggleRight,
  Star,
  TrendingUp,
  Settings,
  AlertCircle,
  Users,
  CheckCircle,
  Circle,
  Shield
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "react-hot-toast"
import fetcher from "@/lib/fetcher"

interface Category {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  color: string
  sortOrder: number
  isActive: boolean
  isFeatured: boolean
  isSystem: boolean
  categoryType: string
  _count: {
    productCategories: number
  }
}

const iconMap: { [key: string]: any } = {
  Star, TrendingUp, Package, Tag, Shield, Settings, Users
}

export default function CategoriesManager() {
  const [search, setSearch] = useState("")
  const [includeInactive, setIncludeInactive] = useState(false)
  const [selectedCategoryProducts, setSelectedCategoryProducts] = useState<any>(null)
  const [showProductsModal, setShowProductsModal] = useState(false)

  // Construir URL de consulta
  const queryParams = new URLSearchParams({
    ...(search && { search }),
    ...(includeInactive && { includeInactive: "true" }),
  })

  const swrKey = `/api/categories?${queryParams}`
  console.log('🔍 SWR Key:', swrKey)
  
  const { data, error, mutate } = useSWR(
    swrKey,
    fetcher
  )
  
  console.log('📊 Datos SWR:', data ? `${data.categories?.length || 0} categorías` : 'Sin datos')

  const categories: Category[] = data?.categories || []

  const handleToggleActive = async (categoryId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      })

      if (response.ok) {
        toast.success('Estado actualizado')
        mutate()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al actualizar estado')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al actualizar estado')
    }
  }

  const handleDeleteCategory = async (categoryId: string, isSystem: boolean) => {
    if (isSystem) {
      toast.error('No se puede eliminar una categoría del sistema')
      return
    }

    if (!confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      return
    }

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Categoría eliminada')
        mutate()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al eliminar categoría')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al eliminar categoría')
    }
  }

  const handleShowProducts = async (category: Category) => {
    try {
      const response = await fetch(`/api/categories/${category.id}`)
      if (response.ok) {
        const data = await response.json()
        setSelectedCategoryProducts({
          category,
          products: data.productCategories?.map((pc: any) => pc.product) || []
        })
        setShowProductsModal(true)
      } else {
        toast.error('Error al cargar productos de la categoría')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al cargar productos')
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

  const getCategoryTypeBadge = (category: Category) => {
    if (!category.isSystem) return null

    const config = {
      FEATURED: { label: 'Destacados', color: 'bg-yellow-100 text-yellow-800', icon: Star },
      TOP_SALES: { label: 'Top Ventas', color: 'bg-green-100 text-green-800', icon: TrendingUp },
      SPECIAL: { label: 'Especial', color: 'bg-purple-100 text-purple-800', icon: Shield }
    }

    const typeConfig = config[category.categoryType as keyof typeof config]
    if (!typeConfig) return null

    const Icon = typeConfig.icon

    return (
      <Badge className={`${typeConfig.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {typeConfig.label}
      </Badge>
    )
  }

  // Todas las categorías
  const allCategories = Array.isArray(categories) ? categories : []

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar categorías</h3>
          <p className="text-gray-600">Intenta recargar la página</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestión de Categorías</h1>
            <p className="text-gray-600">Administra las categorías de productos del sistema</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => {
                console.log('🔄 Forzando recarga de SWR...')
                mutate()
              }}
              variant="outline"
              className="mr-2"
            >
              🔄 Recargar
            </Button>
            <Link href="/admin/categories/new">
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Categoría
              </Button>
            </Link>
          </div>
        </div>
      </div>


      {/* Filtros y búsqueda */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Buscar categorías..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={includeInactive ? "default" : "outline"}
                onClick={() => setIncludeInactive(!includeInactive)}
                size="sm"
              >
                {includeInactive ? <CheckCircle className="w-4 h-4 mr-2" /> : <Circle className="w-4 h-4 mr-2" />}
                Incluir inactivas
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Todas las Categorías */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Categorías ({allCategories.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {allCategories.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay categorías</h3>
              <p className="text-gray-600">Crea tu primera categoría para empezar</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Categoría</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Tipo</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Productos</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Estado</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {allCategories.map((category) => {
                    const Icon = getCategoryIcon(category)
                    return (
                      <tr key={category.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                              <Icon className="w-4 h-4 text-gray-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{category.name}</p>
                              <p className="text-sm text-gray-600">{category.description}</p>
                              {category.isFeatured && (
                                <Badge className="mt-1 bg-yellow-100 text-yellow-800">
                                  Destacada
                                </Badge>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {category.isSystem ? (
                            <div className="flex items-center gap-2">
                              {getCategoryTypeBadge(category)}
                              <Badge className="bg-blue-100 text-blue-800">Sistema</Badge>
                            </div>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-800">Regular</Badge>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleShowProducts(category)}
                            className="text-sm text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                          >
                            {category._count.productCategories} productos
                          </button>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleToggleActive(category.id, category.isActive)}
                            className="flex items-center gap-2"
                          >
                            {category.isActive ? (
                              <>
                                <ToggleRight className="w-5 h-5 text-green-600" />
                                <span className="text-sm text-green-600">Activa</span>
                              </>
                            ) : (
                              <>
                                <ToggleLeft className="w-5 h-5 text-gray-400" />
                                <span className="text-sm text-gray-400">Inactiva</span>
                              </>
                            )}
                          </button>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/categoria/${category.slug}`} target="_blank">
                                <Eye className="w-4 h-4" />
                              </Link>
                            </Button>
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/admin/categories/${category.id}/edit`}>
                                <Edit2 className="w-4 h-4" />
                              </Link>
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDeleteCategory(category.id, category.isSystem)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de productos de la categoría */}
      <Dialog open={showProductsModal} onOpenChange={setShowProductsModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Productos en {selectedCategoryProducts?.category?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {selectedCategoryProducts?.products?.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Esta categoría no tiene productos asignados</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {selectedCategoryProducts?.products?.map((product: any) => {
                  const images = product.images ? JSON.parse(product.images) : []
                  return (
                    <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                          {images.length > 0 ? (
                            <img 
                              src={images[0]} 
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{product.name}</h3>
                          <p className="text-sm text-gray-600">
                            Precio: €{product.basePrice}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              product.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {product.isActive ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/admin/products/${product.id}/edit`}>
                              <Edit2 className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/productos/${product.id}`} target="_blank">
                              <Eye className="w-4 h-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}