/**
 * Cálculo de precios para diseños personalizados
 * Calcula el precio adicional basado en la complejidad del diseño
 */

interface DesignElement {
  type: string
  data: any
  id: string
}

interface DesignData {
  elements?: DesignElement[]
  texts?: any[]
  images?: any[]
  shapes?: any[]
  customizations?: any
}

interface PricingRules {
  baseComplexity: number
  textElementPrice: number
  imageElementPrice: number
  shapeElementPrice: number
  colorComplexityMultiplier: number
  sizeMultiplier: number
  specialEffectsPrice: number
}

// Reglas de precios configurables
const DEFAULT_PRICING_RULES: PricingRules = {
  baseComplexity: 0,
  textElementPrice: 2.50, // €2.50 por elemento de texto
  imageElementPrice: 5.00, // €5.00 por imagen personalizada
  shapeElementPrice: 1.75, // €1.75 por forma/figura
  colorComplexityMultiplier: 0.15, // 15% adicional por cada color extra
  sizeMultiplier: 1.0, // Multiplicador por tamaño
  specialEffectsPrice: 3.00 // €3.00 por efecto especial
}

/**
 * Calcula el precio personalizado basado en la complejidad del diseño
 */
export function calculateDesignPrice(
  designData: DesignData,
  quantity: number = 1,
  customRules?: Partial<PricingRules>
): {
  customPrice: number
  breakdown: {
    textElements: number
    imageElements: number
    shapeElements: number
    colorComplexity: number
    specialEffects: number
    sizeMultiplier: number
    quantityDiscount: number
  }
  totalComplexityScore: number
} {
  const rules = { ...DEFAULT_PRICING_RULES, ...customRules }
  let customPrice = rules.baseComplexity
  
  const breakdown = {
    textElements: 0,
    imageElements: 0,
    shapeElements: 0,
    colorComplexity: 0,
    specialEffects: 0,
    sizeMultiplier: 0,
    quantityDiscount: 0
  }

  // Contar elementos del diseño
  const allElements = [
    ...(designData.elements || []),
    ...(designData.texts || []),
    ...(designData.images || []),
    ...(designData.shapes || [])
  ]

  // Calcular precio por elementos de texto
  const textElements = allElements.filter(el => 
    el.type === 'text' || el.type === 'textbox' || el.type === 'i-text'
  )
  breakdown.textElements = textElements.length * rules.textElementPrice
  customPrice += breakdown.textElements

  // Calcular precio por imágenes
  const imageElements = allElements.filter(el => 
    el.type === 'image' || el.type === 'img' || el.data?.src
  )
  breakdown.imageElements = imageElements.length * rules.imageElementPrice
  customPrice += breakdown.imageElements

  // Calcular precio por formas
  const shapeElements = allElements.filter(el => 
    ['rect', 'circle', 'triangle', 'polygon', 'path', 'shape'].includes(el.type)
  )
  breakdown.shapeElements = shapeElements.length * rules.shapeElementPrice
  customPrice += breakdown.shapeElements

  // Calcular complejidad por colores únicos
  const uniqueColors = new Set()
  allElements.forEach(element => {
    if (element.data?.fill) uniqueColors.add(element.data.fill)
    if (element.data?.stroke) uniqueColors.add(element.data.stroke)
    if (element.data?.color) uniqueColors.add(element.data.color)
  })
  
  if (uniqueColors.size > 2) { // Más de 2 colores es complejo
    breakdown.colorComplexity = customPrice * rules.colorComplexityMultiplier * (uniqueColors.size - 2)
    customPrice += breakdown.colorComplexity
  }

  // Efectos especiales
  const hasSpecialEffects = allElements.some(element => 
    element.data?.shadow || 
    element.data?.filters || 
    element.data?.effects ||
    element.data?.blend ||
    element.data?.opacity < 1
  )
  
  if (hasSpecialEffects) {
    breakdown.specialEffects = rules.specialEffectsPrice
    customPrice += breakdown.specialEffects
  }

  // Multiplicador por tamaño (para productos grandes)
  if (rules.sizeMultiplier !== 1.0) {
    breakdown.sizeMultiplier = customPrice * (rules.sizeMultiplier - 1)
    customPrice += breakdown.sizeMultiplier
  }

  // Descuento por cantidad
  if (quantity >= 10) {
    const discount = customPrice * 0.15 // 15% descuento
    breakdown.quantityDiscount = -discount
    customPrice -= discount
  } else if (quantity >= 5) {
    const discount = customPrice * 0.08 // 8% descuento
    breakdown.quantityDiscount = -discount
    customPrice -= discount
  }

  // Calcular score de complejidad total
  const totalComplexityScore = Math.min(100, 
    (textElements.length * 10) + 
    (imageElements.length * 20) + 
    (shapeElements.length * 8) + 
    (uniqueColors.size * 5) + 
    (hasSpecialEffects ? 15 : 0)
  )

  return {
    customPrice: Math.max(0, Math.round(customPrice * 100) / 100), // Redondear a 2 decimales
    breakdown,
    totalComplexityScore
  }
}

/**
 * Obtiene reglas de precios específicas para una categoría de producto
 */
export function getPricingRulesForCategory(categorySlug: string): Partial<PricingRules> {
  const categoryRules: Record<string, Partial<PricingRules>> = {
    'textil': {
      textElementPrice: 3.00,
      imageElementPrice: 6.00,
      specialEffectsPrice: 4.00
    },
    'sublimacion': {
      textElementPrice: 2.00,
      imageElementPrice: 4.50,
      colorComplexityMultiplier: 0.10 // Sublimación maneja mejor los colores
    },
    'laser': {
      shapeElementPrice: 2.50,
      specialEffectsPrice: 5.00,
      colorComplexityMultiplier: 0.05 // Láser es principalmente monocolor
    },
    'premium': {
      baseComplexity: 5.00,
      textElementPrice: 4.00,
      imageElementPrice: 8.00,
      specialEffectsPrice: 6.00
    }
  }

  return categoryRules[categorySlug] || {}
}

/**
 * Calcula el precio total de un diseño incluyendo producto base
 */
export function calculateTotalDesignPrice(
  basePrice: number,
  designData: DesignData,
  quantity: number = 1,
  categorySlug?: string
): {
  basePrice: number
  customPrice: number
  totalPrice: number
  savings: number
  breakdown: any
  complexityScore: number
} {
  const categoryRules = categorySlug ? getPricingRulesForCategory(categorySlug) : {}
  const { customPrice, breakdown, totalComplexityScore } = calculateDesignPrice(
    designData, 
    quantity, 
    categoryRules
  )

  const totalBasePrice = basePrice * quantity
  const totalPrice = totalBasePrice + customPrice
  const savings = breakdown.quantityDiscount ? Math.abs(breakdown.quantityDiscount) : 0

  return {
    basePrice: totalBasePrice,
    customPrice,
    totalPrice,
    savings,
    breakdown,
    complexityScore: totalComplexityScore
  }
}