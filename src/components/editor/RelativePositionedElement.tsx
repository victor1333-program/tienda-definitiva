import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useDesignElementCoordinates } from '@/hooks/useRelativeCoordinates';
import { RelativeCoordinates, ImageDimensions } from '@/lib/coordinate-utils';

interface RelativePositionedElementProps {
  // Coordenadas del elemento
  coordinates: RelativeCoordinates;
  
  // Imagen de referencia
  imageUrl?: string;
  imageDimensions?: ImageDimensions;
  
  // Contenido del elemento
  children: React.ReactNode;
  
  // Props adicionales de estilo
  className?: string;
  style?: React.CSSProperties;
  
  // Callbacks
  onPositionChange?: (coordinates: RelativeCoordinates) => void;
  onDimensionsChange?: (dimensions: ImageDimensions) => void;
  
  // Configuración
  draggable?: boolean;
  resizable?: boolean;
  
  // Props HTML
  [key: string]: any;
}

export const RelativePositionedElement: React.FC<RelativePositionedElementProps> = ({
  coordinates,
  imageUrl,
  imageDimensions,
  children,
  className = '',
  style = {},
  onPositionChange,
  onDimensionsChange,
  draggable = false,
  resizable = false,
  ...props
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const {
    getElementStyle,
    validateCoordinates,
    clampCoordinates,
    imageDimensions: loadedDimensions,
    isLoading,
    error,
  } = useDesignElementCoordinates(imageUrl, imageDimensions);

  // Usar dimensiones cargadas o proporcionadas
  const currentDimensions = imageDimensions || loadedDimensions;

  // Notificar cambios en dimensiones
  useEffect(() => {
    if (currentDimensions && onDimensionsChange) {
      onDimensionsChange(currentDimensions);
    }
  }, [currentDimensions, onDimensionsChange]);

  // Estilo combinado
  const combinedStyle = {
    ...getElementStyle(coordinates),
    ...style,
    ...(isDragging ? { 
      cursor: 'grabbing',
      zIndex: 9999,
      userSelect: 'none' as const
    } : {}),
  };

  // Manejar inicio de arrastre
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!draggable) return;
    
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
    });
  }, [draggable]);

  // Manejar movimiento durante arrastre
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !onPositionChange || !currentDimensions || !elementRef.current) return;

    const container = elementRef.current.parentElement;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    
    // Calcular movimiento en píxeles
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    // Convertir a porcentajes
    const deltaXPercent = (deltaX / containerRect.width) * 100;
    const deltaYPercent = (deltaY / containerRect.height) * 100;
    
    // Nuevas coordenadas
    const newCoordinates: RelativeCoordinates = {
      ...coordinates,
      x: coordinates.x + deltaXPercent,
      y: coordinates.y + deltaYPercent,
    };
    
    // Validar y ajustar coordenadas
    const clampedCoordinates = clampCoordinates(newCoordinates);
    
    // Actualizar posición de arrastre
    setDragStart({
      x: e.clientX,
      y: e.clientY,
    });
    
    onPositionChange(clampedCoordinates);
  }, [isDragging, dragStart, coordinates, onPositionChange, currentDimensions, clampCoordinates]);

  // Manejar fin de arrastre
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Configurar event listeners globales para el arrastre
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Validar coordenadas
  const isValidPosition = validateCoordinates(coordinates);
  
  if (isLoading) {
    return (
      <div 
        className={`absolute bg-gray-200 animate-pulse ${className}`}
        style={combinedStyle}
      >
        Cargando...
      </div>
    );
  }

  if (error || !currentDimensions) {
    return (
      <div 
        className={`absolute bg-red-100 border border-red-300 text-red-600 text-xs p-1 ${className}`}
        style={combinedStyle}
      >
        Error: {error || 'Dimensiones no disponibles'}
      </div>
    );
  }

  if (!isValidPosition) {
    console.warn('Invalid coordinates detected:', coordinates);
  }

  return (
    <div
      ref={elementRef}
      className={`${className} ${draggable ? 'cursor-grab' : ''} ${!isValidPosition ? 'opacity-50' : ''}`}
      style={combinedStyle}
      onMouseDown={handleMouseDown}
      {...props}
    >
      {children}
      
      {/* Indicadores de redimensionado si está habilitado */}
      {resizable && (
        <>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 border border-white cursor-se-resize" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border border-white cursor-ne-resize" />
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 border border-white cursor-nw-resize" />
          <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 border border-white cursor-sw-resize" />
        </>
      )}
      
      {/* Indicador de coordenadas inválidas */}
      {!isValidPosition && (
        <div className="absolute -top-6 left-0 bg-red-500 text-white text-xs px-1 rounded text-nowrap">
          Coordenadas inválidas
        </div>
      )}
    </div>
  );
};

// Componente wrapper para contenedor de elementos con posicionamiento relativo
interface RelativeContainerProps {
  imageUrl?: string;
  imageDimensions?: ImageDimensions;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  onImageLoad?: (dimensions: ImageDimensions) => void;
}

export const RelativeContainer: React.FC<RelativeContainerProps> = ({
  imageUrl,
  imageDimensions,
  className = '',
  style = {},
  children,
  onImageLoad,
}) => {
  const [loadedDimensions, setLoadedDimensions] = useState<ImageDimensions | null>(null);
  
  const handleImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const dimensions: ImageDimensions = {
      width: img.naturalWidth,
      height: img.naturalHeight,
    };
    
    setLoadedDimensions(dimensions);
    if (onImageLoad) {
      onImageLoad(dimensions);
    }
  }, [onImageLoad]);

  const currentDimensions = imageDimensions || loadedDimensions;

  return (
    <div className={`relative ${className}`} style={style}>
      {imageUrl && (
        <img
          src={imageUrl}
          alt="Imagen de referencia"
          className="w-full h-full object-contain"
          onLoad={handleImageLoad}
          onError={(e) => {
            // Usar console.warn en lugar de console.error para ser menos agresivo
            console.warn('Warning: Could not load reference image:', imageUrl);
          }}
        />
      )}
      
      {/* Contenedor absoluto para elementos posicionados */}
      <div className="absolute inset-0">
        {children}
      </div>
      
      {/* Información de debug (solo en desarrollo) */}
      {process.env.NODE_ENV === 'development' && currentDimensions && (
        <div className="absolute top-2 left-2 bg-black/75 text-white text-xs p-1 rounded">
          {currentDimensions.width}x{currentDimensions.height}
        </div>
      )}
    </div>
  );
};

export default RelativePositionedElement;