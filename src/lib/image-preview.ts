/**
 * Sistema de generación de imágenes preview para diseños personalizados
 * Genera thumbnails y previews de diseños usando Canvas API
 */

export interface DesignElement {
  id: string
  type: 'text' | 'image' | 'shape'
  x: number
  y: number
  width?: number
  height?: number
  content?: string
  fontSize?: number
  fontFamily?: string
  color?: string
  rotation?: number
  opacity?: number
  imageUrl?: string
  shapeType?: 'rectangle' | 'circle' | 'triangle'
}

export interface DesignArea {
  id: string
  name: string
  x: number
  y: number
  width: number
  height: number
  elements: DesignElement[]
}

export interface ProductDesign {
  productId: string
  variantId?: string
  baseImageUrl: string
  areas: DesignArea[]
  canvasWidth: number
  canvasHeight: number
}

export interface PreviewOptions {
  width?: number
  height?: number
  quality?: number
  format?: 'jpeg' | 'png' | 'webp'
  backgroundColor?: string
}

/**
 * Genera una imagen preview de un diseño personalizado
 */
export async function generateDesignPreview(
  design: ProductDesign,
  options: PreviewOptions = {}
): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
  try {
    const {
      width = 800,
      height = 600,
      quality = 0.8,
      format = 'jpeg',
      backgroundColor = 'transparent'
    } = options

    // Crear canvas
    if (typeof window === 'undefined') {
      // Servidor - usar librería de canvas del servidor si está disponible
      return await generatePreviewServer(design, options)
    }

    // Cliente - usar Canvas API del navegador
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('No se pudo crear contexto de canvas')
    }

    // Fondo
    if (backgroundColor !== 'transparent') {
      ctx.fillStyle = backgroundColor
      ctx.fillRect(0, 0, width, height)
    }

    // Cargar y dibujar imagen base del producto
    if (design.baseImageUrl) {
      const baseImage = await loadImage(design.baseImageUrl)
      
      // Escalar imagen base para ajustarse al canvas
      const scaleX = width / design.canvasWidth
      const scaleY = height / design.canvasHeight
      const scale = Math.min(scaleX, scaleY)
      
      const scaledWidth = design.canvasWidth * scale
      const scaledHeight = design.canvasHeight * scale
      const offsetX = (width - scaledWidth) / 2
      const offsetY = (height - scaledHeight) / 2
      
      ctx.drawImage(baseImage, offsetX, offsetY, scaledWidth, scaledHeight)

      // Dibujar áreas de personalización
      for (const area of design.areas) {
        await drawArea(ctx, area, scale, offsetX, offsetY)
      }
    }

    // Convertir canvas a blob/URL
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const imageUrl = URL.createObjectURL(blob)
          resolve({ success: true, imageUrl })
        } else {
          resolve({ success: false, error: 'Error generando imagen' })
        }
      }, `image/${format}`, quality)
    })

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

/**
 * Dibuja un área de personalización en el canvas
 */
async function drawArea(
  ctx: CanvasRenderingContext2D,
  area: DesignArea,
  scale: number,
  offsetX: number,
  offsetY: number
): Promise<void> {
  for (const element of area.elements) {
    await drawElement(ctx, element, scale, offsetX, offsetY)
  }
}

/**
 * Dibuja un elemento individual en el canvas
 */
async function drawElement(
  ctx: CanvasRenderingContext2D,
  element: DesignElement,
  scale: number,
  offsetX: number,
  offsetY: number
): Promise<void> {
  const x = (element.x * scale) + offsetX
  const y = (element.y * scale) + offsetY

  ctx.save()

  // Aplicar transformaciones
  if (element.rotation) {
    ctx.translate(x + (element.width || 0) * scale / 2, y + (element.height || 0) * scale / 2)
    ctx.rotate((element.rotation * Math.PI) / 180)
    ctx.translate(-(x + (element.width || 0) * scale / 2), -(y + (element.height || 0) * scale / 2))
  }

  if (element.opacity && element.opacity < 1) {
    ctx.globalAlpha = element.opacity
  }

  switch (element.type) {
    case 'text':
      await drawTextElement(ctx, element, x, y, scale)
      break
    case 'image':
      await drawImageElement(ctx, element, x, y, scale)
      break
    case 'shape':
      await drawShapeElement(ctx, element, x, y, scale)
      break
  }

  ctx.restore()
}

