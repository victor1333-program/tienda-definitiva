import { NextRequest, NextResponse } from "next/server"
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"

interface SentMessage {
  id: string
  recipient: string
  message: string
  type: string
  status: 'sent' | 'delivered' | 'read' | 'failed'
  timestamp: string
  priority: string
}

// GET WhatsApp message history
export async function GET() {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Mock message history for demonstration
    const messages: SentMessage[] = [
      {
        id: "msg_001",
        recipient: "+34612345678",
        message: "⚠️ ALERTA DE STOCK - El producto Camiseta Premium tiene stock bajo. Stock actual: 5, Mínimo: 10. Contacta con proveedores.",
        type: "stock_alert",
        status: "delivered",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        priority: "high"
      },
      {
        id: "msg_002",
        recipient: "+34687654321",
        message: "🎉 PEDIDO COMPLETADO - El pedido ORD-2024-1034 ha sido completado. Cliente: María González, Total: 89.99€. Listo para envío.",
        type: "order_update",
        status: "read",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
        priority: "medium"
      },
      {
        id: "msg_003",
        recipient: "+34123456789",
        message: "Mensaje de prueba desde el sistema WhatsApp de Lovilike. Conexión verificada correctamente.",
        type: "test",
        status: "delivered",
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        priority: "low"
      },
      {
        id: "msg_004",
        recipient: "+34611223344",
        message: "🧵 MATERIAL AGOTÁNDOSE - El material Tinta Subl. Color Negro está por agotarse. Cantidad: 2.5kg, Duración: 3 días.",
        type: "material_alert",
        status: "sent",
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
        priority: "high"
      },
      {
        id: "msg_005",
        recipient: "+34644556677",
        message: "⚠️ ALERTA DE PRODUCCIÓN - Retraso detectado en pedido ORD-2024-1035. Retraso: 4 horas. Motivo: Falta de material.",
        type: "production_alert",
        status: "failed",
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
        priority: "high"
      },
      {
        id: "msg_006",
        recipient: "+34677889900",
        message: "🚨 ALERTA CRÍTICA - Error en sistema de pagos. Componente: Payment Gateway, Severidad: Alta. Acción inmediata requerida.",
        type: "emergency_alert",
        status: "delivered",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        priority: "critical"
      },
      {
        id: "msg_007",
        recipient: "+34655443322",
        message: "🎉 PEDIDO COMPLETADO - El pedido ORD-2024-1036 ha sido completado. Cliente: Carlos Ruiz, Total: 156.50€.",
        type: "order_update",
        status: "read",
        timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(), // 1.5 days ago
        priority: "medium"
      },
      {
        id: "msg_008",
        recipient: "+34699887766",
        message: "❌ PROBLEMA DE CALIDAD - Defecto en Taza Cerámica. Tipo: Impresión borrosa. Lote: TZ-2024-034. Revisar proceso.",
        type: "quality_alert",
        status: "delivered",
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 2 days ago
        priority: "critical"
      }
    ]

    // Sort by timestamp (most recent first)
    messages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return NextResponse.json(messages)

  } catch (error) {
    console.error("Error fetching WhatsApp messages:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}