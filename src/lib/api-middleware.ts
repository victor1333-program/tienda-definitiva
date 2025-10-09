import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { validateData, createValidationError } from './validation'

/**
 * Sistema de middleware avanzado para estandarizar endpoints API
 */

export interface ApiRequest<TBody = any, TQuery = any, TParams = any> {
  body?: TBody
  query?: TQuery
  params?: TParams
  user?: {
    id: string
    role: string
    email: string
  }
  headers: Headers
  method: string
  url: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  errors?: string[]
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  timestamp: string
}

/**
 * Configuración del endpoint
 */
export interface EndpointConfig<TBody = any, TQuery = any, TParams = any> {
  bodySchema?: z.ZodSchema<TBody>
  querySchema?: z.ZodSchema<TQuery>
  paramsSchema?: z.ZodSchema<TParams>
  requiredRole?: 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN'
  rateLimiting?: {
    maxRequests: number
    windowMs: number
  }
  requireAuth?: boolean
  corsConfig?: {
    origin: string[]
    methods: string[]
    credentials?: boolean
  }
}

/**
 * Handler de endpoint estandarizado
 */
export type ApiHandler<TBody = any, TQuery = any, TParams = any> = (
  req: ApiRequest<TBody, TQuery, TParams>
) => Promise<ApiResponse | NextResponse>

/**
 * Función principal para crear endpoints estandarizados
 */
export function createApiEndpoint<TBody = any, TQuery = any, TParams = any>(
  config: EndpointConfig<TBody, TQuery, TParams>,
  handlers: {
    GET?: ApiHandler<TBody, TQuery, TParams>
    POST?: ApiHandler<TBody, TQuery, TParams>
    PUT?: ApiHandler<TBody, TQuery, TParams>
    PATCH?: ApiHandler<TBody, TQuery, TParams>
    DELETE?: ApiHandler<TBody, TQuery, TParams>
  }
) {
  return async function handler(
    request: NextRequest,
    { params }: { params: Record<string, string> }
  ) {
    const startTime = Date.now()
    
    try {
      // 1. Verificar método HTTP
      const method = request.method
      const methodHandler = handlers[method as keyof typeof handlers]
      
      if (!methodHandler) {
        return createErrorResponse(
          `Método ${method} no permitido`,
          405,
          { 'Allow': Object.keys(handlers).join(', ') }
        )
      }

      // 2. Configurar CORS si se especifica
      const corsHeaders: Record<string, string> = {}
      if (config.corsConfig) {
        corsHeaders['Access-Control-Allow-Origin'] = config.corsConfig.origin.join(', ')
        corsHeaders['Access-Control-Allow-Methods'] = config.corsConfig.methods.join(', ')
        if (config.corsConfig.credentials) {
          corsHeaders['Access-Control-Allow-Credentials'] = 'true'
        }
      }

      // 3. Validar autenticación si es requerida
      let user: ApiRequest['user'] | undefined
      if (config.requireAuth || config.requiredRole) {
        const authResult = validateAuthentication(request, config.requiredRole)
        if (!authResult.success) {
          return createErrorResponse(authResult.error!, 401)
        }
        user = authResult.user
      }

      // 4. Validar y extraer datos
      const apiRequest: ApiRequest<TBody, TQuery, TParams> = {
        headers: request.headers,
        method: request.method,
        url: request.url,
        user
      }

      // Validar body
      if (config.bodySchema && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        try {
          const bodyText = await request.text()
          const bodyData = bodyText ? JSON.parse(bodyText) : {}
          const bodyValidation = validateData(config.bodySchema, bodyData)
          
          if (!bodyValidation.success) {
            return createValidationError(bodyValidation.errors)
          }
          
          apiRequest.body = bodyValidation.data
        } catch (error) {
          return createErrorResponse('JSON inválido en el cuerpo de la solicitud', 400)
        }
      }

      // Validar query parameters
      if (config.querySchema) {
        const { searchParams } = new URL(request.url)
        const queryData = Object.fromEntries(searchParams.entries())
        const queryValidation = validateData(config.querySchema, queryData)
        
        if (!queryValidation.success) {
          return createValidationError(queryValidation.errors)
        }
        
        apiRequest.query = queryValidation.data
      }

      // Validar parámetros de ruta
      if (config.paramsSchema) {
        const paramsValidation = validateData(config.paramsSchema, params)
        
        if (!paramsValidation.success) {
          return createValidationError(paramsValidation.errors)
        }
        
        apiRequest.params = paramsValidation.data
      }

      // 5. Ejecutar el handler del método
      const result = await methodHandler(apiRequest)
      
      // 6. Procesar respuesta
      if (result instanceof NextResponse) {
        // Si el handler devuelve NextResponse directamente
        Object.entries(corsHeaders).forEach(([key, value]) => {
          result.headers.set(key, value)
        })
        return result
      }

      // 7. Formatear respuesta estándar
      const response = createSuccessResponse(result, {
        ...corsHeaders,
        'X-Response-Time': `${Date.now() - startTime}ms`
      })
      
      return response

    } catch (error) {
      console.error('Error en endpoint:', error)
      
      return createErrorResponse(
        'Error interno del servidor',
        500,
        {
          ...corsHeaders,
          'X-Response-Time': `${Date.now() - startTime}ms`
        }
      )
    }
  }
}

