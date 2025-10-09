import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const productId = id

    // Verificar que el producto existe
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { 
        id: true, 
        isPersonalizable: true,
        name: true
      }
    })

    if (!product) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    // Obtener lados del producto
    const sides = await prisma.productSide.findMany({
      where: { productId },
      include: {
        printAreas: {
          where: { isActive: true }
        }
      }
    })

    // Obtener áreas de personalización activas
    const areas = sides.flatMap(side => side.printAreas)

    // Obtener reglas de precios para este producto
    const pricingRules = await prisma.personalizationPricingRule.findMany({
      where: { 
        productId,
        isActive: true 
      }
    })

    // Obtener plantillas asignadas a este producto (si existe esa funcionalidad)
    // Por ahora, asumimos que no hay asignación específica por producto para plantillas
    const templates = await prisma.zakekeTemplate.findMany({
      where: {
        // Asumiendo que existe un campo para asignar plantillas a productos específicos
        // Si no existe, esto devolverá todas las plantillas
        isActive: true
      },
      take: 10 // Limitamos para el resumen
    })

    // Obtener formas disponibles (globalmente o asignadas al producto)
    const shapes = await prisma.personalizationShape.findMany({
      where: {
        isActive: true,
        // Si las formas tienen asignación por producto, añadir filtro aquí
      },
      take: 10 // Limitamos para el resumen
    })

    // Obtener imágenes disponibles (globalmente o asignadas al producto)
    const images = await prisma.personalizationImage.findMany({
      where: {
        isActive: true,
        // Si las imágenes tienen asignación por producto, añadir filtro aquí
      },
      take: 10 // Limitamos para el resumen
    })

    // Obtener fuentes personalizadas
    const fonts = await prisma.customFont.findMany({
      where: {
        isActive: true
      },
      take: 10 // Limitamos para el resumen
    })

    // Construir el resumen
    const summary = {
      productId: product.id,
      productName: product.name,
      isPersonalizable: product.isPersonalizable || false,
      
      // Estados de configuración
      hasActiveSides: sides.filter(side => side.isActive).length > 0,
      hasActiveAreas: areas.length > 0,
      hasPricingRules: pricingRules.length > 0,
      hasTemplates: templates.length > 0,
      hasShapes: shapes.length > 0,
      hasImages: images.length > 0,
      hasFonts: fonts.length > 0,
      
      // Datos detallados para mostrar conteos
      sides: sides.map(side => ({
        id: side.id,
        name: side.name,
        isActive: side.isActive,
        areasCount: side.printAreas.length
      })),
      
      areas: areas.map(area => ({
        id: area.id,
        name: area.name,
        sideName: sides.find(s => s.id === area.sideId)?.name || 'Desconocido'
      })),
      
      pricingRules: pricingRules.map(rule => ({
        id: rule.id,
        name: rule.name,
        description: rule.description,
        isActive: rule.isActive
      })),
      
      templates: templates.map(template => ({
        id: template.id,
        name: template.name,
        isActive: template.isActive
      })),
      
      shapes: shapes.map(shape => ({
        id: shape.id,
        name: shape.name,
        category: shape.category,
        isMask: shape.isMask
      })),
      
      images: images.map(image => ({
        id: image.id,
        name: image.name,
        category: image.category
      })),
      
      fonts: fonts.map(font => ({
        id: font.id,
        name: font.name,
        family: font.family
      })),
      
      // Estadísticas rápidas
      stats: {
        totalSides: sides.length,
        activeSides: sides.filter(side => side.isActive).length,
        totalAreas: areas.length,
        totalPricingRules: pricingRules.length,
        totalTemplates: templates.length,
        totalShapes: shapes.length,
        totalImages: images.length,
        totalFonts: fonts.length
      }
    }

    return NextResponse.json(summary)
  } catch (error) {
    console.error('Error fetching personalization summary:', error)
    return NextResponse.json(
      { error: 'Error al obtener el resumen de personalización' },
      { status: 500 }
    )
  }
}