const { db } = require('../src/lib/db');
const productId = 'cmc5ysotf0009jg3vvq6d2ql8'

// Nuevas tallas a agregar
const newSizes = ['s', 'l', 'xxl']

// Nuevos colores a agregar
const newColors = [
  { name: 'Blanco', hex: '#FFFFFF' },
  { name: 'Negro', hex: '#000000' },
  { name: 'Azul', hex: '#1E3A8A' }
]

// Colores existentes (para las nuevas tallas)
const existingColors = [
  { name: 'Amarillo', hex: '#EAB308' },
  { name: 'Rojo', hex: '#DC2626' },
  { name: 'Rosa', hex: '#EC4899' }
]

// Tallas existentes (para los nuevos colores)
const existingSizes = ['xs', 'm', 'xl']

async function addVariants() {
  try {
    console.log('🔍 Verificando producto...')
    
    // Verificar que el producto existe
    const product = await db.product.findUnique({
      where: { id: productId },
      include: {
        variants: true
      }
    })

    if (!product) {
      console.log('❌ Producto no encontrado')
      return
    }

    console.log('✅ Producto encontrado:', product.name)
    console.log(`📦 Variantes actuales: ${product.variants.length}`)
    
    const variantsToCreate = []
    
    // 1. Crear nuevas tallas con colores existentes
    console.log('\n🎯 Generando variantes para nuevas tallas...')
    for (const size of newSizes) {
      for (const color of existingColors) {
        const sku = `${productId}-${size}-${color.name.toLowerCase()}`
        
        // Verificar que no existe ya
        const existingVariant = product.variants.find(v => v.sku === sku)
        if (!existingVariant) {
          variantsToCreate.push({
            sku: sku,
            productId: productId,
            size: size,
            colorName: color.name,
            colorHex: color.hex,
            stock: 10, // Stock inicial
            price: product.basePrice,
            isActive: true,
            images: '[]'
          })
          console.log(`  ➕ ${size.toUpperCase()} - ${color.name}`)
        } else {
          console.log(`  ⏭️  ${size.toUpperCase()} - ${color.name} (ya existe)`)
        }
      }
    }
    
    // 2. Crear nuevos colores con tallas existentes
    console.log('\n🎨 Generando variantes para nuevos colores...')
    for (const color of newColors) {
      for (const size of existingSizes) {
        const sku = `${productId}-${size}-${color.name.toLowerCase()}`
        
        // Verificar que no existe ya
        const existingVariant = product.variants.find(v => v.sku === sku)
        if (!existingVariant) {
          variantsToCreate.push({
            sku: sku,
            productId: productId,
            size: size,
            colorName: color.name,
            colorHex: color.hex,
            stock: 10, // Stock inicial
            price: product.basePrice,
            isActive: true,
            images: '[]'
          })
          console.log(`  ➕ ${size.toUpperCase()} - ${color.name}`)
        } else {
          console.log(`  ⏭️  ${size.toUpperCase()} - ${color.name} (ya existe)`)
        }
      }
    }
    
    // 3. Crear nuevas tallas con nuevos colores
    console.log('\n🆕 Generando variantes para nuevas tallas + nuevos colores...')
    for (const size of newSizes) {
      for (const color of newColors) {
        const sku = `${productId}-${size}-${color.name.toLowerCase()}`
        
        // Verificar que no existe ya
        const existingVariant = product.variants.find(v => v.sku === sku)
        if (!existingVariant) {
          variantsToCreate.push({
            sku: sku,
            productId: productId,
            size: size,
            colorName: color.name,
            colorHex: color.hex,
            stock: 10, // Stock inicial
            price: product.basePrice,
            isActive: true,
            images: '[]'
          })
          console.log(`  ➕ ${size.toUpperCase()} - ${color.name}`)
        } else {
          console.log(`  ⏭️  ${size.toUpperCase()} - ${color.name} (ya existe)`)
        }
      }
    }
    
    console.log(`\n📊 Resumen:`)
    console.log(`  - Variantes actuales: ${product.variants.length}`)
    console.log(`  - Variantes a crear: ${variantsToCreate.length}`)
    console.log(`  - Total después: ${product.variants.length + variantsToCreate.length}`)
    
    if (variantsToCreate.length === 0) {
      console.log('\n✅ No hay nuevas variantes que crear. Todas ya existen.')
      return
    }
    
    // Mostrar confirmación
    console.log('\n🤔 ¿Confirmas la creación de estas variantes?')
    console.log('Presiona Ctrl+C para cancelar o cualquier tecla para continuar...')
    
    // Esperar confirmación (en un entorno real podrías usar readline)
    await new Promise(resolve => {
      process.stdin.once('data', () => resolve())
    })
    
    console.log('\n💾 Creando variantes en la base de datos...')
    
    // Crear todas las variantes
    let created = 0
    for (const variantData of variantsToCreate) {
      try {
        const newVariant = await db.productVariant.create({
          data: variantData
        })
        
        console.log(`  ✅ Creada: ${newVariant.sku}`)
        created++
      } catch (error) {
        console.log(`  ❌ Error creando ${variantData.sku}:`, error.message)
      }
    }
    
    console.log(`\n🎉 ¡Proceso completado!`)
    console.log(`  - Variantes creadas exitosamente: ${created}`)
    console.log(`  - Errores: ${variantsToCreate.length - created}`)
    
    // Verificar el resultado final
    const updatedProduct = await db.product.findUnique({
      where: { id: productId },
      include: {
        variants: {
          orderBy: [
            { size: 'asc' },
            { colorName: 'asc' }
          ]
        }
      }
    })
    
    console.log(`\n📋 Estado final del producto:`)
    console.log(`  - Total de variantes: ${updatedProduct.variants.length}`)
    
    // Mostrar un resumen por talla y color
    const sizeColorMatrix = {}
    updatedProduct.variants.forEach(variant => {
      if (!sizeColorMatrix[variant.size]) {
        sizeColorMatrix[variant.size] = []
      }
      sizeColorMatrix[variant.size].push(variant.colorName)
    })
    
    console.log('\n📊 Matriz de tallas y colores:')
    Object.keys(sizeColorMatrix).sort().forEach(size => {
      console.log(`  ${size.toUpperCase()}: ${sizeColorMatrix[size].join(', ')}`)
    })
    
  } catch (error) {
    console.error('❌ Error en el proceso:', error)
  } finally {
    await db.$disconnect()
  }
}

// Ejecutar el script si se llama directamente
if (require.main === module) {
  addVariants()
}

module.exports = { addVariants }