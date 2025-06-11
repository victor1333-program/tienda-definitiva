"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Calendar,
  Percent,
  DollarSign,
  Truck,
  Users,
  TrendingUp,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Gift,
  Zap,
  BarChart3
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Badge } from "@/components/ui/Badge"
import { toast } from "react-hot-toast"

interface Discount {
  id: string
  code: string
  name: string
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING' | 'BUY_X_GET_Y' | 'PROGRESSIVE'
  value: number
  minOrderAmount: number | null
  maxOrderAmount: number | null
  maxUses: number | null
  usedCount: number
  usesPerCustomer: number | null
  isActive: boolean
  validFrom: Date
  validUntil: Date | null
  targetType: 'ALL' | 'PRODUCTS' | 'CATEGORIES' | 'USERS'
  targetIds: string[]
  excludeIds: string[]
  stackable: boolean
  firstTimeOnly: boolean
  autoApply: boolean
  description: string
  internalNotes: string
  createdAt: Date
  updatedAt: Date
  
  // Analytics
  revenue: number
  conversionRate: number
  avgOrderValue: number
  
  // Advanced settings
  geographicRestrictions: string[]
  deviceRestrictions: string[]
  timeRestrictions: {
    days: string[]
    hours: { start: string; end: string }
  } | null
}

interface DiscountStats {
  total: number
  active: number
  expired: number
  totalRevenue: number
  totalSavings: number
  avgConversionRate: number
  topPerformers: Array<{
    code: string
    revenue: number
    uses: number
  }>
}

