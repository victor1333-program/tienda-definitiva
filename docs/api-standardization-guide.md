# Guía de Estandarización de APIs

Esta guía explica cómo migrar endpoints existentes al nuevo sistema de validación estandarizada.

## 🎯 Objetivos

- **Validación consistente** en todos los endpoints
- **Manejo de errores estandarizado**
- **Autenticación y autorización unificada**
- **Respuestas con formato consistente**
- **Rate limiting integrado**
- **Mejor experiencia de desarrollo**

## 🏗️ Arquitectura del Sistema

### Componentes Principales

1. **`api-middleware.ts`**: Sistema de middleware avanzado
2. **`validation.ts`**: Esquemas de validación con Zod
3. **`rate-limiter.ts`**: Sistema de rate limiting
4. **Middleware global**: Aplicado automáticamente

### Flujo de Procesamiento

```
Request → Rate Limiting → CORS → Auth → Validation → Handler → Response
```

## 📝 Migración Paso a Paso

### Antes (Endpoint tradicional)

```typescript
// src/app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const products = await prisma.product.findMany()
    return NextResponse.json({ products })
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // Sin validación...
    const product = await prisma.product.create({ data: body })
    return NextResponse.json({ product })
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 400 })
  }
}
```

### Después (Endpoint estandarizado)

```typescript
// src/app/api/products/route.ts
import { createApiEndpoint, paginationQuery, validateId } from '@/lib/api-middleware'
import { productSchema } from '@/lib/validation'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const { GET, POST } = createApiEndpoint(
  {
    bodySchema: productSchema,
    querySchema: paginationQuery,
    requiredRole: 'ADMIN',
    requireAuth: true
  },
  {
    GET: async ({ query }) => {
      const { page, limit, search } = query!
      
      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where: search ? { name: { contains: search } } : {},
          skip: (page - 1) * limit,
          take: limit
        }),
        prisma.product.count()
      ])
      
      return createPaginatedResponse(products, { page, limit, total })
    },

    POST: async ({ body, user }) => {
      const product = await prisma.product.create({
        data: body!
      })
      
      return {
        success: true,
        data: product,
        message: 'Producto creado exitosamente'
      }
    }
  }
)
```

## 🔧 Configuraciones Disponibles

### EndpointConfig

```typescript
interface EndpointConfig {
  bodySchema?: z.ZodSchema        // Validación del cuerpo
  querySchema?: z.ZodSchema       // Validación de query params
  paramsSchema?: z.ZodSchema      // Validación de parámetros de ruta
  requiredRole?: string           // Rol mínimo requerido
  requireAuth?: boolean           // Requiere autenticación
  rateLimiting?: {               // Rate limiting personalizado
    maxRequests: number
    windowMs: number
  }
  corsConfig?: {                 // Configuración CORS
    origin: string[]
    methods: string[]
    credentials?: boolean
  }
}
```

### Esquemas de Validación Predefinidos

```typescript
// Importar desde @/lib/validation
import {
  productSchema,
  userSchema,
  orderSchema,
  categorySchema,
  paginationSchema,
  validateId
} from '@/lib/validation'
```

### Helpers de Middleware

```typescript
import {
  paginationQuery,        // Query de paginación estándar
  validateId,            // Validación de ID en params
  createPaginatedResponse // Respuesta paginada
} from '@/lib/api-middleware'
```

## 📊 Respuestas Estandarizadas

### Respuesta de Éxito

```typescript
{
  "success": true,
  "data": { ... },
  "message": "Operación exitosa",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Respuesta con Paginación

```typescript
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Respuesta de Error

