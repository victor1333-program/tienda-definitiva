import { NextRequest, NextResponse } from 'next/server'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db } from '@/lib/db'

// DELETE /api/personalization/sides/[id] - Eliminar un lado
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }
    const { id: sideId } = await params

    // Verificar que el lado existe
    const side = await db.productSide.findUnique({
      where: { id: sideId },
      include: {
        _count: {
          select: { printAreas: true }
        }
      }
    })

    if (!side) {
      return NextResponse.json(
        { success: false, error: 'El lado no existe' },
        { status: 404 }
      )
    }

    // Verificar si tiene áreas de impresión asociadas
    if (side._count.printAreas > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No se puede eliminar el lado porque tiene áreas de impresión asociadas. Elimina primero las áreas.' 
        },
        { status: 400 }
      )
    }

    // Eliminar el lado
    await db.productSide.delete({
      where: { id: sideId }
    })

    return NextResponse.json({
      success: true,
      message: 'Lado eliminado exitosamente'
    })

  } catch (error) {
    console.error('Error deleting product side:', error)
    return NextResponse.json(
      { success: false, error: 'Error al eliminar el lado del producto' },
      { status: 500 }
    )
  }
}

// PUT /api/personalization/sides/[id] - Actualizar un lado
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }
    const { id: sideId } = await params
    const body = await request.json()

    // Verificar que el lado existe
    const existingSide = await db.productSide.findUnique({
      where: { id: sideId }
    })

    if (!existingSide) {
      return NextResponse.json(
        { success: false, error: 'El lado no existe' },
        { status: 404 }
      )
    }

    // Actualizar solo los campos permitidos
    const updateData: any = {}
    if (body.name !== undefined) updateData.name = body.name
    if (body.displayName !== undefined) updateData.displayName = body.displayName
    if (body.position !== undefined) updateData.position = body.position
    if (body.image2D !== undefined) updateData.image2D = body.image2D
    if (body.image3D !== undefined) updateData.image3D = body.image3D
    if (body.surcharge !== undefined) updateData.surcharge = body.surcharge
    if (body.isActive !== undefined) updateData.isActive = body.isActive

    const updatedSide = await db.productSide.update({
      where: { id: sideId },
      data: updateData,
      include: {
        product: {
          select: { id: true, name: true, slug: true, images: true }
        },
        _count: {
          select: { printAreas: true }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedSide,
      message: 'Lado actualizado exitosamente'
    })

  } catch (error) {
    console.error('Error updating product side:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar el lado del producto' },
      { status: 500 }
    )
  }
}

// PATCH /api/personalization/sides/[id] - Actualización parcial de un lado
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Reutilizar la lógica del PUT para actualizaciones parciales
  return PUT(request, { params })
}

// GET /api/personalization/sides/[id] - Obtener un lado específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }
    const { id: sideId } = await params

    const side = await db.productSide.findUnique({
      where: { id: sideId },
      include: {
        product: {
          select: { id: true, name: true, slug: true, images: true }
        },
        printAreas: {
          include: {
            _count: {
              select: { designElements: true }
            }
          }
        },
        _count: {
          select: { printAreas: true }
        }
      }
    })

    if (!side) {
      return NextResponse.json(
        { success: false, error: 'El lado no existe' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: side
    })

  } catch (error) {
    console.error('Error fetching product side:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener el lado del producto' },
      { status: 500 }
    )
  }
}