import { NextRequest, NextResponse } from "next/server"
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"

interface Refund {
  id: string
  orderId: string
  orderNumber: string
  customerId: string
  customerName: string
  customerEmail: string
  originalAmount: number
  refundAmount: number
  currency: string
  reason: 'customer_request' | 'defective_product' | 'shipping_issue' | 'duplicate_order' | 'fraud' | 'other'
  status: 'pending' | 'processing' | 'approved' | 'rejected' | 'completed' | 'failed' | 'cancelled'
  type: 'full' | 'partial'
  method: 'original_payment' | 'store_credit' | 'bank_transfer' | 'cash'
  requestDate: string
  processedDate?: string
  completedDate?: string
  processedBy?: string
  approvedBy?: string
  gatewayId?: string
  transactionId?: string
  refundTransactionId?: string
  notes: string
  customerNotes?: string
  attachments: string[]
  timeline: {
    status: string
    timestamp: string
    description: string
    user?: string
  }[]
  automation: {
    isAutomatic: boolean
    ruleId?: string
    confidence: number
  }
}

// GET refunds
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || '30d'
    const status = searchParams.get('status') || 'all'
    const reason = searchParams.get('reason') || 'all'
    const search = searchParams.get('search') || ''

    // Mock refunds data
    const refunds: Refund[] = [
      {
        id: "ref-001",
        orderId: "order-1156",
        orderNumber: "ORD-2024-1156",
        customerId: "customer-456",
        customerName: "María González",
        customerEmail: "maria.gonzalez@email.com",
        originalAmount: 89.50,
        refundAmount: 89.50,
        currency: "EUR",
        reason: "defective_product",
        status: "pending",
        type: "full",
        method: "original_payment",
        requestDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        gatewayId: "gateway-stripe",
        transactionId: "txn_1PK2345",
        notes: "Cliente reporta que la camiseta llegó con un agujero en la manga derecha",
        customerNotes: "La camiseta tiene un defecto de fábrica, adjunto fotos",
        attachments: ["/uploads/refund-evidence-001-1.jpg", "/uploads/refund-evidence-001-2.jpg"],
        timeline: [
          {
            status: "pending",
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            description: "Solicitud de reembolso recibida del cliente",
            user: "Sistema"
          }
        ],
        automation: {
          isAutomatic: false,
          confidence: 85
        }
      },
      {
        id: "ref-002",
        orderId: "order-1152",
        orderNumber: "ORD-2024-1152",
        customerId: "customer-321",
        customerName: "Carlos Ruiz",
        customerEmail: "carlos.ruiz@email.com",
        originalAmount: 45.00,
        refundAmount: 45.00,
        currency: "EUR",
        reason: "customer_request",
        status: "completed",
        type: "full",
        method: "original_payment",
        requestDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        processedDate: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
        completedDate: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        processedBy: "Ana López",
        approvedBy: "Ana López",
        gatewayId: "gateway-stripe",
        transactionId: "txn_1PJ9876",
        refundTransactionId: "re_1PJ9877",
        notes: "Cliente cambió de opinión dentro del período de devolución",
        customerNotes: "Ya no necesito el producto",
        attachments: [],
        timeline: [
          {
            status: "pending",
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            description: "Solicitud de reembolso recibida del cliente",
            user: "Sistema"
          },
          {
            status: "approved",
            timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
            description: "Reembolso aprobado automáticamente",
            user: "Sistema Automático"
          },
          {
            status: "completed",
            timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            description: "Reembolso procesado exitosamente",
            user: "Sistema"
          }
        ],
        automation: {
          isAutomatic: true,
          ruleId: "rule-customer-request-under-50",
          confidence: 95
        }
      },
      {
        id: "ref-003",
        orderId: "order-1148",
        orderNumber: "ORD-2024-1148",
        customerId: "customer-789",
        customerName: "Ana López",
        customerEmail: "ana.lopez@email.com",
        originalAmount: 156.80,
        refundAmount: 78.40,
        currency: "EUR",
        reason: "shipping_issue",
        status: "processing",
        type: "partial",
        method: "original_payment",
        requestDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        processedDate: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        processedBy: "Luis Martín",
        gatewayId: "gateway-redsys",
        transactionId: "txn_RS789",
        notes: "Producto llegó dañado durante el envío, reembolso parcial por el artículo dañado",
        customerNotes: "Uno de los dos productos llegó roto",
        attachments: ["/uploads/refund-evidence-003-1.jpg"],
        timeline: [
          {
            status: "pending",
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            description: "Solicitud de reembolso recibida del cliente",
            user: "Sistema"
          },
          {
            status: "processing",
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            description: "Reembolso en proceso de validación",
            user: "Luis Martín"
          }
        ],
        automation: {
          isAutomatic: false,
          confidence: 70
        }
      },
      {
        id: "ref-004",
        orderId: "order-1145",
        orderNumber: "ORD-2024-1145",
        customerId: "customer-654",
        customerName: "Luis Martín",
        customerEmail: "luis.martin@email.com",
        originalAmount: 23.90,
        refundAmount: 23.90,
        currency: "EUR",
        reason: "duplicate_order",
        status: "approved",
        type: "full",
        method: "original_payment",
        requestDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        processedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        processedBy: "Sistema Automático",
        approvedBy: "Sistema Automático",
        gatewayId: "gateway-paypal",
        transactionId: "txn_PP456",
        notes: "Detectado pedido duplicado automáticamente",
        customerNotes: "Hice el pedido dos veces por error",
        attachments: [],
        timeline: [
          {
            status: "pending",
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            description: "Solicitud de reembolso recibida del cliente",
            user: "Sistema"
          },
          {
            status: "approved",
            timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            description: "Reembolso aprobado automáticamente - Pedido duplicado detectado",
            user: "Sistema Automático"
          }
        ],
        automation: {
          isAutomatic: true,
          ruleId: "rule-duplicate-order",
          confidence: 99
        }
      },
      {
        id: "ref-005",
        orderId: "order-1140",
        orderNumber: "ORD-2024-1140",
        customerId: "customer-987",
        customerName: "Carmen Jiménez",
        customerEmail: "carmen.jimenez@email.com",
        originalAmount: 67.30,
        refundAmount: 67.30,
        currency: "EUR",
        reason: "customer_request",
        status: "rejected",
        type: "full",
        method: "original_payment",
        requestDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        processedDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        processedBy: "Ana López",
        gatewayId: "gateway-stripe",
        transactionId: "txn_1PI5432",
        notes: "Solicitud fuera del período de devolución (más de 30 días)",
        customerNotes: "Ya no me gusta el producto",
        attachments: [],
        timeline: [
          {
            status: "pending",
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            description: "Solicitud de reembolso recibida del cliente",
            user: "Sistema"
          },
          {
            status: "rejected",
            timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
            description: "Reembolso rechazado - Fuera del período de devolución",
            user: "Ana López"
          }
        ],
        automation: {
          isAutomatic: false,
          confidence: 20
        }
      },
      {
        id: "ref-006",
        orderId: "order-1135",
        orderNumber: "ORD-2024-1135",
        customerId: "customer-123",
        customerName: "Miguel Torres",
        customerEmail: "miguel.torres@email.com",
        originalAmount: 134.75,
        refundAmount: 134.75,
        currency: "EUR",
        reason: "fraud",
        status: "completed",
        type: "full",
        method: "bank_transfer",
        requestDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        processedDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        completedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        processedBy: "Supervisor Seguridad",
        approvedBy: "Supervisor Seguridad",
        gatewayId: "gateway-stripe",
        transactionId: "txn_1PH9876",
        refundTransactionId: "re_1PH9877",
        notes: "Transacción fraudulenta detectada, reembolso inmediato",
        customerNotes: "No reconozco este cargo en mi tarjeta",
        attachments: ["/uploads/chargeback-evidence-006.pdf"],
        timeline: [
          {
            status: "pending",
            timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            description: "Solicitud de reembolso por fraude recibida",
            user: "Sistema"
          },
          {
            status: "approved",
            timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
            description: "Reembolso aprobado por departamento de seguridad",
            user: "Supervisor Seguridad"
          },
          {
            status: "completed",
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            description: "Reembolso procesado por transferencia bancaria",
            user: "Sistema"
          }
        ],
        automation: {
          isAutomatic: true,
          ruleId: "rule-fraud-detection",
          confidence: 97
        }
      }
    ]

    // Filter refunds based on parameters
    let filteredRefunds = refunds

    // Filter by timeframe
    const now = new Date()
    const timeframeDays = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    }[timeframe] || 30

    filteredRefunds = filteredRefunds.filter(refund => {
      const refundDate = new Date(refund.requestDate)
      const daysDiff = Math.floor((now.getTime() - refundDate.getTime()) / (1000 * 60 * 60 * 24))
      return daysDiff <= timeframeDays
    })

    // Filter by status
    if (status !== 'all') {
      filteredRefunds = filteredRefunds.filter(refund => refund.status === status)
    }

    // Filter by reason
    if (reason !== 'all') {
      filteredRefunds = filteredRefunds.filter(refund => refund.reason === reason)
    }

    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase()
      filteredRefunds = filteredRefunds.filter(refund => 
        refund.orderNumber.toLowerCase().includes(searchLower) ||
        refund.customerName.toLowerCase().includes(searchLower) ||
        refund.customerEmail.toLowerCase().includes(searchLower)
      )
    }

    // Sort by request date (most recent first)
    filteredRefunds.sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime())

    return NextResponse.json(filteredRefunds)

  } catch (error) {
    console.error("Error fetching refunds:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// POST - Create new refund
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const refundData = await request.json()

    // In a real implementation, you would:
    // 1. Validate refund data
    // 2. Check if order exists and is eligible for refund
    // 3. Calculate refund amount based on rules
    // 4. Apply automation rules
    // 5. Create refund record in database
    // 6. Initialize payment gateway refund if auto-approved
    // 7. Send notifications to customer and staff
    // 8. Log timeline events

    const newRefund: Refund = {
      id: `ref-${Date.now()}`,
      ...refundData,
      status: "pending",
      requestDate: new Date().toISOString(),
      timeline: [
        {
          status: "pending",
          timestamp: new Date().toISOString(),
          description: "Solicitud de reembolso creada manualmente",
          user: session.user.name || "Administrador"
        }
      ],
      automation: {
        isAutomatic: false,
        confidence: 50
      }
    }

    return NextResponse.json(newRefund)

  } catch (error) {
    console.error("Error creating refund:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}