import { NextRequest, NextResponse } from "next/server"
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = params
    
    // In a real implementation, this would fetch the specific order from database
    const mockOrder = {
      id,
      orderNumber: `PROD-2024-${id.padStart(3, '0')}`,
      productName: 'Producto de Ejemplo',
      quantity: 50,
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      estimatedTime: 8,
      createdAt: new Date().toISOString()
    }

    return NextResponse.json(mockOrder)

  } catch (error) {
    console.error("Error fetching production order:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = params
    const updates = await request.json()
    
    // In a real implementation, this would update the order in database
    const updatedOrder = {
      id,
      ...updates,
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({ success: true, order: updatedOrder })

  } catch (error) {
    console.error("Error updating production order:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = params
    
    // In a real implementation, this would delete the order from database
    
    return NextResponse.json({ success: true, message: "Orden eliminada correctamente" })

  } catch (error) {
    console.error("Error deleting production order:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}