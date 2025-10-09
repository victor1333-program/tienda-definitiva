/**
 * Manejador central de errores para APIs
 * Oculta información sensible en producción
 */

import { NextResponse } from 'next/server'

export interface ApiError extends Error {
  statusCode?: number
  code?: string
}

export function createApiError(message: string, statusCode = 500, code?: string): ApiError {
  const error = new Error(message) as ApiError
  error.statusCode = statusCode
  error.code = code
  return error
}

export function handleApiError(error: unknown): NextResponse {
  const isProduction = process.env.NODE_ENV === 'production'
  
  // Determinar tipo de error
  if (error instanceof Error) {
    const apiError = error as ApiError
    const statusCode = apiError.statusCode || 500
    
    // Logs internos (siempre completos para debugging)
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', {
        message: error.message,
        stack: error.stack,
        code: apiError.code
      })
    } else {
      // En producción, log sin stack trace pero con contexto
      console.error('API Error:', {
        message: error.message,
        code: apiError.code,
        statusCode
      })
    }

    // Respuesta al cliente
    if (isProduction) {
      // En producción: solo mensajes genéricos para errores 500
      if (statusCode >= 500) {
        return NextResponse.json(
          {
            error: 'Error interno del servidor',
            code: apiError.code || 'INTERNAL_ERROR'
          },
          { status: statusCode }
        )
      } else {
        // Para errores 4xx, podemos mostrar el mensaje (no sensible)
        return NextResponse.json(
          {
            error: error.message,
            code: apiError.code || 'CLIENT_ERROR'
          },
          { status: statusCode }
        )
      }
    } else {
      // En desarrollo: información completa
      return NextResponse.json(
        {
          error: error.message,
          code: apiError.code,
          details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        },
        { status: statusCode }
      )
    }
  }

  // Error desconocido
  if (process.env.NODE_ENV === 'development') {
    console.error('Unknown error:', error)
  }

  return NextResponse.json(
    {
      error: isProduction ? 'Error interno del servidor' : 'Error desconocido',
      code: 'UNKNOWN_ERROR'
    },
    { status: 500 }
  )
}

/**
 * Wrapper para APIs que maneja errores automáticamente
 */
export function withErrorHandler<T extends any[], R>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args)
    } catch (error) {
      return handleApiError(error)
    }
  }
}

/**
 * Errores comunes predefinidos
 */
export const CommonErrors = {
  UNAUTHORIZED: () => createApiError('No autorizado', 401, 'UNAUTHORIZED'),
  FORBIDDEN: () => createApiError('Acceso denegado', 403, 'FORBIDDEN'),
  NOT_FOUND: (resource = 'Recurso') => createApiError(`${resource} no encontrado`, 404, 'NOT_FOUND'),
  VALIDATION_ERROR: (message: string) => createApiError(message, 400, 'VALIDATION_ERROR'),
  RATE_LIMITED: () => createApiError('Demasiadas peticiones', 429, 'RATE_LIMITED'),
  FILE_TOO_LARGE: (maxSize: string) => createApiError(`Archivo demasiado grande. Máximo: ${maxSize}`, 413, 'FILE_TOO_LARGE'),
  INVALID_FILE_TYPE: () => createApiError('Tipo de archivo no permitido', 400, 'INVALID_FILE_TYPE'),
  DATABASE_ERROR: () => createApiError('Error de base de datos', 500, 'DATABASE_ERROR'),
} as const

/**
 * Creates a success response with consistent format
 */
export function createSuccessResponse(data?: any, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data
    },
    { status }
  )
}