import { NextRequest, NextResponse } from "next/server"
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Mock equipment data
    const equipment = [
      {
        id: "eq-1",
        name: "Impresora Sublimación Pro",
        type: "sublimation_printer",
        status: "in_use",
        currentTask: "task-2",
        utilizationRate: 85.5
      },
      {
        id: "eq-2", 
        name: "Cortadora Láser Industrial",
        type: "laser_cutter",
        status: "available",
        utilizationRate: 45.2
      },
      {
        id: "eq-3",
        name: "Plotter de Corte Vinilo",
        type: "vinyl_cutter", 
        status: "in_use",
        currentTask: "task-3",
        utilizationRate: 72.8
      },
      {
        id: "eq-4",
        name: "Prensa Térmica Automática",
        type: "heat_press",
        status: "maintenance",
        utilizationRate: 0
      },
      {
        id: "eq-5",
        name: "Estación de Diseño Digital",
        type: "design_station",
        status: "in_use", 
        currentTask: "task-1",
        utilizationRate: 90.3
      },
      {
        id: "eq-6",
        name: "Mesa de Ensamblaje",
        type: "assembly_table",
        status: "available",
        utilizationRate: 32.1
      },
      {
        id: "eq-7",
        name: "Cámara de Secado UV",
        type: "uv_dryer",
        status: "offline",
        utilizationRate: 0
      },
      {
        id: "eq-8",
        name: "Empaquetadora Automática",
        type: "packaging_machine",
        status: "available",
        utilizationRate: 25.7
      }
    ]

    return NextResponse.json(equipment)

  } catch (error) {
    console.error("Error fetching production equipment:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}