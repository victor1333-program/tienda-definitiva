'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import useSWR from 'swr'
import { 
  ArrowLeft, 
  Edit2, 
  Eye, 
  Package, 
  Save, 
  X,
  AlertCircle,
  Star,
  TrendingUp,
  Shield,
  Settings,
  Users,
  Tag
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'react-hot-toast'
import fetcher from '@/lib/fetcher'

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

const iconOptions = [
  { value: 'Package', label: 'Paquete', icon: Package },
  { value: 'Tag', label: 'Etiqueta', icon: Tag },
  { value: 'Star', label: 'Estrella', icon: Star },
  { value: 'TrendingUp', label: 'Tendencia', icon: TrendingUp },
  { value: 'Shield', label: 'Escudo', icon: Shield },
  { value: 'Settings', label: 'Configuración', icon: Settings },
  { value: 'Users', label: 'Usuarios', icon: Users }
]

const colorOptions = [
  { value: '#ef4444', label: 'Rojo', class: 'bg-red-500' },
  { value: '#f97316', label: 'Naranja', class: 'bg-orange-500' },
  { value: '#eab308', label: 'Amarillo', class: 'bg-yellow-500' },
  { value: '#22c55e', label: 'Verde', class: 'bg-green-500' },
  { value: '#3b82f6', label: 'Azul', class: 'bg-blue-500' },
  { value: '#8b5cf6', label: 'Púrpura', class: 'bg-purple-500' },
  { value: '#ec4899', label: 'Rosa', class: 'bg-pink-500' },
  { value: '#6b7280', label: 'Gris', class: 'bg-gray-500' }
]

export default function CategoryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const categoryId = params.id as string
  
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'Package',
    color: '#3b82f6',
    sortOrder: 0,
    isActive: true,
    isFeatured: false
  })

  const { data: category, error, mutate } = useSWR<Category>(
    categoryId ? `/api/categories/${categoryId}` : null,
    fetcher
  )

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description,
        icon: category.icon,
        color: category.color,
        sortOrder: category.sortOrder,
        isActive: category.isActive,
        isFeatured: category.isFeatured
      })
    }
  }, [category])

  const handleSave = async () => {
    if (!category) return

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success('Categoría actualizada correctamente')
        setIsEditing(false)
        mutate()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al actualizar categoría')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al actualizar categoría')
    }
  }

  const getIconComponent = (iconName: string) => {
    const iconOption = iconOptions.find(opt => opt.value === iconName)
    return iconOption ? iconOption.icon : Package
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar categoría</h3>
          <p className="text-gray-600">La categoría no existe o ha ocurrido un error</p>
          <Link href="/admin/categories" className="mt-4 inline-block">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a categorías
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
        </div>
      </div>
    )
  }

  const IconComponent = getIconComponent(category.icon)

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/categories">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {category.name}
              </h1>
              <p className="text-gray-600">Detalles y configuración de la categoría</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/categoria/${category.slug}`} target="_blank">
                <Eye className="w-4 h-4 mr-2" />
                Ver página
              </Link>
            </Button>
            {!category.isSystem && (
              <>
                {isEditing ? (
                  <>
                    <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                      <Save className="w-4 h-4 mr-2" />
                      Guardar
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      <X className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)} className="bg-orange-600 hover:bg-orange-700">
                    <Edit2 className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información principal */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre
                </label>
                {isEditing ? (
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nombre de la categoría"
                  />
                ) : (
                  <p className="text-gray-900">{category.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                {isEditing ? (
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descripción de la categoría"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    rows={3}
                  />
                ) : (
                  <p className="text-gray-600">{category.description}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug
                </label>
                <p className="text-gray-500 bg-gray-50 px-3 py-2 rounded-md">
                  {category.slug}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configuración Visual</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icono
                </label>
                {isEditing ? (
                  <div className="grid grid-cols-4 gap-3">
                    {iconOptions.map((option) => {
                      const OptionIcon = option.icon
                      return (
                        <button
                          key={option.value}
                          onClick={() => setFormData({ ...formData, icon: option.value })}
                          className={`p-3 border-2 rounded-lg flex flex-col items-center gap-2 hover:bg-gray-50 ${
                            formData.icon === option.value
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-gray-200'
                          }`}
                        >
                          <OptionIcon className="w-5 h-5" />
                          <span className="text-xs">{option.label}</span>
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gray-100 rounded-lg">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="text-gray-900">{category.icon}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                {isEditing ? (
                  <div className="flex gap-2">
                    {colorOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setFormData({ ...formData, color: option.value })}
                        className={`w-8 h-8 rounded-full ${option.class} border-2 ${
                          formData.color === option.value
                            ? 'border-gray-800'
                            : 'border-gray-300'
                        }`}
                        title={option.label}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded-full border border-gray-300"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-gray-900">{category.color}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel lateral */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Estado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Activa</span>
                <Badge className={category.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                  {category.isActive ? 'Sí' : 'No'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Destacada</span>
                <Badge className={category.isFeatured ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}>
                  {category.isFeatured ? 'Sí' : 'No'}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Tipo</span>
                <Badge className={category.isSystem ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}>
                  {category.isSystem ? 'Sistema' : 'Regular'}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Orden</span>
                <span className="text-gray-900">{category.sortOrder}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">
                  {category._count.productCategories}
                </div>
                <div className="text-sm text-gray-600">Productos asociados</div>
              </div>
              
              <div className="mt-4">
                <Link href={`/admin/categories/${categoryId}/products`}>
                  <Button variant="outline" className="w-full">
                    <Package className="w-4 h-4 mr-2" />
                    Ver productos
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {category.isSystem && (
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-600">Categoría del Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Esta es una categoría del sistema y no se puede editar ni eliminar.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}