// Cloudinary functionality disabled - dependency removed for optimization
// This module is kept for compatibility but functions now return mock data

// Mock functions for compatibility
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
  console.warn('Cloudinary upload disabled - using local fallback')
  
  // Return mock data for development
  return {
    public_id: `mock_${Date.now()}`,
    secure_url: '/images/placeholder-category.jpg',
    width: 800,
    height: 600,
    format: 'jpg',
    bytes: 1024,
    resource_type: 'image',
  }
}

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
  console.warn('Cloudinary upload disabled - using local fallback')
  return files.map((_, index) => ({
    public_id: `mock_${Date.now()}_${index}`,
    secure_url: '/images/placeholder-category.jpg',
    width: 800,
    height: 600,
    format: 'jpg',
    bytes: 1024,
    resource_type: 'image',
  }))
}

export async function deleteImage(publicId: string): Promise<{ result: string }> {
  console.warn('Cloudinary delete disabled')
  return { result: 'ok' }
}

export async function deleteMultipleImages(publicIds: string[]): Promise<{ deleted: string[] }> {
  console.warn('Cloudinary delete disabled')
  return { deleted: publicIds }
}

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
  console.warn('Cloudinary optimization disabled - returning original URL')
  return publicId.startsWith('http') ? publicId : '/images/placeholder-category.jpg'
}

export default null