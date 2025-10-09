import {
  RelativeCoordinates,
  AbsoluteCoordinates,
  ImageDimensions,
  relativeToAbsolute,
  absoluteToRelative,
} from './coordinate-utils';

export interface DesignElementBase {
  id?: string;
  type: 'text' | 'image' | 'shape';
  printAreaId?: string;
  orderItemId?: string;
  content?: string;
  style?: any;
  zIndex?: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  opacity?: number;
  isLocked?: boolean;
  isVisible?: boolean;
}

export interface DesignElementWithAbsolute extends DesignElementBase {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DesignElementWithRelative extends DesignElementBase {
  relativeX: number;
  relativeY: number;
  relativeWidth: number;
  relativeHeight: number;
  referenceDimensionsWidth?: number;
  referenceDimensionsHeight?: number;
}

export interface DesignElementComplete extends DesignElementBase {
  // Coordenadas absolutas (legacy)
  x: number;
  y: number;
  width: number;
  height: number;
  
  // Coordenadas relativas (nuevo sistema)
  relativeX?: number;
  relativeY?: number;
  relativeWidth?: number;
  relativeHeight?: number;
  referenceDimensionsWidth?: number;
  referenceDimensionsHeight?: number;
}

/**
 * Convierte un elemento con coordenadas absolutas a relativas
 */
export function convertElementToRelative(
  element: DesignElementWithAbsolute,
  referenceDimensions: ImageDimensions
): DesignElementWithRelative {
  const relativeCoords = absoluteToRelative(
    {
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height,
    },
    referenceDimensions
  );

  return {
    ...element,
    relativeX: relativeCoords.x,
    relativeY: relativeCoords.y,
    relativeWidth: relativeCoords.width,
    relativeHeight: relativeCoords.height,
    referenceDimensionsWidth: referenceDimensions.width,
    referenceDimensionsHeight: referenceDimensions.height,
  };
}

/**
 * Convierte un elemento con coordenadas relativas a absolutas
 */
export function convertElementToAbsolute(
  element: DesignElementWithRelative,
  targetDimensions: ImageDimensions
): DesignElementWithAbsolute {
  const absoluteCoords = relativeToAbsolute(
    {
      x: element.relativeX,
      y: element.relativeY,
      width: element.relativeWidth,
      height: element.relativeHeight,
    },
    targetDimensions
  );

  return {
    ...element,
    x: absoluteCoords.x,
    y: absoluteCoords.y,
    width: absoluteCoords.width,
    height: absoluteCoords.height,
  };
}

/**
 * Obtiene las coordenadas efectivas de un elemento, priorizando las relativas
 */
export function getEffectiveCoordinates(
  element: DesignElementComplete,
  targetDimensions: ImageDimensions
): AbsoluteCoordinates {
  // Si tiene coordenadas relativas, usarlas
  if (
    element.relativeX !== undefined &&
    element.relativeY !== undefined &&
    element.relativeWidth !== undefined &&
    element.relativeHeight !== undefined
  ) {
    return relativeToAbsolute(
      {
        x: element.relativeX,
        y: element.relativeY,
        width: element.relativeWidth,
        height: element.relativeHeight,
      },
      targetDimensions
    );
  }

  // Fallback a coordenadas absolutas
  return {
    x: element.x,
    y: element.y,
    width: element.width,
    height: element.height,
  };
}

/**
 * Sincroniza coordenadas absolutas y relativas en un elemento
 */
export function syncElementCoordinates(
  element: DesignElementComplete,
  referenceDimensions: ImageDimensions,
  preferRelative: boolean = true
): DesignElementComplete {
  if (preferRelative && element.relativeX !== undefined) {
    // Actualizar absolutas desde relativas
    const absolute = relativeToAbsolute(
      {
        x: element.relativeX,
        y: element.relativeY!,
        width: element.relativeWidth!,
        height: element.relativeHeight!,
      },
      referenceDimensions
    );

    return {
      ...element,
      x: absolute.x,
      y: absolute.y,
      width: absolute.width,
      height: absolute.height,
      referenceDimensionsWidth: referenceDimensions.width,
      referenceDimensionsHeight: referenceDimensions.height,
    };
  } else {
    // Actualizar relativas desde absolutas
    const relative = absoluteToRelative(
      {
        x: element.x,
        y: element.y,
        width: element.width,
        height: element.height,
      },
      referenceDimensions
    );

    return {
      ...element,
      relativeX: relative.x,
      relativeY: relative.y,
      relativeWidth: relative.width,
      relativeHeight: relative.height,
      referenceDimensionsWidth: referenceDimensions.width,
      referenceDimensionsHeight: referenceDimensions.height,
    };
  }
}

/**
 * Prepara un elemento para guardado en la base de datos
 */
export function prepareElementForSave(
  element: DesignElementComplete,
  referenceDimensions: ImageDimensions
): DesignElementComplete {
  return syncElementCoordinates(element, referenceDimensions, true);
}

/**
 * Convierte elementos de fabric.js a nuestro formato
 */
export function fabricObjectToElement(
  fabricObject: any,
  referenceDimensions: ImageDimensions,
  type: 'text' | 'image' | 'shape'
): DesignElementComplete {
  const absoluteCoords: AbsoluteCoordinates = {
    x: fabricObject.left || 0,
    y: fabricObject.top || 0,
    width: (fabricObject.width * (fabricObject.scaleX || 1)) || 100,
    height: (fabricObject.height * (fabricObject.scaleY || 1)) || 100,
  };

  const relativeCoords = absoluteToRelative(absoluteCoords, referenceDimensions);

  const element: DesignElementComplete = {
    type,
    x: absoluteCoords.x,
    y: absoluteCoords.y,
    width: absoluteCoords.width,
    height: absoluteCoords.height,
    relativeX: relativeCoords.x,
    relativeY: relativeCoords.y,
    relativeWidth: relativeCoords.width,
    relativeHeight: relativeCoords.height,
    referenceDimensionsWidth: referenceDimensions.width,
    referenceDimensionsHeight: referenceDimensions.height,
    rotation: fabricObject.angle || 0,
    scaleX: fabricObject.scaleX || 1,
    scaleY: fabricObject.scaleY || 1,
    opacity: fabricObject.opacity || 1,
    zIndex: fabricObject.zIndex || 0,
    isVisible: fabricObject.visible !== false,
    isLocked: fabricObject.lockMovementX || false,
  };

  // Agregar propiedades específicas por tipo
  if (type === 'text') {
    element.content = fabricObject.text || '';
    element.style = {
      fontSize: fabricObject.fontSize,
      fontFamily: fabricObject.fontFamily,
      fontWeight: fabricObject.fontWeight,
      fill: fabricObject.fill,
      textAlign: fabricObject.textAlign,
    };
  } else if (type === 'image') {
    element.content = fabricObject.getSrc?.() || '';
    element.style = {
      filters: fabricObject.filters,
    };
  } else if (type === 'shape') {
    element.style = {
      fill: fabricObject.fill,
      stroke: fabricObject.stroke,
      strokeWidth: fabricObject.strokeWidth,
      rx: fabricObject.rx,
      ry: fabricObject.ry,
      radius: fabricObject.radius,
    };
  }

  return element;
}

/**
 * Convierte nuestro elemento a un objeto fabric.js
 */
export function elementToFabricObject(
  element: DesignElementComplete,
  targetDimensions: ImageDimensions
): Promise<any> {
  return new Promise((resolve, reject) => {
    const coords = getEffectiveCoordinates(element, targetDimensions);

    const baseProps = {
      left: coords.x,
      top: coords.y,
      angle: element.rotation || 0,
      opacity: element.opacity || 1,
      visible: element.isVisible !== false,
      lockMovementX: element.isLocked || false,
      lockMovementY: element.isLocked || false,
      selectable: !element.isLocked,
    };

    try {
      switch (element.type) {
        case 'text':
          const text = new (window as any).fabric.Text(element.content || '', {
            ...baseProps,
            fontSize: element.style?.fontSize || 20,
            fontFamily: element.style?.fontFamily || 'Arial',
            fontWeight: element.style?.fontWeight || 'normal',
            fill: element.style?.fill || '#000000',
            textAlign: element.style?.textAlign || 'left',
          });
          resolve(text);
          break;

        case 'image':
          if (element.content) {
            (window as any).fabric.Image.fromURL(
              element.content,
              (img: any) => {
                if (img) {
                  img.set({
                    ...baseProps,
                    scaleX: coords.width / img.width,
                    scaleY: coords.height / img.height,
                  });
                  resolve(img);
                } else {
                  reject(new Error('Failed to load image'));
                }
              },
              { crossOrigin: 'anonymous' }
            );
          } else {
            reject(new Error('No image source provided'));
          }
          break;

        case 'shape':
          // Determinar tipo de forma basado en el estilo
          if (element.style?.radius !== undefined) {
            const circle = new (window as any).fabric.Circle({
              ...baseProps,
              radius: element.style.radius,
              fill: element.style?.fill || 'transparent',
              stroke: element.style?.stroke || '#000000',
              strokeWidth: element.style?.strokeWidth || 1,
            });
            resolve(circle);
          } else {
            const rect = new (window as any).fabric.Rect({
              ...baseProps,
              width: coords.width,
              height: coords.height,
              fill: element.style?.fill || 'transparent',
              stroke: element.style?.stroke || '#000000',
              strokeWidth: element.style?.strokeWidth || 1,
              rx: element.style?.rx || 0,
              ry: element.style?.ry || 0,
            });
            resolve(rect);
          }
          break;

        default:
          reject(new Error(`Unknown element type: ${element.type}`));
      }
    } catch (error) {
      reject(error);
    }
  });
}