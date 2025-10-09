import { NextRequest, NextResponse } from "next/server"
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"

interface Message {
  id: string
  senderId: string
  senderName: string
  senderAvatar?: string
  content: string
  timestamp: string
  isRead: boolean
  type: 'text' | 'image' | 'file' | 'system'
  attachments?: {
    id: string
    name: string
    type: string
    size: number
    url: string
  }[]
}

// GET messages for a conversation
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get("conversationId")

    if (!conversationId) {
      return NextResponse.json({ error: "ID de conversación requerido" }, { status: 400 })
    }

    // Mock messages for different conversations
    const messagesByConversation: Record<string, Message[]> = {
      "conv-1": [
        {
          id: "msg-1-1",
          senderId: "admin-1",
          senderName: "Administrador",
          content: "Hola María, ¿en qué puedo ayudarte?",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          isRead: true,
          type: "text"
        },
        {
          id: "msg-1-2",
          senderId: "user-1",
          senderName: "María González",
          senderAvatar: "/avatars/maria.jpg",
          content: "Necesito que revises los nuevos diseños que hice para la colección de primavera.",
          timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
          isRead: true,
          type: "text"
        },
        {
          id: "msg-1-3",
          senderId: "user-1",
          senderName: "María González",
          senderAvatar: "/avatars/maria.jpg",
          content: "Te envío los archivos en alta resolución.",
          timestamp: new Date(Date.now() - 85 * 60 * 1000).toISOString(),
          isRead: true,
          type: "text",
          attachments: [
            {
              id: "att-1",
              name: "disenos-primavera-2024.zip",
              type: "application/zip",
              size: 15680000,
              url: "/files/disenos-primavera-2024.zip"
            }
          ]
        },
        {
          id: "msg-1-4",
          senderId: "admin-1",
          senderName: "Administrador",
          content: "Perfecto, los revisaré esta tarde y te doy feedback mañana temprano.",
          timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          isRead: true,
          type: "text"
        },
        {
          id: "msg-1-5",
          senderId: "user-1",
          senderName: "María González",
          senderAvatar: "/avatars/maria.jpg",
          content: "¿Podrías revisar los diseños que envié? Necesito feedback urgente.",
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          isRead: false,
          type: "text"
        }
      ],
      "conv-2": [
        {
          id: "msg-2-1",
          senderId: "user-2",
          senderName: "Carlos Ruiz",
          senderAvatar: "/avatars/carlos.jpg",
          content: "Buenos días, tengo una consulta sobre el proceso de sublimación.",
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          isRead: true,
          type: "text"
        },
        {
          id: "msg-2-2",
          senderId: "admin-1",
          senderName: "Administrador",
          content: "Dime Carlos, ¿qué necesitas saber?",
          timestamp: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
          isRead: true,
          type: "text"
        },
        {
          id: "msg-2-3",
          senderId: "user-2",
          senderName: "Carlos Ruiz",
          senderAvatar: "/avatars/carlos.jpg",
          content: "Las tazas del lote TZ-2024-035 están saliendo con la tinta un poco clara. ¿Subimos la temperatura?",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          isRead: true,
          type: "text"
        },
        {
          id: "msg-2-4",
          senderId: "admin-1",
          senderName: "Administrador",
          content: "Sí, sube la temperatura a 200°C y aumenta el tiempo a 60 segundos. También verifica que la presión esté en 4 bar.",
          timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
          isRead: true,
          type: "text"
        },
        {
          id: "msg-2-5",
          senderId: "admin-1",
          senderName: "Administrador",
          content: "Perfecto, mañana revisamos el proceso de sublimación.",
          timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          isRead: true,
          type: "text"
        }
      ],
      "conv-3": [
        {
          id: "msg-3-1",
          senderId: "user-3",
          senderName: "Ana López",
          senderAvatar: "/avatars/ana.jpg",
          content: "Hola equipo, tenemos un cliente con un problema técnico.",
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          isRead: true,
          type: "text"
        },
        {
          id: "msg-3-2",
          senderId: "user-4",
          senderName: "Luis Martín",
          senderAvatar: "/avatars/luis.jpg",
          content: "¿Qué tipo de problema? ¿Es con la web o con un pedido?",
          timestamp: new Date(Date.now() - 3.8 * 60 * 60 * 1000).toISOString(),
          isRead: true,
          type: "text"
        },
        {
          id: "msg-3-3",
          senderId: "user-3",
          senderName: "Ana López",
          senderAvatar: "/avatars/ana.jpg",
          content: "No puede subir su diseño personalizado, dice que le da error cuando intenta guardar.",
          timestamp: new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString(),
          isRead: true,
          type: "text"
        },
        {
          id: "msg-3-4",
          senderId: "user-4",
          senderName: "Luis Martín",
          senderAvatar: "/avatars/luis.jpg",
          content: "Ya veo el problema. Es el límite de tamaño de archivo. Le mandaré instrucciones para comprimir la imagen.",
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          isRead: true,
          type: "text"
        },
        {
          id: "msg-3-5",
          senderId: "user-3",
          senderName: "Ana López",
          senderAvatar: "/avatars/ana.jpg",
          content: "El cliente está muy satisfecho con la solución, gracias por la ayuda.",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          isRead: false,
          type: "text"
        }
      ],
      "conv-4": [
        {
          id: "msg-4-1",
          senderId: "user-5",
          senderName: "Carmen Jiménez",
          senderAvatar: "/avatars/carmen.jpg",
          content: "Hola, quiero compartir los resultados de ventas de este mes.",
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          isRead: true,
          type: "text"
        },
        {
          id: "msg-4-2",
          senderId: "admin-1",
          senderName: "Administrador",
          content: "Perfecto Carmen, ¿qué tal han ido?",
          timestamp: new Date(Date.now() - 4.5 * 60 * 60 * 1000).toISOString(),
          isRead: true,
          type: "text"
        },
        {
          id: "msg-4-3",
          senderId: "user-5",
          senderName: "Carmen Jiménez",
          senderAvatar: "/avatars/carmen.jpg",
          content: "Los números de este mes son excelentes, superamos el objetivo en un 15%.",
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          isRead: true,
          type: "text"
        }
      ],
      "conv-5": [
        {
          id: "msg-5-1",
          senderId: "customer-1",
          senderName: "Pedro Castillo",
          senderAvatar: "/avatars/pedro.jpg",
          content: "Hola, tengo una consulta sobre mi pedido #ORD-2024-1045",
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          isRead: false,
          type: "text"
        },
        {
          id: "msg-5-2",
          senderId: "customer-1",
          senderName: "Pedro Castillo",
          senderAvatar: "/avatars/pedro.jpg",
          content: "Hice el pedido hace 3 días y aún no he recibido confirmación del envío.",
          timestamp: new Date(Date.now() - 5.5 * 60 * 60 * 1000).toISOString(),
          isRead: false,
          type: "text"
        }
      ],
      "conv-6": [
        {
          id: "msg-6-1",
          senderId: "user-6",
          senderName: "Sofía Morales",
          senderAvatar: "/avatars/sofia.jpg",
          content: "Detecté un problema menor en el lote TZ-2024-034, ya está solucionado.",
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          isRead: true,
          type: "text"
        }
      ]
    }

    const messages = messagesByConversation[conversationId] || []
    
    // Sort messages by timestamp (oldest first)
    messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

    return NextResponse.json(messages)

  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// POST - Send new message
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { conversationId, content, type = 'text', attachments } = await request.json()

    if (!conversationId || !content) {
      return NextResponse.json(
        { error: "ID de conversación y contenido son requeridos" },
        { status: 400 }
      )
    }

    // In a real implementation, you would:
    // 1. Save message to database
    // 2. Send real-time notifications to participants
    // 3. Update conversation last message
    // 4. Handle file uploads for attachments
    // 5. Send push notifications or emails

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: session.user.id || "admin-1",
      senderName: session.user.name || "Administrador",
      senderAvatar: session.user.image,
      content,
      timestamp: new Date().toISOString(),
      isRead: false,
      type,
      attachments
    }

    // Simulate message sending delay
    await new Promise(resolve => setTimeout(resolve, 300))

    return NextResponse.json(newMessage)

  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}