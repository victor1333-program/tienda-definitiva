'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { toast } from "react-hot-toast"
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Copy,
  Trash2,
  Menu as MenuIcon,
  Navigation,
  Settings,
  Globe,
  Smartphone,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  Grid3X3
} from "lucide-react"

interface Menu {
  id: string
  name: string
  slug: string
  description: string
  location: string
  isActive: boolean
  sortOrder: number
  maxDepth: number
  showOnMobile: boolean
  itemCount: number
  createdAt: string
  updatedAt: string
}

export default function MenusPage() {
  const router = useRouter()
  const [menus, setMenus] = useState<Menu[]>([])
  const [filteredMenus, setFilteredMenus] = useState<Menu[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [locationFilter, setLocationFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadMenus()
  }, [])

  useEffect(() => {
    filterMenus()
  }, [menus, searchTerm, locationFilter])

  const loadMenus = async () => {
    try {
      const response = await fetch('/api/content/menus')
      if (response.ok) {
        const data = await response.json()
        setMenus(data)
      }
    } catch (error) {
      console.error('Error loading menus:', error)
      toast.error('Error al cargar menús')
    } finally {
      setIsLoading(false)
    }
  }

  const filterMenus = () => {
    let filtered = menus

    if (searchTerm) {
      filtered = filtered.filter(menu => 
        menu.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        menu.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (locationFilter !== 'all') {
      filtered = filtered.filter(menu => menu.location === locationFilter)
    }

    setFilteredMenus(filtered)
  }

  const duplicateMenu = async (menuId: string) => {
    try {
      const response = await fetch(`/api/content/menus/${menuId}/duplicate`, {
        method: 'POST'
      })
      if (response.ok) {
        toast.success('Menú duplicado exitosamente')
        loadMenus()
      }
    } catch (error) {
      toast.error('Error al duplicar menú')
    }
  }

  const toggleActiveStatus = async (menuId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/content/menus/${menuId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      })
      if (response.ok) {
        toast.success(`Menú ${!isActive ? 'activado' : 'desactivado'}`)
        loadMenus()
      }
    } catch (error) {
      toast.error('Error al cambiar estado del menú')
    }
  }

  const updateSortOrder = async (menuId: string, direction: 'up' | 'down') => {
    try {
      const response = await fetch(`/api/content/menus/${menuId}/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction })
      })
      if (response.ok) {
        loadMenus()
      }
    } catch (error) {
      toast.error('Error al reordenar menú')
    }
  }

  const deleteMenu = async (menuId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este menú? Se eliminarán todos sus elementos.')) return

    try {
      const response = await fetch(`/api/content/menus/${menuId}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        toast.success('Menú eliminado exitosamente')
        loadMenus()
      }
    } catch (error) {
      toast.error('Error al eliminar menú')
    }
  }

  const getLocationIcon = (location: string) => {
    switch (location) {
      case 'HEADER': return <Navigation className="w-4 h-4" />
      case 'FOOTER': return <Grid3X3 className="w-4 h-4" />
      case 'SIDEBAR': return <MenuIcon className="w-4 h-4" />
      case 'MOBILE': return <Smartphone className="w-4 h-4" />
      default: return <Globe className="w-4 h-4" />
    }
  }

  const getLocationLabel = (location: string) => {
    switch (location) {
      case 'HEADER': return 'Header'
      case 'FOOTER': return 'Footer'
      case 'SIDEBAR': return 'Sidebar'
      case 'MOBILE': return 'Móvil'
      case 'BREADCRUMB': return 'Breadcrumb'
      case 'CATEGORY': return 'Categorías'
      default: return location
    }
  }

  const getLocationColor = (location: string) => {
    switch (location) {
      case 'HEADER': return 'bg-blue-100 text-blue-800'
      case 'FOOTER': return 'bg-gray-100 text-gray-800'
      case 'SIDEBAR': return 'bg-green-100 text-green-800'
      case 'MOBILE': return 'bg-purple-100 text-purple-800'
      case 'BREADCRUMB': return 'bg-orange-100 text-orange-800'
      case 'CATEGORY': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const locations = [
    { value: 'all', label: 'Todas las ubicaciones' },
    { value: 'HEADER', label: 'Header' },
    { value: 'FOOTER', label: 'Footer' },
    { value: 'SIDEBAR', label: 'Sidebar' },
    { value: 'MOBILE', label: 'Móvil' },
    { value: 'BREADCRUMB', label: 'Breadcrumb' },
    { value: 'CATEGORY', label: 'Categorías' }
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando menús...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🧭 Gestión de Menús</h1>
          <p className="text-gray-600 mt-1">
            Administra los menús de navegación del sitio web
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => router.push('/admin/content/menus/new')}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Menú
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Menús</p>
                <p className="text-2xl font-bold text-gray-900">{menus.length}</p>
              </div>
              <MenuIcon className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Menús Activos</p>
                <p className="text-2xl font-bold text-green-600">
                  {menus.filter(m => m.isActive).length}
                </p>
              </div>
              <Navigation className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Elementos Totales</p>
                <p className="text-2xl font-bold text-purple-600">
                  {menus.reduce((acc, m) => acc + m.itemCount, 0)}
                </p>
              </div>
              <Grid3X3 className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ubicaciones</p>
                <p className="text-2xl font-bold text-orange-600">
                  {new Set(menus.map(m => m.location)).size}
                </p>
              </div>
              <Globe className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar menús..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              {locations.map(location => (
                <option key={location.value} value={location.value}>
                  {location.label}
                </option>
              ))}
            </select>

            <Button variant="outline" onClick={loadMenus}>
              <Settings className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Menus List */}
      <div className="space-y-4">
        {filteredMenus.map((menu) => (
          <Card key={menu.id} className={`${!menu.isActive ? 'opacity-75' : ''}`}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getLocationIcon(menu.location)}
                    <h3 className="font-semibold text-lg text-gray-900">{menu.name}</h3>
                    <Badge className={getLocationColor(menu.location)}>
                      {getLocationLabel(menu.location)}
                    </Badge>
                    {!menu.isActive && (
                      <Badge variant="secondary">Inactivo</Badge>
                    )}
                    {menu.showOnMobile && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Smartphone className="w-3 h-3" />
                        Móvil
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-3">{menu.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Elementos:</span>
                      <span className="font-semibold ml-1">{menu.itemCount}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Profundidad máx:</span>
                      <span className="font-semibold ml-1">{menu.maxDepth}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Orden:</span>
                      <span className="font-semibold ml-1">{menu.sortOrder}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Slug:</span>
                      <span className="font-mono text-xs bg-gray-100 px-1 rounded ml-1">{menu.slug}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Sort Order Controls */}
                  <div className="flex flex-col">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateSortOrder(menu.id, 'up')}
                      className="h-6 px-2"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateSortOrder(menu.id, 'down')}
                      className="h-6 px-2"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-1">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => router.push(`/admin/content/menus/${menu.id}`)}
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => router.push(`/admin/content/menus/${menu.id}/edit`)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => duplicateMenu(menu.id)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant={menu.isActive ? "secondary" : "default"}
                      onClick={() => toggleActiveStatus(menu.id, menu.isActive)}
                    >
                      {menu.isActive ? 'Desactivar' : 'Activar'}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => deleteMenu(menu.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMenus.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <MenuIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay menús
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || locationFilter !== 'all' 
                ? 'No se encontraron menús con los filtros aplicados'
                : 'Comienza creando tu primer menú de navegación'
              }
            </p>
            {!searchTerm && locationFilter === 'all' && (
              <Button onClick={() => router.push('/admin/content/menus/new')}>
                <Plus className="w-4 h-4 mr-2" />
                Crear Primer Menú
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}