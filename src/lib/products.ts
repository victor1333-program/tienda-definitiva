import { db } from "./db"

export async function getProducts({
  page = 1,
  limit = 10,
  search = "",
  category = "",
  supplier = "",
  sortBy = "createdAt",
  sortOrder = "desc"
}: {
  page?: number
  limit?: number
  search?: string
  category?: string
  supplier?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
} = {}) {
  const skip = (page - 1) * limit

  const where: any = {}

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ]
  }

  if (category) {
    where.categories = {
      some: {
        categoryId: category
      }
    }
  }

  if (supplier) {
    where.suppliers = {
      some: {
        supplierId: supplier
      }
    }
  }

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      include: {
        categories: {
          include: {
            category: true
          }
        },
        suppliers: {
          include: {
            supplier: true
          }
        },
        variants: true,
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: limit,
    }),
    db.product.count({ where }),
  ])

  return {
    products,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
  }
}

export async function getProductById(id: string) {
  return db.product.findUnique({
    where: { id },
    include: {
      categories: {
        include: {
          category: true
        }
      },
      suppliers: {
        include: {
          supplier: true
        }
      },
      variants: true,
    },
  })
}

export async function createProduct(data: any) {
  // Separar datos que no van directamente en el producto
  const { 
    categories = [], 
    suppliers = [], 
    variants = [],
    ...productData 
  } = data

  // Crear el producto principal
  const product = await db.product.create({
    data: {
      name: productData.name,
      slug: productData.slug,
      sku: productData.sku || null,
      description: productData.description || null,
      basePrice: productData.basePrice,
      comparePrice: productData.comparePrice || null,
      costPrice: productData.costPrice || null,
      images: productData.images || "[]",
      videos: productData.videos || "[]",
      documents: productData.documents || "[]",
      hasQuantityPricing: productData.hasQuantityPricing || false,
      quantityPrices: productData.quantityPrices || "[]",
      materialType: productData.materialType || null,
      canCustomize: productData.canCustomize !== false,
      customizationPrice: productData.customizationPrice || 0,
      isActive: productData.isActive !== false,
      featured: productData.featured || false,
      sortOrder: productData.sortOrder || 0
    }
  })

  // Crear relaciones con categorías
  if (categories.length > 0) {
    const categoryRelations = categories.map((categoryId: string, index: number) => ({
      productId: product.id,
      categoryId,
      isPrimary: index === 0 // La primera categoría es la principal
    }))

    await db.productCategory.createMany({
      data: categoryRelations
    })
  }

  // Crear relaciones con proveedores
  if (suppliers.length > 0) {
    const supplierRelations = suppliers.map((supplierId: string, index: number) => ({
      productId: product.id,
      supplierId,
      isPrimary: index === 0 // El primer proveedor es el principal
    }))

    await db.productSupplier.createMany({
      data: supplierRelations
    })
  }

  // Crear variantes mejoradas
  if (variants.length > 0) {
    const variantData = variants.map((variant: any) => ({
      productId: product.id,
      sku: variant.sku,
      size: variant.size || null,
      colorName: variant.colorName || null,
      colorHex: variant.colorHex || null,
      colorDisplay: variant.colorDisplay || null,
      material: variant.material || null,
      stock: variant.stock || 0,
      price: variant.price || null,
      isActive: true
    }))

    await db.productVariant.createMany({
      data: variantData
    })
  }

  // Retornar el producto completo con todas las relaciones
  return db.product.findUnique({
    where: { id: product.id },
    include: {
      categories: {
        include: {
          category: true
        }
      },
      suppliers: {
        include: {
          supplier: true
        }
      },
      variants: true
    }
  })
}

export async function updateProduct(id: string, data: any) {
  // Parsear imágenes si es string JSON
  if (typeof data.images === 'string') {
    try {
      data.images = JSON.parse(data.images)
    } catch {
      data.images = []
    }
  }

  // Separar datos de variantes
  const { variants, ...productData } = data

  const updatedProduct = await db.product.update({
    where: { id },
    data: productData,
    include: {
      category: true,
      variants: true,
    },
  })

  // Actualizar variantes si se proporcionan
  if (variants) {
    // Eliminar variantes existentes
    await db.productVariant.deleteMany({
      where: { productId: id }
    })

    // Crear nuevas variantes
    if (variants.length > 0) {
      await db.productVariant.createMany({
        data: variants.map((variant: any) => ({
          ...variant,
          productId: id
        }))
      })
    }
  }

  return updatedProduct
}

export async function deleteProduct(id: string) {
  // Eliminar variantes primero
  await db.productVariant.deleteMany({
    where: { productId: id }
  })

  return db.product.delete({
    where: { id },
  })
}

export async function updateProductsStatus(ids: string[], isActive: boolean) {
  return db.product.updateMany({
    where: {
      id: { in: ids }
    },
    data: {
      isActive
    }
  })
}

export async function deleteProducts(ids: string[]) {
  // Eliminar variantes primero
  await db.productVariant.deleteMany({
    where: { productId: { in: ids } }
  })

  return db.product.deleteMany({
    where: {
      id: { in: ids }
    }
  })
}