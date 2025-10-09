-- Migración para agregar soporte de coordenadas relativas en áreas de impresión
-- Esto permite que las áreas se mantengan en la misma posición relativa independientemente del tamaño de la imagen

-- Agregar campos para coordenadas relativas
ALTER TABLE "print_areas" 
ADD COLUMN IF NOT EXISTS "isRelativeCoordinates" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "referenceWidth" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "referenceHeight" DOUBLE PRECISION;

-- Comentario explicativo
COMMENT ON COLUMN "print_areas"."isRelativeCoordinates" IS 'Indica si las coordenadas están en formato relativo (porcentajes 0-100)';
COMMENT ON COLUMN "print_areas"."referenceWidth" IS 'Ancho de referencia original usado para calcular las coordenadas relativas';
COMMENT ON COLUMN "print_areas"."referenceHeight" IS 'Alto de referencia original usado para calcular las coordenadas relativas';