// Función para convertir color hex a rotación de hue
export const getHueRotation = (hexColor: string): number => {
  // Convertir hex a RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Convertir RGB a HSL
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  
  let h = 0;
  if (max !== min) {
    const d = max - min;
    switch (max) {
      case rNorm: h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0); break;
      case gNorm: h = (bNorm - rNorm) / d + 2; break;
      case bNorm: h = (rNorm - gNorm) / d + 4; break;
    }
    h /= 6;
  }
  
  return Math.round(h * 360);
}

// Colores predefinidos para la paleta
export const DEFAULT_COLOR_PALETTE = [
  '#ff6b35', '#f7931e', '#ffd23f', '#06ffa5', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57',
  '#000000', '#333333', '#666666', '#999999', '#cccccc', '#ffffff', '#ff0000', '#00ff00',
  '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#800000', '#008000', '#000080', '#800080'
];