// Sistema de caché avanzado para Lovilike Personalizados
import { unstable_cache as nextCache } from 'next/cache'

// Configuración de Redis (opcional)
interface RedisClient {
  get: (key: string) => Promise<string | null>
  set: (key: string, value: string, options?: { ex?: number }) => Promise<string>
  del: (key: string) => Promise<number>
  exists: (key: string) => Promise<number>
  flushdb: () => Promise<string>
}

// Cache en memoria como fallback
class MemoryCache {
  private cache = new Map<string, { value: any; expires: number }>()
  private maxSize = 1000

  get(key: string): any | null {
    const item = this.cache.get(key)
    if (!item) return null
    
    if (Date.now() > item.expires) {
      this.cache.delete(key)
      return null
    }
    
    return item.value
  }

  set(key: string, value: any, ttlSeconds = 300): void {
    // Limpiar cache si está lleno
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
    
    this.cache.set(key, {
      value,
      expires: Date.now() + (ttlSeconds * 1000)
    })
  }

  del(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }

  keys(): string[] {
    return Array.from(this.cache.keys())
  }
}

// Instancia global de cache
const memoryCache = new MemoryCache()

// Tipos de cache
export type CacheKey = 
  | 'products'
  | 'categories' 
  | 'orders'
  | 'dashboard-stats'
  | 'popular-products'
  | 'user-session'
  | 'cart-data'
  | 'product-details'
  | 'search-results'
  | 'notifications'

// Configuración de TTL por tipo
const CACHE_TTL: Record<CacheKey, number> = {
  'products': 300, // 5 minutos
  'categories': 600, // 10 minutos
  'orders': 60, // 1 minuto
  'dashboard-stats': 300, // 5 minutos
  'popular-products': 1800, // 30 minutos
  'user-session': 3600, // 1 hora
  'cart-data': 1800, // 30 minutos
  'product-details': 600, // 10 minutos
  'search-results': 300, // 5 minutos
  'notifications': 30 // 30 segundos
}

class CacheService {
  private redis: RedisClient | null = null
  private useRedis = false

  constructor() {
    this.initializeRedis()
  }

  private async initializeRedis() {
    try {
      // En producción, conectar a Redis
      if (process.env.REDIS_URL && typeof window === 'undefined') {
        // const redis = new Redis(process.env.REDIS_URL)
        // this.redis = redis
        // this.useRedis = true
        console.log('Redis connection available but not implemented in demo')
      }
    } catch (error) {
      console.warn('Redis not available, using memory cache:', error)
      this.useRedis = false
    }
  }

  // Generar clave de cache
  private generateKey(type: CacheKey, identifier?: string): string {
    const baseKey = `lovilike:${type}`
    return identifier ? `${baseKey}:${identifier}` : baseKey
  }

  // Obtener desde cache
  async get<T>(type: CacheKey, identifier?: string): Promise<T | null> {
    const key = this.generateKey(type, identifier)
    
    try {
      if (this.useRedis && this.redis) {
        const value = await this.redis.get(key)
        return value ? JSON.parse(value) : null
      } else {
        return memoryCache.get(key)
      }
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }

  // Guardar en cache
  async set<T>(type: CacheKey, data: T, identifier?: string, customTTL?: number): Promise<void> {
    const key = this.generateKey(type, identifier)
    const ttl = customTTL || CACHE_TTL[type]
    
    try {
      if (this.useRedis && this.redis) {
        await this.redis.set(key, JSON.stringify(data), { ex: ttl })
      } else {
        memoryCache.set(key, data, ttl)
      }
    } catch (error) {
      console.error('Cache set error:', error)
    }
  }

  // Eliminar del cache
  async del(type: CacheKey, identifier?: string): Promise<void> {
    const key = this.generateKey(type, identifier)
    
    try {
      if (this.useRedis && this.redis) {
        await this.redis.del(key)
      } else {
        memoryCache.del(key)
      }
    } catch (error) {
      console.error('Cache del error:', error)
    }
  }

  // Invalidar múltiples claves
  async invalidatePattern(pattern: string): Promise<void> {
    try {
      if (this.useRedis && this.redis) {
        // En Redis real, usar SCAN para encontrar claves
        console.log('Redis pattern invalidation not implemented in demo')
      } else {
        // Invalidar en memoria cache
        const keys = memoryCache.keys()
        keys.forEach(key => {
          if (key.includes(pattern)) {
            memoryCache.del(key)
          }
        })
      }
    } catch (error) {
      console.error('Cache invalidate pattern error:', error)
    }
  }

  // Limpiar cache completo
  async flush(): Promise<void> {
    try {
      if (this.useRedis && this.redis) {
        await this.redis.flushdb()
      } else {
        memoryCache.clear()
      }
    } catch (error) {
      console.error('Cache flush error:', error)
    }
  }

  // Estadísticas del cache
  getStats(): { 
    type: 'redis' | 'memory'
    size: number
    keys: string[]
    hitRate?: number 
  } {
    if (this.useRedis) {
      return {
        type: 'redis',
        size: 0, // Obtener de Redis
        keys: [],
        hitRate: 0
      }
    } else {
      return {
        type: 'memory',
        size: memoryCache.size(),
        keys: memoryCache.keys(),
        hitRate: 0 // Implementar contador de hits
      }
    }
  }
}

// Instancia global
export const cacheService = new CacheService()

// Helper para cache con Next.js
export function createCachedFunction<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  tags: string[],
  revalidate?: number
) {
  return nextCache(fn, {
    tags,
    revalidate: revalidate || 300 // 5 minutos por defecto
  })
}

