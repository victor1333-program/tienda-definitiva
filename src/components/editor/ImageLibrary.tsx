'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import useSWR from 'swr'
import fetcher from '@/lib/fetcher'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  Search, 
  Grid3X3, 
  List, 
  X, 
  Folder,
  Image as ImageIcon
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface ImageItem {
  id: string
  name: string
  fileUrl: string
  thumbnailUrl?: string | null
  tags: string[]
  width?: number | null
  height?: number | null
  fileSize?: number | null
  fileType?: string | null
  category?: {
    id: string
    name: string
    macroCategory?: {
      id: string
      name: string
    }
  } | null
  macroCategory?: {
    id: string
    name: string
  } | null
  linkType: 'direct' | 'category' | 'macrocategory'
}

interface ImageLibraryProps {
  isOpen: boolean
  onClose: () => void
  onSelectImage: (image: ImageItem) => void
  allowUpload?: boolean
  productId: string
}


export default function ImageLibrary({ 
  isOpen, 
  onClose, 
  onSelectImage, 
  allowUpload = true,
  productId
}: ImageLibraryProps) {
  // Fetch personalization images for this product
  const { data: imageData, isLoading } = useSWR(
    productId ? `/api/products/${productId}/personalization-images` : null,
    fetcher,
    { revalidateOnFocus: false }
  )

  // Memoize images to prevent unnecessary re-renders
  const images = useMemo(() => imageData?.images || [], [imageData?.images])
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Compute filtered images directly with useMemo instead of useEffect
  const filteredImages = useMemo(() => {
    let filtered = images

    if (selectedCategory !== 'all') {
      if (selectedCategory === 'direct' || selectedCategory === 'category' || selectedCategory === 'macrocategory') {
        filtered = filtered.filter(img => img.linkType === selectedCategory)
      } else {
        filtered = filtered.filter(img => 
          img.category?.id === selectedCategory || img.macroCategory?.id === selectedCategory
        )
      }
    }

    if (searchTerm) {
      filtered = filtered.filter(img => 
        img.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        img.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    return filtered
  }, [images, searchTerm, selectedCategory])

  // Early return after all hooks
  if (!isOpen) return null

  // Generate categories from the actual images
  const allCategories = images.reduce((cats, img) => {
    if (img.category && !cats.some(c => c.id === img.category!.id)) {
      cats.push({
        id: img.category.id,
        name: img.category.name,
        count: images.filter(i => i.category?.id === img.category!.id).length
      })
    }
    if (img.macroCategory && !cats.some(c => c.id === img.macroCategory!.id)) {
      cats.push({
        id: img.macroCategory.id,
        name: `📁 ${img.macroCategory.name}`,
        count: images.filter(i => i.macroCategory?.id === img.macroCategory!.id).length
      })
    }
    return cats
  }, [] as Array<{ id: string; name: string; count: number }>)

  const categories = [
    { id: 'all', name: 'Todas', count: images.length },
    { id: 'direct', name: 'Directas', count: images.filter(img => img.linkType === 'direct').length },
    { id: 'category', name: 'Por Categoría', count: images.filter(img => img.linkType === 'category').length },
    { id: 'macrocategory', name: 'Por Macrocategoría', count: images.filter(img => img.linkType === 'macrocategory').length },
    ...allCategories
  ].filter(cat => cat.count > 0)


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <ImageIcon className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold">Biblioteca de Imágenes</h2>
              <p className="text-sm text-gray-600">
                Selecciona una imagen o sube tus propias imágenes
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
                  placeholder="Buscar imágenes..."
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
                        ? 'bg-orange-100 text-orange-700'
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
                  {filteredImages.length} imagen{filteredImages.length !== 1 ? 'es' : ''} encontrada{filteredImages.length !== 1 ? 's' : ''}
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                <span className="ml-2 text-gray-600">Cargando imágenes...</span>
              </div>
            )}

            {/* Images Grid/List */}
            {!isLoading && viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredImages.map(image => (
                  <Card 
                    key={image.id} 
                    className="group cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => onSelectImage(image)}
                  >
                    <div className="relative">
                      <img
                        src={`${window.location.origin}${image.thumbnailUrl || image.fileUrl}`}
                        alt={image.name}
                        className="w-full h-32 object-cover rounded-t-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = '/placeholder-product.png'
                        }}
                      />
                      <Badge className="absolute bottom-2 left-2 bg-blue-600 text-xs">
                        {image.linkType === 'direct' ? 'Directo' : 
                         image.linkType === 'category' ? 'Categoría' : 'Macro'}
                      </Badge>
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium truncate">{image.name}</p>
                      {image.category && (
                        <p className="text-xs text-gray-400 mt-1 truncate">
                          {image.category.name}
                        </p>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ) : !isLoading ? (
              <div className="space-y-2">
                {filteredImages.map(image => (
                  <Card 
                    key={image.id}
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => onSelectImage(image)}
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={`${window.location.origin}${image.thumbnailUrl || image.fileUrl}`}
                        alt={image.name}
                        className="w-16 h-16 object-cover rounded"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = '/placeholder-product.png'
                        }}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{image.name}</h4>
                          <Badge className="bg-blue-600">
                            {image.linkType === 'direct' ? 'Directo' : 
                             image.linkType === 'category' ? 'Categoría' : 'Macro'}
                          </Badge>
                        </div>
                        {image.category && (
                          <div className="text-sm text-gray-600 mt-1">
                            <span>Categoría: {image.category.name}</span>
                          </div>
                        )}
                        <div className="flex gap-1 mt-2">
                          {image.tags.map(tag => (
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

            {!isLoading && filteredImages.length === 0 && (
              <div className="text-center py-12">
                <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No se encontraron imágenes
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm ? 
                    `No hay imágenes que coincidan con "${searchTerm}"` :
                    images.length === 0 ?
                    'No hay imágenes vinculadas a este producto' :
                    'No hay imágenes en esta categoría'
                  }
                </p>
                {images.length === 0 && (
                  <p className="text-sm text-gray-500">
                    Las imágenes se vinculan desde el panel de administración
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}