import { NextRequest, NextResponse } from "next/server"
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"

interface ProcessStep {
  id: string
  name: string
  description: string
  category: 'preparation' | 'production' | 'quality' | 'packaging' | 'shipping'
  estimatedTime: number
  actualTime: number
  efficiency: number
  bottleneckRisk: 'low' | 'medium' | 'high'
  workers: number
  resources: string[]
  dependencies: string[]
  automationLevel: number
  qualityImpact: number
  historicalData: {
    date: string
    time: number
    efficiency: number
    issues: string[]
  }[]
}

// GET production process steps
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || '7d'

    // Mock process steps data
    const processSteps: ProcessStep[] = [
      {
        id: "step-001",
        name: "Preparación de Materiales",
        description: "Selección y preparación de tejidos y materiales base",
        category: "preparation",
        estimatedTime: 15,
        actualTime: 18,
        efficiency: 83.3,
        bottleneckRisk: "medium",
        workers: 2,
        resources: ["Cortadora", "Mesa de corte", "Reglas de medición"],
        dependencies: [],
        automationLevel: 30,
        qualityImpact: 8,
        historicalData: [
          {
            date: "2024-12-15",
            time: 17,
            efficiency: 88.2,
            issues: []
          },
          {
            date: "2024-12-14",
            time: 19,
            efficiency: 78.9,
            issues: ["Material defectuoso"]
          },
          {
            date: "2024-12-13",
            time: 16,
            efficiency: 93.8,
            issues: []
          }
        ]
      },
      {
        id: "step-002",
        name: "Diseño y Personalización",
        description: "Creación del diseño personalizado según especificaciones",
        category: "preparation",
        estimatedTime: 25,
        actualTime: 32,
        efficiency: 78.1,
        bottleneckRisk: "high",
        workers: 1,
        resources: ["Software de diseño", "Impresora de pruebas", "Scanner"],
        dependencies: ["step-001"],
        automationLevel: 60,
        qualityImpact: 10,
        historicalData: [
          {
            date: "2024-12-15",
            time: 30,
            efficiency: 83.3,
            issues: []
          },
          {
            date: "2024-12-14",
            time: 35,
            efficiency: 71.4,
            issues: ["Revisiones del cliente"]
          },
          {
            date: "2024-12-13",
            time: 28,
            efficiency: 89.3,
            issues: []
          }
        ]
      },
      {
        id: "step-003",
        name: "Impresión/Sublimación",
        description: "Proceso de impresión o sublimación del diseño",
        category: "production",
        estimatedTime: 20,
        actualTime: 22,
        efficiency: 90.9,
        bottleneckRisk: "low",
        workers: 1,
        resources: ["Impresora industrial", "Horno de sublimación", "Tintas especiales"],
        dependencies: ["step-002"],
        automationLevel: 85,
        qualityImpact: 9,
        historicalData: [
          {
            date: "2024-12-15",
            time: 21,
            efficiency: 95.2,
            issues: []
          },
          {
            date: "2024-12-14",
            time: 23,
            efficiency: 87.0,
            issues: ["Atasco en impresora"]
          },
          {
            date: "2024-12-13",
            time: 20,
            efficiency: 100.0,
            issues: []
          }
        ]
      },
      {
        id: "step-004",
        name: "Corte y Confección",
        description: "Corte de piezas y proceso de confección",
        category: "production",
        estimatedTime: 30,
        actualTime: 35,
        efficiency: 85.7,
        bottleneckRisk: "medium",
        workers: 2,
        resources: ["Máquinas de coser", "Cortadora láser", "Overlock"],
        dependencies: ["step-003"],
        automationLevel: 45,
        qualityImpact: 8,
        historicalData: [
          {
            date: "2024-12-15",
            time: 33,
            efficiency: 90.9,
            issues: []
          },
          {
            date: "2024-12-14",
            time: 38,
            efficiency: 78.9,
            issues: ["Hilo roto"]
          },
          {
            date: "2024-12-13",
            time: 32,
            efficiency: 93.8,
            issues: []
          }
        ]
      },
      {
        id: "step-005",
        name: "Bordado Industrial",
        description: "Aplicación de bordados decorativos o funcionales",
        category: "production",
        estimatedTime: 40,
        actualTime: 45,
        efficiency: 88.9,
        bottleneckRisk: "medium",
        workers: 1,
        resources: ["Máquina bordadora", "Hilos especiales", "Estabilizadores"],
        dependencies: ["step-004"],
        automationLevel: 70,
        qualityImpact: 9,
        historicalData: [
          {
            date: "2024-12-15",
            time: 42,
            efficiency: 95.2,
            issues: []
          },
          {
            date: "2024-12-14",
            time: 48,
            efficiency: 83.3,
            issues: ["Cambio de hilo"]
          },
          {
            date: "2024-12-13",
            time: 41,
            efficiency: 97.6,
            issues: []
          }
        ]
      },
      {
        id: "step-006",
        name: "Control de Calidad",
        description: "Inspección final del producto terminado",
        category: "quality",
        estimatedTime: 10,
        actualTime: 12,
        efficiency: 83.3,
        bottleneckRisk: "low",
        workers: 1,
        resources: ["Mesa de inspección", "Lupa", "Medidores"],
        dependencies: ["step-005"],
        automationLevel: 20,
        qualityImpact: 10,
        historicalData: [
          {
            date: "2024-12-15",
            time: 11,
            efficiency: 90.9,
            issues: []
          },
          {
            date: "2024-12-14",
            time: 13,
            efficiency: 76.9,
            issues: ["Defecto detectado"]
          },
          {
            date: "2024-12-13",
            time: 10,
            efficiency: 100.0,
            issues: []
          }
        ]
      },
      {
        id: "step-007",
        name: "Acabado Final",
        description: "Planchado, etiquetado y preparación final",
        category: "packaging",
        estimatedTime: 15,
        actualTime: 18,
        efficiency: 83.3,
        bottleneckRisk: "low",
        workers: 1,
        resources: ["Plancha industrial", "Etiquetadora", "Mesa de acabado"],
        dependencies: ["step-006"],
        automationLevel: 40,
        qualityImpact: 7,
        historicalData: [
          {
            date: "2024-12-15",
            time: 17,
            efficiency: 88.2,
            issues: []
          },
          {
            date: "2024-12-14",
            time: 19,
            efficiency: 78.9,
            issues: ["Plancha fría"]
          },
          {
            date: "2024-12-13",
            time: 16,
            efficiency: 93.8,
            issues: []
          }
        ]
      },
      {
        id: "step-008",
        name: "Empaquetado",
        description: "Empaquetado del producto en material protector",
        category: "packaging",
        estimatedTime: 8,
        actualTime: 10,
        efficiency: 80.0,
        bottleneckRisk: "low",
        workers: 1,
        resources: ["Bolsas protectoras", "Etiquetas", "Selladora"],
        dependencies: ["step-007"],
        automationLevel: 50,
        qualityImpact: 5,
        historicalData: [
          {
            date: "2024-12-15",
            time: 9,
            efficiency: 88.9,
            issues: []
          },
          {
            date: "2024-12-14",
            time: 11,
            efficiency: 72.7,
            issues: ["Falta de material"]
          },
          {
            date: "2024-12-13",
            time: 8,
            efficiency: 100.0,
            issues: []
          }
        ]
      },
      {
        id: "step-009",
        name: "Preparación Envío",
        description: "Generación de etiquetas y preparación para envío",
        category: "shipping",
        estimatedTime: 5,
        actualTime: 7,
        efficiency: 71.4,
        bottleneckRisk: "medium",
        workers: 1,
        resources: ["Sistema de gestión", "Impresora etiquetas", "Báscula"],
        dependencies: ["step-008"],
        automationLevel: 80,
        qualityImpact: 6,
        historicalData: [
          {
            date: "2024-12-15",
            time: 6,
            efficiency: 83.3,
            issues: []
          },
          {
            date: "2024-12-14",
            time: 8,
            efficiency: 62.5,
            issues: ["Sistema lento"]
          },
          {
            date: "2024-12-13",
            time: 5,
            efficiency: 100.0,
            issues: []
          }
        ]
      }
    ]

    // Filter by timeframe if needed
    const filteredSteps = processSteps.map(step => ({
      ...step,
      historicalData: step.historicalData.filter(data => {
        const dataDate = new Date(data.date)
        const now = new Date()
        const daysDiff = Math.floor((now.getTime() - dataDate.getTime()) / (1000 * 60 * 60 * 24))
        
        switch (timeframe) {
          case '24h': return daysDiff <= 1
          case '7d': return daysDiff <= 7
          case '30d': return daysDiff <= 30
          case '90d': return daysDiff <= 90
          default: return true
        }
      })
    }))

    return NextResponse.json(filteredSteps)

  } catch (error) {
    console.error("Error fetching process steps:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// PUT - Update process step
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const stepData = await request.json()

    // In a real implementation, you would:
    // 1. Validate step data
    // 2. Update step in database
    // 3. Recalculate metrics
    // 4. Log changes for audit

    return NextResponse.json({ success: true, message: "Paso actualizado correctamente" })

  } catch (error) {
    console.error("Error updating process step:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}