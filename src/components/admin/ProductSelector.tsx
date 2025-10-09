"use client"

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, X, Package } from 'lucide-react'

interface Product {
  id: string
  name: string
  price: number
  image?: string
  category?: string
}

interface ProductSelectorProps {
  selectedProducts: string[]
  onSelectionChange: (productIds: string[]) => void
  placeholder?: string
}

export default function ProductSelector({ 
  selectedProducts, 
  onSelectionChange, 
  placeholder = "Buscar productos..." 
}: ProductSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    if (searchQuery.length > 2) {
      searchProducts(searchQuery)
    } else {
      setFilteredProducts([])
      setShowDropdown(false)
    }
  }, [searchQuery])

  const searchProducts = async (query: string) => {
    setLoading(true)
    try {
      // Mock data for demonstration - replace with actual API call
      const mockProducts: Product[] = [
        { id: '1', name: 'Taza Personalizada Boda', price: 15.99, category: 'Tazas' },
        { id: '2', name: 'Camiseta Personalizada', price: 19.99, category: 'Textiles' },
        { id: '3', name: 'Álbum Comunión', price: 29.99, category: 'Álbumes' },
        { id: '4', name: 'Marco Foto Personalizado', price: 24.99, category: 'Marcos' },
        { id: '5', name: 'Taza Cerámica Blanca', price: 12.99, category: 'Tazas' },
        { id: '6', name: 'Póster Personalizado A3', price: 18.99, category: 'Pósters' },
        { id: '7', name: 'Calendario Personalizado', price: 22.99, category: 'Calendarios' },
        { id: '8', name: 'Mousepad Personalizado', price: 9.99, category: 'Accesorios' }
      ]

      const filtered = mockProducts.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.category?.toLowerCase().includes(query.toLowerCase())
      )

      setFilteredProducts(filtered)
      setShowDropdown(true)
    } catch (error) {
      console.error('Error searching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProductSelect = (product: Product) => {
    if (!selectedProducts.includes(product.id)) {
      onSelectionChange([...selectedProducts, product.id])
    }
    setSearchQuery('')
    setShowDropdown(false)
  }

  const handleProductRemove = (productId: string) => {
    onSelectionChange(selectedProducts.filter(id => id !== productId))
  }

  const getSelectedProductsInfo = () => {
    // Mock product info - replace with actual data
    const mockProducts: Record<string, Product> = {
      '1': { id: '1', name: 'Taza Personalizada Boda', price: 15.99 },
      '2': { id: '2', name: 'Camiseta Personalizada', price: 19.99 },
      '3': { id: '3', name: 'Álbum Comunión', price: 29.99 },
      '4': { id: '4', name: 'Marco Foto Personalizado', price: 24.99 },
      '5': { id: '5', name: 'Taza Cerámica Blanca', price: 12.99 },
      '6': { id: '6', name: 'Póster Personalizado A3', price: 18.99 },
      '7': { id: '7', name: 'Calendario Personalizado', price: 22.99 },
      '8': { id: '8', name: 'Mousepad Personalizado', price: 9.99 }
    }

    return selectedProducts.map(id => mockProducts[id]).filter(Boolean)
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={placeholder}
            className="pl-10"
          />
        </div>

        {/* Dropdown */}
        {showDropdown && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {loading ? (
              <div className="p-3 text-center text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mx-auto"></div>
                <span className="ml-2">Buscando...</span>
              </div>
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleProductSelect(product)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                  disabled={selectedProducts.includes(product.id)}
                >
                  <div className="flex items-center gap-3">
                    <Package className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-500">
                        {product.category} • €{product.price}
                      </div>
                    </div>
                  </div>
                  {selectedProducts.includes(product.id) && (
                    <Badge variant="secondary" className="text-xs">Seleccionado</Badge>
                  )}
                </button>
              ))
            ) : (
              <div className="p-3 text-center text-gray-500">
                No se encontraron productos
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Products */}
      {selectedProducts.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">
            Productos seleccionados ({selectedProducts.length}):
          </div>
          <div className="flex flex-wrap gap-2">
            {getSelectedProductsInfo().map((product) => (
              <Badge
                key={product.id}
                variant="outline"
                className="flex items-center gap-1 px-2 py-1"
              >
                {product.name}
                <button
                  onClick={() => handleProductRemove(product.id)}
                  className="ml-1 hover:text-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}