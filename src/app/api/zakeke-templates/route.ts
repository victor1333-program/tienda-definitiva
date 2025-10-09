import { NextRequest, NextResponse } from 'next/server'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db as prisma } from '@/lib/db'
import { z } from 'zod'

const createTemplateSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  category: z.string().min(1, 'La categoría es requerida'),
  subcategory: z.string().optional(),
  thumbnailUrl: z.string().url('URL de miniatura inválida'),
  previewUrl: z.string().url().optional(),
  productTypes: z.array(z.string()).default([]),
  templateData: z.record(z.any()),
  allowTextEdit: z.boolean().default(true),
  allowColorEdit: z.boolean().default(true),
  allowImageEdit: z.boolean().default(true),
  editableAreas: z.array(z.string()).default([]),
  isPremium: z.boolean().default(false),
  isActive: z.boolean().default(true),
  isPublic: z.boolean().default(true)
})

const updateTemplateSchema = createTemplateSchema.partial()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const subcategory = searchParams.get('subcategory')
    const productType = searchParams.get('productType')
    const isPremium = searchParams.get('isPremium')
    const isPublic = searchParams.get('isPublic')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {
      isActive: true
    }

    if (category) {
      where.category = category
    }

    if (subcategory) {
      where.subcategory = subcategory
    }

    if (productType) {
      where.productTypes = {
        has: productType
      }
    }

    if (isPremium !== null) {
      where.isPremium = isPremium === 'true'
    }

    if (isPublic !== null) {
      where.isPublic = isPublic === 'true'
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [templates, total] = await Promise.all([
      prisma.zakekeTemplate.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: [
          { usageCount: 'desc' },
          { createdAt: 'desc' }
        ],
        take: limit,
        skip: offset
      }),
      prisma.zakekeTemplate.count({ where })
    ])

    return NextResponse.json({
      success: true,
      templates,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createTemplateSchema.parse(body)

    const template = await prisma.zakekeTemplate.create({
      data: {
        ...validatedData,
        createdBy: session.user.id
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      template,
      message: 'Template creado exitosamente'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating template:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Datos de entrada inválidos',
          details: error.errors
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const templateId = searchParams.get('id')
    
    if (!templateId) {
      return NextResponse.json(
        { error: 'ID de template requerido' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = updateTemplateSchema.parse(body)

    // Check if template exists and user has permission
    const existingTemplate = await prisma.zakekeTemplate.findUnique({
      where: { id: templateId }
    })

    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Template no encontrado' },
        { status: 404 }
      )
    }

    if (existingTemplate.createdBy !== session.user.id && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado para editar este template' },
        { status: 403 }
      )
    }

    const updatedTemplate = await prisma.zakekeTemplate.update({
      where: { id: templateId },
      data: validatedData,
      include: {
        creator: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      template: updatedTemplate,
      message: 'Template actualizado exitosamente'
    })
  } catch (error) {
    console.error('Error updating template:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Datos de entrada inválidos',
          details: error.errors
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const templateId = searchParams.get('id')
    
    if (!templateId) {
      return NextResponse.json(
        { error: 'ID de template requerido' },
        { status: 400 }
      )
    }

    // Check if template exists and user has permission
    const existingTemplate = await prisma.zakekeTemplate.findUnique({
      where: { id: templateId }
    })

    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Template no encontrado' },
        { status: 404 }
      )
    }

    if (existingTemplate.createdBy !== session.user.id && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado para eliminar este template' },
        { status: 403 }
      )
    }

    await prisma.zakekeTemplate.delete({
      where: { id: templateId }
    })

    return NextResponse.json({
      success: true,
      message: 'Template eliminado exitosamente'
    })
  } catch (error) {
    console.error('Error deleting template:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}