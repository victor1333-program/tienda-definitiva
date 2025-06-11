import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Simulate test notification
    const testNotification = {
      id: `test-${Date.now()}`,
      type: 'info',
      category: 'system',
      title: 'Notificación de Prueba',
      message: `Prueba enviada exitosamente por ${session.user.name} a las ${new Date().toLocaleTimeString('es-ES')}`,
      actionRequired: false,
      isRead: false,
      createdAt: new Date().toISOString(),
      actionUrl: null
    }

    // In a real implementation, you would:
    // 1. Send email notification if enabled
    // 2. Store in database
    // 3. Trigger push notifications
    // 4. Send WhatsApp message if configured

    return NextResponse.json({ 
      success: true, 
      message: "Notificación de prueba enviada correctamente",
      notification: testNotification 
    })

  } catch (error) {
    console.error("Error sending test notification:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}