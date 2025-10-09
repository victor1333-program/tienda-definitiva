import { useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';
import {
  DesignElementComplete,
  getEffectiveCoordinates,
  elementToFabricObject,
  fabricObjectToElement,
} from '@/lib/element-conversion';
import {
  ImageDimensions,
  getImageDimensionsFromUrl,
} from '@/lib/coordinate-utils';

declare global {
  interface Window {
    fabric: any;
  }
}

interface UseRelativeElementManagerOptions {
  canvas: any;
  referenceDimensions?: ImageDimensions;
  onElementAdded?: (element: DesignElementComplete) => void;
  onElementUpdated?: (element: DesignElementComplete) => void;
  onElementRemoved?: (elementId: string) => void;
}

export function useRelativeElementManager({
  canvas,
  referenceDimensions,
  onElementAdded,
  onElementUpdated,
  onElementRemoved,
}: UseRelativeElementManagerOptions) {
  const currentDimensions = useRef<ImageDimensions | null>(referenceDimensions || null);

  // Actualizar dimensiones de referencia
  const updateReferenceDimensions = useCallback((dimensions: ImageDimensions) => {
    currentDimensions.current = dimensions;
  }, []);

  // Cargar dimensiones desde imagen
  const loadDimensionsFromImage = useCallback(async (imageUrl: string) => {
    try {
      const dimensions = await getImageDimensionsFromUrl(imageUrl);
      updateReferenceDimensions(dimensions);
      return dimensions;
    } catch (error) {
      console.error('Error loading image dimensions:', error);
      throw error;
    }
  }, [updateReferenceDimensions]);

  // Obtener dimensiones actuales del canvas como fallback
  const getCanvasDimensions = useCallback((): ImageDimensions => {
    if (canvas) {
      return {
        width: canvas.width || 800,
        height: canvas.height || 600,
      };
    }
    return { width: 800, height: 600 };
  }, [canvas]);

  // Obtener dimensiones efectivas (referenceDimensions o canvas)
  const getEffectiveDimensions = useCallback((): ImageDimensions => {
    return currentDimensions.current || getCanvasDimensions();
  }, [getCanvasDimensions]);

  // Agregar elemento al canvas con soporte para coordenadas relativas
  const addElementToCanvas = useCallback(async (element: DesignElementComplete) => {
    if (!canvas) {
      console.warn('Canvas not available');
      return;
    }

    if (!window.fabric) {
      console.error('Fabric.js not loaded');
      return;
    }

    try {
      console.log('Adding element with relative coordinates:', element);
      
      const targetDimensions = getEffectiveDimensions();
      const fabricObject = await elementToFabricObject(element, targetDimensions);
      
      // Agregar metadata para tracking
      fabricObject.elementId = element.id || `element_${Date.now()}`;
      fabricObject.elementType = element.type;
      
      canvas.add(fabricObject);
      canvas.renderAll();
      
      console.log('Element added to canvas:', fabricObject);
      
      if (onElementAdded) {
        onElementAdded(element);
      }
      
      return fabricObject;
    } catch (error) {
      console.error('Error adding element to canvas:', error);
      toast.error('Error al agregar elemento al canvas');
      throw error;
    }
  }, [canvas, getEffectiveDimensions, onElementAdded]);

  // Función específica para agregar texto
  const addTextElement = useCallback(async (
    text: string = 'Nuevo texto',
    options: Partial<DesignElementComplete> = {}
  ) => {
    const targetDimensions = getEffectiveDimensions();
    
    const element: DesignElementComplete = {
      type: 'text',
      content: text,
      // Coordenadas relativas por defecto (centro del área)
      relativeX: options.relativeX || 25,
      relativeY: options.relativeY || 25,
      relativeWidth: options.relativeWidth || 50,
      relativeHeight: options.relativeHeight || 10,
      referenceDimensionsWidth: targetDimensions.width,
      referenceDimensionsHeight: targetDimensions.height,
      // Coordenadas absolutas calculadas
      x: 0, y: 0, width: 0, height: 0, // Se calcularán automáticamente
      style: {
        fontSize: 20,
        fontFamily: 'Arial',
        fontWeight: 'normal',
        fill: '#000000',
        textAlign: 'left',
        ...options.style,
      },
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      zIndex: 0,
      isVisible: true,
      isLocked: false,
      ...options,
    };

    // Calcular coordenadas absolutas
    const coords = getEffectiveCoordinates(element, targetDimensions);
    element.x = coords.x;
    element.y = coords.y;
    element.width = coords.width;
    element.height = coords.height;

    return await addElementToCanvas(element);
  }, [addElementToCanvas, getEffectiveDimensions]);

  // Función específica para agregar imagen
  const addImageElement = useCallback(async (
    imageUrl: string,
    options: Partial<DesignElementComplete> = {}
  ) => {
    const targetDimensions = getEffectiveDimensions();
    
    const element: DesignElementComplete = {
      type: 'image',
      content: imageUrl,
      // Coordenadas relativas por defecto
      relativeX: options.relativeX || 20,
      relativeY: options.relativeY || 20,
      relativeWidth: options.relativeWidth || 30,
      relativeHeight: options.relativeHeight || 30,
      referenceDimensionsWidth: targetDimensions.width,
      referenceDimensionsHeight: targetDimensions.height,
      // Coordenadas absolutas calculadas
      x: 0, y: 0, width: 0, height: 0,
      style: {
        filters: [],
        ...options.style,
      },
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      zIndex: 0,
      isVisible: true,
      isLocked: false,
      ...options,
    };

    // Calcular coordenadas absolutas
    const coords = getEffectiveCoordinates(element, targetDimensions);
    element.x = coords.x;
    element.y = coords.y;
    element.width = coords.width;
    element.height = coords.height;

    return await addElementToCanvas(element);
  }, [addElementToCanvas, getEffectiveDimensions]);

  // Función específica para agregar forma
  const addShapeElement = useCallback(async (
    shapeType: 'rect' | 'circle' | 'triangle',
    options: Partial<DesignElementComplete> = {}
  ) => {
    const targetDimensions = getEffectiveDimensions();
    
    const element: DesignElementComplete = {
      type: 'shape',
      content: shapeType,
      // Coordenadas relativas por defecto
      relativeX: options.relativeX || 30,
      relativeY: options.relativeY || 30,
      relativeWidth: options.relativeWidth || 20,
      relativeHeight: options.relativeHeight || 20,
      referenceDimensionsWidth: targetDimensions.width,
      referenceDimensionsHeight: targetDimensions.height,
      // Coordenadas absolutas calculadas
      x: 0, y: 0, width: 0, height: 0,
      style: {
        fill: '#000000',
        stroke: '#000000',
        strokeWidth: 1,
        ...(shapeType === 'circle' && { 
          radius: Math.min(
            (options.relativeWidth || 20) * targetDimensions.width / 100,
            (options.relativeHeight || 20) * targetDimensions.height / 100
          ) / 2 
        }),
        ...options.style,
      },
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      zIndex: 0,
      isVisible: true,
      isLocked: false,
      ...options,
    };

    // Calcular coordenadas absolutas
    const coords = getEffectiveCoordinates(element, targetDimensions);
    element.x = coords.x;
    element.y = coords.y;
    element.width = coords.width;
    element.height = coords.height;

    return await addElementToCanvas(element);
  }, [addElementToCanvas, getEffectiveDimensions]);

  // Actualizar elemento existente en el canvas
  const updateCanvasElement = useCallback((fabricObject: any) => {
    if (!canvas || !fabricObject) return;

    try {
      const targetDimensions = getEffectiveDimensions();
      const element = fabricObjectToElement(fabricObject, targetDimensions, fabricObject.elementType);
      
      if (onElementUpdated) {
        onElementUpdated(element);
      }
      
      canvas.renderAll();
    } catch (error) {
      console.error('Error updating element:', error);
    }
  }, [canvas, getEffectiveDimensions, onElementUpdated]);

  // Remover elemento del canvas
  const removeCanvasElement = useCallback((fabricObject: any) => {
    if (!canvas || !fabricObject) return;

    try {
      canvas.remove(fabricObject);
      
      if (onElementRemoved && fabricObject.elementId) {
        onElementRemoved(fabricObject.elementId);
      }
      
      canvas.renderAll();
    } catch (error) {
      console.error('Error removing element:', error);
    }
  }, [canvas, onElementRemoved]);

  // Obtener todos los elementos como array de DesignElementComplete
  const getAllElements = useCallback((): DesignElementComplete[] => {
    if (!canvas) return [];

    const targetDimensions = getEffectiveDimensions();
    const elements: DesignElementComplete[] = [];

    canvas.getObjects().forEach((obj: any) => {
      try {
        if (obj.elementType) {
          const element = fabricObjectToElement(obj, targetDimensions, obj.elementType);
          element.id = obj.elementId;
          elements.push(element);
        }
      } catch (error) {
        console.error('Error converting fabric object to element:', error);
      }
    });

    return elements;
  }, [canvas, getEffectiveDimensions]);

  // Limpiar canvas
  const clearCanvas = useCallback(() => {
    if (!canvas) return;
    
    canvas.clear();
    canvas.renderAll();
  }, [canvas]);

  // Cargar elementos desde template
  const loadElementsFromTemplate = useCallback(async (templateData: any) => {
    if (!templateData || !canvas) return;

    try {
      clearCanvas();

      // Detectar estructura de datos
      let elements: any[] = [];
      
      if (templateData.areas && Array.isArray(templateData.areas)) {
        // Nueva estructura con áreas
        templateData.areas.forEach((area: any) => {
          if (area.elements && Array.isArray(area.elements)) {
            elements = elements.concat(area.elements);
          }
        });
      } else if (templateData.elements && Array.isArray(templateData.elements)) {
        // Estructura simple con elementos
        elements = templateData.elements;
      }

      console.log('Loading elements from template:', elements);

      // Agregar cada elemento
      for (const elementData of elements) {
        try {
          await addElementToCanvas(elementData);
        } catch (error) {
          console.error('Error adding element from template:', error);
        }
      }

      toast.success(`${elements.length} elementos cargados desde la plantilla`);
    } catch (error) {
      console.error('Error loading template:', error);
      toast.error('Error al cargar la plantilla');
    }
  }, [addElementToCanvas, clearCanvas]);

  return {
    // Funciones principales
    addElementToCanvas,
    addTextElement,
    addImageElement,
    addShapeElement,
    updateCanvasElement,
    removeCanvasElement,
    
    // Gestión de elementos
    getAllElements,
    clearCanvas,
    loadElementsFromTemplate,
    
    // Gestión de dimensiones
    updateReferenceDimensions,
    loadDimensionsFromImage,
    getEffectiveDimensions,
    
    // Estado
    currentDimensions: currentDimensions.current,
  };
}