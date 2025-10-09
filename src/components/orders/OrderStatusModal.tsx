'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  X, 
  Clock,
  CheckCircle,
  AlertTriangle,
  Package,
  Truck,
  RefreshCw,
  ArrowRight,
  Info
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface OrderStatusModalProps {
  orderId: string
  currentStatus: string
  currentPaymentStatus: string
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
}

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'IN_PRODUCTION' | 'READY_FOR_PICKUP' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED'
type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED'

export default function OrderStatusModal({ 
  orderId, 
  currentStatus, 
  currentPaymentStatus,
  isOpen, 
  onClose, 
  onUpdate 
}: OrderStatusModalProps) {
  const [newStatus, setNewStatus] = useState<OrderStatus>(currentStatus as OrderStatus)
  const [newPaymentStatus, setNewPaymentStatus] = useState<PaymentStatus>(currentPaymentStatus as PaymentStatus)
  const [trackingNumber, setTrackingNumber] = useState('')
  const [notes, setNotes] = useState('')
  const [updating, setUpdating] = useState(false)

  const statusConfig = {
    PENDING: { 
      label: 'Pendiente', 
      color: 'bg-gray-100 text-gray-800', 
      icon: Clock,
      description: 'El pedido está pendiente de confirmación'
    },
    CONFIRMED: { 
      label: 'Confirmado', 
      color: 'bg-blue-100 text-blue-800', 
      icon: CheckCircle,
      description: 'El pedido ha sido confirmado y está listo para producción'
    },
    IN_PRODUCTION: { 
      label: 'En Producción', 
      color: 'bg-yellow-100 text-yellow-800', 
      icon: Package,
      description: 'Los productos están siendo fabricados'
    },
    READY_FOR_PICKUP: { 
      label: 'Listo para Recoger', 
      color: 'bg-purple-100 text-purple-800', 
      icon: Package,
      description: 'El pedido está listo para ser recogido o enviado'
    },
    SHIPPED: { 
      label: 'Enviado', 
      color: 'bg-indigo-100 text-indigo-800', 
      icon: Truck,
      description: 'El pedido ha sido enviado al cliente'
    },
    DELIVERED: { 
      label: 'Entregado', 
      color: 'bg-green-100 text-green-800', 
      icon: CheckCircle,
      description: 'El pedido ha sido entregado exitosamente'
    },
    CANCELLED: { 
      label: 'Cancelado', 
      color: 'bg-red-100 text-red-800', 
      icon: AlertTriangle,
      description: 'El pedido ha sido cancelado'
    },
    REFUNDED: { 
      label: 'Reembolsado', 
      color: 'bg-orange-100 text-orange-800', 
      icon: RefreshCw,
      description: 'El pedido ha sido reembolsado'
    }
  }

  const paymentStatusConfig = {
    PENDING: { label: 'Pendiente', color: 'text-gray-600', description: 'Pago pendiente' },
    PAID: { label: 'Pagado', color: 'text-green-600', description: 'Pago completado' },
    FAILED: { label: 'Fallido', color: 'text-red-600', description: 'Pago fallido' },
    REFUNDED: { label: 'Reembolsado', color: 'text-orange-600', description: 'Pago reembolsado' },
    PARTIALLY_REFUNDED: { label: 'Parcialmente Reembolsado', color: 'text-yellow-600', description: 'Reembolso parcial' }
  }

  // Definir transiciones válidas de estado
  const getValidTransitions = (current: OrderStatus): OrderStatus[] => {
    const transitions: Record<OrderStatus, OrderStatus[]> = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['IN_PRODUCTION', 'CANCELLED'],
      IN_PRODUCTION: ['READY_FOR_PICKUP', 'CANCELLED'],
      READY_FOR_PICKUP: ['SHIPPED', 'DELIVERED', 'CANCELLED'],
      SHIPPED: ['DELIVERED', 'CANCELLED'],
      DELIVERED: ['REFUNDED'],
      CANCELLED: ['CONFIRMED'], // Permitir reactivar
      REFUNDED: [] // Estado final
    }
    return transitions[current] || []
  }

  const isValidTransition = (from: OrderStatus, to: OrderStatus): boolean => {
    if (from === to) return true
    return getValidTransitions(from).includes(to)
  }

  const handleStatusUpdate = async () => {
    if (!isValidTransition(currentStatus as OrderStatus, newStatus)) {
      toast.error('Transición de estado no válida')
      return
    }

    if (newStatus === 'SHIPPED' && !trackingNumber.trim()) {
      toast.error('El número de seguimiento es requerido para marcar como enviado')
      return
    }

    try {
      setUpdating(true)
      
      const updateData: any = {
        status: newStatus,
        paymentStatus: newPaymentStatus,
        adminNotes: notes.trim() || undefined
      }

      if (newStatus === 'SHIPPED' && trackingNumber.trim()) {
        updateData.trackingNumber = trackingNumber.trim()
      }

      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })

      if (!response.ok) throw new Error('Error al actualizar el pedido')

      // Añadir evento al timeline
      await fetch(`/api/orders/${orderId}/timeline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'STATUS_CHANGED',
          description: `Estado cambiado de ${statusConfig[currentStatus as OrderStatus]?.label} a ${statusConfig[newStatus]?.label}${notes ? `. Notas: ${notes}` : ''}`
        })
      })

      toast.success('Estado del pedido actualizado correctamente')
      onUpdate()
      onClose()
    } catch (error) {
      toast.error('Error al actualizar el estado del pedido')
    } finally {
      setUpdating(false)
    }
  }

  if (!isOpen) return null

  const currentStatusInfo = statusConfig[currentStatus as OrderStatus]
  const newStatusInfo = statusConfig[newStatus]
  const validTransitions = getValidTransitions(currentStatus as OrderStatus)

  return (
    <div className="fixed inset-0 bg-black/35 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Cambiar Estado del Pedido
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Current Status */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Estado Actual</h3>
            <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${currentStatusInfo?.color}`}>
              {currentStatusInfo?.icon && <currentStatusInfo.icon className="w-4 h-4 mr-2" />}
              {currentStatusInfo?.label}
            </div>
            <p className="text-xs text-gray-500 mt-1">{currentStatusInfo?.description}</p>
          </div>

          {/* Status Transition Arrow */}
          {newStatus !== currentStatus && (
            <div className="flex items-center justify-center">
              <ArrowRight className="w-6 h-6 text-gray-400" />
            </div>
          )}

          {/* New Status Selection */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Nuevo Estado</h3>
            <div className="grid grid-cols-1 gap-2">
              {Object.entries(statusConfig).map(([status, config]) => {
                const isValid = status === currentStatus || isValidTransition(currentStatus as OrderStatus, status as OrderStatus)
                const isCurrent = status === currentStatus
                const isSelected = status === newStatus
                
                return (
                  <button
                    key={status}
                    onClick={() => !isCurrent && isValid && setNewStatus(status as OrderStatus)}
                    disabled={isCurrent || !isValid}
                    className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                      isSelected 
                        ? 'border-primary-500 bg-primary-50' 
                        : isValid && !isCurrent
                        ? 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${config.color}`}>
                      <config.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{config.label}</div>
                      <div className="text-xs text-gray-500">{config.description}</div>
                    </div>
                    {isCurrent && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        Actual
                      </span>
                    )}
                    {isSelected && status !== currentStatus && (
                      <CheckCircle className="w-5 h-5 text-primary-500" />
                    )}
                  </button>
                )
              })}
            </div>
            
            {validTransitions.length === 0 && (
              <div className="mt-2 p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-yellow-600 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    No hay transiciones válidas disponibles desde el estado actual.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Payment Status */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Estado del Pago</h3>
            <select
              value={newPaymentStatus}
              onChange={(e) => setNewPaymentStatus(e.target.value as PaymentStatus)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              {Object.entries(paymentStatusConfig).map(([status, config]) => (
                <option key={status} value={status}>
                  {config.label} - {config.description}
                </option>
              ))}
            </select>
          </div>

          {/* Tracking Number (solo si se está marcando como enviado) */}
          {newStatus === 'SHIPPED' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Seguimiento *
              </label>
              <Input
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Introduce el número de seguimiento"
                required
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              rows={3}
              placeholder="Añade una nota sobre este cambio de estado..."
            />
          </div>

          {/* Warning for critical changes */}
          {(newStatus === 'CANCELLED' || newStatus === 'REFUNDED') && newStatus !== currentStatus && (
            <div className="p-3 bg-red-50 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                <div className="text-sm text-red-800">
                  <strong>Atención:</strong> Este cambio de estado puede tener implicaciones importantes 
                  como la cancelación de la producción o el procesamiento de reembolsos.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleStatusUpdate}
            disabled={updating || (newStatus === 'SHIPPED' && !trackingNumber.trim())}
            className="flex items-center gap-2"
          >
            {updating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Actualizando...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Actualizar Estado
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}