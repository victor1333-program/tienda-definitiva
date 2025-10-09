import { NextRequest, NextResponse } from 'next/server'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db } from '@/lib/db'

// GET: Obtener tema actual
export async function GET() {
  try {
    // Buscar el tema en la base de datos o retornar valores por defecto
    const themeData = await db.setting.findFirst({
      where: { key: 'theme_config' }
    })

    const defaultTheme = {
      colors: {
        primary: '#f97316',
        secondary: '#ea580c',
        accent: '#fb923c',
        background: '#ffffff',
        text: '#1f2937',
        muted: '#6b7280'
      },
      typography: {
        fontFamily: 'Inter, sans-serif',
        headingFont: 'Inter, sans-serif',
        fontSize: {
          small: '14px',
          base: '16px',
          large: '18px',
          xl: '20px',
          '2xl': '24px',
          '3xl': '30px'
        }
      },
      layout: {
        borderRadius: '8px',
        spacing: '1rem',
        containerWidth: '1200px'
      },
      logo: {
        primary: '/img/Logo.png',
        secondary: '/img/Social_Logo.png',
        favicon: '/favicon.ico'
      }
    }

    const theme = themeData ? JSON.parse(themeData.value) : defaultTheme

    return NextResponse.json({
      success: true,
      data: theme
    })

  } catch (error) {
    console.error('Error getting theme:', error)
    return NextResponse.json(
      { error: 'Error al obtener el tema' },
      { status: 500 }
    )
  }
}

// PUT: Actualizar tema
export async function PUT(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await auth()
    if (!session?.user || !['ADMIN', 'MANAGER'].includes(session.user.role || '')) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const themeData = await request.json()

    // Validar estructura básica del tema
    if (!themeData.colors || !themeData.typography || !themeData.layout) {
      return NextResponse.json(
        { error: 'Estructura de tema inválida' },
        { status: 400 }
      )
    }

    // Guardar o actualizar tema en la base de datos
    await db.setting.upsert({
      where: { key: 'theme_config' },
      update: {
        value: JSON.stringify(themeData),
        updatedAt: new Date()
      },
      create: {
        key: 'theme_config',
        value: JSON.stringify(themeData),
        type: 'JSON'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Tema guardado correctamente'
    })

  } catch (error) {
    console.error('Error saving theme:', error)
    return NextResponse.json(
      { error: 'Error al guardar el tema' },
      { status: 500 }
    )
  }
}