import { NextRequest, NextResponse } from 'next/server'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { notificationService } from '@/lib/notifications'
import { withRateLimit, rateLimitConfigs } from '@/lib/rate-limit'
import { apiSecurityHeaders } from '@/lib/security-headers'

async function markAsReadHandler(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    
    // Verificar autenticación
    const session = await auth()
    if (!session?.user?.id) {
      return apiSecurityHeaders(NextResponse.json(
        { message: 'No autenticado' },
        { status: 401 }
      ))
    }

    const notificationId = id

    if (!notificationId) {
      return apiSecurityHeaders(NextResponse.json(
        { message: 'ID de notificación requerido' },
        { status: 400 }
      ))
    }

    // Marcar como leída
    const success = await notificationService.markAsRead(
      notificationId, 
      session.user.role === 'CUSTOMER' ? session.user.id : undefined
    )

    if (!success) {
      return apiSecurityHeaders(NextResponse.json(
        { message: 'Notificación no encontrada o no autorizado' },
        { status: 404 }
      ))
    }

    return apiSecurityHeaders(NextResponse.json(
      { message: 'Notificación marcada como leída' },
      { status: 200 }
    ))

  } catch (error) {
    console.error('Error marking notification as read:', error)
    return apiSecurityHeaders(NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    ))
  }
}

export const POST = withRateLimit(rateLimitConfigs.api, markAsReadHandler)
export const PATCH = withRateLimit(rateLimitConfigs.api, markAsReadHandler)