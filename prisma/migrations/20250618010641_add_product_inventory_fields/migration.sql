-- AlterTable
ALTER TABLE "products" ADD COLUMN     "brand" TEXT,
ADD COLUMN     "directStock" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "minStock" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "stock" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "supplier" TEXT,
ADD COLUMN     "trackInventory" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "advanced_designs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "designData" TEXT,
    "pricingData" TEXT,
    "previewSettings" TEXT,
    "customizationAreas" TEXT,
    "userId" TEXT NOT NULL,
    "productId" TEXT,
    "variantId" TEXT,
    "templateId" TEXT,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "thumbnailUrl" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isDraft" BOOLEAN NOT NULL DEFAULT true,
    "isTemplate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "advanced_designs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "advanced_designs_userId_idx" ON "advanced_designs"("userId");

-- CreateIndex
CREATE INDEX "advanced_designs_productId_idx" ON "advanced_designs"("productId");

-- CreateIndex
CREATE INDEX "advanced_designs_isPublic_idx" ON "advanced_designs"("isPublic");

-- CreateIndex
CREATE INDEX "advanced_designs_isDraft_idx" ON "advanced_designs"("isDraft");

-- AddForeignKey
ALTER TABLE "advanced_designs" ADD CONSTRAINT "advanced_designs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advanced_designs" ADD CONSTRAINT "advanced_designs_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
