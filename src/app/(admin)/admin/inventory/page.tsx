'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-hot-toast"
import {
  Package,
  Download,
  RefreshCw,
  TrendingDown,
  AlertTriangle,
  Zap,
  Target,
  Activity,
  Truck,
  Bell,
  TrendingUp,
  BarChart3,
  History,
  AlertCircle,
  Edit3,
  Eye,
  Filter,
  Search,
  Settings,
  CheckCircle,
  ChevronRight,
  ChevronDown
} from "lucide-react"
import StockAdjustmentModal from "@/components/inventory/StockAdjustmentModal"
import InventoryHistoryModal from "@/components/inventory/InventoryHistoryModal"
import BarChart from "@/components/charts/BarChart"
import LineChart from "@/components/charts/LineChart"
import DonutChart from "@/components/charts/DonutChart"

interface InventoryMovement {
  id: string
  type: string
  quantity: number
  reason?: string
  createdAt: string
}

interface Variant {
  id: string
  sku: string
  stock: number
  price: number
  isActive: boolean
  productId?: string
  product: {
    id: string
    name: string
    category: {
      name: string
    } | null
  }
  inventory: InventoryMovement[]
  type?: string // 'variant' o 'product'
  variantDetails?: {
    size?: string
    color?: string
    colorName?: string
    material?: string
    finish?: string
  } | null
  needsVariants?: boolean
  images?: string[]
}

interface StockAlert {
  id: string
  type: string
  message: string
  threshold: number
  currentStock: number
  isResolved: boolean
  createdAt: string
  material?: {
    name: string
    sku: string
    unit: string
  }
  variant?: {
    sku: string
    product: {
      name: string
    }
  }
}

interface DemandForecast {
  id: string
  predictedDemand: number
  confidence: number
  period: string
  algorithm: string
  createdAt: string
  material?: {
    name: string
    sku: string
    unit: string
    currentStock: number
  }
  variant?: {
    sku: string
    stock: number
    product: {
      name: string
    }
  }
}

