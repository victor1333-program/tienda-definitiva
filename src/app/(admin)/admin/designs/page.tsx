'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { 
  Search, 
  Plus, 
  Edit3, 
  Copy, 
  Trash2, 
  Eye,
  Filter,
  Grid3X3,
  List,
  Calendar,
  User,
  Package
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

interface Design {
  id: string
  name: string
  description?: string
  previewUrl?: string
  elements: any[]
  canvasSize: { width: number; height: number }
  canvasBackground: string
  isTemplate: boolean
  isPublic: boolean
  productId?: string
  variantId?: string
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    name: string
    email: string
  }
  _count?: {
    orders: number
    likes: number
  }
}

interface DesignsPageData {
  designs: Design[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    hasNext: boolean
    hasPrev: boolean
  }
  stats: {
    totalDesigns: number
    totalTemplates: number
    publicDesigns: number
    privateDesigns: number
  }
}

export default function DesignsPage() {
  const [data, setData] = useState<DesignsPageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'designs' | 'templates'>('all')
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'public' | 'private'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [page, setPage] = useState(1)

  const fetchDesigns = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(typeFilter !== 'all' && { type: typeFilter }),
        ...(visibilityFilter !== 'all' && { visibility: visibilityFilter })
      })

      const response = await fetch(`/api/designs?${params}`)
      if (!response.ok) throw new Error('Error al cargar diseños')
      
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al cargar los diseños')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDesigns()
  }, [page, searchTerm, typeFilter, visibilityFilter])

  const handleDeleteDesign = async (designId: string) => {
    if (!confirm('¿Estás seguro de eliminar este diseño?')) return

    try {
      const response = await fetch(`/api/designs/${designId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Error al eliminar diseño')

      toast.success('Diseño eliminado correctamente')
      fetchDesigns()
    } catch (error) {
      toast.error('Error al eliminar el diseño')
    }
  }

  const handleDuplicateDesign = async (design: Design) => {
    try {
      const response = await fetch('/api/designs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${design.name} (Copia)`,
          description: design.description,
          elements: design.elements,
          canvasSize: design.canvasSize,
          canvasBackground: design.canvasBackground,
          isTemplate: false,
          isPublic: false
        })
      })

      if (!response.ok) throw new Error('Error al duplicar diseño')

      toast.success('Diseño duplicado correctamente')
      fetchDesigns()
    } catch (error) {
      toast.error('Error al duplicar el diseño')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const generatePreview = (design: Design) => {
    // En una implementación real, esto generaría una imagen preview del diseño
    return design.previewUrl || '/placeholder-design.png'
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
          <h1 className="text-3xl font-bold text-gray-900">🎨 Diseños y Plantillas</h1>
          <p className="text-gray-600">Gestiona diseños personalizados y plantillas</p>
        </div>
        <Link href="/admin/designs/editor">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nuevo Diseño
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      {data?.stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Diseños</p>
                <p className="text-2xl font-bold text-gray-900">{data.stats.totalDesigns}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Grid3X3 className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Plantillas</p>
                <p className="text-2xl font-bold text-gray-900">{data.stats.totalTemplates}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Eye className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Públicos</p>
                <p className="text-2xl font-bold text-gray-900">{data.stats.publicDesigns}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <User className="w-8 h-8 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Privados</p>
                <p className="text-2xl font-bold text-gray-900">{data.stats.privateDesigns}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar diseños..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={typeFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setTypeFilter('all')}
              size="sm"
            >
              Todos
            </Button>
            <Button
              variant={typeFilter === 'designs' ? 'default' : 'outline'}
              onClick={() => setTypeFilter('designs')}
              size="sm"
            >
              Diseños
            </Button>
            <Button
              variant={typeFilter === 'templates' ? 'default' : 'outline'}
              onClick={() => setTypeFilter('templates')}
              size="sm"
            >
              Plantillas
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant={visibilityFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setVisibilityFilter('all')}
              size="sm"
            >
              Todos
            </Button>
            <Button
              variant={visibilityFilter === 'public' ? 'default' : 'outline'}
              onClick={() => setVisibilityFilter('public')}
              size="sm"
            >
              Públicos
            </Button>
            <Button
              variant={visibilityFilter === 'private' ? 'default' : 'outline'}
              onClick={() => setVisibilityFilter('private')}
              size="sm"
            >
              Privados
            </Button>
          </div>

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
      </Card>

      {/* Designs Grid/List */}
      <div className={
        viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          : "space-y-4"
      }>
        {data?.designs.map((design) => (
          <Card key={design.id} className={`overflow-hidden ${viewMode === 'list' ? 'p-4' : ''}`}>
            {viewMode === 'grid' ? (
              // Grid View
              <div>
                <div className="aspect-video bg-gray-100 relative overflow-hidden">
                  <img
                    src={generatePreview(design)}
                    alt={design.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-design.png'
                    }}
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    {design.isTemplate && (
                      <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                        Plantilla
                      </span>
                    )}
                    {design.isPublic && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        Público
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">
                    {design.name}
                  </h3>
                  {design.description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {design.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>{formatDate(design.createdAt)}</span>
                    {design._count && (
                      <span>{design._count.orders} usos</span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Link href={`/admin/designs/editor?designId=${design.id}`} className="flex-1">
                      <Button size="sm" variant="outline" className="w-full">
                        <Edit3 className="w-3 h-3 mr-1" />
                        Editar
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDuplicateDesign(design)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteDesign(design.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              // List View
              <div className="flex items-start gap-4">
                <div className="w-24 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={generatePreview(design)}
                    alt={design.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-design.png'
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-gray-900 truncate">
                        {design.name}
                      </h3>
                      {design.description && (
                        <p className="text-sm text-gray-600 line-clamp-1">
                          {design.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(design.createdAt)}
                        </span>
                        {design.user && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {design.user.name}
                          </span>
                        )}
                        {design._count && (
                          <span>{design._count.orders} usos</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {design.isTemplate && (
                        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                          Plantilla
                        </span>
                      )}
                      {design.isPublic && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                          Público
                        </span>
                      )}
                      <div className="flex gap-1">
                        <Link href={`/admin/designs/editor?designId=${design.id}`}>
                          <Button size="sm" variant="outline">
                            <Edit3 className="w-3 h-3" />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDuplicateDesign(design)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteDesign(design.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {data?.designs.length === 0 && (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay diseños</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || typeFilter !== 'all' || visibilityFilter !== 'all'
              ? 'No se encontraron diseños con los filtros aplicados'
              : 'Comienza creando tu primer diseño personalizado'
            }
          </p>
          <Link href="/admin/designs/editor">
            <Button className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Crear Diseño
            </Button>
          </Link>
        </div>
      )}

      {/* Pagination */}
      {data?.pagination && data.pagination.pages > 1 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Mostrando {((data.pagination.page - 1) * data.pagination.limit) + 1} - {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} de {data.pagination.total} diseños
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={!data.pagination.hasPrev}
                onClick={() => setPage(page - 1)}
              >
                Anterior
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={!data.pagination.hasNext}
                onClick={() => setPage(page + 1)}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}