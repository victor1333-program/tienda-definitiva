import { db } from '@/lib/db';
import bcrypt from 'bcryptjs'

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  // 1. Crear usuario administrador
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const admin = await db.user.upsert({
    where: { email: 'admin@lovilike.es' },
    update: {
      password: hashedPassword,
      emailVerified: new Date(), // Asegurar que está verificado
    },
    create: {
      email: 'admin@lovilike.es',
      name: 'Administrador Lovilike',
      password: hashedPassword,
      role: 'ADMIN',
      phone: '611066997',
      emailVerified: new Date(), // Marcar como verificado
    },
  })

  console.log('✅ Usuario administrador creado:', admin.email)

  // 2. Crear categorías básicas
  const categories = [
    {
      name: 'Textiles DTF',
      slug: 'textiles-dtf',
      description: 'Camisetas, sudaderas y textiles personalizados con técnica DTF',
      image: '/uploads/categories/textiles-dtf.jpg',
      sortOrder: 1,
    },
    {
      name: 'Sublimación',
      slug: 'sublimacion',
      description: 'Productos rígidos personalizados con sublimación',
      image: '/uploads/categories/sublimacion.jpg',
      sortOrder: 2,
    },
    {
      name: 'Corte Láser',
      slug: 'corte-laser',
      description: 'Productos de madera y acrílico con corte láser',
      image: '/uploads/categories/corte-laser.jpg',
      sortOrder: 3,
    },
    {
      name: 'Eventos Especiales',
      slug: 'eventos-especiales',
      description: 'Detalles para bodas, comuniones, bautizos y celebraciones',
      image: '/uploads/categories/eventos-especiales.jpg',
      sortOrder: 4,
    },
    {
      name: 'Empresas',
      slug: 'empresas',
      description: 'Productos corporativos y ropa laboral personalizada',
      image: '/uploads/categories/empresas.jpg',
      sortOrder: 5,
    },
    {
      name: 'Hogar y Decoración',
      slug: 'hogar-decoracion',
      description: 'Productos decorativos personalizados para el hogar',
      image: '/uploads/categories/hogar-decoracion.jpg',
      sortOrder: 6,
    },
    {
      name: 'Regalos Personalizados',
      slug: 'regalos-personalizados',
      description: 'Regalos únicos y personalizados para cualquier ocasión',
      image: '/uploads/categories/regalos-personalizados.jpg',
      sortOrder: 7,
    },
    {
      name: 'Accesorios',
      slug: 'accesorios',
      description: 'Complementos y accesorios personalizados',
      image: '/uploads/categories/accesorios.jpg',
      sortOrder: 8,
    },
  ]

  const createdCategories = []
  for (const category of categories) {
    const created = await db.category.upsert({
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
      sku: 'CAM-DTF-001',
      description: 'Camiseta 100% algodón ideal para personalización DTF. Disponible en múltiples colores y tallas. Calidad premium con tacto suave y durabilidad garantizada.',
      basePrice: 12.99,
      comparePrice: 15.99,
      costPrice: 8.50,
      materialType: 'Algodón 100%',
      categoryId: createdCategories[0].id, // Textiles DTF
      images: JSON.stringify([
        '/uploads/products/camiseta-dtf-blanca.jpg',
        '/uploads/products/camiseta-dtf-negra.jpg',
        '/uploads/products/camiseta-dtf-colores.jpg',
      ]),
      metaTitle: 'Camiseta Básica DTF Personalizable - Lovilike',
      metaDescription: 'Camiseta 100% algodón premium para personalización DTF. Múltiples colores y tallas disponibles.',
      featured: true,
      variants: [
        { size: 'XS', colorName: 'Blanco', colorHex: '#FFFFFF', stock: 25, price: 12.99 },
        { size: 'S', colorName: 'Blanco', colorHex: '#FFFFFF', stock: 30, price: 12.99 },
        { size: 'M', colorName: 'Blanco', colorHex: '#FFFFFF', stock: 40, price: 12.99 },
        { size: 'L', colorName: 'Blanco', colorHex: '#FFFFFF', stock: 35, price: 12.99 },
        { size: 'XL', colorName: 'Blanco', colorHex: '#FFFFFF', stock: 20, price: 12.99 },
        { size: 'XS', colorName: 'Negro', colorHex: '#000000', stock: 15, price: 12.99 },
        { size: 'S', colorName: 'Negro', colorHex: '#000000', stock: 25, price: 12.99 },
        { size: 'M', colorName: 'Negro', colorHex: '#000000', stock: 30, price: 12.99 },
        { size: 'L', colorName: 'Negro', colorHex: '#000000', stock: 25, price: 12.99 },
        { size: 'XL', colorName: 'Negro', colorHex: '#000000', stock: 15, price: 12.99 },
        { size: 'M', colorName: 'Azul Marino', colorHex: '#001F3F', stock: 20, price: 12.99 },
        { size: 'L', colorName: 'Azul Marino', colorHex: '#001F3F', stock: 18, price: 12.99 },
        { size: 'M', colorName: 'Rojo', colorHex: '#FF4136', stock: 15, price: 12.99 },
        { size: 'L', colorName: 'Rojo', colorHex: '#FF4136', stock: 12, price: 12.99 },
      ]
    },
    {
      name: 'Sudadera con Capucha Premium',
      slug: 'sudadera-con-capucha-premium',
      sku: 'SUD-DTF-001',
      description: 'Sudadera premium con capucha y bolsillo canguro, perfecta para diseños DTF de gran formato. Mezcla de algodón y poliéster para mayor durabilidad y comodidad.',
      basePrice: 24.99,
      comparePrice: 29.99,
      costPrice: 16.50,
      materialType: 'Algodón/Poliéster 80/20',
      categoryId: createdCategories[0].id,
      images: JSON.stringify([
        '/uploads/products/sudadera-gris.jpg',
        '/uploads/products/sudadera-azul.jpg',
        '/uploads/products/sudadera-detalle.jpg',
      ]),
      metaTitle: 'Sudadera con Capucha Premium DTF - Lovilike',
      metaDescription: 'Sudadera premium con capucha para personalización DTF. Calidad superior y comodidad garantizada.',
      variants: [
        { size: 'S', colorName: 'Gris Jaspeado', colorHex: '#808080', stock: 20, price: 24.99 },
        { size: 'M', colorName: 'Gris Jaspeado', colorHex: '#808080', stock: 25, price: 24.99 },
        { size: 'L', colorName: 'Gris Jaspeado', colorHex: '#808080', stock: 20, price: 24.99 },
        { size: 'XL', colorName: 'Gris Jaspeado', colorHex: '#808080', stock: 15, price: 24.99 },
        { size: 'M', colorName: 'Azul Oscuro', colorHex: '#2F4F4F', stock: 18, price: 24.99 },
        { size: 'L', colorName: 'Azul Oscuro', colorHex: '#2F4F4F', stock: 15, price: 24.99 },
      ]
    },
    {
      name: 'Taza Mágica Personalizada',
      slug: 'taza-magica-personalizada',
      sku: 'TAZ-SUB-001',
      description: 'Taza mágica que cambia de color con el calor. Ideal para sublimación con diseños sorpresa. Capacidad 325ml, apta para lavavajillas y microondas.',
      basePrice: 11.99,
      comparePrice: 14.99,
      costPrice: 7.50,
      materialType: 'Cerámica',
      categoryId: createdCategories[1].id, // Sublimación
      images: JSON.stringify([
        '/uploads/products/taza-magica-fria.jpg',
        '/uploads/products/taza-magica-caliente.jpg',
        '/uploads/products/taza-magica-proceso.jpg',
      ]),
      metaTitle: 'Taza Mágica Personalizada - Cambia de Color',
      metaDescription: 'Taza mágica que cambia de color con el calor. Personalizable por sublimación.',
      featured: true,
      variants: [
        { size: '325ml', colorName: 'Negro → Blanco', colorHex: '#000000', stock: 50, price: 11.99 },
        { size: '325ml', colorName: 'Azul → Blanco', colorHex: '#0074D9', stock: 30, price: 11.99 },
      ]
    },
    {
      name: 'Taza Cerámica Clásica',
      slug: 'taza-ceramica-clasica',
      sku: 'TAZ-SUB-002',
      description: 'Taza de cerámica blanca clásica de 325ml, ideal para sublimación. Acabado brillante y resistente. Apta para lavavajillas y microondas.',
      basePrice: 8.99,
      comparePrice: 10.99,
      costPrice: 5.50,
      materialType: 'Cerámica',
      categoryId: createdCategories[1].id,
      images: JSON.stringify([
        '/uploads/products/taza-blanca-clasica.jpg',
        '/uploads/products/taza-blanca-detalle.jpg',
      ]),
      variants: [
        { size: '325ml', colorName: 'Blanco', colorHex: '#FFFFFF', stock: 100, price: 8.99 },
      ]
    },
    {
      name: 'Llavero Personalizado Redondo',
      slug: 'llavero-personalizado-redondo',
      sku: 'LLA-LAS-001',
      description: 'Llavero redondo cortado en madera de haya con láser. Superficie lisa perfecta para grabado láser. Incluye argolla de metal resistente.',
      basePrice: 4.99,
      costPrice: 2.50,
      materialType: 'Madera de Haya',
      categoryId: createdCategories[2].id, // Corte Láser
      images: JSON.stringify([
        '/uploads/products/llavero-redondo-natural.jpg',
        '/uploads/products/llavero-redondo-grabado.jpg',
      ]),
      variants: [
        { size: '4cm diámetro', colorName: 'Natural', colorHex: '#DEB887', stock: 100, price: 4.99 },
        { size: '5cm diámetro', colorName: 'Natural', colorHex: '#DEB887', stock: 80, price: 5.99 },
      ]
    },
    {
      name: 'Llavero Personalizado Rectangular',
      slug: 'llavero-personalizado-rectangular',
      sku: 'LLA-LAS-002',
      description: 'Llavero rectangular de madera de haya cortado con láser. Forma clásica ideal para nombres y frases. Acabado suave y natural.',
      basePrice: 4.99,
      costPrice: 2.50,
      materialType: 'Madera de Haya',
      categoryId: createdCategories[2].id,
      images: JSON.stringify([
        '/uploads/products/llavero-rectangular.jpg',
        '/uploads/products/llavero-rectangular-grabado.jpg',
      ]),
      variants: [
        { size: '6x3cm', colorName: 'Natural', colorHex: '#DEB887', stock: 120, price: 4.99 },
        { size: '8x4cm', colorName: 'Natural', colorHex: '#DEB887', stock: 90, price: 6.99 },
      ]
    },
    {
      name: 'Detalle Boda - Imán Corazón',
      slug: 'detalle-boda-iman-corazon',
      sku: 'BOD-IMA-001',
      description: 'Imán personalizado en forma de corazón para recordatorio de boda. Base de MDF sublimable con imán potente. Incluye nombres y fecha del evento.',
      basePrice: 3.99,
      costPrice: 2.00,
      materialType: 'MDF + Imán',
      categoryId: createdCategories[3].id, // Eventos Especiales
      images: JSON.stringify([
        '/uploads/products/iman-boda-corazon.jpg',
        '/uploads/products/iman-boda-ejemplo.jpg',
      ]),
      variants: [
        { size: '6x6cm', colorName: 'Blanco', colorHex: '#FFFFFF', stock: 200, price: 3.99 },
        { size: '8x8cm', colorName: 'Blanco', colorHex: '#FFFFFF', stock: 150, price: 4.99 },
      ]
    },
    {
      name: 'Invitación Boda Láser',
      slug: 'invitacion-boda-laser',
      sku: 'BOD-INV-001',
      description: 'Invitación de boda cortada con láser en papel premium. Diseño elegante con detalles intrincados. Personalizable con nombres y detalles del evento.',
      basePrice: 8.99,
      comparePrice: 12.99,
      costPrice: 4.50,
      materialType: 'Papel Premium',
      categoryId: createdCategories[3].id,
      images: JSON.stringify([
        '/uploads/products/invitacion-laser-elegante.jpg',
        '/uploads/products/invitacion-laser-detalle.jpg',
      ]),
      variants: [
        { size: '15x21cm', colorName: 'Blanco Perlado', colorHex: '#F8F8FF', stock: 100, price: 8.99 },
        { size: '15x21cm', colorName: 'Crema', colorHex: '#FFFDD0', stock: 80, price: 8.99 },
      ]
    },
    {
      name: 'Polo Empresarial Bordado',
      slug: 'polo-empresarial-bordado',
      sku: 'EMP-POL-001',
      description: 'Polo empresarial de alta calidad con bordado personalizado. Ideal para uniformes corporativos. Tejido transpirable y resistente.',
      basePrice: 18.99,
      comparePrice: 22.99,
      costPrice: 12.50,
      materialType: 'Algodón Piqué',
      categoryId: createdCategories[4].id, // Empresas
      images: JSON.stringify([
        '/uploads/products/polo-azul-marino.jpg',
        '/uploads/products/polo-blanco.jpg',
        '/uploads/products/polo-bordado-detalle.jpg',
      ]),
      variants: [
        { size: 'S', colorName: 'Azul Marino', colorHex: '#001F3F', stock: 30, price: 18.99 },
        { size: 'M', colorName: 'Azul Marino', colorHex: '#001F3F', stock: 40, price: 18.99 },
        { size: 'L', colorName: 'Azul Marino', colorHex: '#001F3F', stock: 35, price: 18.99 },
        { size: 'XL', colorName: 'Azul Marino', colorHex: '#001F3F', stock: 25, price: 18.99 },
        { size: 'S', colorName: 'Blanco', colorHex: '#FFFFFF', stock: 25, price: 18.99 },
        { size: 'M', colorName: 'Blanco', colorHex: '#FFFFFF', stock: 35, price: 18.99 },
        { size: 'L', colorName: 'Blanco', colorHex: '#FFFFFF', stock: 30, price: 18.99 },
        { size: 'XL', colorName: 'Blanco', colorHex: '#FFFFFF', stock: 20, price: 18.99 },
      ]
    },
    {
      name: 'Cuadro Personalizado MDF',
      slug: 'cuadro-personalizado-mdf',
      sku: 'HOG-CUA-001',
      description: 'Cuadro decorativo personalizable en MDF sublimable. Perfecto para fotos familiares, frases inspiradoras o diseños únicos. Incluye sistema de colgado.',
      basePrice: 15.99,
      comparePrice: 19.99,
      costPrice: 8.50,
      materialType: 'MDF Sublimable',
      categoryId: createdCategories[5].id, // Hogar y Decoración
      images: JSON.stringify([
        '/uploads/products/cuadro-mdf-blanco.jpg',
        '/uploads/products/cuadro-mdf-ejemplo.jpg',
      ]),
      featured: true,
      variants: [
        { size: '20x20cm', colorName: 'Blanco', colorHex: '#FFFFFF', stock: 60, price: 15.99 },
        { size: '30x20cm', colorName: 'Blanco', colorHex: '#FFFFFF', stock: 40, price: 19.99 },
        { size: '30x30cm', colorName: 'Blanco', colorHex: '#FFFFFF', stock: 30, price: 24.99 },
      ]
    },
    {
      name: 'Funda Móvil Personalizada',
      slug: 'funda-movil-personalizada',
      sku: 'ACC-FUN-001',
      description: 'Funda para móvil personalizable por sublimación. Compatible con múltiples modelos. Protección completa con acceso a todos los puertos.',
      basePrice: 12.99,
      comparePrice: 16.99,
      costPrice: 6.50,
      materialType: 'TPU + Aluminio',
      categoryId: createdCategories[7].id, // Accesorios
      images: JSON.stringify([
        '/uploads/products/funda-blanca.jpg',
        '/uploads/products/funda-personalizada.jpg',
      ]),
      variants: [
        { size: 'iPhone 13', colorName: 'Blanco', colorHex: '#FFFFFF', stock: 40, price: 12.99 },
        { size: 'iPhone 14', colorName: 'Blanco', colorHex: '#FFFFFF', stock: 45, price: 12.99 },
        { size: 'Samsung S23', colorName: 'Blanco', colorHex: '#FFFFFF', stock: 35, price: 12.99 },
      ]
    },
    {
      name: 'Taza Personalizada Día del Padre',
      slug: 'taza-personalizada-dia-padre',
      sku: 'REG-TAZ-001',
      description: 'Taza especial para el Día del Padre con diseños únicos. Personalizable con fotos y mensajes. Regalo perfecto para papá.',
      basePrice: 9.99,
      comparePrice: 12.99,
      costPrice: 6.00,
      materialType: 'Cerámica',
      categoryId: createdCategories[6].id, // Regalos Personalizados
      images: JSON.stringify([
        '/uploads/products/taza-papa.jpg',
        '/uploads/products/taza-papa-ejemplo.jpg',
      ]),
      variants: [
        { size: '325ml', colorName: 'Blanco', colorHex: '#FFFFFF', stock: 80, price: 9.99 },
      ]
    },
  ]

  for (const product of products) {
    const { variants, categoryId, ...productData } = product
    
    const created = await db.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        ...productData,
        variants: {
          create: variants.map(variant => ({
            sku: `${product.sku}-${variant.size?.replace(/\s+/g, '') || 'STD'}-${variant.colorName?.replace(/\s+/g, '') || 'DEF'}`,
            size: variant.size,
            colorName: variant.colorName,
            colorHex: variant.colorHex,
            colorDisplay: variant.colorName,
            stock: variant.stock,
            price: variant.price,
          }))
        }
      }
    })
    
    // Crear la relación con la categoría después
    await db.productCategory.upsert({
      where: {
        productId_categoryId: {
          productId: created.id,
          categoryId: categoryId,
        }
      },
      update: {},
      create: {
        productId: created.id,
        categoryId: categoryId,
        isPrimary: true,
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
    await db.shippingMethod.upsert({
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
      type: 'PRODUCT_DISCOUNT' as const,
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
    await db.discount.upsert({
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
    await db.user.upsert({
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
    await db.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error en el seed:', e)
    await db.$disconnect()
    process.exit(1)
  })