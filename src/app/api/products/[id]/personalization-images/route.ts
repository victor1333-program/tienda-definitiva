import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params

    // Get images directly linked to this product
    const directImages = await prisma.personalizationImageProductLink.findMany({
      where: { productId, isActive: true },
      include: {
        image: {
          include: {
            category: {
              include: {
                macroCategory: true
              }
            },
            macroCategory: true
          }
        }
      }
    })

    // For now, focus only on direct images
    // Category and macro category links will be implemented later when needed
    const categoryImages = []
    const macroImages = []

    // Combine all images and remove duplicates
    const allImages = new Map()

    // Add directly linked images
    directImages.forEach(link => {
      if (link.image && link.image.isActive) {
        allImages.set(link.image.id, {
          id: link.image.id,
          name: link.image.name,
          fileUrl: link.image.fileUrl,
          thumbnailUrl: link.image.thumbnailUrl,
          tags: link.image.tags,
          width: link.image.width,
          height: link.image.height,
          fileSize: link.image.fileSize,
          fileType: link.image.fileType,
          category: link.image.category ? {
            id: link.image.category.id,
            name: link.image.category.name,
            macroCategory: link.image.category.macroCategory
          } : null,
          macroCategory: link.image.macroCategory ? {
            id: link.image.macroCategory.id,
            name: link.image.macroCategory.name
          } : null,
          linkType: link.image.macroCategoryId && !link.image.categoryId ? 'macrocategory' :
                   link.image.categoryId ? 'category' : 'direct'
        })
      }
    })

    // Add images from linked categories
    categoryImages.forEach(link => {
      link.category.images.forEach(image => {
        if (!allImages.has(image.id)) {
          allImages.set(image.id, {
            id: image.id,
            name: image.name,
            fileUrl: image.fileUrl,
            thumbnailUrl: image.thumbnailUrl,
            tags: image.tags,
            width: image.width,
            height: image.height,
            fileSize: image.fileSize,
            fileType: image.fileType,
            category: image.category ? {
              id: image.category.id,
              name: image.category.name,
              macroCategory: image.category.macroCategory
            } : null,
            macroCategory: image.macroCategory ? {
              id: image.macroCategory.id,
              name: image.macroCategory.name
            } : null,
            linkType: 'category'
          })
        }
      })
    })

    // Add images from linked macrocategories
    macroImages.forEach(link => {
      link.macroCategory.images.forEach(image => {
        if (!allImages.has(image.id)) {
          allImages.set(image.id, {
            id: image.id,
            name: image.name,
            fileUrl: image.fileUrl,
            thumbnailUrl: image.thumbnailUrl,
            tags: image.tags,
            width: image.width,
            height: image.height,
            fileSize: image.fileSize,
            fileType: image.fileType,
            category: image.category ? {
              id: image.category.id,
              name: image.category.name,
              macroCategory: image.category.macroCategory
            } : null,
            macroCategory: image.macroCategory ? {
              id: image.macroCategory.id,
              name: image.macroCategory.name
            } : null,
            linkType: 'macrocategory'
          })
        }
      })
    })

    const images = Array.from(allImages.values())

    return NextResponse.json({
      images,
      total: images.length,
      directCount: directImages.length,
      categoryCount: categoryImages.reduce((total, link) => total + link.category.images.length, 0),
      macroCount: macroImages.reduce((total, link) => total + link.macroCategory.images.length, 0)
    })
  } catch (error) {
    console.error('Error fetching personalization images:', error)
    return NextResponse.json(
      { error: 'Error al obtener imágenes de personalización' },
      { status: 500 }
    )
  }
}