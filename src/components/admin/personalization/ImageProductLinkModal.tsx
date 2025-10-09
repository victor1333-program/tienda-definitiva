"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Package, Check, Link as LinkIcon, ExternalLink } from "lucide-react"
import toast from "react-hot-toast"

interface Product {
  id: string
  name: string
  slug: string
  basePrice: number
  mainImage: string | null
  isLinked: boolean
}

interface ImageProductLinkModalProps {
  isOpen: boolean
  onClose: () => void
  imageId: string
  imageName: string
  onSuccess?: () => void
}

export default function ImageProductLinkModal({
  isOpen,
  onClose,
  imageId,
  imageName,
  onSuccess
}: ImageProductLinkModalProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState("")
  const [linkToAll, setLinkToAll] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchProducts()
    }
  }, [isOpen, imageId])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProducts(products)
    } else {
      setFilteredProducts(
        products.filter(product =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.slug.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }
  }, [searchTerm, products])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/products/personalizable?imageId=${imageId}`)
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
        
        // Pre-seleccionar productos que ya están vinculados
        const linkedProductIds = data.products
          .filter((product: Product) => product.isLinked)
          .map((product: Product) => product.id)
        setSelectedProducts(new Set(linkedProductIds))
      } else {
        toast.error('Error al cargar productos')
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }

  const handleProductToggle = (productId: string) => {
    const newSelected = new Set(selectedProducts)
    if (newSelected.has(productId)) {
      newSelected.delete(productId)
    } else {
      newSelected.add(productId)
    }
    setSelectedProducts(newSelected)
    setLinkToAll(false) // Si selecciona manualmente, desactivar "vincular a todos"
  }

  const handleLinkToAllToggle = (checked: boolean) => {
    setLinkToAll(checked)
    if (checked) {
      // Si se activa "vincular a todos", seleccionar todos los productos
      setSelectedProducts(new Set(products.map(p => p.id)))
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/personalization/images/${imageId}/link-products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productIds: Array.from(selectedProducts),
          linkToAll
        })
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(result.message)
        onSuccess?.()
        onClose()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al guardar vínculos')
      }
    } catch (error) {
      console.error('Error saving links:', error)
      toast.error('Error al guardar vínculos')
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    setSearchTerm("")
    setSelectedProducts(new Set())
    setLinkToAll(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Vincular Imagen a Productos
          </DialogTitle>
          <DialogDescription>
            Selecciona los productos donde quieres que aparezca la imagen "{imageName}" en el editor
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Controles superiores */}
          <div className="flex-shrink-0 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="linkToAll"
                  checked={linkToAll}
                  onCheckedChange={handleLinkToAllToggle}
                />
                <Label htmlFor="linkToAll">Vincular a todos los productos personalizables</Label>
              </div>
              <Badge variant="secondary">
                {selectedProducts.size} producto(s) seleccionado(s)
              </Badge>
            </div>

            {!linkToAll && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}
          </div>

          {/* Lista de productos */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Cargando productos...</p>
                </div>
              </div>
            ) : linkToAll ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Package className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Vincular a todos los productos</h3>
                  <p className="text-gray-600 mb-4">
                    La imagen será disponible en todos los productos personalizables ({products.length} productos)
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((product) => (
                  <Card 
                    key={product.id} 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedProducts.has(product.id) 
                        ? 'ring-2 ring-orange-500 bg-orange-50' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleProductToggle(product.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          {product.mainImage ? (
                            <img
                              src={product.mainImage}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                              <Package className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium text-sm truncate" title={product.name}>
                                {product.name}
                              </h3>
                              <p className="text-xs text-gray-500 mt-1">
                                €{product.basePrice.toFixed(2)}
                              </p>
                              {product.isLinked && (
                                <Badge variant="default" className="mt-1 text-xs">
                                  Ya vinculado
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex-shrink-0 ml-2">
                              {selectedProducts.has(product.id) && (
                                <Check className="h-5 w-5 text-orange-600" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!loading && !linkToAll && filteredProducts.length === 0 && (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No se encontraron productos</h3>
                  <p className="text-gray-600">
                    {searchTerm 
                      ? "Prueba con otros términos de búsqueda" 
                      : "No hay productos personalizables disponibles"
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button variant="outline" onClick={handleClose} disabled={saving}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={saving || (!linkToAll && selectedProducts.size === 0)}
          >
            {saving ? 'Guardando...' : 'Guardar Vínculos'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}