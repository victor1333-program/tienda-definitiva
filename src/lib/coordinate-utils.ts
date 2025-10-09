/**
 * Utilidades para conversión de coordenadas entre absolutas y relativas
 * Soluciona el problema de desalineación de elementos en diferentes tamaños de imagen
 */

export interface AbsoluteCoordinates {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RelativeCoordinates {
  x: number; // 0-100 (porcentaje)
  y: number; // 0-100 (porcentaje)
  width: number; // 0-100 (porcentaje)
  height: number; // 0-100 (porcentaje)
}

export interface ImageDimensions {
  width: number;
  height: number;
}

/**
 * Convierte coordenadas absolutas (píxeles) a relativas (porcentajes)
 */
export function absoluteToRelative(
  absolute: AbsoluteCoordinates,
  imageDimensions: ImageDimensions
): RelativeCoordinates {
  return {
    x: (absolute.x / imageDimensions.width) * 100,
    y: (absolute.y / imageDimensions.height) * 100,
    width: (absolute.width / imageDimensions.width) * 100,
    height: (absolute.height / imageDimensions.height) * 100,
  };
}

/**
 * Convierte coordenadas relativas (porcentajes) a absolutas (píxeles)
 */
export function relativeToAbsolute(
  relative: RelativeCoordinates,
  imageDimensions: ImageDimensions
): AbsoluteCoordinates {
  return {
    x: (relative.x / 100) * imageDimensions.width,
    y: (relative.y / 100) * imageDimensions.height,
    width: (relative.width / 100) * imageDimensions.width,
    height: (relative.height / 100) * imageDimensions.height,
  };
}

/**
 * Calcula las dimensiones de una imagen a partir de un elemento HTMLImageElement
 */
export function getImageDimensions(imageElement: HTMLImageElement): ImageDimensions {
  return {
    width: imageElement.naturalWidth || imageElement.width,
    height: imageElement.naturalHeight || imageElement.height,
  };
}

/**
 * Obtiene las dimensiones de una imagen por URL usando Promise
 */
export function getImageDimensionsFromUrl(imageUrl: string): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    if (!imageUrl || typeof imageUrl !== 'string') {
      console.warn('Invalid image URL:', imageUrl, typeof imageUrl);
      reject(new Error('URL de imagen inválida'));
      return;
    }

    console.log('Loading image dimensions for:', imageUrl);
    const img = new Image();
    
    // Solo establecer crossOrigin para imágenes externas (no rutas relativas)
    if (!imageUrl.startsWith('/') && !imageUrl.startsWith('data:')) {
      img.crossOrigin = 'anonymous';
    }
    
    img.onload = () => {
      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;
      
      console.log('Image loaded successfully:', { imageUrl, width, height });
      
      if (width && height) {
        resolve({
          width,
          height,
        });
      } else {
        reject(new Error('No se pudieron obtener las dimensiones de la imagen'));
      }
    };
    
    img.onerror = (event) => {
      // Reduce console noise - only log essential error info
      console.warn('Failed to load image:', imageUrl);
      
      // Intentar cargar como ruta absoluta si es relativa
      if (imageUrl.startsWith('/')) {
        const absoluteUrl = `${window.location.origin}${imageUrl}`;
        
        const newImg = new Image();
        newImg.onload = () => {
          const width = newImg.naturalWidth || newImg.width;
          const height = newImg.naturalHeight || newImg.height;
          
          if (width && height) {
            resolve({ width, height });
          } else {
            reject(new Error('No se pudieron obtener las dimensiones de la imagen con URL absoluta'));
          }
        };
        
        newImg.onerror = () => {
          console.warn('Image loading failed for both relative and absolute URLs:', imageUrl);
          reject(new Error(`Error al cargar la imagen (ambas rutas fallaron): ${imageUrl}`));
        };
        
        newImg.src = absoluteUrl;
        return;
      }
      
      const errorMessage = `Error al cargar la imagen: ${imageUrl}`;
      reject(new Error(errorMessage));
    };
    
    img.src = imageUrl;
  });
}

/**
 * Escala coordenadas relativas manteniendo proporciones
 */
export function scaleRelativeCoordinates(
  coordinates: RelativeCoordinates,
  fromDimensions: ImageDimensions,
  toDimensions: ImageDimensions
): RelativeCoordinates {
  // Si las dimensiones son iguales, no hay cambio
  if (fromDimensions.width === toDimensions.width && 
      fromDimensions.height === toDimensions.height) {
    return coordinates;
  }

  // Calcular factores de escala
  const scaleX = toDimensions.width / fromDimensions.width;
  const scaleY = toDimensions.height / fromDimensions.height;

  // Para mantener proporciones, usamos el menor factor de escala
  const scale = Math.min(scaleX, scaleY);

  return {
    x: coordinates.x * scale,
    y: coordinates.y * scale,
    width: coordinates.width * scale,
    height: coordinates.height * scale,
  };
}

/**
 * Convierte un DesignElement del formato actual a coordenadas relativas
 */
export function convertElementToRelative(
  element: any,
  referenceDimensions: ImageDimensions
): RelativeCoordinates {
  return absoluteToRelative(
    {
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height,
    },
    referenceDimensions
  );
}

/**
 * Convierte coordenadas relativas a formato DesignElement
 */
export function convertRelativeToElement(
  relative: RelativeCoordinates,
  targetDimensions: ImageDimensions
): AbsoluteCoordinates {
  return relativeToAbsolute(relative, targetDimensions);
}

/**
 * Valida que las coordenadas relativas estén en el rango válido (0-100)
 */
export function validateRelativeCoordinates(coordinates: RelativeCoordinates): boolean {
  return (
    coordinates.x >= 0 && coordinates.x <= 100 &&
    coordinates.y >= 0 && coordinates.y <= 100 &&
    coordinates.width >= 0 && coordinates.width <= 100 &&
    coordinates.height >= 0 && coordinates.height <= 100 &&
    coordinates.x + coordinates.width <= 100 &&
    coordinates.y + coordinates.height <= 100
  );
}

/**
 * Ajusta coordenadas que se salen de los límites de la imagen
 */
export function clampRelativeCoordinates(coordinates: RelativeCoordinates): RelativeCoordinates {
  const result = { ...coordinates };
  
  // Asegurar que no sean negativas
  result.x = Math.max(0, result.x);
  result.y = Math.max(0, result.y);
  result.width = Math.max(0, result.width);
  result.height = Math.max(0, result.height);
  
  // Asegurar que no se salgan del límite (100%)
  result.x = Math.min(100, result.x);
  result.y = Math.min(100, result.y);
  result.width = Math.min(100, result.width);
  result.height = Math.min(100, result.height);
  
  // Ajustar ancho y alto si se salen del borde
  if (result.x + result.width > 100) {
    result.width = 100 - result.x;
  }
  if (result.y + result.height > 100) {
    result.height = 100 - result.y;
  }
  
  return result;
}

/**
 * Calcula el CSS style object para posicionar un elemento con coordenadas relativas
 */
export function getRelativePositionStyle(coordinates: RelativeCoordinates): React.CSSProperties {
  return {
    position: 'absolute',
    left: `${coordinates.x}%`,
    top: `${coordinates.y}%`,
    width: `${coordinates.width}%`,
    height: `${coordinates.height}%`,
  };
}