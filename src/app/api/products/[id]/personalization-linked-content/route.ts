import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params

    // Verificar si el producto tiene imágenes vinculadas
    // Todas las vinculaciones (directas, de categorías, y de macrocategorías) 
    // se almacenan en personalizationImageProductLink
    const linkedImages = await prisma.personalizationImageProductLink.count({
      where: { 
        productId, 
        isActive: true,
        image: {
          isActive: true
        }
      }
    }).catch(err => {
      console.error('Error counting linked images:', err)
      return 0
    })
    
    // Obtener estadísticas detalladas para debugging
    const linkedImagesWithCategories = await prisma.personalizationImageProductLink.findMany({
      where: { 
        productId, 
        isActive: true,
        image: {
          isActive: true
        }
      },
      include: {
        image: {
          select: {
            id: true,
            name: true,
            categoryId: true,
            macroCategoryId: true,
            category: {
              select: { name: true }
            },
            macroCategory: {
              select: { name: true }
            }
          }
        }
      }
    }).catch(err => {
      console.error('Error fetching linked images details:', err)
      return []
    })
    
    // Contar por tipo de vinculación
    let directImages = 0
    let categoryImages = 0
    let macroCategoryImages = 0
    
    linkedImagesWithCategories.forEach(link => {
      const image = link.image
      if (image.macroCategoryId && !image.categoryId) {
        macroCategoryImages++
      } else if (image.categoryId) {
        categoryImages++
      } else {
        directImages++
      }
    })

    const hasLinkedContent = linkedImages > 0

    return NextResponse.json({
      hasLinkedContent,
      linkedImages,
      directImages,
      categoryImages, 
      macroCategoryImages,
      // Información detallada para debugging
      details: linkedImagesWithCategories.map(link => ({
        imageId: link.image.id,
        imageName: link.image.name,
        categoryName: link.image.category?.name || null,
        macroCategoryName: link.image.macroCategory?.name || null,
        linkType: link.image.macroCategoryId && !link.image.categoryId ? 'macrocategory' :
                 link.image.categoryId ? 'category' : 'direct'
      }))
    })
  } catch (error) {
    console.error('Error checking linked content:', error)
    return NextResponse.json(
      { error: 'Error al verificar contenido vinculado' },
      { status: 500 }
    )
  }
}