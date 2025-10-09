-- CreateTable
CREATE TABLE "variant_side_images" (
    "id" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "sideId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "variant_side_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "variant_side_images_variantId_sideId_key" ON "variant_side_images"("variantId", "sideId");

-- AddForeignKey
ALTER TABLE "variant_side_images" ADD CONSTRAINT "variant_side_images_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "variant_side_images" ADD CONSTRAINT "variant_side_images_sideId_fkey" FOREIGN KEY ("sideId") REFERENCES "product_sides"("id") ON DELETE CASCADE ON UPDATE CASCADE;