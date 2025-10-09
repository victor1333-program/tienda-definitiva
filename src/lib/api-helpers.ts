import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { createApiEndpoint, paginationQuery, validateId } from "./api-middleware"
import { z } from "zod"

/**
 * Helpers para endpoints API comunes
 */

/**
 * Helper para autenticación de admin
 */
export async function requireAdminAuth() {
  const session = await auth()
  
  if (!session?.user || session.user.role === 'CUSTOMER') {
    throw new AuthError('No autorizado', 401)
  }
  
  return session.user
}

/**
 * Helper para autenticación de super admin
 */
export async function requireSuperAdminAuth() {
  const session = await auth()
  
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    throw new AuthError('Se requieren permisos de Super Admin', 403)
  }
  
  return session.user
}

/**
 * Helper para cualquier usuario autenticado
 */
export async function requireAuth() {
  const session = await auth()
  
  if (!session?.user) {
    throw new AuthError('Autenticación requerida', 401)
  }
  
  return session.user
}

/**
 * Clase de error personalizada para autenticación
 */
export class AuthError extends Error {
  constructor(message: string, public status: number) {
    super(message)
    this.name = 'AuthError'
  }
}

/**
 * Configuración predefinida para endpoints con autenticación admin
 */
export const withAdminAuth = (config: any = {}) => ({
  ...config,
  requiredRole: 'ADMIN' as const,
  requireAuth: true
})

/**
 * Configuración predefinida para endpoints con paginación
 */
export const withPagination = (config: any = {}) => ({
  ...config,
  querySchema: paginationQuery
})

/**
 * Configuración predefinida para endpoints con ID en params
 */
export const withIdValidation = (config: any = {}) => ({
  ...config,
  paramsSchema: validateId
})

/**
 * Configuración combinada más común: Admin + ID + Paginación
 */
export const withAdminCRUD = (config: any = {}) => ({
  ...config,
  requiredRole: 'ADMIN' as const,
  requireAuth: true,
  paramsSchema: validateId,
  querySchema: paginationQuery
})

/**
 * Helper para respuestas de error estandarizadas
 */
export function createStandardErrorResponse(error: unknown) {
  if (error instanceof AuthError) {
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: error.status }
    )
  }
  
  console.error('Error interno del servidor:', error)
  return NextResponse.json(
    { 
      success: false, 
      error: 'Error interno del servidor',
      timestamp: new Date().toISOString()
    },
    { status: 500 }
  )
}

/**
 * Helper para respuestas de éxito estandarizadas
 */
export function createStandardSuccessResponse(data: any, message?: string) {
  return NextResponse.json({
    success: true,
    data,
    message,
    timestamp: new Date().toISOString()
  })
}

/**
 * Helper para manejar errores de forma consistente
 */
export async function handleApiRequest<T>(
  operation: () => Promise<T>,
  errorMessage = 'Error interno del servidor'
): Promise<NextResponse> {
  try {
    const result = await operation()
    return createStandardSuccessResponse(result)
  } catch (error) {
    return createStandardErrorResponse(error)
  }
}

/**
 * Schema común para búsqueda
 */
export const searchQuery = z.object({
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

/**
 * Schema para filtros de fecha
 */
export const dateRangeQuery = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional()
})

/**
 * Schema combinado para endpoints de listado
 */
export const listingQuery = paginationQuery.merge(searchQuery).merge(dateRangeQuery)

/**
 * Helper para extraer filtros de búsqueda y paginación
 */
export function extractListingParams(query: any) {
  const {
    page = 1,
    limit = 10,
    search = '',
    sortBy = 'createdAt',
    sortOrder = 'desc',
    startDate,
    endDate
  } = query

  const skip = (page - 1) * limit
  
  const orderBy = { [sortBy]: sortOrder }
  
  let dateFilter = {}
  if (startDate || endDate) {
    dateFilter = {
      createdAt: {
        ...(startDate && { gte: new Date(startDate) }),
        ...(endDate && { lte: new Date(endDate) })
      }
    }
  }
  
  return {
    page,
    limit,
    skip,
    search,
    orderBy,
    dateFilter
  }
}

/**
 * Helper para crear respuesta paginada
 */
export function createPaginatedResponse(
  data: any[],
  total: number,
  page: number,
  limit: number
) {
  return {
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1
    },
    timestamp: new Date().toISOString()
  }
}

/**
 * Helper para validar IDs de MongoDB/Prisma
 */
export function validateObjectId(id: string): boolean {
  return /^[a-fA-F0-9]{24}$/.test(id) || /^[a-zA-Z0-9_-]+$/.test(id)
}

/**
 * Helper para limpiar datos de entrada
 */
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return input.trim()
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput)
  }
  
  if (input && typeof input === 'object') {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value)
    }
    return sanitized
  }
  
  return input
}

/**
 * Wrapper para crear endpoints CRUD estándar
 */
export function createCRUDEndpoint<T = any>(config: {
  model: string
  createSchema: z.ZodSchema<T>
  updateSchema?: z.ZodSchema<Partial<T>>
  searchFields?: string[]
  requiredRole?: 'ADMIN' | 'SUPER_ADMIN'
}) {
  return createApiEndpoint(
    withAdminCRUD({
      bodySchema: config.createSchema,
      requiredRole: config.requiredRole || 'ADMIN'
    }),
    {
      // Implementación de handlers CRUD genéricos aquí
      GET: async (req) => {
        const params = extractListingParams(req.query)
        // Lógica genérica de GET
        return { success: true, data: [], pagination: {} }
      },
      POST: async (req) => {
        const sanitizedData = sanitizeInput(req.body)
        // Lógica genérica de POST
        return { success: true, data: {} }
      }
      // PUT, DELETE implementados de forma similar
    }
  )
}