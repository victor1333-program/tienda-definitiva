"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { mutate } from "swr"
import Link from "next/link"
import useSWR from "swr"
import { ArrowLeft, Save, Tag, Palette, Hash, AlignLeft, ToggleLeft, ToggleRight, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "react-hot-toast"
import fetcher from "@/lib/fetcher"

export default function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  
  // Unwrap params using React.use()
  const { id } = use(params)

  // Obtener datos de la categoría
  const { data: category, error: fetchError } = useSWR(
    `/api/categories/${id}`,
    fetcher
  )

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "",
    color: "#6B7280",
    sortOrder: 10,
    isActive: true,
    isFeatured: false
  })

  // Cargar datos cuando se obtenga la categoría
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || "",
        description: category.description || "",
        icon: category.icon || "",
        color: category.color || "#6B7280",
        sortOrder: category.sortOrder || 10,
        isActive: category.isActive !== undefined ? category.isActive : true,
        isFeatured: category.isFeatured !== undefined ? category.isFeatured : false
      })
    }
  }, [category])

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validación básica
    if (!formData.name.trim()) {
      setError('El nombre es requerido')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const updatedCategory = await response.json()
        toast.success('Categoría actualizada exitosamente')
        mutate(`/api/categories/${id}`)
        router.push('/admin/categories')
      } else {
        let errorMessage = "Error al actualizar la categoría"
        try {
          const error = await response.json()
          errorMessage = error.error || errorMessage
        } catch (jsonError) {
          console.log('Error parsing response')
        }
        setError(errorMessage)
        toast.error(errorMessage)
      }
    } catch (error) {
      console.error("Error al actualizar categoría:", error)
      setError("Error al actualizar la categoría")
      toast.error("Error al actualizar la categoría")
    } finally {
      setIsLoading(false)
    }
  }

  const predefinedColors = [
    "#EF4444", "#F97316", "#F59E0B", "#EAB308",
    "#84CC16", "#22C55E", "#10B981", "#14B8A6",
    "#06B6D4", "#0EA5E9", "#3B82F6", "#6366F1",
    "#8B5CF6", "#A855F7", "#D946EF", "#EC4899",
    "#F43F5E", "#6B7280", "#374151", "#111827"
  ]

  const predefinedIcons = ["🏷️", "📦", "👕", "🎨", "🖼️", "💎", "🌟", "🎯", "🎪", "🛍️"]

  if (fetchError) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          Error al cargar la categoría
        </div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-gray-600 mt-2">Cargando categoría...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" asChild>
          <Link href="/admin/categories">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editar Categoría</h1>
          <p className="text-gray-600 mt-1">Modificar la categoría: {category.name}</p>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Información básica */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Información básica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Nombre de la categoría"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Descripción de la categoría"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700 mb-1">
                  Orden de visualización
                </label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => handleInputChange("sortOrder", parseInt(e.target.value) || 0)}
                  placeholder="10"
                  min="0"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Menor número = mayor prioridad
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Apariencia */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Apariencia
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icono
                </label>
                <div className="grid grid-cols-5 gap-2 mb-3">
                  {predefinedIcons.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => handleInputChange("icon", icon)}
                      className={`p-2 text-lg border rounded-lg hover:bg-gray-50 ${
                        formData.icon === icon ? 'border-orange-500 bg-orange-50' : 'border-gray-300'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
                <Input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => handleInputChange("icon", e.target.value)}
                  placeholder="O introduce un emoji personalizado"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <div className="grid grid-cols-10 gap-2 mb-3">
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleInputChange("color", color)}
                      className={`w-8 h-8 rounded-lg border-2 ${
                        formData.color === color ? 'border-gray-800' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <Input
                  type="color"
                  value={formData.color}
                  onChange={(e) => handleInputChange("color", e.target.value)}
                  className="w-20 h-10"
                />
              </div>

              {/* Preview */}
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Vista previa</p>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                    style={{ backgroundColor: formData.color + '20' }}
                  >
                    <span style={{ color: formData.color }}>
                      {formData.icon || "🏷️"}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {formData.name || "Nombre de la categoría"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formData.description || "Descripción de la categoría"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Configuración */}
        <Card>
          <CardHeader>
            <CardTitle>Configuración</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Estado activo</p>
                  <p className="text-sm text-gray-600">
                    La categoría será visible en la tienda
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleInputChange("isActive", !formData.isActive)}
                  className="flex items-center"
                >
                  {formData.isActive ? (
                    <ToggleRight className="h-6 w-6 text-green-600" />
                  ) : (
                    <ToggleLeft className="h-6 w-6 text-gray-400" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Categoría destacada</p>
                  <p className="text-sm text-gray-600">
                    Aparecerá en secciones especiales
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleInputChange("isFeatured", !formData.isFeatured)}
                  className="flex items-center"
                >
                  <Star className={`h-5 w-5 ${formData.isFeatured ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Acciones */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            asChild
          >
            <Link href="/admin/categories">
              Cancelar
            </Link>
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Actualizando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Actualizar Categoría
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}