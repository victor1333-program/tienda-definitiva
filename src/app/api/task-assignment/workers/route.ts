import { NextRequest, NextResponse } from "next/server"
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"

interface Worker {
  id: string
  name: string
  avatar?: string
  email: string
  department: string
  skills: string[]
  skillLevels: { [skill: string]: number }
  currentWorkload: number
  maxCapacity: number
  efficiency: number
  qualityScore: number
  availability: 'available' | 'busy' | 'break' | 'offline'
  shiftStart: string
  shiftEnd: string
  currentTasks: number
  completedToday: number
  avgTaskTime: number
  certifications: string[]
}

// GET workers for task assignment
export async function GET() {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const workers: Worker[] = [
      {
        id: "worker-1",
        name: "María González",
        email: "maria.gonzalez@lovilike.com",
        department: "Diseño",
        skills: ["Diseño Gráfico", "Adobe Illustrator", "Photoshop", "Creatividad"],
        skillLevels: {
          "Diseño Gráfico": 5,
          "Adobe Illustrator": 5,
          "Photoshop": 4,
          "Creatividad": 5
        },
        currentWorkload: 65,
        maxCapacity: 8,
        efficiency: 92,
        qualityScore: 9.2,
        availability: "available",
        shiftStart: "09:00",
        shiftEnd: "17:00",
        currentTasks: 3,
        completedToday: 2,
        avgTaskTime: 85,
        certifications: ["Adobe Certified Expert", "Diseño UX/UI"]
      },
      {
        id: "worker-2",
        name: "Carlos Ruiz",
        email: "carlos.ruiz@lovilike.com",
        department: "Producción",
        skills: ["Sublimación", "Corte Láser", "Manejo Maquinaria", "Control Calidad"],
        skillLevels: {
          "Sublimación": 4,
          "Corte Láser": 5,
          "Manejo Maquinaria": 4,
          "Control Calidad": 3
        },
        currentWorkload: 85,
        maxCapacity: 8,
        efficiency: 88,
        qualityScore: 8.5,
        availability: "busy",
        shiftStart: "08:00",
        shiftEnd: "16:00",
        currentTasks: 5,
        completedToday: 4,
        avgTaskTime: 45,
        certifications: ["Operador Certificado", "Seguridad Industrial"]
      },
      {
        id: "worker-3",
        name: "Ana López",
        email: "ana.lopez@lovilike.com",
        department: "Bordado",
        skills: ["Bordado Industrial", "Programación Máquinas", "Diseño Textil"],
        skillLevels: {
          "Bordado Industrial": 5,
          "Programación Máquinas": 4,
          "Diseño Textil": 3
        },
        currentWorkload: 40,
        maxCapacity: 8,
        efficiency: 95,
        qualityScore: 9.5,
        availability: "available",
        shiftStart: "09:00",
        shiftEnd: "17:00",
        currentTasks: 2,
        completedToday: 3,
        avgTaskTime: 35,
        certifications: ["Bordado Profesional", "Mantenimiento Preventivo"]
      },
      {
        id: "worker-4",
        name: "Luis Martín",
        email: "luis.martin@lovilike.com",
        department: "Impresión",
        skills: ["Impresión DTF", "Serigrafía", "Preparación Tintas", "Acabados"],
        skillLevels: {
          "Impresión DTF": 4,
          "Serigrafía": 5,
          "Preparación Tintas": 4,
          "Acabados": 3
        },
        currentWorkload: 72,
        maxCapacity: 8,
        efficiency: 87,
        qualityScore: 8.8,
        availability: "available",
        shiftStart: "08:30",
        shiftEnd: "16:30",
        currentTasks: 4,
        completedToday: 2,
        avgTaskTime: 55,
        certifications: ["Técnico en Impresión", "Gestión de Color"]
      },
      {
        id: "worker-5",
        name: "Sofía Morales",
        email: "sofia.morales@lovilike.com",
        department: "Control Calidad",
        skills: ["Inspección Visual", "Medición Precisión", "Documentación", "Análisis Defectos"],
        skillLevels: {
          "Inspección Visual": 5,
          "Medición Precisión": 4,
          "Documentación": 5,
          "Análisis Defectos": 4
        },
        currentWorkload: 55,
        maxCapacity: 8,
        efficiency: 93,
        qualityScore: 9.7,
        availability: "available",
        shiftStart: "09:00",
        shiftEnd: "17:00",
        currentTasks: 3,
        completedToday: 5,
        avgTaskTime: 25,
        certifications: ["ISO 9001", "Control de Calidad Avanzado"]
      },
      {
        id: "worker-6",
        name: "Roberto Vega",
        email: "roberto.vega@lovilike.com",
        department: "Empaque",
        skills: ["Empaque Productos", "Logística", "Inventario", "Etiquetado"],
        skillLevels: {
          "Empaque Productos": 4,
          "Logística": 3,
          "Inventario": 4,
          "Etiquetado": 5
        },
        currentWorkload: 30,
        maxCapacity: 8,
        efficiency: 90,
        qualityScore: 8.3,
        availability: "available",
        shiftStart: "10:00",
        shiftEnd: "18:00",
        currentTasks: 1,
        completedToday: 6,
        avgTaskTime: 15,
        certifications: ["Manipulación de Materiales", "Almacenamiento"]
      },
      {
        id: "worker-7",
        name: "Elena Vargas",
        email: "elena.vargas@lovilike.com",
        department: "Mantenimiento",
        skills: ["Reparación Maquinaria", "Mantenimiento Preventivo", "Electricidad", "Mecánica"],
        skillLevels: {
          "Reparación Maquinaria": 5,
          "Mantenimiento Preventivo": 5,
          "Electricidad": 4,
          "Mecánica": 4
        },
        currentWorkload: 20,
        maxCapacity: 8,
        efficiency: 85,
        qualityScore: 8.9,
        availability: "break",
        shiftStart: "07:00",
        shiftEnd: "15:00",
        currentTasks: 1,
        completedToday: 1,
        avgTaskTime: 120,
        certifications: ["Técnico Industrial", "Soldadura Certificada"]
      },
      {
        id: "worker-8",
        name: "Miguel Torres",
        email: "miguel.torres@lovilike.com",
        department: "Supervisión",
        skills: ["Gestión Equipos", "Planificación", "Resolución Problemas", "Coordinación"],
        skillLevels: {
          "Gestión Equipos": 5,
          "Planificación": 4,
          "Resolución Problemas": 5,
          "Coordinación": 4
        },
        currentWorkload: 60,
        maxCapacity: 8,
        efficiency: 91,
        qualityScore: 9.0,
        availability: "available",
        shiftStart: "08:00",
        shiftEnd: "16:00",
        currentTasks: 2,
        completedToday: 3,
        avgTaskTime: 90,
        certifications: ["Liderazgo Industrial", "Gestión de Proyectos"]
      }
    ]

    return NextResponse.json(workers)

  } catch (error) {
    console.error("Error fetching workers:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}