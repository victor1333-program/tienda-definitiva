import { z } from 'zod'
import * as DOMPurify from 'isomorphic-dompurify'

// ================================
// ESQUEMAS DE VALIDACIÓN BASE
// ================================

export const emailSchema = z
  .string()
  .email('Email inválido')
  .min(5, 'Email muy corto')
  .max(255, 'Email muy largo')
  .transform(email => email.toLowerCase().trim())

export const phoneSchema = z
  .string()
  .regex(/^[+]?[0-9\s\-()]{9,20}$/, 'Teléfono inválido')
  .transform(phone => phone.replace(/\s/g, ''))

export const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .max(128, 'La contraseña es demasiado larga')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'La contraseña debe tener al menos una mayúscula, una minúscula y un número')

export const nameSchema = z
  .string()
  .min(2, 'Nombre muy corto')
  .max(100, 'Nombre muy largo')
  .regex(/^[a-zA-ZÀ-ÿ\s\-'\.]+$/, 'Nombre contiene caracteres inválidos')
  .transform(name => name.trim())

export const addressStringSchema = z
  .string()
  .min(5, 'Dirección muy corta')
  .max(255, 'Dirección muy larga')
  .transform(addr => addr.trim())

export const postalCodeSchema = z
  .string()
  .regex(/^[0-9]{5}$/, 'Código postal debe tener 5 dígitos')

export const priceSchema = z
  .number()
  .positive('El precio debe ser positivo')
  .max(999999.99, 'Precio demasiado alto')
  .refine(val => Number.isFinite(val), 'Precio inválido')

export const quantitySchema = z
  .number()
  .int('La cantidad debe ser un número entero')
  .positive('La cantidad debe ser positiva')
  .max(1000, 'Cantidad máxima: 1000')

// ================================
// ESQUEMAS PARA ENTIDADES
// ================================

export const userSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema.optional().nullable(),
  role: z.enum(['CUSTOMER', 'ADMIN', 'SUPER_ADMIN']).default('CUSTOMER'),
  password: passwordSchema.optional()
})

export const updateUserSchema = userSchema.partial()

export const userRegistrationSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema.optional(),
  password: passwordSchema,
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword']
})

export const userLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Contraseña requerida')
})

export const loginSchema = userLoginSchema // Alias para compatibilidad

export const customerInfoSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  dni: z.string().regex(/^[0-9]{8}[A-Z]$/, 'DNI inválido').optional(),
  isCompany: z.boolean().default(false),
  companyName: z.string().max(255).optional(),
  companyVat: z.string().regex(/^[A-Z][0-9]{8}$/, 'CIF inválido').optional()
}).refine(data => {
  if (data.isCompany) {
    return data.companyName && data.companyVat
  }
  return true
}, {
  message: 'Datos de empresa requeridos',
  path: ['companyName']
})

export const addressInfoSchema = z.object({
  address: addressStringSchema,
  city: nameSchema,
  postalCode: postalCodeSchema,
  province: nameSchema,
  country: z.string().default('España'),
  notes: z.string().max(500).optional()
})

// Schema completo de dirección (migrado de validations.ts)
export const fullAddressSchema = z.object({
  name: nameSchema,
  street: addressStringSchema,
  city: nameSchema,
  state: nameSchema,
  postalCode: postalCodeSchema,
  country: z.string().length(2, 'Código de país debe tener 2 caracteres').default('ES'),
  isDefault: z.boolean().default(false),
  userId: z.string().min(1, 'ID de usuario requerido').optional()
})

export const updateAddressSchema = fullAddressSchema.partial()

// Alias para compatibilidad
export const addressSchema = fullAddressSchema

