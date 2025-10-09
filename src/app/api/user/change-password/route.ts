import { NextRequest, NextResponse } from 'next/server'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { withRateLimit, rateLimitConfigs } from '@/lib/rate-limit'
import { validateBody } from '@/lib/validation'
import { apiSecurityHeaders } from '@/lib/security-headers'
import { logAuthFailure } from '@/lib/security-logger'
import { z } from 'zod'

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Contraseña actual requerida'),
  newPassword: z.string()
    .min(8, 'La nueva contraseña debe tener al menos 8 caracteres')
    .max(128, 'La nueva contraseña es demasiado larga')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'La nueva contraseña debe tener al menos una mayúscula, una minúscula y un número'),
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword']
})

async function changePasswordHandler(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await auth()
    if (!session?.user?.id) {
      logAuthFailure(request, { reason: 'unauthenticated', action: 'change_password' })
      return apiSecurityHeaders(NextResponse.json(
        { message: 'No autenticado' },
        { status: 401 }
      ))
    }

    const body = await request.json()
    
    // Validar datos de entrada
    const validation = validateBody(changePasswordSchema)(body)
    if (!validation.success) {
      logAuthFailure(request, { errors: validation.errors, userId: session.user.id, action: 'change_password' })
      return apiSecurityHeaders(NextResponse.json(
        { message: validation.errors[0] },
        { status: 400 }
      ))
    }

    const { currentPassword, newPassword } = validation.data

    // Obtener usuario actual
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, password: true, email: true }
    })

    if (!user || !user.password) {
      logAuthFailure(request, { reason: 'user_not_found', userId: session.user.id, action: 'change_password' })
      return apiSecurityHeaders(NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      ))
    }

    // Verificar contraseña actual
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      logAuthFailure(request, { reason: 'invalid_current_password', userId: session.user.id, action: 'change_password' })
      return apiSecurityHeaders(NextResponse.json(
        { message: 'La contraseña actual es incorrecta' },
        { status: 400 }
      ))
    }

    // Verificar que la nueva contraseña sea diferente
    const isSamePassword = await bcrypt.compare(newPassword, user.password)
    if (isSamePassword) {
      return apiSecurityHeaders(NextResponse.json(
        { message: 'La nueva contraseña debe ser diferente a la actual' },
        { status: 400 }
      ))
    }

    // Encriptar nueva contraseña
    const hashedNewPassword = await bcrypt.hash(newPassword, 12)

    // Actualizar contraseña
    await db.user.update({
      where: { id: user.id },
      data: { 
        password: hashedNewPassword,
        updatedAt: new Date()
      }
    })

    // Password changed successfully

    return apiSecurityHeaders(NextResponse.json(
      { message: 'Contraseña actualizada correctamente' },
      { status: 200 }
    ))

  } catch (error) {
    console.error('Error changing password:', error)
    logAuthFailure(request, { error: error instanceof Error ? error.message : 'unknown', action: 'change_password' })

    return apiSecurityHeaders(NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    ))
  } finally {
    await db.$disconnect()
  }
}

export const POST = withRateLimit(rateLimitConfigs.auth, changePasswordHandler)