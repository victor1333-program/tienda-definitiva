"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import useSWR from "swr"
import { 
  ArrowLeft, 
  Edit2, 
  Trash2, 
  Mail, 
  Phone, 
  Calendar,
  Euro,
  ShoppingBag,
  MapPin,
  User,
  TrendingUp,
  Clock,
  Star,
  Package,
  Eye,
  MessageSquare,
  Award,
  Building,
  CreditCard,
  Heart,
  Tag,
  BarChart3,
  Activity,
  Send,
  Plus,
  FileText,
  AlertCircle,
  UserCheck,
  UserX,
  Target,
  Gift
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import fetcher from "@/lib/fetcher"
import { formatPrice, formatDate } from "@/lib/utils"
import { toast } from "react-hot-toast"

interface CustomerDetail {
  id: string
  name: string
  email: string
  phone?: string
  createdAt: string
  address?: {
    address: string
    city: string
    postalCode: string
    province: string
    country: string
  }
  isCompany: boolean
  companyName?: string
  taxId?: string
  lastOrderDate?: string
  totalOrders: number
  totalSpent: number
  averageOrderValue: number
  status: 'active' | 'inactive' | 'vip' | 'blocked'
  loyaltyPoints?: number
  preferredPaymentMethod?: string
  tags: string[]
  notes?: string
  source: 'web' | 'referral' | 'social' | 'direct' | 'advertising'
  orders: Array<{
    id: string
    orderNumber: string
    totalAmount: number
    status: string
    createdAt: string
    orderItems: Array<{
      id: string
      quantity: number
      unitPrice: number
      product: {
        name: string
        images: string
      }
    }>
  }>
  communications: Array<{
    id: string
    type: 'email' | 'call' | 'note'
    subject: string
    content: string
    createdAt: string
    createdBy: string
  }>
  monthsAsCustomer: number
  rfmSegment: string
}

export default function CustomerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const customerId = params.id as string
  
  const [newNote, setNewNote] = useState('')
  const [newTag, setNewTag] = useState('')
  const [activeTab, setActiveTab] = useState<'orders' | 'communications' | 'analytics'>('orders')
  const [isAddingNote, setIsAddingNote] = useState(false)

  const { data: customer, error, mutate } = useSWR<CustomerDetail>(
    `/api/customers/${customerId}`,
    fetcher
  )

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Activo', variant: 'default' as const, icon: <UserCheck className="w-3 h-3" /> },
      inactive: { label: 'Inactivo', variant: 'secondary' as const, icon: <UserX className="w-3 h-3" /> },
      vip: { label: 'VIP', variant: 'default' as const, icon: <Award className="w-3 h-3" /> },
      blocked: { label: 'Bloqueado', variant: 'destructive' as const, icon: <AlertCircle className="w-3 h-3" /> }
    }
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'secondary' as const, icon: null }
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {config.label}
      </Badge>
    )
  }

  const getSegmentBadge = (segment: string) => {
    const segmentConfig = {
      new: { label: 'Nuevo', color: 'bg-blue-100 text-blue-800' },
      regular: { label: 'Regular', color: 'bg-green-100 text-green-800' },
      loyal: { label: 'Leal', color: 'bg-purple-100 text-purple-800' },
      champion: { label: 'Champion', color: 'bg-yellow-100 text-yellow-800' },
      at_risk: { label: 'En riesgo', color: 'bg-orange-100 text-orange-800' },
      churned: { label: 'Perdido', color: 'bg-red-100 text-red-800' }
    }
    const config = segmentConfig[segment as keyof typeof segmentConfig] || { label: segment, color: 'bg-gray-100 text-gray-800' }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800"
      case "IN_PRODUCTION":
        return "bg-purple-100 text-purple-800"
      case "READY_FOR_PICKUP":
        return "bg-indigo-100 text-indigo-800"
      case "SHIPPED":
        return "bg-orange-100 text-orange-800"
      case "DELIVERED":
        return "bg-green-100 text-green-800"
      case "CANCELLED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getOrderStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      "PENDING": "Pendiente",
      "CONFIRMED": "Confirmado",
      "IN_PRODUCTION": "En Producción",
      "READY_FOR_PICKUP": "Listo para Recoger",
      "SHIPPED": "Enviado",
      "DELIVERED": "Entregado",
      "CANCELLED": "Cancelado"
    }
    return statusMap[status] || status
  }

  const getProductImages = (imagesString: string) => {
    try {
      const images = JSON.parse(imagesString)
      return Array.isArray(images) ? images : []
    } catch {
      return []
    }
  }

  const handleAddNote = async () => {
    if (!newNote.trim()) return

    try {
      const response = await fetch(`/api/customers/${customerId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newNote })
      })

      if (!response.ok) throw new Error('Error al añadir nota')

      mutate()
      setNewNote('')
      setIsAddingNote(false)
      toast.success('Nota añadida correctamente')
    } catch (error) {
      toast.error('Error al añadir la nota')
    }
  }

  const handleAddTag = async () => {
    if (!newTag.trim()) return

    try {
      const response = await fetch(`/api/customers/${customerId}/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag: newTag })
      })

      if (!response.ok) throw new Error('Error al añadir etiqueta')

      mutate()
      setNewTag('')
      toast.success('Etiqueta añadida correctamente')
    } catch (error) {
      toast.error('Error al añadir la etiqueta')
    }
  }

  const handleSendEmail = async () => {
    try {
      const response = await fetch(`/api/customers/${customerId}/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'manual' })
      })

      if (!response.ok) throw new Error('Error al enviar email')

      toast.success('Email enviado correctamente')
    } catch (error) {
      toast.error('Error al enviar el email')
    }
  }

  const handleDeleteCustomer = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar este cliente? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Error al eliminar cliente')

      toast.success('Cliente eliminado correctamente')
      router.push('/admin/customers')
    } catch (error) {
      toast.error('Error al eliminar el cliente')
    }
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar el cliente</h2>
          <p className="text-gray-600 mb-4">No se pudo encontrar el cliente solicitado</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando cliente...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xl">
                {customer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{customer.name}</h1>
              {customer.isCompany && customer.companyName && (
                <p className="text-gray-600">{customer.companyName}</p>
              )}
              <div className="flex items-center gap-2 mt-1">
                {getStatusBadge(customer.status)}
                {getSegmentBadge(customer.rfmSegment)}
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSendEmail}>
            <Mail className="h-4 w-4 mr-2" />
            Enviar Email
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/admin/customers/${customer.id}/edit`}>
              <Edit2 className="h-4 w-4 mr-2" />
              Editar
            </Link>
          </Button>
          <Button variant="outline" onClick={handleDeleteCustomer} className="text-red-600 hover:text-red-700">
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Gastado</p>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(customer.totalSpent)}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <Euro className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pedidos</p>
                <p className="text-2xl font-bold text-gray-900">{customer.totalOrders}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ticket Promedio</p>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(customer.averageOrderValue)}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cliente Desde</p>
                <p className="text-2xl font-bold text-gray-900">{customer.monthsAsCustomer}m</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Puntos Lealtad</p>
                <p className="text-2xl font-bold text-gray-900">{customer.loyaltyPoints || 0}</p>
              </div>
              <div className="p-3 bg-indigo-50 rounded-lg">
                <Star className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Último Pedido</p>
                <p className="text-lg font-bold text-gray-900">
                  {customer.lastOrderDate ? 
                    `${Math.floor((new Date().getTime() - new Date(customer.lastOrderDate).getTime()) / (1000 * 3600 * 24))}d` 
                    : 'Nunca'
                  }
                </p>
              </div>
              <div className="p-3 bg-pink-50 rounded-lg">
                <Clock className="h-6 w-6 text-pink-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Information Sidebar */}
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información Básica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{customer.email}</p>
                  </div>
                </div>
                
                {customer.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Teléfono</p>
                      <p className="font-medium">{customer.phone}</p>
                    </div>
                  </div>
                )}

                {customer.isCompany && (
                  <div className="flex items-center gap-3">
                    <Building className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">CIF/NIF</p>
                      <p className="font-medium">{customer.taxId || 'No especificado'}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Registrado</p>
                    <p className="font-medium">{formatDate(new Date(customer.createdAt))}</p>
                  </div>
                </div>

                {customer.preferredPaymentMethod && (
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Método de pago preferido</p>
                      <p className="font-medium">{customer.preferredPaymentMethod}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Address */}
          {customer.address && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Dirección
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="font-medium">{customer.address.address}</p>
                  <p className="text-sm text-gray-600">
                    {customer.address.postalCode} {customer.address.city}
                  </p>
                  <p className="text-sm text-gray-600">
                    {customer.address.province}, {customer.address.country}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Etiquetas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {customer.tags?.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  )) || null}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Nueva etiqueta..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  />
                  <Button size="sm" onClick={handleAddTag}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Notas
                </div>
                <Button size="sm" variant="outline" onClick={() => setIsAddingNote(!isAddingNote)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {customer.notes && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm">{customer.notes}</p>
                  </div>
                )}
                
                {isAddingNote && (
                  <div className="space-y-2">
                    <textarea
                      placeholder="Añadir nota..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleAddNote}>
                        Guardar
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setIsAddingNote(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'orders'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Package className="w-4 h-4 inline-block mr-2" />
                Pedidos ({customer.orders.length})
              </button>
              <button
                onClick={() => setActiveTab('communications')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'communications'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <MessageSquare className="w-4 h-4 inline-block mr-2" />
                Comunicaciones ({customer.communications?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'analytics'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <BarChart3 className="w-4 h-4 inline-block mr-2" />
                Análisis
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'orders' && (
            <Card>
              <CardHeader>
                <CardTitle>Historial de Pedidos</CardTitle>
              </CardHeader>
              <CardContent>
                {customer.orders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay pedidos</h3>
                    <p className="text-gray-500">Este cliente no ha realizado pedidos aún</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {customer.orders.map((order) => (
                      <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">Pedido #{order.orderNumber}</h4>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                                {getOrderStatusText(order.status)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {formatDate(new Date(order.createdAt))}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">{formatPrice(order.totalAmount)}</p>
                            <Link href={`/admin/orders/${order.id}`}>
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4 mr-1" />
                                Ver pedido
                              </Button>
                            </Link>
                          </div>
                        </div>
                        
                        {/* Order Items */}
                        <div className="border-t border-gray-100 pt-3">
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Productos ({order.orderItems.length}):
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {order.orderItems.map((item) => {
                              const images = getProductImages(item.product.images)
                              return (
                                <div key={item.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                                  <div className="w-10 h-10 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                                    {images.length > 0 ? (
                                      <img 
                                        src={images[0]} 
                                        alt={item.product.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <Package className="h-4 w-4 text-gray-400" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {item.product.name}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                      {item.quantity}x {formatPrice(item.unitPrice)}
                                    </p>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'communications' && (
            <Card>
              <CardHeader>
                <CardTitle>Historial de Comunicaciones</CardTitle>
              </CardHeader>
              <CardContent>
                {!customer.communications || customer.communications.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay comunicaciones</h3>
                    <p className="text-gray-500">Las comunicaciones con este cliente aparecerán aquí</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {customer.communications.map((comm) => (
                      <div key={comm.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            {comm.type === 'email' && <Mail className="w-4 h-4" />}
                            {comm.type === 'call' && <Phone className="w-4 h-4" />}
                            {comm.type === 'note' && <FileText className="w-4 h-4" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium">{comm.subject}</h4>
                              <span className="text-xs text-gray-500">
                                {formatDate(new Date(comm.createdAt))}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{comm.content}</p>
                            <p className="text-xs text-gray-500">Por: {comm.createdBy}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'analytics' && (
            <Card>
              <CardHeader>
                <CardTitle>Análisis del Cliente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Métricas de Comportamiento</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Frecuencia de Compra</span>
                        <span className="text-sm font-medium">
                          {customer.totalOrders > 0 ? 
                            `${(customer.monthsAsCustomer / customer.totalOrders).toFixed(1)} meses entre pedidos` :
                            'N/A'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Segmento RFM</span>
                        <span className="text-sm font-medium">{customer.rfmSegment}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Fuente de Adquisición</span>
                        <span className="text-sm font-medium">{customer.source}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Valor del Cliente</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Valor de Vida</span>
                        <span className="text-sm font-medium">{formatPrice(customer.totalSpent)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Valor Mensual Promedio</span>
                        <span className="text-sm font-medium">
                          {customer.monthsAsCustomer > 0 ? 
                            formatPrice(customer.totalSpent / customer.monthsAsCustomer) :
                            formatPrice(0)
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Puntos de Lealtad</span>
                        <span className="text-sm font-medium">{customer.loyaltyPoints || 0} puntos</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}