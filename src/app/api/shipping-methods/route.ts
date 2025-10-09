import { NextRequest, NextResponse } from 'next/server'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db as prisma } from '@/lib/db'
import { validateData, shippingMethodSchema } from '@/lib/validation'

// GET: Obtener métodos de envío
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get('isActive')
    const includeInactive = searchParams.get('includeInactive') === 'true'

    // Construir filtros
    const where: any = {}
    
    if (!includeInactive) {
      where.isActive = true
    } else if (isActive !== null) {
      where.isActive = isActive === 'true'
    }

    const shippingMethods = await prisma.shippingMethod.findMany({
      where,
      orderBy: [
        { isActive: 'desc' },
        { price: 'asc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json({ shippingMethods })

  } catch (error) {
    console.error('Error fetching shipping methods:', error)
    return NextResponse.json(
      { error: 'Error al obtener métodos de envío' },
      { status: 500 }
    )
  }
}

// POST: Crear método de envío
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role === 'CUSTOMER') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validar datos
    const validation = validateData(shippingMethodSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.errors },
        { status: 400 }
      )
    }

    const { name, description, price, isActive, estimatedDays } = validation.data

    // Verificar que el nombre no existe
    const existingMethod = await prisma.shippingMethod.findUnique({
      where: { name }
    })

    if (existingMethod) {
      return NextResponse.json(
        { error: 'Ya existe un método de envío con ese nombre' },
        { status: 400 }
      )
    }

    // Crear método de envío
    const shippingMethod = await prisma.shippingMethod.create({
      data: {
        name,
        description,
        price,
        isActive,
        estimatedDays
      }
    })

    return NextResponse.json({
      shippingMethod,
      message: 'Método de envío creado correctamente'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating shipping method:', error)
    return NextResponse.json(
      { error: 'Error al crear método de envío' },
      { status: 500 }
    )
  }
}

// PATCH: Operaciones masivas
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role === 'CUSTOMER') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, methodIds } = body

    if (!action || !methodIds || !Array.isArray(methodIds)) {
      return NextResponse.json(
        { error: 'Acción e IDs de métodos son requeridos' },
        { status: 400 }
      )
    }

    let result

    switch (action) {
      case 'activate':
        result = await prisma.shippingMethod.updateMany({
          where: { id: { in: methodIds } },
          data: { isActive: true }
        })
        break

      case 'deactivate':
        result = await prisma.shippingMethod.updateMany({
          where: { id: { in: methodIds } },
          data: { isActive: false }
        })
        break

      case 'delete':
        // Verificar que no tienen pedidos asociados
        const ordersWithMethods = await prisma.order.findMany({
          where: {
            shippingMethod: {
              in: methodIds.map(id => {
                // Buscar el nombre del método por ID
                return prisma.shippingMethod.findUnique({
                  where: { id },
                  select: { name: true }
                }).then(method => method?.name || '')
              })
            }
          },
          take: 1
        })

        if (ordersWithMethods.length > 0) {
          return NextResponse.json(
            { error: 'No se pueden eliminar métodos de envío con pedidos asociados' },
            { status: 400 }
          )
        }

        result = await prisma.shippingMethod.deleteMany({
          where: { id: { in: methodIds } }
        })
        break

      default:
        return NextResponse.json(
          { error: 'Acción no válida' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      message: `Operación '${action}' completada en ${result.count} método(s)`,
      count: result.count
    })

  } catch (error) {
    console.error('Error in batch shipping method operation:', error)
    return NextResponse.json(
      { error: 'Error en operación masiva' },
      { status: 500 }
    )
  }
}