import { NextRequest, NextResponse } from "next/server"
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const supplierSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  contactName: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  notes: z.string().optional(),
  isActive: z.boolean().default(true)
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const supplier = await db.supplier.findUnique({
      where: { id: id },
      include: {
        materials: {
          include: {
            movements: {
              take: 10,
              orderBy: { createdAt: "desc" }
            }
          }
        },
        purchaseOrders: {
          take: 10,
          orderBy: { createdAt: "desc" }
        },
        _count: {
          select: {
            materials: true,
            purchaseOrders: true
          }
        }
      }
    })

    if (!supplier) {
      return NextResponse.json(
        { error: "Proveedor no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(supplier)

  } catch (error) {
    console.error("Error fetching supplier:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = supplierSchema.parse(body)

    const supplier = await db.supplier.update({
      where: { id: id },
      data: validatedData,
      include: {
        _count: {
          select: {
            materials: true,
            purchaseOrders: true
          }
        }
      }
    })

    return NextResponse.json(supplier)

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error updating supplier:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Check if supplier has associated materials
    const materialsCount = await db.material.count({
      where: { supplierId: id }
    })

    if (materialsCount > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar un proveedor que tiene materiales asociados" },
        { status: 400 }
      )
    }

    await db.supplier.delete({
      where: { id: id }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Error deleting supplier:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}