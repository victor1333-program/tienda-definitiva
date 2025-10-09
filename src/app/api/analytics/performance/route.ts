import { NextRequest, NextResponse } from 'next/server'
import { withPerformanceMonitoring } from '@/lib/performance'

interface PerformanceData {
  metric: string
  value: number
  url: string
  timestamp: number
  userAgent: string
}

// Almacenamiento temporal en memoria (en producción usar DB)
let performanceMetrics: PerformanceData[] = []

async function handleRequest(req: NextRequest) {
  if (req.method === 'POST') {
    try {
      const data: PerformanceData = await req.json()
      
      // Validar datos
      if (!data.metric || typeof data.value !== 'number') {
        return NextResponse.json(
          { error: 'Invalid performance data' },
          { status: 400 }
        )
      }

      // Agregar timestamp si no existe
      if (!data.timestamp) {
        data.timestamp = Date.now()
      }

      // Almacenar métrica (limitar a últimas 1000)
      performanceMetrics.push({
        metric: data.metric,
        value: Math.round(data.value),
        url: new URL(data.url).pathname,
        timestamp: data.timestamp
      })
      
      if (performanceMetrics.length > 1000) {
        performanceMetrics = performanceMetrics.slice(-1000)
      }

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('Error recording performance metric:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }

  if (req.method === 'GET') {
    try {
      const url = new URL(req.url)
      const hours = parseInt(url.searchParams.get('hours') || '24')
      const metric = url.searchParams.get('metric')

      // Filtrar por tiempo
      const cutoff = Date.now() - (hours * 60 * 60 * 1000)
      let filtered = performanceMetrics.filter(m => m.timestamp > cutoff)

      // Filtrar por métrica específica si se solicita
      if (metric) {
        filtered = filtered.filter(m => m.metric === metric)
      }

      // Calcular estadísticas
      const stats = calculateStats(filtered)

      return NextResponse.json({
        metrics: filtered.slice(-100), // Últimas 100
        stats,
        total: filtered.length
      })
    } catch (error) {
      console.error('Error retrieving performance metrics:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }

  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

function calculateStats(metrics: PerformanceData[]) {
  if (metrics.length === 0) {
    return {
      averages: {},
      p95: {},
      counts: {}
    }
  }

  // Agrupar por tipo de métrica
  const grouped = metrics.reduce((acc, metric) => {
    if (!acc[metric.metric]) {
      acc[metric.metric] = []
    }
    acc[metric.metric].push(metric.value)
    return acc
  }, {} as Record<string, number[]>)

  const stats = {
    averages: {} as Record<string, number>,
    p95: {} as Record<string, number>,
    counts: {} as Record<string, number>
  }

  // Calcular estadísticas por métrica
  Object.entries(grouped).forEach(([metricName, values]) => {
    values.sort((a, b) => a - b)
    
    stats.counts[metricName] = values.length
    stats.averages[metricName] = values.reduce((sum, val) => sum + val, 0) / values.length
    stats.p95[metricName] = values[Math.floor(values.length * 0.95)] || 0
  })

  return stats
}

export const POST = withPerformanceMonitoring(handleRequest)
export const GET = withPerformanceMonitoring(handleRequest)