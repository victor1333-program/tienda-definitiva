import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'
import { sendPasswordResetEmail } from '@/lib/email'
import crypto from 'crypto'

// POST: Solicitar restablecimiento de contraseña
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      )
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Formato de email inválido' },
        { status: 400 }
      )
    }

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    // Por seguridad, siempre respondemos con éxito aunque el usuario no exista
    if (!user) {
      return NextResponse.json({
        message: 'Si el email existe en nuestro sistema, recibirás instrucciones para restablecer tu contraseña'
      })
    }

    // Generar token de restablecimiento
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date()
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1) // Expira en 1 hora

    // Guardar token en la base de datos
    await prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token: resetToken,
        expires: resetTokenExpiry
      }
    })

    // Enviar email de restablecimiento
    try {
      await sendPasswordResetEmail(user, resetToken)
    } catch (emailError) {
      console.error('Error sending password reset email:', emailError)
      // No fallar la request si no se puede enviar el email
    }

    return NextResponse.json({
      message: 'Si el email existe en nuestro sistema, recibirás instrucciones para restablecer tu contraseña'
    })

  } catch (error) {
    console.error('Error in forgot password:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// GET: Verificar token de restablecimiento
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Token es requerido' },
        { status: 400 }
      )
    }

    // Verificar que el token existe y no ha expirado
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token }
    })

    if (!verificationToken) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 400 }
      )
    }

    if (verificationToken.expires < new Date()) {
      // Eliminar token expirado
      await prisma.verificationToken.delete({
        where: { token }
      })

      return NextResponse.json(
        { error: 'Token expirado' },
        { status: 400 }
      )
    }

    // Buscar usuario asociado al token
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier },
      select: {
        id: true,
        email: true,
        name: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      valid: true,
      user: {
        email: user.email,
        name: user.name
      }
    })

  } catch (error) {
    console.error('Error verifying reset token:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}