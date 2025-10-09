/**
 * Validación robusta de archivos con magic numbers (file signatures)
 * Para prevenir subida de archivos maliciosos
 */

// Magic numbers para validación de tipos de archivo reales
const MAGIC_NUMBERS = {
  // Imágenes
  'image/jpeg': [
    [0xFF, 0xD8, 0xFF], // JPEG/JFIF
  ],
  'image/png': [
    [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], // PNG
  ],
  'image/webp': [
    [0x52, 0x49, 0x46, 0x46], // RIFF (WebP container)
  ],
  'image/gif': [
    [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], // GIF87a
    [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], // GIF89a
  ],
  // Documentos seguros
  'application/pdf': [
    [0x25, 0x50, 0x44, 0x46], // %PDF
  ],
  'text/plain': [
    // Text files - no magic number, validamos contenido ASCII
  ]
}

// Tipos MIME permitidos con validación estricta
const ALLOWED_SECURE_TYPES = {
  // Solo imágenes comunes y seguras
  images: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  // Solo documentos específicos y seguros
  documents: ['application/pdf', 'text/plain'],
  // Videos específicos (sin magic numbers por ahora)
  videos: ['video/mp4', 'video/webm']
}

/**
 * Valida el magic number de un archivo
 */
export function validateMagicNumber(buffer: Buffer, mimeType: string): boolean {
  const signatures = MAGIC_NUMBERS[mimeType as keyof typeof MAGIC_NUMBERS]
  if (!signatures) {
    return false
  }

  // Para text/plain, validamos que sea ASCII válido
  if (mimeType === 'text/plain') {
    const text = buffer.toString('utf8', 0, Math.min(512, buffer.length))
    return /^[\x00-\x7F]*$/.test(text) // Solo ASCII
  }

  // Validar contra todas las signatures posibles
  return signatures.some(signature => 
    signature.every((byte, index) => buffer[index] === byte)
  )
}

/**
 * Valida un archivo de forma segura
 */
export async function validateFileSecurely(file: File): Promise<{
  isValid: boolean
  error?: string
  detectedType?: string
}> {
  try {
    // 1. Validar tamaño (5MB max para imágenes)
    const maxSize = file.type.startsWith('image/') ? 5 * 1024 * 1024 : 2 * 1024 * 1024
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `Archivo demasiado grande. Máximo ${maxSize / 1024 / 1024}MB`
      }
    }

    // 2. Validar que el tipo MIME esté en la lista permitida
    const allAllowedTypes = [
      ...ALLOWED_SECURE_TYPES.images,
      ...ALLOWED_SECURE_TYPES.documents,
      ...ALLOWED_SECURE_TYPES.videos
    ]

    if (!allAllowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `Tipo de archivo no permitido: ${file.type}`
      }
    }

    // 3. Para imágenes y PDFs, validar magic number
    if (MAGIC_NUMBERS[file.type as keyof typeof MAGIC_NUMBERS]) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const isValidMagic = validateMagicNumber(buffer, file.type)
      
      if (!isValidMagic) {
        return {
          isValid: false,
          error: 'El contenido del archivo no coincide con su extensión'
        }
      }
    }

    // 4. Validaciones adicionales por tipo
    if (file.type.startsWith('image/')) {
      // Para imágenes, verificar que no sean demasiado grandes en pixeles
      // (esto se puede hacer con Image API en el cliente)
    }

    return {
      isValid: true,
      detectedType: file.type
    }

  } catch (error) {
    return {
      isValid: false,
      error: 'Error al validar el archivo'
    }
  }
}

/**
 * Sanitiza el nombre del archivo
 */
export function sanitizeFileName(fileName: string): string {
  // Remover caracteres peligrosos y normalizar
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Solo alfanumérico, punto y guión
    .replace(/\.+/g, '.') // Múltiples puntos -> uno solo
    .replace(/^\./, '') // Sin punto al inicio
    .substring(0, 100) // Máximo 100 caracteres
}

/**
 * Genera un nombre único y seguro para el archivo
 */
export function generateSecureFileName(originalName: string): string {
  const sanitized = sanitizeFileName(originalName)
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  
  const nameParts = sanitized.split('.')
  const extension = nameParts.pop()
  const name = nameParts.join('.')
  
  return `${name}_${timestamp}_${random}.${extension}`
}