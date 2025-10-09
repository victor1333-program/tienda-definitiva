import { NextRequest, NextResponse } from "next/server"
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"

interface Team {
  id: string
  name: string
  members: {
    id: string
    name: string
    avatar?: string
    role: string
    isOnline: boolean
    status: 'available' | 'busy' | 'away' | 'offline'
    lastSeen?: string
    department: string
  }[]
  department: string
  description: string
}

// GET teams and members
export async function GET() {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Mock teams structure for demo
    const teams: Team[] = [
      {
        id: "team-1",
        name: "Equipo de Diseño",
        department: "Creativo",
        description: "Responsables del diseño y creatividad de productos",
        members: [
          {
            id: "user-1",
            name: "María González",
            avatar: "/avatars/maria.jpg",
            role: "Diseñadora Senior",
            isOnline: true,
            status: "available",
            department: "Creativo"
          },
          {
            id: "user-7",
            name: "David Herrera",
            avatar: "/avatars/david.jpg",
            role: "Diseñador Gráfico",
            isOnline: true,
            status: "busy",
            department: "Creativo"
          },
          {
            id: "user-8",
            name: "Laura Fernández",
            avatar: "/avatars/laura.jpg",
            role: "Ilustradora",
            isOnline: false,
            status: "offline",
            lastSeen: "hace 2 horas",
            department: "Creativo"
          }
        ]
      },
      {
        id: "team-2",
        name: "Equipo de Producción",
        department: "Operaciones",
        description: "Responsables de la fabricación y control de calidad",
        members: [
          {
            id: "user-2",
            name: "Carlos Ruiz",
            avatar: "/avatars/carlos.jpg",
            role: "Operario Producción",
            isOnline: false,
            status: "away",
            lastSeen: "hace 15 min",
            department: "Operaciones"
          },
          {
            id: "user-6",
            name: "Sofía Morales",
            avatar: "/avatars/sofia.jpg",
            role: "Control de Calidad",
            isOnline: true,
            status: "available",
            department: "Operaciones"
          },
          {
            id: "user-9",
            name: "Miguel Torres",
            avatar: "/avatars/miguel.jpg",
            role: "Supervisor Producción",
            isOnline: true,
            status: "busy",
            department: "Operaciones"
          },
          {
            id: "user-10",
            name: "Elena Vargas",
            avatar: "/avatars/elena.jpg",
            role: "Técnico Maquinaria",
            isOnline: true,
            status: "available",
            department: "Operaciones"
          }
        ]
      },
      {
        id: "team-3",
        name: "Equipo de Atención al Cliente",
        department: "Servicio",
        description: "Soporte y atención a clientes",
        members: [
          {
            id: "user-3",
            name: "Ana López",
            avatar: "/avatars/ana.jpg",
            role: "Atención al Cliente",
            isOnline: true,
            status: "available",
            department: "Servicio"
          },
          {
            id: "user-4",
            name: "Luis Martín",
            avatar: "/avatars/luis.jpg",
            role: "Soporte Técnico",
            isOnline: true,
            status: "available",
            department: "Servicio"
          },
          {
            id: "user-11",
            name: "Patricia Romero",
            avatar: "/avatars/patricia.jpg",
            role: "Especialista CRM",
            isOnline: false,
            status: "offline",
            lastSeen: "hace 1 hora",
            department: "Servicio"
          }
        ]
      },
      {
        id: "team-4",
        name: "Equipo Comercial",
        department: "Ventas",
        description: "Ventas y desarrollo de negocio",
        members: [
          {
            id: "user-5",
            name: "Carmen Jiménez",
            avatar: "/avatars/carmen.jpg",
            role: "Gerente Ventas",
            isOnline: false,
            status: "away",
            lastSeen: "hace 2 horas",
            department: "Ventas"
          },
          {
            id: "user-12",
            name: "Roberto Vega",
            avatar: "/avatars/roberto.jpg",
            role: "Ejecutivo Comercial",
            isOnline: true,
            status: "busy",
            department: "Ventas"
          },
          {
            id: "user-13",
            name: "Isabel Campos",
            avatar: "/avatars/isabel.jpg",
            role: "Especialista Marketing",
            isOnline: true,
            status: "available",
            department: "Ventas"
          }
        ]
      },
      {
        id: "team-5",
        name: "Equipo de Logística",
        department: "Operaciones",
        description: "Envíos y gestión de almacén",
        members: [
          {
            id: "user-14",
            name: "Javier Moreno",
            avatar: "/avatars/javier.jpg",
            role: "Responsable Logística",
            isOnline: true,
            status: "available",
            department: "Operaciones"
          },
          {
            id: "user-15",
            name: "Cristina Ruiz",
            avatar: "/avatars/cristina.jpg",
            role: "Gestora de Almacén",
            isOnline: false,
            status: "offline",
            lastSeen: "hace 30 min",
            department: "Operaciones"
          }
        ]
      }
    ]

    // Calculate team stats
    const teamsWithStats = teams.map(team => ({
      ...team,
      onlineCount: team.members.filter(member => member.isOnline).length,
      totalMembers: team.members.length,
      availableCount: team.members.filter(member => member.status === 'available').length
    }))

    return NextResponse.json(teamsWithStats)

  } catch (error) {
    console.error("Error fetching teams:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}