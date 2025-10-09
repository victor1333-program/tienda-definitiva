-- Migración para cambiar Float a Decimal para precisión monetaria
-- Esto es crítico para evitar errores de redondeo en precios

-- Product table
ALTER TABLE `Product` 
MODIFY COLUMN `basePrice` DECIMAL(10,2) NOT NULL,
MODIFY COLUMN `comparePrice` DECIMAL(10,2),
MODIFY COLUMN `costPrice` DECIMAL(10,2);

-- ProductVariant table
ALTER TABLE `ProductVariant` 
MODIFY COLUMN `price` DECIMAL(10,2) NOT NULL,
MODIFY COLUMN `comparePrice` DECIMAL(10,2),
MODIFY COLUMN `costPrice` DECIMAL(10,2);

-- Order table
ALTER TABLE `Order` 
MODIFY COLUMN `totalAmount` DECIMAL(10,2) NOT NULL,
MODIFY COLUMN `shippingCost` DECIMAL(10,2) DEFAULT 0,
MODIFY COLUMN `taxAmount` DECIMAL(10,2) DEFAULT 0,
MODIFY COLUMN `discountAmount` DECIMAL(10,2) DEFAULT 0;

-- OrderItem table
ALTER TABLE `OrderItem` 
MODIFY COLUMN `price` DECIMAL(10,2) NOT NULL,
MODIFY COLUMN `totalPrice` DECIMAL(10,2) NOT NULL;

-- Invoice table
ALTER TABLE `Invoice` 
MODIFY COLUMN `subtotal` DECIMAL(10,2) NOT NULL,
MODIFY COLUMN `taxAmount` DECIMAL(10,2) DEFAULT 0,
MODIFY COLUMN `totalAmount` DECIMAL(10,2) NOT NULL;

-- FinancialTransaction table
ALTER TABLE `FinancialTransaction` 
MODIFY COLUMN `amount` DECIMAL(10,2) NOT NULL;

-- BrandStock table (crítico para gestión de stock con precios)
ALTER TABLE `BrandStock` 
MODIFY COLUMN `unitCost` DECIMAL(10,2),
MODIFY COLUMN `totalValue` DECIMAL(10,2);

-- Discount table
ALTER TABLE `Discount` 
MODIFY COLUMN `discountAmount` DECIMAL(10,2),
MODIFY COLUMN `minimumAmount` DECIMAL(10,2);

-- LoviBoxSubscription table
ALTER TABLE `LoviBoxSubscription` 
MODIFY COLUMN `price` DECIMAL(10,2) NOT NULL;

-- RecurringTransaction table
ALTER TABLE `RecurringTransaction` 
MODIFY COLUMN `amount` DECIMAL(10,2) NOT NULL;

-- Actualizar índices relacionados con precios
CREATE INDEX idx_product_price_range ON `Product`(`basePrice`, `isActive`);
CREATE INDEX idx_variant_price ON `ProductVariant`(`price`);
CREATE INDEX idx_order_amount ON `Order`(`totalAmount`, `createdAt`);

COMMIT;