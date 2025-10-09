'use client'

import { useState, useEffect, memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Shield, 
  Activity, 
  AlertTriangle, 
  CheckCircle,
  RefreshCw,
  Clock
} from 'lucide-react'

interface RateLimitStatus {
  endpoint: string
  displayName: string
  success: boolean
  limit: number
  remaining: number
  resetTime: string
  message?: string
  icon: React.ReactNode
  color: string
}

const RateLimitMonitor = memo(function RateLimitMonitor() {
  const [statuses, setStatuses] = useState<RateLimitStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const endpoints = [
    { 
      key: 'general', 
      name: 'API General', 
      icon: <Activity className="w-4 h-4" />,
      color: 'blue'
    },
    { 
      key: 'auth', 
      name: 'Autenticación', 
      icon: <Shield className="w-4 h-4" />,
      color: 'green'
    },
    { 
      key: 'create', 
      name: 'Creación', 
      icon: <CheckCircle className="w-4 h-4" />,
      color: 'purple'
    },
    { 
      key: 'upload', 
      name: 'Subida Archivos', 
      icon: <AlertTriangle className="w-4 h-4" />,
      color: 'orange'
    },
    { 
      key: 'admin', 
      name: 'Admin', 
      icon: <Shield className="w-4 h-4" />,
      color: 'red'
    }
  ]

  const fetchRateLimitStatus = async () => {
    setLoading(true)
    try {
      const results = await Promise.all(
        endpoints.map(async (endpoint) => {
          const response = await fetch(`/api/rate-limit-check?endpoint=${endpoint.key}`)
          const data = await response.json()
          
          return {
            endpoint: endpoint.key,
            displayName: endpoint.name,
            success: data.success,
            limit: data.limit,
            remaining: data.remaining,
            resetTime: data.resetTime,
            message: data.message,
            icon: endpoint.icon,
            color: endpoint.color
          }
        })
      )
      
      setStatuses(results)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error fetching rate limit status:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetRateLimits = async () => {
    try {
      const response = await fetch('/api/rate-limit-check', { method: 'POST' })
      const data = await response.json()
      
      if (data.success) {
        await fetchRateLimitStatus() // Actualizar estado
      }
    } catch (error) {
      console.error('Error resetting rate limits:', error)
    }
  }

  useEffect(() => {
    fetchRateLimitStatus()
    
    // Actualizar cada 30 segundos
    const interval = setInterval(fetchRateLimitStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusBadgeVariant = (remaining: number, limit: number) => {
    const percentage = remaining / limit
    if (percentage > 0.7) return 'default' // Verde
    if (percentage > 0.3) return 'secondary' // Amarillo  
    return 'destructive' // Rojo
  }

  const formatResetTime = (resetTime: string) => {
    const reset = new Date(resetTime)
    const now = new Date()
    const diffMs = reset.getTime() - now.getTime()
    const diffMins = Math.ceil(diffMs / (1000 * 60))
    
    if (diffMins <= 0) return 'Ya reseteado'
    if (diffMins < 60) return `${diffMins}min`
    return `${Math.floor(diffMins / 60)}h ${diffMins % 60}min`
  }

  if (loading && statuses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Monitor de Rate Limiting
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Monitor de Rate Limiting
        </CardTitle>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchRateLimitStatus}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          {process.env.NODE_ENV === 'development' && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetRateLimits}
            >
              Resetear (Dev)
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {statuses.map((status) => (
            <div
              key={status.endpoint}
              className="border rounded-lg p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {status.icon}
                  <span className="font-medium">{status.displayName}</span>
                </div>
                <Badge 
                  variant={getStatusBadgeVariant(status.remaining, status.limit)}
                >
                  {status.success ? 'OK' : 'Bloqueado'}
                </Badge>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Límite:</span>
                  <span className="font-mono">{status.limit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Restantes:</span>
                  <span className="font-mono">{status.remaining}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Resetea en:</span>
                  <span className="font-mono text-xs">
                    {formatResetTime(status.resetTime)}
                  </span>
                </div>
              </div>
              
              {/* Barra de progreso */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    status.remaining / status.limit > 0.7 
                      ? 'bg-green-500' 
                      : status.remaining / status.limit > 0.3 
                        ? 'bg-yellow-500' 
                        : 'bg-red-500'
                  }`}
                  style={{
                    width: `${Math.max(0, (status.remaining / status.limit) * 100)}%`
                  }}
                />
              </div>
              
              {!status.success && status.message && (
                <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                  {status.message}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {statuses.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            No se pudieron cargar los datos de rate limiting
          </div>
        )}
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">ℹ️ Información</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• <strong>API General:</strong> 100 requests por 15 minutos</p>
            <p>• <strong>Autenticación:</strong> 10 intentos por 15 minutos</p>
            <p>• <strong>Creación:</strong> 20 requests por hora</p>
            <p>• <strong>Subida de Archivos:</strong> 10 requests por hora</p>
            <p>• <strong>Admin:</strong> 200 requests por hora</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

export default RateLimitMonitor