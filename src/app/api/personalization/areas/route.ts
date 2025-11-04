import { NextRequest, NextResponse } from 'next/server'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db } from '@/lib/db'
import { z } from 'zod'

const createAreaSchema = z.object({
  sideId: z.string(),
  name: z.string().min(1, 'El nombre es requerido'),
  displayName: z.string().optional(),
  description: z.string().optional(),
  x: z.number(),
  y: z.number(),
  width: z.number().positive('El ancho debe ser positivo'),
  height: z.number().positive('El alto debe ser positivo'),
  rotation: z.number().default(0),
  realWidth: z.number().positive().optional(),
  realHeight: z.number().positive().optional(),
  printingMethod: z.enum(['DTG', 'DTF', 'SUBLIMATION', 'VINYL', 'EMBROIDERY', 'SCREEN_PRINT', 'DIGITAL_PRINT', 'LASER_ENGRAVE', 'UV_PRINT']),
  maxPrintWidth: z.number().positive().optional(),
  maxPrintHeight: z.number().positive().optional(),
  resolution: z.number().int().positive().default(300),
  maxColors: z.number().int().positive().default(10),
  extraCostPerColor: z.number().min(0).default(0),
  basePrice: z.number().min(0).default(0),
  allowText: z.boolean().default(true),
  allowImages: z.boolean().default(true),
  allowShapes: z.boolean().default(true),
  allowClipart: z.boolean().default(true),
  mandatoryPersonalization: z.boolean().default(false),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  isRelativeCoordinates: z.boolean().default(false),
  referenceWidth: z.number().positive().optional(),
  referenceHeight: z.number().positive().optional()
})

// GET /api/personalization/areas - Obtener todas las áreas
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }
    const { searchParams } = new URL(request.url)
    const sideId = searchParams.get('sideId')
    const productId = searchParams.get('productId')

    let where = {}
    
    if (sideId) {
      where = { sideId }
    } else if (productId) {
      where = { side: { productId } }
    }

    const areas = await db.printArea.findMany({
      where,
      include: {
        side: {
          include: {
            product: {
              select: { id: true, name: true, slug: true }
            }
          }
        },
        _count: {
          select: { designElements: true }
        }
      },
      orderBy: [
        { side: { position: 'asc' } },
        { sortOrder: 'asc' }
      ]
    })

    return NextResponse.json({
      success: true,
      data: areas
    })
  } catch (error) {
    console.error('Error fetching print areas:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener las áreas de impresión' },
      { status: 500 }
    )
  }
}

// POST /api/personalization/areas - Crear nueva área
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    // User log removed
    
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }
    const body = await request.json()
    console.log('📝 Creating area with name:', body.name)
    const validatedData = createAreaSchema.parse(body)
    console.log('✅ Validated area name:', validatedData.name)

    // Verificar que el lado existe
    const side = await db.productSide.findUnique({
      where: { id: validatedData.sideId },
      include: {
        product: {
          select: { id: true, name: true }
        }
      }
    })

    if (!side) {
      return NextResponse.json(
        { success: false, error: 'El lado del producto no existe' },
        { status: 404 }
      )
    }

    // Data log removed
    const area = await db.printArea.create({
      data: validatedData,
      include: {
        side: {
          include: {
            product: {
              select: { id: true, name: true, slug: true }
            }
          }
        },
        _count: {
          select: { designElements: true }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: area,
      message: 'Área de impresión creada exitosamente'
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error creating print area:', error.errors)
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating print area:', error)
    return NextResponse.json(
      { success: false, error: 'Error al crear el área de impresión', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    )
  }
}