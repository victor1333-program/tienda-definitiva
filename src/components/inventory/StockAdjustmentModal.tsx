'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Package, AlertTriangle } from 'lucide-react'
import { toast } from 'react-hot-toast'

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

interface StockAdjustmentModalProps {
  variant: ProductVariant | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function StockAdjustmentModal({
  variant,
  isOpen,
  onClose,
  onSuccess
}: StockAdjustmentModalProps) {
  const [newStock, setNewStock] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen || !variant) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newStock || isNaN(Number(newStock))) {
      toast.error('Ingresa una cantidad válida')
      return
    }

    try {
      setLoading(true)
      
      // Actualizar stock de la variante
      const updateResponse = await fetch(`/api/product-variants/${variant.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stock: Number(newStock)
        })
      })

      if (!updateResponse.ok) throw new Error('Error al actualizar stock')

      // Crear movimiento de inventario si hay diferencia
      const difference = Number(newStock) - variant.stock
      if (difference !== 0) {
        await fetch('/api/inventory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            variantId: variant.id,
            type: 'ADJUSTMENT',
            quantity: Number(newStock),
            reason: reason || `Ajuste manual de stock`
          })
        })
      }

      toast.success('Stock actualizado correctamente')
      onSuccess()
      onClose()
      setNewStock('')
      setReason('')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al actualizar el stock')
    } finally {
      setLoading(false)
    }
  }

  const difference = newStock ? Number(newStock) - variant.stock : 0

  return (
    <div className="fixed inset-0 bg-black/35 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white rounded-lg max-w-md w-full p-6 ml-64 mr-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary-500" />
            <h2 className="text-lg font-semibold">Ajustar Stock</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Product Info */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900">{variant.product.name}</h3>
          <p className="text-sm text-gray-600">
            SKU: {variant.sku} • {[variant.size, variant.color, variant.material].filter(Boolean).join(' • ')}
          </p>
          <p className="text-sm font-medium mt-1">
            Stock actual: <span className="text-lg">{variant.stock}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* New Stock Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nuevo stock
            </label>
            <Input
              type="number"
              min="0"
              value={newStock}
              onChange={(e) => setNewStock(e.target.value)}
              placeholder="Ingresa la nueva cantidad"
              required
              autoFocus
            />
            {newStock && (
              <div className={`mt-1 text-sm flex items-center gap-1 ${
                difference > 0 ? 'text-green-600' : difference < 0 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {difference > 0 && '📈 '}
                {difference < 0 && '📉 '}
                {difference === 0 && '📊 '}
                {difference > 0 ? `Incremento de ${difference}` : 
                 difference < 0 ? `Reducción de ${Math.abs(difference)}` :
                 'Sin cambios'}
              </div>
            )}
          </div>

          {/* Reason Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Motivo (opcional)
            </label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej: Inventario físico, devolución, pérdida..."
            />
          </div>

          {/* Warning for low stock */}
          {newStock && Number(newStock) <= 5 && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                ⚠️ El stock quedará bajo (≤5 unidades)
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !newStock}
              className="flex-1"
            >
              {loading ? 'Actualizando...' : 'Actualizar Stock'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}