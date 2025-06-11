import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'
import bcryptjs from 'bcryptjs'

// POST: Restablecer contraseña
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, password, confirmPassword } = body

    // Validaciones
    if (!token || !password || !confirmPassword) {
      return NextResponse.json(
        { error: 'Token, contraseña y confirmación son requeridos' },
        { status: 400 }
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Las contraseñas no coinciden' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
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

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Hashear nueva contraseña
    const hashedPassword = await bcryptjs.hash(password, 12)

    // Usar transacción para actualizar contraseña y eliminar token
    await prisma.$transaction(async (tx) => {
      // Actualizar contraseña
      await tx.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      })

      // Eliminar token usado
      await tx.verificationToken.delete({
        where: { token }
      })

      // Eliminar todas las sesiones activas del usuario para mayor seguridad
      await tx.session.deleteMany({
        where: { userId: user.id }
      })
    })

    return NextResponse.json({
      message: 'Contraseña restablecida exitosamente'
    })

  } catch (error) {
    console.error('Error resetting password:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}