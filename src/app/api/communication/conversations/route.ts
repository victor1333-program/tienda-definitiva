import { NextRequest, NextResponse } from "next/server"
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"

interface Conversation {
  id: string
  participants: {
    id: string
    name: string
    avatar?: string
    role: string
    isOnline: boolean
    lastSeen?: string
  }[]
  lastMessage: {
    id: string
    senderId: string
    senderName: string
    content: string
    timestamp: string
    isRead: boolean
    type: string
  }
  unreadCount: number
  isPinned: boolean
  isArchived: boolean
  tags: string[]
  priority: 'low' | 'medium' | 'high' | 'urgent'
  type: 'direct' | 'group' | 'support'
  title?: string
}

// GET conversations
export async function GET() {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Mock conversations for demo
    const conversations: Conversation[] = [
      {
        id: "conv-1",
        participants: [
          {
            id: "user-1",
            name: "María González",
            avatar: "/avatars/maria.jpg",
            role: "Diseñadora",
            isOnline: true,
            lastSeen: "Ahora"
          }
        ],
        lastMessage: {
          id: "msg-1",
          senderId: "user-1",
          senderName: "María González",
          content: "¿Podrías revisar los diseños que envié? Necesito feedback urgente.",
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          isRead: false,
          type: "text"
        },
        unreadCount: 3,
        isPinned: true,
        isArchived: false,
        tags: ["diseño", "urgente"],
        priority: "high",
        type: "direct"
      },
      {
        id: "conv-2",
        participants: [
          {
            id: "user-2",
            name: "Carlos Ruiz",
            avatar: "/avatars/carlos.jpg",
            role: "Operario Producción",
            isOnline: false,
            lastSeen: "hace 15 min"
          }
        ],
        lastMessage: {
          id: "msg-2",
          senderId: "admin-1",
          senderName: "Administrador",
          content: "Perfecto, mañana revisamos el proceso de sublimación.",
          timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          isRead: true,
          type: "text"
        },
        unreadCount: 0,
        isPinned: false,
        isArchived: false,
        tags: ["producción"],
        priority: "medium",
        type: "direct"
      },
      {
        id: "conv-3",
        participants: [
          {
            id: "user-3",
            name: "Ana López",
            avatar: "/avatars/ana.jpg",
            role: "Atención al Cliente",
            isOnline: true,
            lastSeen: "Ahora"
          },
          {
            id: "user-4",
            name: "Luis Martín",
            avatar: "/avatars/luis.jpg",
            role: "Soporte Técnico",
            isOnline: true,
            lastSeen: "Ahora"
          }
        ],
        lastMessage: {
          id: "msg-3",
          senderId: "user-3",
          senderName: "Ana López",
          content: "El cliente está muy satisfecho con la solución, gracias por la ayuda.",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          isRead: false,
          type: "text"
        },
        unreadCount: 1,
        isPinned: false,
        isArchived: false,
        tags: ["soporte", "cliente"],
        priority: "medium",
        type: "group",
        title: "Equipo de Soporte"
      },
      {
        id: "conv-4",
        participants: [
          {
            id: "user-5",
            name: "Carmen Jiménez",
            avatar: "/avatars/carmen.jpg",
            role: "Gerente Ventas",
            isOnline: false,
            lastSeen: "hace 2 horas"
          }
        ],
        lastMessage: {
          id: "msg-4",
          senderId: "user-5",
          senderName: "Carmen Jiménez",
          content: "Los números de este mes son excelentes, superamos el objetivo en un 15%.",
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          isRead: true,
          type: "text"
        },
        unreadCount: 0,
        isPinned: false,
        isArchived: false,
        tags: ["ventas", "reportes"],
        priority: "low",
        type: "direct"
      },
      {
        id: "conv-5",
        participants: [
          {
            id: "customer-1",
            name: "Cliente: Pedro Castillo",
            avatar: "/avatars/pedro.jpg",
            role: "Cliente",
            isOnline: false,
            lastSeen: "hace 1 hora"
          }
        ],
        lastMessage: {
          id: "msg-5",
          senderId: "customer-1",
          senderName: "Pedro Castillo",
          content: "Hola, tengo una consulta sobre mi pedido #ORD-2024-1045",
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          isRead: false,
          type: "text"
        },
        unreadCount: 2,
        isPinned: false,
        isArchived: false,
        tags: ["cliente", "consulta"],
        priority: "urgent",
        type: "support"
      },
      {
        id: "conv-6",
        participants: [
          {
            id: "user-6",
            name: "Sofía Morales",
            avatar: "/avatars/sofia.jpg",
            role: "Control de Calidad",
            isOnline: true,
            lastSeen: "Ahora"
          }
        ],
        lastMessage: {
          id: "msg-6",
          senderId: "user-6",
          senderName: "Sofía Morales",
          content: "Detecté un problema menor en el lote TZ-2024-034, ya está solucionado.",
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          isRead: true,
          type: "text"
        },
        unreadCount: 0,
        isPinned: false,
        isArchived: false,
        tags: ["calidad", "producción"],
        priority: "medium",
        type: "direct"
      }
    ]

    // Sort by last message timestamp (most recent first)
    conversations.sort((a, b) => 
      new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime()
    )

    return NextResponse.json(conversations)

  } catch (error) {
    console.error("Error fetching conversations:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// POST - Create new conversation
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { type, participantIds, title } = await request.json()

    // In a real implementation, you would:
    // 1. Validate participant IDs
    // 2. Create conversation in database
    // 3. Add initial system message
    // 4. Set up real-time subscriptions

    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      participants: [
        {
          id: "new-user",
          name: "Nuevo Usuario",
          role: "Usuario",
          isOnline: false,
          lastSeen: "Nunca"
        }
      ],
      lastMessage: {
        id: `msg-${Date.now()}`,
        senderId: "system",
        senderName: "Sistema",
        content: "Conversación iniciada",
        timestamp: new Date().toISOString(),
        isRead: true,
        type: "system"
      },
      unreadCount: 0,
      isPinned: false,
      isArchived: false,
      tags: [],
      priority: "medium",
      type: type || "direct",
      title
    }

    return NextResponse.json(newConversation)

  } catch (error) {
    console.error("Error creating conversation:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}