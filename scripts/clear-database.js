const { db } = require('../src/lib/db');
async function clearDatabase() {
  console.log('🧹 Iniciando limpieza de base de datos...');
  
  try {
    // Get admin user before clearing (if exists)
    let adminUser = await db.user.findUnique({
      where: { email: 'admin@lovilike.es' }
    });
    
    if (!adminUser) {
      console.log('⚠️  Usuario admin no encontrado. Creando usuario admin...');
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      adminUser = await db.user.create({
        data: {
          email: 'admin@lovilike.es',
          name: 'Administrador',
          role: 'SUPER_ADMIN',
          password: hashedPassword,
          emailVerified: new Date()
        }
      });
      console.log(`✅ Usuario admin creado: ${adminUser.email}`);
    } else {
      console.log(`✅ Usuario admin encontrado: ${adminUser.email}`);
    }
    
    // Clear tables in order (respecting foreign key constraints)
    const clearOrder = [
      // Financial and order related
      'financialTransaction',
      'orderItemAllocation', 
      'brandStockMovement',
      'brandStock',
      'stockReservation',
      'stockAlert',
      'invoice',
      'personalizationOrder',
      'orderItem',
      'order',
      
      // Personalization system
      'personalizationTemplateArea',
      'personalizationAreaTemplate',
      'personalizationArea',
      'personalizationMockup',
      'personalization',
      'personalizationTemplate',
      'personalizationCategory',
      
      // Products and inventory
      'inventoryMovement',
      'demandForecast',
      'productVariant',
      'productCategory',
      'productSupplier',
      'product',
      
      // Materials and suppliers
      'materialMovement',
      'material',
      'purchaseOrder',
      'supplier',
      
      // Workshop
      'processEquipment',
      'processMaterial', 
      'processStep',
      'workshopProcess',
      'processTemplate',
      
      // Menu and categories
      'menuItem',
      'menu',
      'category',
      
      // Design assets
      'designAsset',
      
      // Other
      'contactSubmission',
      'discount',
      'shippingMethod',
      'setting',
      'financialCategory',
      'notification',
      'address',
      
      // Auth related (except the admin user)
      'account',
      'session',
      'verificationToken'
    ];
    
    // Clear each table
    for (const table of clearOrder) {
      try {
        const result = await db[table].deleteMany({});
        console.log(`✅ Tabla ${table}: ${result.count} registros eliminados`);
      } catch (error) {
        console.log(`⚠️  Error clearing ${table}:`, error.message);
      }
    }
    
    // Clear all users except admin
    const deletedUsers = await db.user.deleteMany({
      where: {
        email: {
          not: 'admin@lovilike.es'
        }
      }
    });
    
    console.log(`✅ Usuarios eliminados: ${deletedUsers.count} (conservando admin@lovilike.es)`);
    
    // Reset sequences/auto-increment if needed (PostgreSQL)
    console.log('🔄 Reiniciando contadores...');
    
    // Get all tables and reset sequences
    const tables = [
      'orders', 'products', 'product_variants', 'categories', 
      'orders', 'order_items', 'invoices', 'personalizations',
      'personalization_mockups', 'personalization_orders',
      'materials', 'suppliers', 'financial_transactions',
      'discounts', 'contact_submissions', 'notifications'
    ];
    
    for (const table of tables) {
      try {
        await db.$executeRawUnsafe(`ALTER SEQUENCE ${table}_id_seq RESTART WITH 1;`);
      } catch (error) {
        // Some tables might not have sequences, ignore errors
      }
    }
    
    console.log('✅ Base de datos limpiada exitosamente');
    console.log(`✅ Usuario admin conservado: ${adminUser.email}`);
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
  } finally {
    await db.$disconnect();
  }
}

clearDatabase();