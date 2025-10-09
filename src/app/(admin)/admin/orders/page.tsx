'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Filter,
  Eye,
  Edit3,
  Package,
  Clock,
  CheckCircle,
  AlertTriangle,
  Truck,
  MoreHorizontal,
  Download,
  RefreshCw,
  Plus,
  ChevronDown,
  CreditCard,
  Ban,
  RotateCcw,
  DollarSign,
  MapPin,
  MessageSquare,
  Printer,
  Send
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import StockAllocationViewer from '@/components/admin/inventory/StockAllocationViewer'

interface Order {
  id: string
  orderNumber: string
  status: 'PENDING' | 'CONFIRMED' | 'IN_PRODUCTION' | 'READY_FOR_PICKUP' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED'
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED'
  totalAmount: number
  shippingCost: number
  taxAmount: number
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
    product: {
      name: string
      images: string
    }
    variant?: {
      sku: string
      size?: string
      color?: string
    }
    design?: {
      name: string
      imageUrl: string
    }
  }>
  user?: {
    id: string
    name: string
    email: string
  }
  address?: any
}

interface OrdersPageData {
  orders: Order[]
  total: number
  pages: number
  currentPage: number
  stats: {
    totalRevenue: number
    totalOrders: number
    todayOrders: number
    statusCounts: Record<string, number>
  }
}

