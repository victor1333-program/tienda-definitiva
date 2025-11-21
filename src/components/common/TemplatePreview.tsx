import React, { useState, useEffect, useCallback } from 'react';
import { RelativeContainer, RelativePositionedElement } from '@/components/editor/RelativePositionedElement';
import { useDesignElementCoordinates } from '@/hooks/useRelativeCoordinates';
import { DesignElementComplete, getEffectiveCoordinates } from '@/lib/element-conversion';
import { ImageDimensions } from '@/lib/coordinate-utils';

interface TemplatePreviewProps {
  // Imagen base
  imageUrl: string;
  imageDimensions?: ImageDimensions;
  
  // Elementos de la plantilla
  elements?: DesignElementComplete[];
  templateData?: any; // Para compatibilidad con estructura antigua
  
  // Configuración de visualización
  className?: string;
  style?: React.CSSProperties;
  maxWidth?: number;
  maxHeight?: number;
  
  // Interactividad
  interactive?: boolean;
  showElementBorders?: boolean;
  showElementInfo?: boolean;
  
  // Callbacks
  onElementClick?: (element: DesignElementComplete) => void;
  onElementHover?: (element: DesignElementComplete | null) => void;
  onImageLoad?: (dimensions: ImageDimensions) => void;
}

export const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  imageUrl,
  imageDimensions,
  elements = [],
  templateData,
  className = '',
  style = {},
  maxWidth = 800,
  maxHeight = 600,
  interactive = false,
  showElementBorders = false,
  showElementInfo = false,
  onElementClick,
  onElementHover,
  onImageLoad,
}) => {
  const [parsedElements, setParsedElements] = useState<DesignElementComplete[]>([]);
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  
  const {
    imageDimensions: loadedDimensions,
    isLoading,
    error,
  } = useDesignElementCoordinates(imageUrl, imageDimensions);

  const currentDimensions = imageDimensions || loadedDimensions;

  // Parsear elementos desde templateData si no se proporcionan elementos directamente
  useEffect(() => {
    if (elements.length > 0) {
      setParsedElements(elements);
      return;
    }

    if (templateData) {
      try {
        let extractedElements: any[] = [];
        
        // Detectar estructura de templateData
        if (templateData.sideElements && typeof templateData.sideElements === 'object') {
          // Estructura Zakeke con sideElements
          const sideKeys = Object.keys(templateData.sideElements);
          if (sideKeys.length > 0) {
            // Usar el primer lado o el lado actual
            const currentSide = templateData.currentSide || sideKeys[0];
            if (templateData.sideElements[currentSide]) {
              extractedElements = templateData.sideElements[currentSide];
            }
          }
        } else if (templateData.areas && Array.isArray(templateData.areas)) {
          // Nueva estructura con áreas
          templateData.areas.forEach((area: any) => {
            if (area.elements && Array.isArray(area.elements)) {
              extractedElements = extractedElements.concat(area.elements);
            }
          });
        } else if (templateData.elements && Array.isArray(templateData.elements)) {
          // Estructura simple
          extractedElements = templateData.elements;
        } else if (Array.isArray(templateData)) {
          // Array directo
          extractedElements = templateData;
        }

        // Convertir a formato DesignElementComplete
        const convertedElements: DesignElementComplete[] = extractedElements.map((el, index) => {
          // Si el elemento tiene isRelativeCoordinates: true, las coordenadas x,y,width,height ya son porcentajes
          const isRelative = el.isRelativeCoordinates === true

          const converted = {
            id: el.id || `element_${index}`,
            type: el.type || 'text',
            content: el.content || el.text || el.src || '',
            x: el.x || el.left || 0,
            y: el.y || el.top || 0,
            width: el.width || 100,
            height: el.height || 50,
            // Si isRelativeCoordinates es true, copiar x,y,width,height a los campos relativos
            relativeX: isRelative ? (el.x || 0) : el.relativeX,
            relativeY: isRelative ? (el.y || 0) : el.relativeY,
            relativeWidth: isRelative ? (el.width || 0) : el.relativeWidth,
            relativeHeight: isRelative ? (el.height || 0) : el.relativeHeight,
            referenceDimensionsWidth: el.referenceDimensionsWidth || el.referenceCanvasSize?.width,
            referenceDimensionsHeight: el.referenceDimensionsHeight || el.referenceCanvasSize?.height,
            rotation: el.rotation || el.angle || 0,
            scaleX: el.scaleX || 1,
            scaleY: el.scaleY || 1,
            opacity: el.opacity || 1,
            zIndex: el.zIndex || index,
            isVisible: el.visible !== false && el.isVisible !== false,
            isLocked: el.isLocked || el.locked || false,
            style: el.style || (el.type === 'text' ? {
              fontSize: el.fontSize || 20,
              fontFamily: el.fontFamily || 'Arial',
              fontWeight: el.fontWeight || 'normal',
              fill: el.color || el.fillColor || el.fill || '#000000',
              textAlign: el.textAlign || 'left',
            } : {}),
          }

          console.log('TemplatePreview: Converted element', {
            originalElement: el,
            isRelative,
            convertedElement: converted
          });

          return converted;
        });

        setParsedElements(convertedElements);
      } catch (error) {
        console.warn('Warning parsing template data:', error);
        setParsedElements([]);
      }
    } else {
      setParsedElements([]);
    }
  }, [elements.length, templateData?.currentSide, templateData?.sideElements, templateData?.areas, templateData?.elements]);

  // Manejar carga de imagen
  const handleImageLoad = useCallback((dimensions: ImageDimensions) => {
    if (onImageLoad) {
      onImageLoad(dimensions);
    }
  }, [onImageLoad]);

  // Manejar click en elemento
  const handleElementClick = useCallback((element: DesignElementComplete) => {
    if (interactive && onElementClick) {
      onElementClick(element);
    }
  }, [interactive, onElementClick]);

  // Manejar hover en elemento
  const handleElementHover = useCallback((element: DesignElementComplete | null, isHovering: boolean) => {
    if (interactive) {
      setHoveredElement(isHovering ? element?.id || null : null);
      if (onElementHover) {
        onElementHover(element);
      }
    }
  }, [interactive, onElementHover]);

  // Renderizar elemento según su tipo
  const renderElement = useCallback((element: DesignElementComplete) => {
    if (!currentDimensions) return null;

    // Calcular coordenadas relativas si no existen
    let relativeCoords;

    // Verificar si tenemos coordenadas relativas válidas
    if (element.relativeX !== undefined && element.relativeWidth !== undefined) {
      // Usar coordenadas relativas directamente
      relativeCoords = {
        x: element.relativeX,
        y: element.relativeY || 0,
        width: element.relativeWidth,
        height: element.relativeHeight || 0,
      };
      console.log('TemplatePreview: Using relative coords', {
        elementId: element.id,
        type: element.type,
        relativeCoords
      });
    } else {
      // Calcular coordenadas relativas desde absolutas
      relativeCoords = {
        x: (element.x / currentDimensions.width) * 100,
        y: (element.y / currentDimensions.height) * 100,
        width: (element.width / currentDimensions.width) * 100,
        height: (element.height / currentDimensions.height) * 100,
      };
      console.log('TemplatePreview: Calculated relative coords from absolute', {
        elementId: element.id,
        type: element.type,
        absolute: { x: element.x, y: element.y, width: element.width, height: element.height },
        relativeCoords
      });
    }

    const isHovered = hoveredElement === element.id;
    const elementStyle: React.CSSProperties = {
      transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
      opacity: element.opacity || 1,
      zIndex: element.zIndex || 0,
      cursor: interactive ? 'pointer' : 'default',
      border: (showElementBorders || isHovered) ? '2px solid #3B82F6' : undefined,
      boxShadow: isHovered ? '0 4px 12px rgba(59, 130, 246, 0.3)' : undefined,
      transition: interactive ? 'all 0.2s ease' : undefined,
    };

    let content: React.ReactNode = null;

    switch (element.type) {
      case 'text':
        content = (
          <div
            className="w-full h-full flex items-center justify-start text-black overflow-hidden"
            style={{
              fontSize: element.style?.fontSize ? `${element.style.fontSize}px` : '20px',
              fontFamily: element.style?.fontFamily || 'Arial',
              fontWeight: element.style?.fontWeight || 'normal',
              color: element.style?.fill || '#000000',
              textAlign: element.style?.textAlign || 'left',
              lineHeight: '1.2',
              wordBreak: 'break-word',
              padding: '2px',
            }}
          >
            {element.content}
          </div>
        );
        break;

      case 'image':
        if (element.content) {
          content = (
            <img
              src={element.content}
              alt="Elemento de imagen"
              className="w-full h-full object-contain"
              style={{
                transform: `scaleX(${element.scaleX || 1}) scaleY(${element.scaleY || 1})`,
              }}
            />
          );
        } else {
          content = (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
              Sin imagen
            </div>
          );
        }
        break;

      case 'shape':
        const fill = element.style?.fill || '#000000';
        const stroke = element.style?.stroke || '#000000';
        const strokeWidth = element.style?.strokeWidth || 1;

        if (element.style?.radius !== undefined || element.content === 'circle') {
          // Círculo
          content = (
            <div
              className="w-full h-full rounded-full"
              style={{
                backgroundColor: fill !== 'transparent' ? fill : undefined,
                border: stroke && stroke !== 'transparent' ? `${strokeWidth}px solid ${stroke}` : undefined,
              }}
            />
          );
        } else {
          // Rectángulo
          content = (
            <div
              className="w-full h-full"
              style={{
                backgroundColor: fill !== 'transparent' ? fill : undefined,
                border: stroke && stroke !== 'transparent' ? `${strokeWidth}px solid ${stroke}` : undefined,
                borderRadius: element.style?.rx ? `${element.style.rx}px` : undefined,
              }}
            />
          );
        }
        break;

      default:
        content = (
          <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs">
            {element.type}
          </div>
        );
    }

    return (
      <RelativePositionedElement
        key={element.id}
        coordinates={relativeCoords}
        imageDimensions={currentDimensions}
        className={`${!element.isVisible ? 'opacity-50' : ''}`}
        style={elementStyle}
        onClick={() => handleElementClick(element)}
        onMouseEnter={() => handleElementHover(element, true)}
        onMouseLeave={() => handleElementHover(null, false)}
      >
        {content}
        
        {/* Información del elemento (solo en modo debug) */}
        {showElementInfo && isHovered && (
          <div className="absolute -top-8 left-0 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50">
            {element.type}: {element.content?.substring(0, 20)}...
          </div>
        )}
      </RelativePositionedElement>
    );
  }, [
    currentDimensions,
    hoveredElement,
    interactive,
    showElementBorders,
    showElementInfo,
    handleElementClick,
    handleElementHover,
  ]);

  // Calcular dimensiones del contenedor manteniendo aspect ratio
  const containerStyle: React.CSSProperties = {
    maxWidth: `${maxWidth}px`,
    maxHeight: `${maxHeight}px`,
    ...style,
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`} style={containerStyle}>
        <div className="text-gray-500">Cargando plantilla...</div>
      </div>
    );
  }

  if (error || !currentDimensions) {
    // En lugar de mostrar error, usar dimensiones por defecto y continuar
    const fallbackDimensions = { width: 800, height: 600 };
    
    // Debug info para entender qué está pasando
    console.warn('TemplatePreview fallback mode:', {
      imageUrl,
      error,
      currentDimensions,
      imageDimensions,
      loadedDimensions
    });
    
    return (
      <div className={className} style={containerStyle}>
        <RelativeContainer
          imageUrl={imageUrl}
          imageDimensions={fallbackDimensions}
          onImageLoad={handleImageLoad}
          className="w-full h-full bg-gray-100"
        >
          {parsedElements
            .filter(element => element.isVisible !== false)
            .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
            .map(element => renderElement(element))}
        </RelativeContainer>
        
        {/* Mostrar warning solo en desarrollo para errores no relacionados con placeholder */}
        {process.env.NODE_ENV === 'development' && error && !imageUrl.includes('placeholder-image.jpg') && (
          <div className="absolute bottom-0 left-0 right-0 bg-yellow-200 text-yellow-800 text-xs p-1 opacity-75">
            Warning: {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={className} style={containerStyle}>
      <RelativeContainer
        imageUrl={imageUrl}
        imageDimensions={currentDimensions}
        onImageLoad={handleImageLoad}
        className="w-full h-full"
      >
        {parsedElements
          .filter(element => element.isVisible !== false)
          .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
          .map(renderElement)}
      </RelativeContainer>
      
      {/* Información de debug */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2 text-xs text-gray-500">
          Elementos: {parsedElements.length} | Dimensiones: {currentDimensions.width}x{currentDimensions.height}
        </div>
      )}
    </div>
  );
};

// Hook para uso en páginas que muestran templates
export function useTemplatePreview(imageUrl?: string) {
  const {
    imageDimensions,
    isLoading,
    error,
    loadImageDimensions,
  } = useDesignElementCoordinates(imageUrl);

  const preloadImage = useCallback(async (url: string) => {
    try {
      await loadImageDimensions(url);
    } catch (error) {
      console.warn('Warning preloading image:', error);
    }
  }, [loadImageDimensions]);

  return {
    imageDimensions,
    isLoading,
    error,
    preloadImage,
  };
}

export default TemplatePreview;