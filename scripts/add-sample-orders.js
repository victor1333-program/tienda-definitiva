const { db } = require('../src/lib/db');
async function addSampleOrders() {
  console.log('📦 Creando pedidos de ejemplo...');
  
  try {
    // Get some products and variants
    const products = await db.product.findMany({
      include: {
        variants: true
      }
    });
    
    if (products.length === 0) {
      console.log('❌ No hay productos. Ejecuta primero seed-test-data.js');
      return;
    }
    
    // Create some sample customers (non-admin users)
    const customers = await Promise.all([
      db.user.create({
        data: {
          email: 'cliente1@ejemplo.com',
          name: 'María González',
          role: 'CUSTOMER',
          phone: '+34 600 111 111'
        }
      }),
      db.user.create({
        data: {
          email: 'cliente2@ejemplo.com',
          name: 'Carlos Martín',
          role: 'CUSTOMER',
          phone: '+34 600 222 222'
        }
      }),
      db.user.create({
        data: {
          email: 'cliente3@ejemplo.com',
          name: 'Ana López',
          role: 'CUSTOMER',
          phone: '+34 600 333 333'
        }
      })
    ]);
    
    console.log(`✅ Creados ${customers.length} clientes de ejemplo`);
    
    // Create addresses for customers
    const addresses = [];
    for (const customer of customers) {
      const address = await db.address.create({
        data: {
          userId: customer.id,
          name: `Casa de ${customer.name}`,
          street: `Calle ${customer.name} 123`,
          city: 'Madrid',
          state: 'Madrid',
          postalCode: '28001',
          country: 'ES',
          isDefault: true
        }
      });
      addresses.push(address);
    }
    
    console.log(`✅ Creadas ${addresses.length} direcciones`);
    
    // Create sample orders
    const orderStatuses = ['PENDING', 'CONFIRMED', 'IN_PRODUCTION', 'SHIPPED', 'DELIVERED'];
    const paymentStatuses = ['PENDING', 'PAID'];
    const orderSources = ['ONLINE', 'STORE'];
    
    const orders = [];
    
    for (let i = 0; i < 10; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const address = addresses.find(a => a.userId === customer.id);
      const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
      const paymentStatus = paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];
      const orderSource = orderSources[Math.floor(Math.random() * orderSources.length)];
      
      // Generate order number
      const orderNumber = `LV-${new Date().getFullYear()}-${String(i + 1).padStart(4, '0')}`;
      
      // Calculate order total
      const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 items
      let totalAmount = 0;
      const orderItems = [];
      
      for (let j = 0; j < numItems; j++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const variant = product.variants[Math.floor(Math.random() * product.variants.length)];
        const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 quantity
        const unitPrice = product.basePrice;
        const itemTotal = unitPrice * quantity;
        
        totalAmount += itemTotal;
        
        orderItems.push({
          productId: product.id,
          variantId: variant.id,
          quantity: quantity,
          unitPrice: unitPrice,
          totalPrice: itemTotal,
          productionStatus: 'PENDING'
        });
      }
      
      const shippingCost = totalAmount > 50 ? 0 : 4.95; // Free shipping over 50€
      const taxAmount = (totalAmount + shippingCost) * 0.21; // 21% IVA
      const finalTotal = totalAmount + shippingCost + taxAmount;
      
      // Create order
      const order = await db.order.create({
        data: {
          orderNumber: orderNumber,
          status: status,
          totalAmount: finalTotal,
          shippingCost: shippingCost,
          taxAmount: taxAmount,
          customerEmail: customer.email,
          customerName: customer.name,
          customerPhone: customer.phone || '',
          shippingMethod: shippingCost === 0 ? 'Envío gratuito' : 'Estándar',
          shippingAddress: JSON.stringify({
            name: address.name,
            street: address.street,
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
            country: address.country
          }),
          paymentMethod: 'Tarjeta de crédito',
          paymentStatus: paymentStatus,
          orderSource: orderSource,
          priority: 'MEDIUM',
          userId: customer.id,
          addressId: address.id,
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
        }
      });
      
      // Create order items
      for (const itemData of orderItems) {
        await db.orderItem.create({
          data: {
            ...itemData,
            orderId: order.id
          }
        });
      }
      
      orders.push(order);
    }
    
    console.log(`✅ Creados ${orders.length} pedidos de ejemplo`);
    
    // Create some contact submissions
    const contactSubmissions = await Promise.all([
      db.contactSubmission.create({
        data: {
          name: 'Pedro Ruiz',
          email: 'pedro@ejemplo.com',
          phone: '+34 600 444 444',
          subject: 'Consulta sobre personalización',
          message: 'Hola, me gustaría saber si podéis personalizar camisetas para un evento corporativo de 100 personas.',
          orderType: 'Corporativo',
          status: 'PENDING'
        }
      }),
      db.contactSubmission.create({
        data: {
          name: 'Laura Fernández',
          email: 'laura@ejemplo.com',
          subject: 'Presupuesto para boda',
          message: 'Necesito un presupuesto para 50 tazas personalizadas para mi boda el próximo mes.',
          orderType: 'Evento',
          status: 'IN_PROGRESS',
          adminNotes: 'Enviado presupuesto por email'
        }
      })
    ]);
    
    console.log(`✅ Creadas ${contactSubmissions.length} consultas de contacto`);
    
    // Create some notifications
    const notifications = await Promise.all([
      db.notification.create({
        data: {
          type: 'NEW_ORDER',
          title: 'Nuevo pedido recibido',
          message: `Nuevo pedido ${orders[0].orderNumber} por ${orders[0].totalAmount.toFixed(2)}€`,
          priority: 'HIGH',
          actionUrl: `/admin/orders/${orders[0].id}`,
          metadata: JSON.stringify({ orderId: orders[0].id })
        }
      }),
      db.notification.create({
        data: {
          type: 'CONTACT_FORM',
          title: 'Nueva consulta de contacto',
          message: 'Nueva consulta sobre personalización corporativa',
          priority: 'MEDIUM',
          actionUrl: `/admin/contact/${contactSubmissions[0].id}`,
          metadata: JSON.stringify({ contactId: contactSubmissions[0].id })
        }
      }),
      db.notification.create({
        data: {
          type: 'LOW_STOCK',
          title: 'Stock bajo',
          message: 'Algunas variantes tienen stock bajo',
          priority: 'MEDIUM',
          actionUrl: '/admin/products'
        }
      })
    ]);
    
    console.log(`✅ Creadas ${notifications.length} notificaciones`);
    
    console.log('\n🎉 ¡Pedidos y datos adicionales creados exitosamente!');
    console.log('\n📊 Resumen adicional:');
    console.log(`- ${customers.length} clientes`);
    console.log(`- ${addresses.length} direcciones`);
    console.log(`- ${orders.length} pedidos`);
    console.log(`- ${contactSubmissions.length} consultas`);
    console.log(`- ${notifications.length} notificaciones`);
    
  } catch (error) {
    console.error('❌ Error creando pedidos de ejemplo:', error);
  } finally {
    await db.$disconnect();
  }
}

addSampleOrders();