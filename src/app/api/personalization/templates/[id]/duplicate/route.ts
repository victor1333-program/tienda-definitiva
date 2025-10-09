import { NextRequest, NextResponse } from "next/server"
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db as prisma } from "@/lib/db"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { id } = params

    // Buscar la plantilla original
    const originalTemplate = await prisma.zakekeTemplate.findUnique({
      where: { id }
    })

    if (!originalTemplate) {
      return NextResponse.json(
        { error: 'Plantilla no encontrada' },
        { status: 404 }
      )
    }

    // Crear una copia de la plantilla
    const duplicatedTemplate = await prisma.zakekeTemplate.create({
      data: {
        name: `${originalTemplate.name} (Copia)`,
        description: originalTemplate.description,
        category: originalTemplate.category,
        subcategory: originalTemplate.subcategory,
        thumbnailUrl: originalTemplate.thumbnailUrl,
        previewUrl: originalTemplate.previewUrl,
        productTypes: originalTemplate.productTypes,
        templateData: originalTemplate.templateData,
        allowTextEdit: originalTemplate.allowTextEdit,
        allowColorEdit: originalTemplate.allowColorEdit,
        allowImageEdit: originalTemplate.allowImageEdit,
        editableAreas: originalTemplate.editableAreas,
        isPremium: originalTemplate.isPremium,
        isActive: true,
        isPublic: originalTemplate.isPublic,
        usageCount: 0,
        rating: null,
        createdBy: session.user.id
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
      template: duplicatedTemplate
    }, { status: 201 })

  } catch (error) {
    console.error('Error duplicating template:', error)
    return NextResponse.json(
      { error: 'Error al duplicar la plantilla' },
      { status: 500 }
    )
  }
}