export default function DiscountsPage() {
  const router = useRouter()
  const [discounts, setDiscounts] = useState<Discount[]>([])
  const [stats, setStats] = useState<DiscountStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired' | 'scheduled'>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [selectedDiscounts, setSelectedDiscounts] = useState<string[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [bulkAction, setBulkAction] = useState<string>('')

  // Form state for creating/editing discounts
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'PERCENTAGE' as const,
    value: 0,
    minOrderAmount: null as number | null,
    maxOrderAmount: null as number | null,
    maxUses: null as number | null,
    usesPerCustomer: null as number | null,
    validFrom: new Date().toISOString().slice(0, 16),
    validUntil: '',
    targetType: 'ALL' as const,
    stackable: false,
    firstTimeOnly: false,
    autoApply: false,
    description: '',
    internalNotes: '',
    geographicRestrictions: [] as string[],
    timeRestrictions: null as any
  })

  useEffect(() => {
    loadDiscounts()
    loadStats()
  }, [])

  const loadDiscounts = async () => {
    try {
      const response = await fetch('/api/discounts')
      if (response.ok) {
        const data = await response.json()
        setDiscounts(data.discounts || [])
      }
    } catch (error) {
      console.error('Error loading discounts:', error)
      toast.error('Error al cargar descuentos')
    } finally {
      setIsLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await fetch('/api/discounts/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const handleCreate = async () => {
    try {
      const response = await fetch('/api/discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          validFrom: new Date(formData.validFrom),
          validUntil: formData.validUntil ? new Date(formData.validUntil) : null
        })
      })

      if (response.ok) {
        toast.success('Descuento creado correctamente')
        setShowCreateModal(false)
        resetForm()
        loadDiscounts()
        loadStats()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Error al crear descuento')
      }
    } catch (error) {
      toast.error('Error al crear descuento')
    }
  }

  const handleBulkAction = async () => {
    if (!bulkAction || selectedDiscounts.length === 0) return

    try {
      const response = await fetch('/api/discounts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: bulkAction,
          discountIds: selectedDiscounts
        })
      })

      if (response.ok) {
        toast.success(`Acción ${bulkAction} ejecutada correctamente`)
        setSelectedDiscounts([])
        setBulkAction('')
        loadDiscounts()
        loadStats()
      } else {
        toast.error('Error al ejecutar acción masiva')
      }
    } catch (error) {
      toast.error('Error al ejecutar acción masiva')
    }
  }

  const toggleDiscountStatus = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/discounts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      })

      if (response.ok) {
        toast.success(`Descuento ${!isActive ? 'activado' : 'desactivado'}`)
        loadDiscounts()
      }
    } catch (error) {
      toast.error('Error al cambiar estado del descuento')
    }
  }

  const duplicateDiscount = async (discount: Discount) => {
    const duplicated = {
      ...discount,
      code: `${discount.code}_COPY`,
      name: `${discount.name} (Copia)`,
      isActive: false
    }
    
    delete duplicated.id
    delete duplicated.createdAt
    delete duplicated.updatedAt
    delete duplicated.usedCount
    delete duplicated.revenue
    delete duplicated.conversionRate
    delete duplicated.avgOrderValue

    try {
      const response = await fetch('/api/discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duplicated)
      })

      if (response.ok) {
        toast.success('Descuento duplicado correctamente')
        loadDiscounts()
      }
    } catch (error) {
      toast.error('Error al duplicar descuento')
    }
  }

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData(prev => ({ ...prev, code: result }))
  }

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      type: 'PERCENTAGE',
      value: 0,
      minOrderAmount: null,
      maxOrderAmount: null,
      maxUses: null,
      usesPerCustomer: null,
      validFrom: new Date().toISOString().slice(0, 16),
      validUntil: '',
      targetType: 'ALL',
      stackable: false,
      firstTimeOnly: false,
      autoApply: false,
      description: '',
      internalNotes: '',
      geographicRestrictions: [],
      timeRestrictions: null
    })
  }

  const getStatusBadge = (discount: Discount) => {
    const now = new Date()
    const validFrom = new Date(discount.validFrom)
    const validUntil = discount.validUntil ? new Date(discount.validUntil) : null

    if (!discount.isActive) {
      return <Badge variant="secondary">Inactivo</Badge>
    }

    if (now < validFrom) {
      return <Badge className="bg-blue-100 text-blue-800">Programado</Badge>
    }

    if (validUntil && now > validUntil) {
      return <Badge variant="destructive">Expirado</Badge>
    }

    if (discount.maxUses && discount.usedCount >= discount.maxUses) {
      return <Badge variant="destructive">Agotado</Badge>
    }

    return <Badge className="bg-green-100 text-green-800">Activo</Badge>
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PERCENTAGE': return <Percent className="w-4 h-4" />
      case 'FIXED_AMOUNT': return <DollarSign className="w-4 h-4" />
      case 'FREE_SHIPPING': return <Truck className="w-4 h-4" />
      case 'BUY_X_GET_Y': return <Gift className="w-4 h-4" />
      case 'PROGRESSIVE': return <TrendingUp className="w-4 h-4" />
      default: return <Target className="w-4 h-4" />
    }
  }

  const filteredDiscounts = discounts.filter(discount => {
    const matchesSearch = discount.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         discount.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = (() => {
      const now = new Date()
      const validFrom = new Date(discount.validFrom)
      const validUntil = discount.validUntil ? new Date(discount.validUntil) : null

      switch (filterStatus) {
        case 'active':
          return discount.isActive && now >= validFrom && (!validUntil || now <= validUntil)
        case 'expired':
          return !discount.isActive || (validUntil && now > validUntil)
        case 'scheduled':
          return discount.isActive && now < validFrom
        default:
          return true
      }
    })()

    const matchesType = filterType === 'all' || discount.type === filterType

    return matchesSearch && matchesStatus && matchesType
  })

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando descuentos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🏷️ Descuentos y Promociones</h1>
          <p className="text-gray-600 mt-1">
            Gestiona códigos de descuento, promociones y ofertas especiales
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowAnalytics(!showAnalytics)}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            {showAnalytics ? 'Ocultar' : 'Mostrar'} Analytics
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Crear Descuento
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Descuentos</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Target className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Activos</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ingresos Generados</p>
                  <p className="text-2xl font-bold text-purple-600">€{stats.totalRevenue.toFixed(2)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Conversión Promedio</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.avgConversionRate.toFixed(1)}%</p>
                </div>
                <Zap className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analytics Panel */}
      {showAnalytics && stats && (
        <Card>
          <CardHeader>
            <CardTitle>📊 Analytics de Rendimiento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Top Performers</h4>
                <div className="space-y-2">
                  {stats.topPerformers.map((performer, index) => (
                    <div key={performer.code} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? 'bg-yellow-100 text-yellow-800' :
                          index === 1 ? 'bg-gray-100 text-gray-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{performer.code}</p>
                          <p className="text-sm text-gray-600">{performer.uses} usos</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">€{performer.revenue.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Métricas Generales</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Ahorros de Clientes:</span>
                    <span className="font-bold">€{stats.totalSavings.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Descuentos Expirados:</span>
                    <span className="font-bold text-red-600">{stats.expired}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ratio Activos/Total:</span>
                    <span className="font-bold">{((stats.active / stats.total) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por código o nombre..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="expired">Expirados</option>
                <option value="scheduled">Programados</option>
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="all">Todos los tipos</option>
                <option value="PERCENTAGE">Porcentaje</option>
                <option value="FIXED_AMOUNT">Cantidad fija</option>
                <option value="FREE_SHIPPING">Envío gratis</option>
                <option value="BUY_X_GET_Y">Lleva X Paga Y</option>
                <option value="PROGRESSIVE">Progresivo</option>
              </select>
              <Button variant="outline" onClick={loadDiscounts}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedDiscounts.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedDiscounts.length} descuento(s) seleccionado(s)
              </span>
              <div className="flex gap-2">
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  <option value="">Seleccionar acción...</option>
                  <option value="activate">Activar</option>
                  <option value="deactivate">Desactivar</option>
                  <option value="delete">Eliminar</option>
                  <option value="reset">Reiniciar uso</option>
                </select>
                <Button size="sm" onClick={handleBulkAction} disabled={!bulkAction}>
                  Ejecutar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Discounts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Descuentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedDiscounts.length === filteredDiscounts.length && filteredDiscounts.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedDiscounts(filteredDiscounts.map(d => d.id))
                        } else {
                          setSelectedDiscounts([])
                        }
                      }}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código / Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo / Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado / Uso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vigencia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rendimiento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDiscounts.map((discount) => (
                  <tr key={discount.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedDiscounts.includes(discount.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedDiscounts([...selectedDiscounts, discount.id])
                          } else {
                            setSelectedDiscounts(selectedDiscounts.filter(id => id !== discount.id))
                          }
                        }}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-primary-600">{discount.code}</span>
                          {discount.autoApply && <Badge variant="secondary" className="text-xs">Auto</Badge>}
                        </div>
                        <div className="text-sm text-gray-600">{discount.name}</div>
                        {discount.description && (
                          <div className="text-xs text-gray-500 mt-1">{discount.description}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(discount.type)}
                        <div>
                          <div className="font-medium">
                            {discount.type === 'PERCENTAGE' ? `${discount.value}%` :
                             discount.type === 'FIXED_AMOUNT' ? `€${discount.value}` :
                             discount.type === 'FREE_SHIPPING' ? 'Envío gratis' :
                             discount.type === 'BUY_X_GET_Y' ? `Lleva ${discount.value}` :
                             `Progresivo ${discount.value}%`}
                          </div>
                          {discount.minOrderAmount && (
                            <div className="text-xs text-gray-500">
                              Min: €{discount.minOrderAmount}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {getStatusBadge(discount)}
                        <div className="text-sm text-gray-600">
                          {discount.usedCount} / {discount.maxUses || '∞'} usos
                        </div>
                        {discount.maxUses && (
                          <div className="w-16 bg-gray-200 rounded-full h-1">
                            <div 
                              className="bg-primary-600 h-1 rounded-full"
                              style={{ width: `${Math.min((discount.usedCount / discount.maxUses) * 100, 100)}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Calendar className="w-3 h-3" />
                          {new Date(discount.validFrom).toLocaleDateString()}
                        </div>
                        {discount.validUntil && (
                          <div className="text-xs text-gray-500">
                            hasta {new Date(discount.validUntil).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium text-green-600">
                          €{discount.revenue?.toFixed(2) || '0.00'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {discount.conversionRate?.toFixed(1) || '0'}% conversión
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleDiscountStatus(discount.id, discount.isActive)}
                        >
                          {discount.isActive ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => duplicateDiscount(discount)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => router.push(`/admin/discounts/${discount.id}`)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredDiscounts.length === 0 && (
              <div className="text-center py-8">
                <Target className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay descuentos</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchQuery || filterStatus !== 'all' || filterType !== 'all' 
                    ? 'No se encontraron descuentos con los filtros aplicados'
                    : 'Comienza creando tu primer descuento'
                  }
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Discount Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Crear Nuevo Descuento</h2>
              <Button variant="ghost" onClick={() => setShowCreateModal(false)}>
                ✕
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="font-semibold">Información Básica</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código de Descuento
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                      placeholder="DESCUENTO10"
                    />
                    <Button type="button" variant="outline" onClick={generateCode}>
                      <Zap className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Descuento
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Descuento de bienvenida"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Descripción del descuento..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Descuento
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="PERCENTAGE">Porcentaje</option>
                    <option value="FIXED_AMOUNT">Cantidad Fija</option>
                    <option value="FREE_SHIPPING">Envío Gratis</option>
                    <option value="BUY_X_GET_Y">Lleva X Paga Y</option>
                    <option value="PROGRESSIVE">Progresivo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor del Descuento
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.value}
                    onChange={(e) => setFormData(prev => ({ ...prev, value: parseFloat(e.target.value) }))}
                    placeholder={formData.type === 'PERCENTAGE' ? '10' : '5.00'}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.type === 'PERCENTAGE' ? 'Porcentaje (0-100)' : 
                     formData.type === 'FIXED_AMOUNT' ? 'Cantidad en euros' :
                     formData.type === 'FREE_SHIPPING' ? 'Dejar en 0' :
                     'Cantidad según tipo'}
                  </p>
                </div>
              </div>

              {/* Conditions & Restrictions */}
              <div className="space-y-4">
                <h3 className="font-semibold">Condiciones y Restricciones</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pedido Mínimo (€)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.minOrderAmount || ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        minOrderAmount: e.target.value ? parseFloat(e.target.value) : null 
                      }))}
                      placeholder="50.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pedido Máximo (€)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.maxOrderAmount || ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        maxOrderAmount: e.target.value ? parseFloat(e.target.value) : null 
                      }))}
                      placeholder="1000.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Usos Máximos
                    </label>
                    <Input
                      type="number"
                      value={formData.maxUses || ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        maxUses: e.target.value ? parseInt(e.target.value) : null 
                      }))}
                      placeholder="100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Usos por Cliente
                    </label>
                    <Input
                      type="number"
                      value={formData.usesPerCustomer || ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        usesPerCustomer: e.target.value ? parseInt(e.target.value) : null 
                      }))}
                      placeholder="1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Válido Desde
                    </label>
                    <Input
                      type="datetime-local"
                      value={formData.validFrom}
                      onChange={(e) => setFormData(prev => ({ ...prev, validFrom: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Válido Hasta
                    </label>
                    <Input
                      type="datetime-local"
                      value={formData.validUntil}
                      onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Aplicar a
                  </label>
                  <select
                    value={formData.targetType}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetType: e.target.value as any }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="ALL">Todos los productos</option>
                    <option value="PRODUCTS">Productos específicos</option>
                    <option value="CATEGORIES">Categorías específicas</option>
                    <option value="USERS">Usuarios específicos</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.stackable}
                      onChange={(e) => setFormData(prev => ({ ...prev, stackable: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm">Acumulable con otros descuentos</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.firstTimeOnly}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstTimeOnly: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm">Solo para nuevos clientes</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.autoApply}
                      onChange={(e) => setFormData(prev => ({ ...prev, autoApply: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm">Aplicar automáticamente</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas Internas
                  </label>
                  <textarea
                    value={formData.internalNotes}
                    onChange={(e) => setFormData(prev => ({ ...prev, internalNotes: e.target.value }))}
                    rows={2}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Notas para el equipo..."
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreate}>
                Crear Descuento
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}