```typescript
{
  "success": false,
  "error": "Mensaje de error",
  "errors": ["Error 1", "Error 2"], // Para errores de validación
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 🛡️ Autenticación y Autorización

### Jerarquía de Roles

```
CUSTOMER < ADMIN < SUPER_ADMIN
```

### Configuración de Auth

```typescript
{
  requireAuth: true,           // Requiere estar autenticado
  requiredRole: 'ADMIN'       // Rol mínimo requerido
}
```

### Acceso a Datos del Usuario

```typescript
POST: async ({ body, user }) => {
  console.log(user?.id)       // ID del usuario
  console.log(user?.role)     // Rol del usuario
  console.log(user?.email)    // Email del usuario
}
```

## 🚦 Rate Limiting Automático

El rate limiting se aplica automáticamente según la ruta:

- **API General**: 100 requests/15min
- **Auth**: 10 requests/15min  
- **Creación**: 20 requests/hora
- **Upload**: 10 requests/hora
- **Admin**: 200 requests/hora

## 🔄 Migración de Endpoints Complejos

### Endpoint con Parámetros de Ruta

```typescript
// src/app/api/products/[id]/route.ts
export const { GET, PUT, DELETE } = createApiEndpoint(
  {
    paramsSchema: validateId,
    bodySchema: updateProductSchema, // Para PUT
    requiredRole: 'ADMIN'
  },
  {
    GET: async ({ params }) => {
      const product = await prisma.product.findUnique({
        where: { id: params!.id }
      })
      
      if (!product) {
        throw new Error('Producto no encontrado')
      }
      
      return { success: true, data: product }
    }
  }
)
```

### Endpoint con Validación Personalizada

```typescript
const customQuery = z.object({
  category: z.string().optional(),
  minPrice: z.string().transform(val => parseFloat(val)).optional(),
  maxPrice: z.string().transform(val => parseFloat(val)).optional()
})

export const { GET } = createApiEndpoint(
  { querySchema: customQuery },
  {
    GET: async ({ query }) => {
      // Usar query validada y transformada
      const { category, minPrice, maxPrice } = query!
      // ...
    }
  }
)
```

## 🧪 Testing de Endpoints Estandarizados

### Test de Validación

```typescript
// Probar que la validación funciona
const response = await fetch('/api/products', {
  method: 'POST',
  body: JSON.stringify({ name: '' }) // Nombre vacío - debería fallar
})

expect(response.status).toBe(400)
const data = await response.json()
expect(data.success).toBe(false)
expect(data.errors).toContain('name: Nombre requerido')
```

### Test de Autenticación

```typescript
// Sin autenticación - debería fallar
const response = await fetch('/api/admin/products')
expect(response.status).toBe(401)

// Con autenticación - debería funcionar  
const responseAuth = await fetch('/api/admin/products', {
  headers: {
    'x-user-id': 'user123',
    'x-user-role': 'ADMIN'
  }
})
expect(responseAuth.status).toBe(200)
```

## ⚡ Performance y Optimizaciones

### Prisma Connection Pooling

```typescript
// Usar una instancia global de Prisma
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```

### Queries Paralelas

```typescript
// Ejecutar queries en paralelo para mejor performance
const [products, categories, total] = await Promise.all([
  prisma.product.findMany({ ... }),
  prisma.category.findMany({ ... }),
  prisma.product.count({ ... })
])
```

## 🚨 Manejo de Errores

### Errores Automáticos

- **400**: Errores de validación
- **401**: No autenticado
- **403**: Permisos insuficientes  
- **405**: Método no permitido
- **429**: Rate limit excedido
- **500**: Error interno

### Errores Personalizados

```typescript
// Lanzar error que será capturado automáticamente
throw new Error('Producto no encontrado') // Se convierte en 400

// Para otros códigos de estado
return createErrorResponse('No autorizado', 403)
```

## 📋 Checklist de Migración

- [ ] Importar funciones del nuevo sistema
- [ ] Definir esquemas de validación
- [ ] Configurar autenticación requerida
- [ ] Implementar handlers de métodos HTTP
- [ ] Manejar errores apropiadamente
- [ ] Probar validación y autenticación  
- [ ] Actualizar tests existentes
- [ ] Documentar cambios en API

## 🎯 Próximos Pasos

1. **Migrar endpoints críticos primero**
2. **Probar en desarrollo**
3. **Actualizar documentación de API**
4. **Capacitar al equipo de desarrollo**
5. **Monitorear performance en producción**

---

Este sistema proporciona una base sólida y escalable para el desarrollo de APIs consistentes y seguras. ¿Necesitas ayuda con alguna migración específica?