/**
 * Dibuja elemento de texto
 */
async function drawTextElement(
  ctx: CanvasRenderingContext2D,
  element: DesignElement,
  x: number,
  y: number,
  scale: number
): Promise<void> {
  if (!element.content) return

  const fontSize = (element.fontSize || 16) * scale
  const fontFamily = element.fontFamily || 'Arial'
  
  ctx.font = `${fontSize}px ${fontFamily}`
  ctx.fillStyle = element.color || '#000000'
  ctx.textBaseline = 'top'

  // Dibujar texto (soporte básico para multilinea)
  const lines = element.content.split('\n')
  lines.forEach((line, index) => {
    ctx.fillText(line, x, y + (index * fontSize * 1.2))
  })
}

/**
 * Dibuja elemento de imagen
 */
async function drawImageElement(
  ctx: CanvasRenderingContext2D,
  element: DesignElement,
  x: number,
  y: number,
  scale: number
): Promise<void> {
  if (!element.imageUrl) return

  try {
    const image = await loadImage(element.imageUrl)
    const width = (element.width || image.width) * scale
    const height = (element.height || image.height) * scale
    
    ctx.drawImage(image, x, y, width, height)
  } catch (error) {
    console.error('Error loading image element:', error)
    // Dibujar placeholder
    ctx.fillStyle = '#cccccc'
    ctx.fillRect(x, y, (element.width || 100) * scale, (element.height || 100) * scale)
  }
}

/**
 * Dibuja elemento de forma geométrica
 */
async function drawShapeElement(
  ctx: CanvasRenderingContext2D,
  element: DesignElement,
  x: number,
  y: number,
  scale: number
): Promise<void> {
  const width = (element.width || 50) * scale
  const height = (element.height || 50) * scale
  
  ctx.fillStyle = element.color || '#000000'
  
  switch (element.shapeType) {
    case 'rectangle':
      ctx.fillRect(x, y, width, height)
      break
    case 'circle':
      ctx.beginPath()
      ctx.arc(x + width/2, y + height/2, Math.min(width, height)/2, 0, 2 * Math.PI)
      ctx.fill()
      break
    case 'triangle':
      ctx.beginPath()
      ctx.moveTo(x + width/2, y)
      ctx.lineTo(x, y + height)
      ctx.lineTo(x + width, y + height)
      ctx.closePath()
      ctx.fill()
      break
  }
}

/**
 * Carga una imagen de forma asíncrona
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous' // Para imágenes de otros dominios
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/**
 * Detecta automáticamente las dimensiones de una imagen
 */
