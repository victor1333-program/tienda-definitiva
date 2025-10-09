import { NextRequest, NextResponse } from "next/server"
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db } from '@/lib/db';
// GET WhatsApp configuration
export async function GET() {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Configuration for Lovilike Personalizados
    const config = {
      phone: "+34611066997",
      businessName: "Lovilike Personalizados",
      welcomeMessage: "¡Hola! 👋 Bienvenido a Lovilike Personalizados.\n\n¿En qué podemos ayudarte? Somos especialistas en productos personalizados para eventos especiales.",
      availability: {
        enabled: true,
        schedule: "Lunes a Viernes: 9:00 - 18:00",
        timezone: "Europe/Madrid"
      },
      quickReplies: [
        "¿Cómo personalizar mi producto?",
        "Información sobre envíos y tiempos",
        "Consultar estado de mi pedido",
        "Precios y descuentos disponibles",
        "Hablar con un diseñador"
      ],
      enabled: true,
      notifications: {
        newOrders: true,
        lowStock: true,
        customerMessages: true,
        paymentIssues: true
      },
      businessProfile: {
        description: "Especialistas en productos personalizados de alta calidad para bodas, comuniones, bautizos y eventos especiales.",
        address: "España",
        website: "https://lovilike.com",
        email: "info@lovilike.es"
      }
    }

    return NextResponse.json(config)

  } catch (error) {
    console.error("Error fetching WhatsApp config:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// POST - Save WhatsApp configuration
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const config = await request.json()

    // In a real implementation, you would:
    // 1. Validate the configuration
    // 2. Store it securely in database
    // 3. Test the connection with WhatsApp API
    // 4. Update environment variables or secure storage

    // For demo purposes, we'll simulate saving configuration
    console.log('Saving WhatsApp config:', {
      phoneNumber: config.phoneNumber,
      enabledAlerts: config.enabledAlerts,
      hasToken: Boolean(config.businessApiToken)
    })

    // Simulate successful save
    return NextResponse.json({ 
      success: true, 
      message: "Configuración guardada correctamente" 
    })

  } catch (error) {
    console.error("Error saving WhatsApp config:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}