export const productSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(255, 'Nombre demasiado largo'),
  slug: z.string().min(1, 'Slug requerido').max(255, 'Slug demasiado largo')
    .regex(/^[a-z0-9-]+$/, 'Slug debe contener solo letras minúsculas, números y guiones'),
  description: z.string().max(2000, 'Descripción demasiado larga').optional().nullable(),
  basePrice: priceSchema,
  comparePrice: priceSchema.optional(),
  costPrice: priceSchema.optional(),
  images: z.string().min(1, 'Al menos una imagen es requerida'),
  isActive: z.boolean().default(true),
  featured: z.boolean().default(false),
  sortOrder: z.number().int().min(0).default(0),
  personalizationType: z.enum(['DTF', 'SUBLIMATION', 'LASER_CUT', 'EMBROIDERY', 'VINYL']),
  materialType: z.string().min(1, 'Tipo de material requerido').max(100, 'Tipo de material demasiado largo'),
  canCustomize: z.boolean().default(true),
  customizationPrice: z.number().min(0, 'El precio de personalización debe ser mayor o igual a 0').default(0),
  metaTitle: z.string().max(255, 'Meta título demasiado largo').optional().nullable(),
  metaDescription: z.string().max(500, 'Meta descripción demasiado larga').optional().nullable(),
  categoryId: z.string().min(1, 'Categoría requerida')
})

export const updateProductSchema = productSchema.partial()

export const orderItemSchema = z.object({
  productId: z.string().min(1, 'ID de producto requerido'),
  variantId: z.string().nullable().optional(),
  designId: z.string().nullable().optional(),
  quantity: quantitySchema,
  unitPrice: priceSchema,
  customizationData: z.any().nullable().optional()
})

export const orderSchema = z.object({
  customerEmail: emailSchema,
  customerName: nameSchema,
  customerPhone: phoneSchema,
  shippingMethod: z.string().min(1, 'Método de envío requerido'),
  shippingAddress: z.any(), // JSON object para mayor flexibilidad
  paymentMethod: z.string().min(1, 'Método de pago requerido'),
  customerNotes: z.string().max(1000, 'Notas demasiado largas').optional().nullable(),
  items: z.array(orderItemSchema).min(1, 'Al menos un producto es requerido'),
  userId: z.string().optional().nullable(),
  addressId: z.string().optional().nullable()
})

export const updateOrderSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'IN_PRODUCTION', 'READY_FOR_PICKUP', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']).optional(),
  paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED']).optional(),
  trackingNumber: z.string().max(100, 'Número de seguimiento demasiado largo').optional().nullable(),
  adminNotes: z.string().max(1000, 'Notas de admin demasiado largas').optional().nullable()
})

export const contactFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema.optional(),
  subject: z.string().min(5).max(255),
  message: z.string().min(10).max(2000),
  orderType: z.string().max(100).optional()
})

// ================================
// FUNCIONES DE SANITIZACIÓN
// ================================

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'br', 'p'],
    ALLOWED_ATTR: []
  })
}

export function sanitizeString(str: string): string {
  return str
    .trim()
    .replace(/\s+/g, ' ') // Normalizar espacios
    .replace(/[<>\"'&]/g, '') // Remover caracteres peligrosos
    .slice(0, 1000) // Limitar longitud
}

export function sanitizeObject(obj: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {}
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value)
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>)
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeString(item) : item
      )
    } else {
      sanitized[key] = value
    }
  }
  
  return sanitized
}

// ================================
// VALIDADORES ESPECÍFICOS
// ================================

export function validateFileUpload(file: File): { valid: boolean; error?: string } {
  const maxSize = 5 * 1024 * 1024 // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  
  if (file.size > maxSize) {
    return { valid: false, error: 'Archivo demasiado grande (máximo 5MB)' }
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Tipo de archivo no permitido' }
  }
  
  return { valid: true }
}

export function validateCreditCard(cardNumber: string): { valid: boolean; type?: string } {
  // Remover espacios y guiones
  const cleaned = cardNumber.replace(/[\s-]/g, '')
  
  // Verificar que solo contenga números
  if (!/^\d+$/.test(cleaned)) {
    return { valid: false }
  }
  
  // Algoritmo de Luhn
  let sum = 0
  let alternate = false
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let n = parseInt(cleaned.charAt(i), 10)
    
    if (alternate) {
      n *= 2
      if (n > 9) {
        n = (n % 10) + 1
      }
    }
    
    sum += n
    alternate = !alternate
  }
  
  const valid = sum % 10 === 0
  
  // Detectar tipo de tarjeta
  let type = 'unknown'
  if (cleaned.startsWith('4')) type = 'visa'
  else if (cleaned.startsWith('5') || cleaned.startsWith('2')) type = 'mastercard'
  else if (cleaned.startsWith('3')) type = 'amex'
  
  return { valid, type }
}

