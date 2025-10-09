"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'react-hot-toast'
import { 
  ProductVariant, 
  ProductSide, 
  PrintArea, 
  CanvasState, 
  DesignElement, 
  ToolState,
  HistoryState 
} from '../types/ZakekeTypes'

export interface UseZakekeEditorProps {
  productId: string
  variants: ProductVariant[]
  initialDesignData?: any
  onSave?: (designData: any) => void
}

export const useZakekeEditor = ({
  productId,
  variants,
  initialDesignData,
  onSave
}: UseZakekeEditorProps) => {
  // Estado principal
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    variants.find(v => v.isDefault) || variants[0] || null
  )
  const [currentSide, setCurrentSide] = useState<string>('front')
  const [elements, setElements] = useState<DesignElement[]>([])
  const [selectedElement, setSelectedElement] = useState<string | null>(null)

  // Estado del canvas
  const [canvasState, setCanvasState] = useState<CanvasState>({
    zoom: 1,
    panX: 0,
    panY: 0,
    selectedObjectId: null,
    mode: 'select',
    isModified: false
  })

  // Estado de herramientas
  const [toolState, setToolState] = useState<ToolState>({
    activeTool: 'select',
    isDrawing: false,
    drawingMode: 'free',
    brushWidth: 5,
    brushColor: '#000000'
  })

  // Estado de historial
  const [history, setHistory] = useState<HistoryState>({
    canUndo: false,
    canRedo: false,
    currentStep: 0,
    totalSteps: 0
  })

  // Referencias
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricCanvasRef = useRef<any>(null)
  const historyStack = useRef<any[]>([])
  const historyPointer = useRef(0)

  // Inicializar Fabric.js
  useEffect(() => {
    const initFabric = async () => {
      try {
        const fabricModule = await import('fabric')
        if (!canvasRef.current) return

        const canvas = new fabricModule.fabric.Canvas(canvasRef.current, {
          width: 600,
          height: 400,
          backgroundColor: 'white',
          selection: true,
          preserveObjectStacking: true
        })

        fabricCanvasRef.current = canvas

        // Event listeners
        canvas.on('selection:created', handleSelectionCreated)
        canvas.on('selection:updated', handleSelectionUpdated)
        canvas.on('selection:cleared', handleSelectionCleared)
        canvas.on('object:modified', handleObjectModified)

      } catch (error) {
        console.error('Error initializing Fabric.js:', error)
        toast.error('Error inicializando el editor')
      }
    }

    initFabric()

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose()
      }
    }
  }, [])

  // Cargar diseño inicial
  useEffect(() => {
    if (initialDesignData && fabricCanvasRef.current) {
      loadDesign(initialDesignData)
    }
  }, [initialDesignData])

  // Handlers de eventos de Fabric.js
  const handleSelectionCreated = useCallback((e: any) => {
    const activeObject = e.selected[0]
    if (activeObject) {
      setSelectedElement(activeObject.id || null)
      setCanvasState(prev => ({ ...prev, selectedObjectId: activeObject.id || null }))
    }
  }, [])

  const handleSelectionUpdated = useCallback((e: any) => {
    const activeObject = e.selected[0]
    if (activeObject) {
      setSelectedElement(activeObject.id || null)
      setCanvasState(prev => ({ ...prev, selectedObjectId: activeObject.id || null }))
    }
  }, [])

  const handleSelectionCleared = useCallback(() => {
    setSelectedElement(null)
    setCanvasState(prev => ({ ...prev, selectedObjectId: null }))
  }, [])

  const handleObjectModified = useCallback(() => {
    setCanvasState(prev => ({ ...prev, isModified: true }))
    saveToHistory()
  }, [])

  // Funciones de manipulación de elementos
  const addElement = useCallback((element: Partial<DesignElement>) => {
    if (!fabricCanvasRef.current) return

    const newElement: DesignElement = {
      id: `element-${Date.now()}`,
      type: element.type || 'text',
      x: element.x || 100,
      y: element.y || 100,
      width: element.width || 100,
      height: element.height || 100,
      zIndex: elements.length,
      ...element
    }

    setElements(prev => [...prev, newElement])
    createFabricObject(newElement)
    saveToHistory()
  }, [elements])

  const updateElement = useCallback((elementId: string, updates: Partial<DesignElement>) => {
    setElements(prev => 
      prev.map(el => 
        el.id === elementId ? { ...el, ...updates } : el
      )
    )

    // Actualizar objeto de Fabric.js
    const fabricObject = fabricCanvasRef.current?.getObjects().find((obj: any) => obj.id === elementId)
    if (fabricObject) {
      Object.assign(fabricObject, updates)
      fabricCanvasRef.current?.renderAll()
    }

    setCanvasState(prev => ({ ...prev, isModified: true }))
  }, [])

  const removeElement = useCallback((elementId: string) => {
    setElements(prev => prev.filter(el => el.id !== elementId))
    
    // Remover de Fabric.js
    const fabricObject = fabricCanvasRef.current?.getObjects().find((obj: any) => obj.id === elementId)
    if (fabricObject) {
      fabricCanvasRef.current?.remove(fabricObject)
    }

    if (selectedElement === elementId) {
      setSelectedElement(null)
    }

    saveToHistory()
  }, [selectedElement])

  const createFabricObject = (element: DesignElement) => {
    if (!fabricCanvasRef.current) return

    let fabricObject: any

    switch (element.type) {
      case 'text':
        fabricObject = new (fabricCanvasRef.current.constructor as any).Text(element.text || 'Texto', {
          left: element.x,
          top: element.y,
          fontSize: element.fontSize || 20,
          fontFamily: element.fontFamily || 'Arial',
          fill: element.fill || '#000000'
        })
        break
      
      case 'image':
        // Implementar carga de imagen
        break
      
      case 'shape':
        // Implementar formas
        break
      
      default:
        return
    }

    if (fabricObject) {
      fabricObject.id = element.id
      fabricCanvasRef.current.add(fabricObject)
    }
  }

  // Funciones de historial
  const saveToHistory = useCallback(() => {
    if (!fabricCanvasRef.current) return

    const state = JSON.stringify(fabricCanvasRef.current.toJSON())
    historyStack.current = historyStack.current.slice(0, historyPointer.current + 1)
    historyStack.current.push(state)
    historyPointer.current++

    setHistory({
      canUndo: historyPointer.current > 0,
      canRedo: false,
      currentStep: historyPointer.current,
      totalSteps: historyStack.current.length
    })
  }, [])

  const undo = useCallback(() => {
    if (!fabricCanvasRef.current || historyPointer.current <= 0) return

    historyPointer.current--
    const state = historyStack.current[historyPointer.current]
    fabricCanvasRef.current.loadFromJSON(state, () => {
      fabricCanvasRef.current?.renderAll()
      setHistory(prev => ({
        ...prev,
        canUndo: historyPointer.current > 0,
        canRedo: historyPointer.current < historyStack.current.length - 1,
        currentStep: historyPointer.current
      }))
    })
  }, [])

  const redo = useCallback(() => {
    if (!fabricCanvasRef.current || historyPointer.current >= historyStack.current.length - 1) return

    historyPointer.current++
    const state = historyStack.current[historyPointer.current]
    fabricCanvasRef.current.loadFromJSON(state, () => {
      fabricCanvasRef.current?.renderAll()
      setHistory(prev => ({
        ...prev,
        canUndo: historyPointer.current > 0,
        canRedo: historyPointer.current < historyStack.current.length - 1,
        currentStep: historyPointer.current
      }))
    })
  }, [])

  // Funciones de zoom y pan
  const setZoom = useCallback((zoom: number) => {
    const clampedZoom = Math.max(0.1, Math.min(5, zoom))
    setCanvasState(prev => ({ ...prev, zoom: clampedZoom }))
    
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.setZoom(clampedZoom)
    }
  }, [])

  const zoomIn = useCallback(() => {
    setZoom(canvasState.zoom * 1.2)
  }, [canvasState.zoom, setZoom])

  const zoomOut = useCallback(() => {
    setZoom(canvasState.zoom / 1.2)
  }, [canvasState.zoom, setZoom])

  const resetZoom = useCallback(() => {
    setZoom(1)
  }, [setZoom])

  // Función para guardar diseño
  const saveDesign = useCallback(async () => {
    if (!fabricCanvasRef.current) {
      toast.error('Canvas no disponible')
      return
    }

    try {
      const designData = {
        elements,
        canvasData: fabricCanvasRef.current.toJSON(),
        variant: selectedVariant?.id,
        side: currentSide,
        metadata: {
          createdAt: new Date().toISOString(),
          productId,
          version: '1.0'
        }
      }

      if (onSave) {
        await onSave(designData)
        toast.success('Diseño guardado exitosamente')
        setCanvasState(prev => ({ ...prev, isModified: false }))
      }

      return designData
    } catch (error) {
      console.error('Error saving design:', error)
      toast.error('Error guardando el diseño')
      throw error
    }
  }, [elements, selectedVariant, currentSide, productId, onSave])

  const loadDesign = useCallback((designData: any) => {
    if (!fabricCanvasRef.current || !designData) return

    try {
      fabricCanvasRef.current.loadFromJSON(designData.canvasData, () => {
        fabricCanvasRef.current?.renderAll()
        setElements(designData.elements || [])
        setCanvasState(prev => ({ ...prev, isModified: false }))
      })
    } catch (error) {
      console.error('Error loading design:', error)
      toast.error('Error cargando el diseño')
    }
  }, [])

  return {
    // Estado
    selectedVariant,
    currentSide,
    elements,
    selectedElement,
    canvasState,
    toolState,
    history,
    
    // Referencias
    canvasRef,
    fabricCanvasRef,
    
    // Funciones de variantes y lados
    setSelectedVariant,
    setCurrentSide,
    
    // Funciones de elementos
    addElement,
    updateElement,
    removeElement,
    setSelectedElement,
    
    // Funciones de herramientas
    setToolState,
    
    // Funciones de zoom
    setZoom,
    zoomIn,
    zoomOut,
    resetZoom,
    
    // Funciones de historial
    undo,
    redo,
    saveToHistory,
    
    // Funciones de persistencia
    saveDesign,
    loadDesign
  }
}