import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// Endpoint temporal sin autenticación para debugging
export async function GET(request: NextRequest) {
  try {
    console.log('📦 GET /api/products-no-auth - iniciando...')
    
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
        include: {
          categories: {
            include: {
              category: true
            }
          },
          variants: true,
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
    console.error('❌ Error en GET /api/products-no-auth:', error)
    return NextResponse.json(
      { error: "Error interno del servidor", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}