import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')

    const where = {
      ...(category ? { category } : {}),
      // Excluir formas placeholder
      NOT: {
        name: {
          startsWith: '__categoria_placeholder_'
        }
      }
    }

    const shapes = await prisma.personalizationShape.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            usages: true
          }
        }
      }
    })

    return NextResponse.json(shapes)
  } catch (error) {
    console.error('Error fetching shapes:', error)
    return NextResponse.json(
      { error: 'Error al obtener formas' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const name = formData.get('name') as string
    const category = formData.get('category') as string
    const isMask = formData.get('isMask') === 'true'
    const tags = formData.get('tags') as string

    if (!file) {
      return NextResponse.json({ error: 'Archivo requerido' }, { status: 400 })
    }

    // Validar tipo de archivo
    const allowedTypes = ['image/png', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Solo se permiten archivos PNG y SVG' },
        { status: 400 }
      )
    }

    // Crear directorio si no existe
    const uploadDir = path.join(process.cwd(), 'public/uploads/personalization/shapes')
    await mkdir(uploadDir, { recursive: true })

    // Generar nombre único para el archivo
    const timestamp = Date.now()
    const extension = path.extname(file.name)
    const fileName = `shape_${timestamp}${extension}`
    const filePath = path.join(uploadDir, fileName)
    const fileUrl = `/uploads/personalization/shapes/${fileName}`

    // Guardar archivo
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filePath, buffer)

    // Crear registro en la base de datos
    const shape = await prisma.personalizationShape.create({
      data: {
        name: name || file?.name || 'Forma sin nombre',
        category: category || 'general',
        fileUrl,
        isMask,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        isFromLibrary: false,
        fileType: file.type,
        fileSize: file.size,
      }
    })

    return NextResponse.json(shape)
  } catch (error) {
    console.error('Error creating shape:', error)
    return NextResponse.json(
      { error: 'Error al crear forma' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const ids = searchParams.get('ids')?.split(',')

    if (!ids || ids.length === 0) {
      return NextResponse.json({ error: 'IDs requeridos' }, { status: 400 })
    }

    await prisma.personalizationShape.deleteMany({
      where: {
        id: {
          in: ids
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting shapes:', error)
    return NextResponse.json(
      { error: 'Error al eliminar formas' },
      { status: 500 }
    )
  }
}

