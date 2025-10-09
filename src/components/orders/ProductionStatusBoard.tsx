'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Package, 
  Clock, 
  Play, 
  CheckCircle, 
  Pause,
  AlertTriangle,
  User,
  Calendar,
  MessageSquare,
  Filter,
  Search,
  RefreshCw,
  Eye,
  Edit3
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface ProductionItem {
  id: string
  orderId: string
  orderNumber: string
  quantity: number
  unitPrice: number
  totalPrice: number
  productionStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD'
  productionNotes?: string
  estimatedCompletionDate?: string
  actualCompletionDate?: string
  assignedTo?: {
    id: string
    name: string
  }
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
  customer: {
    name: string
    email: string
  }
  createdAt: string
  updatedAt: string
}

interface ProductionStatusBoardProps {
  className?: string
}

export default function ProductionStatusBoard({ className = '' }: ProductionStatusBoardProps) {
  const [items, setItems] = useState<ProductionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedItem, setSelectedItem] = useState<ProductionItem | null>(null)
  const [showStatusModal, setShowStatusModal] = useState(false)

  const statusConfig = {
    PENDING: { 
      label: 'Pendiente', 
      color: 'bg-gray-100 text-gray-800 border-gray-200', 
      icon: Clock,
      description: 'Esperando para ser iniciado'
    },
    IN_PROGRESS: { 
      label: 'En Progreso', 
      color: 'bg-blue-100 text-blue-800 border-blue-200', 
      icon: Play,
      description: 'Actualmente en producción'
    },
    COMPLETED: { 
      label: 'Completado', 
      color: 'bg-green-100 text-green-800 border-green-200', 
      icon: CheckCircle,
      description: 'Producción terminada'
    },
    ON_HOLD: { 
      label: 'En Espera', 
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
      icon: Pause,
      description: 'Pausado temporalmente'
    }
  }

  const fetchProductionItems = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter })
      })

      const response = await fetch(`/api/production/items?${params}`)
      if (!response.ok) throw new Error('Error al cargar items de producción')
      
      const data = await response.json()
      setItems(data.items || [])
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al cargar los items de producción')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProductionItems()
  }, [searchTerm, statusFilter])

  const handleStatusChange = async (itemId: string, newStatus: string, notes?: string) => {
    try {
      const response = await fetch(`/api/production/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          productionStatus: newStatus,
          productionNotes: notes,
          ...(newStatus === 'COMPLETED' && { actualCompletionDate: new Date().toISOString() })
        })
      })

      if (!response.ok) throw new Error('Error al actualizar estado')

      toast.success('Estado de producción actualizado')
      fetchProductionItems()
    } catch (error) {
      toast.error('Error al actualizar el estado')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getPriorityLevel = (item: ProductionItem) => {
    const orderDate = new Date(item.createdAt)
    const daysSinceOrder = Math.floor((Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysSinceOrder > 7) return { level: 'high', label: 'Alta', color: 'text-red-600' }
    if (daysSinceOrder > 3) return { level: 'medium', label: 'Media', color: 'text-yellow-600' }
    return { level: 'low', label: 'Baja', color: 'text-green-600' }
  }

  const groupedItems = {
    PENDING: items.filter(item => item.productionStatus === 'PENDING'),
    IN_PROGRESS: items.filter(item => item.productionStatus === 'IN_PROGRESS'),
    ON_HOLD: items.filter(item => item.productionStatus === 'ON_HOLD'),
    COMPLETED: items.filter(item => item.productionStatus === 'COMPLETED')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🏭 Tablero de Producción</h2>
          <p className="text-gray-600">Gestión de estados de producción por item</p>
        </div>
        <Button 
          onClick={fetchProductionItems} 
          variant="outline" 
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por producto, pedido o cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
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

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(groupedItems).map(([status, statusItems]) => {
          const config = statusConfig[status as keyof typeof statusConfig]
          return (
            <Card key={status} className="p-4">
              <div className="flex items-center gap-3">
                <config.icon className="w-6 h-6 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">{config.label}</p>
                  <p className="text-xl font-bold text-gray-900">{statusItems.length}</p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {Object.entries(groupedItems).map(([status, statusItems]) => {
          const config = statusConfig[status as keyof typeof statusConfig]
          
          return (
            <div key={status} className="space-y-4">
              {/* Column Header */}
              <div className={`p-3 rounded-lg border-2 ${config.color}`}>
                <div className="flex items-center gap-2">
                  <config.icon className="w-5 h-5" />
                  <h3 className="font-medium">{config.label}</h3>
                  <span className="text-sm">({statusItems.length})</span>
                </div>
                <p className="text-xs mt-1 opacity-75">{config.description}</p>
              </div>

              {/* Items */}
              <div className="space-y-3 min-h-[200px]">
                {statusItems.map((item) => {
                  const productImages = JSON.parse(item.product.images || '[]')
                  const firstImage = productImages[0]
                  const priority = getPriorityLevel(item)
                  
                  return (
                    <Card key={item.id} className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
                      <div className="space-y-3">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {firstImage ? (
                              <img
                                className="h-8 w-8 rounded object-cover"
                                src={firstImage}
                                alt={item.product.name}
                              />
                            ) : (
                              <div className="h-8 w-8 rounded bg-gray-200 flex items-center justify-center">
                                📦
                              </div>
                            )}
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
                                {item.product.name}
                              </h4>
                              <p className="text-xs text-gray-500">
                                Pedido #{item.orderNumber}
                              </p>
                            </div>
                          </div>
                          <span className={`text-xs font-medium ${priority.color}`}>
                            {priority.label}
                          </span>
                        </div>

                        {/* Variant Info */}
                        {item.variant && (
                          <div className="text-xs text-gray-600">
                            <span className="font-mono">{item.variant.sku}</span>
                            {item.variant.size && <span> • {item.variant.size}</span>}
                            {item.variant.color && <span> • {item.variant.color}</span>}
                          </div>
                        )}

                        {/* Design */}
                        {item.design && (
                          <div className="flex items-center gap-2 text-xs text-blue-600">
                            🎨 {item.design.name}
                          </div>
                        )}

                        {/* Customer */}
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <User className="w-3 h-3" />
                          {item.customer.name}
                        </div>

                        {/* Quantity and Price */}
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">
                            Cant: {item.quantity}
                          </span>
                          <span className="font-medium text-gray-900">
                            €{item.totalPrice.toFixed(2)}
                          </span>
                        </div>

                        {/* Production Notes */}
                        {item.productionNotes && (
                          <div className="text-xs bg-yellow-50 p-2 rounded">
                            <MessageSquare className="w-3 h-3 inline mr-1" />
                            {item.productionNotes}
                          </div>
                        )}

                        {/* Assigned To */}
                        {item.assignedTo && (
                          <div className="text-xs text-purple-600">
                            👤 Asignado a: {item.assignedTo.name}
                          </div>
                        )}

                        {/* Dates */}
                        <div className="text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Creado: {formatDate(item.createdAt)}
                          </div>
                          {item.estimatedCompletionDate && (
                            <div className="mt-1">
                              Est. finalización: {formatDate(item.estimatedCompletionDate)}
                            </div>
                          )}
                          {item.actualCompletionDate && (
                            <div className="mt-1 text-green-600">
                              Completado: {formatDate(item.actualCompletionDate)}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedItem(item)
                              setShowStatusModal(true)
                            }}
                            className="flex-1 text-xs h-7"
                          >
                            <Edit3 className="w-3 h-3 mr-1" />
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`/admin/orders/${item.orderId}`, '_blank')}
                            className="text-xs h-7"
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                        </div>

                        {/* Quick Status Actions */}
                        {status !== 'COMPLETED' && (
                          <div className="flex gap-1">
                            {status === 'PENDING' && (
                              <Button
                                size="sm"
                                onClick={() => handleStatusChange(item.id, 'IN_PROGRESS')}
                                className="flex-1 text-xs h-6 bg-blue-600 hover:bg-blue-700"
                              >
                                Iniciar
                              </Button>
                            )}
                            {status === 'IN_PROGRESS' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleStatusChange(item.id, 'COMPLETED')}
                                  className="flex-1 text-xs h-6 bg-green-600 hover:bg-green-700"
                                >
                                  Completar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStatusChange(item.id, 'ON_HOLD')}
                                  className="text-xs h-6"
                                >
                                  Pausar
                                </Button>
                              </>
                            )}
                            {status === 'ON_HOLD' && (
                              <Button
                                size="sm"
                                onClick={() => handleStatusChange(item.id, 'IN_PROGRESS')}
                                className="flex-1 text-xs h-6 bg-blue-600 hover:bg-blue-700"
                              >
                                Reanudar
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </Card>
                  )
                })}
                
                {statusItems.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <config.icon className="mx-auto h-8 w-8 mb-2" />
                    <p className="text-sm">No hay items en {config.label.toLowerCase()}</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Status Change Modal - Placeholder */}
      {showStatusModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">
              Editar Estado de Producción
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {selectedItem.product.name} - Pedido #{selectedItem.orderNumber}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowStatusModal(false)
                  setSelectedItem(null)
                }}
              >
                Cancelar
              </Button>
              <Button onClick={() => setShowStatusModal(false)}>
                Guardar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}