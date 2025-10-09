import { NextRequest, NextResponse } from 'next/server'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db as prisma, ensureConnection } from '@/lib/db'

interface VariantGroup {
  id: string
  name: string
  type: 'size' | 'color' | 'custom'
  options: VariantOption[]
  showSizeTable?: boolean
}

interface VariantOption {
  id: string
  name: string
  value: string
  colorHex?: string
  measurements?: {
    width?: number
    length?: number
  }
}

interface VariantCombination {
  id: string
  groupCombinations: { groupId: string, optionId: string }[]
  sku: string
  stock: number
  price: number
  isActive: boolean
  displayName: string
  images?: string[]
}

interface Params {
  params: {
    id: string
  }
}

// GET: Obtener grupos y combinaciones de variantes existentes
export async function GET(request: NextRequest, { params }: Params) {
  try {
    // Ensure database connection
    await ensureConnection()
    
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id: productId } = await params

    // Obtener el producto con la configuración de variantes
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        variants: {
          orderBy: { sku: 'asc' }
        }
      }
    })

    if (!product) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    // Intentar cargar la configuración guardada de grupos y combinaciones
    let groups: VariantGroup[] = []
    let combinations: VariantCombination[] = []

    try {
      if (product.variantGroupsConfig) {
        groups = JSON.parse(product.variantGroupsConfig)
      }
      if (product.variantCombinationsConfig) {
        combinations = JSON.parse(product.variantCombinationsConfig)
      }
    } catch (error) {
      console.error('Error parsing variant configuration:', error)
    }
    
    return NextResponse.json({
      variants: product.variants.map(variant => ({
        id: variant.id,
        sku: variant.sku,
        size: variant.size,
        colorName: variant.colorName,
        colorHex: variant.colorHex,
        material: variant.material,
        stock: variant.stock,
        price: variant.price,
        isActive: variant.isActive,
        images: JSON.parse(variant.images || '[]')
      })),
      groups,
      combinations
    })

  } catch (error) {
    console.error('Error loading variants:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST: Guardar grupos y combinaciones de variantes
export async function POST(request: NextRequest, { params }: Params) {
  try {
    // Ensure database connection
    await ensureConnection()
    
    const session = await auth()
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id: productId } = await params
    const { groups, combinations } = await request.json() as {
      groups: VariantGroup[]
      combinations: VariantCombination[]
    }

    // Data log removed
    // Data log removed

    // Verificar que el producto existe
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    // Verificar que al menos hay grupos
    if (!groups || groups.length === 0) {
      return NextResponse.json(
        { error: 'Se requiere al menos un grupo de variantes' },
        { status: 400 }
      )
    }

    // Solo verificar SKUs si hay combinaciones
    if (combinations && combinations.length > 0) {
      // Verificar si hay SKUs duplicados en las combinaciones
      const skus = combinations.map(c => c.sku)
      const duplicateSKUs = skus.filter((sku, index) => skus.indexOf(sku) !== index)
      
      if (duplicateSKUs.length > 0) {
        return NextResponse.json(
          { error: `SKUs duplicados encontrados: ${duplicateSKUs.join(', ')}` },
          { status: 400 }
        )
      }

      // Verificar si algún SKU ya existe en otros productos
      const existingSKUs = await prisma.productVariant.findMany({
        where: {
          sku: { in: skus },
          productId: { not: productId } // Excluir el producto actual
        },
        select: { sku: true }
      })

      if (existingSKUs.length > 0) {
        return NextResponse.json(
          { error: `SKUs ya existen en otros productos: ${existingSKUs.map(v => v.sku).join(', ')}` },
          { status: 400 }
        )
      }
    }

    // Usar una transacción para asegurar consistencia
    const result = await prisma.$transaction(async (tx) => {
      let variantsCreated = 0

      // Solo eliminar y crear variantes si hay combinaciones
      if (combinations && combinations.length > 0) {
        // Eliminar variantes existentes para este producto
        await tx.productVariant.deleteMany({
          where: { productId }
        })

        // Crear nuevas variantes basadas en las combinaciones
        const variantsToCreate = combinations.map(combination => ({
          sku: combination.sku,
          productId: productId,
          stock: combination.stock || 0,
          price: combination.price,
          isActive: combination.isActive,
          images: combination.images && combination.images.length > 0 
            ? JSON.stringify(combination.images) 
            : '[]',
          
          // Extraer información específica de las opciones
          size: extractSizeFromCombination(combination, groups),
          colorName: extractColorNameFromCombination(combination, groups),
          colorHex: extractColorHexFromCombination(combination, groups),
          material: extractMaterialFromCombination(combination, groups)
        }))

        // Crear las variantes en lote
        const createdVariants = await tx.productVariant.createMany({
          data: variantsToCreate
        })
        
        variantsCreated = createdVariants.count
      }

      // Siempre guardar los grupos y combinaciones como JSON en el producto
      await tx.product.update({
        where: { id: productId },
        data: {
          variantGroupsConfig: JSON.stringify(groups),
          variantCombinationsConfig: JSON.stringify(combinations || [])
        }
      })

      return { variantsCreated }
    })

    return NextResponse.json({
      message: combinations && combinations.length > 0 
        ? 'Variantes guardadas exitosamente' 
        : 'Configuración de grupos guardada exitosamente',
      variantsCreated: result.variantsCreated,
      groupsSaved: groups.length
    })

  } catch (error) {
    console.error('Error saving variants:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Funciones auxiliares para extraer información de las combinaciones
function extractSizeFromCombination(combination: VariantCombination, groups: VariantGroup[]): string | null {
  for (const gc of combination.groupCombinations) {
    const group = groups.find(g => g.id === gc.groupId && g.type === 'size')
    if (group) {
      const option = group.options.find(o => o.id === gc.optionId)
      return option?.value || null
    }
  }
  return null
}

function extractColorNameFromCombination(combination: VariantCombination, groups: VariantGroup[]): string | null {
  for (const gc of combination.groupCombinations) {
    const group = groups.find(g => g.id === gc.groupId && g.type === 'color')
    if (group) {
      const option = group.options.find(o => o.id === gc.optionId)
      return option?.name || null
    }
  }
  return null
}

function extractColorHexFromCombination(combination: VariantCombination, groups: VariantGroup[]): string | null {
  for (const gc of combination.groupCombinations) {
    const group = groups.find(g => g.id === gc.groupId && g.type === 'color')
    if (group) {
      const option = group.options.find(o => o.id === gc.optionId)
      return option?.colorHex || null
    }
  }
  return null
}

function extractMaterialFromCombination(combination: VariantCombination, groups: VariantGroup[]): string | null {
  for (const gc of combination.groupCombinations) {
    const group = groups.find(g => g.id === gc.groupId && g.type === 'custom')
    if (group) {
      const option = group.options.find(o => o.id === gc.optionId)
      // Asumir que si el grupo se llama "Material" es el material
      if (group.name.toLowerCase().includes('material')) {
        return option?.value || null
      }
    }
  }
  return null
}