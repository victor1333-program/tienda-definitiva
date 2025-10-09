import { db } from "./db"

// Función para manejar categorías del sistema automáticamente
async function handleSystemCategories(productId: string, productData: any) {
  console.log('🏷️ handleSystemCategories - Iniciando para producto:', productId)
  console.log('📊 Flags del producto:', { featured: productData.featured, topSelling: productData.topSelling })
  
  // Obtener categorías del sistema
  const systemCategories = await db.category.findMany({
    where: { 
      isSystem: true,
      OR: [
        { slug: 'productos-destacados' },
        { slug: 'top-ventas' }
      ]
    }
  })
  
  console.log('🗂️ Categorías del sistema encontradas:', systemCategories.map(c => ({ id: c.id, name: c.name, slug: c.slug })))

  const destacadosCategory = systemCategories.find(c => c.slug === 'productos-destacados')
  const topVentasCategory = systemCategories.find(c => c.slug === 'top-ventas')

  // Gestionar "Productos Destacados"
  if (destacadosCategory) {
    const existingDestacados = await db.productCategory.findFirst({
      where: { 
        productId,
        categoryId: destacadosCategory.id 
      }
    })

    if (productData.featured && !existingDestacados) {
      // Agregar a destacados
      await db.productCategory.create({
        data: {
          productId,
          categoryId: destacadosCategory.id,
          isPrimary: false
        }
      })
      console.log('✅ Producto agregado a Productos Destacados')
    } else if (!productData.featured && existingDestacados) {
      // Remover de destacados
      await db.productCategory.delete({
        where: { id: existingDestacados.id }
      })
      console.log('🗑️ Producto removido de Productos Destacados')
    }
  }

  // Gestionar "Top Ventas"
  if (topVentasCategory) {
    const existingTopVentas = await db.productCategory.findFirst({
      where: { 
        productId,
        categoryId: topVentasCategory.id 
      }
    })

    if (productData.topSelling && !existingTopVentas) {
      // Agregar a top ventas
      await db.productCategory.create({
        data: {
          productId,
          categoryId: topVentasCategory.id,
          isPrimary: false
        }
      })
      console.log('✅ Producto agregado a Top Ventas')
    } else if (!productData.topSelling && existingTopVentas) {
      // Remover de top ventas
      await db.productCategory.delete({
        where: { id: existingTopVentas.id }
      })
      console.log('🗑️ Producto removido de Top Ventas')
    }
  }
}

export async function getProducts({
  page = 1,
  limit = 10,
  search = "",
  category = "",
  supplier = "",
  customizable,
  sortBy = "createdAt",
  sortOrder = "desc"
}: {
  page?: number
  limit?: number
  search?: string
  category?: string
  supplier?: string
  customizable?: boolean
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

  if (customizable === true) {
    where.isPersonalizable = true
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
        sides: {
          include: {
            printAreas: true
          }
        },
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

export async function getProductById(id: string, includeSides = false) {
  const includeConfig: any = {
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
  }

  if (includeSides) {
    includeConfig.sides = {
      include: {
        printAreas: true
      }
    }
  }

  const product = await db.product.findUnique({
    where: { id },
    include: includeConfig,
  })
  
  console.log('🔍 Producto encontrado:', {
    id: product?.id,
    name: product?.name,
    categoriesCount: product?.categories?.length || 0,
    categories: product?.categories
  })
  
  return product
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
      isActive: productData.isActive !== false,
      featured: productData.featured || false,
      sortOrder: productData.sortOrder || 0
    }
  })

  // Crear relaciones con categorías
  if (categories.length > 0) {
    // Verificar que las categorías existen
    const existingCategories = await db.category.findMany({
      where: { id: { in: categories } },
      select: { id: true }
    })
    
    const existingCategoryIds = existingCategories.map(cat => cat.id)
    const validCategories = categories.filter((id: string) => existingCategoryIds.includes(id))
    
    if (validCategories.length > 0) {
      const categoryRelations = validCategories.map((categoryId: string, index: number) => ({
        productId: product.id,
        categoryId,
        isPrimary: index === 0 // La primera categoría es la principal
      }))

      // Crear las relaciones una por una para evitar conflictos de clave foránea
      for (const relation of categoryRelations) {
        try {
          await db.productCategory.create({
            data: relation
          })
        } catch (error: any) {
          console.error(`Error creating category relation for product ${product.id} and category ${relation.categoryId}:`, error)
          // Continue with the next relation instead of failing completely
        }
      }
    }
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

  // Gestión automática de categorías del sistema para productos nuevos
  await handleSystemCategories(product.id, productData)

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
  // Asegurar que images, videos y documents sean strings JSON para Prisma
  if (Array.isArray(data.images)) {
    data.images = JSON.stringify(data.images)
  }
  if (Array.isArray(data.videos)) {
    data.videos = JSON.stringify(data.videos)
  }
  if (Array.isArray(data.documents)) {
    data.documents = JSON.stringify(data.documents)
  }

  // Separar datos de variantes, categorías y remover campos que no existen en el modelo
  const { variants, weight, categories, ...productData } = data
  
  console.log('🔄 Actualizando producto:', id)
  console.log('📦 Datos del producto:', productData)
  console.log('🏷️ Categorías recibidas:', categories)

  const updatedProduct = await db.product.update({
    where: { id },
    data: productData,
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

  // Actualizar categorías si se proporcionan
  if (categories && Array.isArray(categories)) {
    console.log('🗂️ Procesando categorías:', categories)
    
    // Verificar que las categorías existen antes de proceder
    const existingCategories = await db.category.findMany({
      where: { id: { in: categories } },
      select: { id: true, name: true }
    })
    
    const validCategoryIds = existingCategories.map(c => c.id)
    const validCategories = categories.filter(id => validCategoryIds.includes(id))
    
    console.log('✅ Categorías válidas:', validCategories)
    console.log('❌ Categorías inválidas:', categories.filter(id => !validCategoryIds.includes(id)))
    
    // Eliminar categorías existentes
    await db.productCategory.deleteMany({
      where: { productId: id }
    })
    console.log('🗑️ Categorías existentes eliminadas')

    // Agregar nuevas categorías (solo las válidas)
    if (validCategories.length > 0) {
      const categoryData = validCategories.map((categoryId: string, index: number) => ({
        productId: id,
        categoryId,
        isPrimary: index === 0
      }))
      console.log('➕ Creando nuevas categorías:', categoryData)
      
      await db.productCategory.createMany({
        data: categoryData
      })
      console.log('✅ Categorías creadas exitosamente')
    }
  } else {
    console.log('⚠️ No se recibieron categorías para actualizar')
  }

  // Gestión automática de categorías del sistema
  await handleSystemCategories(id, productData)

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

  // Retornar el producto actualizado con todas las relaciones
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
      variants: true
    }
  })
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