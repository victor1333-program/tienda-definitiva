import { NextRequest, NextResponse } from "next/server"
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db } from "@/lib/db"

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

    const category = await db.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { productCategories: true }
        },
        productCategories: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                basePrice: true,
                images: true,
                isActive: true
              }
            }
          },
          take: 10,
          orderBy: { createdAt: "desc" }
        }
      }
    })

    if (!category) {
      return NextResponse.json(
        { error: "Categoría no encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error("Error al obtener categoría:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

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
    const data = await request.json()

    // Verificar que la categoría existe
    const existingCategory = await db.category.findUnique({
      where: { id }
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Categoría no encontrada" },
        { status: 404 }
      )
    }

    // Verificar restricciones para categorías del sistema
    if (existingCategory.isSystem) {
      // Las categorías del sistema no pueden cambiar ciertos campos críticos
      const restrictedFields = ['name', 'slug', 'isSystem', 'categoryType']
      for (const field of restrictedFields) {
        if (data[field] !== undefined && data[field] !== existingCategory[field]) {
          return NextResponse.json(
            { error: `No se puede modificar el campo '${field}' de una categoría del sistema` },
            { status: 403 }
          )
        }
      }
    }

    // Si se está cambiando el nombre, verificar que no exista otra con ese nombre
    if (data.name && data.name !== existingCategory.name) {
      const duplicateCategory = await db.category.findFirst({
        where: { name: data.name }
      })

      if (duplicateCategory && duplicateCategory.id !== id) {
        return NextResponse.json(
          { error: "Ya existe una categoría con ese nombre" },
          { status: 400 }
        )
      }
    }

    // Generar slug si se cambia el nombre
    const updateData: any = {}
    
    if (data.name !== undefined) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description
    if (data.icon !== undefined) updateData.icon = data.icon
    if (data.color !== undefined) updateData.color = data.color
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder
    if (data.isActive !== undefined) updateData.isActive = data.isActive
    if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured

    if (data.name && data.name !== existingCategory.name) {
      updateData.slug = data.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    }

    const updatedCategory = await db.category.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: { productCategories: true }
        }
      }
    })

    return NextResponse.json(updatedCategory)
  } catch (error) {
    console.error("Error al actualizar categoría:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
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
    
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params

    // Verificar que la categoría existe
    const category = await db.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { productCategories: true }
        }
      }
    })

    if (!category) {
      return NextResponse.json(
        { error: "Categoría no encontrada" },
        { status: 404 }
      )
    }

    // Verificar que no sea una categoría del sistema
    if (category.isSystem) {
      return NextResponse.json(
        { error: "No se puede eliminar una categoría del sistema" },
        { status: 403 }
      )
    }

    // Verificar que no tenga productos asociados
    if (category._count.productCategories > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar una categoría que tiene productos asociados" },
        { status: 400 }
      )
    }

    await db.category.delete({
      where: { id }
    })

    return NextResponse.json({ message: "Categoría eliminada exitosamente" })
  } catch (error) {
    console.error("Error al eliminar categoría:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}