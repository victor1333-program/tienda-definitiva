"use client"

import { useState, useEffect, memo, useCallback } from "react"
import { Save, Package, DollarSign, Tag, Type } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ColoredSwitch } from "@/components/ui/ColoredSwitch"
import { toast } from "react-hot-toast"
import useSWR from "swr"
import fetcher from "@/lib/fetcher"

interface Product {
  id: string
  name: string
  sku: string
  slug: string
  description?: string
  basePrice: number
  comparePrice?: number
  costPrice?: number
  weight?: number
  dimensions?: string
  materialType?: string
  isActive: boolean
  featured: boolean
  topSelling: boolean
  metaTitle?: string
  metaDescription?: string
  tags?: string
  stock?: number
  minStock?: number
  trackInventory?: boolean
  variants?: Array<{
    id: string
    stock: number
  }>
  categories?: Array<{
    id: string
    categoryId: string
    category: {
      id: string
      name: string
    }
  }>
}

interface GeneralProductEditorProps {
  product: Product
  onProductChange?: (product: Product) => void
  onSave?: (product: Product) => Promise<void>
  calculateMainStock?: () => number
}

const GeneralProductEditor = memo(function GeneralProductEditor({
  product: initialProduct,
  onProductChange,
  onSave,
  calculateMainStock
}: GeneralProductEditorProps) {
  const [product, setProduct] = useState<Product>(initialProduct)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  // Cargar categorías disponibles
  const { data: categoriesData } = useSWR("/api/categories", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 0,
    dedupingInterval: 2000
  })
  const categories = categoriesData?.categories || []

  useEffect(() => {
    setProduct(initialProduct)
    // Inicializar categorías seleccionadas
    if (initialProduct.categories) {
      const categoryIds = initialProduct.categories.map(pc => pc.categoryId)
      console.log('🏷️ Inicializando categorías seleccionadas:', categoryIds)
      setSelectedCategories(categoryIds)
    } else {
      console.log('⚠️ No se encontraron categorías en el producto inicial')
      setSelectedCategories([])
    }
  }, [initialProduct])

  const handleChange = (field: keyof Product, value: any) => {
    const updatedProduct = { ...product, [field]: value }
    setProduct(updatedProduct)
    setHasChanges(true)
    
    if (onProductChange) {
      onProductChange(updatedProduct)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[áàäâ]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöô]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/[ñ]/g, 'n')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleNameChange = (name: string) => {
    handleChange('name', name)
    // Auto-generar slug si está vacío o coincide con el anterior
    if (!product.slug || product.slug === generateSlug(product.name)) {
      handleChange('slug', generateSlug(name))
    }
  }

  // Función para limpiar datos del producto antes de enviar
  const cleanProductData = (productData: Product) => {
    // Crear una copia limpia solo con los campos necesarios
    const cleanData = {
      id: productData.id,
      name: productData.name,
      sku: productData.sku,
      slug: productData.slug,
      description: productData.description,
      basePrice: productData.basePrice,
      comparePrice: productData.comparePrice,
      costPrice: productData.costPrice,
      materialType: productData.materialType,
      isActive: productData.isActive,
      featured: productData.featured,
      topSelling: productData.topSelling,
      metaTitle: productData.metaTitle,
      metaDescription: productData.metaDescription,
      tags: productData.tags,
      stock: productData.stock,
      minStock: productData.minStock,
      trackInventory: productData.trackInventory,
      categories: selectedCategories
    }
    
    console.log('🧹 Datos limpios del producto:', cleanData)
    console.log('🏷️ Categorías seleccionadas:', selectedCategories)
    
    // Remover valores undefined para evitar problemas
    Object.keys(cleanData).forEach(key => {
      if (cleanData[key] === undefined) {
        delete cleanData[key]
      }
    })
    
    return cleanData
  }

  const handleSave = useCallback(async () => {
    if (!hasChanges) {
      toast.success('No hay cambios para guardar')
      return
    }

    setIsSaving(true)
    try {
      // Limpiar los datos antes de procesar (ya incluye categorías)
      const cleanedProduct = cleanProductData(product)

      if (onSave) {
        // Si se proporciona un callback onSave, usarlo
        await onSave(cleanedProduct)
        setHasChanges(false)
        toast.success('Producto actualizado correctamente')
      } else {
        // Comportamiento por defecto: actualizar directamente
        const response = await fetch(`/api/products/${product.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cleanedProduct)
        })

        if (response.ok) {
          // Manejar categorías automáticas
          await handleAutomaticCategories()
          
          setHasChanges(false)
          toast.success('Producto y categorías actualizados correctamente')
        } else {
          toast.error('Error al actualizar el producto')
        }
      }
    } catch (error) {
      console.error('Error saving product:', error)
      toast.error('Error al guardar los cambios')
    } finally {
      setIsSaving(false)
    }
  }, [hasChanges, product, onSave])

  const handleAutomaticCategories = async () => {
    try {
      // Gestionar categoría "Destacados"
      if (product.featured) {
        await addToCategory('productos-destacados')
      } else {
        await removeFromCategory('productos-destacados')
      }

      // Gestionar categoría "Top Ventas"
      if (product.topSelling) {
        await addToCategory('top-ventas')
      } else {
        await removeFromCategory('top-ventas')
      }
    } catch (error) {
      console.error('Error managing automatic categories:', error)
      // No mostramos error al usuario para no confundir, ya que el producto sí se guardó
    }
  }

  const addToCategory = async (categorySlug: string) => {
    try {
      const response = await fetch(`/api/products/${product.id}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categorySlug })
      })
      
      if (!response.ok) {
        console.error(`Error adding to category ${categorySlug}`)
      }
    } catch (error) {
      console.error(`Error adding to category ${categorySlug}:`, error)
    }
  }

  const removeFromCategory = async (categorySlug: string) => {
    try {
      const response = await fetch(`/api/products/${product.id}/categories`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categorySlug })
      })
      
      if (!response.ok) {
        console.error(`Error removing from category ${categorySlug}`)
      }
    } catch (error) {
      console.error(`Error removing from category ${categorySlug}:`, error)
    }
  }

  const handleCategoryToggle = (categoryId: string) => {
    const newSelectedCategories = selectedCategories.includes(categoryId) 
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId]
    
    setSelectedCategories(newSelectedCategories)
    setHasChanges(true)
  }

  const updateProductCategories = async (categoryIds: string[]) => {
    try {
      // Primero eliminar todas las categorías existentes
      await fetch(`/api/products/${product.id}/categories`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })

      // Luego agregar las nuevas categorías
      if (categoryIds.length > 0) {
        for (const categoryId of categoryIds) {
          await fetch(`/api/products/${product.id}/categories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ categoryId })
          })
        }
      }
    } catch (error) {
      console.error('Error updating product categories:', error)
      throw error
    }
  }

  return (
    <div className="space-y-6">
      {/* Información Básica */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Información Básica
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nombre del Producto *</Label>
              <Input
                id="name"
                value={product.name || ''}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Nombre del producto"
              />
            </div>
            <div>
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                value={product.sku || ''}
                onChange={(e) => handleChange('sku', e.target.value)}
                placeholder="Código único del producto"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="slug">Slug (URL amigable)</Label>
            <Input
              id="slug"
              value={product.slug || ''}
              onChange={(e) => handleChange('slug', e.target.value)}
              placeholder="url-amigable-del-producto"
            />
            <p className="text-sm text-gray-500 mt-1">
              URL: /productos/{product.slug || 'slug-del-producto'}
            </p>
          </div>

          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={product.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Descripción detallada del producto"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="materialType">Tipo de Material</Label>
              <select
                id="materialType"
                value={product.materialType || ''}
                onChange={(e) => handleChange('materialType', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="">Seleccionar material</option>
                <option value="Algodón">Algodón</option>
                <option value="Poliéster">Poliéster</option>
                <option value="Mezcla">Mezcla</option>
                <option value="Lino">Lino</option>
                <option value="Seda">Seda</option>
                <option value="Lana">Lana</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categorías */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Categorías del Producto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Categorías Asignadas</Label>
            <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto mt-2">
              {categories.filter((category: any) => !category.isSystem).length > 0 ? (
                categories.filter((category: any) => !category.isSystem).map((category: any) => (
                  <label key={category.id} className="flex items-center gap-2 py-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.id)}
                      onChange={() => handleCategoryToggle(category.id)}
                      className="rounded"
                    />
                    <span className="text-sm">{category.name}</span>
                  </label>
                ))
              ) : (
                <p className="text-sm text-gray-500 py-2">No se encontraron categorías</p>
              )}
            </div>
            {selectedCategories.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedCategories.map(catId => {
                  const category = categories.find((c: any) => c.id === catId)
                  return category ? (
                    <span key={catId} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {category.name}
                    </span>
                  ) : null
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Precios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Gestión de Precios
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="basePrice">Precio Base (€) *</Label>
              <Input
                id="basePrice"
                type="number"
                step="0.01"
                value={product.basePrice || ''}
                onChange={(e) => handleChange('basePrice', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="comparePrice">Precio de Comparación (€)</Label>
              <Input
                id="comparePrice"
                type="number"
                step="0.01"
                value={product.comparePrice || ''}
                onChange={(e) => handleChange('comparePrice', parseFloat(e.target.value) || null)}
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500 mt-1">Para mostrar descuentos</p>
            </div>
            <div>
              <Label htmlFor="costPrice">Precio de Coste (€)</Label>
              <Input
                id="costPrice"
                type="number"
                step="0.01"
                value={product.costPrice || ''}
                onChange={(e) => handleChange('costPrice', parseFloat(e.target.value) || null)}
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500 mt-1">Para cálculo de margen</p>
            </div>
          </div>

          {/* Cálculo de margen */}
          {product.costPrice && product.basePrice > product.costPrice && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm font-medium text-green-800">
                Margen de beneficio: €{(product.basePrice - product.costPrice).toFixed(2)} 
                ({(((product.basePrice - product.costPrice) / product.costPrice) * 100).toFixed(1)}%)
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dimensiones y Peso */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Dimensiones y Características Físicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="weight">Peso (gramos)</Label>
              <Input
                id="weight"
                type="number"
                value={product.weight || ''}
                onChange={(e) => handleChange('weight', parseFloat(e.target.value) || null)}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="dimensions">Dimensiones (L x A x An cm)</Label>
              <Input
                id="dimensions"
                value={product.dimensions || ''}
                onChange={(e) => handleChange('dimensions', e.target.value)}
                placeholder="20 x 30 x 5"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estado y Visibilidad */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Estado y Visibilidad
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>Producto Activo</Label>
                <p className="text-sm text-gray-500">
                  El producto estará visible en la tienda
                </p>
              </div>
              <ColoredSwitch
                checked={product.isActive}
                onCheckedChange={(checked) => handleChange('isActive', checked)}
                activeColor="green"
                inactiveColor="red"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Producto Destacado</Label>
                <p className="text-sm text-gray-500">
                  Se agregará a la categoría "Destacados"
                </p>
              </div>
              <ColoredSwitch
                checked={product.featured}
                onCheckedChange={(checked) => handleChange('featured', checked)}
                activeColor="purple"
                inactiveColor="gray"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Top Ventas</Label>
                <p className="text-sm text-gray-500">
                  Se agregará a la categoría "Top Ventas"
                </p>
              </div>
              <ColoredSwitch
                checked={product.topSelling || false}
                onCheckedChange={(checked) => handleChange('topSelling', checked)}
                activeColor="orange"
                inactiveColor="gray"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stock Principal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Stock Principal del Producto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            {product?.variants && product.variants.length > 0 
              ? "Stock calculado automáticamente como suma de todas las variantes"
              : "Stock principal del producto (sin variantes)"
            }
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="stock">
                Stock Actual
                {product?.variants && product.variants.length > 0 && (
                  <span className="text-xs text-blue-600 ml-2">(Calculado automáticamente)</span>
                )}
              </Label>
              {product?.variants && product.variants.length > 0 ? (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                  <span className="font-medium text-gray-700">
                    {calculateMainStock ? calculateMainStock() : 0} unidades
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    Suma de {product.variants.length} variante(s)
                  </p>
                </div>
              ) : (
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={product.stock || 0}
                  onChange={(e) => handleChange('stock', parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              )}
            </div>
            
            <div>
              <Label htmlFor="minStock">Stock Mínimo</Label>
              <Input
                id="minStock"
                type="number"
                min="0"
                value={product.minStock || 0}
                onChange={(e) => handleChange('minStock', parseInt(e.target.value) || 0)}
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-1">Alerta cuando el stock baje de este número</p>
            </div>
            
            <div>
              <Label>¿Rastrear Inventario?</Label>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={product.trackInventory ?? true}
                  onChange={(e) => handleChange('trackInventory', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">
                  {product.trackInventory ? "Sí, rastrear stock" : "No rastrear stock"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SEO */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            Optimización SEO
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="metaTitle">Título SEO</Label>
            <Input
              id="metaTitle"
              value={product.metaTitle || ''}
              onChange={(e) => handleChange('metaTitle', e.target.value)}
              placeholder={product.name}
              maxLength={60}
            />
            <p className="text-xs text-gray-500 mt-1">
              {(product.metaTitle || '').length}/60 caracteres
            </p>
          </div>
          <div>
            <Label htmlFor="metaDescription">Descripción SEO</Label>
            <Textarea
              id="metaDescription"
              value={product.metaDescription || ''}
              onChange={(e) => handleChange('metaDescription', e.target.value)}
              placeholder="Descripción breve para motores de búsqueda"
              maxLength={160}
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">
              {(product.metaDescription || '').length}/160 caracteres
            </p>
          </div>
          <div>
            <Label htmlFor="tags">Etiquetas (separadas por comas)</Label>
            <Input
              id="tags"
              value={product.tags || ''}
              onChange={(e) => handleChange('tags', e.target.value)}
              placeholder="camiseta, personalizable, algodón"
            />
          </div>
        </CardContent>
      </Card>

    </div>
  )
})

export default GeneralProductEditor