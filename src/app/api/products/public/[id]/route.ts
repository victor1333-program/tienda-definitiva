import { NextRequest, NextResponse } from "next/server"
import { db as prisma } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Obtener parámetros de query
    const url = new URL(request.url)
    const includeVariants = url.searchParams.get('include')?.includes('variants')
    const includeReviews = url.searchParams.get('include')?.includes('reviews')
    const includeCategory = url.searchParams.get('include')?.includes('category')
    const includePersonalization = url.searchParams.get('include')?.includes('personalization')
    

    const product = await prisma.product.findFirst({
      where: {
        id,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        slug: true,
        sku: true,
        description: true,
        basePrice: true,
        comparePrice: true,
        costPrice: true,
        images: true,
        videos: true,
        documents: true,
        hasQuantityPricing: true,
        quantityPrices: true,
        isActive: true,
        featured: true,
        topSelling: true,
        sortOrder: true,
        materialType: true,
        metaTitle: true,
        metaDescription: true,
        createdAt: true,
        updatedAt: true,
        brand: true,
        directStock: true,
        minStock: true,
        stock: true,
        supplier: true,
        trackInventory: true,
        isPersonalizable: true,
        personalizationData: true,
        personalizationSettings: true,
        variantCombinationsConfig: true,
        variantGroupsConfig: true,
        // hasDesignVariants: true, // Comentado para evitar el error
        // defaultDesignVariantId: true, // Comentado para evitar el error
        variants: includeVariants ? {
          where: { isActive: true },
          orderBy: { price: 'asc' },
          select: {
            id: true,
            sku: true,
            price: true,
            stock: true,
            size: true,
            colorName: true,
            colorHex: true,
            material: true,
            width: true,
            height: true,
            images: true
          }
        } : false,
        categories: includeCategory ? {
          include: {
            category: true
          }
        } : false,
        sides: {
          include: {
            printAreas: true,
            variantSideImages: true
          },
          where: { isActive: true },
          orderBy: { position: 'asc' }
        }
      }
    })

    
    if (!product) {
      // Data log removed
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      )
    }

    
    // Formatear datos para el frontend
    const formattedProduct = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      basePrice: product.basePrice,
      comparePrice: product.comparePrice,
      images: (() => {
        try {
          return JSON.parse(product.images || '[]')
        } catch (e) {
          console.error('API: Error parsing images JSON:', e)
          return []
        }
      })(),
      videos: (() => {
        try {
          return JSON.parse(product.videos || '[]')
        } catch (e) {
          console.error('API: Error parsing videos JSON:', e)
          return []
        }
      })(),
      materialType: product.materialType,
      metaTitle: product.metaTitle,
      metaDescription: product.metaDescription,
      featured: product.featured,
      tags: [], // Agregar lógica para tags si es necesario
      variantGroupsConfig: (() => {
        try {
          return product.variantGroupsConfig ? JSON.parse(product.variantGroupsConfig) : null
        } catch (e) {
          console.error('API: Error parsing variantGroupsConfig JSON:', e)
          return null
        }
      })(),
      variants: includeVariants ? product.variants.map(variant => ({
        id: variant.id,
        sku: variant.sku,
        name: `${variant.size ? variant.size : ''}${variant.colorName ? ` - ${variant.colorName}` : ''}${variant.material ? ` (${variant.material})` : ''}`.trim() || 'Variante estándar',
        price: variant.price || product.basePrice,
        stock: variant.stock,
        size: variant.size,
        colorName: variant.colorName,
        colorHex: variant.colorHex,
        material: variant.material,
        width: variant.width,
        height: variant.height,
        images: (() => {
          try {
            return JSON.parse(variant.images || '[]')
          } catch (e) {
            console.error('API: Error parsing variant images JSON:', e)
            return []
          }
        })() // Incluir imágenes de la variante
      })) : [],
      category: includeCategory && product.categories.length > 0 ? {
        id: product.categories[0].category.id,
        name: product.categories[0].category.name,
        slug: product.categories[0].category.slug
      } : null,
      specifications: {
        material: product.materialType,
        // Agregar más especificaciones según sea necesario
      },
      // Mock data para rating y reviews por ahora
      rating: 4.5,
      reviewCount: 12,
      reviews: includeReviews ? [] : undefined,
      // Información de personalización (simplificada)
      isPersonalizable: product.isPersonalizable || (product.sides && product.sides.some(side => side.printAreas && side.printAreas.length > 0)),
      personalizationData: (() => {
        try {
          return product.personalizationData ? JSON.parse(product.personalizationData) : null
        } catch (e) {
          console.error('API: Error parsing personalizationData JSON:', e)
          return null
        }
      })(),
      personalizationSettings: (() => {
        try {
          return product.personalizationSettings ? JSON.parse(product.personalizationSettings) : null
        } catch (e) {
          console.error('API: Error parsing personalizationSettings JSON:', e)
          return null
        }
      })(),
      // Lados de personalización con imágenes reales
      sides: product.sides ? product.sides.map(side => ({
        id: side.id,
        name: side.name,
        displayName: side.displayName,
        position: side.position,
        image2D: side.image2D,
        image3D: side.image3D,
        printAreas: side.printAreas?.map(area => ({
          id: area.id,
          name: area.name,
          x: area.x,
          y: area.y,
          width: area.width,
          height: area.height,
          rotation: area.rotation || 0,
          shape: area.shape || 'rectangle',
          isRelativeCoordinates: area.isRelativeCoordinates || false,
          referenceWidth: area.referenceWidth,
          referenceHeight: area.referenceHeight,
          printingMethod: area.printingMethod,
          allowText: area.allowText,
          allowImages: area.allowImages,
          allowShapes: area.allowShapes,
          allowClipart: area.allowClipart,
          maxColors: area.maxColors,
          basePrice: area.basePrice
        })) || [],
        variantSideImages: side.variantSideImages || []
      })) : []
    }

    return NextResponse.json(formattedProduct)
  } catch (error) {
    console.error("Error al obtener producto:", error)
    console.error("Error stack:", error.stack)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}