"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Settings, Package, Edit2, Eye, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ColoredSwitch } from "@/components/ui/ColoredSwitch"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-hot-toast"
import useSWR from "swr"
import fetcher from "@/lib/fetcher"

interface Product {
  id: string
  name: string
  slug: string
  basePrice: number
  image?: string
  description?: string
  isActive: boolean
  category?: {
    name: string
  }
}

interface FeaturedProductsProps {
  title: string
  subtitle: string
  productIds: string[]
  layout: 'carousel' | 'grid'
  itemsPerRow: 2 | 3 | 4 | 5
  showPrice: boolean
  showAddToCart: boolean
  showRating?: boolean
  maxProducts?: number
  sortBy?: 'manual' | 'price-asc' | 'price-desc' | 'name'
}

interface FeaturedProductsEditorProps {
  props: FeaturedProductsProps
  onUpdate: (newProps: Partial<FeaturedProductsProps>) => void
}

export default function FeaturedProductsEditor({ 
  props, 
  onUpdate 
}: FeaturedProductsEditorProps) {
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  
  // Obtener todos los productos disponibles
  const { data: allProducts, error } = useSWR('/api/products', fetcher)

  // Cargar productos seleccionados cuando cambien los props
  useEffect(() => {
    if (allProducts && props.productIds.length > 0) {
      const selected = allProducts.filter((prod: Product) => 
        props.productIds.includes(prod.id)
      )
      setSelectedProducts(selected)
    }
  }, [allProducts, props.productIds])

  const addProduct = (product: Product) => {
    if (props.productIds.includes(product.id)) {
      toast.error('Este producto ya está seleccionado')
      return
    }

    const maxProds = props.maxProducts || 12
    if (props.productIds.length >= maxProds) {
      toast.error(`Máximo ${maxProds} productos permitidos`)
      return
    }

    const newProducts = [...props.productIds, product.id]
    onUpdate({ productIds: newProducts })
    setSelectedProducts([...selectedProducts, product])
    toast.success('Producto agregado')
  }

  const removeProduct = (productId: string) => {
    const newProducts = props.productIds.filter(id => id !== productId)
    onUpdate({ productIds: newProducts })
    setSelectedProducts(selectedProducts.filter(prod => prod.id !== productId))
    toast.success('Producto eliminado')
  }

  const reorderProducts = (fromIndex: number, toIndex: number) => {
    const newOrder = [...props.productIds]
    const [moved] = newOrder.splice(fromIndex, 1)
    newOrder.splice(toIndex, 0, moved)
    onUpdate({ productIds: newOrder })

    const newSelected = [...selectedProducts]
    const [movedProd] = newSelected.splice(fromIndex, 1)
    newSelected.splice(toIndex, 0, movedProd)
    setSelectedProducts(newSelected)
  }

  // Filtrar productos para búsqueda
  const filteredProducts = allProducts?.filter((product: Product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600 text-sm">Error al cargar los productos</p>
      </div>
    )
  }

  if (!allProducts) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
        <p className="text-sm text-gray-600">Cargando productos...</p>
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
              placeholder="Productos Destacados"
              className="mt-1"
            />
          </div>

          <div>
            <Label>Subtítulo</Label>
            <Input
              value={props.subtitle}
              onChange={(e) => onUpdate({ subtitle: e.target.value })}
              placeholder="Los mejores productos seleccionados para ti"
              className="mt-1"
            />
          </div>

          {/* Layout */}
          <div>
            <Label>Tipo de Layout</Label>
            <div className="flex gap-2 mt-2">
              {[
                { value: 'grid', label: 'Grid' },
                { value: 'carousel', label: 'Carrusel' }
              ].map((layout) => (
                <Button
                  key={layout.value}
                  size="sm"
                  variant={props.layout === layout.value ? 'default' : 'outline'}
                  onClick={() => onUpdate({ layout: layout.value as any })}
                >
                  {layout.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Items por fila */}
          <div>
            <Label>Productos por Fila</Label>
            <div className="flex gap-2 mt-2">
              {[2, 3, 4, 5].map((items) => (
                <Button
                  key={items}
                  size="sm"
                  variant={props.itemsPerRow === items ? 'default' : 'outline'}
                  onClick={() => onUpdate({ itemsPerRow: items as any })}
                >
                  {items}
                </Button>
              ))}
            </div>
          </div>

          {/* Opciones de visualización */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label>Mostrar Precio</Label>
              <ColoredSwitch
                checked={props.showPrice}
                onCheckedChange={(checked) => onUpdate({ showPrice: checked })}
                activeColor="green"
                inactiveColor="gray"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Mostrar Botón "Agregar"</Label>
              <ColoredSwitch
                checked={props.showAddToCart}
                onCheckedChange={(checked) => onUpdate({ showAddToCart: checked })}
                activeColor="green"
                inactiveColor="gray"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Mostrar Valoración</Label>
              <ColoredSwitch
                checked={props.showRating ?? false}
                onCheckedChange={(checked) => onUpdate({ showRating: checked })}
                activeColor="green"
                inactiveColor="gray"
              />
            </div>
          </div>

          {/* Máximo de productos */}
          <div>
            <Label>Máximo de Productos</Label>
            <select
              value={props.maxProducts || 12}
              onChange={(e) => onUpdate({ maxProducts: parseInt(e.target.value) })}
              className="w-full mt-1 p-2 border border-gray-300 rounded-lg"
            >
              <option value={6}>6 productos</option>
              <option value={8}>8 productos</option>
              <option value={12}>12 productos</option>
              <option value={16}>16 productos</option>
              <option value={20}>20 productos</option>
            </select>
          </div>

          {/* Ordenamiento */}
          <div>
            <Label>Ordenar Por</Label>
            <select
              value={props.sortBy || 'manual'}
              onChange={(e) => onUpdate({ sortBy: e.target.value as any })}
              className="w-full mt-1 p-2 border border-gray-300 rounded-lg"
            >
              <option value="manual">Orden manual</option>
              <option value="name">Nombre (A-Z)</option>
              <option value="price-asc">Precio (menor a mayor)</option>
              <option value="price-desc">Precio (mayor a menor)</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Productos Seleccionados ({selectedProducts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedProducts.length > 0 ? (
            <div className={`grid gap-4 ${
              props.itemsPerRow === 2 ? 'grid-cols-2' :
              props.itemsPerRow === 3 ? 'grid-cols-3' :
              props.itemsPerRow === 4 ? 'grid-cols-4' :
              'grid-cols-5'
            }`}>
              {selectedProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="relative group border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Imagen del producto */}
                  <div className="aspect-square bg-gray-100 overflow-hidden">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
                        <Package className="w-8 h-8 text-blue-500" />
                      </div>
                    )}
                  </div>

                  {/* Contenido */}
                  <div className="p-3">
                    <h4 className="font-medium text-sm line-clamp-2">{product.name}</h4>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-bold text-orange-600">
                        €{product.basePrice.toFixed(2)}
                      </span>
                      <Badge variant={product.isActive ? "default" : "secondary"} className="text-xs">
                        {product.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                    {product.category && (
                      <p className="text-xs text-gray-500 mt-1">{product.category.name}</p>
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
                          onClick={() => reorderProducts(index, index - 1)}
                        >
                          ↑
                        </Button>
                      )}
                      {index < selectedProducts.length - 1 && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 w-6 p-0 bg-white"
                          onClick={() => reorderProducts(index, index + 1)}
                        >
                          ↓
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 w-6 p-0 bg-white text-red-600"
                        onClick={() => removeProduct(product.id)}
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
              <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No hay productos seleccionados</p>
              <p className="text-xs">Selecciona productos de la lista de abajo</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Agregar Productos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Buscador */}
          <div className="mb-4">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar productos por nombre o categoría..."
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto">
            {filteredProducts
              .filter((prod: Product) => !props.productIds.includes(prod.id))
              .map((product: Product) => (
                <div
                  key={product.id}
                  className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => addProduct(product)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
                          <Package className="w-4 h-4 text-blue-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{product.name}</h4>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-orange-600">
                          €{product.basePrice.toFixed(2)}
                        </span>
                        <Badge variant={product.isActive ? "default" : "secondary"} className="text-xs">
                          {product.isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </div>
                      {product.category && (
                        <p className="text-xs text-gray-500">{product.category.name}</p>
                      )}
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
                {props.title || 'Productos Destacados'}
              </h2>
              {props.subtitle && (
                <p className="text-gray-600">
                  {props.subtitle}
                </p>
              )}
            </div>

            {/* Grid/Carrusel de productos */}
            <div className={`grid gap-6 ${
              props.itemsPerRow === 2 ? 'grid-cols-2' :
              props.itemsPerRow === 3 ? 'grid-cols-3' :
              props.itemsPerRow === 4 ? 'grid-cols-4' :
              'grid-cols-5'
            }`}>
              {selectedProducts.slice(0, props.maxProducts || 12).map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
                >
                  <div className="aspect-square overflow-hidden rounded-t-lg">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                        <Package className="w-8 h-8 text-blue-500" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 line-clamp-2 mb-2">
                      {product.name}
                    </h3>
                    
                    {props.showRating && (
                      <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className="w-3 h-3 fill-yellow-400 text-yellow-400" 
                          />
                        ))}
                        <span className="text-xs text-gray-500 ml-1">(4.5)</span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      {props.showPrice && (
                        <span className="text-lg font-bold text-orange-600">
                          €{product.basePrice.toFixed(2)}
                        </span>
                      )}
                      {props.showAddToCart && (
                        <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                          Agregar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}