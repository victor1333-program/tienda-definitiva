import { v2 as cloudinary } from 'cloudinary'

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Verificar configuración
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.warn('⚠️ Cloudinary credentials not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file.')
}

/**
 * Sube una imagen a Cloudinary
 */
export async function uploadImage(
  file: Buffer | string,
  folder: string = 'uploads',
  filename?: string
): Promise<{
  public_id: string
  secure_url: string
  width: number
  height: number
  format: string
  bytes: number
  resource_type: string
}> {
  try {
    let uploadOptions: any = {
      folder: folder,
      resource_type: 'auto',
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    }

    if (filename) {
      uploadOptions.public_id = filename
    }

    let result

    if (Buffer.isBuffer(file)) {
      // Subir desde buffer
      result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          }
        )
        uploadStream.end(file)
      })
    } else {
      // Subir desde URL o path
      result = await cloudinary.uploader.upload(file, uploadOptions)
    }

    return result as any
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error)
    throw new Error('Failed to upload image to Cloudinary')
  }
}

/**
 * Sube múltiples imágenes a Cloudinary
 */
export async function uploadMultipleImages(
  files: (Buffer | string)[],
  folder: string = 'uploads'
): Promise<Array<{
  public_id: string
  secure_url: string
  width: number
  height: number
  format: string
  bytes: number
  resource_type: string
}>> {
  const uploadPromises = files.map(file => uploadImage(file, folder))
  return Promise.all(uploadPromises)
}

/**
 * Elimina una imagen de Cloudinary
 */
export async function deleteImage(publicId: string): Promise<{ result: string }> {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return result
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error)
    throw new Error('Failed to delete image from Cloudinary')
  }
}

/**
 * Elimina múltiples imágenes de Cloudinary
 */
export async function deleteMultipleImages(publicIds: string[]): Promise<{ deleted: string[] }> {
  try {
    const deletePromises = publicIds.map(id => deleteImage(id))
    await Promise.all(deletePromises)
    return { deleted: publicIds }
  } catch (error) {
    console.error('Error deleting multiple images from Cloudinary:', error)
    throw new Error('Failed to delete images from Cloudinary')
  }
}

/**
 * Obtiene una URL optimizada de una imagen de Cloudinary
 */
export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number
    height?: number
    quality?: number | 'auto'
    format?: string | 'auto'
    crop?: string
  } = {}
): string {
  // Si ya es una URL completa, devolverla tal cual
  if (publicId.startsWith('http')) {
    return publicId
  }

  const transformations: any = {}

  if (options.width) transformations.width = options.width
  if (options.height) transformations.height = options.height
  if (options.quality) transformations.quality = options.quality
  if (options.format) transformations.fetch_format = options.format
  if (options.crop) transformations.crop = options.crop

  return cloudinary.url(publicId, transformations)
}

export default cloudinary
