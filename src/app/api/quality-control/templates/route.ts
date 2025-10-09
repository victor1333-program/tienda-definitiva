import { NextRequest, NextResponse } from "next/server"
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"

interface QualityTemplate {
  id: string
  name: string
  description: string
  category: string
  isActive: boolean
  checklistItems: QualityCheckItem[]
  estimatedDuration: number
  requiredCertifications: string[]
  createdBy: string
  createdAt: string
  lastModified: string
}

interface QualityCheckItem {
  id: string
  category: string
  description: string
  isRequired: boolean
  weight: number
  criteria: string[]
  instructions?: string
}

// GET quality control templates
export async function GET() {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Mock quality control templates
    const templates: QualityTemplate[] = [
      {
        id: "template-textil",
        name: "Control Calidad - Productos Textiles",
        description: "Plantilla completa para control de calidad de productos textiles personalizados",
        category: "Textil",
        isActive: true,
        estimatedDuration: 25,
        requiredCertifications: ["Control de Calidad Textil"],
        createdBy: "Administrador",
        createdAt: "2024-01-15T10:00:00Z",
        lastModified: "2024-12-20T15:30:00Z",
        checklistItems: [
          {
            id: "textil-001",
            category: "Material",
            description: "Inspección de la calidad del tejido",
            isRequired: true,
            weight: 8,
            criteria: [
              "Textura suave y uniforme",
              "Sin defectos visibles (agujeros, manchas)",
              "Peso del tejido según especificaciones",
              "Resistencia adecuada al tacto"
            ],
            instructions: "Revisar toda la superficie del tejido bajo buena iluminación"
          },
          {
            id: "textil-002",
            category: "Impresión/Estampado",
            description: "Calidad de la impresión o estampado",
            isRequired: true,
            weight: 10,
            criteria: [
              "Colores vivos y exactos según muestra",
              "Bordes nítidos sin corrimientos",
              "Cobertura uniforme sin zonas pálidas",
              "Adherencia correcta al tejido",
              "Sin burbujas o arrugas en la impresión"
            ],
            instructions: "Comparar con muestra aprobada y verificar bajo diferentes ángulos"
          },
          {
            id: "textil-003",
            category: "Costuras",
            description: "Revisión de costuras y terminaciones",
            isRequired: true,
            weight: 7,
            criteria: [
              "Costuras rectas y uniformes",
              "Tensión adecuada del hilo",
              "Hilos cortados y sin excesos",
              "Refuerzos en puntos de tensión"
            ],
            instructions: "Revisar todas las costuras tanto por el derecho como por el revés"
          },
          {
            id: "textil-004",
            category: "Tallas y Medidas",
            description: "Verificación de medidas según talla",
            isRequired: true,
            weight: 9,
            criteria: [
              "Largo según tabla de tallas",
              "Ancho según tabla de tallas",
              "Simetría en mangas y laterales",
              "Cuello centrado y bien terminado"
            ],
            instructions: "Medir con cinta métrica siguiendo puntos de referencia establecidos"
          },
          {
            id: "textil-005",
            category: "Acabado General",
            description: "Inspección final del producto",
            isRequired: true,
            weight: 6,
            criteria: [
              "Prenda limpia sin residuos",
              "Etiquetas correctamente colocadas",
              "Presentación general adecuada",
              "Sin olores extraños"
            ]
          }
        ]
      },
      {
        id: "template-sublimacion",
        name: "Control Calidad - Sublimación",
        description: "Plantilla para productos con sublimación (tazas, platos, etc.)",
        category: "Sublimación",
        isActive: true,
        estimatedDuration: 15,
        requiredCertifications: ["Técnico en Sublimación"],
        createdBy: "Supervisor Técnico",
        createdAt: "2024-02-01T09:00:00Z",
        lastModified: "2024-12-18T11:20:00Z",
        checklistItems: [
          {
            id: "sub-001",
            category: "Sublimación",
            description: "Calidad del proceso de sublimación",
            isRequired: true,
            weight: 10,
            criteria: [
              "Imagen nítida y bien definida",
              "Colores exactos según diseño original",
              "Sin líneas o rayas en la imagen",
              "Cobertura uniforme sin zonas pálidas",
              "Adherencia permanente al material"
            ],
            instructions: "Verificar bajo luz natural y artificial"
          },
          {
            id: "sub-002",
            category: "Material Base",
            description: "Inspección del material base",
            isRequired: true,
            weight: 8,
            criteria: [
              "Material sin grietas o fisuras",
              "Superficie lisa y uniforme",
              "Forma correcta según especificaciones",
              "Sin manchas o impurezas"
            ]
          },
          {
            id: "sub-003",
            category: "Funcionalidad",
            description: "Verificación funcional del producto",
            isRequired: true,
            weight: 7,
            criteria: [
              "Funcionalidad adecuada (taza: asa firme)",
              "Estabilidad sobre superficie plana",
              "Resistencia a uso normal",
              "Apto para lavavajillas (si aplica)"
            ]
          }
        ]
      },
      {
        id: "template-bordado",
        name: "Control Calidad - Bordado",
        description: "Plantilla para productos con bordado industrial",
        category: "Bordado",
        isActive: true,
        estimatedDuration: 20,
        requiredCertifications: ["Bordado Industrial"],
        createdBy: "Especialista Bordado",
        createdAt: "2024-01-20T14:00:00Z",
        lastModified: "2024-12-15T16:45:00Z",
        checklistItems: [
          {
            id: "bor-001",
            category: "Diseño Bordado",
            description: "Calidad del bordado realizado",
            isRequired: true,
            weight: 10,
            criteria: [
              "Diseño centrado y alineado",
              "Puntadas uniformes y consistentes",
              "Densidad adecuada del bordado",
              "Colores exactos según muestra",
              "Sin hilos sueltos o cortados mal"
            ],
            instructions: "Revisar con lupa si es necesario para detectar imperfecciones"
          },
          {
            id: "bor-002",
            category: "Acabado",
            description: "Terminación y limpieza del bordado",
            isRequired: true,
            weight: 8,
            criteria: [
              "Hilos bien cortados y sin excesos",
              "Sin residuos de entretela visible",
              "Bordado plano sin fruncidos",
              "Reverso limpio y ordenado"
            ]
          },
          {
            id: "bor-003",
            category: "Integridad",
            description: "Integridad del producto base",
            isRequired: true,
            weight: 7,
            criteria: [
              "Material base sin daños por bordado",
              "Sin perforaciones excesivas",
              "Forma original mantenida",
              "Flexibilidad adecuada"
            ]
          }
        ]
      },
      {
        id: "template-laser",
        name: "Control Calidad - Corte Láser",
        description: "Plantilla para productos con corte o grabado láser",
        category: "Láser",
        isActive: true,
        estimatedDuration: 18,
        requiredCertifications: ["Operador Láser Certificado"],
        createdBy: "Técnico Láser",
        createdAt: "2024-03-01T10:30:00Z",
        lastModified: "2024-12-10T09:15:00Z",
        checklistItems: [
          {
            id: "las-001",
            category: "Corte/Grabado",
            description: "Calidad del corte o grabado láser",
            isRequired: true,
            weight: 10,
            criteria: [
              "Bordes limpios y precisos",
              "Profundidad uniforme en grabado",
              "Sin marcas de quemaduras excesivas",
              "Dimensiones exactas según diseño",
              "Esquinas bien definidas"
            ],
            instructions: "Medir con calibrador para verificar precisiones"
          },
          {
            id: "las-002",
            category: "Material",
            description: "Estado del material post-láser",
            isRequired: true,
            weight: 8,
            criteria: [
              "Material sin deformaciones",
              "Superficie lisa sin astillas",
              "Color uniforme sin decoloración",
              "Resistencia estructural mantenida"
            ]
          },
          {
            id: "las-003",
            category: "Limpieza",
            description: "Limpieza post-procesamiento",
            isRequired: true,
            weight: 6,
            criteria: [
              "Sin residuos de combustión",
              "Libre de partículas sueltas",
              "Apto para uso inmediato",
              "Sin olores residuales fuertes"
            ]
          }
        ]
      },
      {
        id: "template-general",
        name: "Control Calidad - General",
        description: "Plantilla genérica para cualquier tipo de producto",
        category: "General",
        isActive: false,
        estimatedDuration: 12,
        requiredCertifications: [],
        createdBy: "Sistema",
        createdAt: "2024-01-01T08:00:00Z",
        lastModified: "2024-11-30T12:00:00Z",
        checklistItems: [
          {
            id: "gen-001",
            category: "Aspecto General",
            description: "Inspección visual general",
            isRequired: true,
            weight: 7,
            criteria: [
              "Producto limpio y presentable",
              "Sin defectos evidentes",
              "Forma correcta",
              "Funcionamiento adecuado"
            ]
          },
          {
            id: "gen-002",
            category: "Especificaciones",
            description: "Cumplimiento de especificaciones",
            isRequired: true,
            weight: 8,
            criteria: [
              "Medidas correctas",
              "Peso adecuado",
              "Material según pedido",
              "Color según muestra"
            ]
          }
        ]
      }
    ]

    return NextResponse.json(templates)

  } catch (error) {
    console.error("Error fetching quality templates:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// POST - Create new quality template
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const templateData = await request.json()

    // In a real implementation, you would:
    // 1. Validate template data
    // 2. Save to database
    // 3. Return created template

    const newTemplate: QualityTemplate = {
      id: `template-${Date.now()}`,
      ...templateData,
      createdBy: session.user.name || "Usuario",
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    }

    return NextResponse.json(newTemplate)

  } catch (error) {
    console.error("Error creating quality template:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}