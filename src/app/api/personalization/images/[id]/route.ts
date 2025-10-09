import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { unlink } from 'fs/promises'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    
    const resolvedParams = await params;
    const image = await prisma.personalizationImage.findUnique({
      where: { id: resolvedParams.id },
      include: {
        category: {
          include: {
            macroCategory: true
          }
        },
        macroCategory: true,
        _count: {
          select: {
            usages: true,
            linkedProducts: true
          }
        }
      }
    })

    if (!image) {
      return NextResponse.json({ error: 'Imagen no encontrada' }, { status: 404 })
    }

    return NextResponse.json(image)
  } catch (error) {
    console.error('Error fetching image:', error)
    return NextResponse.json(
      { error: 'Error al obtener imagen' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { name, categoryId, macroCategoryId, tags, isActive, isPublic } = body

    // Verificar que la imagen existe
    const existingImage = await prisma.personalizationImage.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!existingImage) {
      return NextResponse.json({ error: 'Imagen no encontrada' }, { status: 404 })
    }

    // Validar que la categoría existe si se proporciona
    if (categoryId) {
      const category = await prisma.personalizationImageCategory.findUnique({
        where: { id: categoryId }
      })
      if (!category) {
        return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 400 })
      }
    }

    // Validar que la macrocategoría existe si se proporciona
    if (macroCategoryId) {
      const macroCategory = await prisma.personalizationImageMacroCategory.findUnique({
        where: { id: macroCategoryId }
      })
      if (!macroCategory) {
        return NextResponse.json({ error: 'Macrocategoría no encontrada' }, { status: 400 })
      }
    }

    // Actualizar la imagen
    const updatedImage = await prisma.personalizationImage.update({
      where: { id: resolvedParams.id },
      data: {
        ...(name !== undefined && { name }),
        ...(categoryId !== undefined && { categoryId }),
        ...(macroCategoryId !== undefined && { macroCategoryId }),
        ...(tags !== undefined && { tags }),
        ...(isActive !== undefined && { isActive }),
        ...(isPublic !== undefined && { isPublic }),
      },
      include: {
        category: {
          include: {
            macroCategory: true
          }
        },
        macroCategory: true,
        _count: {
          select: {
            usages: true,
            linkedProducts: true
          }
        }
      }
    })

    return NextResponse.json(updatedImage)
  } catch (error) {
    console.error('Error updating image:', error)
    return NextResponse.json(
      { error: 'Error al actualizar imagen' },
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
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar que la imagen existe
    const existingImage = await prisma.personalizationImage.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!existingImage) {
      return NextResponse.json({ error: 'Imagen no encontrada' }, { status: 404 })
    }

    // Eliminar archivo físico si existe
    try {
      if (existingImage.fileUrl.startsWith('/uploads/')) {
        const filePath = path.join(process.cwd(), 'public', existingImage.fileUrl)
        await unlink(filePath)
      }
    } catch (fileError) {
      console.warn('Error deleting file:', fileError)
      // Continuar con la eliminación de la base de datos aunque el archivo no se pueda eliminar
    }

    // Eliminar registro de la base de datos
    await prisma.personalizationImage.delete({
      where: { id: resolvedParams.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting image:', error)
    return NextResponse.json(
      { error: 'Error al eliminar imagen' },
      { status: 500 }
    )
  }
}