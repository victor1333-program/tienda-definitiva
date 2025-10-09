import { NextRequest, NextResponse } from "next/server"
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const session = await auth()
    
    if (!session?.user || session.user.role === 'CUSTOMER') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // En el futuro, aquí eliminaríamos la notificación de la base de datos
    // await db.notification.delete({ where: { id: id } })

    return NextResponse.json({ 
      message: 'Notificación eliminada correctamente',
      id: id 
    })

  } catch (error) {
    console.error('Error deleting notification:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}