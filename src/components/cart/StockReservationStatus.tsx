'use client'

import { useState, useEffect, memo, useCallback, useMemo } from 'react'
import { useCartStore, CartItem } from '@/lib/store'
import { useStockReservation } from '@/hooks/useStockReservation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Clock, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface StockReservationStatusProps {
  item: CartItem
  compact?: boolean
}

export const StockReservationStatus = memo(function StockReservationStatus({ item, compact = false }: StockReservationStatusProps) {
  const { markItemReserved, markItemUnreserved, removeItem } = useCartStore()
  const { reserveStock, releaseStock, checkStock, stockInfo, isLoading } = useStockReservation()
  const [timeRemaining, setTimeRemaining] = useState<string>('')

  // Actualizar contador de tiempo restante
  useEffect(() => {
    if (!item.stockReserved || !item.reservationExpires) return

    const updateTimeRemaining = () => {
      const now = new Date()
      const expires = new Date(item.reservationExpires!)
      const diff = expires.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeRemaining('Expirado')
        markItemUnreserved(item.id)
        toast.error(`Reserva expirada para ${item.name}`)
      } else {
        const minutes = Math.floor(diff / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)
        setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`)
      }
    }

    updateTimeRemaining()
    const interval = setInterval(updateTimeRemaining, 1000)

    return () => clearInterval(interval)
  }, [item.stockReserved, item.reservationExpires, item.id, item.name, markItemUnreserved])

  // Verificar stock al montar el componente
  useEffect(() => {
    if (item.variantId) {
      checkStock(item.variantId)
    }
  }, [item.variantId, checkStock])

  const handleReserveStock = async () => {
    if (!item.variantId) {
      toast.error('No se puede reservar: variante no especificada')
      return
    }

    const success = await reserveStock(item.variantId, item.quantity)
    if (success) {
      const expiresAt = new Date(Date.now() + 45 * 60 * 1000) // 45 minutos
      markItemReserved(item.id, expiresAt)
    }
  }

  const handleReleaseStock = async () => {
    if (!item.variantId) return

    await releaseStock(item.variantId)
    markItemUnreserved(item.id)
  }

  // Verificar si hay stock suficiente
  const hasInsufficientStock = stockInfo && stockInfo.availableStock < item.quantity
  const isExpired = item.stockReserved && item.reservationExpires && new Date(item.reservationExpires) < new Date()

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs">
        {item.stockReserved && !isExpired ? (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <Shield className="w-3 h-3 mr-1" />
            Reservado {timeRemaining}
          </Badge>
        ) : hasInsufficientStock ? (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Stock insuficiente
          </Badge>
        ) : (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            <Clock className="w-3 h-3 mr-1" />
            Sin reservar
          </Badge>
        )}
      </div>
    )
  }

  return (
    <div className="border rounded-lg p-3 bg-gray-50">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-sm">Estado de Reserva</h4>
        {stockInfo && (
          <span className="text-xs text-gray-600">
            Stock disponible: {stockInfo.availableStock}
          </span>
        )}
      </div>

      {/* Estado actual */}
      <div className="mb-3">
        {item.stockReserved && !isExpired ? (
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">Reservado por {timeRemaining}</span>
          </div>
        ) : isExpired ? (
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">Reserva expirada</span>
          </div>
        ) : hasInsufficientStock ? (
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">Stock insuficiente ({stockInfo?.availableStock} disponibles)</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-amber-700">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Stock no reservado</span>
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="flex gap-2">
        {item.stockReserved && !isExpired ? (
          <Button
            size="sm"
            variant="outline"
            onClick={handleReleaseStock}
            disabled={isLoading}
            className="text-xs"
          >
            {isLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'Liberar'}
          </Button>
        ) : hasInsufficientStock ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => removeItem(item.id)}
            className="text-xs text-red-600 border-red-200"
          >
            Eliminar del carrito
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={handleReserveStock}
            disabled={isLoading}
            className="text-xs"
          >
            {isLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'Reservar Stock'}
          </Button>
        )}

        <Button
          size="sm"
          variant="outline"
          onClick={() => item.variantId && checkStock(item.variantId)}
          disabled={isLoading}
          className="text-xs"
        >
          <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Información adicional */}
      {stockInfo && (
        <div className="mt-2 text-xs text-gray-600">
          <div>Total en stock: {stockInfo.totalStock}</div>
          <div>Reservado por otros: {stockInfo.reservedByOthers}</div>
          {stockInfo.reservedByMe > 0 && (
            <div>Reservado por ti: {stockInfo.reservedByMe}</div>
          )}
        </div>
      )}
    </div>
  )
})