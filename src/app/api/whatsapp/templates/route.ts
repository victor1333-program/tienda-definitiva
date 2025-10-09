import { NextRequest, NextResponse } from "next/server"
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"

interface AlertTemplate {
  id: string
  name: string
  type: string
  message: string
  variables: string[]
  enabled: boolean
  priority: 'low' | 'medium' | 'high' | 'critical'
  category: string
}

// GET WhatsApp message templates
export async function GET() {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Mock alert templates for different scenarios
    const templates: AlertTemplate[] = [
      {
        id: "stock-low",
        name: "Stock Bajo",
        type: "stock_alert",
        message: "⚠️ *ALERTA DE STOCK*\n\nEl producto *{productName}* tiene stock bajo.\n\n📦 Stock actual: {currentStock}\n⚠️ Stock mínimo: {minStock}\n\n📞 Contacta con proveedores para reposición.",
        variables: ["productName", "currentStock", "minStock"],
        enabled: true,
        priority: "high",
        category: "inventory"
      },
      {
        id: "order-completed",
        name: "Pedido Completado",
        type: "order_update",
        message: "🎉 *PEDIDO COMPLETADO*\n\nEl pedido *{orderNumber}* ha sido completado exitosamente.\n\n📍 Cliente: {customerName}\n💰 Total: {orderTotal}€\n🚚 Estado: Listo para envío",
        variables: ["orderNumber", "customerName", "orderTotal"],
        enabled: true,
        priority: "medium",
        category: "orders"
      },
      {
        id: "payment-reminder",
        name: "Recordatorio de Pago",
        type: "payment_reminder",
        message: "💳 *RECORDATORIO DE PAGO*\n\nHola {customerName},\n\nTienes un pago pendiente por {amount}€.\n\n📅 Vencimiento: {dueDate}\n📎 Factura: {invoiceNumber}\n\nPor favor, realiza el pago lo antes posible.",
        variables: ["customerName", "amount", "dueDate", "invoiceNumber"],
        enabled: false,
        priority: "medium",
        category: "payments"
      },
      {
        id: "production-delay",
        name: "Retraso en Producción",
        type: "production_alert",
        message: "⚠️ *ALERTA DE PRODUCCIÓN*\n\nSe ha detectado un retraso en la producción.\n\n🏭 Pedido: {orderNumber}\n🕰️ Retraso estimado: {delayHours} horas\n📝 Motivo: {reason}\n\nRevisar proceso inmediatamente.",
        variables: ["orderNumber", "delayHours", "reason"],
        enabled: true,
        priority: "high",
        category: "production"
      },
      {
        id: "customer-inquiry",
        name: "Consulta de Cliente",
        type: "customer_service",
        message: "💬 *NUEVA CONSULTA*\n\nCliente: {customerName}\n📞 Teléfono: {customerPhone}\n\n📝 Consulta:\n{inquiry}\n\nResponder lo antes posible.",
        variables: ["customerName", "customerPhone", "inquiry"],
        enabled: false,
        priority: "medium",
        category: "support"
      },
      {
        id: "system-error",
        name: "Error del Sistema",
        type: "emergency_alert",
        message: "🚨 *ALERTA CRÍTICA*\n\nError detectado en el sistema.\n\n🚫 Componente: {component}\n⚠️ Severidad: {severity}\n🕰️ Hora: {timestamp}\n\n🔧 Acción requerida inmediatamente.",
        variables: ["component", "severity", "timestamp"],
        enabled: true,
        priority: "critical",
        category: "system"
      },
      {
        id: "material-low",
        name: "Material Bajo",
        type: "material_alert",
        message: "🧵 *MATERIAL AGOTÁNDOSE*\n\nEl material de producción está por agotarse.\n\n🎨 Material: {materialName}\n📊 Cantidad restante: {remaining} {unit}\n📅 Duración estimada: {estimatedDays} días\n\nPedir reposición urgente.",
        variables: ["materialName", "remaining", "unit", "estimatedDays"],
        enabled: true,
        priority: "high",
        category: "materials"
      },
      {
        id: "quality-issue",
        name: "Problema de Calidad",
        type: "quality_alert",
        message: "❌ *PROBLEMA DE CALIDAD*\n\nDetectado problema en control de calidad.\n\n📦 Producto: {productName}\n🔍 Defecto: {defectType}\n📊 Lote afectado: {batchNumber}\n\nDetener producción y revisar proceso.",
        variables: ["productName", "defectType", "batchNumber"],
        enabled: true,
        priority: "critical",
        category: "quality"
      }
    ]

    return NextResponse.json(templates)

  } catch (error) {
    console.error("Error fetching WhatsApp templates:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// POST - Update template configuration
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { templateId, enabled } = await request.json()

    // In a real implementation, you would update the template in database

    return NextResponse.json({
      success: true,
      message: "Template actualizado correctamente"
    })

  } catch (error) {
    console.error("Error updating template:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}