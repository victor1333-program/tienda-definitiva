/**
 * Sistema de coordenadas relativas para áreas de personalización
 * Convierte entre píxeles absolutos y porcentajes relativos
 */

export interface AbsoluteCoordinates {
  x: number
  y: number
  width: number
  height: number
}

export interface RelativeCoordinates {
  x: number // Porcentaje 0-100
  y: number // Porcentaje 0-100
  width: number // Porcentaje 0-100
  height: number // Porcentaje 0-100
}

export interface CanvasSettings {
  width: number
  height: number
}

/**
 * Dimensiones estándar del canvas del editor
 */
export const STANDARD_CANVAS_SIZE: CanvasSettings = {
  width: 800,
  height: 600
}

/**
 * Convierte coordenadas absolutas (píxeles) a relativas (porcentajes)
 * @param absolute - Coordenadas en píxeles
 * @param canvasSize - Tamaño del canvas de referencia
 * @returns Coordenadas en porcentajes (0-100)
 */
export function absoluteToRelative(
  absolute: AbsoluteCoordinates,
  canvasSize: CanvasSettings
): RelativeCoordinates {
  return {
    x: (absolute.x / canvasSize.width) * 100,
    y: (absolute.y / canvasSize.height) * 100,
    width: (absolute.width / canvasSize.width) * 100,
    height: (absolute.height / canvasSize.height) * 100
  }
}

/**
 * Convierte coordenadas relativas (porcentajes) a absolutas (píxeles)
 * @param relative - Coordenadas en porcentajes (0-100)
 * @param canvasSize - Tamaño del canvas de destino
 * @returns Coordenadas en píxeles
 */
export function relativeToAbsolute(
  relative: RelativeCoordinates,
  canvasSize: CanvasSettings
): AbsoluteCoordinates {
  return {
    x: (relative.x / 100) * canvasSize.width,
    y: (relative.y / 100) * canvasSize.height,
    width: (relative.width / 100) * canvasSize.width,
    height: (relative.height / 100) * canvasSize.height
  }
}

/**
 * Escala una imagen para que se ajuste al canvas manteniendo proporción
 * @param imageSize - Tamaño original de la imagen
 * @param canvasSize - Tamaño del canvas
 * @returns Nuevas dimensiones y posición de la imagen
 */
export function scaleImageToCanvas(
  imageSize: { width: number; height: number },
  canvasSize: CanvasSettings
): {
  width: number
  height: number
  left: number
  top: number
  scaleX: number
  scaleY: number
} {
  const imageAspectRatio = imageSize.width / imageSize.height
  const canvasAspectRatio = canvasSize.width / canvasSize.height

  let newWidth: number
  let newHeight: number

  if (imageAspectRatio > canvasAspectRatio) {
    // La imagen es más ancha que el canvas
    newWidth = canvasSize.width
    newHeight = canvasSize.width / imageAspectRatio
  } else {
    // La imagen es más alta que el canvas
    newHeight = canvasSize.height
    newWidth = canvasSize.height * imageAspectRatio
  }

  const left = (canvasSize.width - newWidth) / 2
  const top = (canvasSize.height - newHeight) / 2

  return {
    width: newWidth,
    height: newHeight,
    left,
    top,
    scaleX: newWidth / imageSize.width,
    scaleY: newHeight / imageSize.height
  }
}

/**
 * Calcula las coordenadas de un área de impresión sobre una imagen escalada
 * @param relativeArea - Área en coordenadas relativas (porcentajes)
 * @param imageTransform - Transformación aplicada a la imagen
 * @param canvasSize - Tamaño del canvas
 * @returns Coordenadas absolutas del área sobre la imagen escalada
 */
export function calculatePrintAreaOnScaledImage(
  relativeArea: RelativeCoordinates,
  imageTransform: {
    left: number
    top: number
    width: number
    height: number
  },
  canvasSize: CanvasSettings
): AbsoluteCoordinates {
  // Convertir el área relativa a coordenadas absolutas sobre la imagen escalada
  const absoluteOnImage = {
    x: (relativeArea.x / 100) * imageTransform.width,
    y: (relativeArea.y / 100) * imageTransform.height,
    width: (relativeArea.width / 100) * imageTransform.width,
    height: (relativeArea.height / 100) * imageTransform.height
  }

  // Ajustar por la posición de la imagen en el canvas
  return {
    x: absoluteOnImage.x + imageTransform.left,
    y: absoluteOnImage.y + imageTransform.top,
    width: absoluteOnImage.width,
    height: absoluteOnImage.height
  }
}

/**
 * Normaliza las coordenadas de un área para que estén dentro de los límites válidos
 * @param area - Área a normalizar
 * @returns Área normalizada con valores entre 0-100
 */
export function normalizeArea(area: RelativeCoordinates): RelativeCoordinates {
  return {
    x: Math.max(0, Math.min(100, area.x)),
    y: Math.max(0, Math.min(100, area.y)),
    width: Math.max(0, Math.min(100 - area.x, area.width)),
    height: Math.max(0, Math.min(100 - area.y, area.height))
  }
}

/**
 * Convierte áreas existentes de coordenadas absolutas a relativas
 * @param areas - Áreas con coordenadas absolutas
 * @param referenceSize - Tamaño de referencia original
 * @returns Áreas con coordenadas relativas
 */
export function migrateAreasToRelative(
  areas: Array<AbsoluteCoordinates & { id: string; name: string }>,
  referenceSize: CanvasSettings
): Array<RelativeCoordinates & { id: string; name: string }> {
  return areas.map(area => ({
    id: area.id,
    name: area.name,
    ...absoluteToRelative(area, referenceSize)
  }))
}