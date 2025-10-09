import { NextRequest, NextResponse } from 'next/server'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { notificationService } from '@/lib/notifications'
import { withRateLimit, rateLimitConfigs } from '@/lib/rate-limit'
import { apiSecurityHeaders } from '@/lib/security-headers'
import { validateQuery } from '@/lib/validation'
import { z } from 'zod'

// Schema para query parameters
const getNotificationsSchema = z.object({
  limit: z.string().optional().transform(val => val ? parseInt(val) : 20),
  offset: z.string().optional().transform(val => val ? parseInt(val) : 0),
  unreadOnly: z.string().optional().transform(val => val === 'true'),
  types: z.string().optional().transform(val => val ? val.split(',') : [])
})

async function getNotificationsHandler(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await auth()
    if (!session?.user?.id) {
      return apiSecurityHeaders(NextResponse.json(
        { message: 'No autenticado' },
        { status: 401 }
      ))
    }

    // Validar query parameters
    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    
    const validation = validateQuery(getNotificationsSchema)(queryParams)
    if (!validation.success) {
      return apiSecurityHeaders(NextResponse.json(
        { message: validation.errors[0] },
        { status: 400 }
      ))
    }

    const { limit, offset, unreadOnly, types } = validation.data

    // Obtener notificaciones según el rol del usuario
    let notifications
    if (session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN') {
      notifications = await notificationService.getForAdmins({
        limit,
        offset,
        unreadOnly,
        types: types as any[]
      })
    } else {
      notifications = await notificationService.getForUser(session.user.id, {
        limit,
        offset,
        unreadOnly,
        types: types as any[]
      })
    }

    // Obtener conteo de no leídas
    const unreadCount = await notificationService.getUnreadCount(session.user.id)

    return apiSecurityHeaders(NextResponse.json({
      notifications,
      unreadCount,
      pagination: {
        limit,
        offset,
        hasMore: notifications.length === limit
      }
    }))

  } catch (error) {
    console.error('Error getting notifications:', error)
    return apiSecurityHeaders(NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    ))
  }
}

async function createNotificationHandler(request: NextRequest) {
  try {
    // Verificar autenticación y permisos de admin
    const session = await auth()
    if (!session?.user?.id || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return apiSecurityHeaders(NextResponse.json(
        { message: 'No autorizado' },
        { status: 403 }
      ))
    }

    const body = await request.json()
    const { type, title, message, priority, userId, metadata, actionUrl, expiresAt } = body

    // Validar datos requeridos
    if (!type || !title || !message) {
      return apiSecurityHeaders(NextResponse.json(
        { message: 'Faltan campos requeridos: type, title, message' },
        { status: 400 }
      ))
    }

    const notification = await notificationService.create({
      type,
      title,
      message,
      priority: priority || 'MEDIUM',
      userId,
      metadata,
      actionUrl,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined
    })

    return apiSecurityHeaders(NextResponse.json(notification, { status: 201 }))

  } catch (error) {
    console.error('Error creating notification:', error)
    return apiSecurityHeaders(NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    ))
  }
}

export const GET = withRateLimit(rateLimitConfigs.api, getNotificationsHandler)
export const POST = withRateLimit(rateLimitConfigs.api, createNotificationHandler)