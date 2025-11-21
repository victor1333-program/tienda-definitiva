-- AlterTable: Add missing product fields to match schema
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "isPersonalizable" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "personalizationData" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "personalizationSettings" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "variantCombinationsConfig" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "variantGroupsConfig" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "hasDesignVariants" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "defaultDesignVariantId" TEXT;

-- Drop obsolete columns if they exist
ALTER TABLE "products" DROP COLUMN IF EXISTS "canCustomize";
ALTER TABLE "products" DROP COLUMN IF EXISTS "customizationPrice";

-- Create index for isPersonalizable if it doesn't exist
CREATE INDEX IF NOT EXISTS "products_isPersonalizable_isActive_idx" ON "products"("isPersonalizable", "isActive");
