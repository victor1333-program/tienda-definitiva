export interface SubscriptionFeatures {
  // Lovibox específico
  products_per_box?: number
  customization_level?: 'básica' | 'avanzada' | 'premium'
  shipping_frequency?: 'monthly' | 'quarterly' | 'yearly'
  themes?: string[]
  early_access?: boolean
  exclusive_products?: boolean
  
  // Empresas específico  
  employees?: number | 'unlimited'
  orders_per_month?: number | 'unlimited'
  design_assistance?: 'básica' | 'completa' | 'dedicada'
  bulk_discounts?: number
  account_manager?: boolean
  api_access?: boolean
  
  // Generales
  priority_support?: boolean
  custom_branding?: boolean
}

export interface SubscriptionLimits {
  max_orders_per_month?: number
  max_users?: number
  max_storage_gb?: number
  max_api_calls?: number
}

export interface SubscriptionTypeConfig {
  id: string
  name: string
  slug: string
  description: string
  isActive: boolean
  sortOrder: number
}

export interface SubscriptionPlanConfig {
  id: string
  subscriptionTypeId: string
  name: string
  slug: string
  description: string
  price: number
  billingCycle: 'monthly' | 'quarterly' | 'yearly'
  features: SubscriptionFeatures
  limits?: SubscriptionLimits
  isActive: boolean
  sortOrder: number
  isPopular?: boolean
  highlightColor?: string
}

export type SubscriptionStatus = 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'EXPIRED' | 'PENDING'

export interface UserSubscription {
  id: string
  userId: string
  subscriptionPlanId: string
  status: SubscriptionStatus
  startsAt: Date
  endsAt?: Date
  nextBillingDate?: Date
  autoRenew: boolean
  metadata?: any
  createdAt: Date
  updatedAt: Date
  subscriptionPlan: {
    id: string
    name: string
    price: number
    billingCycle: string
    features: SubscriptionFeatures
    subscriptionType: {
      name: string
      slug: string
    }
  }
}