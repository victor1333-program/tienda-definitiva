import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role === 'CUSTOMER') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // En el futuro, aquí eliminaríamos la notificación de la base de datos
    // await db.notification.delete({ where: { id: params.id } })

    return NextResponse.json({ 
      message: 'Notificación eliminada correctamente',
      id: params.id 
    })

  } catch (error) {
    console.error('Error deleting notification:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}