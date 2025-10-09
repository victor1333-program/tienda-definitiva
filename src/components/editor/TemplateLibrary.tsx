'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Plus, 
  Eye, 
  Copy, 
  Edit3, 
  Trash2,
  Filter,
  Grid3X3,
  List,
  Heart,
  Download,
  Share2,
  Bookmark,
  Tag,
  User
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

interface Template {
  id: string
  name: string
  description?: string
  previewUrl?: string
  elements: any[]
  canvasSize: { width: number; height: number }
  canvasBackground: string
  category: string
  tags: string[]
  isPublic: boolean
  isPremium: boolean
  price?: number
  downloads: number
  likes: number
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
    email: string
  }
  _count?: {
    uses: number
    likes: number
  }
}

interface TemplateLibraryProps {
  onSelectTemplate?: (template: Template) => void
  showActions?: boolean
  selectionMode?: boolean
}

export default function TemplateLibrary({ 
  onSelectTemplate, 
  showActions = true,
  selectionMode = false
}: TemplateLibraryProps) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'downloads'>('recent')

  const categories = [
    { value: 'all', label: 'Todas' },
    { value: 'business', label: 'Negocios' },
    { value: 'events', label: 'Eventos' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'education', label: 'Educación' },
    { value: 'personal', label: 'Personal' },
    { value: 'seasonal', label: 'Temporada' },
    { value: 'sports', label: 'Deportes' },
    { value: 'art', label: 'Arte' }
  ]

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        type: 'templates',
        visibility: 'public',
        ...(searchTerm && { search: searchTerm }),
        ...(categoryFilter !== 'all' && { category: categoryFilter }),
        sortBy
      })

      const response = await fetch(`/api/designs?${params}`)
      if (!response.ok) throw new Error('Error al cargar plantillas')
      
      const data = await response.json()
      setTemplates(data.designs || [])
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al cargar las plantillas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [searchTerm, categoryFilter, sortBy])

  const handleUseTemplate = async (template: Template) => {
    try {
      // Crear una copia del template como diseño personal
      const response = await fetch('/api/designs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${template.name} (Copia)`,
          description: `Basado en la plantilla: ${template.name}`,
          elements: template.elements,
          canvasSize: template.canvasSize,
          canvasBackground: template.canvasBackground,
          isTemplate: false,
          isPublic: false,
          templateId: template.id,
          tags: template.tags
        })
      })

      if (!response.ok) throw new Error('Error al usar plantilla')

      const newDesign = await response.json()
      
      if (onSelectTemplate) {
        onSelectTemplate(template)
      } else {
        // Redirigir al editor con el nuevo diseño
        window.open(`/admin/designs/editor?designId=${newDesign.id}`, '_blank')
      }

      toast.success('Plantilla aplicada correctamente')
    } catch (error) {
      toast.error('Error al usar la plantilla')
    }
  }

  const handleLikeTemplate = async (templateId: string) => {
    try {
      const response = await fetch(`/api/designs/${templateId}/like`, {
        method: 'POST'
      })

      if (!response.ok) throw new Error('Error al dar like')

      // Actualizar el estado local
      setTemplates(templates.map(template => 
        template.id === templateId 
          ? { ...template, likes: template.likes + 1 }
          : template
      ))

      toast.success('¡Plantilla guardada en favoritos!')
    } catch (error) {
      toast.error('Error al guardar en favoritos')
    }
  }

  const generatePreview = (template: Template) => {
    // En una implementación real, esto generaría una imagen preview del diseño
    return template.previewUrl || '/placeholder-template.png'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📚 Biblioteca de Plantillas</h2>
          <p className="text-gray-600">Encuentra la plantilla perfecta para tu diseño</p>
        </div>
        {showActions && (
          <Link href="/admin/designs/editor">
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Crear Plantilla
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar plantillas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="recent">Más recientes</option>
              <option value="popular">Más populares</option>
              <option value="downloads">Más descargadas</option>
            </select>

            <div className="flex gap-1 border rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Templates Grid/List */}
      <div className={
        viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          : "space-y-4"
      }>
        {templates.map((template) => (
          <Card key={template.id} className={`group overflow-hidden hover:shadow-lg transition-shadow ${
            selectionMode ? 'cursor-pointer hover:border-primary-500' : ''
          } ${viewMode === 'list' ? 'p-4' : ''}`}>
            {viewMode === 'grid' ? (
              // Grid View
              <div onClick={() => selectionMode && onSelectTemplate?.(template)}>
                <div className="aspect-video bg-gray-100 relative overflow-hidden">
                  <img
                    src={generatePreview(template)}
                    alt={template.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-template.png'
                    }}
                  />
                  
                  {/* Overlay con acciones */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(`/admin/designs/editor?templateId=${template.id}`, '_blank')
                        }}
                        className="bg-white hover:bg-gray-100"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Ver
                      </Button>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleUseTemplate(template)
                        }}
                        className="bg-primary-600 hover:bg-primary-700 text-white"
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Usar
                      </Button>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="absolute top-2 right-2 flex flex-col gap-1">
                    {template.isPremium && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                        Premium
                      </span>
                    )}
                    {template.category && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {categories.find(c => c.value === template.category)?.label}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">
                    {template.name}
                  </h3>
                  {template.description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {template.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {template.user.name}
                    </span>
                    <span>{formatDate(template.createdAt)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        {template.downloads}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {template.likes}
                      </span>
                    </div>
                    
                    {!selectionMode && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleLikeTemplate(template.id)}
                        className="p-1 h-auto"
                      >
                        <Heart className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  {/* Tags */}
                  {template.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {template.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {template.tags.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{template.tags.length - 3} más
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // List View
              <div 
                className="flex items-start gap-4"
                onClick={() => selectionMode && onSelectTemplate?.(template)}
              >
                <div className="w-32 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={generatePreview(template)}
                    alt={template.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-template.png'
                    }}
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-gray-900 truncate">
                        {template.name}
                      </h3>
                      {template.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {template.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {template.user.name}
                        </span>
                        <span>{formatDate(template.createdAt)}</span>
                        <span className="flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          {template.downloads}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {template.likes}
                        </span>
                      </div>

                      {/* Tags */}
                      {template.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {template.tags.slice(0, 4).map((tag, index) => (
                            <span
                              key={index}
                              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      {template.isPremium && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                          Premium
                        </span>
                      )}
                      
                      {!selectionMode && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`/admin/designs/editor?templateId=${template.id}`, '_blank')}
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleUseTemplate(template)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleLikeTemplate(template.id)}
                          >
                            <Heart className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {templates.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            📚
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay plantillas</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || categoryFilter !== 'all'
              ? 'No se encontraron plantillas con los filtros aplicados'
              : 'Aún no hay plantillas disponibles'
            }
          </p>
          {showActions && (
            <Link href="/admin/designs/editor">
              <Button className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Crear Primera Plantilla
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}