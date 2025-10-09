import { NextRequest, NextResponse } from 'next/server'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db as prisma } from '@/lib/db'
import { validateData, updateShippingMethodSchema } from '@/lib/validation'

interface Params {
  params: {
    id: string
  }
}

// GET: Obtener método de envío por ID
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const shippingMethod = await prisma.shippingMethod.findUnique({
      where: { id: params.id }
    })

    if (!shippingMethod) {
      return NextResponse.json(
        { error: 'Método de envío no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ shippingMethod })

  } catch (error) {
    console.error('Error fetching shipping method:', error)
    return NextResponse.json(
      { error: 'Error al obtener método de envío' },
      { status: 500 }
    )
  }
}

// PATCH: Actualizar método de envío
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role === 'CUSTOMER') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Verificar que el método existe
    const existingMethod = await prisma.shippingMethod.findUnique({
      where: { id: params.id }
    })

    if (!existingMethod) {
      return NextResponse.json(
        { error: 'Método de envío no encontrado' },
        { status: 404 }
      )
    }

    const body = await request.json()

    // Validar datos
    const validation = validateData(updateShippingMethodSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.errors },
        { status: 400 }
      )
    }

    const { name, description, price, isActive, estimatedDays } = validation.data

    // Si se actualiza el nombre, verificar que no existe
    if (name && name !== existingMethod.name) {
      const duplicateName = await prisma.shippingMethod.findFirst({
        where: { 
          name,
          id: { not: params.id }
        }
      })

      if (duplicateName) {
        return NextResponse.json(
          { error: 'Ya existe un método de envío con ese nombre' },
          { status: 400 }
        )
      }
    }

    // Actualizar método de envío
    const shippingMethod = await prisma.shippingMethod.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price }),
        ...(isActive !== undefined && { isActive }),
        ...(estimatedDays !== undefined && { estimatedDays })
      }
    })

    return NextResponse.json({
      shippingMethod,
      message: 'Método de envío actualizado correctamente'
    })

  } catch (error) {
    console.error('Error updating shipping method:', error)
    return NextResponse.json(
      { error: 'Error al actualizar método de envío' },
      { status: 500 }
    )
  }
}

// DELETE: Eliminar método de envío
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role === 'CUSTOMER') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Verificar que el método existe
    const existingMethod = await prisma.shippingMethod.findUnique({
      where: { id: params.id }
    })

    if (!existingMethod) {
      return NextResponse.json(
        { error: 'Método de envío no encontrado' },
        { status: 404 }
      )
    }

    // Verificar que no tiene pedidos asociados
    const ordersWithMethod = await prisma.order.findFirst({
      where: { shippingMethod: existingMethod.name }
    })

    if (ordersWithMethod) {
      return NextResponse.json(
        { error: 'No se puede eliminar un método de envío con pedidos asociados' },
        { status: 400 }
      )
    }

    // Eliminar método de envío
    await prisma.shippingMethod.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      message: 'Método de envío eliminado correctamente'
    })

  } catch (error) {
    console.error('Error deleting shipping method:', error)
    return NextResponse.json(
      { error: 'Error al eliminar método de envío' },
      { status: 500 }
    )
  }
}