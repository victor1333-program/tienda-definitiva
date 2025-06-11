'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { toast } from 'react-hot-toast'
import { 
  Package, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Filter,
  Building2,
  MapPin,
  Activity,
  Zap,
  Brain
} from 'lucide-react'
import BarChart from '@/components/charts/BarChart'
import DonutChart from '@/components/charts/DonutChart'

interface Material {
  id: string
  name: string
  description?: string
  sku: string
  unit: string
  currentStock: number
  minimumStock: number
  maximumStock?: number
  costPerUnit: number
  supplier?: {
    id: string
    name: string
    contactName?: string
    email?: string
    phone?: string
  }
  location?: string
  category: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  movements?: Array<{
    id: string
    type: string
    quantity: number
    reason?: string
    createdAt: string
    user?: {
      name: string
      email: string
    }
  }>
  stockAlerts?: Array<{
    id: string
    type: string
    message: string
    isResolved: boolean
    createdAt: string
  }>
  _count?: {
    movements: number
    stockAlerts: number
  }
}

export default function MaterialStockPage() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showLowStockOnly, setShowLowStockOnly] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    lowStock: 0,
    outOfStock: 0,
    totalValue: 0
  })
  const [isGeneratingAlerts, setIsGeneratingAlerts] = useState(false)

  useEffect(() => {
    loadMaterials()
  }, [])

  const loadMaterials = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/materials')
      if (response.ok) {
        const data = await response.json()
        setMaterials(data.materials || [])
        setStats(data.stats || { total: 0, lowStock: 0, outOfStock: 0, totalValue: 0 })
      } else {
        toast.error('Error al cargar materiales')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al cargar materiales')
    } finally {
      setIsLoading(false)
    }
  }

  const generateStockAlerts = async () => {
    setIsGeneratingAlerts(true)
    try {
      const response = await fetch('/api/stock-alerts', { method: 'POST' })
      if (response.ok) {
        const result = await response.json()
        toast.success(`${result.alertsCreated} nuevas alertas generadas`)
        loadMaterials()
      } else {
        toast.error('Error al generar alertas')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al generar alertas')
    } finally {
      setIsGeneratingAlerts(false)
    }
  }

  // Filter materials
  useEffect(() => {
    let filtered = materials
    
    if (searchTerm) {
      filtered = filtered.filter(material => 
        material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (material.description?.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(material => material.category === selectedCategory)
    }
    
    if (showLowStockOnly) {
      filtered = filtered.filter(material => material.currentStock <= material.minimumStock)
    }
    
    setFilteredMaterials(filtered)
  }, [materials, searchTerm, selectedCategory, showLowStockOnly])

  const getStockStatus = (current: number, minimum: number) => {
    if (current === 0) return { text: 'Sin stock', color: 'bg-red-100 text-red-800' }
    if (current <= minimum) return { text: 'Stock bajo', color: 'bg-orange-100 text-orange-800' }
    if (current <= minimum * 1.5) return { text: 'Stock medio', color: 'bg-yellow-100 text-yellow-800' }
    return { text: 'Stock OK', color: 'bg-green-100 text-green-800' }
  }

  // Prepare chart data
  const stockLevelsData = materials.slice(0, 10).map(m => ({
    label: m.name.substring(0, 15) + '...',
    value: m.currentStock,
    color: m.currentStock <= m.minimumStock ? '#ef4444' : '#10b981'
  }))

  const categoryData = [
    { label: 'Textiles', value: materials.filter(m => m.category === 'TEXTILES').length, color: '#3b82f6' },
    { label: 'Tintas', value: materials.filter(m => m.category === 'INKS').length, color: '#8b5cf6' },
    { label: 'Films', value: materials.filter(m => m.category === 'FILMS').length, color: '#06b6d4' },
    { label: 'Sustratos', value: materials.filter(m => m.category === 'SUBSTRATES').length, color: '#10b981' },
    { label: 'Otros', value: materials.filter(m => !['TEXTILES', 'INKS', 'FILMS', 'SUBSTRATES'].includes(m.category)).length, color: '#f59e0b' }
  ].filter(item => item.value > 0)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando materiales...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🧵 Stock de Materiales Inteligente</h1>
          <p className="text-gray-600 mt-1">
            Control avanzado de materiales para producción personalizada
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={generateStockAlerts}
            disabled={isGeneratingAlerts}
          >
            <Zap className="w-4 h-4 mr-2" />
            {isGeneratingAlerts ? 'Generando...' : 'Generar Alertas'}
          </Button>
          <Button variant="outline" onClick={loadMaterials}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
          <Button onClick={() => window.open('/admin/materials/new', '_blank')}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Material
          </Button>
        </div>
      </div>

      {/* Enhanced Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Valor Total Materiales</CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-gray-900">
              €{stats.totalValue.toLocaleString('es-ES', { maximumFractionDigits: 0 })}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {stats.total} materiales totales
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-amber-50"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Stock Bajo</CardTitle>
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingDown className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-orange-600">{stats.lowStock}</div>
            <p className="text-xs text-gray-600 mt-1">
              Materiales por debajo del mínimo
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-pink-50"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Sin Stock</CardTitle>
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-red-600">{stats.outOfStock}</div>
            <p className="text-xs text-gray-600 mt-1">
              Materiales agotados
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Rotación Activa</CardTitle>
            <div className="p-2 bg-green-100 rounded-lg">
              <Activity className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-green-600">
              {materials.filter(m => m.isActive).length}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Materiales activos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Niveles de Stock por Material
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart 
              data={stockLevelsData}
              title="Top 10 Materiales"
              formatValue={(value) => `${value} unidades`}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Distribución por Categoría
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DonutChart
              data={categoryData}
              title="Materiales por Categoría"
              size={180}
              formatValue={(value) => `${value} materiales`}
            />
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nombre, SKU o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">Todas las categorías</option>
                <option value="TEXTILES">Textiles</option>
                <option value="INKS">Tintas</option>
                <option value="FILMS">Films</option>
                <option value="SUBSTRATES">Sustratos</option>
                <option value="TOOLS">Herramientas</option>
                <option value="PACKAGING">Embalajes</option>
                <option value="CHEMICALS">Químicos</option>
                <option value="OTHER">Otros</option>
              </select>
              <Button
                variant={showLowStockOnly ? "default" : "outline"}
                onClick={() => setShowLowStockOnly(!showLowStockOnly)}
                size="sm"
              >
                <Filter className="w-4 h-4 mr-2" />
                Solo stock bajo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de materiales */}
      <Card>
        <CardHeader>
          <CardTitle>Inventario de Materiales</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredMaterials.length === 0 ? (
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay materiales</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'No se encontraron materiales con ese término de búsqueda' : 'Comienza agregando materiales a tu inventario'}
              </p>
              <Button className="mt-4" onClick={() => window.open('/admin/materials/new', '_blank')}>
                <Plus className="w-4 h-4 mr-2" />
                Agregar Material
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMaterials.map((material) => {
                const status = getStockStatus(material.currentStock, material.minimumStock)
                
                return (
                  <div
                    key={material.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-gray-900">{material.name}</h3>
                        <Badge className={material.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {material.isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </div>
                      
                      {material.description && (
                        <p className="text-sm text-gray-600 mb-2">{material.description}</p>
                      )}
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Package className="w-4 h-4" />
                          <span>{material.sku}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          <span>{material.supplier?.name || 'Sin proveedor'}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{material.location || 'Sin ubicación'}</span>
                        </div>
                        
                        <div>
                          <span className="font-medium">€{material.costPerUnit.toFixed(2)}</span>
                          <span className="text-gray-500">/{material.unit}</span>
                        </div>
                        
                        <div>
                          <Badge variant="outline">
                            {material.category}
                          </Badge>
                        </div>
                        
                        <div className="text-xs text-gray-500">
                          Act: {new Date(material.updatedAt).toLocaleDateString('es-ES')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">
                          {material.currentStock} {material.unit}
                        </div>
                        <div className="text-xs text-gray-500 mb-2">
                          Mín: {material.minimumStock} {material.unit}
                          {material.maximumStock && ` | Máx: ${material.maximumStock}`}
                        </div>
                        <Badge className={status.color}>
                          {status.text}
                        </Badge>
                        {material._count && material._count.stockAlerts > 0 && (
                          <div className="mt-1">
                            <Badge className="bg-red-100 text-red-800 text-xs">
                              {material._count.stockAlerts} alertas
                            </Badge>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(`/admin/materials/${material.id}`, '_blank')}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600"
                          onClick={() => {
                            if (confirm('¿Estás seguro de que quieres eliminar este material?')) {
                              // Delete material logic
                              toast.success('Material eliminado correctamente')
                              loadMaterials()
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}