export default function OrdersPage() {
  const [data, setData] = useState<OrdersPageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)
  const [dropdownPosition, setDropdownPosition] = useState<{top: number, right: number} | null>(null)

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
    PENDING: { label: 'Pendiente', color: 'text-gray-600' },
    PAID: { label: 'Pagado', color: 'text-green-600' },
    FAILED: { label: 'Fallido', color: 'text-red-600' },
    REFUNDED: { label: 'Reembolsado', color: 'text-orange-600' },
    PARTIALLY_REFUNDED: { label: 'Parcial', color: 'text-yellow-600' }
  }

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter })
      })

      console.log('Fetching orders with params:', params.toString())
      const response = await fetch(`/api/orders?${params}`)
      
      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)
      
      if (!response.ok) {
        // Intentar obtener más información del error
        const errorText = await response.text()
        console.error('Error response:', errorText)
        
        let errorMessage = 'Error al cargar pedidos'
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.error || errorMessage
        } catch {
          // Si no es JSON válido, usar el texto como está
          errorMessage = errorText || errorMessage
        }
        
        throw new Error(errorMessage)
      }
      
      const result = await response.json()
      console.log('Orders loaded successfully:', result)
      setData(result)
    } catch (error) {
      console.error('Error loading orders:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al cargar pedidos'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [page, searchTerm, statusFilter])

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown && !(event.target as Element).closest('.relative') && !(event.target as Element).closest('.fixed')) {
        setOpenDropdown(null)
        setDropdownPosition(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openDropdown])

  // Función para actualizar el estado del pedido
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdating(orderId)
      console.log('Actualizando estado del pedido:', { orderId, newStatus })
      
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      console.log('Response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.text()
        console.error('Error response:', errorData)
        
        let errorMessage = 'Error al actualizar estado'
        try {
          const errorJson = JSON.parse(errorData)
          errorMessage = errorJson.error || errorMessage
        } catch (parseError) {
          console.error('Error parsing error response:', parseError)
        }
        
        throw new Error(errorMessage)
      }

      const result = await response.json()
      console.log('Resultado exitoso:', result)
      
      toast.success('Estado del pedido actualizado')
      fetchOrders() // Recargar datos
      setOpenDropdown(null)
      setDropdownPosition(null)
    } catch (error) {
      console.error('Error completo:', error)
      toast.error(error instanceof Error ? error.message : 'Error al actualizar el estado del pedido')
    } finally {
      setUpdating(null)
    }
  }

  // Función para actualizar el estado del pago
  const updatePaymentStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdating(orderId)
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: newStatus })
      })

      if (!response.ok) throw new Error('Error al actualizar estado de pago')

      toast.success('Estado de pago actualizado')
      fetchOrders() // Recargar datos
      setOpenDropdown(null)
      setDropdownPosition(null)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al actualizar el estado de pago')
    } finally {
      setUpdating(null)
    }
  }

  // Función para agregar número de seguimiento
  const addTrackingNumber = async (orderId: string) => {
    const trackingNumber = prompt('Ingresa el número de seguimiento:')
    if (!trackingNumber) return

    try {
      setUpdating(orderId)
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingNumber })
      })

      if (!response.ok) throw new Error('Error al agregar número de seguimiento')

      toast.success('Número de seguimiento agregado')
      fetchOrders()
      setOpenDropdown(null)
      setDropdownPosition(null)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al agregar número de seguimiento')
    } finally {
      setUpdating(null)
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

  const getProductionProgress = (orderItems: Order['orderItems']) => {
    const total = orderItems.length
    const completed = orderItems.filter(item => item.productionStatus === 'COMPLETED').length
    const inProgress = orderItems.filter(item => item.productionStatus === 'IN_PROGRESS').length
    
    return {
      completed,
      inProgress,
      pending: total - completed - inProgress,
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

  return (
    <div className="space-y-4 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📦 Gestión de Pedidos</h1>
          <p className="text-gray-600 text-sm">Administra y monitorea todos los pedidos</p>
        </div>
        <div className="flex gap-2">
          <Button asChild className="bg-orange-500 hover:bg-orange-600 flex items-center gap-2">
            <Link href="/admin/orders/new">
              <Plus className="w-4 h-4" />
              Nuevo Pedido
            </Link>
          </Button>
          <Button variant="outline" onClick={fetchOrders} className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {data?.stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pedidos</p>
                <p className="text-2xl font-bold text-gray-900">{data.stats.totalOrders}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Hoy</p>
                <p className="text-2xl font-bold text-gray-900">{data.stats.todayOrders}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Facturación</p>
                <p className="text-2xl font-bold text-gray-900">€{data.stats.totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">En Producción</p>
                <p className="text-2xl font-bold text-gray-900">{data.stats.statusCounts.IN_PRODUCTION || 0}</p>
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
                placeholder="Buscar por número, cliente o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('all')}
              size="sm"
            >
              Todos
            </Button>
            {Object.entries(statusConfig).map(([status, config]) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'default' : 'outline'}
                onClick={() => setStatusFilter(status)}
                size="sm"
                className="flex items-center gap-1"
              >
                <config.icon className="w-3 h-3" />
                {config.label}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Orders Table */}
      <Card className="w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pedido
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado del Pago
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado del Pedido
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Artículos
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.orders.map((order, orderIndex) => {
                const statusInfo = statusConfig[order.status]
                const paymentInfo = paymentStatusConfig[order.paymentStatus]
                const productionProgress = getProductionProgress(order.orderItems)
                const isLastRows = orderIndex >= (data?.orders.length || 0) - 3 // Últimas 3 filas
                
                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    {/* Pedido */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {order.orderNumber}
                        </div>
                        {order.trackingNumber && (
                          <div className="text-xs text-blue-600 font-mono">
                            {order.trackingNumber}
                          </div>
                        )}
                      </div>
                    </td>
                    
                    {/* Fecha */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    
                    {/* Cliente */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          <Link href={`/admin/customers?search=${order.customerEmail}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                            {order.customerName}
                          </Link>
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.customerEmail}
                        </div>
                        {order.customerPhone && (
                          <div className="text-xs text-gray-500">
                            {order.customerPhone}
                          </div>
                        )}
                      </div>
                    </td>
                    
                    {/* Total */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          €{order.totalAmount.toFixed(2)}
                        </div>
                        {order.shippingCost > 0 && (
                          <div className="text-xs text-gray-500">
                            +€{order.shippingCost.toFixed(2)} envío
                          </div>
                        )}
                      </div>
                    </td>
                    
                    {/* Estado del Pago */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${paymentInfo.color}`}>
                        💳 {paymentInfo.label}
                      </span>
                    </td>
                    
                    {/* Estado del Pedido */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                        <statusInfo.icon className="w-3 h-3 mr-1" />
                        {statusInfo.label}
                      </span>
                    </td>
                    
                    {/* Artículos */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {order.orderItems.length} artículo(s)
                        </div>
                        <div className="text-xs text-gray-500">
                          Producción: {productionProgress.completed}/{productionProgress.total}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <Link href={`/admin/orders/${order.id}`}>
                          <Button size="sm" variant="outline" className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            Ver
                          </Button>
                        </Link>
                        
                        {/* Dropdown de acciones */}
                        <div className="relative">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex items-center gap-1"
                            onClick={(e) => {
                              if (openDropdown === order.id) {
                                setOpenDropdown(null)
                                setDropdownPosition(null)
                              } else {
                                const rect = e.currentTarget.getBoundingClientRect()
                                setDropdownPosition({
                                  top: rect.bottom + window.scrollY + 8,
                                  right: window.innerWidth - rect.right
                                })
                                setOpenDropdown(order.id)
                              }
                            }}
                            disabled={updating === order.id}
                          >
                            {updating === order.id ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-600"></div>
                            ) : (
                              <MoreHorizontal className="w-3 h-3" />
                            )}
                            <ChevronDown className="w-3 h-3" />
                          </Button>
                          
                          {openDropdown === order.id && dropdownPosition && (
                            <div 
                              className="fixed w-64 bg-white rounded-md shadow-xl border border-gray-200 z-[9999] max-h-96 overflow-y-auto"
                              style={{
                                top: dropdownPosition.top,
                                right: dropdownPosition.right
                              }}
                            >
                              <div className="py-1">
                                {/* Cambiar estado del pedido */}
                                <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase border-b">
                                  Estado del Pedido
                                </div>
                                {Object.entries(statusConfig).map(([status, config]) => (
                                  <button
                                    key={status}
                                    onClick={() => updateOrderStatus(order.id, status)}
                                    disabled={order.status === status}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 ${
                                      order.status === status ? 'bg-gray-100 text-gray-400' : ''
                                    }`}
                                  >
                                    <config.icon className="w-4 h-4" />
                                    {config.label}
                                    {order.status === status && (
                                      <CheckCircle className="w-3 h-3 ml-auto text-green-500" />
                                    )}
                                  </button>
                                ))}
                                
                                {/* Separador */}
                                <div className="border-t border-gray-200 my-1"></div>
                                
                                {/* Cambiar estado del pago */}
                                <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">
                                  Estado del Pago
                                </div>
                                {Object.entries(paymentStatusConfig).map(([status, config]) => (
                                  <button
                                    key={status}
                                    onClick={() => updatePaymentStatus(order.id, status)}
                                    disabled={order.paymentStatus === status}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 ${
                                      order.paymentStatus === status ? 'bg-gray-100 text-gray-400' : ''
                                    }`}
                                  >
                                    <CreditCard className="w-4 h-4" />
                                    {config.label}
                                    {order.paymentStatus === status && (
                                      <CheckCircle className="w-3 h-3 ml-auto text-green-500" />
                                    )}
                                  </button>
                                ))}
                                
                                {/* Separador */}
                                <div className="border-t border-gray-200 my-1"></div>
                                
                                {/* Otras acciones */}
                                <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">
                                  Acciones
                                </div>
                                
                                <button
                                  onClick={() => addTrackingNumber(order.id)}
                                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <MapPin className="w-4 h-4" />
                                  {order.trackingNumber ? 'Actualizar Seguimiento' : 'Agregar Seguimiento'}
                                </button>
                                
                                <Link 
                                  href={`/admin/orders/${order.id}`}
                                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                                  onClick={() => {
                                    setOpenDropdown(null)
                                    setDropdownPosition(null)
                                  }}
                                >
                                  <Edit3 className="w-4 h-4" />
                                  Editar Pedido
                                </Link>
                                
                                <button
                                  onClick={async () => {
                                    try {
                                      toast.info('Enviando email al cliente...')
                                      
                                      const response = await fetch(`/api/admin/orders/${order.id}/send-email`, {
                                        method: 'POST',
                                        headers: {
                                          'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify({
                                          type: 'status_update',
                                          customMessage: 'Actualización manual desde el panel de administración'
                                        })
                                      })

                                      const result = await response.json()
                                      
                                      if (result.success) {
                                        toast.success('Email enviado exitosamente')
                                      } else {
                                        toast.error(result.error || 'Error enviando email')
                                      }
                                    } catch (error) {
                                      console.error('Error sending email:', error)
                                      toast.error('Error enviando email')
                                    }
                                    
                                    setOpenDropdown(null)
                                    setDropdownPosition(null)
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Send className="w-4 h-4" />
                                  Enviar Email al Cliente
                                </button>
                                
                                <button
                                  onClick={() => {
                                    // Función de impresión del pedido
                                    const printContent = `
                                      <div style="font-family: Arial, sans-serif; padding: 20px;">
                                        <h1>Pedido #${order.orderNumber}</h1>
                                        <div style="margin: 20px 0;">
                                          <strong>Cliente:</strong> ${order.user?.name || 'N/A'}<br>
                                          <strong>Email:</strong> ${order.user?.email || 'N/A'}<br>
                                          <strong>Estado:</strong> ${order.status}<br>
                                          <strong>Fecha:</strong> ${new Date(order.createdAt).toLocaleDateString('es-ES')}<br>
                                          <strong>Total:</strong> €${order.totalAmount.toFixed(2)}
                                        </div>
                                        <h3>Productos:</h3>
                                        <table style="width: 100%; border-collapse: collapse;">
                                          <thead>
                                            <tr style="border-bottom: 1px solid #ddd;">
                                              <th style="text-align: left; padding: 8px;">Producto</th>
                                              <th style="text-align: center; padding: 8px;">Cantidad</th>
                                              <th style="text-align: right; padding: 8px;">Precio Unit.</th>
                                              <th style="text-align: right; padding: 8px;">Total</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            ${order.orderItems?.map(item => `
                                              <tr style="border-bottom: 1px solid #eee;">
                                                <td style="padding: 8px;">${item.productName}</td>
                                                <td style="text-align: center; padding: 8px;">${item.quantity}</td>
                                                <td style="text-align: right; padding: 8px;">€${item.unitPrice.toFixed(2)}</td>
                                                <td style="text-align: right; padding: 8px;">€${(item.unitPrice * item.quantity).toFixed(2)}</td>
                                              </tr>
                                            `).join('') || ''}
                                          </tbody>
                                        </table>
                                      </div>
                                    `
                                    
                                    const printWindow = window.open('', '_blank')
                                    if (printWindow) {
                                      printWindow.document.write(printContent)
                                      printWindow.document.close()
                                      printWindow.print()
                                      printWindow.close()
                                    }
                                    
                                    toast.success('Abriendo vista de impresión...')
                                    setOpenDropdown(null)
                                    setDropdownPosition(null)
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Printer className="w-4 h-4" />
                                  Imprimir Pedido
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Espacio para dropdowns */}
        <div style={{ height: '100px' }}></div>

        {/* Pagination */}
        {data && data.pages > 1 && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Página {data.currentPage} de {data.pages} ({data.total} pedidos)
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Anterior
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page === data.pages}
                  onClick={() => setPage(page + 1)}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Empty State */}
      {data?.orders.length === 0 && (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay pedidos</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== 'all'
              ? 'No se encontraron pedidos con los filtros aplicados'
              : 'Los pedidos aparecerán aquí cuando se realicen'
            }
          </p>
        </div>
      )}
    </div>
  )
}