export function validateSpanishDNI(dni: string): boolean {
  const letters = 'TRWAGMYFPDXBNJZSQVHLCKE'
  const regex = /^[0-9]{8}[A-Z]$/
  
  if (!regex.test(dni)) return false
  
  const numbers = dni.slice(0, 8)
  const letter = dni.charAt(8)
  const expectedLetter = letters[parseInt(numbers, 10) % 23]
  
  return letter === expectedLetter
}

export function validateSpanishCIF(cif: string): boolean {
  const regex = /^[ABCDEFGHJNPQRSUVW][0-9]{7}[0-9A-J]$/
  return regex.test(cif)
}

// ================================
// ESQUEMAS ADICIONALES CONSOLIDADOS
// ================================

// Esquema de variantes de producto
export const productVariantSchema = z.object({
  sku: z.string().min(1, 'SKU requerido').max(100, 'SKU demasiado largo')
    .regex(/^[A-Z0-9-_]+$/, 'SKU debe contener solo letras mayúsculas, números, guiones y guiones bajos'),
  size: z.string().max(50, 'Talla demasiado larga').optional().nullable(),
  color: z.string().max(50, 'Color demasiado largo').optional().nullable(),
  material: z.string().max(100, 'Material demasiado largo').optional().nullable(),
  stock: z.number().int().min(0, 'Stock no puede ser negativo').default(0),
  price: z.number().min(0, 'El precio debe ser mayor o igual a 0').max(99999.99, 'Precio demasiado alto').optional().nullable(),
  isActive: z.boolean().default(true),
  productId: z.string().min(1, 'ID de producto requerido')
})

export const updateProductVariantSchema = productVariantSchema.partial()

// Esquemas de categoría
export const categorySchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(255, 'Nombre demasiado largo'),
  slug: z.string().min(1, 'Slug requerido').max(255, 'Slug demasiado largo')
    .regex(/^[a-z0-9-]+$/, 'Slug debe contener solo letras minúsculas, números y guiones'),
  description: z.string().max(1000, 'Descripción demasiado larga').optional().nullable(),
  image: z.string().url('URL de imagen inválida').optional().nullable(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0)
})

export const updateCategorySchema = categorySchema.partial()

// Esquemas de diseño
export const designSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(255, 'Nombre demasiado largo'),
  description: z.string().max(1000, 'Descripción demasiado larga').optional().nullable(),
  imageUrl: z.string().url('URL de imagen inválida'),
  designData: z.any(), // JSON object
  isPublic: z.boolean().default(false),
  isTemplate: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  category: z.string().max(100, 'Categoría demasiado larga').optional().nullable(),
  productId: z.string().optional().nullable()
})

export const updateDesignSchema = designSchema.partial()

// Esquemas de inventario
export const inventoryMovementSchema = z.object({
  variantId: z.string().min(1, 'ID de variante requerido'),
  type: z.enum(['IN', 'OUT', 'ADJUSTMENT', 'RETURN']),
  quantity: z.number().int().min(1, 'Cantidad debe ser mayor a 0'),
  reason: z.string().max(500, 'Razón demasiado larga').optional().nullable()
})

// Esquemas de configuración
export const settingSchema = z.object({
  key: z.string().min(1, 'Clave requerida').max(100, 'Clave demasiado larga'),
  value: z.any() // JSON value
})

// Esquemas de método de envío
export const shippingMethodSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(255, 'Nombre demasiado largo'),
  description: z.string().max(1000, 'Descripción demasiado larga').optional().nullable(),
  price: z.number().min(0, 'Precio debe ser mayor o igual a 0'),
  isActive: z.boolean().default(true),
  estimatedDays: z.string().max(50, 'Estimación demasiado larga').optional().nullable()
})

export const updateShippingMethodSchema = shippingMethodSchema.partial()

