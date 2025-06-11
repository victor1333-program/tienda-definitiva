import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// GET WhatsApp configuration
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // In a real implementation, this would be stored in database
    // For demo purposes, return mock configuration
    const config = {
      phoneNumber: "+34612345678",
      businessApiToken: process.env.WHATSAPP_BUSINESS_TOKEN || "",
      webhookToken: process.env.WHATSAPP_WEBHOOK_TOKEN || "",
      isConnected: Boolean(process.env.WHATSAPP_BUSINESS_TOKEN),
      enabledAlerts: {
        stockAlerts: true,
        orderUpdates: true,
        paymentReminders: false,
        productionAlerts: true,
        customerService: false,
        emergencyAlerts: true
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
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const config = await request.json()

    // In a real implementation, you would:
    // 1. Validate the configuration
    // 2. Store it securely in database
    // 3. Test the connection with WhatsApp API
    // 4. Update environment variables or secure storage

    // For demo purposes, we'll simulate saving
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