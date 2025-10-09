'use client'

import { useState, useEffect } from 'react'
import { Package, Eye, CheckCircle, XCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface StockAllocation {
  id: string
  quantity: number
  status: 'ALLOCATED' | 'FULFILLED' | 'CANCELLED' | 'RETURNED'
  allocatedAt: string
  fulfilledAt?: string
  brandStock: {
    brand: string
    costPrice: number
    location?: string
  }
  orderItem: {
    order: {
      id: string
      orderNumber: string
      status: string
    }
  }
}

interface OrderItemAllocation {
  variantId: string
  orderItemId: string
  allocations: StockAllocation[]
  totalQuantity: number
  totalCost: number
}

interface StockAllocationViewerProps {
  variantId?: string
  orderItemId?: string
  className?: string
}

export default function StockAllocationViewer({ 
  variantId, 
  orderItemId, 
  className = "" 
}: StockAllocationViewerProps) {
  const [allocations, setAllocations] = useState<OrderItemAllocation[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'variant' | 'order'>('variant')

  useEffect(() => {
    if (variantId) {
      setViewMode('variant')
      fetchVariantAllocations()
    } else if (orderItemId) {
      setViewMode('order')
      fetchOrderItemAllocations()
    }
  }, [variantId, orderItemId])

  const fetchVariantAllocations = async () => {
    if (!variantId) return
    
    try {
      const response = await fetch(`/api/brand-stock/allocations?variantId=${variantId}`)
      if (response.ok) {
        const data = await response.json()
        setAllocations(data.allocations || [])
      }
    } catch (error) {
      console.error('Error fetching variant allocations:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchOrderItemAllocations = async () => {
    if (!orderItemId) return
    
    try {
      const response = await fetch(`/api/brand-stock/allocations?orderItemId=${orderItemId}`)
      if (response.ok) {
        const data = await response.json()
        setAllocations(data.allocations || [])
      }
    } catch (error) {
      console.error('Error fetching order item allocations:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ALLOCATED':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'FULFILLED':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'CANCELLED':
      case 'RETURNED':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Package className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      ALLOCATED: 'secondary',
      FULFILLED: 'default',
      CANCELLED: 'destructive',
      RETURNED: 'destructive'
    }

    const labels: Record<string, string> = {
      ALLOCATED: 'Asignado',
      FULFILLED: 'Enviado',
      CANCELLED: 'Cancelado',
      RETURNED: 'Devuelto'
    }

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {labels[status] || status}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!allocations.length) {
    return (
      <div className={`bg-white rounded-lg border p-6 ${className}`}>
        <div className="text-center py-8 text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p>No hay asignaciones de stock</p>
          <p className="text-sm">
            {viewMode === 'variant' 
              ? 'Esta variante no tiene stock asignado a pedidos'
              : 'Este item no tiene asignaciones de marca específicas'
            }
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg border p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          {viewMode === 'variant' ? 'Asignaciones de Stock' : 'Detalle de Asignación'}
        </h3>
        <Badge variant="outline">
          {allocations.length} {allocations.length === 1 ? 'asignación' : 'asignaciones'}
        </Badge>
      </div>

      <div className="space-y-4">
        {allocations.map((allocation) => (
          <div key={allocation.orderItemId} className="border rounded-lg p-4">
            {viewMode === 'variant' && (
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="font-medium">
                    Pedido #{allocation.allocations[0]?.orderItem.order.orderNumber}
                  </span>
                  <Badge variant="outline" className="ml-2">
                    {allocation.allocations[0]?.orderItem.order.status}
                  </Badge>
                </div>
                <div className="text-sm text-gray-500">
                  {allocation.totalQuantity} unidades • €{allocation.totalCost.toFixed(2)}
                </div>
              </div>
            )}

            <div className="space-y-2">
              {allocation.allocations.map((alloc) => (
                <div key={alloc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(alloc.status)}
                    <div>
                      <span className="font-medium">{alloc.brandStock.brand}</span>
                      <div className="text-sm text-gray-500">
                        {alloc.quantity} unidades • €{alloc.brandStock.costPrice.toFixed(2)} c/u
                        {alloc.brandStock.location && ` • ${alloc.brandStock.location}`}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="font-medium">
                        €{(alloc.quantity * alloc.brandStock.costPrice).toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(alloc.allocatedAt).toLocaleDateString()}
                      </div>
                    </div>
                    {getStatusBadge(alloc.status)}
                  </div>
                </div>
              ))}
            </div>

            {allocation.allocations.length > 1 && (
              <div className="mt-3 pt-3 border-t bg-gray-50 rounded p-2">
                <div className="flex justify-between text-sm">
                  <span>Total del pedido:</span>
                  <span className="font-medium">
                    {allocation.totalQuantity} unidades • €{allocation.totalCost.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {viewMode === 'variant' && (
        <div className="mt-6 pt-4 border-t">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Total asignado:</span>
            <span>
              {allocations.reduce((sum, alloc) => sum + alloc.totalQuantity, 0)} unidades
            </span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Valor total:</span>
            <span>
              €{allocations.reduce((sum, alloc) => sum + alloc.totalCost, 0).toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}