import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-hot-toast'

interface StockReservation {
  id: string
  quantity: number
  expiresAt: Date
  remainingMinutes: number
}

interface StockInfo {
  variantId: string
  totalStock: number
  availableStock: number
  reservedByOthers: number
  reservedByMe: number
  myReservations: StockReservation[]
}

interface UseStockReservationReturn {
  stockInfo: StockInfo | null
  isLoading: boolean
  error: string | null
  reserveStock: (variantId: string, quantity: number) => Promise<boolean>
  releaseStock: (variantId?: string) => Promise<void>
  checkStock: (variantId: string) => Promise<void>
  getSessionId: () => string
}

export function useStockReservation(): UseStockReservationReturn {
  const [stockInfo, setStockInfo] = useState<StockInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Generar o recuperar session ID del localStorage
  const getSessionId = useCallback(() => {
    if (typeof window === 'undefined') return 'server-session'
    
    let sessionId = localStorage.getItem('checkout-session-id')
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('checkout-session-id', sessionId)
    }
    return sessionId
  }, [])

  // Función para reservar stock
  const reserveStock = useCallback(async (variantId: string, quantity: number): Promise<boolean> => {
    if (quantity <= 0) return false

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/stock/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: getSessionId(),
          variantId,
          quantity
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Error al reservar stock')
        
        if (response.status === 400 && data.availableStock !== undefined) {
          toast.error(`Solo quedan ${data.availableStock} unidades disponibles`)
        } else {
          toast.error(data.error || 'Error al reservar stock')
        }
        return false
      }

      toast.success(`Stock reservado por ${data.reservation.remainingMinutes} minutos`)
      
      // Actualizar información de stock después de la reserva
      await checkStock(variantId)
      
      return true
    } catch (error) {
      const errorMessage = 'Error de conexión al reservar stock'
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [getSessionId])

  // Función para liberar stock
  const releaseStock = useCallback(async (variantId?: string): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/stock/reserve', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: getSessionId(),
          variantId
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al liberar stock')
      }

      if (data.releasedReservations > 0) {
        toast.success('Stock liberado correctamente')
      }

      // Si se especificó una variante, actualizar su información
      if (variantId) {
        await checkStock(variantId)
      } else {
        setStockInfo(null)
      }

    } catch (error) {
      const errorMessage = 'Error al liberar stock'
      setError(errorMessage)
      console.error('Error releasing stock:', error)
    } finally {
      setIsLoading(false)
    }
  }, [getSessionId])

  // Función para consultar stock disponible
  const checkStock = useCallback(async (variantId: string): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        variantId,
        sessionId: getSessionId()
      })

      const response = await fetch(`/api/stock/available?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al consultar stock')
      }

      setStockInfo(data)
    } catch (error) {
      const errorMessage = 'Error al consultar stock disponible'
      setError(errorMessage)
      console.error('Error checking stock:', error)
    } finally {
      setIsLoading(false)
    }
  }, [getSessionId])

  // Limpiar reservas al cerrar la ventana/pestaña
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Intentar liberar stock (no await porque es síncrono)
      fetch('/api/stock/reserve', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: getSessionId()
        }),
        keepalive: true // Asegurar que la petición se complete
      }).catch(console.error)
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [getSessionId])

  return {
    stockInfo,
    isLoading,
    error,
    reserveStock,
    releaseStock,
    checkStock,
    getSessionId
  }
}