// Esquemas de descuento
export const discountSchema = z.object({
  code: z.string().min(1, 'Código requerido').max(50, 'Código demasiado largo')
    .regex(/^[A-Z0-9-_]+$/, 'Código debe contener solo letras mayúsculas, números, guiones y guiones bajos'),
  name: z.string().min(1, 'Nombre requerido').max(255, 'Nombre demasiado largo'),
  type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING', 'BUY_X_GET_Y', 'PROGRESSIVE']),
  value: z.number().min(0, 'Valor debe ser mayor o igual a 0'),
  minOrderAmount: z.number().min(0, 'Monto mínimo debe ser mayor o igual a 0').optional().nullable(),
  maxOrderAmount: z.number().min(0, 'Monto máximo debe ser mayor o igual a 0').optional().nullable(),
  maxUses: z.number().int().min(1, 'Usos máximos debe ser mayor a 0').optional().nullable(),
  usesPerCustomer: z.number().int().min(1, 'Usos por cliente debe ser mayor a 0').optional().nullable(),
  isActive: z.boolean().default(true),
  validFrom: z.string().datetime('Fecha de inicio inválida'),
  validUntil: z.string().datetime('Fecha de fin inválida').optional().nullable(),
  targetType: z.enum(['ALL', 'PRODUCTS', 'CATEGORIES', 'USERS']).default('ALL'),
  targetIds: z.array(z.string()).default([]),
  excludeIds: z.array(z.string()).default([]),
  stackable: z.boolean().default(false),
  firstTimeOnly: z.boolean().default(false),
  autoApply: z.boolean().default(false),
  description: z.string().max(1000, 'Descripción demasiado larga').default(''),
  internalNotes: z.string().max(1000, 'Notas internas demasiado largas').default(''),
  geographicRestrictions: z.array(z.string()).default([]),
  deviceRestrictions: z.array(z.string()).default([]),
  timeRestrictions: z.object({
    days: z.array(z.string()),
    hours: z.object({
      start: z.string(),
      end: z.string()
    })
  }).optional().nullable()
})

export const updateDiscountSchema = discountSchema.partial()

// Esquemas de paginación y búsqueda
export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10) // Máximo 100 por página
})

export const searchSchema = z.object({
  search: z.string().max(255, 'Búsqueda demasiado larga').optional(),
  sortBy: z.string().max(50, 'Campo de ordenación inválido').optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc').optional()
})

// Esquemas de upload
export const uploadConfigSchema = z.object({
  folder: z.string().max(100, 'Nombre de carpeta demasiado largo').optional(),
  maxFiles: z.number().int().min(1).max(10).default(1),
  maxSizePerFile: z.number().int().min(1).max(10 * 1024 * 1024).default(5 * 1024 * 1024) // 5MB por defecto
})

// ================================
// MIDDLEWARE DE VALIDACIÓN
// ================================

export function validateBody<T>(schema: z.ZodSchema<T>) {
  return (body: unknown): { success: true; data: T } | { success: false; errors: string[] } => {
    try {
      const sanitized = typeof body === 'object' && body !== null 
        ? sanitizeObject(body as Record<string, unknown>)
        : body
      
      const data = schema.parse(sanitized)
      return { success: true, data }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
        return { success: false, errors }
      }
      return { success: false, errors: ['Error de validación desconocido'] }
    }
  }
}

export function validateQuery<T>(schema: z.ZodSchema<T>) {
  return (query: Record<string, string | string[]>): { success: true; data: T } | { success: false; errors: string[] } => {
    try {
      const data = schema.parse(query)
      return { success: true, data }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
        return { success: false, errors }
      }
      return { success: false, errors: ['Error de validación de query'] }
    }
  }
}

// Función de validación genérica (migrada de validations.ts)
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const result = schema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      return { success: false, errors }
    }
    return { success: false, errors: ['Error de validación desconocido'] }
  }
}

// Función para crear errores de validación (migrada de validations.ts)
export function createValidationError(errors: string[]) {
  return new Response(
    JSON.stringify({ 
      error: 'Datos inválidos', 
      details: errors 
    }),
    { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    }
  )
}