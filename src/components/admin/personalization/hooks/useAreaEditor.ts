"use client"

import { useState, useCallback, useRef, useEffect } from 'react'
import { 
  AreaEditorState, 
  PrintArea, 
  MeasurementData, 
  MeasurementLine, 
  Point,
  Tool,
  CanvasState,
  AreaCreationState,
  MeasurementState
} from '../types/AreaEditorTypes'
import { toast } from 'react-hot-toast'

interface UseAreaEditorProps {
  sideImage: string
  existingAreas?: PrintArea[]
  existingMeasurementData?: MeasurementData
  readonly?: boolean
}

export const useAreaEditor = ({
  sideImage,
  existingAreas = [],
  existingMeasurementData,
  readonly = false
}: UseAreaEditorProps) => {
  // Estado principal
  const [state, setState] = useState<AreaEditorState>({
    areas: existingAreas,
    measurementData: existingMeasurementData || {
      pixelsPerCm: null,
      measurementLines: [],
      hasValidMeasurement: false
    },
    canvas: {
      zoom: 1,
      panX: 0,
      panY: 0,
      isDragging: false,
      isDrawing: false,
      tool: 'select',
      selectedArea: null
    },
    areaCreation: {
      isCreating: false,
      startPoint: null,
      currentPoint: null,
      shape: 'rectangle',
      previewArea: null
    },
    measurement: {
      isCreating: false,
      startPoint: null,
      currentPoint: null,
      lines: existingMeasurementData?.measurementLines || [],
      pixelsPerCm: existingMeasurementData?.pixelsPerCm || null
    },
    selectedArea: null,
    imageLoaded: false,
    imageNaturalSize: { width: 0, height: 0 }
  })

  // Referencias
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  // Herramientas disponibles
  const tools: Tool[] = [
    { id: 'select', name: 'Seleccionar', icon: '↖️', cursor: 'default' },
    { id: 'rectangle', name: 'Rectángulo', icon: '⬜', cursor: 'crosshair' },
    { id: 'circle', name: 'Círculo', icon: '⭕', cursor: 'crosshair' },
    { id: 'measure', name: 'Medir', icon: '📏', cursor: 'crosshair' },
    { id: 'pan', name: 'Mover', icon: '✋', cursor: 'grab' }
  ]

  // Cargar imagen
  useEffect(() => {
    if (sideImage) {
      const img = new Image()
      img.onload = () => {
        setState(prev => ({
          ...prev,
          imageLoaded: true,
          imageNaturalSize: { width: img.naturalWidth, height: img.naturalHeight }
        }))
      }
      img.onerror = () => {
        toast.error('Error cargando la imagen')
      }
      img.src = sideImage
    }
  }, [sideImage])

  // Funciones para manejo de áreas
  const addArea = useCallback((area: Omit<PrintArea, 'id'>) => {
    if (readonly) return

    const newArea: PrintArea = {
      ...area,
      id: `area_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      isActive: true,
      opacity: area.opacity || 0.3,
      color: area.color || '#3B82F6'
    }

    setState(prev => ({
      ...prev,
      areas: [...prev.areas, newArea],
      selectedArea: newArea,
      canvas: { ...prev.canvas, selectedArea: newArea.id }
    }))

    toast.success('Área añadida')
    return newArea
  }, [readonly])

  const updateArea = useCallback((areaId: string, updates: Partial<PrintArea>) => {
    if (readonly) return

    setState(prev => ({
      ...prev,
      areas: prev.areas.map(area => 
        area.id === areaId ? { ...area, ...updates } : area
      ),
      selectedArea: prev.selectedArea?.id === areaId 
        ? { ...prev.selectedArea, ...updates }
        : prev.selectedArea
    }))
  }, [readonly])

  const removeArea = useCallback((areaId: string) => {
    if (readonly) return

    setState(prev => ({
      ...prev,
      areas: prev.areas.filter(area => area.id !== areaId),
      selectedArea: prev.selectedArea?.id === areaId ? null : prev.selectedArea,
      canvas: { 
        ...prev.canvas, 
        selectedArea: prev.canvas.selectedArea === areaId ? null : prev.canvas.selectedArea 
      }
    }))

    toast.success('Área eliminada')
  }, [readonly])

  const selectArea = useCallback((areaId: string | null) => {
    const area = areaId ? state.areas.find(a => a.id === areaId) : null
    setState(prev => ({
      ...prev,
      selectedArea: area || null,
      canvas: { ...prev.canvas, selectedArea: areaId }
    }))
  }, [state.areas])

  // Funciones para medición
  const addMeasurementLine = useCallback((line: Omit<MeasurementLine, 'id'>) => {
    if (readonly) return

    const newLine: MeasurementLine = {
      ...line,
      id: `measure_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      color: line.color || '#EF4444'
    }

    setState(prev => ({
      ...prev,
      measurement: {
        ...prev.measurement,
        lines: [...prev.measurement.lines, newLine]
      },
      measurementData: {
        ...prev.measurementData,
        measurementLines: [...(prev.measurementData.measurementLines || []), newLine]
      }
    }))

    return newLine
  }, [readonly])

  const removeMeasurementLine = useCallback((lineId: string) => {
    if (readonly) return

    setState(prev => ({
      ...prev,
      measurement: {
        ...prev.measurement,
        lines: prev.measurement.lines.filter(line => line.id !== lineId)
      },
      measurementData: {
        ...prev.measurementData,
        measurementLines: prev.measurementData.measurementLines?.filter(line => line.id !== lineId) || []
      }
    }))
  }, [readonly])

  const setPixelsPerCm = useCallback((pixelsPerCm: number) => {
    setState(prev => ({
      ...prev,
      measurement: { ...prev.measurement, pixelsPerCm },
      measurementData: {
        ...prev.measurementData,
        pixelsPerCm,
        hasValidMeasurement: pixelsPerCm > 0
      }
    }))
  }, [])

  // Funciones de canvas
  const setTool = useCallback((tool: string) => {
    setState(prev => ({
      ...prev,
      canvas: { ...prev.canvas, tool },
      areaCreation: { ...prev.areaCreation, isCreating: false, previewArea: null },
      measurement: { ...prev.measurement, isCreating: false }
    }))
  }, [])

  const setZoom = useCallback((zoom: number) => {
    const clampedZoom = Math.max(0.1, Math.min(3, zoom))
    setState(prev => ({
      ...prev,
      canvas: { ...prev.canvas, zoom: clampedZoom }
    }))
  }, [])

  const zoomIn = useCallback(() => {
    setZoom(state.canvas.zoom * 1.2)
  }, [state.canvas.zoom, setZoom])

  const zoomOut = useCallback(() => {
    setZoom(state.canvas.zoom / 1.2)
  }, [state.canvas.zoom, setZoom])

  const resetZoom = useCallback(() => {
    setZoom(1)
    setState(prev => ({
      ...prev,
      canvas: { ...prev.canvas, panX: 0, panY: 0 }
    }))
  }, [setZoom])

  // Funciones de interacción con mouse
  const getRelativeCoordinates = useCallback((clientX: number, clientY: number) => {
    if (!canvasRef.current) return { x: 0, y: 0 }

    const rect = canvasRef.current.getBoundingClientRect()
    const x = (clientX - rect.left - state.canvas.panX) / state.canvas.zoom
    const y = (clientY - rect.top - state.canvas.panY) / state.canvas.zoom
    
    return { x, y }
  }, [state.canvas.zoom, state.canvas.panX, state.canvas.panY])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (readonly) return

    const point = getRelativeCoordinates(e.clientX, e.clientY)
    const { tool } = state.canvas

    switch (tool) {
      case 'rectangle':
      case 'circle':
        setState(prev => ({
          ...prev,
          areaCreation: {
            isCreating: true,
            startPoint: point,
            currentPoint: point,
            shape: tool as 'rectangle' | 'circle',
            previewArea: {
              x: point.x,
              y: point.y,
              width: 0,
              height: 0,
              shape: tool as 'rectangle' | 'circle'
            }
          }
        }))
        break

      case 'measure':
        setState(prev => ({
          ...prev,
          measurement: {
            ...prev.measurement,
            isCreating: true,
            startPoint: point,
            currentPoint: point
          }
        }))
        break

      case 'pan':
        setState(prev => ({
          ...prev,
          canvas: { ...prev.canvas, isDragging: true }
        }))
        break

      case 'select':
        // Buscar área bajo el cursor
        const clickedArea = state.areas.find(area => {
          return point.x >= area.x && 
                 point.x <= area.x + area.width &&
                 point.y >= area.y && 
                 point.y <= area.y + area.height
        })
        selectArea(clickedArea?.id || null)
        break
    }
  }, [readonly, getRelativeCoordinates, state.canvas, state.areas, selectArea])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const point = getRelativeCoordinates(e.clientX, e.clientY)

    if (state.areaCreation.isCreating && state.areaCreation.startPoint) {
      const { startPoint } = state.areaCreation
      const width = Math.abs(point.x - startPoint.x)
      const height = Math.abs(point.y - startPoint.y)
      const x = Math.min(startPoint.x, point.x)
      const y = Math.min(startPoint.y, point.y)

      setState(prev => ({
        ...prev,
        areaCreation: {
          ...prev.areaCreation,
          currentPoint: point,
          previewArea: {
            ...prev.areaCreation.previewArea!,
            x,
            y,
            width,
            height
          }
        }
      }))
    }

    if (state.measurement.isCreating) {
      setState(prev => ({
        ...prev,
        measurement: {
          ...prev.measurement,
          currentPoint: point
        }
      }))
    }
  }, [getRelativeCoordinates, state.areaCreation, state.measurement])

  const handleMouseUp = useCallback(() => {
    if (state.areaCreation.isCreating && state.areaCreation.previewArea) {
      const { previewArea } = state.areaCreation
      
      if (previewArea.width > 10 && previewArea.height > 10) {
        addArea({
          name: `Área ${state.areas.length + 1}`,
          shape: previewArea.shape as 'rectangle' | 'circle',
          x: previewArea.x,
          y: previewArea.y,
          width: previewArea.width,
          height: previewArea.height,
          rotation: 0
        })
      }
    }

    if (state.measurement.isCreating && state.measurement.startPoint && state.measurement.currentPoint) {
      const { startPoint, currentPoint } = state.measurement
      const distance = Math.sqrt(
        Math.pow(currentPoint.x - startPoint.x, 2) + 
        Math.pow(currentPoint.y - startPoint.y, 2)
      )

      if (distance > 10) {
        const realDistance = prompt('Ingresa la distancia real en cm:')
        if (realDistance && !isNaN(Number(realDistance))) {
          addMeasurementLine({
            start: startPoint,
            end: currentPoint,
            realDistance: Number(realDistance),
            label: `${realDistance} cm`
          })
          
          const pixelsPerCm = distance / Number(realDistance)
          setPixelsPerCm(pixelsPerCm)
        }
      }
    }

    setState(prev => ({
      ...prev,
      areaCreation: {
        isCreating: false,
        startPoint: null,
        currentPoint: null,
        shape: 'rectangle',
        previewArea: null
      },
      measurement: {
        ...prev.measurement,
        isCreating: false,
        startPoint: null,
        currentPoint: null
      },
      canvas: { ...prev.canvas, isDragging: false }
    }))
  }, [state.areaCreation, state.measurement, state.areas.length, addArea, addMeasurementLine, setPixelsPerCm])

  // Función para convertir coordenadas a relativas
  const convertToRelativeCoordinates = useCallback((areas: PrintArea[]) => {
    if (!state.imageNaturalSize.width || !state.imageNaturalSize.height) {
      return areas
    }

    return areas.map(area => ({
      ...area,
      isRelativeCoordinates: true,
      referenceWidth: state.imageNaturalSize.width,
      referenceHeight: state.imageNaturalSize.height,
      realWidth: area.realWidth || (area.width / (state.measurement.pixelsPerCm || 1)),
      realHeight: area.realHeight || (area.height / (state.measurement.pixelsPerCm || 1))
    }))
  }, [state.imageNaturalSize, state.measurement.pixelsPerCm])

  return {
    // Estado
    state,
    tools,
    
    // Referencias
    canvasRef,
    containerRef,
    imageRef,
    
    // Funciones de áreas
    addArea,
    updateArea,
    removeArea,
    selectArea,
    
    // Funciones de medición
    addMeasurementLine,
    removeMeasurementLine,
    setPixelsPerCm,
    
    // Funciones de canvas
    setTool,
    setZoom,
    zoomIn,
    zoomOut,
    resetZoom,
    
    // Eventos del mouse
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    
    // Utilidades
    convertToRelativeCoordinates,
    getRelativeCoordinates
  }
}