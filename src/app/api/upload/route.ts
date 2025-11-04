import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/auth"
import { uploadImage, uploadMultipleImages } from '@/lib/cloudinary'
import { validateFileSecurely, generateSecureFileName } from '@/lib/file-security'
import { withErrorHandler, CommonErrors } from '@/lib/error-handler'
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

// Función para validar archivo con seguridad robusta
async function validateFile(file: File) {
  const validation = await validateFileSecurely(file)
  if (!validation.isValid) {
    throw new Error(validation.error || 'Archivo inválido')
  }
  return validation
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
const postHandler = async (request: NextRequest) => {
  try {
    // Upload API called
    
    // Verificar autenticación
    const session = await auth()
    // Session validated
    
    if (!session?.user || session.user.role === 'CUSTOMER') {
      // Authentication failed
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

    // Data log removed
    console.log('Upload data:', {
      hasFile: !!file,
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      filesCount: files.length,
      folder,
      type
    })

    // Manejo para archivos de workshop (single file con type)
    if (type && file && file.size > 0) {
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
    const filesToProcess = files.length > 0 ? files : (file && file.size > 0 ? [file] : [])

    console.log('Files to process:', filesToProcess.length)

    if (!filesToProcess.length) {
      console.error('No files to process')
      return NextResponse.json(
        { error: 'No se encontraron archivos' },
        { status: 400 }
      )
    }

    // Validar archivos antes de procesarlos
    for (const fileItem of filesToProcess) {
      console.log('Validating file:', fileItem.name, 'size:', fileItem.size)
      await validateFile(fileItem)
    }

    let results

    if (filesToProcess.length === 1) {
      // Subir archivo único a Cloudinary
      const fileItem = filesToProcess[0]
      const buffer = await fileToBuffer(fileItem)

      console.log('Uploading to Cloudinary...', { folder, fileName: fileItem.name })
      results = await uploadImage(buffer, folder)
      console.log('File uploaded successfully to Cloudinary:', results.secure_url)
    } else {
      // Subir múltiples archivos a Cloudinary
      const buffers = await Promise.all(
        filesToProcess.map(fileItem => fileToBuffer(fileItem))
      )

      console.log('Uploading multiple files to Cloudinary...', { count: buffers.length, folder })
      results = await uploadMultipleImages(buffers, folder)
      console.log('Files uploaded successfully to Cloudinary:', results.length)
    }

    return NextResponse.json({
      success: true,
      data: results,
      url: Array.isArray(results) ? results[0]?.secure_url : results.secure_url,
      message: filesToProcess.length === 1 
        ? 'Imagen subida correctamente' 
        : `${filesToProcess.length} imágenes subidas correctamente`
    })

  } catch (error) {
    // El withErrorHandler se encargará de manejar este error de forma segura
    throw error
  }
}

export const POST = withErrorHandler(postHandler)

// GET: Obtener información de configuración de upload
const getHandler = async () => {
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
}

export const GET = withErrorHandler(getHandler)