"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Settings, Grid3X3, Edit2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ColoredSwitch } from "@/components/ui/ColoredSwitch"
import { toast } from "react-hot-toast"
import useSWR from "swr"
import fetcher from "@/lib/fetcher"

interface Category {
  id: string
  name: string
  slug: string
  image?: string
  description?: string
}

interface FeaturedCategoriesProps {
  title: string
  subtitle: string
  categories: string[] // Array de IDs de categorías
  columns: 2 | 3 | 4
  showDescription: boolean
  style: 'cards' | 'overlay' | 'minimal'
  maxCategories?: number
}

interface FeaturedCategoriesEditorProps {
  props: FeaturedCategoriesProps
  onUpdate: (newProps: Partial<FeaturedCategoriesProps>) => void
}

export default function FeaturedCategoriesEditor({ 
  props, 
  onUpdate 
}: FeaturedCategoriesEditorProps) {
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([])
  
  // Obtener todas las categorías disponibles
  const { data: categoriesResponse, error } = useSWR('/api/categories', fetcher)
  const allCategories = categoriesResponse?.categories || []
  
  console.log('🏷️ FeaturedCategoriesEditor: categoriesResponse:', categoriesResponse)
  console.log('🏷️ FeaturedCategoriesEditor: allCategories:', allCategories)

  // Cargar categorías seleccionadas cuando cambien los props
  useEffect(() => {
    if (allCategories && Array.isArray(allCategories) && props.categories.length > 0) {
      const selected = allCategories.filter((cat: Category) => 
        props.categories.includes(cat.id)
      )
      setSelectedCategories(selected)
    }
  }, [allCategories, props.categories])

  const addCategory = (category: Category) => {
    if (props.categories.includes(category.id)) {
      toast.error('Esta categoría ya está seleccionada')
      return
    }

    const maxCats = props.maxCategories || 8
    if (props.categories.length >= maxCats) {
      toast.error(`Máximo ${maxCats} categorías permitidas`)
      return
    }

    const newCategories = [...props.categories, category.id]
    onUpdate({ categories: newCategories })
    setSelectedCategories([...selectedCategories, category])
    toast.success('Categoría agregada')
  }

  const removeCategory = (categoryId: string) => {
    const newCategories = props.categories.filter(id => id !== categoryId)
    onUpdate({ categories: newCategories })
    setSelectedCategories(selectedCategories.filter(cat => cat.id !== categoryId))
    toast.success('Categoría eliminada')
  }

  const reorderCategories = (fromIndex: number, toIndex: number) => {
    const newOrder = [...props.categories]
    const [moved] = newOrder.splice(fromIndex, 1)
    newOrder.splice(toIndex, 0, moved)
    onUpdate({ categories: newOrder })

    const newSelected = [...selectedCategories]
    const [movedCat] = newSelected.splice(fromIndex, 1)
    newSelected.splice(toIndex, 0, movedCat)
    setSelectedCategories(newSelected)
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600 text-sm">Error al cargar las categorías</p>
      </div>
    )
  }

  if (!categoriesResponse) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
        <p className="text-sm text-gray-600">Cargando categorías...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Configuración General
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Título y subtítulo */}
          <div>
            <Label>Título de la Sección</Label>
            <Input
              value={props.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="Nuestras Categorías"
              className="mt-1"
            />
          </div>

          <div>
            <Label>Subtítulo</Label>
            <Input
              value={props.subtitle}
              onChange={(e) => onUpdate({ subtitle: e.target.value })}
              placeholder="Explora nuestra amplia gama de productos"
              className="mt-1"
            />
          </div>

          {/* Configuración del layout */}
          <div>
            <Label>Número de Columnas</Label>
            <div className="flex gap-2 mt-2">
              {[2, 3, 4].map((cols) => (
                <Button
                  key={cols}
                  size="sm"
                  variant={props.columns === cols ? 'default' : 'outline'}
                  onClick={() => onUpdate({ columns: cols as any })}
                >
                  {cols} columnas
                </Button>
              ))}
            </div>
          </div>

          {/* Estilo de visualización */}
          <div>
            <Label>Estilo de Visualización</Label>
            <div className="flex gap-2 mt-2">
              {[
                { value: 'cards', label: 'Tarjetas' },
                { value: 'overlay', label: 'Overlay' },
                { value: 'minimal', label: 'Minimalista' }
              ].map((style) => (
                <Button
                  key={style.value}
                  size="sm"
                  variant={props.style === style.value ? 'default' : 'outline'}
                  onClick={() => onUpdate({ style: style.value as any })}
                >
                  {style.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Mostrar descripción */}
          <div className="flex items-center justify-between">
            <Label>Mostrar Descripción</Label>
            <ColoredSwitch
              checked={props.showDescription}
              onCheckedChange={(checked) => onUpdate({ showDescription: checked })}
              activeColor="green"
              inactiveColor="gray"
            />
          </div>

          {/* Máximo de categorías */}
          <div>
            <Label>Máximo de Categorías</Label>
            <select
              value={props.maxCategories || 8}
              onChange={(e) => onUpdate({ maxCategories: parseInt(e.target.value) })}
              className="w-full mt-1 p-2 border border-gray-300 rounded-lg"
            >
              <option value={4}>4 categorías</option>
              <option value={6}>6 categorías</option>
              <option value={8}>8 categorías</option>
              <option value={12}>12 categorías</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid3X3 className="w-4 h-4" />
            Categorías Seleccionadas ({selectedCategories.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedCategories.length > 0 ? (
            <div className={`grid gap-4 ${
              props.columns === 2 ? 'grid-cols-2' :
              props.columns === 3 ? 'grid-cols-3' :
              'grid-cols-4'
            }`}>
              {selectedCategories.map((category, index) => (
                <div
                  key={category.id}
                  className="relative group border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Imagen de categoría */}
                  <div className="aspect-square bg-gray-100 overflow-hidden">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200">
                        <Grid3X3 className="w-8 h-8 text-orange-500" />
                      </div>
                    )}
                  </div>

                  {/* Contenido */}
                  <div className="p-3">
                    <h4 className="font-medium text-sm">{category.name}</h4>
                    {props.showDescription && category.description && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {category.description}
                      </p>
                    )}
                  </div>

                  {/* Controles */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-1">
                      {index > 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 w-6 p-0 bg-white"
                          onClick={() => reorderCategories(index, index - 1)}
                        >
                          ↑
                        </Button>
                      )}
                      {index < selectedCategories.length - 1 && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 w-6 p-0 bg-white"
                          onClick={() => reorderCategories(index, index + 1)}
                        >
                          ↓
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 w-6 p-0 bg-white text-red-600"
                        onClick={() => removeCategory(category.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Número de orden */}
                  <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Grid3X3 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No hay categorías seleccionadas</p>
              <p className="text-xs">Selecciona categorías de la lista de abajo</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Agregar Categorías
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
            {(Array.isArray(allCategories) ? allCategories
              .filter((cat: Category) => !props.categories.includes(cat.id)) : [])
              .map((category: Category) => (
                <div
                  key={category.id}
                  className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => addCategory(category)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200">
                          <Grid3X3 className="w-4 h-4 text-orange-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{category.name}</h4>
                      <p className="text-xs text-gray-500 truncate">{category.slug}</p>
                    </div>
                    <Button size="sm" variant="outline" className="h-6 w-6 p-0">
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Vista previa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Vista Previa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-6 rounded-lg">
            {/* Títulos */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {props.title || 'Nuestras Categorías'}
              </h2>
              {props.subtitle && (
                <p className="text-gray-600">
                  {props.subtitle}
                </p>
              )}
            </div>

            {/* Grid de categorías */}
            <div className={`grid gap-6 ${
              props.columns === 2 ? 'grid-cols-2' :
              props.columns === 3 ? 'grid-cols-3' :
              'grid-cols-4'
            }`}>
              {selectedCategories.slice(0, props.maxCategories || 8).map((category) => (
                <div
                  key={category.id}
                  className={`group cursor-pointer ${
                    props.style === 'cards' ? 'bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow' :
                    props.style === 'overlay' ? 'relative overflow-hidden rounded-lg' :
                    'text-center'
                  }`}
                >
                  {props.style === 'cards' ? (
                    <>
                      <div className="aspect-square overflow-hidden rounded-t-lg">
                        {category.image ? (
                          <img
                            src={category.image}
                            alt={category.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                            <Grid3X3 className="w-8 h-8 text-orange-500" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-gray-900">{category.name}</h3>
                        {props.showDescription && category.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {category.description}
                          </p>
                        )}
                      </div>
                    </>
                  ) : props.style === 'overlay' ? (
                    <>
                      <div className="aspect-square overflow-hidden">
                        {category.image ? (
                          <img
                            src={category.image}
                            alt={category.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200"></div>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
                        <div className="p-4 text-white">
                          <h3 className="font-medium">{category.name}</h3>
                          {props.showDescription && category.description && (
                            <p className="text-sm opacity-90 mt-1">
                              {category.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="aspect-square overflow-hidden rounded-lg mb-3">
                        {category.image ? (
                          <img
                            src={category.image}
                            alt={category.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                            <Grid3X3 className="w-6 h-6 text-orange-500" />
                          </div>
                        )}
                      </div>
                      <h3 className="font-medium text-gray-900">{category.name}</h3>
                      {props.showDescription && category.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {category.description}
                        </p>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}