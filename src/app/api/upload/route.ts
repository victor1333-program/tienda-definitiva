import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { uploadImage, uploadMultipleImages } from '@/lib/cloudinary'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// Configuración de límites
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml']

// Configuración para archivos de workshop
const WORKSHOP_FILE_CONFIGS = {
  design: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedExtensions: ['.ai', '.svg', '.pdf', '.dxf', '.eps', '.cdr'],
    allowedMimeTypes: [
      'application/pdf',
      'image/svg+xml',
      'application/illustrator',
      'application/postscript',
      'application/x-autocad',
      'application/x-dxf'
    ]
  },
  instruction: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedExtensions: ['.pdf', '.doc', '.docx', '.txt'],
    allowedMimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ]
  },
  reference: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    allowedMimeTypes: [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp'
    ]
  }
}

// Función para validar archivo (legacy para compatibilidad)
function validateFile(file: File) {
  // Validar tamaño
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`El archivo es demasiado grande. Máximo ${MAX_FILE_SIZE / 1024 / 1024}MB`)
  }

  // Validar tipo
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(`Tipo de archivo no permitido. Permitidos: ${ALLOWED_TYPES.join(', ')}`)
  }
}

// Función para validar archivos de workshop
function validateWorkshopFile(file: File, type: string) {
  const config = WORKSHOP_FILE_CONFIGS[type as keyof typeof WORKSHOP_FILE_CONFIGS]
  if (!config) {
    throw new Error(`Tipo de archivo de workshop inválido: ${type}`)
  }

  // Validar tamaño
  if (file.size > config.maxSize) {
    throw new Error(`El archivo es demasiado grande. Máximo ${config.maxSize / 1024 / 1024}MB para ${type}`)
  }

  // Validar extensión
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
  if (!config.allowedExtensions.includes(fileExtension)) {
    throw new Error(`Extensión no permitida para ${type}. Permitidas: ${config.allowedExtensions.join(', ')}`)
  }
}

// Función para convertir File a Buffer
async function fileToBuffer(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

// POST: Subir archivo(s)
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role === 'CUSTOMER') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const files = formData.getAll('files') as File[]
    const folder = formData.get('folder') as string || 'tienda-definitiva'
    const type = formData.get('type') as string // Nuevo: tipo para workshop

    // Manejo para archivos de workshop (single file con type)
    if (type && file) {
      validateWorkshopFile(file, type)

      // Para archivos que no son imágenes de referencia, guardar localmente
      if (type !== 'reference') {
        // Crear directorios si no existen
        const uploadsDir = join(process.cwd(), 'public', 'uploads')
        const typeDir = join(uploadsDir, type)
        
        if (!existsSync(uploadsDir)) {
          await mkdir(uploadsDir, { recursive: true })
        }
        
        if (!existsSync(typeDir)) {
          await mkdir(typeDir, { recursive: true })
        }

        // Generar nombre único
        const timestamp = Date.now()
        const randomString = Math.random().toString(36).substring(2, 15)
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
        const fileName = `${timestamp}-${randomString}${fileExtension}`
        const filePath = join(typeDir, fileName)

        // Guardar archivo
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        await writeFile(filePath, buffer)

        // Retornar URL pública
        const url = `/uploads/${type}/${fileName}`
        return NextResponse.json({ url }, { status: 200 })
      } else {
        // Para imágenes de referencia, usar Cloudinary
        const buffer = await fileToBuffer(file)
        const results = await uploadImage(buffer, folder)
        return NextResponse.json({ url: results.secure_url }, { status: 200 })
      }
    }

    // Manejo legacy para múltiples archivos de imágenes
    const filesToProcess = files.length > 0 ? files : (file ? [file] : [])
    
    if (!filesToProcess.length) {
      return NextResponse.json(
        { error: 'No se encontraron archivos' },
        { status: 400 }
      )
    }

    // Validar archivos (legacy)
    for (const fileItem of filesToProcess) {
      validateFile(fileItem)
    }

    let results

    if (filesToProcess.length === 1) {
      // Subir archivo único
      const buffer = await fileToBuffer(filesToProcess[0])
      results = await uploadImage(buffer, folder)
    } else {
      // Subir múltiples archivos
      const buffers = await Promise.all(filesToProcess.map(fileToBuffer))
      results = await uploadMultipleImages(buffers, folder)
    }

    return NextResponse.json({
      success: true,
      data: results,
      message: filesToProcess.length === 1 
        ? 'Imagen subida correctamente' 
        : `${filesToProcess.length} imágenes subidas correctamente`
    })

  } catch (error) {
    console.error('Error uploading files:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Error al subir archivo(s)'
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

// GET: Obtener información de configuración de upload
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      config: {
        maxFileSize: MAX_FILE_SIZE,
        maxFileSizeMB: MAX_FILE_SIZE / 1024 / 1024,
        allowedTypes: ALLOWED_TYPES,
        allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.svg'],
        workshop: WORKSHOP_FILE_CONFIGS
      }
    })
  } catch (error) {
    console.error('Error getting upload config:', error)
    return NextResponse.json(
      { error: 'Error al obtener configuración' },
      { status: 500 }
    )
  }
}