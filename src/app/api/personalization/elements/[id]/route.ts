import { NextRequest, NextResponse } from 'next/server'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db } from '@/lib/db'
import { z } from 'zod'

const updateElementSchema = z.object({
  type: z.enum(['TEXT', 'IMAGE', 'SHAPE', 'CLIPART', 'SVG']).optional(),
  content: z.string().optional(),
  x: z.number().optional(),
  y: z.number().optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  rotation: z.number().optional(),
  scaleX: z.number().positive().optional(),
  scaleY: z.number().positive().optional(),
  opacity: z.number().min(0).max(1).optional(),
  style: z.record(z.any()).optional(),
  zIndex: z.number().int().optional(),
  isLocked: z.boolean().optional(),
  isVisible: z.boolean().optional()
})

// GET /api/personalization/elements/[id] - Obtener elemento específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    
    const resolvedParams = await params;
    const session = await auth()
    
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const element = await db.designElement.findUnique({
      where: { id: resolvedParams.id },
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
      }
    })

    if (!element) {
      return NextResponse.json(
        { success: false, error: 'Elemento de diseño no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: element
    })
  } catch (error) {
    console.error('Error fetching design element:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener el elemento de diseño' },
      { status: 500 }
    )
  }
}

// PUT /api/personalization/elements/[id] - Actualizar elemento
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateElementSchema.parse(body)

    // Verificar que el elemento existe
    const existingElement = await db.designElement.findUnique({
      where: { id: resolvedParams.id },
      include: {
        printArea: true
      }
    })

    if (!existingElement) {
      return NextResponse.json(
        { success: false, error: 'Elemento de diseño no encontrado' },
        { status: 404 }
      )
    }

    // Si se está cambiando el tipo, verificar permisos del área
    if (validatedData.type && validatedData.type !== existingElement.type) {
      const typePermissions = {
        TEXT: existingElement.printArea.allowText,
        IMAGE: existingElement.printArea.allowImages,
        SHAPE: existingElement.printArea.allowShapes,
        CLIPART: existingElement.printArea.allowClipart,
        SVG: existingElement.printArea.allowShapes
      }

      if (!typePermissions[validatedData.type]) {
        return NextResponse.json(
          { success: false, error: `El tipo ${validatedData.type} no está permitido en esta área` },
          { status: 400 }
        )
      }
    }

    const element = await db.designElement.update({
      where: { id: resolvedParams.id },
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
        },
        orderItem: {
          select: { id: true, orderId: true }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: element,
      message: 'Elemento de diseño actualizado exitosamente'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating design element:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar el elemento de diseño' },
      { status: 500 }
    )
  }
}

// DELETE /api/personalization/elements/[id] - Eliminar elemento
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Verificar que el elemento existe
    const element = await db.designElement.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!element) {
      return NextResponse.json(
        { success: false, error: 'Elemento de diseño no encontrado' },
        { status: 404 }
      )
    }

    // Eliminar el elemento
    await db.designElement.delete({
      where: { id: resolvedParams.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Elemento de diseño eliminado exitosamente'
    })

  } catch (error) {
    console.error('Error deleting design element:', error)
    return NextResponse.json(
      { success: false, error: 'Error al eliminar el elemento de diseño' },
      { status: 500 }
    )
  }
}