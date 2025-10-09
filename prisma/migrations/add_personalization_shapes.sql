-- Migración para agregar tablas de formas de personalización

-- Crear tabla de formas de personalización
CREATE TABLE "personalization_shapes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "isMask" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isFromLibrary" BOOLEAN NOT NULL DEFAULT false,
    "fileType" TEXT,
    "fileSize" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "personalization_shapes_pkey" PRIMARY KEY ("id")
);

-- Crear tabla de usos de formas
CREATE TABLE "personalization_shape_usages" (
    "id" TEXT NOT NULL,
    "shapeId" TEXT NOT NULL,
    "orderId" TEXT,
    "designId" TEXT,
    "userId" TEXT,
    "context" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "personalization_shape_usages_pkey" PRIMARY KEY ("id")
);

-- Crear índices para optimizar consultas
CREATE INDEX "personalization_shapes_category_idx" ON "personalization_shapes"("category");
CREATE INDEX "personalization_shapes_isMask_idx" ON "personalization_shapes"("isMask");
CREATE INDEX "personalization_shapes_isActive_idx" ON "personalization_shapes"("isActive");

CREATE INDEX "personalization_shape_usages_shapeId_idx" ON "personalization_shape_usages"("shapeId");
CREATE INDEX "personalization_shape_usages_orderId_idx" ON "personalization_shape_usages"("orderId");
CREATE INDEX "personalization_shape_usages_userId_idx" ON "personalization_shape_usages"("userId");

-- Crear llaves foráneas
ALTER TABLE "personalization_shape_usages" ADD CONSTRAINT "personalization_shape_usages_shapeId_fkey" FOREIGN KEY ("shapeId") REFERENCES "personalization_shapes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "personalization_shape_usages" ADD CONSTRAINT "personalization_shape_usages_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "personalization_shape_usages" ADD CONSTRAINT "personalization_shape_usages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;