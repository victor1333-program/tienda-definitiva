-- Create PersonalizationImage table
CREATE TABLE "personalization_images" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isFromLibrary" BOOLEAN NOT NULL DEFAULT false,
    "fileType" TEXT,
    "fileSize" INTEGER,
    "assignedProducts" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "personalization_images_pkey" PRIMARY KEY ("id")
);

-- Create PersonalizationImageUsage table
CREATE TABLE "personalization_image_usages" (
    "id" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "orderId" TEXT,
    "designId" TEXT,
    "userId" TEXT,
    "context" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "personalization_image_usages_pkey" PRIMARY KEY ("id")
);

-- Create PersonalizationImageCategory table
CREATE TABLE "personalization_image_categories" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "personalization_image_categories_pkey" PRIMARY KEY ("id")
);

-- Create indexes for PersonalizationImage
CREATE INDEX "personalization_images_category_idx" ON "personalization_images"("category");
CREATE INDEX "personalization_images_isActive_idx" ON "personalization_images"("isActive");

-- Create indexes for PersonalizationImageUsage
CREATE INDEX "personalization_image_usages_imageId_idx" ON "personalization_image_usages"("imageId");
CREATE INDEX "personalization_image_usages_orderId_idx" ON "personalization_image_usages"("orderId");
CREATE INDEX "personalization_image_usages_userId_idx" ON "personalization_image_usages"("userId");

-- Create unique constraint for PersonalizationImageCategory
CREATE UNIQUE INDEX "personalization_image_categories_category_key" ON "personalization_image_categories"("category");

-- Add foreign key constraints
ALTER TABLE "personalization_image_usages" ADD CONSTRAINT "personalization_image_usages_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "personalization_images"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "personalization_image_usages" ADD CONSTRAINT "personalization_image_usages_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "personalization_image_usages" ADD CONSTRAINT "personalization_image_usages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;