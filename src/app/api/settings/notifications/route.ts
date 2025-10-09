import { NextRequest, NextResponse } from "next/server"
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"

// Mock notification settings storage
// In a real implementation, this would be stored in the database
let notificationSettings = {
  email: {
    enabled: true,
    newOrders: true,
    paymentIssues: true,
    lowStock: true,
    customerMessages: false,
    systemAlerts: true,
    dailyReports: false,
    weeklyReports: false
  },
  inApp: {
    enabled: true,
    newOrders: true,
    paymentIssues: true,
    lowStock: true,
    customerMessages: true,
    systemAlerts: true,
    sound: true
  },
  whatsapp: {
    enabled: false,
    phoneNumber: '',
    urgentOnly: true,
    businessHours: true
  },
  preferences: {
    frequency: 'instant' as 'instant' | 'hourly' | 'daily',
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    },
    categories: {
      orders: { priority: 'high' as 'high' | 'medium' | 'low', enabled: true },
      payments: { priority: 'high' as 'high' | 'medium' | 'low', enabled: true },
      inventory: { priority: 'medium' as 'high' | 'medium' | 'low', enabled: true },
      customers: { priority: 'medium' as 'high' | 'medium' | 'low', enabled: true },
      system: { priority: 'low' as 'high' | 'medium' | 'low', enabled: true },
      production: { priority: 'medium' as 'high' | 'medium' | 'low', enabled: true }
    }
  },
  thresholds: {
    lowStockThreshold: 10,
    highValueOrderThreshold: 500,
    paymentFailureThreshold: 3,
    responseTimeThreshold: 24
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    return NextResponse.json(notificationSettings)

  } catch (error) {
    console.error("Error loading notification settings:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate and update settings
    notificationSettings = { ...notificationSettings, ...body }

    // In a real implementation, you would:
    // 1. Validate the settings schema
    // 2. Save to database
    // 3. Update notification service configurations
    // 4. Log the change for audit

    return NextResponse.json({ 
      success: true, 
      message: "Configuración actualizada correctamente",
      settings: notificationSettings 
    })

  } catch (error) {
    console.error("Error updating notification settings:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}