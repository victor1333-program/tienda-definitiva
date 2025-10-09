import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    console.log('📦 GET /api/products - iniciando...')
    
    // TEMPORAL: Deshabilitado auth para testing
    // const session = await auth()
    // console.log('👤 Sesión:', !!session)
    
    // if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    //   console.log('❌ Sin autorización')
    //   return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    // }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    
    console.log('🔍 Parámetros:', { page, limit, search })

    // Obtener productos directamente desde la base de datos
    const skip = (page - 1) * limit
    
    const whereClause = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } }
      ]
    } : {}

    const [products, total] = await Promise.all([
      db.product.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          description: true,
          basePrice: true,
          sku: true,
          stock: true,
          isActive: true,
          isPersonalizable: true,
          images: true,
          materialType: true,
          createdAt: true,
          updatedAt: true,
          categories: {
            select: {
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true
                }
              },
              isPrimary: true
            }
          },
          _count: {
            select: {
              variants: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      db.product.count({ where: whereClause })
    ])

    console.log(`✅ Productos encontrados: ${products.length}/${total}`)

    return NextResponse.json({
      success: true,
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })

  } catch (error) {
    console.error('❌ Error en GET /api/products:', error)
    return NextResponse.json(
      { error: "Error interno del servidor", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📦 POST /api/products - creando producto...')
    
    const session = await auth()
    
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const data = await request.json()
    console.log('📋 Datos recibidos:', data)

    // Validación básica
    if (!data.name || !data.basePrice) {
      return NextResponse.json(
        { error: "Nombre y precio base son requeridos" },
        { status: 400 }
      )
    }

    // Generar slug único
    const baseSlug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    let slug = baseSlug
    let counter = 1
    
    // Verificar si ya existe un producto con este slug
    while (await db.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Crear producto en la base de datos
    const product = await db.product.create({
      data: {
        name: data.name,
        slug: slug,
        description: data.description || '',
        basePrice: parseFloat(data.basePrice),
        comparePrice: data.comparePrice ? parseFloat(data.comparePrice) : null,
        costPrice: data.costPrice ? parseFloat(data.costPrice) : null,
        sku: data.sku || '',
        stock: parseInt(data.stock || '0'),
        isActive: data.isActive ?? true,
        isPersonalizable: data.isPersonalizable ?? false,
        images: data.images || '[]',
        videos: data.videos || '[]',
        documents: data.documents || '[]',
        hasQuantityPricing: data.hasQuantityPricing ?? false,
        quantityPrices: data.quantityPrices || '[]',
        featured: data.featured ?? false,
        topSelling: data.topSelling ?? false,
        sortOrder: data.sortOrder ?? 0,
        materialType: data.materialType || null,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
        brand: data.brand || null,
        supplier: data.supplier || null,
        trackInventory: data.trackInventory ?? true
      }
    })

    // Crear relaciones con categorías si se proporcionan
    if (data.categories && Array.isArray(data.categories) && data.categories.length > 0) {
      console.log('📂 Creando relaciones de categorías:', data.categories)
      
      // Verificar que las categorías existen
      const existingCategories = await db.category.findMany({
        where: { id: { in: data.categories } },
        select: { id: true }
      })
      
      const existingCategoryIds = existingCategories.map(cat => cat.id)
      const validCategories = data.categories.filter((id: string) => existingCategoryIds.includes(id))
      
      if (validCategories.length > 0) {
        const categoryRelations = validCategories.map((categoryId: string, index: number) => ({
          productId: product.id,
          categoryId,
          isPrimary: index === 0
        }))

        // Crear las relaciones
        for (const relation of categoryRelations) {
          try {
            await db.productCategory.create({
              data: relation
            })
          } catch (error: any) {
            console.error(`Error creating category relation for product ${product.id} and category ${relation.categoryId}:`, error)
          }
        }
        console.log('✅ Relaciones de categorías creadas')
      }
    }

    // Obtener producto completo con relaciones
    const productWithRelations = await db.product.findUnique({
      where: { id: product.id },
      include: {
        categories: {
          include: {
            category: true
          }
        },
        variants: true
      }
    })

    console.log('✅ Producto creado:', product.id)

    return NextResponse.json({
      success: true,
      data: { product: productWithRelations || product }
    })

  } catch (error) {
    console.error('❌ Error en POST /api/products:', error)
    return NextResponse.json(
      { error: "Error interno del servidor", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  const { PrismaClient } = require('@prisma/client')
  
  let prisma: any = null
  
  try {
    console.log('🗑️ DELETE /api/products - eliminando productos...')
    
    const data = await request.json()
    console.log('📋 IDs a eliminar:', data.ids)

    if (!data.ids || !Array.isArray(data.ids) || data.ids.length === 0) {
      return NextResponse.json(
        { error: "Se requiere un array de IDs para eliminar" },
        { status: 400 }
      )
    }

    // Crear cliente Prisma simple y directo
    prisma = new PrismaClient()
    
    // Eliminar productos directamente
    const deleteResult = await prisma.product.deleteMany({
      where: {
        id: { in: data.ids }
      }
    })

    console.log(`✅ Productos eliminados: ${deleteResult.count}`)

    return NextResponse.json({
      success: true,
      message: `${deleteResult.count} producto(s) eliminado(s) correctamente`,
      data: { deletedCount: deleteResult.count }
    })

  } catch (error) {
    console.error('❌ Error en DELETE /api/products:', error)
    return NextResponse.json(
      { error: "Error interno del servidor", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  } finally {
    if (prisma) {
      await prisma.$disconnect()
    }
  }
}