import { NextRequest, NextResponse } from 'next/server'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db as prisma } from '@/lib/db'

interface Params {
  params: {
    id: string
  }
}

// GET: Obtener variante por ID
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const variant = await prisma.productVariant.findUnique({
      where: { id: params.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            basePrice: true,
            customizationPrice: true,
            isActive: true
          }
        },
        inventory: {
          orderBy: { createdAt: 'desc' },
          take: 10, // Últimos 10 movimientos
          select: {
            id: true,
            type: true,
            quantity: true,
            reason: true,
            createdAt: true,
            userId: true
          }
        },
        _count: {
          select: {
            orderItems: true,
            inventory: true
          }
        }
      }
    })

    if (!variant) {
      return NextResponse.json(
        { error: 'Variante no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({ variant })

  } catch (error) {
    console.error('Error fetching variant:', error)
    return NextResponse.json(
      { error: 'Error al obtener variante' },
      { status: 500 }
    )
  }
}

// PATCH: Actualizar variante
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role === 'CUSTOMER') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Verificar que la variante existe
    const existingVariant = await prisma.productVariant.findUnique({
      where: { id: params.id }
    })

    if (!existingVariant) {
      return NextResponse.json(
        { error: 'Variante no encontrada' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const {
      sku,
      size,
      color,
      material,
      stock,
      price,
      isActive
    } = body

    // Si se actualiza el SKU, verificar que no existe
    if (sku && sku !== existingVariant.sku) {
      const existingSku = await prisma.productVariant.findUnique({
        where: { sku }
      })

      if (existingSku) {
        return NextResponse.json(
          { error: 'El SKU ya existe' },
          { status: 400 }
        )
      }
    }

    // Si se actualiza el stock, crear movimiento de inventario
    let inventoryMovement = null
    if (stock !== undefined && stock !== existingVariant.stock) {
      const difference = stock - existingVariant.stock
      
      inventoryMovement = await prisma.inventoryMovement.create({
        data: {
          variantId: params.id,
          type: difference > 0 ? 'IN' : 'OUT',
          quantity: Math.abs(difference),
          reason: difference > 0 ? 'Reposición de stock' : 'Ajuste de stock',
          userId: session.user.id
        }
      })
    }

    // Actualizar variante
    const variant = await prisma.productVariant.update({
      where: { id: params.id },
      data: {
        ...(sku !== undefined && { sku }),
        ...(size !== undefined && { size }),
        ...(color !== undefined && { color }),
        ...(material !== undefined && { material }),
        ...(stock !== undefined && { stock }),
        ...(price !== undefined && { price }),
        ...(isActive !== undefined && { isActive })
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            basePrice: true
          }
        }
      }
    })

    return NextResponse.json({
      variant,
      inventoryMovement,
      message: 'Variante actualizada correctamente'
    })

  } catch (error) {
    console.error('Error updating variant:', error)
    return NextResponse.json(
      { error: 'Error al actualizar variante' },
      { status: 500 }
    )
  }
}

// DELETE: Eliminar variante
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role === 'CUSTOMER') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Verificar que la variante existe
    const existingVariant = await prisma.productVariant.findUnique({
      where: { id: params.id },
      include: {
        orderItems: true,
        inventory: true
      }
    })

    if (!existingVariant) {
      return NextResponse.json(
        { error: 'Variante no encontrada' },
        { status: 404 }
      )
    }

    // Verificar que no tiene pedidos asociados
    if (existingVariant.orderItems.length > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar una variante con pedidos asociados' },
        { status: 400 }
      )
    }

    // Eliminar movimientos de inventario primero
    await prisma.inventoryMovement.deleteMany({
      where: { variantId: params.id }
    })

    // Eliminar variante
    await prisma.productVariant.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      message: 'Variante eliminada correctamente'
    })

  } catch (error) {
    console.error('Error deleting variant:', error)
    return NextResponse.json(
      { error: 'Error al eliminar variante' },
      { status: 500 }
    )
  }
}