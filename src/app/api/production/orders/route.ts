import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Generate mock production orders for demonstration
    const mockOrders = [
      {
        id: '1',
        orderNumber: 'PROD-2024-001',
        productName: 'Camiseta Personalizada Premium',
        quantity: 50,
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        estimatedTime: 8,
        actualTime: 6,
        startedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        assignedTo: {
          id: 'worker-1',
          name: 'María González',
          email: 'maria@tienda.com'
        },
        customer: {
          name: 'Empresa ABC',
          email: 'contacto@abc.com'
        },
        materials: [
          {
            id: 'mat-1',
            name: 'Tela Algodón Premium',
            quantity: 25,
            unit: 'metros',
            status: 'AVAILABLE'
          },
          {
            id: 'mat-2',
            name: 'Tinta Serigráfica Blanca',
            quantity: 2,
            unit: 'litros',
            status: 'AVAILABLE'
          }
        ],
        tasks: [
          {
            id: 'task-1',
            name: 'Corte de tela',
            description: 'Cortar piezas según patrón',
            status: 'COMPLETED',
            estimatedTime: 2,
            actualTime: 1.5,
            assignedTo: { name: 'María González' }
          },
          {
            id: 'task-2',
            name: 'Estampado',
            description: 'Aplicar diseño personalizado',
            status: 'IN_PROGRESS',
            estimatedTime: 4,
            assignedTo: { name: 'María González' }
          },
          {
            id: 'task-3',
            name: 'Costura',
            description: 'Ensamblar piezas',
            status: 'PENDING',
            estimatedTime: 2,
            assignedTo: { name: 'Carlos Ruiz' }
          }
        ],
        qualityChecks: [
          {
            id: 'qc-1',
            checkName: 'Control de calidad inicial',
            status: 'PASSED',
            checkedBy: 'Ana López',
            checkedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          }
        ]
      },
      {
        id: '2',
        orderNumber: 'PROD-2024-002',
        productName: 'Tazas Promocionales',
        quantity: 100,
        status: 'PENDING',
        priority: 'MEDIUM',
        estimatedTime: 12,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        customer: {
          name: 'Marketing Solutions',
          email: 'info@marketing.com'
        },
        materials: [
          {
            id: 'mat-3',
            name: 'Tazas Blancas Cerámicas',
            quantity: 100,
            unit: 'piezas',
            status: 'AVAILABLE'
          },
          {
            id: 'mat-4',
            name: 'Vinilo de Corte',
            quantity: 5,
            unit: 'metros',
            status: 'AVAILABLE'
          }
        ],
        tasks: [
          {
            id: 'task-4',
            name: 'Preparación de diseño',
            description: 'Vectorizar logo del cliente',
            status: 'PENDING',
            estimatedTime: 2
          },
          {
            id: 'task-5',
            name: 'Corte de vinilo',
            description: 'Cortar diseños en vinilo',
            status: 'PENDING',
            estimatedTime: 4
          },
          {
            id: 'task-6',
            name: 'Aplicación de vinilo',
            description: 'Adherir diseños a tazas',
            status: 'PENDING',
            estimatedTime: 6
          }
        ]
      },
      {
        id: '3',
        orderNumber: 'PROD-2024-003',
        productName: 'Bolsas Ecológicas Personalizadas',
        quantity: 200,
        status: 'QUALITY_CHECK',
        priority: 'URGENT',
        estimatedTime: 16,
        actualTime: 15,
        startedAt: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        assignedTo: {
          id: 'worker-2',
          name: 'Carlos Ruiz',
          email: 'carlos@tienda.com'
        },
        customer: {
          name: 'EcoVerde',
          email: 'pedidos@ecoverde.com'
        },
        materials: [
          {
            id: 'mat-5',
            name: 'Tela de Algodón Orgánico',
            quantity: 50,
            unit: 'metros',
            status: 'AVAILABLE'
          },
          {
            id: 'mat-6',
            name: 'Cordón de Algodón',
            quantity: 400,
            unit: 'metros',
            status: 'AVAILABLE'
          }
        ],
        tasks: [
          {
            id: 'task-7',
            name: 'Corte de tela',
            status: 'COMPLETED',
            estimatedTime: 4,
            actualTime: 3.5
          },
          {
            id: 'task-8',
            name: 'Estampado serigráfico',
            status: 'COMPLETED',
            estimatedTime: 8,
            actualTime: 7.5
          },
          {
            id: 'task-9',
            name: 'Costura y acabados',
            status: 'COMPLETED',
            estimatedTime: 4,
            actualTime: 4
          }
        ],
        qualityChecks: [
          {
            id: 'qc-2',
            checkName: 'Control de estampado',
            status: 'PENDING',
            checkedBy: 'Ana López'
          },
          {
            id: 'qc-3',
            checkName: 'Control de costura',
            status: 'PENDING',
            checkedBy: 'Ana López'
          }
        ]
      },
      {
        id: '4',
        orderNumber: 'PROD-2024-004',
        productName: 'Gorras Bordadas',
        quantity: 75,
        status: 'COMPLETED',
        priority: 'LOW',
        estimatedTime: 10,
        actualTime: 9,
        startedAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
        assignedTo: {
          id: 'worker-3',
          name: 'Luis Martín',
          email: 'luis@tienda.com'
        },
        customer: {
          name: 'Club Deportivo Sur',
          email: 'admin@clubsur.com'
        },
        tasks: [
          {
            id: 'task-10',
            name: 'Preparación de diseño',
            status: 'COMPLETED',
            estimatedTime: 1,
            actualTime: 1
          },
          {
            id: 'task-11',
            name: 'Bordado',
            status: 'COMPLETED',
            estimatedTime: 8,
            actualTime: 7
          },
          {
            id: 'task-12',
            name: 'Control de calidad',
            status: 'COMPLETED',
            estimatedTime: 1,
            actualTime: 1
          }
        ],
        qualityChecks: [
          {
            id: 'qc-4',
            checkName: 'Control de bordado',
            status: 'PASSED',
            checkedBy: 'Ana López',
            checkedAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString()
          }
        ]
      },
      {
        id: '5',
        orderNumber: 'PROD-2024-005',
        productName: 'Llaveros Acrílicos',
        quantity: 500,
        status: 'PENDING',
        priority: 'HIGH',
        estimatedTime: 6,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        customer: {
          name: 'Eventos & Más',
          email: 'ventas@eventosymas.com'
        },
        materials: [
          {
            id: 'mat-7',
            name: 'Acrílico Transparente 3mm',
            quantity: 2,
            unit: 'láminas',
            status: 'AVAILABLE'
          },
          {
            id: 'mat-8',
            name: 'Anillas Metálicas',
            quantity: 500,
            unit: 'piezas',
            status: 'AVAILABLE'
          }
        ],
        tasks: [
          {
            id: 'task-13',
            name: 'Corte láser',
            description: 'Cortar formas en acrílico',
            status: 'PENDING',
            estimatedTime: 4
          },
          {
            id: 'task-14',
            name: 'Grabado láser',
            description: 'Grabar diseños personalizados',
            status: 'PENDING',
            estimatedTime: 2
          }
        ]
      }
    ]

    return NextResponse.json({ orders: mockOrders })

  } catch (error) {
    console.error("Error fetching production orders:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const data = await request.json()
    
    // In a real implementation, this would create a new production order
    const newOrder = {
      id: `new-${Date.now()}`,
      orderNumber: `PROD-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
      ...data,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    }

    return NextResponse.json({ success: true, order: newOrder })

  } catch (error) {
    console.error("Error creating production order:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}