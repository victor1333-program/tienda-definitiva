import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { 
  getProducts, 
  createProduct, 
  updateProductsStatus, 
  deleteProducts 
} from "@/lib/products"
import { validateData, productSchema, paginationSchema, searchSchema } from "@/lib/validations"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    
    // Validar parámetros de paginación
    const paginationValidation = validateData(paginationSchema, {
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "10")
    })
    
    if (!paginationValidation.success) {
      return NextResponse.json(
        { error: "Parámetros de paginación inválidos", details: paginationValidation.errors },
        { status: 400 }
      )
    }

    // Validar parámetros de búsqueda
    const searchValidation = validateData(searchSchema, {
      search: searchParams.get("search") || "",
      sortBy: searchParams.get("sortBy") || "createdAt",
      sortOrder: searchParams.get("sortOrder") || "desc"
    })

    if (!searchValidation.success) {
      return NextResponse.json(
        { error: "Parámetros de búsqueda inválidos", details: searchValidation.errors },
        { status: 400 }
      )
    }

    const { page, limit } = paginationValidation.data
    const { search, sortBy, sortOrder } = searchValidation.data
    const category = searchParams.get("category") || ""
    const supplier = searchParams.get("supplier") || ""

    const result = await getProducts({
      page,
      limit,
      search,
      category,
      supplier,
      sortBy,
      sortOrder,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error al obtener productos:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const data = await request.json()

    // Validación básica manual para el nuevo esquema
    if (!data.name || !data.basePrice || !data.categories || data.categories.length === 0) {
      return NextResponse.json(
        { error: "Nombre, precio base y al menos una categoría son requeridos" },
        { status: 400 }
      )
    }

    const product = await createProduct(data)

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error("Error al crear producto:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { action, ids, isActive } = await request.json()

    if (action === "updateStatus") {
      await updateProductsStatus(ids, isActive)
      return NextResponse.json({ message: "Productos actualizados exitosamente" })
    }

    return NextResponse.json({ error: "Acción no válida" }, { status: 400 })
  } catch (error) {
    console.error("Error en acción masiva:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { ids } = await request.json()

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "IDs de productos requeridos" },
        { status: 400 }
      )
    }

    await deleteProducts(ids)

    return NextResponse.json({ message: "Productos eliminados exitosamente" })
  } catch (error) {
    console.error("Error al eliminar productos:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}