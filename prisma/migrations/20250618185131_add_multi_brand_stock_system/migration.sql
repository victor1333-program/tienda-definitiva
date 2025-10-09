-- CreateEnum
CREATE TYPE "BrandMovementType" AS ENUM ('PURCHASE', 'SALE', 'ADJUSTMENT', 'TRANSFER', 'RETURN', 'DAMAGE', 'EXPIRED', 'RECOUNT');

-- CreateEnum
CREATE TYPE "AllocationStatus" AS ENUM ('ALLOCATED', 'FULFILLED', 'CANCELLED', 'RETURNED');

-- CreateTable
CREATE TABLE "brand_stocks" (
    "id" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "supplierId" TEXT,
    "supplierSku" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "minStock" INTEGER NOT NULL DEFAULT 5,
    "maxStock" INTEGER,
    "costPrice" DOUBLE PRECISION NOT NULL,
    "salePrice" DOUBLE PRECISION,
    "location" TEXT,
    "batch" TEXT,
    "expiryDate" TIMESTAMP(3),
    "isPreferred" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastRestock" TIMESTAMP(3),

    CONSTRAINT "brand_stocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brand_stock_movements" (
    "id" TEXT NOT NULL,
    "brandStockId" TEXT NOT NULL,
    "type" "BrandMovementType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "previousStock" INTEGER NOT NULL,
    "newStock" INTEGER NOT NULL,
    "orderId" TEXT,
    "orderItemId" TEXT,
    "reason" TEXT,
    "notes" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "brand_stock_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_item_allocations" (
    "id" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "brandStockId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "allocatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "AllocationStatus" NOT NULL DEFAULT 'ALLOCATED',
    "fulfilledAt" TIMESTAMP(3),

    CONSTRAINT "order_item_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "brand_stocks_variantId_idx" ON "brand_stocks"("variantId");

-- CreateIndex
CREATE INDEX "brand_stocks_brand_idx" ON "brand_stocks"("brand");

-- CreateIndex
CREATE INDEX "brand_stocks_quantity_idx" ON "brand_stocks"("quantity");

-- CreateIndex
CREATE INDEX "brand_stocks_isActive_idx" ON "brand_stocks"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "brand_stocks_variantId_brand_batch_key" ON "brand_stocks"("variantId", "brand", "batch");

-- CreateIndex
CREATE INDEX "brand_stock_movements_brandStockId_idx" ON "brand_stock_movements"("brandStockId");

-- CreateIndex
CREATE INDEX "brand_stock_movements_type_idx" ON "brand_stock_movements"("type");

-- CreateIndex
CREATE INDEX "brand_stock_movements_createdAt_idx" ON "brand_stock_movements"("createdAt");

-- CreateIndex
CREATE INDEX "order_item_allocations_orderItemId_idx" ON "order_item_allocations"("orderItemId");

-- CreateIndex
CREATE INDEX "order_item_allocations_brandStockId_idx" ON "order_item_allocations"("brandStockId");

-- AddForeignKey
ALTER TABLE "brand_stocks" ADD CONSTRAINT "brand_stocks_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brand_stocks" ADD CONSTRAINT "brand_stocks_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brand_stock_movements" ADD CONSTRAINT "brand_stock_movements_brandStockId_fkey" FOREIGN KEY ("brandStockId") REFERENCES "brand_stocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brand_stock_movements" ADD CONSTRAINT "brand_stock_movements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item_allocations" ADD CONSTRAINT "order_item_allocations_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "order_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item_allocations" ADD CONSTRAINT "order_item_allocations_brandStockId_fkey" FOREIGN KEY ("brandStockId") REFERENCES "brand_stocks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
