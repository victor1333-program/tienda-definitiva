import { NextRequest, NextResponse } from 'next/server'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db as prisma } from '@/lib/db'
import { z } from 'zod'
import { calculateTotalDesignPrice } from '@/lib/design-pricing'
import { convertDesignDataToPreview, generateMultiplePreviewSizes } from '@/lib/image-preview'

const createDesignSchema = z.object({
  productId: z.string().cuid(),
  designData: z.record(z.any()),
  selectedVariant: z.string().optional(),
  quantity: z.number().int().min(1).default(1),
  status: z.enum(['DRAFT', 'SAVED', 'COMPLETED']).default('DRAFT'),
  name: z.string().optional()
})

const updateDesignSchema = z.object({
  designData: z.record(z.any()).optional(),
  selectedVariant: z.string().optional(),
  quantity: z.number().int().min(1).optional(),
  status: z.enum(['DRAFT', 'SAVED', 'COMPLETED']).optional(),
  name: z.string().optional()
})

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const status = searchParams.get('status')
    
    // Allow guests to access their designs via session/cookie in future
    const customerId = session?.user?.id

    const where: any = {}
    
    if (customerId) {
      where.customerId = customerId
    }
    
    if (productId) {
      where.productId = productId
    }
    
    if (status) {
      where.status = status
    }

    const designs = await prisma.customerDesign.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            basePrice: true,
            images: true
          }
        }
      },
      orderBy: {
        lastAccessed: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      designs
    })
  } catch (error) {
    console.error('Error fetching customer designs:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const body = await request.json()
    const validatedData = createDesignSchema.parse(body)

    // Verify product exists and get category info
    const product = await prisma.product.findUnique({
      where: { id: validatedData.productId },
      include: {
        categories: {
          include: {
            category: {
              select: { slug: true }
            }
          }
        }
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    // Calculate intelligent pricing based on design complexity
    const categorySlug = product.categories[0]?.category?.slug
    const pricingResult = calculateTotalDesignPrice(
      product.basePrice,
      validatedData.designData,
      validatedData.quantity,
      categorySlug
    )

    const { basePrice, customPrice, totalPrice } = pricingResult

    // Generar imágenes preview si hay datos de diseño
    let previewImages: string[] = []
    
    if (validatedData.designData && Object.keys(validatedData.designData).length > 0) {
      try {
        const previewData = convertDesignDataToPreview(product, validatedData.designData)
        const previews = await generateMultiplePreviewSizes(previewData)
        
        // Recopilar URLs de preview generadas
        previewImages = [
          previews.thumbnail,
          previews.medium,
          previews.large
        ].filter(Boolean) as string[]
        
        console.log(`✅ Generated ${previewImages.length} preview images for design`)
        
      } catch (previewError) {
        console.error('Error generating preview images:', previewError)
        // No fallar la creación del diseño por esto
        previewImages = []
      }
    }

    const design = await prisma.customerDesign.create({
      data: {
        ...validatedData,
        customerId: session?.user?.id || null,
        basePrice,
        customPrice,
        totalPrice,
        previewImages,
        lastAccessed: new Date()
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            basePrice: true,
            images: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      design,
      message: 'Diseño guardado exitosamente'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating customer design:', error)
    
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
    const { searchParams } = new URL(request.url)
    const designId = searchParams.get('id')
    
    if (!designId) {
      return NextResponse.json(
        { error: 'ID de diseño requerido' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = updateDesignSchema.parse(body)

    // Find existing design
    const existingDesign = await prisma.customerDesign.findUnique({
      where: { id: designId },
      include: { product: true }
    })

    if (!existingDesign) {
      return NextResponse.json(
        { error: 'Diseño no encontrado' },
        { status: 404 }
      )
    }

    // Check ownership (allow guests to edit their own designs in future)
    if (session?.user?.id && existingDesign.customerId !== session.user.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    // Recalculate pricing if quantity or design changed
    let updateData: any = {
      ...validatedData,
      lastAccessed: new Date()
    }

    const shouldRecalculate = 
      validatedData.quantity !== existingDesign.quantity ||
      validatedData.designData

    if (shouldRecalculate) {
      // Get product category for pricing rules
      const productWithCategory = await prisma.product.findUnique({
        where: { id: existingDesign.productId },
        include: {
          categories: {
            include: {
              category: {
                select: { slug: true }
              }
            }
          }
        }
      })

      const categorySlug = productWithCategory?.categories[0]?.category?.slug
      const newQuantity = validatedData.quantity || existingDesign.quantity
      const newDesignData = validatedData.designData || existingDesign.designData

      const pricingResult = calculateTotalDesignPrice(
        existingDesign.product.basePrice,
        newDesignData,
        newQuantity,
        categorySlug
      )

      updateData.basePrice = pricingResult.basePrice
      updateData.customPrice = pricingResult.customPrice
      updateData.totalPrice = pricingResult.totalPrice
      
      // Regenerar previews si el diseño cambió
      if (validatedData.designData) {
        try {
          const previewData = convertDesignDataToPreview(existingDesign.product, newDesignData)
          const previews = await generateMultiplePreviewSizes(previewData)
          
          // Actualizar URLs de preview
          updateData.previewImages = [
            previews.thumbnail,
            previews.medium,
            previews.large
          ].filter(Boolean) as string[]
          
          console.log(`✅ Regenerated ${updateData.previewImages.length} preview images for design update`)
          
        } catch (previewError) {
          console.error('Error regenerating preview images:', previewError)
          // Mantener previews existentes si falla la regeneración
        }
      }
    }

    const updatedDesign = await prisma.customerDesign.update({
      where: { id: designId },
      data: updateData,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            basePrice: true,
            images: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      design: updatedDesign,
      message: 'Diseño actualizado exitosamente'
    })
  } catch (error) {
    console.error('Error updating customer design:', error)
    
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
    const { searchParams } = new URL(request.url)
    const designId = searchParams.get('id')
    
    if (!designId) {
      return NextResponse.json(
        { error: 'ID de diseño requerido' },
        { status: 400 }
      )
    }

    // Find existing design
    const existingDesign = await prisma.customerDesign.findUnique({
      where: { id: designId }
    })

    if (!existingDesign) {
      return NextResponse.json(
        { error: 'Diseño no encontrado' },
        { status: 404 }
      )
    }

    // Check ownership
    if (session?.user?.id && existingDesign.customerId !== session.user.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    await prisma.customerDesign.delete({
      where: { id: designId }
    })

    return NextResponse.json({
      success: true,
      message: 'Diseño eliminado exitosamente'
    })
  } catch (error) {
    console.error('Error deleting customer design:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}