// Sistema de monitoreo y optimización de rendimiento
import { lazy, Suspense, createElement, ComponentType } from 'react'

// Métricas de rendimiento
export interface PerformanceMetrics {
  // Core Web Vitals
  fcp?: number // First Contentful Paint
  lcp?: number // Largest Contentful Paint
  fid?: number // First Input Delay
  cls?: number // Cumulative Layout Shift
  ttfb?: number // Time to First Byte
  
  // Métricas personalizadas
  pageLoadTime?: number
  apiResponseTime?: number
  imageLoadTime?: number
  jsLoadTime?: number
  cssLoadTime?: number
  
  // Información del contexto
  url?: string
  userAgent?: string
  connection?: string
  deviceMemory?: number
  timestamp?: number
}

// Configuración de thresholds para alertas
const PERFORMANCE_THRESHOLDS = {
  fcp: 1800, // 1.8s
  lcp: 2500, // 2.5s
  fid: 100,  // 100ms
  cls: 0.1,  // 0.1
  ttfb: 600, // 600ms
  pageLoadTime: 3000, // 3s
  apiResponseTime: 500 // 500ms
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = []
  private observers: PerformanceObserver[] = []

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers()
      this.measureInitialMetrics()
    }
  }

  // Inicializar observadores de rendimiento
  private initializeObservers() {
    try {
      // Observer para Long Tasks (tareas que bloquean el hilo principal)
      if ('PerformanceObserver' in window) {
        const longTaskObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry: any) => {
            if (entry.duration > 50) { // Tareas > 50ms
              console.warn('🐌 Long task detected:', {
                name: entry.name,
                duration: entry.duration,
                startTime: entry.startTime
              })
            }
          })
        })

        try {
          longTaskObserver.observe({ entryTypes: ['longtask'] })
          this.observers.push(longTaskObserver)
        } catch (e) {
          console.warn('Long task observer not supported')
        }

        // Observer para Layout Shifts
        const layoutShiftObserver = new PerformanceObserver((list) => {
          let clsValue = 0
          list.getEntries().forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value
            }
          })
          
          if (clsValue > 0) {
            this.recordMetric('cls', clsValue)
          }
        })

        try {
          layoutShiftObserver.observe({ entryTypes: ['layout-shift'] })
          this.observers.push(layoutShiftObserver)
        } catch (e) {
          console.warn('Layout shift observer not supported')
        }

        // Observer para LCP
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1] as any
          this.recordMetric('lcp', lastEntry.startTime)
        })

        try {
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
          this.observers.push(lcpObserver)
        } catch (e) {
          console.warn('LCP observer not supported')
        }

        // Observer para FID
        const fidObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry: any) => {
            this.recordMetric('fid', entry.processingStart - entry.startTime)
          })
        })

        try {
          fidObserver.observe({ entryTypes: ['first-input'] })
          this.observers.push(fidObserver)
        } catch (e) {
          console.warn('FID observer not supported')
        }
      }
    } catch (error) {
      console.error('Error initializing performance observers:', error)
    }
  }

  // Medir métricas iniciales
  private measureInitialMetrics() {
    if (typeof window === 'undefined') return

    // Esperar a que la página cargue completamente
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        const paint = performance.getEntriesByType('paint')

        // TTFB
        if (navigation) {
          this.recordMetric('ttfb', navigation.responseStart - navigation.requestStart)
          this.recordMetric('pageLoadTime', navigation.loadEventEnd - navigation.navigationStart)
        }

        // FCP
        const fcpEntry = paint.find(entry => entry.name === 'first-contentful-paint')
        if (fcpEntry) {
          this.recordMetric('fcp', fcpEntry.startTime)
        }

        // Información del dispositivo
        this.recordDeviceInfo()
      }, 0)
    })
  }

  // Registrar métrica
  private recordMetric(type: keyof PerformanceMetrics, value: number) {
    const metric: PerformanceMetrics = {
      [type]: value,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now()
    }

    this.metrics.push(metric)

    // Verificar si excede el threshold
    const threshold = PERFORMANCE_THRESHOLDS[type as keyof typeof PERFORMANCE_THRESHOLDS]
    if (threshold && value > threshold) {
      console.warn(`⚠️ Performance threshold exceeded for ${type}:`, {
        value,
        threshold,
        url: window.location.href
      })
    }

    // Enviar a analytics si está configurado
    this.sendToAnalytics(type, value)
  }

  // Registrar información del dispositivo
  private recordDeviceInfo() {
    if (typeof window === 'undefined') return

    const deviceInfo: Partial<PerformanceMetrics> = {
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now()
    }

    // Device Memory API
    if ('deviceMemory' in navigator) {
      deviceInfo.deviceMemory = (navigator as any).deviceMemory
    }

    // Connection API
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      deviceInfo.connection = connection.effectiveType
    }

    this.metrics.push(deviceInfo as PerformanceMetrics)
  }

  // Enviar métricas a analytics
  private sendToAnalytics(type: string, value: number) {
    try {
      // Google Analytics 4
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'performance_metric', {
          metric_name: type,
          metric_value: Math.round(value),
          page_location: window.location.href
        })
      }

      // Web Vitals - enviar a endpoint personalizado
      if (['fcp', 'lcp', 'fid', 'cls', 'ttfb'].includes(type)) {
        this.sendToCustomEndpoint(type, value)
      }
    } catch (error) {
      console.error('Error sending metrics to analytics:', error)
    }
  }

  // Enviar a endpoint personalizado
  private async sendToCustomEndpoint(type: string, value: number) {
    try {
      await fetch('/api/analytics/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metric: type,
          value: Math.round(value),
          url: window.location.href,
          timestamp: Date.now(),
          userAgent: navigator.userAgent
        }),
        keepalive: true
      })
    } catch (error) {
      // Silenciar errores de envío para no afectar UX
    }
  }

  // Medir tiempo de carga de recursos específicos
  measureResourceTiming(resourceType: string) {
    if (typeof window === 'undefined') return

    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    
    const typeResources = resources.filter(resource => {
      if (resourceType === 'image') return resource.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)
      if (resourceType === 'script') return resource.name.match(/\.js$/i)
      if (resourceType === 'style') return resource.name.match(/\.css$/i)
      return false
    })

    const totalTime = typeResources.reduce((sum, resource) => {
      return sum + (resource.responseEnd - resource.startTime)
    }, 0)

    if (typeResources.length > 0) {
      const avgTime = totalTime / typeResources.length
      this.recordMetric(`${resourceType}LoadTime` as keyof PerformanceMetrics, avgTime)
    }
  }

  // Medir tiempo de respuesta de API
  async measureApiCall<T>(apiCall: () => Promise<T>, endpoint: string): Promise<T> {
    const startTime = performance.now()
    
    try {
      const result = await apiCall()
      const endTime = performance.now()
      const responseTime = endTime - startTime
      
      this.recordMetric('apiResponseTime', responseTime)
      
      // Log APIs lentas
      if (responseTime > PERFORMANCE_THRESHOLDS.apiResponseTime) {
        console.warn('🐌 Slow API call:', {
          endpoint,
          responseTime: Math.round(responseTime),
          threshold: PERFORMANCE_THRESHOLDS.apiResponseTime
        })
      }
      
      return result
    } catch (error) {
      const endTime = performance.now()
      const responseTime = endTime - startTime
      
      console.error('API call failed:', {
        endpoint,
        responseTime: Math.round(responseTime),
        error
      })
      
      throw error
    }
  }

  // Obtener métricas actuales
  getMetrics(): PerformanceMetrics[] {
    return this.metrics
  }

  // Obtener resumen de rendimiento
  getPerformanceSummary() {
    const latestMetrics = this.metrics.reduce((acc, metric) => {
      Object.entries(metric).forEach(([key, value]) => {
        if (typeof value === 'number' && key !== 'timestamp') {
          acc[key] = value
        }
      })
      return acc
    }, {} as Record<string, number>)

    // Calcular scores
    const scores = {
      fcp: this.calculateScore(latestMetrics.fcp, 1800, 3000),
      lcp: this.calculateScore(latestMetrics.lcp, 2500, 4000),
      fid: this.calculateScore(latestMetrics.fid, 100, 300),
      cls: this.calculateScore(latestMetrics.cls, 0.1, 0.25),
      ttfb: this.calculateScore(latestMetrics.ttfb, 600, 1500)
    }

    const overallScore = Object.values(scores).reduce((sum, score) => sum + (score || 0), 0) / Object.keys(scores).length

    return {
      metrics: latestMetrics,
      scores,
      overallScore: Math.round(overallScore),
      grade: this.getGrade(overallScore)
    }
  }

  // Calcular score (0-100)
  private calculateScore(value: number | undefined, good: number, poor: number): number {
    if (value === undefined) return 0
    
    if (value <= good) return 100
    if (value >= poor) return 0
    
    return Math.round(100 - ((value - good) / (poor - good)) * 100)
  }

  // Obtener calificación
  private getGrade(score: number): string {
    if (score >= 90) return 'A'
    if (score >= 80) return 'B'
    if (score >= 70) return 'C'
    if (score >= 60) return 'D'
    return 'F'
  }

  // Limpiar observadores
  cleanup() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }
}

