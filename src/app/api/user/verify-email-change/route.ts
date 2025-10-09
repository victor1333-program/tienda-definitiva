import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db';
import { withRateLimit, rateLimitConfigs } from '@/lib/rate-limit'
import { validateBody } from '@/lib/validation'
import { apiSecurityHeaders } from '@/lib/security-headers'
import { logAuthFailure } from '@/lib/security-logger'
import { z } from 'zod'

const verifyEmailChangeSchema = z.object({
  token: z.string().min(1, 'Token requerido')
})

async function verifyEmailChangeHandler(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar datos de entrada
    const validation = validateBody(verifyEmailChangeSchema)(body)
    if (!validation.success) {
      logAuthFailure(request, { errors: validation.errors, action: 'verify_email_change' })
      return apiSecurityHeaders(NextResponse.json(
        { message: validation.errors[0] },
        { status: 400 }
      ))
    }

    const { token } = validation.data

    // Buscar el token de verificación
    const verificationToken = await db.verificationToken.findUnique({
      where: { token },
      include: { user: true }
    })

    if (!verificationToken || verificationToken.type !== 'EMAIL_CHANGE') {
      logAuthFailure(request, { reason: 'invalid_email_change_token', token: token.slice(0, 8) })
      return apiSecurityHeaders(NextResponse.json(
        { message: 'Token de verificación inválido o expirado' },
        { status: 400 }
      ))
    }

    // Verificar si el token ha expirado
    if (verificationToken.expires < new Date()) {
      // Eliminar token expirado
      await db.verificationToken.delete({
        where: { token }
      })
      
      logAuthFailure(request, { reason: 'expired_email_change_token', userId: verificationToken.userId })
      return apiSecurityHeaders(NextResponse.json(
        { message: 'Token de verificación expirado. Solicita uno nuevo desde tu perfil.' },
        { status: 400 }
      ))
    }

    // Verificar que el nuevo email no esté en uso
    const newEmail = verificationToken.identifier
    if (!newEmail) {
      logAuthFailure(request, { reason: 'missing_new_email', userId: verificationToken.userId })
      return apiSecurityHeaders(NextResponse.json(
        { message: 'Token inválido: falta información del nuevo email' },
        { status: 400 }
      ))
    }

    const existingUser = await db.user.findUnique({
      where: { email: newEmail }
    })

    if (existingUser) {
      // Eliminar token ya que el email está en uso
      await db.verificationToken.delete({
        where: { token }
      })
      
      logAuthFailure(request, { reason: 'email_already_taken', email: newEmail, userId: verificationToken.userId })
      return apiSecurityHeaders(NextResponse.json(
        { message: 'Este email ya está en uso por otra cuenta' },
        { status: 400 }
      ))
    }

    // Actualizar el email del usuario
    await db.user.update({
      where: { id: verificationToken.userId },
      data: { 
        email: newEmail,
        emailVerified: new Date(),
        updatedAt: new Date()
      }
    })

    // Eliminar el token usado
    await db.verificationToken.delete({
      where: { token }
    })

    // Log del éxito
    // Email changed successfully

    return apiSecurityHeaders(NextResponse.json(
      { 
        message: 'Email actualizado correctamente. Tu nueva dirección de email está ahora activa.',
        newEmail,
        verified: true
      },
      { status: 200 }
    ))

  } catch (error) {
    console.error('Error verifying email change:', error)
    logAuthFailure(request, { error: error instanceof Error ? error.message : 'unknown', action: 'verify_email_change' })

    return apiSecurityHeaders(NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    ))
  } finally {
    await db.$disconnect()
  }
}

export const POST = withRateLimit(rateLimitConfigs.auth, verifyEmailChangeHandler)