import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 DELETE TEST - eliminando productos...')

    const data = await request.json()
    console.log('📋 IDs a eliminar:', data.ids)

    if (!data.ids || !Array.isArray(data.ids) || data.ids.length === 0) {
      return NextResponse.json(
        { error: "Se requiere un array de IDs para eliminar" },
        { status: 400 }
      )
    }

    // Primero verificar que existen los productos
    const existingProducts = await db.product.findMany({
      where: {
        id: { in: data.ids }
      },
      select: { id: true, name: true }
    })

    console.log('📦 Productos encontrados:', existingProducts)

    if (existingProducts.length === 0) {
      return NextResponse.json(
        { error: "No se encontraron productos con esos IDs" },
        { status: 404 }
      )
    }

    // Eliminar productos
    const deleteResult = await db.product.deleteMany({
      where: {
        id: { in: data.ids }
      }
    })

    console.log(`✅ Productos eliminados: ${deleteResult.count}`)

    return NextResponse.json({
      success: true,
      message: `${deleteResult.count} producto(s) eliminado(s) correctamente`,
      deletedProducts: existingProducts,
      data: { deletedCount: deleteResult.count }
    })

  } catch (error) {
    console.error('❌ Error en DELETE TEST:', error)
    return NextResponse.json(
      { error: "Error interno del servidor", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}