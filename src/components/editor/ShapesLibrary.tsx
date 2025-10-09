'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import useSWR from 'swr'
import fetcher from '@/lib/fetcher'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Grid3X3, 
  List, 
  X, 
  Shapes,
  Filter,
  Folder
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface ShapeItem {
  id: string
  name: string
  category: string
  fileUrl: string
  tags: string[]
  isMask: boolean
  isFromLibrary: boolean
  fileType?: string | null
  fileSize?: number | null
  createdAt: string
}

interface ShapesLibraryProps {
  isOpen: boolean
  onClose: () => void
  onSelectShape: (shape: ShapeItem) => void
}

export default function ShapesLibrary({ 
  isOpen, 
  onClose, 
  onSelectShape
}: ShapesLibraryProps) {
  // Fetch shapes from the API
  const { data: shapes, isLoading } = useSWR(
    isOpen ? '/api/personalization/shapes' : null,
    fetcher,
    { revalidateOnFocus: false }
  )

  // Memoize shapes to prevent unnecessary re-renders
  const shapesList = useMemo(() => shapes || [], [shapes])
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Compute filtered shapes directly with useMemo instead of useEffect
  const filteredShapes = useMemo(() => {
    let filtered = shapesList

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(shape => shape.category === selectedCategory)
    }

    if (searchTerm) {
      filtered = filtered.filter(shape => 
        shape.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shape.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    return filtered
  }, [shapesList, searchTerm, selectedCategory])

  // Early return after all hooks
  if (!isOpen) return null

  // Generate categories from the actual shapes
  const allCategories = shapesList.reduce((cats, shape) => {
    if (!cats.some(c => c.id === shape.category)) {
      cats.push({
        id: shape.category,
        name: getCategoryDisplayName(shape.category),
        count: shapesList.filter(s => s.category === shape.category).length
      })
    }
    return cats
  }, [] as Array<{ id: string; name: string; count: number }>)

  const categories = [
    { id: 'all', name: 'Todas', count: shapesList.length },
    ...allCategories
  ].filter(cat => cat.count > 0)

  function getCategoryDisplayName(category: string) {
    const categoryNames: Record<string, string> = {
      'geometricas': '🔷 Geométricas',
      'decorativas': '✨ Decorativas', 
      'letras': '🔤 Letras',
      'marcos': '🖼️ Marcos',
      'naturaleza': '🌿 Naturaleza'
    }
    return categoryNames[category] || category
  }


  const handleSelectShape = (shape: ShapeItem) => {
    onSelectShape(shape)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <Shapes className="w-6 h-6 text-purple-600" />
            <div>
              <h2 className="text-xl font-bold">Biblioteca de Formas</h2>
              <p className="text-sm text-gray-600">
                Selecciona una forma para agregar al diseño
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 border-r bg-gray-50 p-4">
            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar formas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Categorías</h3>
              <div className="space-y-1">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-purple-100 text-purple-700'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Folder className="w-4 h-4" />
                      {category.name}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {category.count}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>

            {/* View Mode */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Vista</h3>
              <div className="flex gap-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-4 overflow-y-auto">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {filteredShapes.length} forma{filteredShapes.length !== 1 ? 's' : ''} encontrada{filteredShapes.length !== 1 ? 's' : ''}
                </span>
                {searchTerm && (
                  <Badge variant="secondary">
                    Filtro: "{searchTerm}"
                  </Badge>
                )}
              </div>
            </div>

            {/* Loading state */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <span className="ml-2 text-gray-600">Cargando formas...</span>
              </div>
            )}

            {/* Shapes Grid/List */}
            {!isLoading && viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {filteredShapes.map(shape => (
                  <Card 
                    key={shape.id} 
                    className="group cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => handleSelectShape(shape)}
                  >
                    <div className="relative p-4">
                      <div className="w-full h-20 flex items-center justify-center bg-gray-50 rounded border">
                        {shape.fileType === 'image/svg+xml' ? (
                          <img
                            src={`${window.location.origin}${shape.fileUrl}`}
                            alt={shape.name}
                            className="w-12 h-12 object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-300 rounded flex items-center justify-center text-lg font-bold text-gray-600">
                            {shape.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <Badge className="absolute bottom-2 right-2 bg-purple-600 text-xs">
                        {getCategoryDisplayName(shape.category).replace(/^\w+\s/, '')}
                      </Badge>
                    </div>
                    <div className="p-3 pt-0">
                      <p className="text-sm font-medium truncate">{shape.name}</p>
                      <div className="text-xs text-gray-500 mt-1 text-center">
                        <span>{shape.isMask ? 'Máscara' : 'Forma'}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : !isLoading ? (
              <div className="space-y-2">
                {filteredShapes.map(shape => (
                  <Card 
                    key={shape.id}
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleSelectShape(shape)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 flex items-center justify-center bg-gray-50 rounded border">
                        {shape.fileType === 'image/svg+xml' ? (
                          <img
                            src={`${window.location.origin}${shape.fileUrl}`}
                            alt={shape.name}
                            className="w-8 h-8 object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                            }}
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gray-300 rounded flex items-center justify-center text-sm font-bold text-gray-600">
                            {shape.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{shape.name}</h4>
                          <Badge className="bg-purple-600">
                            {getCategoryDisplayName(shape.category)}
                          </Badge>
                          {shape.isMask && (
                            <Badge variant="secondary">
                              Máscara
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          <span>{shape.fileType}</span>
                        </div>
                        <div className="flex gap-1 mt-2">
                          {shape.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : null}

            {!isLoading && filteredShapes.length === 0 && (
              <div className="text-center py-12">
                <Shapes className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No se encontraron formas
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm ? 
                    `No hay formas que coincidan con "${searchTerm}"` :
                    shapesList.length === 0 ?
                    'No hay formas disponibles' :
                    'No hay formas en esta categoría'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}