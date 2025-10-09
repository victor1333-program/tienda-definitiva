import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const categoryId = searchParams.get('categoryId')
    const macroCategoryId = searchParams.get('macroCategoryId')
    const isActive = searchParams.get('isActive')
    const isPublic = searchParams.get('isPublic')

    const where: any = {}
    
    if (categoryId) {
      where.categoryId = categoryId
    }
    if (macroCategoryId) {
      where.OR = [
        { macroCategoryId: macroCategoryId },
        { category: { macroCategoryId: macroCategoryId } }
      ]
    }
    if (isActive !== null) {
      where.isActive = isActive === 'true'
    }
    if (isPublic !== null) {
      where.isPublic = isPublic === 'true'
    }

    const images = await prisma.personalizationImage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
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

    return NextResponse.json(images)
  } catch (error) {
    console.error('Error fetching images:', error)
    return NextResponse.json(
      { error: 'Error al obtener imágenes' },
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
    const files = formData.getAll('files') as File[]
    const categoryId = formData.get('categoryId') as string
    const macroCategoryId = formData.get('macroCategoryId') as string
    const isActive = formData.get('isActive') === 'true'
    const isPublic = formData.get('isPublic') === 'true'
    const tags = formData.get('tags') as string
    const baseName = formData.get('baseName') as string

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'Al menos un archivo requerido' }, { status: 400 })
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

    // Validar tipos de archivo
    const allowedTypes = [
      'image/png', 
      'image/jpeg', 
      'image/jpg', 
      'image/gif', 
      'image/webp', 
      'image/svg+xml', 
      'image/bmp'
    ]
    
    const invalidFiles = files.filter(file => !allowedTypes.includes(file.type))
    if (invalidFiles.length > 0) {
      return NextResponse.json(
        { error: 'Solo se permiten archivos de imagen (PNG, JPG, GIF, WEBP, SVG, BMP)' },
        { status: 400 }
      )
    }

    // Crear directorio si no existe
    const uploadDir = path.join(process.cwd(), 'public/uploads/personalization/images')
    await mkdir(uploadDir, { recursive: true })

    const uploadedImages = []
    const parsedTags = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // Generar nombre único para el archivo
      const timestamp = Date.now()
      const extension = path.extname(file.name)
      const fileName = `image_${timestamp}_${i}${extension}`
      const filePath = path.join(uploadDir, fileName)
      const fileUrl = `/uploads/personalization/images/${fileName}`

      // Guardar archivo
      const buffer = Buffer.from(await file.arrayBuffer())
      await writeFile(filePath, buffer)

      // Obtener dimensiones de la imagen automáticamente
      let width: number | undefined
      let height: number | undefined
      
      try {
        // Intentar usar sharp si está disponible para obtener dimensiones
        const sharp = require('sharp')
        const metadata = await sharp(buffer).metadata()
        width = metadata.width
        height = metadata.height
      } catch (sharpError) {
        // Si sharp no está disponible, usar método alternativo
        console.log('Sharp no disponible, usando detección alternativa de dimensiones')
        
        try {
          // Crear imagen temporal para detectar dimensiones
          const { detectImageDimensions } = await import('@/lib/image-preview')
          const imageUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/uploads/personalization/${uniqueFileName}`
          const dimensions = await detectImageDimensions(imageUrl)
          width = dimensions.width
          height = dimensions.height
        } catch (detectionError) {
          console.warn('No se pudieron detectar dimensiones automáticamente:', detectionError)
        }
      }

      // Determinar el nombre de la imagen
      let imageName = baseName
      if (!imageName) {
        imageName = path.basename(file.name, extension)
      } else if (files.length > 1) {
        imageName = `${baseName} ${i + 1}`
      }

      // Crear registro en la base de datos
      const image = await prisma.personalizationImage.create({
        data: {
          name: imageName,
          categoryId: categoryId || null,
          macroCategoryId: macroCategoryId || null,
          fileUrl,
          thumbnailUrl: null, // Se generará después de crear el registro
          isActive,
          isPublic,
          tags: parsedTags,
          isFromLibrary: false,
          fileType: file.type,
          fileSize: file.size,
          width,
          height
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

      // Generar thumbnail automáticamente después de crear el registro
      if (width && height && (width > 300 || height > 300)) {
        try {
          const { generateThumbnail } = await import('@/lib/image-preview')
          const imageUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/uploads/personalization/${uniqueFileName}`
          
          const thumbnailResult = await generateThumbnail(imageUrl, {
            width: 300,
            height: 300,
            crop: 'center',
            quality: 0.8
          })

          if (thumbnailResult.success && thumbnailResult.thumbnailUrl) {
            // En un caso real, subirías el thumbnail a storage y guardarías la URL
            // Por ahora, usar la URL generada (será un blob URL en cliente)
            await prisma.personalizationImage.update({
              where: { id: image.id },
              data: { 
                thumbnailUrl: thumbnailResult.thumbnailUrl.startsWith('data:') 
                  ? thumbnailResult.thumbnailUrl 
                  : imageUrl // Fallback a imagen original
              }
            })
            
            console.log(`✅ Generated thumbnail for image: ${imageName}`)
          }
        } catch (thumbnailError) {
          console.warn('Error generating thumbnail:', thumbnailError)
          // No fallar la subida de imagen por esto
        }
      }

      uploadedImages.push(image)
    }

    return NextResponse.json({ 
      uploaded: uploadedImages.length, 
      images: uploadedImages 
    })
  } catch (error) {
    console.error('Error creating images:', error)
    return NextResponse.json(
      { error: 'Error al crear imágenes' },
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

    await prisma.personalizationImage.deleteMany({
      where: {
        id: {
          in: ids
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting images:', error)
    return NextResponse.json(
      { error: 'Error al eliminar imágenes' },
      { status: 500 }
    )
  }
}