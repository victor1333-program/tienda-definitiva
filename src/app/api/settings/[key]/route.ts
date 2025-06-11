import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db as prisma } from '@/lib/db'

interface Params {
  params: {
    key: string
  }
}

// GET: Obtener configuración por clave
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role === 'CUSTOMER') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const setting = await prisma.setting.findUnique({
      where: { key: params.key }
    })

    if (!setting) {
      return NextResponse.json(
        { error: 'Configuración no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({ setting })

  } catch (error) {
    console.error('Error fetching setting:', error)
    return NextResponse.json(
      { error: 'Error al obtener configuración' },
      { status: 500 }
    )
  }
}

// PATCH: Actualizar configuración
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role === 'CUSTOMER') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { value } = body

    if (value === undefined) {
      return NextResponse.json(
        { error: 'Valor es requerido' },
        { status: 400 }
      )
    }

    // Actualizar o crear configuración
    const setting = await prisma.setting.upsert({
      where: { key: params.key },
      update: { value },
      create: { key: params.key, value }
    })

    return NextResponse.json({
      setting,
      message: 'Configuración actualizada correctamente'
    })

  } catch (error) {
    console.error('Error updating setting:', error)
    return NextResponse.json(
      { error: 'Error al actualizar configuración' },
      { status: 500 }
    )
  }
}

// DELETE: Eliminar configuración
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const existingSetting = await prisma.setting.findUnique({
      where: { key: params.key }
    })

    if (!existingSetting) {
      return NextResponse.json(
        { error: 'Configuración no encontrada' },
        { status: 404 }
      )
    }

    await prisma.setting.delete({
      where: { key: params.key }
    })

    return NextResponse.json({
      message: 'Configuración eliminada correctamente'
    })

  } catch (error) {
    console.error('Error deleting setting:', error)
    return NextResponse.json(
      { error: 'Error al eliminar configuración' },
      { status: 500 }
    )
  }
}