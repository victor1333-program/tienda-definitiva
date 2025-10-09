import { NextRequest, NextResponse } from 'next/server'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db } from '@/lib/db'

// Obtener template específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; templateId: string }> }
) {
  try {
    const { templateId, id } = await params
    
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const template = await db.personalizationTemplate.findUnique({
      where: { id: templateId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    })

    if (!template) {
      return NextResponse.json({ error: 'Template no encontrado' }, { status: 404 })
    }

    return NextResponse.json({ template })

  } catch (error) {
    console.error('Error fetching personalization template:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Actualizar template
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; templateId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes((session.user as any).role)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const {
      name,
      description,
      templateData,
      previewImage,
      isActive,
      isGlobal
    } = await request.json()

    const template = await db.personalizationTemplate.findUnique({
      where: { id: templateId }
    })

    if (!template) {
      return NextResponse.json({ error: 'Template no encontrado' }, { status: 404 })
    }

    const updatedTemplate = await db.personalizationTemplate.update({
      where: { id: templateId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(templateData && { templateData }),
        ...(previewImage !== undefined && { previewImage }),
        ...(isActive !== undefined && { isActive }),
        ...(isGlobal !== undefined && { 
          isGlobal,
          productId: isGlobal ? null : (template.productId || id)
        })
      }
    })

    return NextResponse.json({
      message: 'Template actualizado exitosamente',
      template: updatedTemplate
    })

  } catch (error) {
    console.error('Error updating personalization template:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Eliminar template
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; templateId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes((session.user as any).role)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const template = await db.personalizationTemplate.findUnique({
      where: { id: templateId }
    })

    if (!template) {
      return NextResponse.json({ error: 'Template no encontrado' }, { status: 404 })
    }

    await db.personalizationTemplate.delete({
      where: { id: templateId }
    })

    return NextResponse.json({
      message: 'Template eliminado exitosamente'
    })

  } catch (error) {
    console.error('Error deleting personalization template:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}