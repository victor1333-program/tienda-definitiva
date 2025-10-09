'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, History, TrendingUp, TrendingDown, RotateCcw, Package } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface InventoryMovement {
  id: string
  type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'RETURN'
  quantity: number
  reason?: string
  createdAt: string
  userId?: string
}

interface ProductVariant {
  id: string
  sku: string
  size?: string
  color?: string
  material?: string
  stock: number
  product: {
    name: string
  }
}

interface InventoryHistoryModalProps {
  variant: ProductVariant | null
  isOpen: boolean
  onClose: () => void
}

export default function InventoryHistoryModal({
  variant,
  isOpen,
  onClose
}: InventoryHistoryModalProps) {
  const [movements, setMovements] = useState<InventoryMovement[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && variant) {
      fetchMovements()
    }
  }, [isOpen, variant])

  const fetchMovements = async () => {
    if (!variant) return
    
    try {
      setLoading(true)
      const response = await fetch(`/api/inventory?variantId=${variant.id}&limit=50`, {
        credentials: 'include'
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }))
        console.error('API Error:', response.status, errorData)
        throw new Error(`Error ${response.status}: ${errorData.error || 'Error al cargar historial'}`)
      }
      
      const data = await response.json()
      setMovements(data.movements || [])
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al cargar el historial')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !variant) return null

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'IN': return { icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100', label: 'Entrada' }
      case 'OUT': return { icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-100', label: 'Salida' }
      case 'ADJUSTMENT': return { icon: RotateCcw, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Ajuste' }
      case 'RETURN': return { icon: Package, color: 'text-purple-600', bg: 'bg-purple-100', label: 'Devolución' }
      default: return { icon: Package, color: 'text-gray-600', bg: 'bg-gray-100', label: 'Movimiento' }
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="fixed inset-0 bg-black/35 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[70vh] flex flex-col ml-64">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary-500" />
            <h2 className="text-lg font-semibold">Historial de Movimientos</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Product Info */}
        <div className="p-6 border-b bg-gray-50">
          <h3 className="font-medium text-gray-900">{variant.product.name}</h3>
          <p className="text-sm text-gray-600">
            SKU: {variant.sku} • {[variant.size, variant.color, variant.material].filter(Boolean).join(' • ')}
          </p>
          <p className="text-sm font-medium mt-1">
            Stock actual: <span className="text-lg text-primary-600">{variant.stock}</span>
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
          ) : movements.length === 0 ? (
            <div className="text-center py-8">
              <History className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Sin movimientos</h3>
              <p className="mt-1 text-sm text-gray-500">
                No hay movimientos registrados para esta variante
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {movements.map((movement) => {
                const { icon: Icon, color, bg, label } = getMovementIcon(movement.type)
                
                return (
                  <div
                    key={movement.id}
                    className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className={`p-2 rounded-lg ${bg}`}>
                      <Icon className={`w-4 h-4 ${color}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${color}`}>
                            {label}
                          </span>
                          <span className="text-sm font-bold text-gray-900">
                            {movement.type === 'OUT' ? '-' : '+'}{movement.quantity}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDate(movement.createdAt)}
                        </span>
                      </div>
                      
                      {movement.reason && (
                        <p className="text-sm text-gray-600 mt-1">
                          {movement.reason}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Total de movimientos: {movements.length}</span>
            <Button variant="outline" size="sm" onClick={fetchMovements} disabled={loading}>
              Actualizar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}