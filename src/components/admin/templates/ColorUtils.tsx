// Función para convertir color hex a rotación de hue
export const getHueRotation = (hexColor: string): number => {
  if (!hexColor || hexColor === 'transparent') return 0
  
  // Convertir hex a RGB
  const hex = hexColor.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16) / 255
  const g = parseInt(hex.substr(2, 2), 16) / 255  
  const b = parseInt(hex.substr(4, 2), 16) / 255

  // Convertir RGB a HSL
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const diff = max - min

  let h = 0
  if (diff !== 0) {
    if (max === r) {
      h = ((g - b) / diff) % 6
    } else if (max === g) {
      h = (b - r) / diff + 2
    } else {
      h = (r - g) / diff + 4
    }
  }
  
  h = Math.round(h * 60)
  if (h < 0) h += 360

  return h
}

// Convertir coordenadas relativas a absolutas
export function relativeToAbsolute(
  relative: { x: number; y: number },
  containerWidth: number,
  containerHeight: number
): { x: number; y: number } {
  return {
    x: relative.x * containerWidth,
    y: relative.y * containerHeight
  }
}

// Convertir coordenadas absolutas a relativas
export function absoluteToRelative(
  absolute: { x: number; y: number },
  containerWidth: number,
  containerHeight: number
): { x: number; y: number } {
  return {
    x: containerWidth > 0 ? absolute.x / containerWidth : 0,
    y: containerHeight > 0 ? absolute.y / containerHeight : 0
  }
}