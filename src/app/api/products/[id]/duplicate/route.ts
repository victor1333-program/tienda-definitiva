import { NextRequest, NextResponse } from "next/server"
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params

    // Obtener el producto original con todas sus relaciones
    const originalProduct = await db.product.findUnique({
      where: { id },
      include: {
        categories: {
          include: {
            category: true
          }
        },
        variants: true,
        suppliers: true
      }
    })

    if (!originalProduct) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      )
    }

    // Generar nuevo nombre y slug únicos
    const duplicatedName = `${originalProduct.name} (Copia)`
    const baseSlug = originalProduct.slug + "-copia"
    
    // Verificar si el slug ya existe y agregar número si es necesario
    let newSlug = baseSlug
    let counter = 1
    
    while (await db.product.findUnique({ where: { slug: newSlug } })) {
      newSlug = `${baseSlug}-${counter}`
      counter++
    }

    // Generar nuevo SKU único
    const baseSku = originalProduct.sku + "-COPY"
    let newSku = baseSku
    counter = 1
    
    while (await db.product.findUnique({ where: { sku: newSku } })) {
      newSku = `${baseSku}-${counter}`
      counter++
    }

    // Crear el producto duplicado
    const duplicatedProduct = await db.product.create({
      data: {
        name: duplicatedName,
        slug: newSlug,
        description: originalProduct.description,
        sku: newSku,
        basePrice: originalProduct.basePrice,
        comparePrice: originalProduct.comparePrice,
        costPrice: originalProduct.costPrice,
        images: originalProduct.images,
        videos: originalProduct.videos,
        documents: originalProduct.documents,
        isActive: false, // Crear como inactivo por defecto
        featured: false, // No copiar el estado featured
        personalizationType: originalProduct.personalizationType,
        materialType: originalProduct.materialType,
        quantityPrices: originalProduct.quantityPrices,
        tags: originalProduct.tags,
        metaTitle: originalProduct.metaTitle,
        metaDescription: originalProduct.metaDescription,
        weight: originalProduct.weight,
        dimensions: originalProduct.dimensions,
        
        // Copiar categorías
        categories: {
          create: originalProduct.categories.map(pc => ({
            categoryId: pc.categoryId,
            isPrimary: pc.isPrimary,
            order: pc.order
          }))
        },
        
        // Copiar variantes
        variants: {
          create: originalProduct.variants.map(variant => ({
            sku: `${variant.sku}-COPY`,
            size: variant.size,
            color: variant.color,
            material: variant.material,
            finish: variant.finish,
            price: variant.price,
            stock: 0, // Empezar con stock 0
            isActive: variant.isActive,
            images: variant.images,
            weight: variant.weight,
            dimensions: variant.dimensions
          }))
        },
        
        // Copiar proveedores
        suppliers: {
          create: originalProduct.suppliers.map(ps => ({
            supplierId: ps.supplierId,
            cost: ps.cost,
            leadTime: ps.leadTime,
            minQuantity: ps.minQuantity,
            isPrimary: ps.isPrimary
          }))
        }
      },
      include: {
        categories: {
          include: {
            category: true
          }
        },
        variants: true,
        suppliers: true
      }
    })

    return NextResponse.json({
      success: true,
      duplicatedProduct,
      message: "Producto duplicado exitosamente"
    })

  } catch (error) {
    console.error("Error duplicando producto:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}