// Instancia global
export const performanceMonitor = new PerformanceMonitor()

// Hook para React
export function usePerformanceMonitor() {
  if (typeof window === 'undefined') return null
  return performanceMonitor
}

// Middleware para medir rendimiento de APIs
export function withPerformanceMonitoring(handler: Function) {
  return async function (req: any, res: any) {
    const startTime = Date.now()
    
    try {
      const result = await handler(req, res)
      const endTime = Date.now()
      const responseTime = endTime - startTime
      
      // Log APIs lentas en servidor
      if (responseTime > 1000) {
        console.warn('🐌 Slow API endpoint:', {
          method: req.method,
          url: req.url,
          responseTime,
          statusCode: res.statusCode
        })
      }
      
      // Agregar header de tiempo de respuesta
      res.setHeader('X-Response-Time', responseTime)
      
      return result
    } catch (error) {
      const endTime = Date.now()
      const responseTime = endTime - startTime
      
      console.error('API endpoint error:', {
        method: req.method,
        url: req.url,
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      throw error
    }
  }
}

// Función para optimizar imágenes automáticamente
export function getOptimizedImageProps(src: string, width?: number, height?: number) {
  return {
    src,
    width,
    height,
    quality: 85,
    placeholder: 'blur' as const,
    blurDataURL: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkbHB0eH/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/2gAMAwEAAhEDEQA/AKrfM5C5Xa5uAEkHV5o5t8h3AzYwADXd6jLHDQcdFPYw0BBCZzIMshFRaR1dGGZGkqQCQlMNFiF2xSQjGhwfQFVFBhTmF2w9sVNy0lh6gvFNgTGFFFHZbQIrEhXFRQAUSQjCgip2xTq1MzCggihN8MUFE/iF2w9SVVFFFBRRQZNVFqqfBmhQRRQFlSGqFFCj/9k=',
    loading: 'lazy' as const
  }
}

// Función para prefetch de recursos críticos
export function prefetchCriticalResources() {
  if (typeof window === 'undefined') return

  // Prefetch de fuentes críticas
  const criticalFonts = [
    '/fonts/inter-var.woff2'
  ]

  criticalFonts.forEach(font => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = font
    link.as = 'font'
    link.type = 'font/woff2'
    link.crossOrigin = 'anonymous'
    document.head.appendChild(link)
  })

  // Prefetch de imágenes críticas
  const criticalImages = [
    '/img/Social_Logo.png',
    '/Logo.png'
  ]

  criticalImages.forEach(image => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = image
    link.as = 'image'
    document.head.appendChild(link)
  })
}

