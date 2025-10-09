import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // Obtener la imagen con sus productos vinculados
    const image = await prisma.personalizationImage.findUnique({
      where: { id },
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

    if (!image) {
      return NextResponse.json(
        { error: 'Imagen no encontrada' },
        { status: 404 }
      )
    }

    const linkedProducts = image.linkedProducts.map(link => ({
      id: link.id,
      productId: link.productId,
      isActive: link.isActive,
      createdAt: link.createdAt,
      product: link.product
    }))

    return NextResponse.json({
      imageId: image.id,
      imageName: image.name,
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
    const { id } = await params
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { productIds, linkToAll } = body

    // Verificar que la imagen existe
    const image = await prisma.personalizationImage.findUnique({
      where: { id }
    })

    if (!image) {
      return NextResponse.json(
        { error: 'Imagen no encontrada' },
        { status: 404 }
      )
    }

    if (linkToAll) {
      // Vincular a todos los productos personalizables
      // Un producto es personalizable si:
      // 1. Tiene isPersonalizable: true, O
      // 2. Tiene lados configurados con áreas de impresión activas
      const personalizableProducts = await prisma.product.findMany({
        where: { 
          isActive: true,
          OR: [
            { isPersonalizable: true },
            {
              sides: {
                some: {
                  isActive: true,
                  printAreas: {
                    some: {
                      isActive: true
                    }
                  }
                }
              }
            }
          ]
        },
        select: { id: true }
      })

      // Eliminar vínculos existentes
      await prisma.personalizationImageProductLink.deleteMany({
        where: { imageId: id }
      })

      // Crear nuevos vínculos
      const links = personalizableProducts.map(product => ({
        imageId: id,
        productId: product.id
      }))

      await prisma.personalizationImageProductLink.createMany({
        data: links,
        skipDuplicates: true
      })

      return NextResponse.json({
        message: `Imagen vinculada a ${personalizableProducts.length} productos personalizables`,
        linkedCount: personalizableProducts.length
      })
    } else if (productIds && Array.isArray(productIds)) {
      // Vincular a productos específicos
      if (productIds.length === 0) {
        // Si la lista está vacía, eliminar todos los vínculos
        await prisma.personalizationImageProductLink.deleteMany({
          where: { imageId: id }
        })

        return NextResponse.json({
          message: 'Todos los vínculos de producto han sido eliminados',
          linkedCount: 0
        })
      }

      // Verificar que los productos existen y son personalizables
      // Un producto es personalizable si:
      // 1. Tiene isPersonalizable: true, O
      // 2. Tiene lados configurados con áreas de impresión activas
      const products = await prisma.product.findMany({
        where: { 
          id: { in: productIds },
          isActive: true,
          OR: [
            { isPersonalizable: true },
            {
              sides: {
                some: {
                  isActive: true,
                  printAreas: {
                    some: {
                      isActive: true
                    }
                  }
                }
              }
            }
          ]
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
        where: { imageId: id }
      })

      // Crear nuevos vínculos
      const links = products.map(product => ({
        imageId: id,
        productId: product.id
      }))

      await prisma.personalizationImageProductLink.createMany({
        data: links,
        skipDuplicates: true
      })

      return NextResponse.json({
        message: `Imagen vinculada a ${products.length} producto(s)`,
        linkedCount: products.length
      })
    } else {
      return NextResponse.json(
        { error: 'Debe proporcionar productIds o linkToAll' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error linking products:', error)
    return NextResponse.json(
      { error: 'Error al vincular productos' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const productId = searchParams.get('productId')

    if (productId) {
      // Eliminar vínculo específico
      await prisma.personalizationImageProductLink.deleteMany({
        where: { 
          imageId: id,
          productId: productId
        }
      })

      return NextResponse.json({
        message: 'Vínculo específico eliminado'
      })
    } else {
      // Eliminar todos los vínculos de la imagen
      await prisma.personalizationImageProductLink.deleteMany({
        where: { imageId: id }
      })

      return NextResponse.json({
        message: 'Todos los vínculos eliminados'
      })
    }
  } catch (error) {
    console.error('Error deleting product links:', error)
    return NextResponse.json(
      { error: 'Error al eliminar vínculos' },
      { status: 500 }
    )
  }
}