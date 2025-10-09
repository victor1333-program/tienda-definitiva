import { NextRequest, NextResponse } from "next/server"
import { db } from '@/lib/db';
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parámetros de paginación con valores por defecto
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "12")
    
    // Validar parámetros de paginación
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: "Parámetros de paginación inválidos. Page debe ser >= 1 y limit entre 1-100." },
        { status: 400 }
      )
    }
    
    // Parámetros opcionales de filtrado
    const category = searchParams.get("category")
    const featured = searchParams.get("featured") === "true"
    const topSelling = searchParams.get("topSelling") === "true"
    const search = searchParams.get("search") || ""
    const customizable = searchParams.get("customizable") === "true"
    
    // Parámetros de ordenamiento
    const sortByParam = searchParams.get("sortBy") || "name"
    
    // Mapear opciones de ordenamiento del frontend a campos de la base de datos
    let sortBy = "createdAt"
    let sortOrder: "asc" | "desc" = "desc"
    
    switch (sortByParam) {
      case "name":
        sortBy = "name"
        sortOrder = "asc"
        break
      case "price-asc":
        sortBy = "basePrice"
        sortOrder = "asc"
        break
      case "price-desc":
        sortBy = "basePrice"
        sortOrder = "desc"
        break
      case "newest":
        sortBy = "createdAt"
        sortOrder = "desc"
        break
      case "popular":
        sortBy = "topSelling"
        sortOrder = "desc"
        break
      default:
        sortBy = "createdAt"
        sortOrder = "desc"
    }

    // Construir filtros where
    const whereConditions: any = {
      isActive: true
    }
    
    if (search) {
      whereConditions.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (featured) {
      whereConditions.featured = true
    }
    
    if (topSelling) {
      whereConditions.topSelling = true
    }
    
    if (customizable) {
      whereConditions.OR = whereConditions.OR ? [
        ...whereConditions.OR,
        { isPersonalizable: true },
        {
          sides: {
            some: {
              isActive: true,
              printAreas: {
                some: {
                  isActive: true
                }
              }
            }
          }
        }
      ] : [
        { isPersonalizable: true },
        {
          sides: {
            some: {
              isActive: true,
              printAreas: {
                some: {
                  isActive: true
                }
              }
            }
          }
        }
      ]
    }
    
    if (category && category !== 'all') {
      whereConditions.categories = {
        some: {
          category: {
            slug: category,
            isActive: true
          }
        }
      }
    }

    // Calcular offset para paginación
    const skip = (page - 1) * limit

    // Obtener productos con conteo total
    const [products, totalCount] = await Promise.all([
      db.product.findMany({
        where: whereConditions,
        include: {
          categories: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true
                }
              }
            },
            where: {
              isPrimary: true
            }
          },
          variants: {
            where: {
              isActive: true
            },
            select: {
              id: true,
              sku: true,
              size: true,
              colorName: true,
              colorHex: true,
              material: true,
              stock: true,
              price: true
            }
          },
          sides: {
            where: {
              isActive: true
            },
            select: {
              id: true,
              name: true,
              displayName: true,
              printAreas: {
                where: {
                  isActive: true
                },
                select: {
                  id: true,
                  name: true,
                  displayName: true
                }
              }
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder
        },
        skip,
        take: limit
      }),
      db.product.count({
        where: whereConditions
      })
    ])

    // Formatear productos para la respuesta pública
    const formattedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      basePrice: product.basePrice,
      comparePrice: product.comparePrice,
      images: JSON.parse(product.images || '[]'),
      featured: product.featured,
      topSelling: product.topSelling,
      isCustomizable: product.isPersonalizable,
      customizationPrice: 0, // Default value since it's not in schema
      materialType: product.materialType,
      tags: [], // Default empty array since not in schema
      category: product.categories.length > 0 ? {
        id: product.categories[0].category.id,
        name: product.categories[0].category.name,
        slug: product.categories[0].category.slug
      } : null,
      variants: product.variants.map(variant => ({
        id: variant.id,
        name: `${variant.size || ''} ${variant.colorName || ''}`.trim() || 'Default',
        price: variant.price || product.basePrice,
        color: variant.colorName,
        size: variant.size,
        material: variant.material,
        stock: variant.stock
      })),
      sides: product.sides.length > 0 ? product.sides.map(side => ({
        id: side.id,
        name: side.displayName || side.name,
        printAreas: side.printAreas
      })) : [],
      // Información de pricing
      hasDiscount: product.comparePrice && product.comparePrice > product.basePrice,
      discountPercentage: product.comparePrice && product.comparePrice > product.basePrice 
        ? Math.round(((product.comparePrice - product.basePrice) / product.comparePrice) * 100)
        : null
    }))

    // Calcular información de paginación
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    const response = {
      products: formattedProducts,
      pagination: {
        page,
        limit,
        totalItems: totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null
      },
      filters: {
        category: category || null,
        featured,
        topSelling,
        search,
        customizable,
        sortBy: sortByParam,
        sortOrder
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error al obtener productos públicos:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}