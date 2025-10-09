import { NextRequest, NextResponse } from "next/server"
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Generate mock workers data for demonstration
    const mockWorkers = [
      {
        id: 'worker-1',
        name: 'María González',
        email: 'maria@tienda.com',
        department: 'Serigrafía',
        status: 'BUSY',
        currentTask: 'Estampado camisetas premium',
        efficiency: 92,
        completedTasksToday: 3,
        skillLevel: 'SENIOR'
      },
      {
        id: 'worker-2',
        name: 'Carlos Ruiz',
        email: 'carlos@tienda.com',
        department: 'Costura',
        status: 'AVAILABLE',
        currentTask: null,
        efficiency: 88,
        completedTasksToday: 2,
        skillLevel: 'INTERMEDIATE'
      },
      {
        id: 'worker-3',
        name: 'Luis Martín',
        email: 'luis@tienda.com',
        department: 'Bordado',
        status: 'BUSY',
        currentTask: 'Bordado de gorras deportivas',
        efficiency: 95,
        completedTasksToday: 4,
        skillLevel: 'EXPERT'
      },
      {
        id: 'worker-4',
        name: 'Ana López',
        email: 'ana@tienda.com',
        department: 'Control de Calidad',
        status: 'AVAILABLE',
        currentTask: null,
        efficiency: 97,
        completedTasksToday: 6,
        skillLevel: 'EXPERT'
      },
      {
        id: 'worker-5',
        name: 'Pedro Castillo',
        email: 'pedro@tienda.com',
        department: 'Corte Láser',
        status: 'BUSY',
        currentTask: 'Corte de llaveros acrílicos',
        efficiency: 89,
        completedTasksToday: 2,
        skillLevel: 'SENIOR'
      },
      {
        id: 'worker-6',
        name: 'Carmen Jiménez',
        email: 'carmen@tienda.com',
        department: 'Diseño',
        status: 'AVAILABLE',
        currentTask: null,
        efficiency: 91,
        completedTasksToday: 1,
        skillLevel: 'SENIOR'
      },
      {
        id: 'worker-7',
        name: 'Roberto Vega',
        email: 'roberto@tienda.com',
        department: 'Acabados',
        status: 'OFFLINE',
        currentTask: null,
        efficiency: 85,
        completedTasksToday: 0,
        skillLevel: 'JUNIOR'
      },
      {
        id: 'worker-8',
        name: 'Sofía Morales',
        email: 'sofia@tienda.com',
        department: 'Embalaje',
        status: 'AVAILABLE',
        currentTask: null,
        efficiency: 93,
        completedTasksToday: 5,
        skillLevel: 'INTERMEDIATE'
      }
    ]

    return NextResponse.json({ workers: mockWorkers })

  } catch (error) {
    console.error("Error fetching workers:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}