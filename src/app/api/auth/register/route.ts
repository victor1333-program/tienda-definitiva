import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { withRateLimit, rateLimitConfigs } from '@/lib/rate-limit'
import { validateBody, userRegistrationSchema } from '@/lib/validation'
import { apiSecurityHeaders } from '@/lib/security-headers'
import { logAuthFailure } from '@/lib/security-logger'
import { sendEmailVerification } from '@/lib/email-service'
import crypto from 'crypto'

async function registerHandler(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar datos de entrada con sanitización
    const validation = validateBody(userRegistrationSchema)(body)
    if (!validation.success) {
      logAuthFailure(request, { errors: validation.errors, email: body?.email })
      return apiSecurityHeaders(NextResponse.json(
        { message: validation.errors[0] },
        { status: 400 }
      ))
    }
    
    const validatedData = validation.data
    
    // Verificar si el usuario ya existe
    const existingUser = await db.user.findUnique({
      where: {
        email: validatedData.email
      }
    })

    if (existingUser) {
      logAuthFailure(request, { reason: 'email_already_exists', email: validatedData.email })
      return apiSecurityHeaders(NextResponse.json(
        { message: 'Ya existe una cuenta con este email' },
        { status: 400 }
      ))
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    // Crear usuario (inactivo hasta verificar email)
    const user = await db.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        phone: validatedData.phone,
        role: 'CUSTOMER',
        isActive: false, // Inactivo hasta verificar email
        emailVerified: null
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
        createdAt: true
      }
    })

    // Generar token de verificación
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas

    await db.verificationToken.create({
      data: {
        token: verificationToken,
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
        verificationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${verificationToken}`
      })
    } catch (emailError) {
      console.error('Error sending verification email:', emailError)
      // No fallar el registro si no se puede enviar el email
      // El usuario puede solicitar reenvío después
    }

    return apiSecurityHeaders(NextResponse.json(
      { 
        message: 'Cuenta creada exitosamente. Se ha enviado un email de verificación a tu correo.',
        user,
        requiresVerification: true
      },
      { status: 201 }
    ))

  } catch (error) {
    console.error('Error al crear usuario:', error)
    logAuthFailure(request, { error: error instanceof Error ? error.message : 'unknown' })

    return apiSecurityHeaders(NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    ))
  }
}

// Aplicar rate limiting
export const POST = withRateLimit(rateLimitConfigs.auth, registerHandler)