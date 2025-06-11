"use client"

import { useState } from "react"
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
  Circle
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
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
  _count: {
    products: number
  }
}

export default function CategoriesPage() {
  const [search, setSearch] = useState("")
  const [includeInactive, setIncludeInactive] = useState(false)

  // Construir URL de consulta
  const queryParams = new URLSearchParams({
    ...(search && { search }),
    ...(includeInactive && { includeInactive: "true" }),
  })

  const { data, error, mutate } = useSWR(
    `/api/categories?${queryParams}`,
    fetcher
  )

  const categories: Category[] = data?.categories || []

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar la categoría "${categoryName}"? Esta acción no se puede deshacer.`)) {
      return
    }

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        mutate()
      } else {
        const error = await response.json()
        alert(error.error || "Error al eliminar categoría")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error al eliminar categoría")
    }
  }

  const handleToggleActive = async (categoryId: string, currentActive: boolean) => {
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !currentActive }),
      })

      if (response.ok) {
        mutate()
      } else {
        const error = await response.json()
        alert(error.error || "Error al actualizar categoría")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error al actualizar categoría")
    }
  }

  const handleToggleFeatured = async (categoryId: string, currentFeatured: boolean) => {
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isFeatured: !currentFeatured }),
      })

      if (response.ok) {
        mutate()
      } else {
        const error = await response.json()
        alert(error.error || "Error al actualizar categoría")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error al actualizar categoría")
    }
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          Error al cargar las categorías
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categorías</h1>
          <p className="text-gray-600 mt-1">
            Gestiona las categorías de productos de tu tienda
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/categories/new">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Categoría
          </Link>
        </Button>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-50 rounded-lg mr-4">
                <Tag className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Categorías</p>
                <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-50 rounded-lg mr-4">
                <ToggleRight className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Activas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {categories.filter(c => c.isActive).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-50 rounded-lg mr-4">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Destacadas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {categories.filter(c => c.isFeatured).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-50 rounded-lg mr-4">
                <Package className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Con Productos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {categories.filter(c => c._count.products > 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Búsqueda y filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nombre o descripción..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="includeInactive"
                checked={includeInactive}
                onChange={(e) => setIncludeInactive(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="includeInactive" className="text-sm text-gray-600">
                Incluir inactivas
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de categorías */}
      <Card>
        <CardHeader>
          <CardTitle>
            Categorías ({categories.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!data ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
              <p className="text-gray-600 mt-2">Cargando categorías...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8">
              <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No se encontraron categorías</p>
              {search && (
                <p className="text-sm text-gray-500 mt-1">
                  Intenta cambiar los criterios de búsqueda
                </p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-3">Categoría</th>
                    <th className="text-left p-3">Descripción</th>
                    <th className="text-left p-3">Productos</th>
                    <th className="text-left p-3">Estado</th>
                    <th className="text-left p-3">Orden</th>
                    <th className="text-left p-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: category.color + '20' }}
                          >
                            {category.icon ? (
                              <span style={{ color: category.color }}>{category.icon}</span>
                            ) : (
                              <Circle className="h-5 w-5" style={{ color: category.color }} />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900">{category.name}</p>
                              {category.isFeatured && (
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              )}
                            </div>
                            <p className="text-sm text-gray-500">#{category.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <p className="text-sm text-gray-600 max-w-xs truncate">
                          {category.description || "Sin descripción"}
                        </p>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <Package className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-900">
                            {category._count.products}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleActive(category.id, category.isActive)}
                            className="flex items-center"
                          >
                            {category.isActive ? (
                              <ToggleRight className="h-5 w-5 text-green-600" />
                            ) : (
                              <ToggleLeft className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                          <button
                            onClick={() => handleToggleFeatured(category.id, category.isFeatured)}
                            className="flex items-center"
                          >
                            <Star className={`h-4 w-4 ${category.isFeatured ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                          </button>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="text-sm text-gray-600">
                          {category.sortOrder}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <Link href={`/admin/categories/${category.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <Link href={`/admin/categories/${category.id}/edit`}>
                              <Edit2 className="h-4 w-4" />
                            </Link>
                          </Button>
                          {category._count.products === 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteCategory(category.id, category.name)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
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
    </div>
  )
}