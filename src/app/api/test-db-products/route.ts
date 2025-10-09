import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing database products...')

    // Contar productos
    const productsCount = await db.product.count()
    console.log(`📊 Productos en DB: ${productsCount}`)

    // Contar categorías
    const categoriesCount = await db.category.count()
    console.log(`📂 Categorías en DB: ${categoriesCount}`)

    // Contar usuarios
    const usersCount = await db.user.count()
    console.log(`👥 Usuarios en DB: ${usersCount}`)

    // Obtener algunos ejemplos
    const sampleProducts = await db.product.findMany({
      take: 3,
      select: {
        id: true,
        name: true,
        basePrice: true,
        createdAt: true
      }
    })

    const sampleCategories = await db.category.findMany({
      take: 3,
      select: {
        id: true,
        name: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      success: true,
      stats: {
        products: productsCount,
        categories: categoriesCount,
        users: usersCount
      },
      samples: {
        products: sampleProducts,
        categories: sampleCategories
      }
    })

  } catch (error) {
    console.error('❌ Error testing database:', error)
    return NextResponse.json(
      { 
        error: "Error de base de datos", 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}