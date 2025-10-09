import { NextRequest, NextResponse } from 'next/server'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { notificationService } from '@/lib/notifications'
import { withRateLimit, rateLimitConfigs } from '@/lib/rate-limit'
import { apiSecurityHeaders } from '@/lib/security-headers'

async function markAllAsReadHandler(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await auth()
    if (!session?.user?.id) {
      return apiSecurityHeaders(NextResponse.json(
        { message: 'No autenticado' },
        { status: 401 }
      ))
    }

    // Marcar todas como leídas
    const success = await notificationService.markAllAsRead(session.user.id)

    if (!success) {
      return apiSecurityHeaders(NextResponse.json(
        { message: 'Error al marcar las notificaciones como leídas' },
        { status: 500 }
      ))
    }

    return apiSecurityHeaders(NextResponse.json(
      { message: 'Todas las notificaciones marcadas como leídas' },
      { status: 200 }
    ))

  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    return apiSecurityHeaders(NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    ))
  }
}

export const POST = withRateLimit(rateLimitConfigs.api, markAllAsReadHandler)
export const PATCH = withRateLimit(rateLimitConfigs.api, markAllAsReadHandler)