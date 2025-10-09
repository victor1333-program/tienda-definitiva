import { NextRequest, NextResponse } from 'next/server'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { adjustBrandStock, updateVariantAggregatedStock } from '@/lib/brand-stock'
import { db as prisma } from '@/lib/db'
import { z } from 'zod'

const updateBrandStockSchema = z.object({
  quantity: z.number().int().min(0).optional(),
  costPrice: z.number().positive().optional(),
  salePrice: z.number().positive().optional(),
  location: z.string().optional(),
  batch: z.string().optional(),
  isPreferred: z.boolean().optional(),
  priority: z.number().int().min(0).optional(),
  minStock: z.number().int().min(0).optional(),
  maxStock: z.number().int().min(0).optional(),
  notes: z.string().optional(),
  isActive: z.boolean().optional(),
})

const adjustStockSchema = z.object({
  quantity: z.number().int().min(0),
  reason: z.string().min(1),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const brandStock = await prisma.brandStock.findUnique({
      where: { id: id },
      include: {
        variant: {
          include: {
            product: {
              select: { name: true }
            }
          }
        },
        supplier: {
          select: { name: true }
        },
        stockMovements: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        },
        orderAllocations: {
          where: {
            status: 'ALLOCATED'
          },
          include: {
            orderItem: {
              include: {
                order: {
                  select: { id: true, status: true }
                }
              }
            }
          }
        }
      }
    })

    if (!brandStock) {
      return NextResponse.json({ error: 'Stock de marca no encontrado' }, { status: 404 })
    }

    return NextResponse.json(brandStock)

  } catch (error) {
    console.error('Error al obtener stock de marca:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
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
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateBrandStockSchema.parse(body)

    const currentStock = await prisma.brandStock.findUnique({
      where: { id: id }
    })

    if (!currentStock) {
      return NextResponse.json({ error: 'Stock de marca no encontrado' }, { status: 404 })
    }

    // Si se está cambiando la cantidad, usar adjustBrandStock para registrar el movimiento
    if (validatedData.quantity !== undefined && validatedData.quantity !== currentStock.quantity) {
      const updatedStock = await adjustBrandStock(
        id,
        validatedData.quantity,
        'Ajuste manual desde panel admin',
        session.user.id
      )

      // Actualizar otros campos si los hay
      const otherUpdates = { ...validatedData }
      delete otherUpdates.quantity

      if (Object.keys(otherUpdates).length > 0) {
        const finalStock = await prisma.brandStock.update({
          where: { id: id },
          data: otherUpdates
        })
        return NextResponse.json(finalStock)
      }

      return NextResponse.json(updatedStock)
    }

    // Si no se cambia la cantidad, actualizar directamente
    const updatedStock = await prisma.brandStock.update({
      where: { id: id },
      data: validatedData
    })

    return NextResponse.json(updatedStock)

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error al actualizar stock de marca:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
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
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const brandStock = await prisma.brandStock.findUnique({
      where: { id: id },
      include: {
        orderAllocations: {
          where: {
            status: { in: ['ALLOCATED', 'FULFILLED'] }
          }
        }
      }
    })

    if (!brandStock) {
      return NextResponse.json({ error: 'Stock de marca no encontrado' }, { status: 404 })
    }

    // Verificar si hay asignaciones activas
    if (brandStock.orderAllocations.length > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar: existen pedidos asignados a este stock' },
        { status: 400 }
      )
    }

    await prisma.brandStock.delete({
      where: { id: id }
    })

    // Actualizar stock agregado
    await updateVariantAggregatedStock(brandStock.variantId)

    return NextResponse.json({ message: 'Stock de marca eliminado correctamente' })

  } catch (error) {
    console.error('Error al eliminar stock de marca:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Endpoint específico para ajustar stock
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { quantity, reason } = adjustStockSchema.parse(body)

    const updatedStock = await adjustBrandStock(
      id,
      quantity,
      reason,
      session.user.id
    )

    return NextResponse.json(updatedStock)

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error al ajustar stock de marca:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}