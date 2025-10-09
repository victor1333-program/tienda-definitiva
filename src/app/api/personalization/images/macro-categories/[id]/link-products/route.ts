import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    
    const resolvedParams = await params;// Obtener todas las imágenes de esta macrocategoría y sus productos vinculados
    const images = await prisma.personalizationImage.findMany({
      where: { 
        OR: [
          { macroCategoryId: resolvedParams.id },
          {
            category: {
              macroCategoryId: resolvedParams.id
            }
          }
        ]
      },
      include: {
        linkedProducts: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: true,
                isPersonalizable: true
              }
            }
          }
        }
      }
    })

    // Recopilar todos los productos únicos vinculados
    const linkedProductsMap = new Map()
    
    images.forEach(image => {
      image.linkedProducts.forEach(link => {
        if (!linkedProductsMap.has(link.productId)) {
          linkedProductsMap.set(link.productId, {
            productId: link.productId,
            product: link.product,
            imageCount: 1
          })
        } else {
          linkedProductsMap.get(link.productId).imageCount++
        }
      })
    })

    const linkedProducts = Array.from(linkedProductsMap.values())

    return NextResponse.json({
      macroCategoryId: resolvedParams.id,
      totalImages: images.length,
      linkedProducts
    })
  } catch (error) {
    console.error('Error fetching linked products:', error)
    return NextResponse.json(
      { error: 'Error al obtener productos vinculados' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { productIds, linkToAll } = body

    // Verificar que la macrocategoría existe
    const macroCategory = await prisma.personalizationImageMacroCategory.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!macroCategory) {
      return NextResponse.json(
        { error: 'Macrocategoría no encontrada' },
        { status: 404 }
      )
    }

    // Obtener todas las imágenes de esta macrocategoría (directas e indirectas a través de categorías)
    const images = await prisma.personalizationImage.findMany({
      where: { 
        OR: [
          { macroCategoryId: resolvedParams.id },
          {
            category: {
              macroCategoryId: resolvedParams.id
            }
          }
        ]
      },
      select: { id: true }
    })

    if (images.length === 0) {
      return NextResponse.json(
        { error: 'No hay imágenes en esta macrocategoría para vincular' },
        { status: 400 }
      )
    }

    const imageIds = images.map(img => img.id)

    if (linkToAll) {
      // Vincular a todos los productos personalizables
      const personalizableProducts = await prisma.product.findMany({
        where: { 
          isPersonalizable: true,
          isActive: true
        },
        select: { id: true }
      })

      // Eliminar vínculos existentes de todas las imágenes de esta macrocategoría
      await prisma.personalizationImageProductLink.deleteMany({
        where: { imageId: { in: imageIds } }
      })

      // Crear nuevos vínculos para todas las imágenes
      const links = []
      for (const image of images) {
        for (const product of personalizableProducts) {
          links.push({
            imageId: image.id,
            productId: product.id
          })
        }
      }

      await prisma.personalizationImageProductLink.createMany({
        data: links,
        skipDuplicates: true
      })

      return NextResponse.json({
        message: `Macrocategoría vinculada a ${personalizableProducts.length} productos personalizables`,
        linkedCount: personalizableProducts.length,
        imagesCount: images.length
      })
    } else if (productIds && Array.isArray(productIds)) {
      if (productIds.length === 0) {
        // Eliminar todos los vínculos
        await prisma.personalizationImageProductLink.deleteMany({
          where: { imageId: { in: imageIds } }
        })

        return NextResponse.json({
          message: 'Todos los vínculos de la macrocategoría han sido eliminados',
          linkedCount: 0
        })
      }

      // Verificar que los productos existen y son personalizables
      const products = await prisma.product.findMany({
        where: { 
          id: { in: productIds },
          isPersonalizable: true,
          isActive: true
        },
        select: { id: true }
      })

      if (products.length !== productIds.length) {
        return NextResponse.json(
          { error: 'Algunos productos no existen o no son personalizables' },
          { status: 400 }
        )
      }

      // Eliminar vínculos existentes
      await prisma.personalizationImageProductLink.deleteMany({
        where: { imageId: { in: imageIds } }
      })

      // Crear nuevos vínculos para todas las imágenes
      const links = []
      for (const image of images) {
        for (const product of products) {
          links.push({
            imageId: image.id,
            productId: product.id
          })
        }
      }

      await prisma.personalizationImageProductLink.createMany({
        data: links,
        skipDuplicates: true
      })

      return NextResponse.json({
        message: `Macrocategoría vinculada a ${products.length} producto(s)`,
        linkedCount: products.length,
        imagesCount: images.length
      })
    } else {
      return NextResponse.json(
        { error: 'Debe proporcionar productIds o linkToAll' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error linking products to macro category:', error)
    return NextResponse.json(
      { error: 'Error al vincular productos' },
      { status: 500 }
    )
  }
}