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

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const isActive = searchParams.get("isActive")

    const suppliers = await db.supplier.findMany({
      where: {
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { contactName: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } }
          ]
        }),
        ...(isActive !== null && { isActive: isActive === "true" })
      },
      include: {
        materials: {
          select: {
            id: true,
            name: true,
            currentStock: true,
            minimumStock: true
          }
        },
        _count: {
          select: {
            materials: true,
            purchaseOrders: true
          }
        }
      },
      orderBy: { name: "asc" }
    })

    return NextResponse.json(suppliers)

  } catch (error) {
    console.error("Error fetching suppliers:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = supplierSchema.parse(body)

    const supplier = await db.supplier.create({
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

    return NextResponse.json(supplier, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating supplier:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}