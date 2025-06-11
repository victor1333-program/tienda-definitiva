import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(price)
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.random().toString(36).substring(2, 5).toUpperCase()
  return `LV-${timestamp}-${random}`
}

export function generateSKU(productName: string, variant?: { size?: string, color?: string }): string {
  const base = productName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 6)
    .toUpperCase()
  
  const variantCode = variant 
    ? `${variant.size || 'U'}${variant.color?.substring(0, 2).toUpperCase() || ''}`
    : 'STD'
    
  const random = Math.random().toString(36).substring(2, 4).toUpperCase()
  
  return `${base}-${variantCode}-${random}`
}

export const SHIPPING_COSTS = {
  PICKUP: 0,
  STANDARD: 4.5,
  EXPRESS: 6.5,
} as const

export const COMPANY_INFO = {
  name: process.env.COMPANY_NAME || "Lovilike Personalizados",
  cif: process.env.COMPANY_CIF || "77598953N",
  address: process.env.COMPANY_ADDRESS || "Calle Antonio López del Oro, 7",
  postalCode: process.env.COMPANY_POSTAL_CODE || "02400",
  city: process.env.COMPANY_CITY || "Hellín",
  province: process.env.COMPANY_PROVINCE || "Albacete",
  phone: process.env.COMPANY_PHONE || "611066997",
  email: process.env.COMPANY_EMAIL || "info@lovilike.es",
} as const