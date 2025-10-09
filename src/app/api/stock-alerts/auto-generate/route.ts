import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/auth"

// POST /api/stock-alerts/auto-generate - Generar alertas automáticamente
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación de admin
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }


    const alertsCreated = []
    const alertsUpdated = []

    // 1. Obtener materiales con stock bajo
    const lowStockMaterials = await db.material.findMany({
      where: {
        OR: [
          { currentStock: { lte: db.material.fields.minimumStock } },
          { currentStock: { lte: 5 } } // Threshold adicional
        ],
        isActive: true
      },
      include: {
        supplier: {
          select: { name: true, contactName: true, email: true }
        }
      }
    })

    // 2. Obtener variantes con stock bajo o sin stock
    const lowStockVariants = await db.productVariant.findMany({
      where: {
        OR: [
          { stock: { lte: 5 } }, // Stock bajo
          { stock: { equals: 0 } } // Sin stock
        ],
        isActive: true
      },
      include: {
        product: {
          select: { name: true, sku: true }
        }
      }
    })

    // 3. Obtener productos base con stock bajo o sin stock
    const lowStockProducts = await db.product.findMany({
      where: {
        OR: [
          { directStock: { lte: 5 } }, // Stock bajo
          { directStock: { equals: 0 } } // Sin stock
        ],
        isActive: true,
        // Solo productos que no tienen variantes (usan stock directo)
        variants: { none: {} }
      }
    })

    // 4. Crear/actualizar alertas para materiales
    for (const material of lowStockMaterials) {
      const alertType = material.currentStock === 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK'
      const priority = material.currentStock === 0 ? 'HIGH' : 
                      material.currentStock <= 1 ? 'HIGH' : 'MEDIUM'

      // Verificar si ya existe una alerta activa para este material
      const existingAlert = await db.stockAlert.findFirst({
        where: {
          materialId: material.id,
          isResolved: false,
          type: alertType
        }
      })

      if (!existingAlert) {
        const newAlert = await db.stockAlert.create({
          data: {
            type: alertType,
            message: `Material "${material.name}" ${alertType === 'OUT_OF_STOCK' ? 'sin stock' : 'con stock bajo'} (${material.currentStock} ${material.unit})`,
            priority,
            materialId: material.id,
            threshold: material.minimumStock || 5,
            currentValue: material.currentStock,
            isResolved: false,
            metadata: JSON.stringify({
              supplier: material.supplier?.name,
              contactEmail: material.supplier?.email,
              unit: material.unit,
              minimumStock: material.minimumStock
            })
          },
          include: {
            material: {
              select: { name: true, sku: true, unit: true }
            }
          }
        })
        alertsCreated.push(newAlert)
      } else {
        // Actualizar la alerta existente si el stock ha cambiado
        if (existingAlert.currentValue !== material.currentStock) {
          const updatedAlert = await db.stockAlert.update({
            where: { id: existingAlert.id },
            data: {
              currentValue: material.currentStock,
              message: `Material "${material.name}" ${alertType === 'OUT_OF_STOCK' ? 'sin stock' : 'con stock bajo'} (${material.currentStock} ${material.unit})`,
              priority,
              updatedAt: new Date()
            }
          })
          alertsUpdated.push(updatedAlert)
        }
      }
    }

    // 5. Crear/actualizar alertas para variantes
    for (const variant of lowStockVariants) {
      const alertType = variant.stock === 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK'
      const priority = variant.stock === 0 ? 'HIGH' : 
                      variant.stock <= 1 ? 'HIGH' : 'MEDIUM'

      const existingAlert = await db.stockAlert.findFirst({
        where: {
          variantId: variant.id,
          isResolved: false,
          type: alertType
        }
      })

      if (!existingAlert) {
        const newAlert = await db.stockAlert.create({
          data: {
            type: alertType,
            message: `Variante "${variant.product.name}" (${variant.sku}) ${alertType === 'OUT_OF_STOCK' ? 'sin stock' : 'con stock bajo'} (${variant.stock} unidades)`,
            priority,
            variantId: variant.id,
            threshold: 5, // Threshold por defecto para variantes
            currentValue: variant.stock,
            isResolved: false,
            metadata: JSON.stringify({
              productName: variant.product.name,
              variantSku: variant.sku,
              size: variant.size,
              color: variant.colorName,
              material: variant.material
            })
          }
        })
        alertsCreated.push(newAlert)
      } else {
        if (existingAlert.currentValue !== variant.stock) {
          const updatedAlert = await db.stockAlert.update({
            where: { id: existingAlert.id },
            data: {
              currentValue: variant.stock,
              message: `Variante "${variant.product.name}" (${variant.sku}) ${alertType === 'OUT_OF_STOCK' ? 'sin stock' : 'con stock bajo'} (${variant.stock} unidades)`,
              priority,
              updatedAt: new Date()
            }
          })
          alertsUpdated.push(updatedAlert)
        }
      }
    }

    // 6. Crear/actualizar alertas para productos base
    for (const product of lowStockProducts) {
      const alertType = product.directStock === 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK'
      const priority = product.directStock === 0 ? 'HIGH' : 
                      product.directStock <= 1 ? 'HIGH' : 'MEDIUM'

      const existingAlert = await db.stockAlert.findFirst({
        where: {
          productId: product.id,
          isResolved: false,
          type: alertType
        }
      })

      if (!existingAlert) {
        const newAlert = await db.stockAlert.create({
          data: {
            type: alertType,
            message: `Producto "${product.name}" ${alertType === 'OUT_OF_STOCK' ? 'sin stock' : 'con stock bajo'} (${product.directStock} unidades)`,
            priority,
            productId: product.id,
            threshold: product.minStock || 5,
            currentValue: product.directStock,
            isResolved: false,
            metadata: JSON.stringify({
              productSku: product.sku,
              minimumStock: product.minStock
            })
          }
        })
        alertsCreated.push(newAlert)
      } else {
        if (existingAlert.currentValue !== product.directStock) {
          const updatedAlert = await db.stockAlert.update({
            where: { id: existingAlert.id },
            data: {
              currentValue: product.directStock,
              message: `Producto "${product.name}" ${alertType === 'OUT_OF_STOCK' ? 'sin stock' : 'con stock bajo'} (${product.directStock} unidades)`,
              priority,
              updatedAt: new Date()
            }
          })
          alertsUpdated.push(updatedAlert)
        }
      }
    }

    // 7. Resolver alertas que ya no son relevantes (el stock se ha recuperado)
    const resolvedAlerts = await db.stockAlert.updateMany({
      where: {
        isResolved: false,
        OR: [
          // Materiales que ya tienen stock suficiente
          {
            AND: [
              { materialId: { not: null } },
              { materialId: { notIn: lowStockMaterials.map(m => m.id) } }
            ]
          },
          // Variantes que ya tienen stock suficiente
          {
            AND: [
              { variantId: { not: null } },
              { variantId: { notIn: lowStockVariants.map(v => v.id) } }
            ]
          },
          // Productos que ya tienen stock suficiente
          {
            AND: [
              { productId: { not: null } },
              { productId: { notIn: lowStockProducts.map(p => p.id) } }
            ]
          }
        ]
      },
      data: {
        isResolved: true,
        resolvedAt: new Date(),
        resolvedBy: 'system-auto',
        resolvedReason: 'Stock replenished automatically'
      }
    })

    const summary = {
      materialsChecked: lowStockMaterials.length,
      variantsChecked: lowStockVariants.length,
      productsChecked: lowStockProducts.length,
      alertsCreated: alertsCreated.length,
      alertsUpdated: alertsUpdated.length,
      alertsResolved: resolvedAlerts.count,
      timestamp: new Date().toISOString()
    }


    return NextResponse.json({
      success: true,
      message: `Generación automática completada: ${alertsCreated.length} alertas creadas, ${alertsUpdated.length} actualizadas, ${resolvedAlerts.count} resueltas`,
      summary,
      newAlerts: alertsCreated,
      updatedAlerts: alertsUpdated
    })

  } catch (error) {
    console.error('❌ Error en generación automática de alertas:', error)
    return NextResponse.json(
      { 
        error: "Error en la generación automática de alertas",
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}

// GET /api/stock-alerts/auto-generate - Status del sistema de alertas automáticas
export async function GET() {
  try {
    // Obtener estadísticas del sistema de alertas
    const stats = await db.stockAlert.groupBy({
      by: ['type', 'priority', 'isResolved'],
      _count: true
    })

    const lastAlert = await db.stockAlert.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true, type: true, priority: true }
    })

    return NextResponse.json({
      status: 'active',
      lastExecution: lastAlert?.createdAt || null,
      statistics: stats,
      message: 'Sistema de alertas automáticas funcionando correctamente'
    })

  } catch (error) {
    console.error('Error checking auto-alerts status:', error)
    return NextResponse.json(
      { error: "Error al verificar el estado del sistema de alertas" },
      { status: 500 }
    )
  }
}