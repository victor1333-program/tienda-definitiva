import { NextRequest, NextResponse } from "next/server"
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"

interface QualityCheck {
  id: string
  orderNumber: string
  productName: string
  category: string
  customer: string
  inspector: string
  checkDate: string
  status: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'needs_review'
  overallScore: number
  checklistItems: QualityCheckItem[]
  defects: QualityDefect[]
  photos: string[]
  comments: string
  approvedBy?: string
  approvedAt?: string
  productionBatch: string
  estimatedTime: number
  actualTime?: number
}

interface QualityCheckItem {
  id: string
  category: string
  description: string
  isRequired: boolean
  status: 'pending' | 'passed' | 'failed' | 'not_applicable'
  notes?: string
  weight: number
  criteria: string[]
}

interface QualityDefect {
  id: string
  type: string
  description: string
  severity: 'minor' | 'major' | 'critical'
  location: string
  photo?: string
  correctionAction: string
  status: 'open' | 'in_progress' | 'resolved'
  assignedTo?: string
}

// GET quality checks
export async function GET() {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Mock quality checks data
    const qualityChecks: QualityCheck[] = [
      {
        id: "qc-001",
        orderNumber: "ORD-2024-1156",
        productName: "Camiseta Premium Personalizada",
        category: "Textil",
        customer: "María González",
        inspector: "Sofía Morales",
        checkDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: "approved",
        overallScore: 95,
        productionBatch: "TX-2024-089",
        estimatedTime: 20,
        actualTime: 18,
        photos: ["/quality/qc-001-1.jpg", "/quality/qc-001-2.jpg"],
        comments: "Producto excelente, cumple con todos los estándares de calidad.",
        approvedBy: "Carlos Supervisor",
        approvedAt: new Date().toISOString(),
        checklistItems: [
          {
            id: "item-1",
            category: "Impresión",
            description: "Calidad de impresión y colores",
            isRequired: true,
            status: "passed",
            notes: "Colores vivos y nítidos",
            weight: 9,
            criteria: ["Resolución clara", "Colores exactos", "Sin borrones"]
          },
          {
            id: "item-2",
            category: "Material",
            description: "Calidad del tejido",
            isRequired: true,
            status: "passed",
            notes: "Tejido suave y resistente",
            weight: 8,
            criteria: ["Textura adecuada", "Sin defectos", "Peso correcto"]
          },
          {
            id: "item-3",
            category: "Acabado",
            description: "Costuras y terminaciones",
            isRequired: true,
            status: "passed",
            weight: 7,
            criteria: ["Costuras rectas", "Hilos cortados", "Sin pliegues"]
          }
        ],
        defects: []
      },
      {
        id: "qc-002",
        orderNumber: "ORD-2024-1157",
        productName: "Taza Cerámica Sublimada",
        category: "Sublimación",
        customer: "Carlos Ruiz",
        inspector: "Ana López",
        checkDate: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        status: "needs_review",
        overallScore: 78,
        productionBatch: "MG-2024-045",
        estimatedTime: 15,
        actualTime: 22,
        photos: ["/quality/qc-002-1.jpg"],
        comments: "Problema menor en la sublimación, requiere revisión.",
        checklistItems: [
          {
            id: "item-4",
            category: "Sublimación",
            description: "Calidad de sublimación",
            isRequired: true,
            status: "failed",
            notes: "Imagen ligeramente borrosa en esquina inferior",
            weight: 10,
            criteria: ["Imagen nítida", "Colores precisos", "Sin manchas"]
          },
          {
            id: "item-5",
            category: "Estructura",
            description: "Integridad de la taza",
            isRequired: true,
            status: "passed",
            weight: 8,
            criteria: ["Sin grietas", "Asa firme", "Base estable"]
          }
        ],
        defects: [
          {
            id: "def-001",
            type: "Sublimación defectuosa",
            description: "Imagen borrosa en esquina inferior derecha",
            severity: "minor",
            location: "Esquina inferior derecha",
            photo: "/defects/def-001.jpg",
            correctionAction: "Repetir proceso de sublimación con mayor presión",
            status: "open",
            assignedTo: "Carlos Ruiz"
          }
        ]
      },
      {
        id: "qc-003",
        orderNumber: "ORD-2024-1158",
        productName: "Gorra Snapback Custom",
        category: "Bordado",
        customer: "Ana López",
        inspector: "Luis Martín",
        checkDate: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        status: "in_progress",
        overallScore: 0,
        productionBatch: "GR-2024-023",
        estimatedTime: 25,
        photos: [],
        comments: "",
        checklistItems: [
          {
            id: "item-6",
            category: "Bordado",
            description: "Calidad del bordado",
            isRequired: true,
            status: "pending",
            weight: 10,
            criteria: ["Puntadas uniformes", "Diseño centrado", "Sin hilos sueltos"]
          },
          {
            id: "item-7",
            category: "Ajuste",
            description: "Mecanismo de ajuste",
            isRequired: true,
            status: "pending",
            weight: 6,
            criteria: ["Cierre funcional", "Ajuste suave", "Sin trabas"]
          }
        ],
        defects: []
      },
      {
        id: "qc-004",
        orderNumber: "ORD-2024-1159",
        productName: "Mousepad Gaming",
        category: "Impresión",
        customer: "Luis Martín",
        inspector: "Sofía Morales",
        checkDate: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        status: "rejected",
        overallScore: 45,
        productionBatch: "MP-2024-067",
        estimatedTime: 10,
        actualTime: 15,
        photos: ["/quality/qc-004-1.jpg", "/quality/qc-004-2.jpg"],
        comments: "Múltiples defectos críticos, requiere reproducción completa.",
        checklistItems: [
          {
            id: "item-8",
            category: "Impresión",
            description: "Calidad de impresión",
            isRequired: true,
            status: "failed",
            notes: "Colores desaturados y manchas",
            weight: 10,
            criteria: ["Resolución alta", "Colores vivos", "Sin manchas"]
          },
          {
            id: "item-9",
            category: "Material",
            description: "Base antideslizante",
            isRequired: true,
            status: "failed",
            notes: "Base despegada en varias zonas",
            weight: 8,
            criteria: ["Adherencia completa", "Sin burbujas", "Superficie lisa"]
          }
        ],
        defects: [
          {
            id: "def-002",
            type: "Impresión defectuosa",
            description: "Colores desaturados y manchas en la superficie",
            severity: "major",
            location: "Superficie de impresión",
            photo: "/defects/def-002.jpg",
            correctionAction: "Reemplazar cartuchos de tinta y limpiar cabezales",
            status: "in_progress",
            assignedTo: "Luis Martín"
          },
          {
            id: "def-003",
            type: "Base antideslizante defectuosa",
            description: "Base despegada en múltiples puntos",
            severity: "critical",
            location: "Base inferior",
            correctionAction: "Revisar proceso de pegado y calidad del adhesivo",
            status: "open",
            assignedTo: "Supervisor Producción"
          }
        ]
      },
      {
        id: "qc-005",
        orderNumber: "ORD-2024-1160",
        productName: "Bolsa Ecológica Bordada",
        category: "Bordado",
        customer: "Carmen Jiménez",
        inspector: "Ana López",
        checkDate: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        status: "pending",
        overallScore: 0,
        productionBatch: "BG-2024-034",
        estimatedTime: 30,
        photos: [],
        comments: "",
        checklistItems: [
          {
            id: "item-10",
            category: "Bordado",
            description: "Bordado del logo",
            isRequired: true,
            status: "pending",
            weight: 9,
            criteria: ["Logo centrado", "Colores exactos", "Puntadas firmes"]
          },
          {
            id: "item-11",
            category: "Estructura",
            description: "Resistencia de asas",
            isRequired: true,
            status: "pending",
            weight: 8,
            criteria: ["Costuras reforzadas", "Capacidad de peso", "Comodidad"]
          },
          {
            id: "item-12",
            category: "Material",
            description: "Material ecológico",
            isRequired: true,
            status: "pending",
            weight: 7,
            criteria: ["Certificación eco", "Textura adecuada", "Durabilidad"]
          }
        ],
        defects: []
      }
    ]

    // Sort by check date (most recent first)
    qualityChecks.sort((a, b) => new Date(b.checkDate).getTime() - new Date(a.checkDate).getTime())

    return NextResponse.json(qualityChecks)

  } catch (error) {
    console.error("Error fetching quality checks:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// POST - Create new quality check
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { orderNumber, templateId } = await request.json()

    if (!orderNumber || !templateId) {
      return NextResponse.json(
        { error: "Número de orden y plantilla son requeridos" },
        { status: 400 }
      )
    }

    // In a real implementation, you would:
    // 1. Validate the order exists
    // 2. Load the template and create checklist items
    // 3. Assign to available inspector
    // 4. Save to database
    // 5. Send notifications

    const newQualityCheck: QualityCheck = {
      id: `qc-${Date.now()}`,
      orderNumber,
      productName: "Producto de Prueba",
      category: "Textil",
      customer: "Cliente de Prueba",
      inspector: session.user.name || "Inspector",
      checkDate: new Date().toISOString(),
      status: "pending",
      overallScore: 0,
      productionBatch: `BATCH-${Date.now()}`,
      estimatedTime: 20,
      photos: [],
      comments: "",
      checklistItems: [
        {
          id: `item-${Date.now()}-1`,
          category: "General",
          description: "Revisión general del producto",
          isRequired: true,
          status: "pending",
          weight: 10,
          criteria: ["Aspecto general", "Funcionalidad", "Acabado"]
        }
      ],
      defects: []
    }

    return NextResponse.json(newQualityCheck)

  } catch (error) {
    console.error("Error creating quality check:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}