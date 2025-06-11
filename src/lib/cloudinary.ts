import { v2 as cloudinary } from 'cloudinary'

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
})

// Función para subir imagen
export async function uploadImage(file: File | Buffer, folder: string = 'tienda-definitiva') {
  try {
    // Convertir a base64 data URL si es Buffer
    const fileData = file instanceof File 
      ? URL.createObjectURL(file) 
      : `data:image/jpeg;base64,${file.toString('base64')}`
    
    const result = await cloudinary.uploader.upload(
      fileData,
      {
        folder,
        resource_type: 'image',
        quality: 'auto',
        fetch_format: 'auto',
        crop: 'limit',
        width: 2000,  // Máximo 2000px de ancho
        height: 2000  // Máximo 2000px de alto
      }
    )

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes
    }
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error)
    throw new Error('Error al subir la imagen')
  }
}

// Función para subir múltiples imágenes
export async function uploadMultipleImages(files: (File | Buffer)[], folder: string = 'tienda-definitiva') {
  try {
    const uploadPromises = files.map(file => uploadImage(file, folder))
    const results = await Promise.all(uploadPromises)
    return results
  } catch (error) {
    console.error('Error uploading multiple images:', error)
    throw new Error('Error al subir las imágenes')
  }
}

// Función para eliminar imagen
export async function deleteImage(publicId: string) {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return result
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error)
    throw new Error('Error al eliminar la imagen')
  }
}

// Función para eliminar múltiples imágenes
export async function deleteMultipleImages(publicIds: string[]) {
  try {
    const result = await cloudinary.api.delete_resources(publicIds)
    return result
  } catch (error) {
    console.error('Error deleting multiple images:', error)
    throw new Error('Error al eliminar las imágenes')
  }
}

// Función para transformar URL de imagen (redimensionar, etc.)
export function transformImageUrl(publicId: string, options: {
  width?: number
  height?: number
  crop?: string
  quality?: string | number
  format?: string
}) {
  return cloudinary.url(publicId, {
    ...options,
    secure: true
  })
}

export default cloudinary