import { NextResponse } from "next/server"
import { auth } from "../../../../../auth"
import { db, ensureConnection } from "../../../../lib/db"

export async function GET() {
  try {
    // Environment check removed for production
    const session = await auth()
    // Session check removed for production
    
    if (!session?.user) {
      // User log removed
      return NextResponse.json(
        { error: 'No autorizado - Sin sesión' },
        { status: 401 }
      )
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      // User log removed
      return NextResponse.json(
        { error: 'No autorizado - Rol insuficiente' },
        { status: 401 }
      )
    }

    // Data log removed
    
    // Ensure database connection with retry logic
    try {
      await ensureConnection()
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError)
      return NextResponse.json(
        { error: 'Error de conexión a la base de datos' },
        { status: 503 }
      )
    }
    
    // Prueba simple primero
    const productCount = await db.product.count({
      where: {
        isPersonalizable: true
      }
    })
    
    
    if (productCount === 0) {
      return NextResponse.json({
        success: true,
        products: [],
        totalProducts: 0
      })
    }

    // Obtener productos con plantillas y datos relacionados
    const productsWithTemplates = await db.product.findMany({
      where: {
        isPersonalizable: true
      },
      include: {
        designVariants: {
          include: {
            template: true,
            _count: {
              select: {
                orderItems: true
              }
            }
          }
        },
        sides: {
          include: {
            printAreas: true
          }
        },
        variants: true
      },
      orderBy: {
        name: 'asc'
      }
    })


    // Obtener todas las plantillas ZakekeTemplate activas
    // Nota: Las plantillas pueden usarse con productos sin estar explícitamente asociadas
    const zakekeTemplates = await db.zakekeTemplate.findMany({
      where: {
        isActive: true
      },
      include: {
        designVariants: {
          include: {
            product: true
          }
        }
      }
    })


    // Procesar datos para incluir contadores y estadísticas
    const processedProducts = productsWithTemplates.map(product => {
      // Buscar SOLO las plantillas ZakekeTemplate que están explícitamente asociadas a este producto
      // a través de designVariants (cada plantilla es específica de UN producto)
      const productTemplates = zakekeTemplates.filter(template => 
        template.designVariants.some(dv => dv.productId === product.id)
      )
      
      const templatesCount = productTemplates.length
      const activeTemplatesCount = productTemplates.filter(t => t.isActive).length
      const defaultTemplate = productTemplates.find(t => t.isDefaultForAllVariants)
      const sidesCount = product.sides.length
      const printAreasCount = product.sides.reduce((acc, side) => acc + (side.printAreas?.length || 0), 0)
      
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        basePrice: product.basePrice,
        isPersonalizable: product.isPersonalizable,
        createdAt: product.createdAt,
        templatesCount,
        activeTemplatesCount,
        hasDefaultTemplate: !!defaultTemplate,
        defaultTemplateName: defaultTemplate?.name || null,
        templates: productTemplates.map(template => ({
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
          createdAt: template.createdAt,
          updatedAt: template.updatedAt
        })),
        sidesCount,
        areasCount: printAreasCount,
        hasPersonalizationAreas: printAreasCount > 0
      }
    })

    // Data log removed

    return NextResponse.json({
      success: true,
      products: processedProducts,
      totalProducts: processedProducts.length
    })
  } catch (error) {
    console.error('❌ Error fetching products with templates:', error)
    
    return NextResponse.json(
      { error: `Error al obtener productos con plantillas: ${error.message}` },
      { status: 500 }
    )
  }
}