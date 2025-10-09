import { useState, useEffect, useCallback } from 'react';
import {
  AbsoluteCoordinates,
  RelativeCoordinates,
  ImageDimensions,
  absoluteToRelative,
  relativeToAbsolute,
  getImageDimensionsFromUrl,
  validateRelativeCoordinates,
  clampRelativeCoordinates,
} from '@/lib/coordinate-utils';

interface UseRelativeCoordinatesOptions {
  imageUrl?: string;
  referenceDimensions?: ImageDimensions;
  autoConvert?: boolean;
}

interface UseRelativeCoordinatesReturn {
  // Estado
  imageDimensions: ImageDimensions | null;
  isLoading: boolean;
  error: string | null;
  
  // Funciones de conversión
  convertToRelative: (absolute: AbsoluteCoordinates) => RelativeCoordinates;
  convertToAbsolute: (relative: RelativeCoordinates) => AbsoluteCoordinates;
  
  // Funciones de utilidad
  validateCoordinates: (coordinates: RelativeCoordinates) => boolean;
  clampCoordinates: (coordinates: RelativeCoordinates) => RelativeCoordinates;
  
  // Función para actualizar dimensiones de referencia
  updateImageDimensions: (dimensions: ImageDimensions) => void;
  
  // Función para cargar dimensiones desde URL
  loadImageDimensions: (url: string) => Promise<void>;
}

export function useRelativeCoordinates(
  options: UseRelativeCoordinatesOptions = {}
): UseRelativeCoordinatesReturn {
  const {
    imageUrl,
    referenceDimensions: initialDimensions,
    autoConvert = true,
  } = options;

  const [imageDimensions, setImageDimensions] = useState<ImageDimensions | null>(
    initialDimensions || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar dimensiones desde URL
  const loadImageDimensions = useCallback(async (url: string) => {
    if (!url) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const dimensions = await getImageDimensionsFromUrl(url);
      setImageDimensions(dimensions);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al cargar imagen';
      setError(errorMessage);
      console.warn('Warning loading image dimensions:', errorMessage, 'URL:', url);
      // Establecer dimensiones por defecto en caso de error
      setImageDimensions({ width: 800, height: 600 });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-cargar dimensiones si se proporciona imageUrl
  useEffect(() => {
    if (imageUrl && autoConvert && !imageDimensions) {
      loadImageDimensions(imageUrl);
    }
  }, [imageUrl, autoConvert, imageDimensions, loadImageDimensions]);

  // Función para actualizar dimensiones manualmente
  const updateImageDimensions = useCallback((dimensions: ImageDimensions) => {
    setImageDimensions(dimensions);
    setError(null);
  }, []);

  // Función para convertir a coordenadas relativas
  const convertToRelative = useCallback((absolute: AbsoluteCoordinates): RelativeCoordinates => {
    if (!imageDimensions) {
      console.warn('No image dimensions available for conversion');
      return {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      };
    }
    
    return absoluteToRelative(absolute, imageDimensions);
  }, [imageDimensions]);

  // Función para convertir a coordenadas absolutas
  const convertToAbsolute = useCallback((relative: RelativeCoordinates): AbsoluteCoordinates => {
    if (!imageDimensions) {
      console.warn('No image dimensions available for conversion');
      return {
        x: 0,
        y: 0,
        width: imageDimensions?.width || 300,
        height: imageDimensions?.height || 200,
      };
    }
    
    return relativeToAbsolute(relative, imageDimensions);
  }, [imageDimensions]);

  // Función para validar coordenadas
  const validateCoordinates = useCallback((coordinates: RelativeCoordinates): boolean => {
    return validateRelativeCoordinates(coordinates);
  }, []);

  // Función para ajustar coordenadas
  const clampCoordinates = useCallback((coordinates: RelativeCoordinates): RelativeCoordinates => {
    return clampRelativeCoordinates(coordinates);
  }, []);

  return {
    // Estado
    imageDimensions,
    isLoading,
    error,
    
    // Funciones de conversión
    convertToRelative,
    convertToAbsolute,
    
    // Funciones de utilidad
    validateCoordinates,
    clampCoordinates,
    
    // Funciones de control
    updateImageDimensions,
    loadImageDimensions,
  };
}

// Hook específico para elementos de diseño
export function useDesignElementCoordinates(
  imageUrl?: string,
  referenceDimensions?: ImageDimensions
) {
  const {
    convertToRelative,
    convertToAbsolute,
    validateCoordinates,
    clampCoordinates,
    imageDimensions,
    isLoading,
    error,
  } = useRelativeCoordinates({
    imageUrl,
    referenceDimensions,
    autoConvert: true,
  });

  // Función específica para convertir un DesignElement
  const convertElementToRelative = useCallback((element: any): RelativeCoordinates => {
    return convertToRelative({
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height,
    });
  }, [convertToRelative]);

  // Función específica para convertir a formato DesignElement
  const convertRelativeToElement = useCallback((relative: RelativeCoordinates) => {
    const absolute = convertToAbsolute(relative);
    return {
      x: absolute.x,
      y: absolute.y,
      width: absolute.width,
      height: absolute.height,
    };
  }, [convertToAbsolute]);

  // Función para obtener style CSS para posicionamiento
  const getElementStyle = useCallback((
    relative: RelativeCoordinates,
    additionalStyles: React.CSSProperties = {}
  ): React.CSSProperties => {
    return {
      position: 'absolute',
      left: `${relative.x}%`,
      top: `${relative.y}%`,
      width: `${relative.width}%`,
      height: `${relative.height}%`,
      ...additionalStyles,
    };
  }, []);

  return {
    // Estado
    imageDimensions,
    isLoading,
    error,
    
    // Funciones específicas para elementos
    convertElementToRelative,
    convertRelativeToElement,
    getElementStyle,
    
    // Funciones de utilidad
    validateCoordinates,
    clampCoordinates,
  };
}