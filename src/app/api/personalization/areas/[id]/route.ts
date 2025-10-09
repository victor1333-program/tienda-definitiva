import { NextRequest, NextResponse } from 'next/server'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db } from '@/lib/db'
import { z } from 'zod'

const updateAreaSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').optional(),
  displayName: z.string().optional(),
  description: z.string().optional(),
  x: z.number().optional(),
  y: z.number().optional(),
  width: z.number().positive('El ancho debe ser positivo').optional(),
  height: z.number().positive('El alto debe ser positivo').optional(),
  rotation: z.number().optional(),
  realWidth: z.number().positive().optional(),
  realHeight: z.number().positive().optional(),
  printingMethod: z.enum(['DTG', 'DTF', 'SUBLIMATION', 'VINYL', 'EMBROIDERY', 'SCREEN_PRINT', 'DIGITAL_PRINT', 'LASER_ENGRAVE', 'UV_PRINT']).optional(),
  maxPrintWidth: z.number().positive().optional(),
  maxPrintHeight: z.number().positive().optional(),
  resolution: z.number().int().positive().optional(),
  maxColors: z.number().int().positive().optional(),
  extraCostPerColor: z.number().min(0).optional(),
  basePrice: z.number().min(0).optional(),
  allowText: z.boolean().optional(),
  allowImages: z.boolean().optional(),
  allowShapes: z.boolean().optional(),
  allowClipart: z.boolean().optional(),
  mandatoryPersonalization: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional()
})

// GET /api/personalization/areas/[id] - Obtener área específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params
    const area = await db.printArea.findUnique({
      where: { id },
      include: {
        side: {
          include: {
            product: {
              select: { id: true, name: true, slug: true }
            }
          }
        },
        _count: {
          select: { designElements: true }
        }
      }
    })

    if (!area) {
      return NextResponse.json(
        { success: false, error: 'Área de impresión no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: area
    })
  } catch (error) {
    console.error('Error fetching print area:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener el área de impresión' },
      { status: 500 }
    )
  }
}

// PATCH /api/personalization/areas/[id] - Actualizar área parcialmente
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = updateAreaSchema.parse(body)

    // Verificar que el área existe
    const existingArea = await db.printArea.findUnique({
      where: { id }
    })

    if (!existingArea) {
      return NextResponse.json(
        { success: false, error: 'Área de impresión no encontrada' },
        { status: 404 }
      )
    }

    const area = await db.printArea.update({
      where: { id },
      data: validatedData,
      include: {
        side: {
          include: {
            product: {
              select: { id: true, name: true, slug: true }
            }
          }
        },
        _count: {
          select: { designElements: true }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: area,
      message: 'Área de impresión actualizada exitosamente'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating print area:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar el área de impresión' },
      { status: 500 }
    )
  }
}

// PUT /api/personalization/areas/[id] - Actualizar área
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = updateAreaSchema.parse(body)

    // Verificar que el área existe
    const existingArea = await db.printArea.findUnique({
      where: { id }
    })

    if (!existingArea) {
      return NextResponse.json(
        { success: false, error: 'Área de impresión no encontrada' },
        { status: 404 }
      )
    }

    const area = await db.printArea.update({
      where: { id },
      data: validatedData,
      include: {
        side: {
          include: {
            product: {
              select: { id: true, name: true, slug: true }
            }
          }
        },
        _count: {
          select: { designElements: true }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: area,
      message: 'Área de impresión actualizada exitosamente'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating print area:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar el área de impresión' },
      { status: 500 }
    )
  }
}

// DELETE /api/personalization/areas/[id] - Eliminar área
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params
    
    // Verificar que el área existe y obtener información de relaciones
    const area = await db.printArea.findUnique({
      where: { id },
      include: {
        _count: {
          select: { designElements: true }
        }
      }
    })

    if (!area) {
      return NextResponse.json(
        { success: false, error: 'Área de impresión no encontrada' },
        { status: 404 }
      )
    }

    // Verificar si tiene elementos de diseño asociados
    if (area._count.designElements > 0) {
      return NextResponse.json({
        success: false, 
        error: 'No se puede eliminar el área porque tiene elementos de diseño asociados. Elimina primero todos los diseños de esta área.'
      }, { status: 400 })
    }

    // Eliminar el área
    await db.printArea.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Área de impresión eliminada exitosamente'
    })

  } catch (error) {
    console.error('Error deleting print area:', error)
    return NextResponse.json(
      { success: false, error: 'Error al eliminar el área de impresión' },
      { status: 500 }
    )
  }
}