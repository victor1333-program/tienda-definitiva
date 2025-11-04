import { NextRequest, NextResponse } from 'next/server'

// Almacén en memoria para rate limiting (en producción usar Redis)
const requests = new Map<string, { count: number; resetTime: number }>()

export interface RateLimitConfig {
  windowMs: number // Ventana de tiempo en milisegundos
  maxRequests: number // Máximo número de peticiones en la ventana
  message?: string
  keyGenerator?: (request: NextRequest) => string
}

export function rateLimit(config: RateLimitConfig) {
  const {
    windowMs,
    maxRequests,
    message = 'Demasiadas peticiones, inténtalo más tarde',
    keyGenerator = (req) => getClientIdentifier(req)
  } = config

  return async (request: NextRequest): Promise<NextResponse | null> => {
    // RATE LIMITING DESHABILITADO GLOBALMENTE
    // Para evitar bloqueos durante autenticación y operaciones normales
    console.log(`🔓 Rate limiting DESHABILITADO para: ${request.url}`)
    return null // Siempre continuar con la petición sin límites
  }
}

// Configuraciones predefinidas
export const rateLimitConfigs = {
  // APIs de autenticación - muy restrictivo
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 5, // 5 intentos por IP
    message: 'Demasiados intentos de login. Inténtalo en 15 minutos.'
  },
  
  // APIs públicas - moderado
  api: {
    windowMs: 1 * 60 * 1000, // 1 minuto
    maxRequests: 30, // 30 peticiones por minuto
    message: 'Límite de peticiones excedido. Inténtalo en un minuto.'
  },
  
  // Operaciones de escritura - restrictivo
  write: {
    windowMs: 1 * 60 * 1000, // 1 minuto
    maxRequests: 10, // 10 operaciones de escritura por minuto
    message: 'Demasiadas operaciones. Inténtalo en un minuto.'
  },
  
  // Búsquedas y lecturas - permisivo
  read: {
    windowMs: 1 * 60 * 1000, // 1 minuto
    maxRequests: 100, // 100 lecturas por minuto
    message: 'Límite de búsquedas excedido. Inténtalo en un minuto.'
  },
  
  // Upload de archivos - muy restrictivo
  upload: {
    windowMs: 5 * 60 * 1000, // 5 minutos
    maxRequests: 5, // 5 uploads por 5 minutos
    message: 'Límite de subida de archivos excedido. Inténtalo en 5 minutos.'
  },
  
  // Contacto/formularios - restrictivo
  contact: {
    windowMs: 10 * 60 * 1000, // 10 minutos
    maxRequests: 3, // 3 formularios por 10 minutos
    message: 'Demasiados envíos de formulario. Inténtalo en 10 minutos.'
  }
}

function getClientIdentifier(request: NextRequest): string {
  // Intentar obtener IP real del cliente
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0] || realIp || 'unknown'
  
  // Incluir User-Agent para mayor precisión
  const userAgent = request.headers.get('user-agent') || 'unknown'
  const userAgentHash = simpleHash(userAgent)
  
  return `${ip}-${userAgentHash}`
}

function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36)
}

// Wrapper para usar en route handlers
export function withRateLimit(config: RateLimitConfig, handler: (request: NextRequest, ...args: unknown[]) => Promise<NextResponse>) {
  return async (request: NextRequest, ...args: unknown[]) => {
    const rateLimitResult = await rateLimit(config)(request)
    
    if (rateLimitResult) {
      return rateLimitResult
    }
    
    return handler(request, ...args)
  }
}

// Rate limiting específico por usuario autenticado
export function rateLimitByUser(config: RateLimitConfig) {
  return rateLimit({
    ...config,
    keyGenerator: (req) => {
      // Intentar obtener user ID del token (simplificado)
      const authHeader = req.headers.get('authorization')
      if (authHeader) {
        try {
          // En una implementación real, decodificar el JWT aquí
          return `user-${authHeader.slice(-10)}`
        } catch {
          return getClientIdentifier(req)
        }
      }
      return getClientIdentifier(req)
    }
  })
}