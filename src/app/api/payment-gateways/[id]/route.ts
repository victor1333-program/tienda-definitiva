import { NextRequest, NextResponse } from "next/server"
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"

// PUT - Update payment gateway
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const gatewayId = id
    const updateData = await request.json()

    // In a real implementation, you would:
    // 1. Validate gateway exists
    // 2. Check permissions for update
    // 3. Validate update data
    // 4. Update in database
    // 5. Refresh gateway connection if needed
    // 6. Log changes for audit
    // 7. Notify relevant systems

    // Mock update response
    const updatedGateway = {
      id: gatewayId,
      ...updateData,
      updatedAt: new Date().toISOString(),
      lastSync: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      message: "Pasarela actualizada correctamente",
      data: updatedGateway
    })

  } catch (error) {
    console.error("Error updating payment gateway:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// DELETE - Remove payment gateway
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "No autorizado - Solo Super Admin" }, { status: 401 })
    }

    const gatewayId = id

    // In a real implementation, you would:
    // 1. Check if gateway has pending transactions
    // 2. Disable gateway first
    // 3. Move historical data to archive
    // 4. Remove gateway configuration
    // 5. Update dependent payment methods
    // 6. Log deletion for audit

    return NextResponse.json({
      success: true,
      message: "Pasarela eliminada correctamente"
    })

  } catch (error) {
    console.error("Error deleting payment gateway:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}