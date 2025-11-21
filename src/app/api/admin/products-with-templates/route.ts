import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Temporalmente deshabilitado para desarrollo
    // const session = await auth()
    // if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
    //   return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    // }

    // Obtener productos personalizables
    const products = await db.product.findMany({
      where: {
        isPersonalizable: true
      },
      select: {
        id: true,
        name: true,
        description: true,
        basePrice: true,
        images: true,
        isPersonalizable: true,
        createdAt: true,
        _count: {
          select: {
            sides: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Formatear los productos para incluir información de templates
    const productsWithTemplates = await Promise.all(products.map(async (product) => {
      // Parse images
      const images = typeof product.images === 'string'
        ? JSON.parse(product.images)
        : product.images

      // Buscar plantillas que coincidan con el nombre del producto (todas, no solo activas)
      const templates = await db.zakekeTemplate.findMany({
        where: {
          productTypes: {
            has: product.name.toLowerCase()
          }
        },
        orderBy: [
          { isActive: 'desc' }, // Activas primero
          { createdAt: 'desc' }
        ]
      })

      const activeTemplates = templates.filter(t => t.isActive)
      const defaultTemplate = templates.find(t => t.isDefaultForAllVariants)

      // Formatear plantillas para el frontend
      const formattedTemplates = templates.map(template => ({
        id: template.id,
        name: template.name,
        description: template.description,
        category: template.category,
        subcategory: template.subcategory,
        thumbnailUrl: template.thumbnailUrl,
        previewUrl: template.previewUrl,
        productTypes: template.productTypes,
        templateData: template.templateData,
        allowTextEdit: template.allowTextEdit,
        allowColorEdit: template.allowColorEdit,
        allowImageEdit: template.allowImageEdit,
        editableAreas: template.editableAreas,
        isPremium: template.isPremium,
        isActive: template.isActive,
        isPublic: template.isPublic,
        isDefaultForAllVariants: template.isDefaultForAllVariants,
        usageCount: template.usageCount,
        rating: template.rating,
        createdBy: template.createdBy,
        createdAt: template.createdAt.toISOString(),
        updatedAt: template.updatedAt.toISOString()
      }))

      return {
        id: product.id,
        name: product.name,
        description: product.description || '',
        basePrice: parseFloat(product.basePrice?.toString() || '0'),
        images: Array.isArray(images) ? images : [],
        isPersonalizable: product.isPersonalizable,
        createdAt: product.createdAt.toISOString(),
        templatesCount: templates.length,
        activeTemplatesCount: activeTemplates.length,
        hasDefaultTemplate: !!defaultTemplate,
        defaultTemplateName: defaultTemplate?.name || null,
        templates: formattedTemplates,
        sidesCount: product._count.sides,
        areasCount: 0,
        hasPersonalizationAreas: product._count.sides > 0
      }
    }))

    return NextResponse.json({
      success: true,
      products: productsWithTemplates
    })

  } catch (error) {
    console.error('Error fetching products with templates:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener productos',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
