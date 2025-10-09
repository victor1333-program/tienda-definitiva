import { z } from "zod"
import { createApiEndpoint, paginationQuery } from "@/lib/api-middleware"
import { listingQuery, requireAuth, handleApiRequest } from "@/lib/api-helpers"
import { categorySchema, updateCategorySchema } from "@/lib/validation"
import { db } from "@/lib/db"

// Schema específico para query de categorías
const categoriesQuery = listingQuery.extend({
  includeInactive: z.boolean().default(false),
  slug: z.string().optional()
})

// Endpoint estandarizado usando el nuevo sistema
export const { GET, POST } = createApiEndpoint(
  {
    querySchema: categoriesQuery,
    bodySchema: categorySchema,
    // No requiere autenticación para GET público, pero sí para modificaciones
  },
  {
    GET: async (req) => {
      return await handleApiRequest(async () => {
        const { includeInactive, search, slug, page, limit, skip, orderBy, dateFilter } = req.query

        // Verificar permisos para incluir inactivas
        let canSeeInactive = false
        try {
          const user = await requireAuth()
          canSeeInactive = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
        } catch {
          // Usuario no autenticado, solo puede ver activas
        }

        const where: any = {
          ...dateFilter
        }

        // Solo mostrar categorías activas para usuarios no autorizados
        if (!includeInactive || !canSeeInactive) {
          where.isActive = true
        }

        // Filtros de búsqueda
        if (search) {
          where.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } }
          ]
        }

        if (slug) {
          where.slug = slug
          // Si busca por slug, devolver solo esa categoría
          const category = await db.category.findUnique({
            where: { slug },
            include: {
              _count: {
                select: { 
                  productCategories: true,
                  menuItems: true
                }
              }
            }
          })
          
          return {
            data: category,
            message: category ? 'Categoría encontrada' : 'Categoría no encontrada'
          }
        }

        // Obtener total para paginación
        const total = await db.category.count({ where })

        // Obtener categorías
        const categories = await db.category.findMany({
          where,
          orderBy: [
            { isSystem: "desc" },
            { sortOrder: "asc" }
          ],
          include: {
            _count: {
              select: { 
                productCategories: true,
                menuItems: true
              }
            }
          },
          skip,
          take: limit
        })

        return {
          data: categories,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page < Math.ceil(total / limit),
            hasPrevPage: page > 1
          },
          message: `${categories.length} categorías encontradas`
        }
      })
    },

    POST: async (req) => {
      return await handleApiRequest(async () => {
        // Requiere autenticación para crear
        const user = await requireAuth()
        if (user.role === 'CUSTOMER') {
          throw new Error('No autorizado para crear categorías')
        }

        const categoryData = req.body

        // Verificar que el slug no existe
        const existingCategory = await db.category.findUnique({
          where: { slug: categoryData.slug }
        })

        if (existingCategory) {
          throw new Error('Ya existe una categoría con ese slug')
        }

        const newCategory = await db.category.create({
          data: categoryData,
          include: {
            _count: {
              select: { 
                productCategories: true,
                menuItems: true
              }
            }
          }
        })

        return {
          data: newCategory,
          message: 'Categoría creada exitosamente'
        }
      })
    }
  }
)