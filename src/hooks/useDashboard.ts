import { useState, useEffect } from 'react'

export interface DashboardStats {
  totalProducts: number
  totalOrders: number
  totalCustomers: number
  totalRevenue: number
  pendingOrders: number
  lowStockProducts: number
  revenueChange: number
  ordersChange: number
  customersChange: number
  customersLastWeek: number
  revenueYesterday: number
  ordersYesterday: number
  ordersByStatus: Array<{ status: string; count: number }>
  topSellingProducts: Array<{ name: string; totalSold: number; orders: number }>
  revenueChart: Array<{ date: string; revenue: number }>
  period: string
  lastUpdated: string
}

export interface DashboardMetrics {
  period: string
  businessMetrics: {
    conversionRate: number
    averageOrderValue: number
    totalRevenue: number
    totalOrders: number
    revenueGrowth: number
  }
  customerMetrics: {
    totalCustomers: number
    newCustomers: number
    returningCustomers: number
    customerRetentionRate: number
  }
  inventoryMetrics: {
    totalStock: number
    averageStock: number
    totalVariants: number
    lowStockProducts: number
    highStockProducts: number
    stockTurnover: string
  }
  categoryDistribution: Array<{
    name: string
    productCount: number
    slug: string
  }>
  paymentMethods: Array<{
    method: string
    count: number
    revenue: number
  }>
  monthlyTrends: Array<{
    month: string
    revenue: number
    orders: number
  }>
  lastUpdated: string
}

export function useDashboardStats(period: string = '30d') {
  const [data, setData] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/dashboard/stats?period=${period}`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const stats = await response.json()
        setData(stats)
      } catch (err) {
        console.error('Error fetching dashboard stats:', err)
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [period])

  const refetch = () => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/dashboard/stats?period=${period}`)
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        const stats = await response.json()
        setData(stats)
      } catch (err) {
        console.error('Error refetching dashboard stats:', err)
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }

  return { data, loading, error, refetch }
}

export function useDashboardMetrics(period: string = '30d') {
  const [data, setData] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/dashboard/metrics?period=${period}`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const metrics = await response.json()
        setData(metrics)
      } catch (err) {
        console.error('Error fetching dashboard metrics:', err)
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [period])

  const refetch = () => {
    const fetchMetrics = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/dashboard/metrics?period=${period}`)
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        const metrics = await response.json()
        setData(metrics)
      } catch (err) {
        console.error('Error refetching dashboard metrics:', err)
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }
    fetchMetrics()
  }

  return { data, loading, error, refetch }
}

// Hook para formateo de precios
export function useFormatPrice() {
  return (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }
}

// Hook para formateo de fechas
export function useFormatDate() {
  return {
    short: (date: string | Date) => {
      return new Date(date).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit'
      })
    },
    medium: (date: string | Date) => {
      return new Date(date).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    },
    long: (date: string | Date) => {
      return new Date(date).toLocaleDateString('es-ES', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    },
    time: (date: string | Date) => {
      return new Date(date).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    dateTime: (date: string | Date) => {
      return new Date(date).toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }
}

// Hook para cálculos de métricas
export function useMetricsCalculations() {
  return {
    calculateGrowth: (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0
      return ((current - previous) / previous) * 100
    },
    
    calculatePercentage: (part: number, total: number): number => {
      if (total === 0) return 0
      return (part / total) * 100
    },
    
    formatPercentage: (value: number, decimals: number = 1): string => {
      return `${value.toFixed(decimals)}%`
    },
    
    formatNumber: (value: number, locale: string = 'es-ES'): string => {
      return new Intl.NumberFormat(locale).format(value)
    },
    
    calculateAverage: (values: number[]): number => {
      if (values.length === 0) return 0
      return values.reduce((sum, value) => sum + value, 0) / values.length
    },
    
    getStatusColor: (status: string): string => {
      const statusColors: Record<string, string> = {
        'PENDING': 'text-yellow-600 bg-yellow-100',
        'CONFIRMED': 'text-blue-600 bg-blue-100',
        'PROCESSING': 'text-orange-600 bg-orange-100',
        'SHIPPED': 'text-purple-600 bg-purple-100',
        'DELIVERED': 'text-green-600 bg-green-100',
        'CANCELLED': 'text-red-600 bg-red-100',
        'REFUNDED': 'text-gray-600 bg-gray-100'
      }
      return statusColors[status] || 'text-gray-600 bg-gray-100'
    }
  }
}