// Función para lazy loading de componentes
export function createLazyComponent<T>(
  componentImport: () => Promise<{ default: ComponentType<T> }>,
  fallback?: ComponentType
) {
  const LazyComponent = lazy(componentImport)
  
  return function LazyWrapper(props: T) {
    const fallbackElement = fallback ? createElement(fallback) : createElement('div', null, 'Cargando...')
    
    return createElement(
      Suspense,
      { fallback: fallbackElement },
      createElement(LazyComponent, props)
    )
  }
}

// Utilidades adicionales de optimización de rendimiento
export const optimizationUtils = {
  /**
   * Debounce function for limiting the rate of function calls
   */
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): ((...args: Parameters<T>) => void) => {
    let timeoutId: NodeJS.Timeout
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func(...args), delay)
    }
  },

  /**
   * Throttle function for limiting function execution to once per interval
   */
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  },

  /**
   * Canvas performance optimization utilities
   */
  canvas: {
    clearCanvas: (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      ctx.clearRect(0, 0, width, height)
    },

    batchDraw: (ctx: CanvasRenderingContext2D, operations: (() => void)[]) => {
      ctx.save()
      operations.forEach(op => op())
      ctx.restore()
    },

    isElementVisible: (
      element: { x: number; y: number; width: number; height: number },
      viewport: { x: number; y: number; width: number; height: number; zoom: number }
    ): boolean => {
      const scaledElement = {
        x: element.x * viewport.zoom,
        y: element.y * viewport.zoom,
        width: element.width * viewport.zoom,
        height: element.height * viewport.zoom
      }

      return !(
        scaledElement.x + scaledElement.width < viewport.x ||
        scaledElement.x > viewport.x + viewport.width ||
        scaledElement.y + scaledElement.height < viewport.y ||
        scaledElement.y > viewport.y + viewport.height
      )
    }
  },

  /**
   * Memory management utilities
   */
  memory: {
    revokeObjectURL: (url: string) => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url)
      }
    },

    revokeObjectURLs: (urls: string[]) => {
      urls.forEach(url => optimizationUtils.memory.revokeObjectURL(url))
    },

    createWeakCache: <K extends object, V>() => {
      return new WeakMap<K, V>()
    }
  },

  /**
   * Image optimization utilities
   */
  images: {
    createImageLoader: (onLoad?: (img: HTMLImageElement) => void) => {
      return (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new Image()
          img.onload = () => {
            onLoad?.(img)
            resolve(img)
          }
          img.onerror = reject
          img.crossOrigin = 'anonymous'
          img.src = src
        })
      }
    },

    preloadImages: (urls: string[]): Promise<HTMLImageElement[]> => {
      const loader = optimizationUtils.images.createImageLoader()
      return Promise.all(urls.map(url => loader(url)))
    }
  }
}