import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db';
import { withRateLimit, rateLimitConfigs } from '@/lib/rate-limit'
import { validateBody } from '@/lib/validation'
import { apiSecurityHeaders } from '@/lib/security-headers'
import { logAuthFailure } from '@/lib/security-logger'
import { z } from 'zod'

const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token requerido')
})

async function verifyEmailHandler(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar datos de entrada
    const validation = validateBody(verifyEmailSchema)(body)
    if (!validation.success) {
      logAuthFailure(request, { errors: validation.errors, action: 'email_verification' })
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

    if (!verificationToken) {
      logAuthFailure(request, { reason: 'invalid_verification_token', token: token.slice(0, 8) })
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
      
      logAuthFailure(request, { reason: 'expired_verification_token', userId: verificationToken.userId })
      return apiSecurityHeaders(NextResponse.json(
        { message: 'Token de verificación expirado. Solicita uno nuevo.' },
        { status: 400 }
      ))
    }

    // Verificar el email del usuario
    await db.user.update({
      where: { id: verificationToken.userId },
      data: { 
        emailVerified: new Date(),
        isActive: true // Activar cuenta al verificar email
      }
    })

    // Eliminar el token usado
    await db.verificationToken.delete({
      where: { token }
    })

    // Log del éxito
    // Email verified successfully

    return apiSecurityHeaders(NextResponse.json(
      { 
        message: 'Email verificado correctamente. Tu cuenta está ahora activa.',
        verified: true
      },
      { status: 200 }
    ))

  } catch (error) {
    console.error('Error verifying email:', error)
    logAuthFailure(request, { error: error instanceof Error ? error.message : 'unknown', action: 'email_verification' })

    return apiSecurityHeaders(NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    ))
  } finally {
    await db.$disconnect()
  }
}

export const POST = withRateLimit(rateLimitConfigs.auth, verifyEmailHandler)