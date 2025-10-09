'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  X, 
  Clock,
  User,
  Package,
  Truck,
  CheckCircle,
  AlertTriangle,
  Calendar,
  MessageSquare,
  Edit3,
  Plus,
  Save
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface TimelineEvent {
  id: string
  action: string
  description: string
  createdAt: string
  metadata?: any
  user?: {
    id: string
    name: string
    email: string
  }
}

interface OrderTimelineModalProps {
  orderId: string
  isOpen: boolean
  onClose: () => void
  onUpdate?: () => void
}

export default function OrderTimelineModal({ 
  orderId, 
  isOpen, 
  onClose, 
  onUpdate 
}: OrderTimelineModalProps) {
  const [timeline, setTimeline] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [addingEvent, setAddingEvent] = useState(false)
  const [newEvent, setNewEvent] = useState({
    action: '',
    description: ''
  })

  const actionTypes = [
    { value: 'ORDER_CREATED', label: 'Pedido creado', icon: Plus },
    { value: 'ORDER_CONFIRMED', label: 'Pedido confirmado', icon: CheckCircle },
    { value: 'PAYMENT_RECEIVED', label: 'Pago recibido', icon: CheckCircle },
    { value: 'PRODUCTION_STARTED', label: 'Producción iniciada', icon: Package },
    { value: 'PRODUCTION_COMPLETED', label: 'Producción completada', icon: CheckCircle },
    { value: 'ORDER_SHIPPED', label: 'Pedido enviado', icon: Truck },
    { value: 'ORDER_DELIVERED', label: 'Pedido entregado', icon: CheckCircle },
    { value: 'ORDER_CANCELLED', label: 'Pedido cancelado', icon: AlertTriangle },
    { value: 'NOTE_ADDED', label: 'Nota añadida', icon: MessageSquare },
    { value: 'STATUS_CHANGED', label: 'Estado modificado', icon: Edit3 },
    { value: 'CUSTOM', label: 'Evento personalizado', icon: Clock }
  ]

  const fetchTimeline = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/orders/${orderId}/timeline`)
      if (!response.ok) throw new Error('Error al cargar timeline')
      
      const data = await response.json()
      setTimeline(data.timeline || [])
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al cargar el historial')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && orderId) {
      fetchTimeline()
    }
  }, [isOpen, orderId])

  const handleAddEvent = async () => {
    if (!newEvent.action || !newEvent.description.trim()) {
      toast.error('Por favor completa todos los campos')
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/orders/${orderId}/timeline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: newEvent.action,
          description: newEvent.description
        })
      })

      if (!response.ok) throw new Error('Error al añadir evento')

      const updatedTimeline = await response.json()
      setTimeline(updatedTimeline.timeline || [])
      setNewEvent({ action: '', description: '' })
      setAddingEvent(false)
      toast.success('Evento añadido al historial')
      onUpdate?.()
    } catch (error) {
      toast.error('Error al añadir evento')
    } finally {
      setLoading(false)
    }
  }

  const getEventIcon = (action: string) => {
    const actionType = actionTypes.find(type => type.value === action)
    if (actionType) {
      const IconComponent = actionType.icon
      return <IconComponent className="w-4 h-4" />
    }
    return <Clock className="w-4 h-4" />
  }

  const getEventColor = (action: string) => {
    switch (action) {
      case 'ORDER_CREATED':
      case 'ORDER_CONFIRMED':
        return 'bg-blue-100 text-blue-600'
      case 'PAYMENT_RECEIVED':
      case 'PRODUCTION_COMPLETED':
      case 'ORDER_DELIVERED':
        return 'bg-green-100 text-green-600'
      case 'PRODUCTION_STARTED':
      case 'ORDER_SHIPPED':
        return 'bg-yellow-100 text-yellow-600'
      case 'ORDER_CANCELLED':
        return 'bg-red-100 text-red-600'
      case 'NOTE_ADDED':
      case 'STATUS_CHANGED':
        return 'bg-gray-100 text-gray-600'
      default:
        return 'bg-purple-100 text-purple-600'
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/35 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Historial del Pedido
            </h2>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAddingEvent(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Añadir Evento
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          {/* Add Event Form */}
          {addingEvent && (
            <Card className="p-4 mb-6 border-dashed border-2 border-gray-300">
              <h3 className="font-medium text-gray-900 mb-3">Añadir Nuevo Evento</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Evento
                  </label>
                  <select
                    value={newEvent.action}
                    onChange={(e) => setNewEvent({ ...newEvent, action: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="">Seleccionar tipo...</option>
                    {actionTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    rows={3}
                    placeholder="Describe lo que ha ocurrido..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleAddEvent}
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Guardar Evento
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setAddingEvent(false)
                      setNewEvent({ action: '', description: '' })
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Timeline */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
              <p className="text-gray-600 mt-2">Cargando historial...</p>
            </div>
          ) : timeline.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Sin eventos</h3>
              <p className="mt-1 text-sm text-gray-500">
                No hay eventos registrados para este pedido
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {timeline.map((event, index) => (
                <div key={event.id} className="flex gap-4">
                  {/* Timeline line */}
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getEventColor(event.action)}`}>
                      {getEventIcon(event.action)}
                    </div>
                    {index < timeline.length - 1 && (
                      <div className="w-0.5 h-8 bg-gray-200 mt-2"></div>
                    )}
                  </div>
                  
                  {/* Event content */}
                  <div className="flex-1 min-w-0 pb-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900">
                        {actionTypes.find(type => type.value === event.action)?.label || event.action}
                      </h4>
                      <time className="text-xs text-gray-500">
                        {formatDate(event.createdAt)}
                      </time>
                    </div>
                    
                    <p className="text-sm text-gray-600 mt-1">
                      {event.description}
                    </p>
                    
                    {event.user && (
                      <div className="flex items-center gap-1 mt-2">
                        <User className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          por {event.user.name}
                        </span>
                      </div>
                    )}
                    
                    {event.metadata && Object.keys(event.metadata).length > 0 && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                        <details className="cursor-pointer">
                          <summary className="font-medium text-gray-700">
                            Ver detalles
                          </summary>
                          <pre className="mt-1 text-gray-600 whitespace-pre-wrap">
                            {JSON.stringify(event.metadata, null, 2)}
                          </pre>
                        </details>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  )
}