import { NextRequest, NextResponse } from 'next/server'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db } from '@/lib/db'
import { z } from 'zod'

const createSideSchema = z.object({
  productId: z.string(),
  name: z.string().min(1, 'El nombre es requerido'),
  displayName: z.string().optional(),
  position: z.number().int().min(0).default(0),
  image2D: z.string().nullable().optional(),
  image3D: z.string().nullable().optional(),
  surcharge: z.number().optional().default(0),
  isActive: z.boolean().default(true)
})

// GET /api/personalization/sides - Obtener todos los lados
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const includeVariantImages = searchParams.get('includeVariantImages') === 'true'

    const where = productId ? { productId } : {}

    const sides = await db.productSide.findMany({
      where,
      include: {
        product: {
          select: { id: true, name: true, slug: true, images: true }
        },
        printAreas: {
          select: {
            id: true,
            name: true,
            displayName: true,
            description: true,
            x: true,
            y: true,
            width: true,
            height: true,
            rotation: true,
            realWidth: true,
            realHeight: true,
            printingMethod: true,
            maxPrintWidth: true,
            maxPrintHeight: true,
            resolution: true,
            maxColors: true,
            extraCostPerColor: true,
            basePrice: true,
            allowText: true,
            allowImages: true,
            allowShapes: true,
            allowClipart: true,
            mandatoryPersonalization: true,
            sortOrder: true,
            isActive: true,
            _count: {
              select: { designElements: true }
            }
          }
        },
        variantSideImages: includeVariantImages ? true : false,
        _count: {
          select: { printAreas: true }
        }
      },
      orderBy: [
        { productId: 'asc' },
        { position: 'asc' }
      ]
    })

    return NextResponse.json({
      success: true,
      data: sides
    })
  } catch (error) {
    console.error('Error fetching product sides:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener los lados del producto' },
      { status: 500 }
    )
  }
}

// POST /api/personalization/sides - Crear nuevo lado
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }
    const body = await request.json()
    const validatedData = createSideSchema.parse(body)

    // Verificar que el producto existe
    const product = await db.product.findUnique({
      where: { id: validatedData.productId }
    })

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'El producto no existe' },
        { status: 404 }
      )
    }

    const side = await db.productSide.create({
      data: validatedData,
      include: {
        product: {
          select: { id: true, name: true, slug: true, images: true }
        },
        _count: {
          select: { printAreas: true }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: side,
      message: 'Lado del producto creado exitosamente'
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating product side:', error)
    return NextResponse.json(
      { success: false, error: 'Error al crear el lado del producto' },
      { status: 500 }
    )
  }
}

// DELETE /api/personalization/sides - Eliminar todos los lados de un producto
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'productId es requerido' },
        { status: 400 }
      )
    }

    // Verificar que el producto existe
    const product = await db.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'El producto no existe' },
        { status: 404 }
      )
    }

    // Usar transacción para eliminar todo relacionado con la personalización del producto
    await db.$transaction(async (tx) => {
      // Primero obtener todos los lados del producto
      const productSides = await tx.productSide.findMany({
        where: { productId: productId },
        select: { id: true }
      })
      
      const sideIds = productSides.map(side => side.id)
      
      if (sideIds.length > 0) {
        // Obtener todas las áreas de impresión de estos lados
        const printAreas = await tx.printArea.findMany({
          where: { sideId: { in: sideIds } },
          select: { id: true }
        })
        
        const printAreaIds = printAreas.map(area => area.id)
        
        if (printAreaIds.length > 0) {
          // Eliminar los elementos de diseño de todas las áreas de impresión
          await tx.designElement.deleteMany({
            where: { printAreaId: { in: printAreaIds } }
          })
        }

        // Luego eliminar las áreas de impresión
        await tx.printArea.deleteMany({
          where: { sideId: { in: sideIds } }
        })

        // Eliminar las imágenes de lados de variantes
        await tx.variantSideImage.deleteMany({
          where: { sideId: { in: sideIds } }
        })

        // Finalmente eliminar los lados del producto
        await tx.productSide.deleteMany({
          where: { id: { in: sideIds } }
        })
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Configuración de personalización eliminada exitosamente'
    })

  } catch (error) {
    console.error('Error deleting product personalization:', error)
    return NextResponse.json(
      { success: false, error: 'Error al eliminar la configuración de personalización' },
      { status: 500 }
    )
  }
}