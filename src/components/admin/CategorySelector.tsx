"use client"

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, X, Layers } from 'lucide-react'

interface Category {
  id: string
  name: string
  description?: string
  productCount?: number
}

interface CategorySelectorProps {
  selectedCategories: string[]
  onSelectionChange: (categoryIds: string[]) => void
  placeholder?: string
}

export default function CategorySelector({ 
  selectedCategories, 
  onSelectionChange, 
  placeholder = "Buscar categorías..." 
}: CategorySelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    if (searchQuery.length > 2) {
      searchCategories(searchQuery)
    } else {
      setFilteredCategories([])
      setShowDropdown(false)
    }
  }, [searchQuery])

  const searchCategories = async (query: string) => {
    setLoading(true)
    try {
      // Mock data for demonstration - replace with actual API call
      const mockCategories: Category[] = [
        { id: '1', name: 'Tazas', description: 'Tazas personalizadas', productCount: 45 },
        { id: '2', name: 'Textiles', description: 'Camisetas, sudaderas, etc.', productCount: 32 },
        { id: '3', name: 'Álbumes', description: 'Álbumes de fotos personalizados', productCount: 18 },
        { id: '4', name: 'Marcos', description: 'Marcos para fotos', productCount: 25 },
        { id: '5', name: 'Pósters', description: 'Pósters y láminas', productCount: 67 },
        { id: '6', name: 'Calendarios', description: 'Calendarios personalizados', productCount: 12 },
        { id: '7', name: 'Accesorios', description: 'Mousepads, llaveros, etc.', productCount: 89 },
        { id: '8', name: 'Bodas', description: 'Productos para bodas', productCount: 34 },
        { id: '9', name: 'Comuniones', description: 'Productos para comuniones', productCount: 23 },
        { id: '10', name: 'Cumpleaños', description: 'Productos para cumpleaños', productCount: 56 }
      ]

      const filtered = mockCategories.filter(category =>
        category.name.toLowerCase().includes(query.toLowerCase()) ||
        category.description?.toLowerCase().includes(query.toLowerCase())
      )

      setFilteredCategories(filtered)
      setShowDropdown(true)
    } catch (error) {
      console.error('Error searching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCategorySelect = (category: Category) => {
    if (!selectedCategories.includes(category.id)) {
      onSelectionChange([...selectedCategories, category.id])
    }
    setSearchQuery('')
    setShowDropdown(false)
  }

  const handleCategoryRemove = (categoryId: string) => {
    onSelectionChange(selectedCategories.filter(id => id !== categoryId))
  }

  const getSelectedCategoriesInfo = () => {
    // Mock category info - replace with actual data
    const mockCategories: Record<string, Category> = {
      '1': { id: '1', name: 'Tazas', productCount: 45 },
      '2': { id: '2', name: 'Textiles', productCount: 32 },
      '3': { id: '3', name: 'Álbumes', productCount: 18 },
      '4': { id: '4', name: 'Marcos', productCount: 25 },
      '5': { id: '5', name: 'Pósters', productCount: 67 },
      '6': { id: '6', name: 'Calendarios', productCount: 12 },
      '7': { id: '7', name: 'Accesorios', productCount: 89 },
      '8': { id: '8', name: 'Bodas', productCount: 34 },
      '9': { id: '9', name: 'Comuniones', productCount: 23 },
      '10': { id: '10', name: 'Cumpleaños', productCount: 56 }
    }

    return selectedCategories.map(id => mockCategories[id]).filter(Boolean)
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
            ) : filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                  disabled={selectedCategories.includes(category.id)}
                >
                  <div className="flex items-center gap-3">
                    <Layers className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="font-medium">{category.name}</div>
                      <div className="text-sm text-gray-500">
                        {category.description} • {category.productCount} productos
                      </div>
                    </div>
                  </div>
                  {selectedCategories.includes(category.id) && (
                    <Badge variant="secondary" className="text-xs">Seleccionada</Badge>
                  )}
                </button>
              ))
            ) : (
              <div className="p-3 text-center text-gray-500">
                No se encontraron categorías
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Categories */}
      {selectedCategories.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">
            Categorías seleccionadas ({selectedCategories.length}):
          </div>
          <div className="flex flex-wrap gap-2">
            {getSelectedCategoriesInfo().map((category) => (
              <Badge
                key={category.id}
                variant="outline"
                className="flex items-center gap-1 px-2 py-1"
              >
                {category.name}
                <button
                  onClick={() => handleCategoryRemove(category.id)}
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