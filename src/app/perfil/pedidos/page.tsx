"use client"

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Package, 
  Clock, 
  Truck, 
  CheckCircle, 
  XCircle, 
  ArrowLeft, 
  Search,
  Filter,
  Calendar,
  Eye,
  Download
} from 'lucide-react'

interface OrderItem {
  id: string
  productId: string
  quantity: number
  price: number
  product: {
    id: string
    name: string
    image?: string
    slug: string
  }
  customization?: any
}

interface Order {
  id: string
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  total: number
  subtotal: number
  shipping: number
  tax: number
  createdAt: string
  updatedAt: string
  items: OrderItem[]
  shippingAddress?: {
    name: string
    address: string
    city: string
    postalCode: string
    phone: string
  }
  trackingNumber?: string
  estimatedDelivery?: string
}

export default function MisPedidosPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (session?.user) {
      fetchOrders()
    }
  }, [session, status, router])

  const fetchOrders = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/orders/user')
      if (response.ok) {
        const ordersData = await response.json()
        setOrders(ordersData)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusInfo = (status: Order['status']) => {
    const statusMap = {
      'PENDING': { 
        variant: 'secondary' as const, 
        label: 'Pendiente', 
        icon: Clock,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50'
      },
      'PROCESSING': { 
        variant: 'default' as const, 
        label: 'Procesando', 
        icon: Package,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50'
      },
      'SHIPPED': { 
        variant: 'outline' as const, 
        label: 'Enviado', 
        icon: Truck,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50'
      },
      'DELIVERED': { 
        variant: 'default' as const, 
        label: 'Entregado', 
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50'
      },
      'CANCELLED': { 
        variant: 'destructive' as const, 
        label: 'Cancelado', 
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-50'
      }
    }
    
    return statusMap[status]
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.items.some(item => item.product.name.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (status === 'loading' || isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando pedidos...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/perfil">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al Perfil
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mis Pedidos</h1>
              <p className="text-gray-600 mt-1">Historial completo de tus compras</p>
            </div>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Búsqueda */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Buscar por número de pedido o producto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              
              {/* Filtro por estado */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">Todos los estados</option>
                  <option value="PENDING">Pendiente</option>
                  <option value="PROCESSING">Procesando</option>
                  <option value="SHIPPED">Enviado</option>
                  <option value="DELIVERED">Entregado</option>
                  <option value="CANCELLED">Cancelado</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <Package className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{orders.length}</div>
              <div className="text-sm text-gray-600">Total Pedidos</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6 text-center">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">
                {orders.filter(o => o.status === 'DELIVERED').length}
              </div>
              <div className="text-sm text-gray-600">Entregados</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6 text-center">
              <Truck className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">
                {orders.filter(o => o.status === 'SHIPPED').length}
              </div>
              <div className="text-sm text-gray-600">En Camino</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6 text-center">
              <Calendar className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">
                {formatPrice(orders.reduce((total, order) => total + order.total, 0))}
              </div>
              <div className="text-sm text-gray-600">Total Gastado</div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de pedidos */}
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || statusFilter !== "all" ? "No se encontraron pedidos" : "No tienes pedidos aún"}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== "all" 
                  ? "Intenta cambiar los filtros de búsqueda" 
                  : "¡Explora nuestros productos y haz tu primer pedido!"
                }
              </p>
              {!searchTerm && statusFilter === "all" && (
                <Button asChild>
                  <Link href="/productos">Ver Productos</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const statusInfo = getStatusInfo(order.status)
              const StatusIcon = statusInfo.icon
              
              return (
                <Card key={order.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    {/* Header del pedido */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                      <div className="flex items-center gap-4 mb-4 sm:mb-0">
                        <div className={`p-3 rounded-full ${statusInfo.bgColor}`}>
                          <StatusIcon className={`w-6 h-6 ${statusInfo.color}`} />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold">Pedido #{order.id}</h3>
                          <p className="text-gray-600">{formatDate(order.createdAt)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <Badge variant={statusInfo.variant} className="text-sm">
                          {statusInfo.label}
                        </Badge>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            {formatPrice(order.total)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {order.items.length} {order.items.length === 1 ? 'producto' : 'productos'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Información de envío */}
                    {order.trackingNumber && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Truck className="w-4 h-4 text-gray-600" />
                          <span className="font-medium">Información de Envío</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p><strong>Número de seguimiento:</strong> {order.trackingNumber}</p>
                          {order.estimatedDelivery && (
                            <p><strong>Entrega estimada:</strong> {formatDate(order.estimatedDelivery)}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Items del pedido */}
                    <div className="space-y-3 mb-6">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                          {item.product.image && (
                            <img 
                              src={item.product.image} 
                              alt={item.product.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1">
                            <h4 className="font-medium">{item.product.name}</h4>
                            <div className="text-sm text-gray-600">
                              <span>Cantidad: {item.quantity}</span>
                              <span className="mx-2">•</span>
                              <span>Precio: {formatPrice(item.price)}</span>
                            </div>
                            {item.customization && (
                              <div className="text-xs text-gray-500 mt-1">
                                Personalizado
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              {formatPrice(item.price * item.quantity)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Desglose de precios */}
                    <div className="border-t pt-4 mb-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>{formatPrice(order.subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Envío:</span>
                          <span>{formatPrice(order.shipping)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>IVA:</span>
                          <span>{formatPrice(order.tax)}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-lg border-t pt-2">
                          <span>Total:</span>
                          <span>{formatPrice(order.total)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex flex-wrap gap-3">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/perfil/pedidos/${order.id}`}>
                          <Eye className="w-4 h-4 mr-2" />
                          Ver Detalles
                        </Link>
                      </Button>
                      
                      {order.status === 'DELIVERED' && (
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Descargar Factura
                        </Button>
                      )}
                      
                      {order.trackingNumber && (
                        <Button variant="outline" size="sm">
                          <Truck className="w-4 h-4 mr-2" />
                          Rastrear Envío
                        </Button>
                      )}
                      
                      {order.status === 'DELIVERED' && (
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/productos?reorder=${order.id}`}>
                            <Package className="w-4 h-4 mr-2" />
                            Volver a Comprar
                          </Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}