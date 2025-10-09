import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db';
import { withRateLimit, rateLimitConfigs } from '@/lib/rate-limit'
import { validateBody, emailSchema } from '@/lib/validation'
import { apiSecurityHeaders } from '@/lib/security-headers'
import { logAuthFailure } from '@/lib/security-logger'
import { sendEmailVerification } from '@/lib/email-service'
import { z } from 'zod'
import crypto from 'crypto'

const resendVerificationSchema = z.object({
  email: emailSchema
})

async function resendVerificationHandler(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar datos de entrada
    const validation = validateBody(resendVerificationSchema)(body)
    if (!validation.success) {
      logAuthFailure(request, { errors: validation.errors, action: 'resend_verification' })
      return apiSecurityHeaders(NextResponse.json(
        { message: validation.errors[0] },
        { status: 400 }
      ))
    }

    const { email } = validation.data

    // Buscar usuario
    const user = await db.user.findUnique({
      where: { email }
    })

    if (!user) {
      // Por seguridad, no revelamos si el email existe o no
      return apiSecurityHeaders(NextResponse.json(
        { message: 'Si el email existe, se enviará un correo de verificación.' },
        { status: 200 }
      ))
    }

    // Verificar si ya está verificado
    if (user.emailVerified) {
      return apiSecurityHeaders(NextResponse.json(
        { message: 'Este email ya está verificado.' },
        { status: 400 }
      ))
    }

    // Verificar límite de reenvíos (máximo 3 por hora)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const recentTokens = await db.verificationToken.count({
      where: {
        userId: user.id,
        createdAt: { gte: oneHourAgo }
      }
    })

    if (recentTokens >= 3) {
      logAuthFailure(request, { reason: 'too_many_verification_requests', email })
      return apiSecurityHeaders(NextResponse.json(
        { message: 'Demasiados intentos. Espera una hora antes de solicitar otro código.' },
        { status: 429 }
      ))
    }

    // Eliminar tokens de verificación existentes para este usuario
    await db.verificationToken.deleteMany({
      where: { userId: user.id }
    })

    // Generar nuevo token
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas

    // Crear nuevo token de verificación
    await db.verificationToken.create({
      data: {
        token,
        userId: user.id,
        expires,
        type: 'EMAIL_VERIFICATION'
      }
    })

    // Enviar email de verificación
    try {
      await sendEmailVerification({
        to: user.email,
        name: user.name,
        verificationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${token}`
      })
    } catch (emailError) {
      console.error('Error sending verification email:', emailError)
      
      // Eliminar token si no se pudo enviar el email
      await db.verificationToken.delete({
        where: { token }
      })

      return apiSecurityHeaders(NextResponse.json(
        { message: 'Error al enviar el email de verificación. Inténtalo más tarde.' },
        { status: 500 }
      ))
    }

    // Verification email resent

    return apiSecurityHeaders(NextResponse.json(
      { 
        message: 'Se ha enviado un nuevo email de verificación. Revisa tu bandeja de entrada.',
        sent: true
      },
      { status: 200 }
    ))

  } catch (error) {
    console.error('Error resending verification email:', error)
    logAuthFailure(request, { error: error instanceof Error ? error.message : 'unknown', action: 'resend_verification' })

    return apiSecurityHeaders(NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    ))
  } finally {
    await db.$disconnect()
  }
}

export const POST = withRateLimit(rateLimitConfigs.auth, resendVerificationHandler)