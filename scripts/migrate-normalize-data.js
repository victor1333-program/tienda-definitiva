#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function migrateProductImages() {
  console.log('🖼️ Migrando imágenes de productos...')
  
  const products = await prisma.product.findMany({
    where: {
      NOT: {
        images: '[]'
      }
    }
  })

  let migrated = 0
  
  for (const product of products) {
    try {
      const images = JSON.parse(product.images || '[]')
      
      if (Array.isArray(images) && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const imageUrl = images[i]
          if (typeof imageUrl === 'string' && imageUrl.trim()) {
            await prisma.productImage.create({
              data: {
                productId: product.id,
                url: imageUrl.trim(),
                sortOrder: i,
                isPrimary: i === 0
              }
            })
          }
        }
        migrated++
        console.log(`✅ Producto ${product.name}: ${images.length} imágenes migradas`)
      }
    } catch (error) {
      console.error(`❌ Error migrando imágenes del producto ${product.id}:`, error.message)
    }
  }
  
  console.log(`🎉 ${migrated} productos con imágenes migrados exitosamente\n`)
}

async function migrateProductVideos() {
  console.log('🎬 Migrando videos de productos...')
  
  const products = await prisma.product.findMany({
    where: {
      NOT: {
        videos: '[]'
      }
    }
  })

  let migrated = 0
  
  for (const product of products) {
    try {
      const videos = JSON.parse(product.videos || '[]')
      
      if (Array.isArray(videos) && videos.length > 0) {
        for (let i = 0; i < videos.length; i++) {
          const videoUrl = videos[i]
          if (typeof videoUrl === 'string' && videoUrl.trim()) {
            await prisma.productVideo.create({
              data: {
                productId: product.id,
                url: videoUrl.trim(),
                title: `Video ${i + 1}`,
                sortOrder: i
              }
            })
          }
        }
        migrated++
        console.log(`✅ Producto ${product.name}: ${videos.length} videos migrados`)
      }
    } catch (error) {
      console.error(`❌ Error migrando videos del producto ${product.id}:`, error.message)
    }
  }
  
  console.log(`🎉 ${migrated} productos con videos migrados exitosamente\n`)
}

async function migrateProductDocuments() {
  console.log('📄 Migrando documentos de productos...')
  
  const products = await prisma.product.findMany({
    where: {
      NOT: {
        documents: '[]'
      }
    }
  })

  let migrated = 0
  
  for (const product of products) {
    try {
      const documents = JSON.parse(product.documents || '[]')
      
      if (Array.isArray(documents) && documents.length > 0) {
        for (let i = 0; i < documents.length; i++) {
          const docUrl = documents[i]
          if (typeof docUrl === 'string' && docUrl.trim()) {
            const fileExtension = docUrl.split('.').pop()?.toLowerCase() || 'unknown'
            await prisma.productDocument.create({
              data: {
                productId: product.id,
                url: docUrl.trim(),
                title: `Documento ${i + 1}`,
                fileType: fileExtension,
                sortOrder: i
              }
            })
          }
        }
        migrated++
        console.log(`✅ Producto ${product.name}: ${documents.length} documentos migrados`)
      }
    } catch (error) {
      console.error(`❌ Error migrando documentos del producto ${product.id}:`, error.message)
    }
  }
  
  console.log(`🎉 ${migrated} productos con documentos migrados exitosamente\n`)
}

async function migrateQuantityPricing() {
  console.log('💰 Migrando precios por cantidad...')
  
  const products = await prisma.product.findMany({
    where: {
      hasQuantityPricing: true,
      NOT: {
        quantityPrices: '[]'
      }
    }
  })

  let migrated = 0
  
  for (const product of products) {
    try {
      const quantityPrices = JSON.parse(product.quantityPrices || '[]')
      
      if (Array.isArray(quantityPrices) && quantityPrices.length > 0) {
        for (const priceRule of quantityPrices) {
          if (priceRule.minQuantity && priceRule.pricePerUnit) {
            await prisma.productQuantityPrice.create({
              data: {
                productId: product.id,
                minQuantity: parseInt(priceRule.minQuantity),
                maxQuantity: priceRule.maxQuantity ? parseInt(priceRule.maxQuantity) : null,
                pricePerUnit: parseFloat(priceRule.pricePerUnit),
                discountType: priceRule.discountType || 'PERCENTAGE'
              }
            })
          }
        }
        migrated++
        console.log(`✅ Producto ${product.name}: ${quantityPrices.length} reglas de precio migradas`)
      }
    } catch (error) {
      console.error(`❌ Error migrando precios del producto ${product.id}:`, error.message)
    }
  }
  
  console.log(`🎉 ${migrated} productos con precios por cantidad migrados exitosamente\n`)
}

