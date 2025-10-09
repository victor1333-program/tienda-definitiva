import { NextRequest, NextResponse } from "next/server"
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get("includeInactive") === "true"
    const search = searchParams.get("search") || ""
    const slug = searchParams.get("slug")
    
    // Solo permitir includeInactive para usuarios autenticados
    const session = await auth()
    const isAdmin = session?.user && (session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN")
    
    const where: any = {}
    
    // Para usuarios no autenticados, solo mostrar categorías activas
    if (!includeInactive || !isAdmin) {
      where.isActive = true
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } }
      ]
    }

    if (slug) {
      where.slug = slug
    }

    const categories = await db.category.findMany({
      where,
      orderBy: [
        { isSystem: "desc" }, // Categorías del sistema primero
        { sortOrder: "asc" }  // Luego por orden
      ],
      include: {
        _count: {
          select: { 
            productCategories: true,
            menuItems: true
          }
        }
      }
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error("Error al obtener categorías:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  
  try {
    const session = await auth()
    // Authentication log removed
    
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const data = await request.json()
    // Data log removed

    // Validaciones básicas
    if (!data.name) {
      return NextResponse.json(
        { error: "El nombre es requerido" },
        { status: 400 }
      )
    }

    // Verificar si ya existe una categoría con ese nombre
    // Data log removed
    const existingCategory = await db.category.findFirst({
      where: { name: data.name }
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: "Ya existe una categoría con ese nombre" },
        { status: 400 }
      )
    }

    // Generar slug base si no se proporciona
    let baseSlug = data.slug || data.name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Verificar si el slug ya existe y generar uno único si es necesario
    let slug = baseSlug
    let counter = 1
    
    while (true) {
      const existingSlug = await db.category.findUnique({
        where: { slug }
      })
      
      if (!existingSlug) {
        break // El slug está disponible
      }
      
      // Si el slug existe, agregar un número al final
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Obtener el siguiente orden si no se especifica
    let sortOrder = data.sortOrder
    if (sortOrder === undefined) {
      const lastCategory = await db.category.findFirst({
        orderBy: { sortOrder: 'desc' }
      })
      sortOrder = (lastCategory?.sortOrder || 0) + 10
    }

    
    const category = await db.category.create({
      data: {
        name: data.name,
        slug,
        description: data.description || "",
        sortOrder,
        isActive: data.isActive !== false
      },
      include: {
        _count: {
          select: { 
            productCategories: true,
            menuItems: true
          }
        }
      }
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error: any) {
    console.error("Error al crear categoría:", error)
    
    // Manejo específico de errores de Prisma
    if (error.code === 'P2002') {
      // Constraint único violado
      if (error.meta?.target?.includes('slug')) {
        return NextResponse.json(
          { error: "El slug de la categoría ya existe" },
          { status: 400 }
        )
      }
      if (error.meta?.target?.includes('name')) {
        return NextResponse.json(
          { error: "Ya existe una categoría con ese nombre" },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { error: "La categoría contiene información duplicada" },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}