export default function InventoryPage() {
  const [variants, setVariants] = useState<Variant[]>([])
  const [filteredVariants, setFilteredVariants] = useState<Variant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showLowStockOnly, setShowLowStockOnly] = useState(false)
  const [showOutOfStockOnly, setShowOutOfStockOnly] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null)
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([])
  const [activeTab, setActiveTab] = useState('overview')
  const [isGeneratingAlerts, setIsGeneratingAlerts] = useState(false)
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set())

  // Enhanced statistics
  const stats = {
    totalVariants: variants.length,
    totalStock: variants.reduce((sum, v) => sum + v.stock, 0),
    averageStock: variants.length > 0 ? Math.round(variants.reduce((sum, v) => sum + v.stock, 0) / variants.length) : 0,
    lowStockCount: variants.filter(v => v.stock <= 5).length,
    outOfStockCount: variants.filter(v => v.stock === 0).length,
    maxStock: Math.max(...variants.map(v => v.stock), 0),
    minStock: Math.min(...variants.map(v => v.stock), 0),
    totalValue: variants.reduce((sum, v) => sum + (v.stock * v.price), 0),
    activeAlerts: stockAlerts.filter(a => !a.isResolved).length,
    criticalItems: variants.filter(v => v.stock === 0).length + stockAlerts.filter(a => a.type === 'OUT_OF_STOCK' && !a.isResolved).length
  }

  useEffect(() => {
    loadVariants()
    loadStockAlerts()
  }, [])

  // Recargar cuando cambien los filtros
  useEffect(() => {
    loadVariants()
  }, [searchTerm, showLowStockOnly, showOutOfStockOnly])

  const loadVariants = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (showLowStockOnly) params.append('lowStock', 'true')
      if (showOutOfStockOnly) params.append('outOfStock', 'true')
      
      const response = await fetch(`/api/inventory/products?${params}`)
      if (response.ok) {
        const data = await response.json()
        // Transformar los items del inventario al formato esperado por el componente
        const transformedVariants = data.items.map(item => ({
          id: item.id,
          sku: item.sku,
          stock: item.stock,
          price: item.price,
          isActive: item.isActive,
          productId: item.productId,
          product: {
            id: item.productId,
            name: item.productName,
            category: item.categories?.[0] || null
          },
          inventory: [], // Se puede cargar por separado si es necesario
          type: item.type, // 'variant' o 'product'
          variantDetails: item.variantDetails,
          needsVariants: item.needsVariants,
          images: item.images
        }))
        
        setVariants(transformedVariants)
      } else {
        toast.error('Error al cargar el inventario')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al cargar el inventario')
    } finally {
      setIsLoading(false)
    }
  }

  const loadStockAlerts = async () => {
    try {
      const response = await fetch('/api/stock-alerts')
      if (response.ok) {
        const alerts = await response.json()
        setStockAlerts(alerts)
      }
    } catch (error) {
      console.error('Error loading stock alerts:', error)
    }
  }


  const generateStockAlerts = async () => {
    setIsGeneratingAlerts(true)
    const loadingToast = toast.loading('Generando alertas automáticamente...')
    
    try {
      // Usar el nuevo endpoint automático con autenticación
      const response = await fetch('/api/stock-alerts/auto-generate', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const result = await response.json()
        toast.dismiss(loadingToast)
        
        if (result.summary) {
          const { alertsCreated, alertsUpdated, alertsResolved } = result.summary
          toast.success(
            `Alertas procesadas: ${alertsCreated} nuevas, ${alertsUpdated} actualizadas, ${alertsResolved} resueltas`,
            { duration: 5000 }
          )
          
          // Mostrar detalles si hay nuevas alertas
          if (alertsCreated > 0) {
            setTimeout(() => {
              toast.info(`Se encontraron ${alertsCreated} productos/materiales con stock bajo o sin stock`, 
                { duration: 4000 })
            }, 1000)
          }
        } else {
          toast.success('Generación de alertas completada')
        }
        
        // Recargar alertas y datos de inventario
        loadStockAlerts()
        loadVariants()
      } else {
        const errorData = await response.json()
        toast.dismiss(loadingToast)
        toast.error(errorData.error || 'Error al generar alertas automáticamente')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.dismiss(loadingToast)
      toast.error('Error de conexión al generar alertas')
    } finally {
      setIsGeneratingAlerts(false)
    }
  }


  // Filter variants based on search and low stock filter
  useEffect(() => {
    let filtered = variants.filter(variant => {
      const productName = variant.product?.name || variant.name || ''
      const variantName = variant.variantDetails ? 
        `${productName} ${variant.variantDetails.size || ''} ${variant.variantDetails.color || ''}` : 
        productName
      
      const matchesSearch = variantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          variant.sku?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStockFilter = showLowStockOnly ? variant.stock <= 5 : true
      
      return matchesSearch && matchesStockFilter
    })
    
    setFilteredVariants(filtered)
  }, [variants, searchTerm, showLowStockOnly])

  const exportInventory = async () => {
    setIsExporting(true)
    try {
      const response = await fetch('/api/inventory/export')
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `inventario_${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        toast.success('Inventario exportado correctamente')
      } else {
        toast.error('Error al exportar inventario')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al exportar inventario')
    } finally {
      setIsExporting(false)
    }
  }

  const getStockBadgeColor = (stock: number) => {
    if (stock === 0) return 'bg-red-100 text-red-800'
    if (stock <= 5) return 'bg-orange-100 text-orange-800'
    if (stock <= 10) return 'bg-yellow-100 text-yellow-800'
    return 'bg-green-100 text-green-800'
  }

  const getStockStatus = (stock: number) => {
    if (stock === 0) return 'Sin stock'
    if (stock <= 5) return 'Stock bajo'
    if (stock <= 10) return 'Stock medio'
    return 'Stock OK'
  }

  const toggleProductExpansion = (productId: string) => {
    setExpandedProducts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(productId)) {
        newSet.delete(productId)
      } else {
        newSet.add(productId)
      }
      return newSet
    })
  }

  // Agrupar variantes por producto para la vista de inventario
  const groupedVariants = filteredVariants.reduce((groups, variant) => {
    if (variant.type === 'variant') {
      const productId = variant.productId || variant.product.id
      if (!groups[productId]) {
        groups[productId] = {
          product: variant.product,
          productId,
          variants: [],
          totalStock: 0,
          minStock: Infinity
        }
      }
      groups[productId].variants.push(variant)
      groups[productId].totalStock += variant.stock
      groups[productId].minStock = Math.min(groups[productId].minStock, variant.stock)
    }
    return groups
  }, {} as Record<string, any>)

  // Prepare chart data
  const stockLevelsData = variants.slice(0, 10).map(v => ({
    label: v.product.name.substring(0, 15) + '...',
    value: v.stock,
    color: v.stock <= 5 ? '#ef4444' : v.stock <= 10 ? '#f59e0b' : '#10b981'
  }))

  const alertsData = [
    { label: 'Stock Bajo', value: stockAlerts.filter(a => a.type === 'LOW_STOCK' && !a.isResolved).length, color: '#f59e0b' },
    { label: 'Sin Stock', value: stockAlerts.filter(a => a.type === 'OUT_OF_STOCK' && !a.isResolved).length, color: '#ef4444' },
    { label: 'Resueltas', value: stockAlerts.filter(a => a.isResolved).length, color: '#10b981' }
  ]

  const tabs = [
    { id: 'overview', label: 'Resumen', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'inventory', label: 'Inventario', icon: <Package className="w-4 h-4" /> },
    { id: 'alerts', label: 'Alertas', icon: <Bell className="w-4 h-4" /> }
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando inventario inteligente...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🧠 Inventario Inteligente</h1>
          <p className="text-gray-600 mt-1">
            Sistema avanzado de gestión de inventario con IA predictiva
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
          <Button
            variant="outline"
            onClick={exportInventory}
            disabled={isExporting}
          >
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? 'Exportando...' : 'Exportar'}
          </Button>
          <Button onClick={loadVariants}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.id === 'alerts' && stats.activeAlerts > 0 && (
                <Badge className="bg-red-100 text-red-800 text-xs ml-1">{stats.activeAlerts}</Badge>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Enhanced Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50"></div>
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Valor Total Inventario</CardTitle>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl font-bold text-gray-900">
                  €{stats.totalValue.toLocaleString('es-ES', { maximumFractionDigits: 0 })}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {stats.totalStock} unidades totales
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-amber-50"></div>
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Alertas Activas</CardTitle>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Bell className="h-4 w-4 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl font-bold text-gray-900">{stats.activeAlerts}</div>
                <p className="text-xs text-gray-600 mt-1">
                  Requieren atención
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-pink-50"></div>
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Productos Críticos</CardTitle>
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl font-bold text-gray-900">{stats.criticalItems}</div>
                <p className="text-xs text-gray-600 mt-1">
                  Sin stock o críticos
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50"></div>
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Rotación Promedio</CardTitle>
                <div className="p-2 bg-green-100 rounded-lg">
                  <Activity className="h-4 w-4 text-green-600" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl font-bold text-gray-900">
                  {stats.averageStock}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Unidades por producto
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Productos con Stock Bajo
                </CardTitle>
              </CardHeader>
              <CardContent>
                {variants.filter(v => v.stock <= 5).length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">¡Perfecto!</h3>
                    <p className="text-gray-600">No hay productos con stock bajo</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {variants.filter(v => v.stock <= 5).slice(0, 10).map((variant) => (
                      <div key={variant.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          {variant.images && variant.images.length > 0 && (
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                              <img 
                                src={Array.isArray(variant.images) ? variant.images[0] : JSON.parse(variant.images)[0]} 
                                alt={variant.product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">
                              {variant.product.name.toUpperCase()}
                              {variant.variantDetails && (
                                <span className="text-gray-600 font-normal">
                                  {' '}({[variant.variantDetails.size, variant.variantDetails.colorName || variant.variantDetails.color].filter(Boolean).join(' - ')})
                                </span>
                              )}
                            </p>
                            <p className="text-sm text-gray-500">SKU: {variant.sku}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-lg font-bold text-red-600">{variant.stock}</p>
                            <p className="text-xs text-gray-500">
                              {variant.stock === 0 ? 'Sin stock' : 'Stock bajo'}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedVariant(variant)
                              setShowAdjustmentModal(true)
                            }}
                            className="text-orange-600 hover:text-orange-700"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {variants.filter(v => v.stock <= 5).length > 10 && (
                      <div className="text-center pt-3 border-t">
                        <p className="text-sm text-gray-500">
                          Y {variants.filter(v => v.stock <= 5).length - 10} productos más con stock bajo
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Acciones Inteligentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div className="p-4 border border-gray-200 rounded-lg hover:border-orange-300 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Bell className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Alertas Automáticas</h3>
                      <p className="text-sm text-gray-600">Detectar problemas de stock</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={generateStockAlerts}
                    disabled={isGeneratingAlerts}
                    className="w-full"
                  >
                    {isGeneratingAlerts ? 'Escaneando...' : 'Generar Alertas'}
                  </Button>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg hover:border-orange-300 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Truck className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Gestión de Proveedores</h3>
                      <p className="text-sm text-gray-600">Optimizar reposiciones</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => window.open('/admin/suppliers', '_blank')}
                    className="w-full"
                  >
                    Gestionar Proveedores
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Inventory Tab */}
      {activeTab === 'inventory' && (
        <>
          {/* Basic Statistics for Inventory Tab */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalVariants}</div>
                <p className="text-xs text-muted-foreground">
                  Variantes en catálogo
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Stock Total</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalStock}</div>
                <p className="text-xs text-muted-foreground">
                  Unidades totales
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.lowStockCount}</div>
                <p className="text-xs text-muted-foreground">
                  Productos con ≤5 unidades
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sin Stock</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.outOfStockCount}</div>
                <p className="text-xs text-muted-foreground">
                  Productos agotados
                </p>
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
                      placeholder="Buscar por nombre de producto o SKU..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={showLowStockOnly ? "default" : "outline"}
                    onClick={() => {
                      setShowLowStockOnly(!showLowStockOnly)
                      if (!showLowStockOnly) {
                        setShowOutOfStockOnly(false) // Desactivar "Sin Stock" si se activa "Stock Bajo"
                      }
                    }}
                    size="sm"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Solo stock bajo
                  </Button>
                  <Button
                    variant={showOutOfStockOnly ? "default" : "outline"}
                    onClick={() => {
                      setShowOutOfStockOnly(!showOutOfStockOnly)
                      if (!showOutOfStockOnly) {
                        setShowLowStockOnly(false) // Desactivar "Stock Bajo" si se activa "Sin Stock"
                      }
                    }}
                    size="sm"
                  >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Sin stock
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de productos */}
          <Card>
            <CardHeader>
              <CardTitle>Inventario de Productos</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredVariants.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No hay productos</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm ? 'No se encontraron productos con ese término de búsqueda' : 'No hay productos en el inventario'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {Object.values(groupedVariants).map((group: any) => (
                    <div key={group.productId} className="border border-gray-200 rounded-lg overflow-hidden">
                      {/* Producto principal */}
                      <div 
                        className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer"
                        onClick={() => toggleProductExpansion(group.productId)}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          {/* Imagen del producto */}
                          {group.variants[0]?.images && group.variants[0].images.length > 0 && (
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                              <img 
                                src={Array.isArray(group.variants[0].images) ? group.variants[0].images[0] : JSON.parse(group.variants[0].images)[0]} 
                                alt={group.product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          
                          {/* Información del producto */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {expandedProducts.has(group.productId) ? (
                                <ChevronDown className="w-4 h-4 text-gray-600" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-gray-600" />
                              )}
                              <h3 className="font-medium text-gray-900">
                                {group.product.name.toUpperCase()}
                              </h3>
                              <Badge variant="outline" className="text-xs">
                                {group.variants.length} variantes
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 mt-1">
                              {group.product.category && (
                                <span className="text-sm text-gray-500">
                                  Categoría: {group.product.category.name}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Stock total del producto */}
                        <div className="text-center mr-4">
                          <div className="text-lg font-bold text-gray-900">{group.totalStock}</div>
                          <Badge className={getStockBadgeColor(group.minStock)}>
                            Stock Total
                          </Badge>
                        </div>
                      </div>

                      {/* Variantes expandidas */}
                      {expandedProducts.has(group.productId) && (
                        <div className="border-t border-gray-200 bg-gray-50">
                          {group.variants.map((variant: any) => (
                            <div key={variant.id} className="flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0 hover:bg-white transition-colors">
                              <div className="flex items-center gap-3 flex-1 ml-8">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-medium text-gray-700">
                                      {group.product.name.toUpperCase()}
                                      <span className="text-gray-600 font-normal">
                                        {' '}({[variant.variantDetails?.size, variant.variantDetails?.colorName || variant.variantDetails?.color].filter(Boolean).join(' - ')})
                                      </span>
                                    </h4>
                                  </div>
                                  <div className="flex items-center gap-4 mt-1">
                                    <span className="text-sm text-gray-500">SKU: {variant.sku}</span>
                                    <span className="text-sm text-gray-500">
                                      Precio: €{variant.price ? Number(variant.price).toFixed(2) : '0.00'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-4">
                                <div className="text-center">
                                  <div className="text-lg font-bold text-gray-900">{variant.stock}</div>
                                  <Badge className={getStockBadgeColor(variant.stock)}>
                                    {getStockStatus(variant.stock)}
                                  </Badge>
                                </div>
                                
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      const variantWithProductId = {
                                        ...variant,
                                        product: {
                                          ...variant.product,
                                          id: variant.productId || variant.product.id
                                        }
                                      }
                                      setSelectedVariant(variantWithProductId)
                                      setShowHistoryModal(true)
                                    }}
                                  >
                                    <History className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setSelectedVariant(variant)
                                      setShowAdjustmentModal(true)
                                    }}
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Stock Alerts Tab */}
      {activeTab === 'alerts' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Alertas de Stock Activas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stockAlerts.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay alertas</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Todas las alertas están resueltas o no hay problemas de stock
                </p>
                <Button 
                  className="mt-4" 
                  onClick={generateStockAlerts}
                  disabled={isGeneratingAlerts}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  {isGeneratingAlerts ? 'Generando...' : 'Generar Alertas'}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {stockAlerts.filter(alert => !alert.isResolved).map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 border-l-4 rounded-lg ${
                      alert.type === 'OUT_OF_STOCK' ? 'border-l-red-500 bg-red-50' :
                      alert.type === 'LOW_STOCK' ? 'border-l-orange-500 bg-orange-50' :
                      'border-l-yellow-500 bg-yellow-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className={`w-5 h-5 ${
                            alert.type === 'OUT_OF_STOCK' ? 'text-red-600' :
                            alert.type === 'LOW_STOCK' ? 'text-orange-600' :
                            'text-yellow-600'
                          }`} />
                          <Badge className={`${
                            alert.type === 'OUT_OF_STOCK' ? 'bg-red-100 text-red-800' :
                            alert.type === 'LOW_STOCK' ? 'bg-orange-100 text-orange-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {alert.type === 'OUT_OF_STOCK' ? 'Sin Stock' :
                             alert.type === 'LOW_STOCK' ? 'Stock Bajo' : alert.type}
                          </Badge>
                        </div>
                        <h4 className="font-medium text-gray-900 mb-1">
                          {alert.material?.name || alert.variant?.product.name}
                        </h4>
                        <p className="text-sm text-gray-700 mb-2">{alert.message}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>SKU: {alert.material?.sku || alert.variant?.sku}</span>
                          <span>Stock actual: {alert.currentStock} {alert.material?.unit || 'unidades'}</span>
                          <span>Umbral: {alert.threshold}</span>
                          <span>{new Date(alert.createdAt).toLocaleDateString('es-ES')}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}


      {showAdjustmentModal && selectedVariant && (
        <StockAdjustmentModal
          variant={selectedVariant}
          isOpen={showAdjustmentModal}
          onClose={() => setShowAdjustmentModal(false)}
          onSuccess={() => {
            loadVariants()
            setShowAdjustmentModal(false)
          }}
        />
      )}

      {showHistoryModal && selectedVariant && (
        <InventoryHistoryModal
          variant={selectedVariant}
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
        />
      )}

    </div>
  )
}