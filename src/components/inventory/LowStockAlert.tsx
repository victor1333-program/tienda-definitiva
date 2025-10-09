'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Package, TrendingDown, ExternalLink, X } from 'lucide-react'
import Link from 'next/link'

interface LowStockItem {
  id: string
  type: 'variant' | 'material'
  name: string
  sku?: string
  stock: number
  minStock?: number
  unit?: string
  status: 'low' | 'out'
}

interface LowStockAlertProps {
  className?: string
  maxItems?: number
  autoRefresh?: boolean
}

export default function LowStockAlert({ 
  className = '', 
  maxItems = 5,
  autoRefresh = true 
}: LowStockAlertProps) {
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([])
  const [loading, setLoading] = useState(true)
  const [dismissed, setDismissed] = useState(false)

  const fetchLowStockItems = async () => {
    try {
      // Simular llamada a API - en el futuro implementar endpoints reales
      const mockItems: LowStockItem[] = [
        {
          id: '1',
          type: 'variant',
          name: 'Camiseta Básica Blanca - M',
          sku: 'CAM-BAS-BLA-M',
          stock: 2,
          minStock: 5,
          status: 'low'
        },
        {
          id: '2',
          type: 'variant',
          name: 'Taza Blanca 330ml',
          sku: 'TZA-BLA-330',
          stock: 0,
          status: 'out'
        },
        {
          id: '3',
          type: 'material',
          name: 'Film DTF',
          stock: 2.5,
          minStock: 10,
          unit: 'metros',
          status: 'low'
        },
        {
          id: '4',
          type: 'variant',
          name: 'Sudadera Negra - L',
          sku: 'SUD-NEG-L',
          stock: 1,
          minStock: 3,
          status: 'low'
        }
      ]

      setLowStockItems(mockItems.slice(0, maxItems))
    } catch (error) {
      console.error('Error fetching low stock items:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLowStockItems()

    if (autoRefresh) {
      const interval = setInterval(fetchLowStockItems, 5 * 60 * 1000) // Cada 5 minutos
      return () => clearInterval(interval)
    }
  }, [maxItems, autoRefresh])

  if (dismissed || loading || lowStockItems.length === 0) {
    return null
  }

  const outOfStockCount = lowStockItems.filter(item => item.status === 'out').length
  const lowStockCount = lowStockItems.filter(item => item.status === 'low').length

  return (
    <Card className={`border-l-4 border-l-yellow-500 ${className}`}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <h3 className="font-medium text-gray-900">⚠️ Alertas de Stock</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDismissed(true)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Summary */}
        <div className="flex gap-4 mb-4 text-sm">
          {outOfStockCount > 0 && (
            <div className="flex items-center gap-1 text-red-600">
              <TrendingDown className="w-4 h-4" />
              <span>{outOfStockCount} sin stock</span>
            </div>
          )}
          {lowStockCount > 0 && (
            <div className="flex items-center gap-1 text-yellow-600">
              <Package className="w-4 h-4" />
              <span>{lowStockCount} stock bajo</span>
            </div>
          )}
        </div>

        {/* Items List */}
        <div className="space-y-2 mb-4">
          {lowStockItems.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between p-2 rounded-lg ${
                item.status === 'out' ? 'bg-red-50' : 'bg-yellow-50'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-lg ${item.status === 'out' ? 'text-red-600' : 'text-yellow-600'}`}>
                    {item.status === 'out' ? '🔴' : '🟡'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.name}
                    </p>
                    {item.sku && (
                      <p className="text-xs text-gray-500 font-mono">
                        {item.sku}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`text-sm font-bold ${
                  item.status === 'out' ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  {item.stock} {item.unit || 'unid'}
                </div>
                {item.minStock && (
                  <div className="text-xs text-gray-500">
                    Min: {item.minStock}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link href="/admin/inventory" className="flex-1">
            <Button variant="outline" size="sm" className="w-full flex items-center gap-1">
              <Package className="w-3 h-3" />
              Ver Inventario
            </Button>
          </Link>
          <Link href="/admin/production/material-stock" className="flex-1">
            <Button variant="outline" size="sm" className="w-full flex items-center gap-1">
              <ExternalLink className="w-3 h-3" />
              Materiales
            </Button>
          </Link>
        </div>

        {lowStockItems.length >= maxItems && (
          <div className="mt-2 text-center">
            <Link href="/admin/inventory?filter=low" className="text-xs text-primary-600 hover:text-primary-800">
              Ver todos los productos con stock bajo
            </Link>
          </div>
        )}
      </div>
    </Card>
  )
}

// Hook para usar las alertas en cualquier componente
export function useLowStockAlerts() {
  const [alerts, setAlerts] = useState<LowStockItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        // Aquí iría la llamada real a la API
        // const response = await fetch('/api/inventory/alerts')
        // const data = await response.json()
        // setAlerts(data.alerts)
        
        // Mock data por ahora
        setAlerts([])
      } catch (error) {
        console.error('Error fetching alerts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAlerts()
  }, [])

  return { alerts, loading, refetch: () => setLoading(true) }
}