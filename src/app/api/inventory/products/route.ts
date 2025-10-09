import { NextRequest, NextResponse } from 'next/server'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db as prisma } from '@/lib/db'

// GET: Obtener inventario completo (productos base + variantes)
export async function GET(request: NextRequest) {
  try {
    // DESHABILITADO TEMPORALMENTE PARA DESARROLLO
    // const session = await auth()
    // if (!session?.user || session.user.role === 'CUSTOMER') {
    //   return NextResponse.json(
    //     { error: 'No autorizado' },
    //     { status: 401 }
    //   )
    // }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search')
    const lowStock = searchParams.get('lowStock') === 'true'
    const outOfStock = searchParams.get('outOfStock') === 'true'
    const category = searchParams.get('category')

    const skip = (page - 1) * limit

    // Obtener productos con sus variantes
    const whereProduct: any = {
      isActive: true
    }

    if (search) {
      whereProduct.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (category) {
      whereProduct.categories = {
        some: {
          categoryId: category
        }
      }
    }

    const products = await prisma.product.findMany({
      where: whereProduct,
      include: {
        variants: {
          where: { isActive: true },
          orderBy: { id: 'desc' }
        },
        categories: {
          include: {
            category: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' },
      skip,
      take: limit
    })

    const totalProducts = await prisma.product.count({ where: whereProduct })

    // Transformar datos para el inventario
    const inventoryItems = []

    products.forEach(product => {
      // Calcular el stock total del producto (suma de variantes o stock directo)
      const variantsTotalStock = product.variants.reduce((sum, v) => sum + v.stock, 0)
      const productTotalStock = product.variants.length > 0 ? variantsTotalStock : product.directStock

      // Agregar el producto padre
      const shouldIncludeProduct = (!lowStock && !outOfStock) || 
                                   (lowStock && (productTotalStock <= product.minStock || productTotalStock <= 5)) ||
                                   (outOfStock && productTotalStock === 0)
      
      if (shouldIncludeProduct) {
        inventoryItems.push({
          id: product.id,
          type: 'product',
          name: product.name,
          sku: product.sku,
          stock: productTotalStock,
          directStock: product.directStock,
          minStock: product.minStock,
          price: product.basePrice,
          productId: product.id,
          productName: product.name,
          images: product.images,
          isActive: product.isActive,
          categories: product.categories.map(pc => pc.category),
          brand: product.brand,
          supplier: product.supplier,
          hasVariants: product.variants.length > 0,
          variantCount: product.variants.length,
          trackInventory: product.trackInventory,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
          level: 0 // Nivel de jerarquía
        })
      }

      // Si tiene variantes, agregar cada variante como hijo
      if (product.variants.length > 0) {
        product.variants.forEach(variant => {
          // Aplicar filtros de stock
          const shouldIncludeVariant = (!lowStock && !outOfStock) || 
                                       (lowStock && variant.stock <= 5) ||
                                       (outOfStock && variant.stock === 0)
          
          if (shouldIncludeVariant) {
            inventoryItems.push({
              id: variant.id,
              type: 'variant',
              name: `${variant.size ? ` ${variant.size}` : ''}${variant.colorName ? ` ${variant.colorName}` : ''}${variant.material ? ` ${variant.material}` : ''}`.trim() || 'Variante estándar',
              sku: variant.sku,
              stock: variant.stock,
              price: variant.price || product.basePrice,
              productId: product.id,
              productName: product.name,
              images: product.images,
              isActive: variant.isActive,
              categories: product.categories.map(pc => pc.category),
              brand: product.brand,
              supplier: product.supplier,
              variantDetails: {
                size: variant.size,
                colorName: variant.colorName,
                colorHex: variant.colorHex,
                colorDisplay: variant.colorDisplay,
                material: variant.material
              },
              parentProductId: product.id,
              createdAt: variant.createdAt,
              updatedAt: variant.updatedAt,
              level: 1 // Nivel de jerarquía
            })
          }
        })
      }
    })

    // Calcular estadísticas mejoradas
    const allVariants = await prisma.productVariant.findMany({
      where: { isActive: true },
      select: { stock: true, price: true }
    })

    const productsWithDirectStock = await prisma.product.findMany({
      where: { 
        isActive: true,
        trackInventory: true,
        variants: {
          none: {}
        }
      },
      select: { directStock: true, basePrice: true, minStock: true }
    })

    const variantsTotalStock = allVariants.reduce((sum, v) => sum + v.stock, 0)
    const variantsTotalValue = allVariants.reduce((sum, v) => sum + (v.stock * (v.price || 0)), 0)
    
    const productsTotalStock = productsWithDirectStock.reduce((sum, p) => sum + p.directStock, 0)
    const productsTotalValue = productsWithDirectStock.reduce((sum, p) => sum + (p.directStock * p.basePrice), 0)

    const totalStock = variantsTotalStock + productsTotalStock
    const totalValue = variantsTotalValue + productsTotalValue
    
    const lowStockVariants = allVariants.filter(v => v.stock <= 5).length
    const lowStockProducts = productsWithDirectStock.filter(p => p.directStock <= p.minStock || p.directStock <= 5).length
    const lowStockCount = lowStockVariants + lowStockProducts
    
    const outOfStockVariants = allVariants.filter(v => v.stock === 0).length
    const outOfStockProducts = productsWithDirectStock.filter(p => p.directStock === 0).length
    const outOfStockCount = outOfStockVariants + outOfStockProducts

    const totalItems = allVariants.length + productsWithDirectStock.length

    const stats = {
      totalItems: inventoryItems.length,
      totalVariants: allVariants.length,
      totalProductsWithDirectStock: productsWithDirectStock.length,
      totalStock,
      totalValue,
      lowStockCount,
      outOfStockCount,
      averageStock: totalItems > 0 ? Math.round(totalStock / totalItems) : 0,
      breakdown: {
        variants: {
          count: allVariants.length,
          stock: variantsTotalStock,
          value: variantsTotalValue
        },
        products: {
          count: productsWithDirectStock.length,
          stock: productsTotalStock,
          value: productsTotalValue
        }
      }
    }

    return NextResponse.json({
      items: inventoryItems,
      pagination: {
        page,
        limit,
        total: totalProducts,
        pages: Math.ceil(totalProducts / limit),
        hasNext: page * limit < totalProducts,
        hasPrev: page > 1
      },
      stats
    })

  } catch (error) {
    console.error('Error fetching inventory:', error)
    return NextResponse.json(
      { error: 'Error al obtener inventario' },
      { status: 500 }
    )
  }
}

// PATCH: Actualizar stock de un item del inventario
export async function PATCH(request: NextRequest) {
  try {
    // DESHABILITADO TEMPORALMENTE PARA DESARROLLO
    // const session = await auth()
    // if (!session?.user || session.user.role === 'CUSTOMER') {
    //   return NextResponse.json(
    //     { error: 'No autorizado' },
    //     { status: 401 }
    //   )
    // }

    const body = await request.json()
    const { id, type, stock, reason } = body

    if (type === 'variant') {
      // Actualizar stock de variante
      const variant = await prisma.productVariant.findUnique({
        where: { id }
      })

      if (!variant) {
        return NextResponse.json(
          { error: 'Variante no encontrada' },
          { status: 404 }
        )
      }

      const difference = stock - variant.stock

      await prisma.productVariant.update({
        where: { id },
        data: { stock }
      })

      // Crear movimiento de inventario
      if (difference !== 0) {
        await prisma.inventoryMovement.create({
          data: {
            variantId: id,
            type: difference > 0 ? 'IN' : 'OUT',
            quantity: Math.abs(difference),
            reason: reason || 'Ajuste manual de stock',
            userId: 'dev-user' // session.user.id
          }
        })
      }

      // Actualizar stock del producto padre (suma de variantes)
      const product = await prisma.product.findUnique({
        where: { id: variant.productId },
        include: { variants: true }
      })

      if (product) {
        const totalVariantStock = product.variants.reduce((sum, v) => sum + (v.id === id ? stock : v.stock), 0)
        await prisma.product.update({
          where: { id: variant.productId },
          data: { stock: totalVariantStock }
        })
      }

      return NextResponse.json({
        message: 'Stock actualizado correctamente',
        newStock: stock
      })
    } else if (type === 'product') {
      // Actualizar stock directo de producto sin variantes
      const product = await prisma.product.findUnique({
        where: { id },
        include: { variants: true }
      })

      if (!product) {
        return NextResponse.json(
          { error: 'Producto no encontrado' },
          { status: 404 }
        )
      }

      if (product.variants.length > 0) {
        return NextResponse.json(
          { error: 'Este producto tiene variantes. Actualiza el stock de las variantes individuales.' },
          { status: 400 }
        )
      }

      const difference = stock - product.directStock

      await prisma.product.update({
        where: { id },
        data: { 
          directStock: stock,
          stock: stock  // Sincronizar ambos campos
        }
      })

      // TODO: Crear un sistema de movimientos para productos directos si es necesario
      // Por ahora solo registramos el cambio

      return NextResponse.json({
        message: 'Stock del producto actualizado correctamente',
        newStock: stock
      })
    } else {
      return NextResponse.json(
        { error: 'Tipo de item no válido' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Error updating inventory:', error)
    return NextResponse.json(
      { error: 'Error al actualizar inventario' },
      { status: 500 }
    )
  }
}