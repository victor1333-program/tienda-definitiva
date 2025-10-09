-- Migración para añadir campo de imágenes a variantes de producto
-- Ejecutar esta migración después de modificar el schema.prisma

-- Añadir columna images a la tabla product_variants
ALTER TABLE product_variants 
ADD COLUMN images TEXT DEFAULT '[]';

-- Comentarios sobre la migración:
-- 1. Se añade el campo 'images' como TEXT para almacenar JSON array de URLs
-- 2. Por defecto se inicializa como array vacío '[]'
-- 3. Las variantes existentes tendrán array vacío, usando las imágenes del producto padre
-- 4. Este campo permitirá a cada variante tener sus propias imágenes específicas

-- Para productos con diferentes colores, esto permitirá mostrar la imagen correcta
-- Por ejemplo: una camiseta roja mostrará fotos de la camiseta roja, no de la azul