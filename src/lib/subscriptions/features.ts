import { SubscriptionFeatures, SubscriptionPlanConfig } from './types'

/**
 * Valida si un usuario tiene acceso a una característica específica
 */
export const validateFeatureAccess = (
  userPlan: SubscriptionPlanConfig,
  requiredFeature: keyof SubscriptionFeatures,
  value?: any
): boolean => {
  const planFeatures = userPlan.features
  const featureValue = planFeatures[requiredFeature]
  
  // Si la característica no existe en el plan, no tiene acceso
  if (featureValue === undefined) {
    return false
  }
  
  // Para valores numéricos, verificar que no exceda el límite
  if (typeof featureValue === 'number' && typeof value === 'number') {
    return value <= featureValue
  }
  
  // Para 'unlimited', siempre permitir
  if (featureValue === 'unlimited') {
    return true
  }
  
  // Para booleanos, devolver el valor directo
  if (typeof featureValue === 'boolean') {
    return featureValue
  }
  
  // Para arrays, verificar si el valor está incluido
  if (Array.isArray(featureValue) && value) {
    return featureValue.includes(value)
  }
  
  // Para strings, verificar coincidencia exacta o si es mejor/igual
  if (typeof featureValue === 'string' && typeof value === 'string') {
    const levels = ['básica', 'avanzada', 'premium', 'completa', 'dedicada']
    const featureLevel = levels.indexOf(featureValue)
    const requiredLevel = levels.indexOf(value)
    
    if (featureLevel >= 0 && requiredLevel >= 0) {
      return featureLevel >= requiredLevel
    }
    
    return featureValue === value
  }
  
  // Por defecto, si existe la característica, dar acceso
  return !!featureValue
}

/**
 * Obtiene la lista de características de un plan en formato legible
 */
export const getFeaturesList = (features: SubscriptionFeatures): Array<{
  name: string
  value: string
  included: boolean
}> => {
  const featuresList = []
  
  // Lovibox features
  if (features.products_per_box) {
    featuresList.push({
      name: 'Productos por caja',
      value: `${features.products_per_box} productos`,
      included: true
    })
  }
  
  if (features.customization_level) {
    featuresList.push({
      name: 'Nivel de personalización',
      value: features.customization_level.charAt(0).toUpperCase() + features.customization_level.slice(1),
      included: true
    })
  }
  
  if (features.themes) {
    featuresList.push({
      name: 'Temas disponibles',
      value: features.themes.join(', '),
      included: true
    })
  }
  
  if (features.early_access) {
    featuresList.push({
      name: 'Acceso anticipado',
      value: 'Acceso a productos antes del lanzamiento',
      included: features.early_access
    })
  }
  
  if (features.exclusive_products) {
    featuresList.push({
      name: 'Productos exclusivos',
      value: 'Productos únicos solo para suscriptores',
      included: features.exclusive_products
    })
  }
  
  // Empresas features
  if (features.employees) {
    featuresList.push({
      name: 'Empleados',
      value: features.employees === 'unlimited' ? 'Sin límite' : `Hasta ${features.employees}`,
      included: true
    })
  }
  
  if (features.orders_per_month) {
    featuresList.push({
      name: 'Pedidos por mes',
      value: features.orders_per_month === 'unlimited' ? 'Sin límite' : `Hasta ${features.orders_per_month}`,
      included: true
    })
  }
  
  if (features.design_assistance) {
    featuresList.push({
      name: 'Asistencia de diseño',
      value: features.design_assistance.charAt(0).toUpperCase() + features.design_assistance.slice(1),
      included: true
    })
  }
  
  if (features.bulk_discounts) {
    featuresList.push({
      name: 'Descuentos por volumen',
      value: `Hasta ${features.bulk_discounts}%`,
      included: true
    })
  }
  
  if (features.account_manager !== undefined) {
    featuresList.push({
      name: 'Gestor de cuenta dedicado',
      value: 'Atención personalizada',
      included: features.account_manager
    })
  }
  
  if (features.api_access !== undefined) {
    featuresList.push({
      name: 'Acceso a API',
      value: 'Integración con sistemas propios',
      included: features.api_access
    })
  }
  
  // Características generales
  if (features.priority_support !== undefined) {
    featuresList.push({
      name: 'Soporte prioritario',
      value: 'Atención preferente',
      included: features.priority_support
    })
  }
  
  if (features.custom_branding !== undefined) {
    featuresList.push({
      name: 'Marca personalizada',
      value: 'Productos con tu logo',
      included: features.custom_branding
    })
  }
  
  return featuresList
}

/**
 * Compara dos planes y devuelve las diferencias
 */
export const comparePlans = (
  planA: SubscriptionPlanConfig,
  planB: SubscriptionPlanConfig
): Array<{
  feature: string
  planA: string
  planB: string
  better: 'A' | 'B' | 'equal'
}> => {
  const featuresA = getFeaturesList(planA.features)
  const featuresB = getFeaturesList(planB.features)
  
  const comparison = []
  const allFeatures = new Set([
    ...featuresA.map(f => f.name),
    ...featuresB.map(f => f.name)
  ])
  
  for (const featureName of allFeatures) {
    const featureA = featuresA.find(f => f.name === featureName)
    const featureB = featuresB.find(f => f.name === featureName)
    
    comparison.push({
      feature: featureName,
      planA: featureA ? (featureA.included ? featureA.value : 'No incluido') : 'No incluido',
      planB: featureB ? (featureB.included ? featureB.value : 'No incluido') : 'No incluido',
      better: 'equal' // Se puede implementar lógica más compleja aquí
    })
  }
  
  return comparison
}