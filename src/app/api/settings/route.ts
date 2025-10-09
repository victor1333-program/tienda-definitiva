import { NextRequest, NextResponse } from 'next/server'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db as prisma } from '@/lib/db'
import { validateData, settingSchema } from '@/lib/validation'

// GET: Obtener configuraciones
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role === 'CUSTOMER') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    if (key) {
      // Obtener configuración específica
      const setting = await prisma.setting.findUnique({
        where: { key }
      })

      if (!setting) {
        return NextResponse.json(
          { error: 'Configuración no encontrada' },
          { status: 404 }
        )
      }

      return NextResponse.json({ setting })
    } else {
      // Obtener todas las configuraciones
      const settings = await prisma.setting.findMany({
        orderBy: { key: 'asc' }
      })

      // Convertir a objeto para facilitar el uso
      const settingsObject = settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value
        return acc
      }, {} as any)

      return NextResponse.json({ 
        settings,
        settingsObject 
      })
    }

  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Error al obtener configuraciones' },
      { status: 500 }
    )
  }
}

// POST: Crear configuración
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validar datos
    const validation = validateData(settingSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.errors },
        { status: 400 }
      )
    }

    const { key, value } = validation.data

    // Verificar que la clave no existe
    const existingSetting = await prisma.setting.findUnique({
      where: { key }
    })

    if (existingSetting) {
      return NextResponse.json(
        { error: 'La configuración ya existe' },
        { status: 400 }
      )
    }

    // Crear configuración
    const setting = await prisma.setting.create({
      data: { key, value }
    })

    return NextResponse.json({
      setting,
      message: 'Configuración creada correctamente'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating setting:', error)
    return NextResponse.json(
      { error: 'Error al crear configuración' },
      { status: 500 }
    )
  }
}

// PATCH: Actualizar múltiples configuraciones
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role === 'CUSTOMER') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { settings } = body

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { error: 'Configuraciones son requeridas' },
        { status: 400 }
      )
    }

    // Actualizar múltiples configuraciones
    const updatePromises = Object.entries(settings).map(async ([key, value]) => {
      return prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value }
      })
    })

    const updatedSettings = await Promise.all(updatePromises)

    return NextResponse.json({
      settings: updatedSettings,
      message: `${updatedSettings.length} configuración(es) actualizada(s)`
    })

  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Error al actualizar configuraciones' },
      { status: 500 }
    )
  }
}