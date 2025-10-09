import { NextRequest, NextResponse } from "next/server"
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db } from "@/lib/db"


export async function GET() {
  try {
    const templates = await db.zakekeTemplate.findMany({
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: [
        { isActive: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({
      success: true,
      templates
    })
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json(
      { error: 'Error al obtener las plantillas' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const {
      name,
      description,
      category,
      subcategory,
      thumbnailUrl,
      previewUrl,
      productTypes,
      templateData,
      allowTextEdit,
      allowColorEdit,
      allowImageEdit,
      editableAreas,
      isPremium,
      isPublic,
      isDefaultForAllVariants
    } = await request.json()

    if (!name || !category || !templateData) {
      return NextResponse.json(
        { error: 'Nombre, categoría y datos de plantilla son requeridos' },
        { status: 400 }
      )
    }

    // Verificar si el usuario existe en la base de datos
    let createdById = null
    if (session.user.id) {
      const userExists = await db.user.findUnique({
        where: { id: session.user.id }
      })
      if (userExists) {
        createdById = session.user.id
      } else {
        // Si el usuario de la sesión no existe, usar el primer admin disponible
        const adminUser = await db.user.findFirst({
          where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } }
        })
        if (adminUser) {
          createdById = adminUser.id
        }
      }
    }

    const template = await db.zakekeTemplate.create({
      data: {
        name: name.trim(),
        description: description?.trim(),
        category: category.trim(),
        subcategory: subcategory?.trim(),
        thumbnailUrl: thumbnailUrl || '',
        previewUrl: previewUrl,
        productTypes: productTypes || [],
        templateData,
        allowTextEdit: allowTextEdit ?? true,
        allowColorEdit: allowColorEdit ?? true,
        allowImageEdit: allowImageEdit ?? true,
        editableAreas: editableAreas || [],
        isPremium: isPremium ?? false,
        isActive: true,
        isPublic: isPublic ?? true,
        isDefaultForAllVariants: isDefaultForAllVariants ?? false,
        usageCount: 0,
        createdBy: createdById
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      template
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating template:', error)
    return NextResponse.json(
      { error: 'Error al crear la plantilla' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { id, restrictions, ...updateData } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'ID de plantilla requerido' },
        { status: 400 }
      )
    }

    // Filtrar campos que no existen en el modelo
    const allowedFields = [
      'name', 'description', 'category', 'subcategory', 'thumbnailUrl', 'previewUrl',
      'productTypes', 'templateData', 'allowTextEdit', 'allowColorEdit', 'allowImageEdit',
      'editableAreas', 'isPremium', 'isActive', 'isPublic', 'isDefaultForAllVariants',
      'usageCount', 'rating'
    ]
    
    const filteredUpdateData = Object.keys(updateData)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updateData[key]
        return obj
      }, {} as any)

    // Verificar que la plantilla existe
    const existingTemplate = await db.zakekeTemplate.findUnique({
      where: { id }
    })

    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Plantilla no encontrada' },
        { status: 404 }
      )
    }

    // Si se está marcando como predeterminada, desmarcar otras plantillas del mismo producto
    if (filteredUpdateData.isDefaultForAllVariants === true) {
      // Primero desmarcar todas las otras plantillas que tengan los mismos productTypes
      const currentTemplate = existingTemplate
      if (currentTemplate.productTypes && currentTemplate.productTypes.length > 0) {
        await db.zakekeTemplate.updateMany({
          where: {
            id: { not: id },
            productTypes: {
              hasSome: currentTemplate.productTypes
            },
            isDefaultForAllVariants: true
          },
          data: {
            isDefaultForAllVariants: false
          }
        })
      }
    }

    // Actualizar la plantilla
    const updatedTemplate = await db.zakekeTemplate.update({
      where: { id },
      data: filteredUpdateData,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      template: updatedTemplate
    })
  } catch (error) {
    console.error('Error updating template:', error)
    return NextResponse.json(
      { error: 'Error al actualizar la plantilla' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID de plantilla requerido' },
        { status: 400 }
      )
    }

    // Verificar que la plantilla existe
    const template = await db.zakekeTemplate.findUnique({
      where: { id }
    })

    if (!template) {
      return NextResponse.json(
        { error: 'Plantilla no encontrada' },
        { status: 404 }
      )
    }

    // Eliminar la plantilla
    await db.zakekeTemplate.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Plantilla eliminada correctamente'
    })
  } catch (error) {
    console.error('Error deleting template:', error)
    return NextResponse.json(
      { error: 'Error al eliminar la plantilla' },
      { status: 500 }
    )
  }
}