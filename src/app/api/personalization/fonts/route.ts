import { NextRequest, NextResponse } from "next/server"
import { auth } from "../../../../../auth"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"
import { db as prisma } from "@/lib/db"

export async function GET() {
  try {
    const fonts = await prisma.customFont.findMany({
      orderBy: [
        { family: 'asc' },
        { style: 'asc' }
      ]
    })

    return NextResponse.json(fonts)
  } catch (error) {
    console.error('Error fetching fonts:', error)
    return NextResponse.json(
      { error: 'Error al obtener las fuentes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const family = formData.get('family') as string
    const style = formData.get('style') as string
    const weight = formData.get('weight') as string

    if (!file || !family || !style || !weight) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    // Verificar si ya existe una fuente con la misma familia y estilo
    const existingFont = await prisma.customFont.findFirst({
      where: {
        family: family.trim(),
        style: style.trim()
      }
    })

    if (existingFont) {
      return NextResponse.json(
        { error: `La fuente "${family} ${style}" ya existe` },
        { status: 409 }
      )
    }

    // Validar formato de archivo
    const validFormats = ['ttf', 'otf', 'woff', 'woff2']
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    
    if (!fileExtension || !validFormats.includes(fileExtension)) {
      return NextResponse.json(
        { error: 'Formato de archivo no válido. Use TTF, OTF, WOFF o WOFF2' },
        { status: 400 }
      )
    }

    // Validar tamaño de archivo (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'El archivo es demasiado grande. Máximo 5MB' },
        { status: 400 }
      )
    }

    // Crear directorio de fuentes si no existe
    const fontsDir = join(process.cwd(), 'public', 'uploads', 'fonts')
    if (!existsSync(fontsDir)) {
      await mkdir(fontsDir, { recursive: true })
    }

    // Generar nombre único para el archivo
    const timestamp = Date.now()
    const sanitizedFamily = family.replace(/[^a-zA-Z0-9]/g, '')
    const sanitizedStyle = style.replace(/[^a-zA-Z0-9]/g, '')
    const fileName = `${sanitizedFamily}-${sanitizedStyle}-${timestamp}.${fileExtension}`
    const filePath = join(fontsDir, fileName)
    const fileUrl = `/uploads/fonts/${fileName}`

    // Guardar archivo
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Crear registro en la base de datos
    const newFont = await prisma.customFont.create({
      data: {
        name: file.name,
        family: family.trim(),
        style: style.trim(),
        weight: weight.trim(),
        format: fileExtension.toUpperCase(),
        fileName: fileName,
        fileUrl: fileUrl,
        fileSize: file.size
      }
    })

    return NextResponse.json(newFont, { status: 201 })
  } catch (error) {
    console.error('Error uploading font:', error)
    return NextResponse.json(
      { error: 'Error al subir la fuente' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID de fuente requerido' },
        { status: 400 }
      )
    }

    const font = await prisma.customFont.findUnique({
      where: { id }
    })

    if (!font) {
      return NextResponse.json(
        { error: 'Fuente no encontrada' },
        { status: 404 }
      )
    }

    // Eliminar archivo físico
    if (font.fileName) {
      const filePath = join(process.cwd(), 'public', 'uploads', 'fonts', font.fileName)
      try {
        await import('fs/promises').then(fs => fs.unlink(filePath))
      } catch (error) {
        console.warn('Error deleting font file:', error)
      }
    }

    // Eliminar registro de la base de datos
    await prisma.customFont.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting font:', error)
    return NextResponse.json(
      { error: 'Error al eliminar la fuente' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { id, isActive } = await request.json()

    if (!id || typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'ID y estado requeridos' },
        { status: 400 }
      )
    }

    const updatedFont = await prisma.customFont.update({
      where: { id },
      data: { isActive }
    })

    return NextResponse.json(updatedFont)
  } catch (error) {
    console.error('Error updating font status:', error)
    return NextResponse.json(
      { error: 'Error al actualizar el estado de la fuente' },
      { status: 500 }
    )
  }
}