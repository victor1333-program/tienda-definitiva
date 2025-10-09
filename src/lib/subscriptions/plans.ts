import { SubscriptionTypeConfig, SubscriptionPlanConfig } from './types'

// Tipos de suscripción disponibles
export const subscriptionTypes: SubscriptionTypeConfig[] = [
  {
    id: 'lovibox',
    name: 'Lovibox',
    slug: 'lovibox',
    description: 'Cajas de productos personalizados entregadas mensualmente',
    isActive: true,
    sortOrder: 1
  },
  {
    id: 'empresas',
    name: 'Promocionales Empresas',
    slug: 'empresas',
    description: 'Soluciones de productos promocionales para empresas',
    isActive: true,
    sortOrder: 2
  }
]

// Planes de Lovibox
export const loviboxPlans: SubscriptionPlanConfig[] = [
  {
    id: 'lovibox-esencial',
    subscriptionTypeId: 'lovibox',
    name: 'Lovibox Esencial',
    slug: 'esencial',
    description: 'Perfecto para comenzar tu experiencia Lovibox',
    price: 19.99,
    billingCycle: 'monthly',
    features: {
      products_per_box: 3,
      customization_level: 'básica',
      shipping_frequency: 'monthly',
      themes: ['básicos'],
      priority_support: false
    },
    isActive: true,
    sortOrder: 1,
    highlightColor: 'blue'
  },
  {
    id: 'lovibox-premium',
    subscriptionTypeId: 'lovibox',
    name: 'Lovibox Premium',
    slug: 'premium',
    description: 'La opción más popular con productos exclusivos',
    price: 34.99,
    billingCycle: 'monthly',
    features: {
      products_per_box: 5,
      customization_level: 'avanzada',
      shipping_frequency: 'monthly',
      themes: ['básicos', 'premium'],
      early_access: true,
      priority_support: true
    },
    isActive: true,
    sortOrder: 2,
    isPopular: true,
    highlightColor: 'orange'
  },
  {
    id: 'lovibox-deluxe',
    subscriptionTypeId: 'lovibox',
    name: 'Lovibox Deluxe',
    slug: 'deluxe',
    description: 'La experiencia más completa y exclusiva',
    price: 49.99,
    billingCycle: 'monthly',
    features: {
      products_per_box: 7,
      customization_level: 'premium',
      shipping_frequency: 'monthly',
      themes: ['básicos', 'premium', 'exclusivos'],
      early_access: true,
      exclusive_products: true,
      priority_support: true,
      custom_branding: true
    },
    isActive: true,
    sortOrder: 3,
    highlightColor: 'purple'
  }
]

// Planes para Empresas
export const empresasPlans: SubscriptionPlanConfig[] = [
  {
    id: 'empresas-startup',
    subscriptionTypeId: 'empresas',
    name: 'Startup',
    slug: 'startup',
    description: 'Ideal para startups y pequeñas empresas',
    price: 99.99,
    billingCycle: 'monthly',
    features: {
      employees: 50,
      orders_per_month: 10,
      design_assistance: 'básica',
      bulk_discounts: 5,
      priority_support: false
    },
    limits: {
      max_orders_per_month: 10,
      max_users: 50
    },
    isActive: true,
    sortOrder: 1,
    highlightColor: 'green'
  },
  {
    id: 'empresas-business',
    subscriptionTypeId: 'empresas',
    name: 'Business',
    slug: 'business',
    description: 'Para empresas en crecimiento con mayores necesidades',
    price: 199.99,
    billingCycle: 'monthly',
    features: {
      employees: 200,
      orders_per_month: 25,
      design_assistance: 'completa',
      bulk_discounts: 15,
      account_manager: true,
      priority_support: true
    },
    limits: {
      max_orders_per_month: 25,
      max_users: 200
    },
    isActive: true,
    sortOrder: 2,
    isPopular: true,
    highlightColor: 'blue'
  },
  {
    id: 'empresas-enterprise',
    subscriptionTypeId: 'empresas',
    name: 'Enterprise',
    slug: 'enterprise',
    description: 'Solución completa para grandes corporaciones',
    price: 399.99,
    billingCycle: 'monthly',
    features: {
      employees: 'unlimited',
      orders_per_month: 'unlimited',
      design_assistance: 'dedicada',
      bulk_discounts: 25,
      account_manager: true,
      api_access: true,
      priority_support: true,
      custom_branding: true
    },
    isActive: true,
    sortOrder: 3,
    highlightColor: 'purple'
  }
]

// Función para obtener todos los planes
export const getAllPlans = (): SubscriptionPlanConfig[] => {
  return [...loviboxPlans, ...empresasPlans]
}

// Función para obtener planes por tipo
export const getPlansByType = (typeSlug: string): SubscriptionPlanConfig[] => {
  switch (typeSlug) {
    case 'lovibox':
      return loviboxPlans
    case 'empresas':
      return empresasPlans
    default:
      return []
  }
}

// Función para obtener un tipo específico
export const getSubscriptionType = (slug: string): SubscriptionTypeConfig | undefined => {
  return subscriptionTypes.find(type => type.slug === slug)
}

// Función para obtener un plan específico
export const getPlan = (planId: string): SubscriptionPlanConfig | undefined => {
  return getAllPlans().find(plan => plan.id === planId)
}