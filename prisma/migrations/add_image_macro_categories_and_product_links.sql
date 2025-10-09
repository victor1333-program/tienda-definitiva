-- Migration: Add Image Macro Categories and Product Links
-- Description: Implements macrocategories, updates image categories structure, and adds image-product linking

-- Create macro categories table
CREATE TABLE "personalization_image_macro_categories" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "personalization_image_macro_categories_pkey" PRIMARY KEY ("id")
);

-- Create indexes for macro categories
CREATE UNIQUE INDEX "personalization_image_macro_categories_slug_key" ON "personalization_image_macro_categories"("slug");
CREATE INDEX "personalization_image_macro_categories_sortOrder_idx" ON "personalization_image_macro_categories"("sortOrder");

-- Create image-product links table
CREATE TABLE "personalization_image_product_links" (
    "id" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "personalization_image_product_links_pkey" PRIMARY KEY ("id")
);

-- Create indexes for image-product links
CREATE UNIQUE INDEX "personalization_image_product_links_imageId_productId_key" ON "personalization_image_product_links"("imageId", "productId");
CREATE INDEX "personalization_image_product_links_imageId_idx" ON "personalization_image_product_links"("imageId");
CREATE INDEX "personalization_image_product_links_productId_idx" ON "personalization_image_product_links"("productId");
CREATE INDEX "personalization_image_product_links_isActive_idx" ON "personalization_image_product_links"("isActive");

-- Update existing personalization_image_categories table
ALTER TABLE "personalization_image_categories" RENAME COLUMN "category" TO "slug";
ALTER TABLE "personalization_image_categories" RENAME COLUMN "label" TO "name";
ALTER TABLE "personalization_image_categories" ADD COLUMN "description" TEXT;
ALTER TABLE "personalization_image_categories" ADD COLUMN "macroCategoryId" TEXT;
ALTER TABLE "personalization_image_categories" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "personalization_image_categories" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

-- Create indexes for updated categories table
CREATE INDEX "personalization_image_categories_macroCategoryId_idx" ON "personalization_image_categories"("macroCategoryId");
CREATE INDEX "personalization_image_categories_sortOrder_idx" ON "personalization_image_categories"("sortOrder");

-- Update personalization_images table structure
ALTER TABLE "personalization_images" RENAME COLUMN "category" TO "categorySlug";
ALTER TABLE "personalization_images" ADD COLUMN "categoryId" TEXT;
ALTER TABLE "personalization_images" ADD COLUMN "macroCategoryId" TEXT;
ALTER TABLE "personalization_images" ADD COLUMN "thumbnailUrl" TEXT;
ALTER TABLE "personalization_images" ADD COLUMN "width" INTEGER;
ALTER TABLE "personalization_images" ADD COLUMN "height" INTEGER;
ALTER TABLE "personalization_images" ADD COLUMN "isPublic" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "personalization_images" DROP COLUMN "assignedProducts";

-- Create indexes for updated images table
CREATE INDEX "personalization_images_categoryId_idx" ON "personalization_images"("categoryId");
CREATE INDEX "personalization_images_macroCategoryId_idx" ON "personalization_images"("macroCategoryId");
CREATE INDEX "personalization_images_isPublic_idx" ON "personalization_images"("isPublic");

-- Update existing data: link old categories to new structure
UPDATE "personalization_images" 
SET "categoryId" = (
    SELECT "id" 
    FROM "personalization_image_categories" 
    WHERE "personalization_image_categories"."slug" = "personalization_images"."categorySlug"
);

-- Drop the old categorySlug column (but first we need to ensure all data is migrated)
-- This will be done in a separate step to be safe

-- Add foreign key constraints
ALTER TABLE "personalization_image_categories" ADD CONSTRAINT "personalization_image_categories_macroCategoryId_fkey" FOREIGN KEY ("macroCategoryId") REFERENCES "personalization_image_macro_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "personalization_images" ADD CONSTRAINT "personalization_images_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "personalization_image_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "personalization_images" ADD CONSTRAINT "personalization_images_macroCategoryId_fkey" FOREIGN KEY ("macroCategoryId") REFERENCES "personalization_image_macro_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "personalization_image_product_links" ADD CONSTRAINT "personalization_image_product_links_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "personalization_images"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "personalization_image_product_links" ADD CONSTRAINT "personalization_image_product_links_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Insert default macro categories
INSERT INTO "personalization_image_macro_categories" ("id", "slug", "name", "description", "sortOrder", "isActive") VALUES
('macro_sports', 'deportes', 'Deportes', 'Imágenes relacionadas con deportes y actividades físicas', 1, true),
('macro_animals', 'animales', 'Animales', 'Imágenes de animales domésticos y salvajes', 2, true),
('macro_nature', 'naturaleza', 'Naturaleza', 'Paisajes, plantas y elementos naturales', 3, true),
('macro_business', 'negocios', 'Negocios', 'Imágenes corporativas y de negocios', 4, true),
('macro_art', 'arte', 'Arte y Diseño', 'Elementos artísticos y de diseño', 5, true),
('macro_technology', 'tecnologia', 'Tecnología', 'Dispositivos y elementos tecnológicos', 6, true),
('macro_food', 'comida', 'Comida y Bebidas', 'Alimentos y bebidas', 7, true),
('macro_travel', 'viajes', 'Viajes', 'Destinos turísticos y elementos de viaje', 8, true),
('macro_fashion', 'moda', 'Moda', 'Elementos de moda y estilo', 9, true),
('macro_general', 'general', 'General', 'Imágenes de categoría general', 10, true);

-- Update existing categories to link with macro categories
UPDATE "personalization_image_categories" SET "macroCategoryId" = 'macro_sports' WHERE "slug" = 'sports';
UPDATE "personalization_image_categories" SET "macroCategoryId" = 'macro_animals' WHERE "slug" = 'animals';
UPDATE "personalization_image_categories" SET "macroCategoryId" = 'macro_nature' WHERE "slug" = 'nature';
UPDATE "personalization_image_categories" SET "macroCategoryId" = 'macro_business' WHERE "slug" = 'business';
UPDATE "personalization_image_categories" SET "macroCategoryId" = 'macro_art' WHERE "slug" = 'art';
UPDATE "personalization_image_categories" SET "macroCategoryId" = 'macro_technology' WHERE "slug" = 'technology';
UPDATE "personalization_image_categories" SET "macroCategoryId" = 'macro_food' WHERE "slug" = 'food';
UPDATE "personalization_image_categories" SET "macroCategoryId" = 'macro_travel' WHERE "slug" = 'travel';
UPDATE "personalization_image_categories" SET "macroCategoryId" = 'macro_fashion' WHERE "slug" = 'fashion';
UPDATE "personalization_image_categories" SET "macroCategoryId" = 'macro_general' WHERE "slug" = 'general';

-- Add subcategories for sports (example)
INSERT INTO "personalization_image_categories" ("id", "slug", "name", "description", "macroCategoryId", "sortOrder", "isActive") VALUES
('cat_football', 'futbol', 'Fútbol', 'Imágenes relacionadas con fútbol', 'macro_sports', 1, true),
('cat_basketball', 'baloncesto', 'Baloncesto', 'Imágenes relacionadas con baloncesto', 'macro_sports', 2, true),
('cat_tennis', 'tenis', 'Tenis', 'Imágenes relacionadas con tenis', 'macro_sports', 3, true),
('cat_running', 'atletismo', 'Atletismo', 'Imágenes relacionadas con atletismo y running', 'macro_sports', 4, true);