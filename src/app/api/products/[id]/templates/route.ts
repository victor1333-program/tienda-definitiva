import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'

// Obtener plantillas prediseñadas para un producto
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const productId = id

    // Obtener el producto para conocer su nombre
    const product = await db.product.findUnique({
      where: { id: productId },
      select: { name: true }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    // Buscar plantillas que coincidan con el tipo de producto
    const templates = await db.zakekeTemplate.findMany({
      where: {
        isActive: true,
        productTypes: {
          has: product.name.toLowerCase()
        }
      },
      orderBy: [
        { isDefaultForAllVariants: 'desc' }, // Plantillas predeterminadas primero
        { usageCount: 'desc' },
        { createdAt: 'desc' }
      ],
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Separar plantillas predeterminadas de las opcionales
    const defaultTemplates = templates.filter(t => t.isDefaultForAllVariants)
    const optionalTemplates = templates.filter(t => !t.isDefaultForAllVariants)

    return NextResponse.json({
      success: true,
      templates,
      defaultTemplates,
      optionalTemplates,
      hasDefaultTemplate: defaultTemplates.length > 0,
      productName: product.name
    })

  } catch (error) {
    console.error('Error fetching product templates:', error)
    return NextResponse.json(
      { error: 'Error al obtener las plantillas del producto' },
      { status: 500 }
    )
  }
}

// Crear nuevo template de personalización
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes((session.user as any).role)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const productId = id
    const {
      name,
      description,
      templateData,
      previewImage,
      isActive = true,
      isGlobal = false
    } = await request.json()

    if (!name || !templateData) {
      return NextResponse.json(
        { error: 'Nombre y datos del template son requeridos' },
        { status: 400 }
      )
    }

    // Verificar que el producto existe
    const product = await db.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    const template = await db.personalizationTemplate.create({
      data: {
        name,
        description,
        templateData,
        previewImage,
        isActive,
        isGlobal,
        productId: isGlobal ? null : productId
      }
    })

    return NextResponse.json({
      message: 'Template creado exitosamente',
      template
    })

  } catch (error) {
    console.error('Error creating personalization template:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}