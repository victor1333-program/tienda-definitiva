import { NextRequest, NextResponse } from 'next/server'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { allocateStockForOrder, applyStockAllocations } from '@/lib/brand-stock'
import { z } from 'zod'

const allocateStockSchema = z.object({
  variantId: z.string().cuid(),
  quantity: z.number().int().positive(),
  orderItemId: z.string().cuid().optional(), // Si se proporciona, se aplica la asignación automáticamente
  preview: z.boolean().optional() // Si es true, solo simula sin aplicar
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { variantId, quantity, orderItemId, preview } = allocateStockSchema.parse(body)

    // Realizar la asignación (simulación o real)
    const allocationResult = await allocateStockForOrder(variantId, quantity)

    if (!allocationResult.success) {
      return NextResponse.json(allocationResult, { status: 400 })
    }

    // Si es solo preview, devolver el resultado sin aplicar
    if (preview) {
      return NextResponse.json({
        ...allocationResult,
        message: 'Simulación de asignación'
      })
    }

    // Si se proporciona orderItemId, aplicar la asignación
    if (orderItemId) {
      const appliedAllocations = await applyStockAllocations(
        orderItemId,
        allocationResult.allocations,
        session.user.id
      )

      return NextResponse.json({
        ...allocationResult,
        appliedAllocations,
        message: 'Asignación aplicada correctamente'
      })
    }

    // Si no hay orderItemId, solo devolver la propuesta de asignación
    return NextResponse.json({
      ...allocationResult,
      message: 'Propuesta de asignación generada'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error al asignar stock:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}