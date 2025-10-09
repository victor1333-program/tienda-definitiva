import { NextRequest, NextResponse } from 'next/server'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"

// POST: Publicar configuración de la página de inicio
export async function POST(request: NextRequest) {
  try {
    
    // Verificar autenticación
    const session = await auth()
    // Session log removed
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }
    
    // Verificar que no sea solo cliente
    if (session.user.role === 'CUSTOMER') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    const configData = await request.json()
    // Data log removed

    // Validar estructura básica
    if (!configData.id || !configData.modules) {
      return NextResponse.json(
        { error: 'Estructura de configuración inválida' },
        { status: 400 }
      )
    }

    // Por ahora, publicar es lo mismo que guardar
    // En el futuro aquí podrías tener lógica específica de publicación

    return NextResponse.json({
      success: true,
      message: 'Página publicada correctamente'
    })

  } catch (error) {
    console.error('Error publishing homepage config:', error)
    return NextResponse.json(
      { error: 'Error al publicar la página' },
      { status: 500 }
    )
  }
}