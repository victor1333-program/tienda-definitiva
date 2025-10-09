import { NextRequest, NextResponse } from "next/server"
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""

    const skip = (page - 1) * limit

    const where: any = {
      role: "CUSTOMER"
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ]
    }

    const [customers, total] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          createdAt: true,
          orders: {
            select: {
              id: true,
              totalAmount: true,
              createdAt: true,
              status: true
            },
            orderBy: {
              createdAt: "desc"
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        },
        skip,
        take: limit,
      }),
      db.user.count({ where }),
    ])

    // Calcular estadísticas por cliente
    const customersWithStats = customers.map(customer => {
      const totalSpent = customer.orders.reduce((sum, order) => sum + order.totalAmount, 0)
      const lastOrder = customer.orders.length > 0 ? customer.orders[0].createdAt : null
      
      return {
        ...customer,
        totalOrders: customer.orders.length,
        totalSpent,
        lastOrder,
        // No incluir los orders completos en la respuesta para reducir tamaño
        orders: undefined
      }
    })

    return NextResponse.json({
      customers: customersWithStats,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    })
  } catch (error) {
    console.error("Error al obtener clientes:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const data = await request.json()

    // Validaciones básicas
    if (!data.name || !data.email) {
      return NextResponse.json(
        { error: "Nombre y email son requeridos" },
        { status: 400 }
      )
    }

    // Verificar si el email ya existe
    const existingUser = await db.user.findUnique({
      where: { email: data.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "El email ya está registrado" },
        { status: 400 }
      )
    }

    const customer = await db.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: "CUSTOMER",
        // Si se proporciona dirección, crear el registro
        ...(data.address && {
          addresses: {
            create: {
              name: data.name,
              street: data.address.street || "",
              city: data.address.city || "",
              state: data.address.state || "",
              postalCode: data.address.postalCode || "",
              country: data.address.country || "ES",
              isDefault: true
            }
          }
        })
      },
      include: {
        addresses: true
      }
    })

    return NextResponse.json(customer, { status: 201 })
  } catch (error) {
    console.error("Error al crear cliente:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}