// Decorador para funciones cacheable
export function cached(type: CacheKey, ttl?: number) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${propertyName}:${JSON.stringify(args)}`
      
      // Intentar obtener del cache
      const cached = await cacheService.get(type, cacheKey)
      if (cached !== null) {
        return cached
      }

      // Ejecutar función original
      const result = await method.apply(this, args)
      
      // Guardar en cache
      await cacheService.set(type, result, cacheKey, ttl)
      
      return result
    }

    return descriptor
  }
}

// Funciones de utilidad para cache específico
export const ProductCache = {
  async getProduct(id: string) {
    return cacheService.get('product-details', id)
  },

  async setProduct(id: string, product: any) {
    return cacheService.set('product-details', product, id)
  },

  async invalidateProduct(id: string) {
    return cacheService.del('product-details', id)
  },

  async getPopularProducts() {
    return cacheService.get('popular-products')
  },

  async setPopularProducts(products: any[]) {
    return cacheService.set('popular-products', products)
  }
}

export const UserCache = {
  async getSession(userId: string) {
    return cacheService.get('user-session', userId)
  },

  async setSession(userId: string, session: any) {
    return cacheService.set('user-session', session, userId)
  },

  async getCart(userId: string) {
    return cacheService.get('cart-data', userId)
  },

  async setCart(userId: string, cart: any) {
    return cacheService.set('cart-data', cart, userId)
  }
}

export const SearchCache = {
  async getResults(query: string, filters?: any) {
    const key = filters ? `${query}:${JSON.stringify(filters)}` : query
    return cacheService.get('search-results', key)
  },

  async setResults(query: string, results: any[], filters?: any) {
    const key = filters ? `${query}:${JSON.stringify(filters)}` : query
    return cacheService.set('search-results', results, key)
  }
}

// Cache invalidation helpers
export const CacheInvalidation = {
  // Invalidar cuando se actualiza un producto
  async onProductUpdate(productId: string) {
    await cacheService.del('product-details', productId)
    await cacheService.del('popular-products')
    await cacheService.invalidatePattern('search-results')
    await cacheService.del('products')
  },

  // Invalidar cuando se crea un pedido
  async onOrderCreate(userId: string) {
    await cacheService.del('orders')
    await cacheService.del('dashboard-stats')
    await cacheService.del('cart-data', userId)
  },

  // Invalidar cuando cambia el inventario
  async onStockUpdate(productId: string) {
    await cacheService.del('product-details', productId)
    await cacheService.del('dashboard-stats')
    await cacheService.invalidatePattern('search-results')
  }
}

// Middleware de cache para APIs
export function withCache(type: CacheKey, ttl?: number) {
  return function (handler: Function) {
    return async function (req: any, res: any) {
      const cacheKey = `${req.url}:${JSON.stringify(req.query)}`
      
      // Verificar cache solo para GET
      if (req.method === 'GET') {
        const cached = await cacheService.get(type, cacheKey)
        if (cached) {
          return res.json(cached)
        }
      }

      // Ejecutar handler original
      const originalJson = res.json
      res.json = function (data: any) {
        // Guardar en cache si es GET exitoso
        if (req.method === 'GET' && res.statusCode === 200) {
          cacheService.set(type, data, cacheKey, ttl)
        }
        return originalJson.call(this, data)
      }

      return handler(req, res)
    }
  }
}