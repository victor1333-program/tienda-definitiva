"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { 
  ArrowLeft,
  Save,
  Copy,
  Eye,
  EyeOff,
  Calendar,
  Users,
  TrendingUp,
  BarChart3,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  Activity,
  DollarSign,
  Percent,
  Truck,
  Gift,
  Zap,
  RefreshCw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-hot-toast"

interface DiscountDetail {
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
  analytics: {
    totalRevenue: number
    totalSavings: number
    conversionRate: number
    avgOrderValue: number
    usageByDay: Array<{ date: string; uses: number; revenue: number }>
    usageByHour: Array<{ hour: number; uses: number }>
    topCustomers: Array<{ customerId: string; customerName: string; uses: number; savings: number }>
    recentUsage: Array<{ 
      orderId: string
      customerName: string
      orderTotal: number
      savings: number
      date: Date
    }>
  }
}

export default function DiscountDetailPage() {
  const router = useRouter()
  const params = useParams()
  const discountId = params.id as string
  
  const [discount, setDiscount] = useState<DiscountDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('details')
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'PERCENTAGE' as const,
    value: 0,
    minOrderAmount: null as number | null,
    maxOrderAmount: null as number | null,
    maxUses: null as number | null,
    usesPerCustomer: null as number | null,
    validFrom: '',
    validUntil: '',
    targetType: 'ALL' as const,
    stackable: false,
    firstTimeOnly: false,
    autoApply: false,
    description: '',
    internalNotes: ''
  })

  useEffect(() => {
    if (discountId) {
      loadDiscount()
    }
  }, [discountId])

  const loadDiscount = async () => {
    try {
      const response = await fetch(`/api/discounts/${discountId}`)
      if (response.ok) {
        const data = await response.json()
        setDiscount(data)
        
        // Initialize form data
        setFormData({
          code: data.code,
          name: data.name,
          type: data.type,
          value: data.value,
          minOrderAmount: data.minOrderAmount,
          maxOrderAmount: data.maxOrderAmount,
          maxUses: data.maxUses,
          usesPerCustomer: data.usesPerCustomer,
          validFrom: new Date(data.validFrom).toISOString().slice(0, 16),
          validUntil: data.validUntil ? new Date(data.validUntil).toISOString().slice(0, 16) : '',
          targetType: data.targetType,
          stackable: data.stackable,
          firstTimeOnly: data.firstTimeOnly,
          autoApply: data.autoApply,
          description: data.description,
          internalNotes: data.internalNotes
        })
      } else if (response.status === 404) {
        toast.error('Descuento no encontrado')
        router.push('/admin/discounts')
      }
    } catch (error) {
      console.error('Error loading discount:', error)
      toast.error('Error al cargar descuento')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/discounts/${discountId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          validFrom: new Date(formData.validFrom),
          validUntil: formData.validUntil ? new Date(formData.validUntil) : null
        })
      })

      if (response.ok) {
        toast.success('Descuento actualizado correctamente')
        setIsEditing(false)
        loadDiscount()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Error al actualizar descuento')
      }
    } catch (error) {
      toast.error('Error al actualizar descuento')
    } finally {
      setIsSaving(false)
    }
  }

  const toggleStatus = async () => {
    try {
      const response = await fetch(`/api/discounts/${discountId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !discount?.isActive })
      })

      if (response.ok) {
        toast.success(`Descuento ${!discount?.isActive ? 'activado' : 'desactivado'}`)
        loadDiscount()
      }
    } catch (error) {
      toast.error('Error al cambiar estado del descuento')
    }
  }

  const duplicateDiscount = async () => {
    if (!discount) return
    
    const duplicated = {
      ...discount,
      code: `${discount.code}_COPY`,
      name: `${discount.name} (Copia)`,
      isActive: false,
      usedCount: 0
    }
    
    delete duplicated.id
    delete duplicated.createdAt
    delete duplicated.updatedAt
    delete duplicated.analytics

    try {
      const response = await fetch('/api/discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duplicated)
      })

      if (response.ok) {
        const newDiscount = await response.json()
        toast.success('Descuento duplicado correctamente')
        router.push(`/admin/discounts/${newDiscount.id}`)
      }
    } catch (error) {
      toast.error('Error al duplicar descuento')
    }
  }

  const getStatusBadge = () => {
    if (!discount) return null
    
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
      case 'PERCENTAGE': return <Percent className="w-5 h-5" />
      case 'FIXED_AMOUNT': return <DollarSign className="w-5 h-5" />
      case 'FREE_SHIPPING': return <Truck className="w-5 h-5" />
      case 'BUY_X_GET_Y': return <Gift className="w-5 h-5" />
      case 'PROGRESSIVE': return <TrendingUp className="w-5 h-5" />
      default: return <Target className="w-5 h-5" />
    }
  }

  const tabs = [
    { id: 'details', label: 'Detalles', icon: <Eye className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'usage', label: 'Uso Reciente', icon: <Activity className="w-4 h-4" /> },
    { id: 'edit', label: 'Editar', icon: <Target className="w-4 h-4" /> }
  ]

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando descuento...</p>
        </div>
      </div>
    )
  }

  if (!discount) {
    return (
      <div className="p-6">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Descuento no encontrado</h3>
          <div className="mt-6">
            <Button onClick={() => router.push('/admin/discounts')}>
              Volver a Descuentos
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <div className="flex items-center gap-3">
              {getTypeIcon(discount.type)}
              <h1 className="text-3xl font-bold text-gray-900">{discount.code}</h1>
              {getStatusBadge()}
            </div>
            <p className="text-gray-600 mt-1">{discount.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={duplicateDiscount}>
            <Copy className="h-4 w-4 mr-2" />
            Duplicar
          </Button>
          <Button variant="outline" onClick={toggleStatus}>
            {discount.isActive ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {discount.isActive ? 'Desactivar' : 'Activar'}
          </Button>
          <Button variant="outline" onClick={loadDiscount}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Recargar
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Usos</p>
                <p className="text-2xl font-bold">{discount.usedCount}</p>
                <p className="text-xs text-gray-500">
                  de {discount.maxUses || '∞'} máximos
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ingresos</p>
                <p className="text-2xl font-bold text-green-600">
                  €{discount.analytics?.totalRevenue?.toFixed(2) || '0.00'}
                </p>
                <p className="text-xs text-gray-500">generados</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ahorros</p>
                <p className="text-2xl font-bold text-purple-600">
                  €{discount.analytics?.totalSavings?.toFixed(2) || '0.00'}
                </p>
                <p className="text-xs text-gray-500">para clientes</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversión</p>
                <p className="text-2xl font-bold text-orange-600">
                  {discount.analytics?.conversionRate?.toFixed(1) || '0'}%
                </p>
                <p className="text-xs text-gray-500">tasa de uso</p>
              </div>
              <Target className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      {discount.maxUses && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progreso de Uso</span>
              <span className="text-sm text-gray-500">
                {discount.usedCount} / {discount.maxUses}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((discount.usedCount / discount.maxUses) * 100, 100)}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Details Tab */}
      {activeTab === 'details' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del Descuento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Código</label>
                  <p className="font-mono font-bold text-primary-600 mt-1">{discount.code}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo</label>
                  <div className="flex items-center gap-2 mt-1">
                    {getTypeIcon(discount.type)}
                    <span>
                      {discount.type === 'PERCENTAGE' ? 'Porcentaje' :
                       discount.type === 'FIXED_AMOUNT' ? 'Cantidad Fija' :
                       discount.type === 'FREE_SHIPPING' ? 'Envío Gratis' :
                       discount.type === 'BUY_X_GET_Y' ? 'Lleva X Paga Y' :
                       'Progresivo'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Valor</label>
                <p className="text-lg font-bold mt-1">
                  {discount.type === 'PERCENTAGE' ? `${discount.value}%` :
                   discount.type === 'FIXED_AMOUNT' ? `€${discount.value}` :
                   discount.type === 'FREE_SHIPPING' ? 'Envío gratuito' :
                   `${discount.value}`}
                </p>
              </div>

              {discount.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Descripción</label>
                  <p className="text-gray-600 mt-1">{discount.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Aplicar a</label>
                  <p className="mt-1">
                    {discount.targetType === 'ALL' ? 'Todos los productos' :
                     discount.targetType === 'PRODUCTS' ? 'Productos específicos' :
                     discount.targetType === 'CATEGORIES' ? 'Categorías específicas' :
                     'Usuarios específicos'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Restricciones</label>
                  <div className="mt-1 space-y-1">
                    {discount.firstTimeOnly && (
                      <Badge variant="secondary" className="text-xs">Solo nuevos clientes</Badge>
                    )}
                    {discount.stackable && (
                      <Badge variant="secondary" className="text-xs">Acumulable</Badge>
                    )}
                    {discount.autoApply && (
                      <Badge variant="secondary" className="text-xs">Auto-aplicado</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Condiciones y Límites</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {discount.minOrderAmount && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Pedido Mínimo</label>
                  <p className="text-lg font-bold text-green-600 mt-1">€{discount.minOrderAmount}</p>
                </div>
              )}

              {discount.maxOrderAmount && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Pedido Máximo</label>
                  <p className="text-lg font-bold text-red-600 mt-1">€{discount.maxOrderAmount}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Usos Máximos</label>
                  <p className="mt-1">{discount.maxUses || 'Ilimitado'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Por Cliente</label>
                  <p className="mt-1">{discount.usesPerCustomer || 'Ilimitado'}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Período de Validez</label>
                <div className="mt-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>Desde: {new Date(discount.validFrom).toLocaleDateString('es-ES')}</span>
                  </div>
                  {discount.validUntil && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>Hasta: {new Date(discount.validUntil).toLocaleDateString('es-ES')}</span>
                    </div>
                  )}
                </div>
              </div>

              {discount.internalNotes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notas Internas</label>
                  <p className="text-gray-600 mt-1 text-sm">{discount.internalNotes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>📊 Análisis de Rendimiento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Analytics Avanzados</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Los gráficos detallados de uso y rendimiento estarán disponibles próximamente
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Usage Tab */}
      {activeTab === 'usage' && (
        <Card>
          <CardHeader>
            <CardTitle>Uso Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Activity className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Sin uso reciente</h3>
              <p className="mt-1 text-sm text-gray-500">
                Los pedidos que usen este descuento aparecerán aquí
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Tab */}
      {activeTab === 'edit' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Editar Descuento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Información Básica</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Código de Descuento
                    </label>
                    <Input
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del Descuento
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
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
                    />
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
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <Button variant="outline" onClick={() => setActiveTab('details')}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}