import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  // 1. Crear usuario administrador
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@lovilike.es' },
    update: {},
    create: {
      email: 'admin@lovilike.es',
      name: 'Administrador Lovilike',
      password: hashedPassword,
      role: 'ADMIN',
      phone: '611066997',
    },
  })

  console.log('✅ Usuario administrador creado:', admin.email)

  // 2. Crear categorías básicas
  const categories = [
    {
      name: 'Textiles DTF',
      slug: 'textiles-dtf',
      description: 'Camisetas, sudaderas y textiles personalizados con técnica DTF',
      sortOrder: 1,
    },
    {
      name: 'Sublimación',
      slug: 'sublimacion',
      description: 'Productos rígidos personalizados con sublimación',
      sortOrder: 2,
    },
    {
      name: 'Corte Láser',
      slug: 'corte-laser',
      description: 'Productos de madera y acrílico con corte láser',
      sortOrder: 3,
    },
    {
      name: 'Eventos Especiales',
      slug: 'eventos-especiales',
      description: 'Detalles para bodas, comuniones, bautizos y celebraciones',
      sortOrder: 4,
    },
    {
      name: 'Empresas',
      slug: 'empresas',
      description: 'Productos corporativos y ropa laboral personalizada',
      sortOrder: 5,
    },
  ]

  const createdCategories = []
  for (const category of categories) {
    const created = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    })
    createdCategories.push(created)
  }

  console.log('✅ Categorías creadas:', createdCategories.length)

  // 3. Crear productos de ejemplo
  const products = [
    {
      name: 'Camiseta Básica DTF',
      slug: 'camiseta-basica-dtf',
      description: 'Camiseta 100% algodón ideal para personalización DTF. Disponible en múltiples colores y tallas.',
      basePrice: 12.99,
      personalizationType: 'DTF' as const,
      materialType: 'Algodón 100%',
      categoryId: createdCategories[0].id, // Textiles DTF
      images: JSON.stringify([
        'https://example.com/camiseta-blanca.jpg',
        'https://example.com/camiseta-negra.jpg',
      ]),
      featured: true,
      variants: [
        { size: 'XS', color: 'Blanco', stock: 25, price: 12.99 },
        { size: 'S', color: 'Blanco', stock: 30, price: 12.99 },
        { size: 'M', color: 'Blanco', stock: 40, price: 12.99 },
        { size: 'L', color: 'Blanco', stock: 35, price: 12.99 },
        { size: 'XL', color: 'Blanco', stock: 20, price: 12.99 },
        { size: 'XS', color: 'Negro', stock: 15, price: 12.99 },
        { size: 'S', color: 'Negro', stock: 25, price: 12.99 },
        { size: 'M', color: 'Negro', stock: 30, price: 12.99 },
        { size: 'L', color: 'Negro', stock: 25, price: 12.99 },
        { size: 'XL', color: 'Negro', stock: 15, price: 12.99 },
      ]
    },
    {
      name: 'Sudadera con Capucha',
      slug: 'sudadera-con-capucha',
      description: 'Sudadera premium con capucha, perfecta para diseños DTF de gran formato.',
      basePrice: 24.99,
      personalizationType: 'DTF' as const,
      materialType: 'Algodón/Poliéster 80/20',
      categoryId: createdCategories[0].id,
      images: JSON.stringify([
        'https://example.com/sudadera-gris.jpg',
        'https://example.com/sudadera-azul.jpg',
      ]),
      variants: [
        { size: 'S', color: 'Gris', stock: 20, price: 24.99 },
        { size: 'M', color: 'Gris', stock: 25, price: 24.99 },
        { size: 'L', color: 'Gris', stock: 20, price: 24.99 },
        { size: 'XL', color: 'Gris', stock: 15, price: 24.99 },
      ]
    },
    {
      name: 'Taza Personalizada',
      slug: 'taza-personalizada',
      description: 'Taza de cerámica blanca de 325ml, ideal para sublimación. Apta para lavavajillas.',
      basePrice: 8.99,
      personalizationType: 'SUBLIMATION' as const,
      materialType: 'Cerámica',
      categoryId: createdCategories[1].id, // Sublimación
      images: JSON.stringify([
        'https://example.com/taza-blanca.jpg',
      ]),
      featured: true,
      variants: [
        { size: '325ml', color: 'Blanco', stock: 50, price: 8.99 },
      ]
    },
    {
      name: 'Llavero de Madera',
      slug: 'llavero-de-madera',
      description: 'Llavero cortado en madera de haya con láser. Múltiples formas disponibles.',
      basePrice: 4.99,
      personalizationType: 'LASER_CUT' as const,
      materialType: 'Madera de Haya',
      categoryId: createdCategories[2].id, // Corte Láser
      images: JSON.stringify([
        'https://example.com/llavero-redondo.jpg',
        'https://example.com/llavero-rectangular.jpg',
      ]),
      variants: [
        { size: 'Redondo', color: 'Natural', stock: 100, price: 4.99 },
        { size: 'Rectangular', color: 'Natural', stock: 80, price: 4.99 },
        { size: 'Corazón', color: 'Natural', stock: 60, price: 5.99 },
      ]
    },
    {
      name: 'Detalle para Boda - Imán',
      slug: 'detalle-boda-iman',
      description: 'Imán personalizado para recuerdo de boda. Incluye nombres y fecha del evento.',
      basePrice: 3.50,
      personalizationType: 'SUBLIMATION' as const,
      materialType: 'MDF + Imán',
      categoryId: createdCategories[3].id, // Eventos Especiales
      images: JSON.stringify([
        'https://example.com/iman-boda.jpg',
      ]),
      variants: [
        { size: '5x5cm', color: 'Blanco', stock: 200, price: 3.50 },
        { size: '7x5cm', color: 'Blanco', stock: 150, price: 4.50 },
      ]
    },
  ]

  for (const product of products) {
    const { variants, ...productData } = product
    
    const created = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        ...productData,
        variants: {
          create: variants.map(variant => ({
            sku: `${product.slug.toUpperCase()}-${variant.size}-${variant.color}`.replace(/\s+/g, ''),
            size: variant.size,
            color: variant.color,
            stock: variant.stock,
            price: variant.price,
          }))
        }
      }
    })
    
    console.log('✅ Producto creado:', created.name)
  }

  // 4. Crear métodos de envío
  const shippingMethods = [
    {
      name: 'Recogida en tienda',
      description: 'Recoge tu pedido en nuestra tienda de Hellín',
      price: 0,
      estimatedDays: 'Inmediato',
    },
    {
      name: 'Envío estándar',
      description: 'Envío a domicilio en 1-2 días laborables',
      price: 4.50,
      estimatedDays: '1-2 días',
    },
    {
      name: 'Envío express',
      description: 'Envío urgente en 24 horas',
      price: 6.50,
      estimatedDays: '24 horas',
    },
  ]

  for (const method of shippingMethods) {
    await prisma.shippingMethod.upsert({
      where: { name: method.name },
      update: {},
      create: method,
    })
  }

  console.log('✅ Métodos de envío creados')

  // 5. Crear algunos descuentos de ejemplo
  const discounts = [
    {
      code: 'BIENVENIDO10',
      name: 'Descuento de bienvenida',
      type: 'PERCENTAGE' as const,
      value: 10,
      minOrderAmount: 20,
      maxUses: 100,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
    },
    {
      code: 'ENVIOGRATIS',
      name: 'Envío gratuito',
      type: 'FREE_SHIPPING' as const,
      value: 0,
      minOrderAmount: 50,
      maxUses: null,
      validFrom: new Date(),
      validUntil: null,
    },
  ]

  for (const discount of discounts) {
    await prisma.discount.upsert({
      where: { code: discount.code },
      update: {},
      create: discount,
    })
  }

  console.log('✅ Descuentos creados')

  // 6. Crear algunos clientes de ejemplo
  const customers = [
    {
      name: 'Ana García López',
      email: 'ana.garcia@example.com',
      phone: '666123456',
      role: 'CUSTOMER' as const,
    },
    {
      name: 'Carlos Martín Ruiz',
      email: 'carlos.martin@example.com',
      phone: '677234567',
      role: 'CUSTOMER' as const,
    },
    {
      name: 'María José Fernández',
      email: 'mariajose.fernandez@example.com',
      phone: '688345678',
      role: 'CUSTOMER' as const,
    },
  ]

  for (const customer of customers) {
    await prisma.user.upsert({
      where: { email: customer.email },
      update: {},
      create: customer,
    })
  }

  console.log('✅ Clientes de ejemplo creados')

  console.log('🎉 Seed completado exitosamente!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error en el seed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })