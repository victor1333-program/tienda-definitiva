'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  ArrowLeft, 
  Package, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Truck,
  Edit3,
  Save,
  X,
  Download,
  Printer,
  MessageSquare,
  RefreshCw,
  DollarSign,
  CreditCard,
  ExternalLink,
  History,
  Settings
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import OrderTimelineModal from '@/components/orders/OrderTimelineModal'
import OrderStatusModal from '@/components/orders/OrderStatusModal'
import StockAllocationViewer from '@/components/admin/inventory/StockAllocationViewer'

interface OrderDetail {
  id: string
  orderNumber: string
  status: 'PENDING' | 'CONFIRMED' | 'IN_PRODUCTION' | 'READY_FOR_PICKUP' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED'
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED'
  totalAmount: number
  shippingCost: number
  taxAmount: number
  discountAmount?: number
  customerEmail: string
  customerName: string
  customerPhone?: string
  shippingMethod: string
  trackingNumber?: string
  customerNotes?: string
  adminNotes?: string
  createdAt: string
  updatedAt: string
  orderItems: Array<{
    id: string
    quantity: number
    unitPrice: number
    totalPrice: number
    productionStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD'
    productionNotes?: string
    product: {
      id: string
      name: string
      images: string
    }
    variant?: {
      id: string
      sku: string
      size?: string
      color?: string
      material?: string
    }
    design?: {
      id: string
      name: string
      imageUrl: string
    }
    customization?: any
  }>
  address?: {
    id: string
    street: string
    city: string
    state: string
    zipCode: string
    country: string
    isDefault: boolean
  }
  user?: {
    id: string
    name: string
    email: string
    phone?: string
  }
  timeline: Array<{
    id: string
    action: string
    description: string
    createdAt: string
    user?: {
      name: string
    }
  }>
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string

  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [updating, setUpdating] = useState(false)
  const [showTimelineModal, setShowTimelineModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)

