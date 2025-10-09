import { NextRequest } from 'next/server'

interface RateLimitConfig {
  windowMs: number  // Ventana de tiempo en milisegundos
  maxRequests: number  // Máximo número de requests en la ventana
  message?: string
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
  keyGenerator?: (req: NextRequest) => string
}

interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  resetTime: Date
  message?: string
}

// Simulación de Redis en memoria para desarrollo
class InMemoryCache {
  private cache = new Map<string, { count: number; resetTime: number }>()

  async get(key: string): Promise<{ count: number; resetTime: number } | null> {
    const item = this.cache.get(key)
    if (!item) return null
    
    // Limpiar entradas expiradas
    if (item.resetTime < Date.now()) {
      this.cache.delete(key)
      return null
    }
    
    return item
  }

  async set(key: string, value: { count: number; resetTime: number }): Promise<void> {
    this.cache.set(key, value)
  }

  async incr(key: string): Promise<number> {
    const item = this.cache.get(key)
    if (item && item.resetTime > Date.now()) {
      item.count++
      return item.count
    }
    return 1
  }

  async expire(key: string, seconds: number): Promise<void> {
    const item = this.cache.get(key)
    if (item) {
      item.resetTime = Date.now() + (seconds * 1000)
    }
  }

  // Limpiar cache periódicamente
  cleanup(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (item.resetTime < now) {
        this.cache.delete(key)
      }
    }
  }
}

// Instancia global del cache
const cache = new InMemoryCache()

// Limpiar cache cada 5 minutos
setInterval(() => cache.cleanup(), 5 * 60 * 1000)

/**
 * Rate limiter principal
 */
export class RateLimiter {
  private config: Required<RateLimitConfig>

  constructor(config: RateLimitConfig) {
    this.config = {
      windowMs: config.windowMs,
      maxRequests: config.maxRequests,
      message: config.message || 'Demasiadas solicitudes, intenta de nuevo más tarde',
      skipSuccessfulRequests: config.skipSuccessfulRequests || false,
      skipFailedRequests: config.skipFailedRequests || false,
      keyGenerator: config.keyGenerator || this.defaultKeyGenerator
    }
  }

  private defaultKeyGenerator(req: NextRequest): string {
    // Usar IP del cliente o user agent como fallback
    const forwarded = req.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : req.headers.get('x-real-ip') || 'unknown'
    return `rate_limit:${ip}`
  }

  private getUserKey(req: NextRequest): string {
    // Intentar obtener user ID de headers o JWT
    const userId = req.headers.get('x-user-id')
    if (userId) {
      return `rate_limit:user:${userId}`
    }
    return this.config.keyGenerator(req)
  }

  async checkLimit(req: NextRequest): Promise<RateLimitResult> {
    const key = this.getUserKey(req)
    const now = Date.now()
    const windowStart = now - this.config.windowMs
    const resetTime = new Date(now + this.config.windowMs)

    try {
      // Obtener datos actuales
      const current = await cache.get(key)
      
      if (!current) {
        // Primera solicitud en la ventana
        await cache.set(key, { count: 1, resetTime: resetTime.getTime() })
        return {
          success: true,
          limit: this.config.maxRequests,
          remaining: this.config.maxRequests - 1,
          resetTime
        }
      }

      // Verificar si la ventana ha expirado
      if (current.resetTime <= now) {
        // Nueva ventana
        await cache.set(key, { count: 1, resetTime: resetTime.getTime() })
        return {
          success: true,
          limit: this.config.maxRequests,
          remaining: this.config.maxRequests - 1,
          resetTime
        }
      }

      // Incrementar contador
      const newCount = await cache.incr(key)
      const remaining = Math.max(0, this.config.maxRequests - newCount)

      if (newCount > this.config.maxRequests) {
        return {
          success: false,
          limit: this.config.maxRequests,
          remaining: 0,
          resetTime: new Date(current.resetTime),
          message: this.config.message
        }
      }

      return {
        success: true,
        limit: this.config.maxRequests,
        remaining,
        resetTime: new Date(current.resetTime)
      }

    } catch (error) {
      console.error('Error en rate limiter:', error)
      // En caso de error, permitir la solicitud
      return {
        success: true,
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests,
        resetTime
      }
    }
  }
}

/**
 * Rate limiters predefinidos para diferentes endpoints
 */

// API general - 100 requests por 15 minutos
export const generalApiLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 100,
  message: 'Demasiadas solicitudes a la API. Intenta de nuevo en 15 minutos.'
})

// Autenticación - Configuración más permisiva para desarrollo
export const authLimiter = new RateLimiter({
  windowMs: process.env.NODE_ENV === 'development' ? 5 * 60 * 1000 : 15 * 60 * 1000, // 5min en dev, 15min en prod
  maxRequests: process.env.NODE_ENV === 'development' ? 100 : 20, // 100 en dev, 20 en prod
  message: 'Demasiados intentos de autenticación. Intenta de nuevo en unos minutos.'
})

// Endpoints de creación - 20 por hora
export const createLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000,
  maxRequests: 20,
  message: 'Demasiadas solicitudes de creación. Intenta de nuevo en 1 hora.'
})

// Upload de archivos - 50 por hora (aumentado para desarrollo)
export const uploadLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000,
  maxRequests: process.env.NODE_ENV === 'development' ? 100 : 50,
  message: 'Demasiadas subidas de archivos. Intenta de nuevo en 1 hora.'
})

// Búsquedas intensivas - 50 por 10 minutos
export const searchLimiter = new RateLimiter({
  windowMs: 10 * 60 * 1000,
  maxRequests: 50,
  message: 'Demasiadas búsquedas. Intenta de nuevo en 10 minutos.'
})

// Admin endpoints - muy permisivo en desarrollo
export const adminLimiter = new RateLimiter({
  windowMs: process.env.NODE_ENV === 'development' ? 1 * 60 * 1000 : 60 * 60 * 1000, // 1min en dev, 1h en prod
  maxRequests: process.env.NODE_ENV === 'development' ? 1000 : 200, // 1000 en dev, 200 en prod
  message: 'Límite de solicitudes admin alcanzado. Intenta de nuevo más tarde.'
})

/**
 * Middleware helper para aplicar rate limiting
 */
export async function withRateLimit(
  req: NextRequest,
  limiter: RateLimiter
): Promise<Response | null> {
  const result = await limiter.checkLimit(req)
  
  if (!result.success) {
    return new Response(
      JSON.stringify({
        error: 'Rate limit exceeded',
        message: result.message,
        retryAfter: Math.ceil((result.resetTime.getTime() - Date.now()) / 1000)
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': result.limit.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': result.resetTime.toISOString(),
          'Retry-After': Math.ceil((result.resetTime.getTime() - Date.now()) / 1000).toString()
        }
      }
    )
  }

  // Agregar headers informativos
  return null // No bloquear, pero se pueden agregar headers en el response real
}

/**
 * Hook para components React (cliente)
 */
export function useRateLimit() {
  const checkRateLimit = async (endpoint: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/rate-limit-check?endpoint=${endpoint}`)
      return response.ok
    } catch (error) {
      console.error('Error checking rate limit:', error)
      return true // Permitir en caso de error
    }
  }

  return { checkRateLimit }
}

export default RateLimiter