/**
 * Validar autenticación y autorización
 */
function validateAuthentication(
  request: NextRequest,
  requiredRole?: string
): { success: true; user: ApiRequest['user'] } | { success: false; error: string } {
  const userId = request.headers.get('x-user-id')
  const userRole = request.headers.get('x-user-role')
  const userEmail = request.headers.get('x-user-email')

  if (!userId || !userRole) {
    return { success: false, error: 'Autenticación requerida' }
  }

  // Verificar rol si es requerido
  if (requiredRole) {
    const roleHierarchy = ['CUSTOMER', 'ADMIN', 'SUPER_ADMIN']
    const requiredLevel = roleHierarchy.indexOf(requiredRole)
    const userLevel = roleHierarchy.indexOf(userRole)

    if (userLevel < requiredLevel) {
      return { success: false, error: 'Permisos insuficientes' }
    }
  }

  return {
    success: true,
    user: {
      id: userId,
      role: userRole,
      email: userEmail || ''
    }
  }
}

/**
 * Crear respuesta de error estandarizada
 */
export function createErrorResponse(
  message: string,
  status: number = 400,
  headers: Record<string, string> = {}
): NextResponse {
  const response: ApiResponse = {
    success: false,
    error: message,
    timestamp: new Date().toISOString()
  }

  return NextResponse.json(response, {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  })
}

/**
 * Crear respuesta de éxito estandarizada
 */
export function createSuccessResponse<T>(
  result: ApiResponse<T>,
  headers: Record<string, string> = {}
): NextResponse {
  const response: ApiResponse<T> = {
    success: true,
    timestamp: new Date().toISOString(),
    ...result
  }

  return NextResponse.json(response, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  })
}

/**
 * Helper para crear respuestas con paginación
 */
export function createPaginatedResponse<T>(
  data: T[],
  pagination: {
    page: number
    limit: number
    total: number
  },
  message?: string
): ApiResponse<T[]> {
  return {
    success: true,
    data,
    message,
    pagination: {
      ...pagination,
      totalPages: Math.ceil(pagination.total / pagination.limit)
    },
    timestamp: new Date().toISOString()
  }
}

/**
 * Middleware para validar ID de parámetros
 */
export const validateId = z.object({
  id: z.string().min(1, 'ID requerido')
})

/**
 * Middleware para paginación estándar
 */
export const paginationQuery = z.object({
  page: z.string().transform(val => Math.max(1, parseInt(val, 10) || 1)),
  limit: z.string().transform(val => Math.min(100, Math.max(1, parseInt(val, 10) || 10))),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

/**
 * Hook para usar en endpoints existentes
 */
export async function withApiValidation<TBody = any, TQuery = any>(
  request: NextRequest,
  config: {
    bodySchema?: z.ZodSchema<TBody>
    querySchema?: z.ZodSchema<TQuery>
    requiredRole?: string
  }
): Promise<{
  success: false
  response: NextResponse
} | {
  success: true
  data: {
    body?: TBody
    query?: TQuery
    user?: ApiRequest['user']
  }
}> {
  try {
    const data: any = {}

    // Validar autenticación
    if (config.requiredRole) {
      const authResult = validateAuthentication(request, config.requiredRole)
      if (!authResult.success) {
        return {
          success: false,
          response: createErrorResponse(authResult.error, 401)
        }
      }
      data.user = authResult.user
    }

    // Validar body
    if (config.bodySchema && (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH')) {
      try {
        const bodyText = await request.text()
        const bodyData = bodyText ? JSON.parse(bodyText) : {}
        const bodyValidation = validateData(config.bodySchema, bodyData)
        
        if (!bodyValidation.success) {
          return {
            success: false,
            response: createValidationError(bodyValidation.errors)
          }
        }
        
        data.body = bodyValidation.data
      } catch (error) {
        return {
          success: false,
          response: createErrorResponse('JSON inválido', 400)
        }
      }
    }

    // Validar query
    if (config.querySchema) {
      const { searchParams } = new URL(request.url)
      const queryData = Object.fromEntries(searchParams.entries())
      const queryValidation = validateData(config.querySchema, queryData)
      
      if (!queryValidation.success) {
        return {
          success: false,
          response: createValidationError(queryValidation.errors)
        }
      }
      
      data.query = queryValidation.data
    }

    return { success: true, data }

  } catch (error) {
    console.error('Error en validación API:', error)
    return {
      success: false,
      response: createErrorResponse('Error interno', 500)
    }
  }
}