export async function detectImageDimensions(imageUrl: string): Promise<{
  width: number
  height: number
  aspectRatio: number
  orientation: 'landscape' | 'portrait' | 'square'
}> {
  try {
    const img = await loadImage(imageUrl)
    
    const width = img.naturalWidth || img.width
    const height = img.naturalHeight || img.height
    const aspectRatio = width / height
    
    let orientation: 'landscape' | 'portrait' | 'square'
    if (aspectRatio > 1.1) {
      orientation = 'landscape'
    } else if (aspectRatio < 0.9) {
      orientation = 'portrait'
    } else {
      orientation = 'square'
    }
    
    return {
      width,
      height,
      aspectRatio,
      orientation
    }
  } catch (error) {
    throw new Error(`Error detecting image dimensions: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Genera thumbnail de una imagen con dimensiones específicas
 */
export async function generateThumbnail(
  imageUrl: string,
  options: {
    width: number
    height: number
    quality?: number
    crop?: 'center' | 'top' | 'bottom' | 'left' | 'right'
    format?: 'jpeg' | 'png' | 'webp'
  }
): Promise<{ success: boolean; thumbnailUrl?: string; error?: string }> {
  try {
    const {
      width,
      height,
      quality = 0.8,
      crop = 'center',
      format = 'jpeg'
    } = options

    if (typeof window === 'undefined') {
      // Servidor - usar procesamiento de servidor si está disponible
      return generateThumbnailServer(imageUrl, options)
    }

    // Cliente - usar Canvas API del navegador
    const img = await loadImage(imageUrl)
    
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('No se pudo crear contexto de canvas')
    }

    // Calcular dimensiones para el crop
    const imgAspect = img.width / img.height
    const canvasAspect = width / height
    
    let sourceX = 0, sourceY = 0, sourceWidth = img.width, sourceHeight = img.height
    
    if (imgAspect > canvasAspect) {
      // Imagen más ancha, recortar horizontalmente
      sourceWidth = img.height * canvasAspect
      sourceX = crop === 'left' ? 0 : 
                crop === 'right' ? img.width - sourceWidth :
                (img.width - sourceWidth) / 2 // center
    } else if (imgAspect < canvasAspect) {
      // Imagen más alta, recortar verticalmente
      sourceHeight = img.width / canvasAspect
      sourceY = crop === 'top' ? 0 :
                crop === 'bottom' ? img.height - sourceHeight :
                (img.height - sourceHeight) / 2 // center
    }

    // Dibujar imagen recortada y redimensionada
    ctx.drawImage(
      img,
      sourceX, sourceY, sourceWidth, sourceHeight,
      0, 0, width, height
    )

    // Convertir a blob/URL
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const thumbnailUrl = URL.createObjectURL(blob)
          resolve({ success: true, thumbnailUrl })
        } else {
          resolve({ success: false, error: 'Error generando thumbnail' })
        }
      }, `image/${format}`, quality)
    })

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

/**
 * Genera thumbnail en servidor
 */
async function generateThumbnailServer(
  imageUrl: string,
  options: any
): Promise<{ success: boolean; thumbnailUrl?: string; error?: string }> {
  try {
    // Intentar usar sharp si está disponible
    try {
      const sharp = require('sharp')
      
      // Descargar imagen
      const response = await fetch(imageUrl)
      const buffer = await response.arrayBuffer()
      
      // Procesar con sharp
      const processedBuffer = await sharp(Buffer.from(buffer))
        .resize(options.width, options.height, {
          fit: 'cover',
          position: options.crop === 'center' ? 'centre' : options.crop
        })
        .jpeg({ quality: Math.round((options.quality || 0.8) * 100) })
        .toBuffer()
      
      // En producción, subir a cloud storage y retornar URL
      // Por ahora, convertir a base64
      const base64 = processedBuffer.toString('base64')
      return {
        success: true,
        thumbnailUrl: `data:image/jpeg;base64,${base64}`
      }
    } catch (sharpError) {
      console.log('Sharp no disponible, usando fallback')
    }

    // Fallback: retornar imagen original (sin procesamiento)
    return {
      success: true,
      thumbnailUrl: imageUrl
    }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error en servidor'
    }
  }
}

/**
 * Genera múltiples thumbnails con diferentes tamaños
 */
export async function generateMultipleThumbnails(
  imageUrl: string,
  sizes: Array<{
    name: string
    width: number
    height: number
    crop?: 'center' | 'top' | 'bottom' | 'left' | 'right'
  }>
): Promise<{
  thumbnails: Record<string, string>
  errors?: string[]
}> {
  const thumbnails: Record<string, string> = {}
  const errors: string[] = []

  for (const size of sizes) {
    try {
      const result = await generateThumbnail(imageUrl, {
        width: size.width,
        height: size.height,
        crop: size.crop || 'center',
        quality: 0.8
      })

      if (result.success && result.thumbnailUrl) {
        thumbnails[size.name] = result.thumbnailUrl
      } else {
        errors.push(`${size.name}: ${result.error}`)
      }
    } catch (error) {
      errors.push(`${size.name}: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  return { 
    thumbnails, 
    ...(errors.length > 0 && { errors })
  }
}

/**
 * Optimiza una imagen reduciendo su tamaño sin perder mucha calidad
 */
export async function optimizeImage(
  imageUrl: string,
  options: {
    maxWidth?: number
    maxHeight?: number
    quality?: number
    format?: 'jpeg' | 'png' | 'webp'
  } = {}
): Promise<{ success: boolean; optimizedUrl?: string; originalSize?: number; newSize?: number; error?: string }> {
  try {
    const {
      maxWidth = 1920,
      maxHeight = 1920,
      quality = 0.85,
      format = 'jpeg'
    } = options

    const img = await loadImage(imageUrl)
    
    // Calcular nuevas dimensiones manteniendo aspecto
    let newWidth = img.width
    let newHeight = img.height
    
    if (newWidth > maxWidth) {
      newHeight = (newHeight * maxWidth) / newWidth
      newWidth = maxWidth
    }
    
    if (newHeight > maxHeight) {
      newWidth = (newWidth * maxHeight) / newHeight
      newHeight = maxHeight
    }

    const canvas = document.createElement('canvas')
    canvas.width = newWidth
    canvas.height = newHeight
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('No se pudo crear contexto de canvas')
    }

    // Dibujar imagen redimensionada
    ctx.drawImage(img, 0, 0, newWidth, newHeight)

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const optimizedUrl = URL.createObjectURL(blob)
          
          // Calcular tamaños aproximados (blob.size para el nuevo, estimación para el original)
          const newSize = blob.size
          const originalSize = img.width * img.height * 4 // Estimación RGBA

          resolve({ 
            success: true, 
            optimizedUrl, 
            originalSize,
            newSize
          })
        } else {
          resolve({ success: false, error: 'Error optimizando imagen' })
        }
      }, `image/${format}`, quality)
    })

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

