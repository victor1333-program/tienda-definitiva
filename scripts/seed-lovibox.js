const { db } = require('../src/lib/db');
async function seedLoviBox() {
  console.log('🎁 Creando datos de ejemplo para el sistema de suscripciones...');
  
  try {
    // Verificar que hay productos disponibles
    const products = await db.product.findMany({
      take: 10
    });
    
    if (products.length === 0) {
      console.log('❌ No hay productos disponibles. Ejecuta primero el seed principal.');
      return;
    }
    
    // Verificar que hay usuarios disponibles
    const users = await db.user.findMany({
      where: {
        role: 'CUSTOMER'
      },
      take: 5
    });
    
    if (users.length === 0) {
      console.log('ℹ️ No hay clientes disponibles. Creando algunos clientes de ejemplo...');
      
      // Crear clientes de ejemplo
      await Promise.all([
        db.user.create({
          data: {
            email: 'maria.garcia@ejemplo.com',
            name: 'María García',
            role: 'CUSTOMER',
            phone: '+34 600 111 111'
          }
        }),
        db.user.create({
          data: {
            email: 'carlos.lopez@ejemplo.com',
            name: 'Carlos López',
            role: 'CUSTOMER',
            phone: '+34 600 222 222'
          }
        }),
        db.user.create({
          data: {
            email: 'ana.martinez@ejemplo.com',
            name: 'Ana Martínez',
            role: 'CUSTOMER',
            phone: '+34 600 333 333'
          }
        }),
        db.user.create({
          data: {
            email: 'david.rodriguez@ejemplo.com',
            name: 'David Rodríguez',
            role: 'CUSTOMER',
            phone: '+34 600 444 444'
          }
        }),
        db.user.create({
          data: {
            email: 'laura.sanchez@ejemplo.com',
            name: 'Laura Sánchez',
            role: 'CUSTOMER',
            phone: '+34 600 555 555'
          }
        })
      ]);
      
      console.log('✅ Creados 5 clientes de ejemplo');
    }
    
    // Obtener clientes actualizados
    const customers = await db.user.findMany({
      where: {
        role: 'CUSTOMER'
      },
      take: 5
    });
    
    // Crear templates de cajas para diferentes meses
    const templates = await Promise.all([
      // Template Febrero - San Valentín
      db.loviBoxTemplate.create({
        data: {
          name: 'Caja Romántica San Valentín',
          slug: 'caja-romantica-san-valentin-2025',
          description: 'Una selección especial de productos románticos perfectos para celebrar el amor',
          level: 'BASIC',
          theme: 'ROMANTIC',
          month: 2,
          year: 2025,
          basicPrice: 19.99,
          premiumPrice: 29.99,
          vipPrice: 39.99,
          status: 'PRODUCTION',
          productionStartDate: new Date('2025-01-15'),
          shippingStartDate: new Date('2025-02-01'),
          products: {
            create: [
              {
                productId: products[0].id,
                quantity: 1,
                costPerUnit: 8.50,
                isPersonalizable: true,
                personalizationCost: 3.00,
                displayOrder: 1,
                isMainProduct: true,
                productionNotes: 'Personalización con mensaje romántico'
              },
              {
                productId: products[1].id,
                quantity: 1,
                costPerUnit: 4.50,
                isPersonalizable: true,
                personalizationCost: 2.00,
                displayOrder: 2,
                isMainProduct: false,
                productionNotes: 'Sublimación con diseño de corazones'
              }
            ]
          }
        }
      }),
      
      // Template Marzo - Primavera
      db.loviBoxTemplate.create({
        data: {
          name: 'Caja Primaveral',
          slug: 'caja-primaveral-marzo-2025',
          description: 'Productos frescos y coloridos para dar la bienvenida a la primavera',
          level: 'PREMIUM',
          theme: 'SEASONAL',
          month: 3,
          year: 2025,
          basicPrice: 22.99,
          premiumPrice: 32.99,
          vipPrice: 42.99,
          status: 'DESIGN',
          products: {
            create: [
              {
                productId: products[2].id,
                quantity: 1,
                costPerUnit: 2.25,
                isPersonalizable: true,
                personalizationCost: 1.50,
                displayOrder: 1,
                isMainProduct: true,
                productionNotes: 'Diseño floral primaveral'
              },
              {
                productId: products[0].id,
                quantity: 1,
                costPerUnit: 8.50,
                isPersonalizable: true,
                personalizationCost: 3.00,
                displayOrder: 2,
                isMainProduct: false,
                productionNotes: 'Colores pastel de primavera'
              }
            ]
          }
        }
      }),
      
      // Template Abril - Amistad
      db.loviBoxTemplate.create({
        data: {
          name: 'Caja de la Amistad',
          slug: 'caja-amistad-abril-2025',
          description: 'Regalos perfectos para compartir con tus mejores amigos',
          level: 'VIP',
          theme: 'FRIENDSHIP',
          month: 4,
          year: 2025,
          basicPrice: 24.99,
          premiumPrice: 34.99,
          vipPrice: 44.99,
          status: 'PLANNING',
          products: {
            create: [
              {
                productId: products[1].id,
                quantity: 2,
                costPerUnit: 4.50,
                isPersonalizable: true,
                personalizationCost: 2.00,
                displayOrder: 1,
                isMainProduct: true,
                productionNotes: 'Set de 2 tazas personalizadas'
              },
              {
                productId: products[2].id,
                quantity: 2,
                costPerUnit: 2.25,
                isPersonalizable: false,
                displayOrder: 2,
                isMainProduct: false,
                productionNotes: 'Bolsas con mensaje de amistad'
              }
            ]
          }
        }
      })
    ]);
    
    console.log(`✅ Creados ${templates.length} templates de cajas`);
    
    // Crear suscripciones de ejemplo
    const subscriptions = [];
    const levels = ['BASIC', 'PREMIUM', 'VIP'];
    const statuses = ['ACTIVE', 'ACTIVE', 'ACTIVE', 'PAUSED', 'ACTIVE']; // Más activas que pausadas
    
    for (let i = 0; i < customers.length; i++) {
      const customer = customers[i];
      const level = levels[i % levels.length];
      const status = statuses[i % statuses.length];
      
      // Calcular precio según nivel
      let monthlyPrice;
      switch (level) {
        case 'BASIC': monthlyPrice = 19.99; break;
        case 'PREMIUM': monthlyPrice = 29.99; break;
        case 'VIP': monthlyPrice = 39.99; break;
        default: monthlyPrice = 19.99;
      }
      
      // Fecha de siguiente cobro (entre 1-30 días)
      const nextBillingDate = new Date();
      nextBillingDate.setDate(nextBillingDate.getDate() + Math.floor(Math.random() * 30) + 1);
      
      const subscription = await db.loviBoxSubscription.create({
        data: {
          customerId: customer.id,
          level,
          frequency: 'MONTHLY',
          status,
          monthlyPrice,
          nextBillingDate,
          startDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000), // Entre 0-90 días atrás
          shippingAddress: {
            name: customer.name,
            street: `Calle ${customer.name} ${Math.floor(Math.random() * 100) + 1}`,
            city: 'Madrid',
            state: 'Madrid',
            postalCode: '28001',
            country: 'ES'
          },
          totalBoxesReceived: Math.floor(Math.random() * 5),
          totalAmountPaid: Math.floor(Math.random() * 200) + 50,
          preferences: {
            create: {
              preferredColors: ['rosa', 'azul', 'blanco'],
              avoidColors: ['negro'],
              favoriteThemes: level === 'VIP' ? ['ROMANTIC', 'LUXURY'] : ['SEASONAL', 'FRIENDSHIP'],
              includePersonalization: true,
              maxPersonalizationCost: level === 'VIP' ? 10 : level === 'PREMIUM' ? 5 : 3,
              notes: `Cliente ${level.toLowerCase()}, le gustan los diseños elegantes`
            }
          }
        }
      });
      
      subscriptions.push(subscription);
    }
    
    console.log(`✅ Creadas ${subscriptions.length} suscripciones`);
    
    // Crear entregas programadas
    const deliveries = [];
    for (const subscription of subscriptions) {
      if (subscription.status === 'ACTIVE') {
        // Crear 1-3 entregas por suscripción activa
        const numDeliveries = Math.floor(Math.random() * 3) + 1;
        
        for (let i = 0; i < numDeliveries; i++) {
          const template = templates[Math.floor(Math.random() * templates.length)];
          const scheduledDate = new Date();
          scheduledDate.setDate(scheduledDate.getDate() + (i + 1) * 30); // Una cada mes
          
          const deliveryStatuses = ['PENDING', 'PREPARING', 'READY', 'SHIPPED', 'DELIVERED'];
          const status = deliveryStatuses[Math.floor(Math.random() * deliveryStatuses.length)];
          
          const delivery = await db.loviBoxDelivery.create({
            data: {
              subscriptionId: subscription.id,
              templateId: template.id,
              status,
              scheduledDate,
              shippingAddress: subscription.shippingAddress,
              totalValue: subscription.monthlyPrice,
              deliveredDate: status === 'DELIVERED' ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : undefined,
              customerRating: status === 'DELIVERED' ? Math.floor(Math.random() * 2) + 4 : undefined, // 4-5 estrellas
              nfcScanned: status === 'DELIVERED' ? Math.random() > 0.3 : false, // 70% de probabilidad de escaneo
              nfcScanDate: status === 'DELIVERED' && Math.random() > 0.3 ? new Date() : undefined
            }
          });
          
          deliveries.push(delivery);
        }
      }
    }
    
    console.log(`✅ Creadas ${deliveries.length} entregas programadas`);
    
    // Crear pagos de ejemplo
    const payments = [];
    for (const subscription of subscriptions) {
      // 2-6 pagos por suscripción
      const numPayments = Math.floor(Math.random() * 5) + 2;
      
      for (let i = 0; i < numPayments; i++) {
        const billingDate = new Date(subscription.startDate);
        billingDate.setMonth(billingDate.getMonth() + i);
        
        const payment = await db.loviBoxPayment.create({
          data: {
            subscriptionId: subscription.id,
            amount: subscription.monthlyPrice,
            currency: 'EUR',
            status: Math.random() > 0.1 ? 'COMPLETED' : 'PENDING', // 90% completados
            paymentMethod: 'stripe',
            billingDate,
            paymentDate: Math.random() > 0.1 ? billingDate : undefined,
            description: `Suscripción ${subscription.level} - ${billingDate.toLocaleDateString()}`
          }
        });
        
        payments.push(payment);
      }
    }
    
    console.log(`✅ Creados ${payments.length} pagos`);
    
    // Crear analytics diario para los últimos 30 días
    const analyticsEntries = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const analytics = await db.loviBoxAnalytics.create({
        data: {
          date,
          totalSubscriptions: subscriptions.length - Math.floor(i / 10), // Crecimiento gradual
          newSubscriptions: i % 5 === 0 ? Math.floor(Math.random() * 2) + 1 : 0,
          canceledSubscriptions: i % 10 === 0 ? Math.floor(Math.random() * 1) : 0,
          pausedSubscriptions: Math.floor(subscriptions.length * 0.1),
          basicCount: subscriptions.filter(s => s.level === 'BASIC').length,
          premiumCount: subscriptions.filter(s => s.level === 'PREMIUM').length,
          vipCount: subscriptions.filter(s => s.level === 'VIP').length,
          totalRevenue: subscriptions.reduce((sum, s) => sum + s.monthlyPrice, 0),
          averageRevenuePerUser: subscriptions.reduce((sum, s) => sum + s.monthlyPrice, 0) / subscriptions.length,
          monthlyRecurringRevenue: subscriptions.filter(s => s.status === 'ACTIVE').reduce((sum, s) => sum + s.monthlyPrice, 0),
          totalDeliveries: Math.floor(Math.random() * 5) + 1,
          successfulDeliveries: Math.floor(Math.random() * 4) + 1,
          averageRating: 4.2 + Math.random() * 0.8, // Entre 4.2 y 5.0
          nfcScans: Math.floor(Math.random() * 3),
          tasksCompleted: Math.floor(Math.random() * 10) + 5,
          tasksInProgress: Math.floor(Math.random() * 5) + 2,
          averageProductionTime: 2.5 + Math.random() * 2 // Entre 2.5 y 4.5 horas
        }
      });
      
      analyticsEntries.push(analytics);
    }
    
    console.log(`✅ Creadas ${analyticsEntries.length} entradas de analytics`);
    
    console.log('\n🎉 ¡Datos de ejemplo del sistema de suscripciones creados exitosamente!');
    console.log('\n📊 Resumen:');
    console.log(`- ${templates.length} templates de cajas temáticas`);
    console.log(`- ${subscriptions.length} suscripciones (${subscriptions.filter(s => s.status === 'ACTIVE').length} activas)`);
    console.log(`- ${deliveries.length} entregas programadas`);
    console.log(`- ${payments.length} pagos registrados`);
    console.log(`- ${analyticsEntries.length} días de analytics`);
    console.log('\n✅ El sistema de suscripciones está listo para usar');
    
  } catch (error) {
    console.error('❌ Error creando datos de ejemplo:', error);
  } finally {
    await db.$disconnect();
  }
}

seedLoviBox();