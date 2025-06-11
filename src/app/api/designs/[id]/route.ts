import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db as prisma } from '@/lib/db'

interface Params {
  params: {
    id: string
  }
}

// GET: Obtener diseño por ID
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const design = await prisma.design.findUnique({
      where: { id: params.id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            basePrice: true,
            customizationPrice: true
          }
        },
        _count: {
          select: {
            orderItems: true
          }
        }
      }
    })

    if (!design) {
      return NextResponse.json(
        { error: 'Diseño no encontrado' },
        { status: 404 }
      )
    }

    // Si el diseño no es público, verificar permisos
    if (!design.isPublic) {
      const session = await getServerSession(authOptions)
      if (!session?.user) {
        return NextResponse.json(
          { error: 'No autorizado' },
          { status: 401 }
        )
      }

      // Solo el creador o admins pueden ver diseños privados
      if (design.createdById !== session.user.id && session.user.role === 'CUSTOMER') {
        return NextResponse.json(
          { error: 'No autorizado' },
          { status: 403 }
        )
      }
    }

    // Extraer elementos del canvas si existen
    const designData = design.designData as any
    const elements = designData?.elements || []
    const canvasSize = designData?.canvasSize || { width: 800, height: 600 }
    const canvasBackground = designData?.canvasBackground || '#ffffff'

    return NextResponse.json({
      id: design.id,
      name: design.name,
      description: design.description,
      elements,
      canvasSize,
      canvasBackground,
      isPublic: design.isPublic,
      isTemplate: design.isTemplate,
      tags: design.tags ? JSON.parse(design.tags) : [],
      category: design.category,
      productId: design.productId,
      createdAt: design.createdAt.toISOString(),
      updatedAt: design.updatedAt.toISOString(),
      user: design.createdBy,
      product: design.product,
      _count: design._count
    })

  } catch (error) {
    console.error('Error fetching design:', error)
    return NextResponse.json(
      { error: 'Error al obtener diseño' },
      { status: 500 }
    )
  }
}

// PATCH: Actualizar diseño
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Verificar que el diseño existe
    const existingDesign = await prisma.design.findUnique({
      where: { id: params.id }
    })

    if (!existingDesign) {
      return NextResponse.json(
        { error: 'Diseño no encontrado' },
        { status: 404 }
      )
    }

    // Verificar permisos: solo el creador o admins pueden editar
    if (existingDesign.createdById !== session.user.id && session.user.role === 'CUSTOMER') {
      return NextResponse.json(
        { error: 'No autorizado para editar este diseño' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      name,
      description,
      elements,
      canvasSize,
      canvasBackground,
      isPublic,
      isTemplate,
      tags,
      category,
      productId,
      variantId
    } = body

    // Verificar que el producto existe si se especifica
    if (productId && productId !== existingDesign.productId) {
      const product = await prisma.product.findUnique({
        where: { id: productId }
      })
      if (!product) {
        return NextResponse.json(
          { error: 'Producto no encontrado' },
          { status: 404 }
        )
      }
    }

    // Preparar datos del diseño
    const designData = {}
    if (elements !== undefined) {
      Object.assign(designData, { elements })
    }
    if (canvasSize !== undefined) {
      Object.assign(designData, { canvasSize })
    }
    if (canvasBackground !== undefined) {
      Object.assign(designData, { canvasBackground })
    }

    // Solo actualizar designData si hay cambios
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (Object.keys(designData).length > 0) {
      // Combinar con datos existentes
      const existingData = existingDesign.designData as any || {}
      updateData.designData = { ...existingData, ...designData }
    }
    if (isPublic !== undefined) updateData.isPublic = isPublic
    if (isTemplate !== undefined) updateData.isTemplate = isTemplate
    if (tags !== undefined) updateData.tags = JSON.stringify(tags)
    if (category !== undefined) updateData.category = category
    if (productId !== undefined) updateData.productId = productId

    // Actualizar diseño
    const design = await prisma.design.update({
      where: { id: params.id },
      data: updateData,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        product: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    })

    // Extraer elementos del canvas actualizados
    const updatedDesignData = design.designData as any
    const updatedElements = updatedDesignData?.elements || []
    const updatedCanvasSize = updatedDesignData?.canvasSize || { width: 800, height: 600 }
    const updatedCanvasBackground = updatedDesignData?.canvasBackground || '#ffffff'

    return NextResponse.json({
      id: design.id,
      name: design.name,
      description: design.description,
      elements: updatedElements,
      canvasSize: updatedCanvasSize,
      canvasBackground: updatedCanvasBackground,
      isPublic: design.isPublic,
      isTemplate: design.isTemplate,
      tags: design.tags ? JSON.parse(design.tags) : [],
      category: design.category,
      productId: design.productId,
      createdAt: design.createdAt.toISOString(),
      updatedAt: design.updatedAt.toISOString(),
      user: design.createdBy,
      product: design.product
    })

  } catch (error) {
    console.error('Error updating design:', error)
    return NextResponse.json(
      { error: 'Error al actualizar diseño' },
      { status: 500 }
    )
  }
}

// DELETE: Eliminar diseño
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Verificar que el diseño existe
    const existingDesign = await prisma.design.findUnique({
      where: { id: params.id },
      include: {
        orderItems: true
      }
    })

    if (!existingDesign) {
      return NextResponse.json(
        { error: 'Diseño no encontrado' },
        { status: 404 }
      )
    }

    // Verificar permisos: solo el creador o admins pueden eliminar
    if (existingDesign.createdById !== session.user.id && session.user.role === 'CUSTOMER') {
      return NextResponse.json(
        { error: 'No autorizado para eliminar este diseño' },
        { status: 403 }
      )
    }

    // Verificar que no tiene pedidos asociados
    if (existingDesign.orderItems.length > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar un diseño con pedidos asociados' },
        { status: 400 }
      )
    }

    // Eliminar diseño
    await prisma.design.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      message: 'Diseño eliminado correctamente'
    })

  } catch (error) {
    console.error('Error deleting design:', error)
    return NextResponse.json(
      { error: 'Error al eliminar diseño' },
      { status: 500 }
    )
  }
}