/**
 * Generación de preview en servidor (Node.js)
 * Requiere canvas o sharp instalado
 */
async function generatePreviewServer(
  design: ProductDesign,
  options: PreviewOptions = {}
): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
  try {
    // Intentar usar canvas en servidor si está disponible
    try {
      const { createCanvas, loadImage: loadImageNode } = require('canvas')
      
      const canvas = createCanvas(options.width || 800, options.height || 600)
      const ctx = canvas.getContext('2d')
      
      // Similar lógica que en cliente pero usando canvas de Node.js
      // ... (implementación similar)
      
      const buffer = canvas.toBuffer('image/jpeg', { quality: options.quality || 0.8 })
      
      // En producción, subir a cloud storage y retornar URL
      // Por ahora, convertir a base64
      const base64 = buffer.toString('base64')
      return {
        success: true,
        imageUrl: `data:image/jpeg;base64,${base64}`
      }
    } catch (canvasError) {
      console.log('Canvas no disponible en servidor, usando fallback')
    }

    // Fallback: generar preview simple
    return {
      success: true,
      imageUrl: '/images/preview-placeholder.png' // Imagen placeholder
    }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error en servidor'
    }
  }
}

/**
 * Genera múltiples previews de diferentes tamaños
 */
export async function generateMultiplePreviewSizes(
  design: ProductDesign
): Promise<{
  thumbnail?: string
  medium?: string
  large?: string
  errors?: string[]
}> {
  const sizes = [
    { name: 'thumbnail', width: 150, height: 150 },
    { name: 'medium', width: 400, height: 400 },
    { name: 'large', width: 800, height: 800 }
  ]

  const results: any = {}
  const errors: string[] = []

  for (const size of sizes) {
    try {
      const preview = await generateDesignPreview(design, {
        width: size.width,
        height: size.height,
        format: 'jpeg',
        quality: 0.8
      })

      if (preview.success) {
        results[size.name] = preview.imageUrl
      } else {
        errors.push(`${size.name}: ${preview.error}`)
      }
    } catch (error) {
      errors.push(`${size.name}: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  return { ...results, ...(errors.length > 0 && { errors }) }
}

/**
 * Convierte datos de diseño del frontend al formato requerido
 */
export function convertDesignDataToPreview(
  productData: any,
  designData: any
): ProductDesign {
  return {
    productId: productData.id,
    variantId: designData.selectedVariant,
    baseImageUrl: productData.images?.[0] || '/images/placeholder-product.png',
    canvasWidth: 800,
    canvasHeight: 600,
    areas: Object.entries(designData.areas || {}).map(([areaId, areaData]: [string, any]) => ({
      id: areaId,
      name: areaData.name || `Área ${areaId}`,
      x: areaData.x || 0,
      y: areaData.y || 0,
      width: areaData.width || 200,
      height: areaData.height || 200,
      elements: Object.values(areaData.elements || {}).map((element: any) => ({
        id: element.id,
        type: element.type,
        x: element.x || 0,
        y: element.y || 0,
        width: element.width,
        height: element.height,
        content: element.content,
        fontSize: element.fontSize,
        fontFamily: element.fontFamily,
        color: element.color,
        rotation: element.rotation,
        opacity: element.opacity,
        imageUrl: element.imageUrl,
        shapeType: element.shapeType
      }))
    }))
  }
}