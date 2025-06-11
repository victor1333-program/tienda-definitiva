import { z } from 'zod'

// ================================
// VALIDACIONES DE USUARIO
// ================================

export const userSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100, 'El nombre es demasiado largo'),
  email: z.string().email('Email inválido').max(255, 'Email demasiado largo'),
  phone: z.string().optional().nullable(),
  role: z.enum(['CUSTOMER', 'ADMIN', 'SUPER_ADMIN']).default('CUSTOMER'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional()
})

export const updateUserSchema = userSchema.partial()

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida')
})

// ================================
// VALIDACIONES DE PRODUCTO
// ================================

export const productSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(255, 'Nombre demasiado largo'),
  slug: z.string().min(1, 'Slug requerido').max(255, 'Slug demasiado largo')
    .regex(/^[a-z0-9-]+$/, 'Slug debe contener solo letras minúsculas, números y guiones'),
  description: z.string().optional().nullable(),
  basePrice: z.number().min(0, 'El precio debe ser mayor o igual a 0').max(99999.99, 'Precio demasiado alto'),
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

// ================================
// VALIDACIONES DE VARIANTE DE PRODUCTO
// ================================

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

// ================================
// VALIDACIONES DE CATEGORÍA
// ================================

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

// ================================
// VALIDACIONES DE DIRECCIÓN
// ================================

export const addressSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(255, 'Nombre demasiado largo'),
  street: z.string().min(1, 'Dirección requerida').max(500, 'Dirección demasiado larga'),
  city: z.string().min(1, 'Ciudad requerida').max(100, 'Ciudad demasiado larga'),
  state: z.string().min(1, 'Provincia requerida').max(100, 'Provincia demasiado larga'),
  postalCode: z.string().min(5, 'Código postal inválido').max(10, 'Código postal inválido')
    .regex(/^\d{5}(-\d{4})?$/, 'Formato de código postal inválido'),
  country: z.string().length(2, 'Código de país debe tener 2 caracteres').default('ES'),
  isDefault: z.boolean().default(false),
  userId: z.string().min(1, 'ID de usuario requerido').optional()
})

export const updateAddressSchema = addressSchema.partial()

// ================================
// VALIDACIONES DE DISEÑO
// ================================

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

// ================================
// VALIDACIONES DE PEDIDO
// ================================

export const orderItemSchema = z.object({
  productId: z.string().min(1, 'ID de producto requerido'),
  variantId: z.string().optional().nullable(),
  designId: z.string().optional().nullable(),
  quantity: z.number().int().min(1, 'Cantidad debe ser mayor a 0'),
  unitPrice: z.number().min(0, 'Precio unitario debe ser mayor o igual a 0'),
  customizationData: z.any().optional().nullable()
})

export const orderSchema = z.object({
  customerEmail: z.string().email('Email inválido'),
  customerName: z.string().min(1, 'Nombre del cliente requerido').max(255, 'Nombre demasiado largo'),
  customerPhone: z.string().max(20, 'Teléfono demasiado largo').optional().nullable(),
  shippingMethod: z.string().min(1, 'Método de envío requerido'),
  shippingAddress: z.any(), // JSON object
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

// ================================
// VALIDACIONES DE INVENTARIO
// ================================

export const inventoryMovementSchema = z.object({
  variantId: z.string().min(1, 'ID de variante requerido'),
  type: z.enum(['IN', 'OUT', 'ADJUSTMENT', 'RETURN']),
  quantity: z.number().int().min(1, 'Cantidad debe ser mayor a 0'),
  reason: z.string().max(500, 'Razón demasiado larga').optional().nullable()
})

// ================================
// VALIDACIONES DE CONFIGURACIÓN
// ================================

export const settingSchema = z.object({
  key: z.string().min(1, 'Clave requerida').max(100, 'Clave demasiado larga'),
  value: z.any() // JSON value
})

// ================================
// VALIDACIONES DE MÉTODO DE ENVÍO
// ================================

export const shippingMethodSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(255, 'Nombre demasiado largo'),
  description: z.string().max(1000, 'Descripción demasiado larga').optional().nullable(),
  price: z.number().min(0, 'Precio debe ser mayor o igual a 0'),
  isActive: z.boolean().default(true),
  estimatedDays: z.string().max(50, 'Estimación demasiado larga').optional().nullable()
})

export const updateShippingMethodSchema = shippingMethodSchema.partial()

// ================================
// VALIDACIONES DE DESCUENTO
// ================================

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

// ================================
// VALIDACIONES DE QUERY PARAMETERS
// ================================

export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10) // Máximo 100 por página
})

export const searchSchema = z.object({
  search: z.string().max(255, 'Búsqueda demasiado larga').optional(),
  sortBy: z.string().max(50, 'Campo de ordenación inválido').optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc').optional()
})

// ================================
// VALIDACIONES DE UPLOAD
// ================================

export const uploadConfigSchema = z.object({
  folder: z.string().max(100, 'Nombre de carpeta demasiado largo').optional(),
  maxFiles: z.number().int().min(1).max(10).default(1),
  maxSizePerFile: z.number().int().min(1).max(10 * 1024 * 1024).default(5 * 1024 * 1024) // 5MB por defecto
})

// ================================
// UTILIDADES DE VALIDACIÓN
// ================================

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