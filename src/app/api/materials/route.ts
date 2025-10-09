import { NextRequest, NextResponse } from "next/server"
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const materialSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
  sku: z.string().min(1, "El SKU es requerido"),
  unit: z.enum(["KG", "G", "L", "ML", "M", "CM", "M2", "UNITS", "ROLLS", "SHEETS"]),
  currentStock: z.number().min(0),
  minimumStock: z.number().min(0),
  maximumStock: z.number().min(0).optional(),
  costPerUnit: z.number().min(0),
  supplierId: z.string().optional(),
  location: z.string().optional(),
  category: z.enum(["TEXTILES", "INKS", "FILMS", "SUBSTRATES", "TOOLS", "PACKAGING", "CHEMICALS", "OTHER"]),
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
    const category = searchParams.get("category")
    const supplierId = searchParams.get("supplierId")
    const lowStock = searchParams.get("lowStock") === "true"
    const isActive = searchParams.get("isActive")

    const materials = await db.material.findMany({
      where: {
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { sku: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } }
          ]
        }),
        ...(category && { category: category as any }),
        ...(supplierId && { supplierId }),
        ...(lowStock && {
          currentStock: { lte: db.material.fields.minimumStock }
        }),
        ...(isActive !== null && { isActive: isActive === "true" })
      },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            contactName: true,
            email: true,
            phone: true
          }
        },
        movements: {
          take: 5,
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        stockAlerts: {
          where: { isResolved: false },
          orderBy: { createdAt: "desc" }
        },
        _count: {
          select: {
            movements: true,
            stockAlerts: true
          }
        }
      },
      orderBy: { name: "asc" }
    })

    // Calculate statistics
    const stats = {
      total: materials.length,
      lowStock: materials.filter(m => m.currentStock <= m.minimumStock).length,
      outOfStock: materials.filter(m => m.currentStock === 0).length,
      totalValue: materials.reduce((sum, m) => sum + (m.currentStock * m.costPerUnit), 0)
    }

    return NextResponse.json({ materials, stats })

  } catch (error) {
    console.error("Error fetching materials:", error)
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
    const validatedData = materialSchema.parse(body)

    // Check if SKU already exists
    const existingSku = await db.material.findUnique({
      where: { sku: validatedData.sku }
    })

    if (existingSku) {
      return NextResponse.json(
        { error: "El SKU ya existe" },
        { status: 400 }
      )
    }

    const material = await db.material.create({
      data: validatedData,
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            contactName: true
          }
        }
      }
    })

    // Create initial stock movement if currentStock > 0
    if (validatedData.currentStock > 0) {
      await db.materialMovement.create({
        data: {
          materialId: material.id,
          type: "ADJUSTMENT",
          quantity: validatedData.currentStock,
          reason: "Stock inicial",
          userId: session.user.id
        }
      })
    }

    return NextResponse.json(material, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating material:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}