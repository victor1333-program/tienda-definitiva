import { NextRequest, NextResponse } from 'next/server'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db } from '@/lib/db'
import { z } from 'zod'

const createElementSchema = z.object({
  printAreaId: z.string(),
  orderItemId: z.string().optional(),
  type: z.enum(['TEXT', 'IMAGE', 'SHAPE', 'CLIPART', 'SVG']),
  content: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number().positive(),
  height: z.number().positive(),
  rotation: z.number().default(0),
  scaleX: z.number().positive().default(1),
  scaleY: z.number().positive().default(1),
  opacity: z.number().min(0).max(1).default(1),
  style: z.record(z.any()).default({}),
  zIndex: z.number().int().default(0),
  isLocked: z.boolean().default(false),
  isVisible: z.boolean().default(true)
})

const updateElementSchema = createElementSchema.partial().omit(['printAreaId'])

// GET /api/personalization/elements - Obtener elementos de diseño
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }
    const { searchParams } = new URL(request.url)
    const printAreaId = searchParams.get('printAreaId')
    const orderItemId = searchParams.get('orderItemId')

    let where = {}
    
    if (printAreaId) {
      where = { printAreaId }
    } else if (orderItemId) {
      where = { orderItemId }
    }

    const elements = await db.designElement.findMany({
      where,
      include: {
        printArea: {
          include: {
            side: {
              include: {
                product: {
                  select: { id: true, name: true, slug: true }
                }
              }
            }
          }
        },
        orderItem: {
          select: { id: true, orderId: true }
        }
      },
      orderBy: [
        { zIndex: 'asc' },
        { createdAt: 'asc' }
      ]
    })

    return NextResponse.json({
      success: true,
      data: elements
    })
  } catch (error) {
    console.error('Error fetching design elements:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener los elementos de diseño' },
      { status: 500 }
    )
  }
}

// POST /api/personalization/elements - Crear nuevo elemento
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }
    const body = await request.json()
    const validatedData = createElementSchema.parse(body)

    // Verificar que el área de impresión existe
    const printArea = await db.printArea.findUnique({
      where: { id: validatedData.printAreaId },
      include: {
        side: {
          include: {
            product: {
              select: { id: true, name: true }
            }
          }
        }
      }
    })

    if (!printArea) {
      return NextResponse.json(
        { success: false, error: 'El área de impresión no existe' },
        { status: 404 }
      )
    }

    // Verificar permisos del área según el tipo de elemento
    const typePermissions = {
      TEXT: printArea.allowText,
      IMAGE: printArea.allowImages,
      SHAPE: printArea.allowShapes,
      CLIPART: printArea.allowClipart,
      SVG: printArea.allowShapes
    }

    if (!typePermissions[validatedData.type]) {
      return NextResponse.json(
        { success: false, error: `El tipo ${validatedData.type} no está permitido en esta área` },
        { status: 400 }
      )
    }

    const element = await db.designElement.create({
      data: validatedData,
      include: {
        printArea: {
          include: {
            side: {
              include: {
                product: {
                  select: { id: true, name: true, slug: true }
                }
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: element,
      message: 'Elemento de diseño creado exitosamente'
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating design element:', error)
    return NextResponse.json(
      { success: false, error: 'Error al crear el elemento de diseño' },
      { status: 500 }
    )
  }
}

// PUT /api/personalization/elements - Actualizar elementos masivamente
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }
    const body = await request.json()
    const { elements } = body

    if (!Array.isArray(elements)) {
      return NextResponse.json(
        { success: false, error: 'Se esperaba un array de elementos' },
        { status: 400 }
      )
    }

    // Actualizar elementos en transacción
    const updatedElements = await db.$transaction(
      elements.map(({ id, ...data }) => {
        const validatedData = updateElementSchema.parse(data)
        return db.designElement.update({
          where: { id },
          data: validatedData,
          include: {
            printArea: {
              include: {
                side: {
                  include: {
                    product: {
                      select: { id: true, name: true, slug: true }
                    }
                  }
                }
              }
            }
          }
        })
      })
    )

    return NextResponse.json({
      success: true,
      data: updatedElements,
      message: 'Elementos actualizados exitosamente'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating design elements:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar los elementos de diseño' },
      { status: 500 }
    )
  }
}