import { NextRequest, NextResponse } from 'next/server'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db } from '@/lib/db'
import { withRateLimit, rateLimitConfigs } from '@/lib/rate-limit'
import { validateBody, emailSchema } from '@/lib/validation'
import { apiSecurityHeaders } from '@/lib/security-headers'
import { logAuthFailure } from '@/lib/security-logger'
import { sendEmailVerification } from '@/lib/email-service'
import { z } from 'zod'
import crypto from 'crypto'

const changeEmailSchema = z.object({
  newEmail: emailSchema,
  password: z.string().min(1, 'Contraseña requerida para confirmar el cambio')
})

async function changeEmailHandler(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await auth()
    if (!session?.user?.id) {
      logAuthFailure(request, { reason: 'unauthenticated', action: 'change_email' })
      return apiSecurityHeaders(NextResponse.json(
        { message: 'No autenticado' },
        { status: 401 }
      ))
    }

    const body = await request.json()
    
    // Validar datos de entrada
    const validation = validateBody(changeEmailSchema)(body)
    if (!validation.success) {
      logAuthFailure(request, { errors: validation.errors, userId: session.user.id, action: 'change_email' })
      return apiSecurityHeaders(NextResponse.json(
        { message: validation.errors[0] },
        { status: 400 }
      ))
    }

    const { newEmail, password } = validation.data

    // Obtener usuario actual
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, password: true, name: true }
    })

    if (!user || !user.password) {
      logAuthFailure(request, { reason: 'user_not_found', userId: session.user.id, action: 'change_email' })
      return apiSecurityHeaders(NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      ))
    }

    // Verificar que el nuevo email sea diferente
    if (user.email === newEmail) {
      return apiSecurityHeaders(NextResponse.json(
        { message: 'El nuevo email debe ser diferente al actual' },
        { status: 400 }
      ))
    }

    // Verificar contraseña
    const bcrypt = require('bcryptjs')
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      logAuthFailure(request, { reason: 'invalid_password', userId: session.user.id, action: 'change_email' })
      return apiSecurityHeaders(NextResponse.json(
        { message: 'Contraseña incorrecta' },
        { status: 400 }
      ))
    }

    // Verificar que el nuevo email no esté en uso
    const existingUser = await db.user.findUnique({
      where: { email: newEmail }
    })

    if (existingUser) {
      logAuthFailure(request, { reason: 'email_already_exists', email: newEmail, userId: session.user.id, action: 'change_email' })
      return apiSecurityHeaders(NextResponse.json(
        { message: 'Este email ya está en uso por otra cuenta' },
        { status: 400 }
      ))
    }

    // Generar token de verificación para el nuevo email
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas

    // Eliminar tokens de verificación existentes para este usuario
    await db.verificationToken.deleteMany({
      where: { userId: user.id, type: 'EMAIL_CHANGE' }
    })

    // Crear nuevo token de verificación
    await db.verificationToken.create({
      data: {
        token: verificationToken,
        userId: user.id,
        expires,
        type: 'EMAIL_CHANGE',
        identifier: newEmail // Guardar el nuevo email en el token
      }
    })

    // Enviar email de verificación al nuevo email
    try {
      await sendEmailVerification({
        to: newEmail,
        name: user.name,
        verificationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email-change?token=${verificationToken}`
      })
    } catch (emailError) {
      console.error('Error sending email change verification:', emailError)
      
      // Eliminar token si no se pudo enviar el email
      await db.verificationToken.delete({
        where: { token: verificationToken }
      })

      return apiSecurityHeaders(NextResponse.json(
        { message: 'Error al enviar el email de verificación. Inténtalo más tarde.' },
        { status: 500 }
      ))
    }

    // Email change verification sent

    return apiSecurityHeaders(NextResponse.json(
      { 
        message: `Se ha enviado un email de verificación a ${newEmail}. Confirma el cambio desde tu nuevo email.`,
        pendingEmail: newEmail,
        requiresVerification: true
      },
      { status: 200 }
    ))

  } catch (error) {
    console.error('Error changing email:', error)
    logAuthFailure(request, { error: error instanceof Error ? error.message : 'unknown', action: 'change_email' })

    return apiSecurityHeaders(NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    ))
  } finally {
    await db.$disconnect()
  }
}

export const POST = withRateLimit(rateLimitConfigs.auth, changeEmailHandler)