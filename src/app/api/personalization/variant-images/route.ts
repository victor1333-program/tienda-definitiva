import { NextRequest, NextResponse } from 'next/server'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { existsSync } from 'fs'
import { db } from '@/lib/db'

// POST /api/personalization/variant-images - Subir imagen para variante específica
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      // User log removed
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Data log removed
    const formData = await request.formData()
    const file = formData.get('file') as File
    const variantId = formData.get('variantId') as string
    const sideId = formData.get('sideId') as string
    const productId = formData.get('productId') as string

    // Data log removed
    console.log('Variant image upload data:', {
      hasFile: !!file, 
      fileName: file?.name, 
      fileSize: file?.size,
      variantId, 
      sideId, 
      productId 
    })

    if (!file || !variantId || !sideId || !productId) {
      return NextResponse.json(
        { success: false, error: 'Faltan datos requeridos' },
        { status: 400 }
      )
    }

    // Validar el archivo
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'El archivo debe ser una imagen' },
        { status: 400 }
      )
    }

    // Validar tamaño (5MB máximo)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'El archivo es demasiado grande. Máximo 5MB.' },
        { status: 400 }
      )
    }

    // Generar nombre único para el archivo
    const fileExtension = file.name.split('.').pop()
    const fileName = `variant-${variantId}-side-${sideId}-${uuidv4()}.${fileExtension}`
    
    
    // Crear directorio si no existe
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'personalization')
    
    try {
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true })
      }
      
      await writeFile(join(uploadDir, fileName), Buffer.from(await file.arrayBuffer()))
    } catch (error) {
      console.error('Error writing file:', error)
      return NextResponse.json(
        { success: false, error: `Error al guardar el archivo: ${error instanceof Error ? error.message : 'Error desconocido'}` },
        { status: 500 }
      )
    }

    const imageUrl = `/uploads/personalization/${fileName}`

    // Guardar o actualizar la relación en la base de datos
    // Data log removed
    const variantSideImage = await db.variantSideImage.upsert({
      where: {
        variantId_sideId: {
          variantId,
          sideId
        }
      },
      update: {
        imageUrl
      },
      create: {
        variantId,
        sideId,
        imageUrl
      }
    })
    
    return NextResponse.json({
      success: true,
      data: {
        imageUrl,
        variantId,
        sideId,
        productId,
        id: variantSideImage.id
      },
      message: 'Imagen subida exitosamente'
    })

  } catch (error) {
    console.error('=== Error uploading variant image ===', error)
    return NextResponse.json(
      { success: false, error: `Error interno del servidor: ${error instanceof Error ? error.message : 'Error desconocido'}` },
      { status: 500 }
    )
  }
}