async function migrateVariantImages() {
  console.log('🖼️ Migrando imágenes de variantes...')
  
  const variants = await prisma.productVariant.findMany({
    where: {
      NOT: {
        images: '[]'
      }
    }
  })

  let migrated = 0
  
  for (const variant of variants) {
    try {
      const images = JSON.parse(variant.images || '[]')
      
      if (Array.isArray(images) && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const imageUrl = images[i]
          if (typeof imageUrl === 'string' && imageUrl.trim()) {
            await prisma.productVariantImage.create({
              data: {
                variantId: variant.id,
                url: imageUrl.trim(),
                sortOrder: i,
                isPrimary: i === 0
              }
            })
          }
        }
        migrated++
        console.log(`✅ Variante ${variant.sku}: ${images.length} imágenes migradas`)
      }
    } catch (error) {
      console.error(`❌ Error migrando imágenes de variante ${variant.id}:`, error.message)
    }
  }
  
  console.log(`🎉 ${migrated} variantes con imágenes migradas exitosamente\n`)
}

async function migrateMarketingTags() {
  console.log('🏷️ Migrando tags de marketing...')
  
  const designVariants = await prisma.productDesignVariant.findMany({
    where: {
      NOT: {
        marketingTags: {
          equals: []
        }
      }
    }
  })

  const tagMap = new Map()
  let migrated = 0
  
  for (const variant of designVariants) {
    try {
      const tags = variant.marketingTags || []
      
      if (Array.isArray(tags) && tags.length > 0) {
        for (const tagName of tags) {
          if (typeof tagName === 'string' && tagName.trim()) {
            // Buscar o crear el tag
            let tag = tagMap.get(tagName.trim())
            if (!tag) {
              tag = await prisma.marketingTag.upsert({
                where: { name: tagName.trim() },
                create: { name: tagName.trim() },
                update: {}
              })
              tagMap.set(tagName.trim(), tag)
            }
            
            // Crear el link
            await prisma.designVariantTagLink.upsert({
              where: {
                designVariantId_tagId: {
                  designVariantId: variant.id,
                  tagId: tag.id
                }
              },
              create: {
                designVariantId: variant.id,
                tagId: tag.id
              },
              update: {}
            })
          }
        }
        migrated++
        console.log(`✅ Design variant ${variant.name}: ${tags.length} tags migrados`)
      }
    } catch (error) {
      console.error(`❌ Error migrando tags del design variant ${variant.id}:`, error.message)
    }
  }
  
  console.log(`🎉 ${migrated} design variants con tags migrados exitosamente\n`)
}

async function migrateFinancialTags() {
  console.log('💰 Migrando tags de transacciones financieras...')
  
  const transactions = await prisma.financialTransaction.findMany({
    where: {
      NOT: {
        tags: {
          equals: []
        }
      }
    }
  })

  const tagMap = new Map()
  let migrated = 0
  
  for (const transaction of transactions) {
    try {
      const tags = transaction.tags || []
      
      if (Array.isArray(tags) && tags.length > 0) {
        for (const tagName of tags) {
          if (typeof tagName === 'string' && tagName.trim()) {
            // Buscar o crear el tag
            let tag = tagMap.get(tagName.trim())
            if (!tag) {
              tag = await prisma.financialTransactionTag.upsert({
                where: { name: tagName.trim() },
                create: { name: tagName.trim() },
                update: {}
              })
              tagMap.set(tagName.trim(), tag)
            }
            
            // Crear el link
            await prisma.transactionTagLink.upsert({
              where: {
                transactionId_tagId: {
                  transactionId: transaction.id,
                  tagId: tag.id
                }
              },
              create: {
                transactionId: transaction.id,
                tagId: tag.id
              },
              update: {}
            })
          }
        }
        migrated++
        console.log(`✅ Transacción ${transaction.description}: ${tags.length} tags migrados`)
      }
    } catch (error) {
      console.error(`❌ Error migrando tags de transacción ${transaction.id}:`, error.message)
    }
  }
  
  console.log(`🎉 ${migrated} transacciones con tags migradas exitosamente\n`)
}

async function main() {
  console.log('🚀 Iniciando migración de normalización de datos...\n')
  
  try {
    await migrateProductImages()
    await migrateProductVideos() 
    await migrateProductDocuments()
    await migrateQuantityPricing()
    await migrateVariantImages()
    await migrateMarketingTags()
    await migrateFinancialTags()
    
    console.log('✨ ¡Migración de normalización completada exitosamente!')
    console.log('\n📊 Próximos pasos recomendados:')
    console.log('1. Verificar que los datos se migraron correctamente')
    console.log('2. Actualizar el código de la aplicación para usar las nuevas tablas')
    console.log('3. Eliminar los campos de arrays JSON obsoletos del schema')
    console.log('4. Ejecutar otro push de la base de datos')
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()