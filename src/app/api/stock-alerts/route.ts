import { NextRequest, NextResponse } from "next/server"
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const isResolved = searchParams.get("isResolved")

    const alerts = await db.stockAlert.findMany({
      where: {
        ...(type && { type: type as any }),
        ...(isResolved !== null && { isResolved: isResolved === "true" })
      },
      include: {
        material: {
          select: {
            id: true,
            name: true,
            sku: true,
            unit: true,
            currentStock: true,
            minimumStock: true,
            supplier: {
              select: {
                name: true,
                contactName: true
              }
            }
          }
        },
        variant: {
          select: {
            id: true,
            sku: true,
            stock: true,
            product: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(alerts)

  } catch (error) {
    console.error("Error fetching stock alerts:", error)
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

    // Check for low stock materials
    const lowStockMaterials = await db.material.findMany({
      where: {
        currentStock: { lte: db.material.fields.minimumStock },
        isActive: true
      }
    })

    // Check for low stock variants
    const lowStockVariants = await db.productVariant.findMany({
      where: {
        stock: { lte: 5 }, // Default threshold
        isActive: true
      },
      include: {
        product: {
          select: { name: true }
        }
      }
    })

    const alertsCreated = []

    // Create material alerts
    for (const material of lowStockMaterials) {
      const existingAlert = await db.stockAlert.findFirst({
        where: {
          materialId: material.id,
          type: material.currentStock === 0 ? "OUT_OF_STOCK" : "LOW_STOCK",
          isResolved: false
        }
      })

      if (!existingAlert) {
        const alert = await db.stockAlert.create({
          data: {
            type: material.currentStock === 0 ? "OUT_OF_STOCK" : "LOW_STOCK",
            materialId: material.id,
            threshold: material.minimumStock,
            currentStock: material.currentStock,
            message: material.currentStock === 0 
              ? `Material ${material.name} sin stock`
              : `Stock bajo en material ${material.name}: ${material.currentStock} ${material.unit} (mínimo: ${material.minimumStock})`
          },
          include: {
            material: {
              select: {
                name: true,
                sku: true,
                unit: true
              }
            }
          }
        })
        alertsCreated.push(alert)
      }
    }

    // Create variant alerts
    for (const variant of lowStockVariants) {
      const existingAlert = await db.stockAlert.findFirst({
        where: {
          variantId: variant.id,
          type: variant.stock === 0 ? "OUT_OF_STOCK" : "LOW_STOCK",
          isResolved: false
        }
      })

      if (!existingAlert) {
        const alert = await db.stockAlert.create({
          data: {
            type: variant.stock === 0 ? "OUT_OF_STOCK" : "LOW_STOCK",
            variantId: variant.id,
            threshold: 5, // Default threshold
            currentStock: variant.stock,
            message: variant.stock === 0 
              ? `Producto ${variant.product.name} sin stock`
              : `Stock bajo en producto ${variant.product.name}: ${variant.stock} unidades`
          },
          include: {
            variant: {
              select: {
                sku: true,
                product: {
                  select: { name: true }
                }
              }
            }
          }
        })
        alertsCreated.push(alert)
      }
    }

    return NextResponse.json({ 
      success: true, 
      alertsCreated: alertsCreated.length,
      alerts: alertsCreated 
    })

  } catch (error) {
    console.error("Error generating stock alerts:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { alertIds, action } = await request.json()

    if (action === "resolve") {
      await db.stockAlert.updateMany({
        where: { id: { in: alertIds } },
        data: {
          isResolved: true,
          resolvedAt: new Date()
        }
      })

      return NextResponse.json({ success: true, message: "Alertas resueltas" })
    }

    return NextResponse.json({ error: "Acción no válida" }, { status: 400 })

  } catch (error) {
    console.error("Error updating stock alerts:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}