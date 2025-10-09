import { NextRequest, NextResponse } from "next/server"
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"

interface RefundRule {
  id: string
  name: string
  description: string
  isEnabled: boolean
  priority: number
  conditions: {
    orderAge: number // days
    maxAmount: number
    reasons: string[]
    customerTier: string[]
    productCategories: string[]
  }
  actions: {
    autoApprove: boolean
    requiresReview: boolean
    notifyCustomer: boolean
    refundMethod: string
    processingTime: number // hours
  }
  statistics: {
    totalProcessed: number
    successRate: number
    averageTime: number
  }
  createdAt: string
  updatedAt: string
  createdBy: string
}

// GET refund rules
export async function GET() {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Mock refund rules
    const refundRules: RefundRule[] = [
      {
        id: "rule-001",
        name: "Reembolso Instantáneo - Pedidos Pequeños",
        description: "Auto-aprobar reembolsos de pedidos menores a 50€ solicitados dentro de 7 días",
        isEnabled: true,
        priority: 10,
        conditions: {
          orderAge: 7,
          maxAmount: 50.00,
          reasons: ["customer_request", "duplicate_order"],
          customerTier: ["standard", "premium", "vip"],
          productCategories: ["textil", "accesorios"]
        },
        actions: {
          autoApprove: true,
          requiresReview: false,
          notifyCustomer: true,
          refundMethod: "original_payment",
          processingTime: 1
        },
        statistics: {
          totalProcessed: 89,
          successRate: 98.9,
          averageTime: 0.8
        },
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-12-01T14:30:00Z",
        createdBy: "Ana López"
      },
      {
        id: "rule-002",
        name: "Producto Defectuoso - Revisión Rápida",
        description: "Procesamiento rápido para productos defectuosos con evidencia",
        isEnabled: true,
        priority: 9,
        conditions: {
          orderAge: 30,
          maxAmount: 200.00,
          reasons: ["defective_product"],
          customerTier: ["standard", "premium", "vip"],
          productCategories: ["textil", "sublimacion", "bordado"]
        },
        actions: {
          autoApprove: false,
          requiresReview: true,
          notifyCustomer: true,
          refundMethod: "original_payment",
          processingTime: 4
        },
        statistics: {
          totalProcessed: 34,
          successRate: 94.1,
          averageTime: 3.2
        },
        createdAt: "2024-01-20T09:15:00Z",
        updatedAt: "2024-11-28T16:45:00Z",
        createdBy: "Luis Martín"
      },
      {
        id: "rule-003",
        name: "Clientes VIP - Procesamiento Prioritario",
        description: "Procesamiento prioritario para clientes VIP independientemente del monto",
        isEnabled: true,
        priority: 8,
        conditions: {
          orderAge: 60,
          maxAmount: 1000.00,
          reasons: ["customer_request", "defective_product", "shipping_issue"],
          customerTier: ["vip"],
          productCategories: ["all"]
        },
        actions: {
          autoApprove: false,
          requiresReview: true,
          notifyCustomer: true,
          refundMethod: "original_payment",
          processingTime: 2
        },
        statistics: {
          totalProcessed: 12,
          successRate: 100.0,
          averageTime: 1.5
        },
        createdAt: "2024-02-01T11:30:00Z",
        updatedAt: "2024-12-10T10:20:00Z",
        createdBy: "Carlos Supervisor"
      },
      {
        id: "rule-004",
        name: "Detección Pedidos Duplicados",
        description: "Auto-detectar y procesar reembolsos de pedidos duplicados",
        isEnabled: true,
        priority: 10,
        conditions: {
          orderAge: 1,
          maxAmount: 999999.99,
          reasons: ["duplicate_order"],
          customerTier: ["standard", "premium", "vip"],
          productCategories: ["all"]
        },
        actions: {
          autoApprove: true,
          requiresReview: false,
          notifyCustomer: true,
          refundMethod: "original_payment",
          processingTime: 0.5
        },
        statistics: {
          totalProcessed: 12,
          successRate: 100.0,
          averageTime: 0.3
        },
        createdAt: "2024-02-10T08:45:00Z",
        updatedAt: "2024-12-15T13:10:00Z",
        createdBy: "Sistema Automático"
      },
      {
        id: "rule-005",
        name: "Problemas de Envío - Revisión Manual",
        description: "Reembolsos por problemas de envío requieren validación con transportista",
        isEnabled: true,
        priority: 7,
        conditions: {
          orderAge: 14,
          maxAmount: 300.00,
          reasons: ["shipping_issue"],
          customerTier: ["standard", "premium", "vip"],
          productCategories: ["all"]
        },
        actions: {
          autoApprove: false,
          requiresReview: true,
          notifyCustomer: true,
          refundMethod: "original_payment",
          processingTime: 8
        },
        statistics: {
          totalProcessed: 23,
          successRate: 87.0,
          averageTime: 6.5
        },
        createdAt: "2024-02-15T14:20:00Z",
        updatedAt: "2024-12-05T09:30:00Z",
        createdBy: "Ana López"
      },
      {
        id: "rule-006",
        name: "Fraude - Procesamiento Especial",
        description: "Casos de fraude requieren revisión del departamento de seguridad",
        isEnabled: true,
        priority: 10,
        conditions: {
          orderAge: 180,
          maxAmount: 999999.99,
          reasons: ["fraud"],
          customerTier: ["standard", "premium", "vip"],
          productCategories: ["all"]
        },
        actions: {
          autoApprove: false,
          requiresReview: true,
          notifyCustomer: false,
          refundMethod: "bank_transfer",
          processingTime: 24
        },
        statistics: {
          totalProcessed: 4,
          successRate: 100.0,
          averageTime: 18.5
        },
        createdAt: "2024-03-01T16:00:00Z",
        updatedAt: "2024-12-01T12:45:00Z",
        createdBy: "Supervisor Seguridad"
      },
      {
        id: "rule-007",
        name: "Reembolsos de Alto Valor",
        description: "Reembolsos superiores a 200€ requieren aprobación de supervisor",
        isEnabled: true,
        priority: 6,
        conditions: {
          orderAge: 30,
          maxAmount: 999999.99,
          reasons: ["customer_request", "defective_product", "shipping_issue", "other"],
          customerTier: ["standard", "premium", "vip"],
          productCategories: ["all"]
        },
        actions: {
          autoApprove: false,
          requiresReview: true,
          notifyCustomer: true,
          refundMethod: "original_payment",
          processingTime: 12
        },
        statistics: {
          totalProcessed: 18,
          successRate: 88.9,
          averageTime: 8.2
        },
        createdAt: "2024-03-10T12:30:00Z",
        updatedAt: "2024-11-20T15:15:00Z",
        createdBy: "Carlos Supervisor"
      },
      {
        id: "rule-008",
        name: "Fuera de Período - Rechazo Automático",
        description: "Auto-rechazar solicitudes fuera del período de devolución (excepto defectos)",
        isEnabled: false, // Desactivada para revisión manual
        priority: 5,
        conditions: {
          orderAge: 30,
          maxAmount: 999999.99,
          reasons: ["customer_request"],
          customerTier: ["standard"],
          productCategories: ["all"]
        },
        actions: {
          autoApprove: false,
          requiresReview: true,
          notifyCustomer: true,
          refundMethod: "none",
          processingTime: 1
        },
        statistics: {
          totalProcessed: 8,
          successRate: 12.5, // Most are rejected
          averageTime: 0.5
        },
        createdAt: "2024-04-01T10:00:00Z",
        updatedAt: "2024-12-20T14:00:00Z",
        createdBy: "Sistema Automático"
      }
    ]

    // Sort by priority (highest first) and then by enabled status
    refundRules.sort((a, b) => {
      if (a.isEnabled && !b.isEnabled) return -1
      if (!a.isEnabled && b.isEnabled) return 1
      return b.priority - a.priority
    })

    return NextResponse.json(refundRules)

  } catch (error) {
    console.error("Error fetching refund rules:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// POST - Create new refund rule
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const ruleData = await request.json()

    // In a real implementation, you would:
    // 1. Validate rule data and conditions
    // 2. Check for conflicts with existing rules
    // 3. Test rule logic
    // 4. Save to database
    // 5. Log rule creation for audit
    // 6. Notify relevant staff

    const newRule: RefundRule = {
      id: `rule-${Date.now()}`,
      ...ruleData,
      isEnabled: false, // Start disabled for testing
      statistics: {
        totalProcessed: 0,
        successRate: 0,
        averageTime: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: session.user.name || "Administrador"
    }

    return NextResponse.json(newRule)

  } catch (error) {
    console.error("Error creating refund rule:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}