import { NextRequest, NextResponse } from 'next/server'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { addBrandStock, getBrandStockSummary } from '@/lib/brand-stock'
import { z } from 'zod'

const createBrandStockSchema = z.object({
  variantId: z.string().cuid(),
  brand: z.string().min(1),
  supplierId: z.string().cuid().optional(),
  supplierSku: z.string().optional(),
  quantity: z.number().int().min(0),
  costPrice: z.number().positive(),
  salePrice: z.number().positive().optional(),
  location: z.string().optional(),
  batch: z.string().optional(),
  isPreferred: z.boolean().optional(),
  priority: z.number().int().min(0).optional(),
  minStock: z.number().int().min(0).optional(),
  maxStock: z.number().int().min(0).optional(),
  notes: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const variantId = searchParams.get('variantId')

    if (!variantId) {
      return NextResponse.json({ error: 'variantId es requerido' }, { status: 400 })
    }

    const summary = await getBrandStockSummary(variantId)
    return NextResponse.json(summary)

  } catch (error) {
    console.error('Error al obtener stock de marcas:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createBrandStockSchema.parse(body)

    const brandStock = await addBrandStock({
      ...validatedData,
      userId: session.user.id
    })

    return NextResponse.json(brandStock, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error al crear stock de marca:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}