  const statusConfig = {
    PENDING: { label: 'Pendiente', color: 'bg-gray-100 text-gray-800', icon: Clock },
    CONFIRMED: { label: 'Confirmado', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
    IN_PRODUCTION: { label: 'En Producción', color: 'bg-yellow-100 text-yellow-800', icon: Package },
    READY_FOR_PICKUP: { label: 'Listo', color: 'bg-purple-100 text-purple-800', icon: Package },
    SHIPPED: { label: 'Enviado', color: 'bg-indigo-100 text-indigo-800', icon: Truck },
    DELIVERED: { label: 'Entregado', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    CANCELLED: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: AlertTriangle },
    REFUNDED: { label: 'Reembolsado', color: 'bg-orange-100 text-orange-800', icon: RefreshCw }
  }

  const paymentStatusConfig = {
    PENDING: { label: 'Pendiente', color: 'text-gray-600', icon: '⏳' },
    PAID: { label: 'Pagado', color: 'text-green-600', icon: '✅' },
    FAILED: { label: 'Fallido', color: 'text-red-600', icon: '❌' },
    REFUNDED: { label: 'Reembolsado', color: 'text-orange-600', icon: '🔄' },
    PARTIALLY_REFUNDED: { label: 'Parcial', color: 'text-yellow-600', icon: '⚠️' }
  }

  const productionStatusConfig = {
    PENDING: { label: 'Pendiente', color: 'bg-gray-100 text-gray-800', icon: '⏳' },
    IN_PROGRESS: { label: 'En Progreso', color: 'bg-blue-100 text-blue-800', icon: '🔄' },
    COMPLETED: { label: 'Completado', color: 'bg-green-100 text-green-800', icon: '✅' },
    ON_HOLD: { label: 'En Espera', color: 'bg-yellow-100 text-yellow-800', icon: '⏸️' }
  }

  const fetchOrder = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/orders/${orderId}`)
      if (!response.ok) throw new Error('Error al cargar pedido')
      
      const data = await response.json()
      setOrder(data)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al cargar el pedido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (orderId) {
      fetchOrder()
    }
  }, [orderId])

  const handleFieldEdit = (field: string, currentValue: string) => {
    setEditingField(field)
    setEditValue(currentValue)
  }

  const handleFieldSave = async (field: string) => {
    if (!order) return

    try {
      setUpdating(true)
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: editValue })
      })

      if (!response.ok) throw new Error('Error al actualizar')

      const updatedOrder = await response.json()
      setOrder(updatedOrder)
      setEditingField(null)
      toast.success('Campo actualizado correctamente')
    } catch (error) {
      toast.error('Error al actualizar el campo')
    } finally {
      setUpdating(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return

    try {
      setUpdating(true)
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) throw new Error('Error al actualizar estado')

      const updatedOrder = await response.json()
      setOrder(updatedOrder)
      toast.success('Estado actualizado correctamente')
    } catch (error) {
      toast.error('Error al actualizar el estado')
    } finally {
      setUpdating(false)
    }
  }

  const handleItemStatusChange = async (itemId: string, newStatus: string) => {
    try {
      setUpdating(true)
      const response = await fetch(`/api/orders/${orderId}/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productionStatus: newStatus })
      })

      if (!response.ok) throw new Error('Error al actualizar estado del producto')

      await fetchOrder()
      toast.success('Estado del producto actualizado')
    } catch (error) {
      toast.error('Error al actualizar el estado del producto')
    } finally {
      setUpdating(false)
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

  const getProductionProgress = () => {
    if (!order) return { completed: 0, total: 0, percentage: 0 }
    
    const total = order.orderItems.length
    const completed = order.orderItems.filter(item => item.productionStatus === 'COMPLETED').length
    return {
      completed,
      total,
      percentage: Math.round((completed / total) * 100)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Pedido no encontrado</h3>
        <p className="mt-1 text-sm text-gray-500">
          No se pudo cargar la información del pedido
        </p>
        <Button onClick={() => router.back()} className="mt-4">
          Volver
        </Button>
      </div>
    )
  }

  const statusInfo = statusConfig[order.status]
  const paymentInfo = paymentStatusConfig[order.paymentStatus]
  const progress = getProductionProgress()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Pedido #{order.orderNumber}
            </h1>
            <p className="text-gray-600">
              Creado el {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowTimelineModal(true)}
            className="flex items-center gap-2"
          >
            <History className="w-4 h-4" />
            Historial
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Descargar
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Printer className="w-4 h-4" />
            Imprimir
          </Button>
        </div>
      </div>

      {/* Status and Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-900">Estado del Pedido</h3>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowStatusModal(true)}
              className="flex items-center gap-1"
            >
              <Edit3 className="w-3 h-3" />
              Cambiar
            </Button>
          </div>
          <div className="space-y-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
              <statusInfo.icon className="w-4 h-4 mr-2" />
              {statusInfo.label}
            </span>
            <div className={`text-sm ${paymentInfo.color}`}>
              {paymentInfo.icon} {paymentInfo.label}
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-medium text-gray-900 mb-2">Progreso de Producción</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-green-500 h-3 rounded-full transition-all"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-900">
                {progress.percentage}%
              </span>
            </div>
            <div className="text-sm text-gray-600">
              {progress.completed} de {progress.total} productos completados
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-medium text-gray-900 mb-2">Resumen Financiero</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>€{(order.totalAmount - order.shippingCost - order.taxAmount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Envío:</span>
              <span>€{order.shippingCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>IVA:</span>
              <span>€{order.taxAmount.toFixed(2)}</span>
            </div>
            {order.discountAmount && (
              <div className="flex justify-between text-green-600">
                <span>Descuento:</span>
                <span>-€{order.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-medium text-lg border-t pt-1">
              <span>Total:</span>
              <span>€{order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Customer and Shipping Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Información del Cliente
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <span>{order.customerName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <span>{order.customerEmail}</span>
            </div>
            {order.customerPhone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{order.customerPhone}</span>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Dirección de Envío
          </h3>
          {order.address ? (
            <div className="space-y-1 text-sm">
              <p>{order.address.street}</p>
              <p>{order.address.city}, {order.address.state}</p>
              <p>{order.address.zipCode}</p>
              <p>{order.address.country}</p>
              <div className="mt-3 flex items-center gap-2 text-gray-600">
                <Truck className="w-4 h-4" />
                <span>{order.shippingMethod}</span>
              </div>
              {order.trackingNumber && (
                <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">
                      Seguimiento: {order.trackingNumber}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">No hay dirección de envío</p>
          )}
        </Card>
      </div>

      {/* Order Items */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <Package className="w-5 h-5" />
          Productos del Pedido
        </h3>
        <div className="space-y-4">
          {order.orderItems.map((item) => {
            const productImages = JSON.parse(item.product.images || '[]')
            const firstImage = productImages[0]
            const productionStatus = productionStatusConfig[item.productionStatus]
            
            return (
              <div key={item.id} className="border rounded-lg p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {firstImage ? (
                      <img
                        className="h-16 w-16 rounded-lg object-cover"
                        src={firstImage}
                        alt={item.product.name}
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center">
                        📦
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {item.product.name}
                        </h4>
                        {item.variant && (
                          <p className="text-sm text-gray-600">
                            SKU: {item.variant.sku} • {[item.variant.size, item.variant.color, item.variant.material].filter(Boolean).join(' • ')}
                          </p>
                        )}
                        {item.design && (
                          <p className="text-sm text-blue-600">
                            🎨 Diseño: {item.design.name}
                          </p>
                        )}
                        <p className="text-sm text-gray-600">
                          Cantidad: {item.quantity} • €{item.unitPrice.toFixed(2)} c/u
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          €{item.totalPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${productionStatus.color}`}>
                          {productionStatus.icon} {productionStatus.label}
                        </span>
                      </div>
                      
                      <div className="flex gap-2">
                        <select
                          value={item.productionStatus}
                          onChange={(e) => handleItemStatusChange(item.id, e.target.value)}
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                          disabled={updating}
                        >
                          <option value="PENDING">Pendiente</option>
                          <option value="IN_PROGRESS">En Progreso</option>
                          <option value="COMPLETED">Completado</option>
                          <option value="ON_HOLD">En Espera</option>
                        </select>
                      </div>
                    </div>
                    
                    {item.productionNotes && (
                      <div className="mt-2 p-2 bg-yellow-50 rounded text-sm">
                        <strong>Notas de producción:</strong> {item.productionNotes}
                      </div>
                    )}

                    {/* Stock Allocation Viewer */}
                    {item.variant && (
                      <div className="mt-4 border-t pt-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">
                          📦 Asignación de Stock Multi-Marca
                        </h5>
                        <StockAllocationViewer
                          orderItemId={item.id}
                          className="border-0 bg-gray-50"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Notes Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Notas del Cliente
          </h3>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              {order.customerNotes || 'Sin notas del cliente'}
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Edit3 className="w-5 h-5" />
            Notas Administrativas
          </h3>
          <div className="space-y-2">
            {editingField === 'adminNotes' ? (
              <div className="space-y-2">
                <textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleFieldSave('adminNotes')}
                    disabled={updating}
                    className="flex items-center gap-1"
                  >
                    <Save className="w-3 h-3" />
                    Guardar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingField(null)}
                    className="flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  {order.adminNotes || 'Sin notas administrativas'}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleFieldEdit('adminNotes', order.adminNotes || '')}
                  className="flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" />
                  Editar
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Timeline */}
      {order.timeline && order.timeline.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Historial del Pedido
          </h3>
          <div className="space-y-4">
            {order.timeline.map((event, index) => (
              <div key={event.id} className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {event.action}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(event.createdAt)}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {event.description}
                  </p>
                  {event.user && (
                    <p className="text-xs text-gray-500 mt-1">
                      Por: {event.user.name}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Modals */}
      <OrderTimelineModal
        orderId={orderId}
        isOpen={showTimelineModal}
        onClose={() => setShowTimelineModal(false)}
        onUpdate={fetchOrder}
      />

      <OrderStatusModal
        orderId={orderId}
        currentStatus={order.status}
        currentPaymentStatus={order.paymentStatus}
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        onUpdate={fetchOrder}
      />
    </div>
  )
}