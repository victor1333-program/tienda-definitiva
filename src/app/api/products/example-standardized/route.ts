import { createApiEndpoint, paginationQuery, validateId, createPaginatedResponse } from '@/lib/api-middleware'
import { productSchema, updateProductSchema } from '@/lib/validation'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

/**
 * Ejemplo de endpoint estandarizado para productos
 * Este es un ejemplo de cómo implementar el nuevo sistema de validación
 */

// Esquema para crear producto
const createProductBody = productSchema

// Esquema para actualizar producto  
const updateProductBody = updateProductSchema

// Esquema para parámetros de ruta
const productParams = validateId

// Esquema para query de lista de productos
const productListQuery = paginationQuery.extend({
  category: z.string().optional(),
  isActive: z.string().transform(val => val === 'true').optional(),
  featured: z.string().transform(val => val === 'true').optional(),
  minPrice: z.string().transform(val => parseFloat(val)).optional(),
  maxPrice: z.string().transform(val => parseFloat(val)).optional()
})

// Implementación del endpoint estandarizado
export const { GET, POST, PUT, DELETE } = createApiEndpoint(
  {
    bodySchema: createProductBody,
    querySchema: productListQuery,
    paramsSchema: productParams,
    requiredRole: 'ADMIN', // Solo admins pueden gestionar productos
    requireAuth: true
  },
  {
    // GET /api/products/example-standardized - Listar productos con paginación
    GET: async ({ query, user }) => {
      try {
        const { page, limit, search, sortBy, sortOrder, category, isActive, featured, minPrice, maxPrice } = query!

        // Construir filtros
        const where: any = {}
        
        if (search) {
          where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { sku: { contains: search, mode: 'insensitive' } }
          ]
        }

        if (category) where.categories = { some: { category: { slug: category } } }
        if (isActive !== undefined) where.isActive = isActive
        if (featured !== undefined) where.featured = featured
        if (minPrice !== undefined || maxPrice !== undefined) {
          where.basePrice = {}
          if (minPrice !== undefined) where.basePrice.gte = minPrice
          if (maxPrice !== undefined) where.basePrice.lte = maxPrice
        }

        // Construir ordenación
        const orderBy: any = {}
        if (sortBy) {
          orderBy[sortBy] = sortOrder
        } else {
          orderBy.createdAt = sortOrder
        }

        // Ejecutar queries en paralelo
        const [products, total] = await Promise.all([
          prisma.product.findMany({
            where,
            orderBy,
            skip: (page - 1) * limit,
            take: limit,
            include: {
              categories: {
                include: {
                  category: {
                    select: { id: true, name: true, slug: true }
                  }
                }
              },
              variants: {
                select: { id: true, sku: true, stock: true, price: true }
              },
              _count: {
                select: { variants: true, orderItems: true }
              }
            }
          }),
          prisma.product.count({ where })
        ])

        return createPaginatedResponse(
          products,
          { page, limit, total },
          `${total} productos encontrados`
        )

      } catch (error) {
        console.error('Error obteniendo productos:', error)
        throw new Error('Error al obtener productos')
      }
    },

    // POST /api/products/example-standardized - Crear producto
    POST: async ({ body, user }) => {
      try {
        const productData = body!

        // Verificar que el slug no exista
        const existingProduct = await prisma.product.findUnique({
          where: { slug: productData.slug }
        })

        if (existingProduct) {
          throw new Error('Ya existe un producto con este slug')
        }

        // Crear el producto con relaciones
        const product = await prisma.product.create({
          data: {
            ...productData,
            categories: {
              create: {
                categoryId: productData.categoryId,
                isPrimary: true
              }
            }
          },
          include: {
            categories: {
              include: {
                category: {
                  select: { id: true, name: true, slug: true }
                }
              }
            }
          }
        })

        return {
          success: true,
          data: product,
          message: 'Producto creado exitosamente'
        }

      } catch (error) {
        console.error('Error creando producto:', error)
        throw new Error(error instanceof Error ? error.message : 'Error al crear producto')
      }
    },

    // PUT /api/products/example-standardized/[id] - Actualizar producto
    PUT: async ({ body, params, user }) => {
      try {
        const { id } = params!
        const updateData = body!

        // Verificar que el producto exista
        const existingProduct = await prisma.product.findUnique({
          where: { id }
        })

        if (!existingProduct) {
          throw new Error('Producto no encontrado')
        }

        // Verificar slug único si se está actualizando
        if (updateData.slug && updateData.slug !== existingProduct.slug) {
          const slugExists = await prisma.product.findUnique({
            where: { slug: updateData.slug }
          })
          
          if (slugExists) {
            throw new Error('Ya existe un producto con este slug')
          }
        }

        // Actualizar el producto
        const updatedProduct = await prisma.product.update({
          where: { id },
          data: updateData,
          include: {
            categories: {
              include: {
                category: {
                  select: { id: true, name: true, slug: true }
                }
              }
            },
            variants: true
          }
        })

        return {
          success: true,
          data: updatedProduct,
          message: 'Producto actualizado exitosamente'
        }

      } catch (error) {
        console.error('Error actualizando producto:', error)
        throw new Error(error instanceof Error ? error.message : 'Error al actualizar producto')
      }
    },

    // DELETE /api/products/example-standardized/[id] - Eliminar producto
    DELETE: async ({ params, user }) => {
      try {
        const { id } = params!

        // Verificar que el producto exista
        const existingProduct = await prisma.product.findUnique({
          where: { id },
          include: {
            orderItems: true,
            variants: true
          }
        })

        if (!existingProduct) {
          throw new Error('Producto no encontrado')
        }

        // Verificar que no tenga pedidos asociados
        if (existingProduct.orderItems.length > 0) {
          throw new Error('No se puede eliminar un producto con pedidos asociados')
        }

        // Eliminar el producto (esto eliminará las relaciones en cascada)
        await prisma.product.delete({
          where: { id }
        })

        return {
          success: true,
          message: 'Producto eliminado exitosamente'
        }

      } catch (error) {
        console.error('Error eliminando producto:', error)
        throw new Error(error instanceof Error ? error.message : 'Error al eliminar producto')
      }
    }
  }
)

// Función de limpieza para cerrar Prisma
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})