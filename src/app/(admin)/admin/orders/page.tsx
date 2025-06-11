'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
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
  RefreshCw
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

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

      const response = await fetch(`/api/orders?${params}`)
      if (!response.ok) throw new Error('Error al cargar pedidos')
      
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al cargar los pedidos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [page, searchTerm, statusFilter])

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📦 Gestión de Pedidos</h1>
          <p className="text-gray-600">Administra y monitorea todos los pedidos</p>
        </div>
        <div className="flex gap-2">
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
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pedido
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.orders.map((order) => {
                const statusInfo = statusConfig[order.status]
                const paymentInfo = paymentStatusConfig[order.paymentStatus]
                const productionProgress = getProductionProgress(order.orderItems)
                
                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {order.orderNumber}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.orderItems.length} producto(s)
                        </div>
                        {order.trackingNumber && (
                          <div className="text-xs text-blue-600 font-mono">
                            {order.trackingNumber}
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {order.customerName}
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
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                          <statusInfo.icon className="w-3 h-3 mr-1" />
                          {statusInfo.label}
                        </span>
                        <div className={`text-xs ${paymentInfo.color}`}>
                          💳 {paymentInfo.label}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all"
                              style={{ width: `${productionProgress.percentage}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-900">
                            {productionProgress.percentage}%
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {productionProgress.completed}/{productionProgress.total} completados
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
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
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <Link href={`/admin/orders/${order.id}`}>
                          <Button size="sm" variant="outline" className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            Ver
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          <MoreHorizontal className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

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