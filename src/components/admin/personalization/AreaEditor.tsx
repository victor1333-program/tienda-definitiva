"use client"

import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import {
  STANDARD_CANVAS_SIZE,
  absoluteToRelative,
  relativeToAbsolute,
  scaleImageToCanvas,
  calculatePrintAreaOnScaledImage,
  type RelativeCoordinates,
  type AbsoluteCoordinates
} from "@/lib/canvas-utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  X, 
  Ruler, 
  Square, 
  Circle, 
  Triangle, 
  RotateCw, 
  Trash2, 
  Save,
  Move,
  Maximize2,
  Hand,
  Link2,
  Check,
  Target,
  Plus
} from "lucide-react"

interface Point {
  x: number
  y: number
}

interface PrintArea {
  id: string
  name: string
  shape: 'rectangle' | 'circle' | 'ellipse' | 'polygon'
  x: number
  y: number
  width: number
  height: number
  rotation: number
  realWidth?: number  // En cm
  realHeight?: number // En cm
  // Nuevos campos para coordenadas relativas
  isRelativeCoordinates?: boolean
  referenceWidth?: number
  referenceHeight?: number
}

interface MeasurementLine {
  start: Point
  end: Point
  realDistance: number // En cm
}

interface MeasurementData {
  pixelsPerCm?: number | null
  measurementLines?: MeasurementLine[]
  hasValidMeasurement?: boolean
}

interface AreaEditorProps {
  isOpen: boolean
  onClose: () => void
  sideImage: string
  sideName: string
  onSave: (areas: PrintArea[], measurementData?: MeasurementData) => Promise<void>
  existingAreas?: PrintArea[]
  existingMeasurementData?: MeasurementData
}

// Medidas estándar de impresión
const STANDARD_SIZES = [
  { name: "A2", width: 42.0, height: 59.4 },
  { name: "A3", width: 29.7, height: 42.0 },
  { name: "A4", width: 21.0, height: 29.7 },
  { name: "A5", width: 14.8, height: 21.0 },
]

export default function AreaEditor({ 
  isOpen, 
  onClose, 
  sideImage, 
  sideName, 
  onSave,
  existingAreas = [],
  existingMeasurementData
}: AreaEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [canvasSize, setCanvasSize] = useState(STANDARD_CANVAS_SIZE)
  const [imageTransform, setImageTransform] = useState<any>(null)
  
  // Estados del editor - se establece dinámicamente basado en si ya hay medición
  const [mode, setMode] = useState<'measure' | 'area' | 'select'>('measure')
  const [mainAreaName, setMainAreaName] = useState('')
  const [manualWidth, setManualWidth] = useState('')
  const [manualHeight, setManualHeight] = useState('')
  const [proportionalLocked, setProportionalLocked] = useState(false)
  const [proportionalRatio, setProportionalRatio] = useState(1)
  const [areas, setAreas] = useState<PrintArea[]>(existingAreas)
  const [selectedArea, setSelectedArea] = useState<string | null>(null)
  const [measurementLines, setMeasurementLines] = useState<MeasurementLine[]>([])
  const [pixelsPerCm, setPixelsPerCm] = useState<number | null>(null)
  
  // Estados de medición
  const [isDrawingMeasurement, setIsDrawingMeasurement] = useState(false)
  const [measurementStart, setMeasurementStart] = useState<Point | null>(null)
  const [showMeasurementInput, setShowMeasurementInput] = useState(false)
  const [tempMeasurementLine, setTempMeasurementLine] = useState<{start: Point, end: Point} | null>(null)
  const [measurementValue, setMeasurementValue] = useState("")
  
  // Estados de área
  const [isDrawingArea, setIsDrawingArea] = useState(false)
  const [areaStart, setAreaStart] = useState<Point | null>(null)
  const [currentShape, setCurrentShape] = useState<'rectangle' | 'circle' | 'ellipse'>('rectangle')
  const [areaName, setAreaName] = useState("")
  const [standardSize, setStandardSize] = useState<string>("")
  const [tempArea, setTempArea] = useState<{ start: Point, end: Point } | null>(null)
  
  // Estados de transformación
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [isRotating, setIsRotating] = useState(false)
  const [dragStart, setDragStart] = useState<Point | null>(null)
  const [dragMode, setDragMode] = useState<'move' | 'resize' | 'rotate' | null>(null)
  const [initialAreaState, setInitialAreaState] = useState<PrintArea | null>(null)
  
  // Estado para guardar
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (isOpen && sideImage) {
      loadImage()
      
      // Cargar mediciones existentes si las hay
      if (existingMeasurementData) {
        if (existingMeasurementData.pixelsPerCm) {
          setPixelsPerCm(existingMeasurementData.pixelsPerCm)
        }
        if (existingMeasurementData.measurementLines) {
          setMeasurementLines(existingMeasurementData.measurementLines)
        }
      }
      
      // Establecer herramienta por defecto basada en si ya existe medición
      if (existingMeasurementData && existingMeasurementData.pixelsPerCm) {
        // Si ya hay medición, usar herramienta de selección por defecto
        setMode('select')
      } else {
        // Si no hay medición, usar herramienta de medición por defecto
        setMode('measure')
      }
    }
  }, [isOpen, sideImage, existingMeasurementData])

  // Actualizar las áreas cuando cambien las áreas existentes
  useEffect(() => {
    setAreas(existingAreas)
  }, [existingAreas])

  // Actualizar los campos manuales cuando se selecciona un área (solo si no estamos en modo de creación)
  useEffect(() => {
    if (selectedArea && mode === 'select') {
      const area = areas.find(a => a.id === selectedArea)
      if (area) {
        setMainAreaName(area.name || '')
        if (area.realWidth && area.realHeight) {
          setManualWidth(area.realWidth.toFixed(1))
          setManualHeight(area.realHeight.toFixed(1))
          setProportionalRatio(area.realWidth / area.realHeight)
        }
      }
    } else if (!selectedArea && mode !== 'select') {
      // Limpiar campos cuando no hay área seleccionada y no estamos en modo select
      // (esto permite crear nuevas áreas con campos limpios)
    }
  }, [selectedArea, areas, mode])

  // Limpiar campos cuando se cambia de modo select a otro modo
  useEffect(() => {
    if (mode !== 'select') {
      setSelectedArea(null)
    }
  }, [mode])

  useEffect(() => {
    if (imageLoaded) {
      drawCanvas()
    }
  }, [imageLoaded, areas, selectedArea, measurementLines, tempMeasurementLine, tempArea])

  // ESC key handler for canceling measurement
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (mode === 'measure' && (isDrawingMeasurement || showMeasurementInput)) {
          resetMeasurement()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [mode, isDrawingMeasurement, showMeasurementInput])

  const loadImage = () => {
    const img = new Image()
    img.onload = () => {
      setImage(img)
      
      // Usar el tamaño estándar del canvas para consistencia con el editor de cliente
      // Esto asegura que las coordenadas relativas se calculen correctamente
      setCanvasSize(STANDARD_CANVAS_SIZE)
      setImageLoaded(true)
    }
    img.crossOrigin = "anonymous"
    img.src = sideImage
  }

  const drawCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx || !image) return

    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Calcular cómo escalar la imagen usando la misma lógica que el editor de cliente
    const transform = scaleImageToCanvas(
      { width: image.width, height: image.height },
      canvasSize
    )
    
    // Almacenar la transformación para uso en otras funciones
    setImageTransform(transform)
    
    // Dibujar imagen escalada en la posición correcta
    ctx.drawImage(
      image,
      transform.left,
      transform.top,
      transform.width,
      transform.height
    )
    
    // Dibujar guías de alineación central
    drawCenterGuides(ctx)
    
    // Dibujar líneas de medición
    measurementLines.forEach(line => {
      drawMeasurementLine(ctx, line.start, line.end, `${line.realDistance} cm`)
    })
    
    // Dibujar línea de medición temporal
    if (tempMeasurementLine) {
      drawMeasurementLine(ctx, tempMeasurementLine.start, tempMeasurementLine.end, "? cm", true)
    }
    
    // Dibujar áreas
    areas.forEach(area => {
      drawArea(ctx, area, area.id === selectedArea)
    })
    
    // Dibujar área temporal mientras se arrastra
    if (tempArea) {
      drawTempArea(ctx, tempArea.start, tempArea.end)
    }
  }

  const drawCenterGuides = (ctx: CanvasRenderingContext2D) => {
    ctx.save()
    ctx.strokeStyle = '#3b82f6' // Color azul para las guías
    ctx.lineWidth = 1
    ctx.setLineDash([8, 4]) // Línea punteada
    ctx.globalAlpha = 0.6 // Semi-transparente
    
    // Línea vertical central
    const centerX = canvasSize.width / 2
    ctx.beginPath()
    ctx.moveTo(centerX, 0)
    ctx.lineTo(centerX, canvasSize.height)
    ctx.stroke()
    
    // Línea horizontal central
    const centerY = canvasSize.height / 2
    ctx.beginPath()
    ctx.moveTo(0, centerY)
    ctx.lineTo(canvasSize.width, centerY)
    ctx.stroke()
    
    // Indicador del centro con un pequeño círculo
    ctx.setLineDash([]) // Línea sólida para el círculo
    ctx.fillStyle = '#3b82f6'
    ctx.globalAlpha = 0.8
    ctx.beginPath()
    ctx.arc(centerX, centerY, 3, 0, 2 * Math.PI)
    ctx.fill()
    
    // Borde blanco para el círculo central para mejor visibilidad
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 1
    ctx.stroke()
    
    ctx.restore()
  }

  const drawMeasurementLine = (
    ctx: CanvasRenderingContext2D, 
    start: Point, 
    end: Point, 
    label: string,
    isTemp = false
  ) => {
    ctx.save()
    ctx.strokeStyle = isTemp ? '#ff6b35' : '#3b82f6'
    ctx.lineWidth = 2
    ctx.setLineDash(isTemp ? [5, 5] : [])
    
    // Línea principal
    ctx.beginPath()
    ctx.moveTo(start.x, start.y)
    ctx.lineTo(end.x, end.y)
    ctx.stroke()
    
    // Puntos
    ctx.fillStyle = isTemp ? '#ff6b35' : '#3b82f6'
    ctx.beginPath()
    ctx.arc(start.x, start.y, 4, 0, 2 * Math.PI)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(end.x, end.y, 4, 0, 2 * Math.PI)
    ctx.fill()
    
    // Etiqueta
    const midX = (start.x + end.x) / 2
    const midY = (start.y + end.y) / 2
    ctx.fillStyle = 'white'
    ctx.fillRect(midX - 20, midY - 10, 40, 20)
    ctx.strokeStyle = isTemp ? '#ff6b35' : '#3b82f6'
    ctx.strokeRect(midX - 20, midY - 10, 40, 20)
    ctx.fillStyle = isTemp ? '#ff6b35' : '#3b82f6'
    ctx.font = '12px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(label, midX, midY + 3)
    
    ctx.restore()
  }

  const drawArea = (ctx: CanvasRenderingContext2D, area: PrintArea, isSelected: boolean) => {
    if (!imageTransform) return // No renderizar si no hay transformación de imagen
    
    ctx.save()
    ctx.strokeStyle = isSelected ? '#f59e0b' : '#10b981'
    ctx.lineWidth = isSelected ? 3 : 2
    ctx.fillStyle = isSelected ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)'
    
    // Convertir coordenadas usando la misma lógica que el editor de cliente
    let absoluteCoords: AbsoluteCoordinates
    if (area.isRelativeCoordinates) {
      const relativeCoords: RelativeCoordinates = {
        x: area.x,
        y: area.y,
        width: area.width,
        height: area.height
      }
      // Usar la función de cálculo sobre imagen escalada
      absoluteCoords = calculatePrintAreaOnScaledImage(
        relativeCoords,
        imageTransform,
        canvasSize
      )
    } else {
      // Para áreas legacy, convertir a relativas primero
      const referenceSize = {
        width: area.referenceWidth || STANDARD_CANVAS_SIZE.width,
        height: area.referenceHeight || STANDARD_CANVAS_SIZE.height
      }
      
      const relativeCoords: RelativeCoordinates = {
        x: (area.x / referenceSize.width) * 100,
        y: (area.y / referenceSize.height) * 100,
        width: (area.width / referenceSize.width) * 100,
        height: (area.height / referenceSize.height) * 100
      }
      
      absoluteCoords = calculatePrintAreaOnScaledImage(
        relativeCoords,
        imageTransform,
        canvasSize
      )
    }
    
    ctx.translate(absoluteCoords.x + absoluteCoords.width / 2, absoluteCoords.y + absoluteCoords.height / 2)
    ctx.rotate((area.rotation * Math.PI) / 180)
    
    if (area.shape === 'rectangle') {
      ctx.fillRect(-absoluteCoords.width / 2, -absoluteCoords.height / 2, absoluteCoords.width, absoluteCoords.height)
      ctx.strokeRect(-absoluteCoords.width / 2, -absoluteCoords.height / 2, absoluteCoords.width, absoluteCoords.height)
    } else if (area.shape === 'circle') {
      const radius = Math.min(absoluteCoords.width, absoluteCoords.height) / 2
      ctx.beginPath()
      ctx.arc(0, 0, radius, 0, 2 * Math.PI)
      ctx.fill()
      ctx.stroke()
    } else if (area.shape === 'ellipse') {
      ctx.beginPath()
      ctx.ellipse(0, 0, absoluteCoords.width / 2, absoluteCoords.height / 2, 0, 0, 2 * Math.PI)
      ctx.fill()
      ctx.stroke()
    }
    
    // Controles de transformación si está seleccionada (estilo Zakeke)
    if (isSelected) {
      const handleSize = 24
      const iconSize = 16
      
      // Esquinas con iconos específicos - usar coordenadas absolutas
      const corners = [
        { x: -absoluteCoords.width / 2, y: -absoluteCoords.height / 2, icon: '×', color: '#ef4444' }, // Eliminar (top-left)
        { x: absoluteCoords.width / 2, y: -absoluteCoords.height / 2, icon: '↻', color: '#3b82f6' },   // Rotar (top-right)
        { x: -absoluteCoords.width / 2, y: absoluteCoords.height / 2, icon: '✥', color: '#10b981' },   // Mover (bottom-left)
        { x: absoluteCoords.width / 2, y: absoluteCoords.height / 2, icon: '⤡', color: '#f59e0b' }     // Redimensionar (bottom-right)
      ]
      
      corners.forEach((corner, index) => {
        // Fondo circular
        ctx.fillStyle = corner.color
        ctx.beginPath()
        ctx.arc(corner.x, corner.y, handleSize / 2, 0, 2 * Math.PI)
        ctx.fill()
        
        // Borde blanco
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 2
        ctx.stroke()
        
        // Icono
        ctx.fillStyle = '#ffffff'
        ctx.font = `${iconSize}px Arial`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(corner.icon, corner.x, corner.y)
      })
    }
    
    ctx.restore()
    
    // Etiqueta del área con información de dimensiones
    const labelHeight = 40
    const labelWidth = 160
    
    ctx.fillStyle = 'white'
    ctx.fillRect(absoluteCoords.x, absoluteCoords.y - labelHeight, labelWidth, labelHeight)
    ctx.strokeStyle = isSelected ? '#f59e0b' : '#10b981'
    ctx.strokeRect(absoluteCoords.x, absoluteCoords.y - labelHeight, labelWidth, labelHeight)
    ctx.fillStyle = isSelected ? '#f59e0b' : '#10b981'
    ctx.font = '11px Arial'
    ctx.textAlign = 'left'
    
    // Nombre del área
    const areaLabel = `${area.name || `Área ${area.id.slice(-4)}`} ${area.isRelativeCoordinates ? '📐' : ''}`
    ctx.fillText(areaLabel, absoluteCoords.x + 5, absoluteCoords.y - 25)
    
    // Dimensiones
    if (area.realWidth && area.realHeight) {
      const dimensionsText = `${area.realWidth.toFixed(1)} × ${area.realHeight.toFixed(1)} cm`
      ctx.font = '10px Arial'
      ctx.fillStyle = '#666'
      ctx.fillText(dimensionsText, absoluteCoords.x + 5, absoluteCoords.y - 10)
    }
    
    // Mostrar información adicional durante el redimensionamiento
    if (isSelected && isResizing && dragMode === 'resize') {
      ctx.fillStyle = 'rgba(255, 235, 59, 0.9)'
      ctx.fillRect(absoluteCoords.x, absoluteCoords.y - labelHeight - 25, labelWidth, 20)
      ctx.strokeStyle = '#f59e0b'
      ctx.strokeRect(absoluteCoords.x, absoluteCoords.y - labelHeight - 25, labelWidth, 20)
      ctx.fillStyle = '#333'
      ctx.font = 'bold 10px Arial'
      ctx.fillText('Redimensionando...', absoluteCoords.x + 5, absoluteCoords.y - labelHeight - 10)
    }
  }

  const drawTempArea = (ctx: CanvasRenderingContext2D, start: Point, end: Point) => {
    ctx.save()
    ctx.strokeStyle = '#ff6b35'
    ctx.lineWidth = 2
    ctx.fillStyle = 'rgba(255, 107, 53, 0.2)'
    ctx.setLineDash([5, 5])
    
    const width = Math.abs(end.x - start.x)
    const height = Math.abs(end.y - start.y)
    const x = Math.min(start.x, end.x)
    const y = Math.min(start.y, end.y)
    
    if (currentShape === 'rectangle') {
      ctx.fillRect(x, y, width, height)
      ctx.strokeRect(x, y, width, height)
    } else if (currentShape === 'circle') {
      const centerX = x + width / 2
      const centerY = y + height / 2
      const radius = Math.min(width, height) / 2
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
      ctx.fill()
      ctx.stroke()
    } else if (currentShape === 'ellipse') {
      const centerX = x + width / 2
      const centerY = y + height / 2
      ctx.beginPath()
      ctx.ellipse(centerX, centerY, width / 2, height / 2, 0, 0, 2 * Math.PI)
      ctx.fill()
      ctx.stroke()
    }
    
    // Mostrar dimensiones temporales
    ctx.setLineDash([])
    ctx.fillStyle = 'white'
    ctx.fillRect(x, y - 20, 120, 20)
    ctx.strokeStyle = '#ff6b35'
    ctx.strokeRect(x, y - 20, 120, 20)
    ctx.fillStyle = '#ff6b35'
    ctx.font = '12px Arial'
    ctx.textAlign = 'left'
    const realWidth = pixelsPerCm ? (width / pixelsPerCm).toFixed(1) : '?'
    const realHeight = pixelsPerCm ? (height / pixelsPerCm).toFixed(1) : '?'
    ctx.fillText(`${realWidth} × ${realHeight} cm`, x + 5, y - 5)
    
    ctx.restore()
  }

  const getCanvasPoint = (event: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    return {
      x: ((event.clientX - rect.left) * canvas.width) / rect.width,
      y: ((event.clientY - rect.top) * canvas.height) / rect.height,
    }
  }

  // Función para aplicar snap al centro con tolerancia
  const snapToCenter = (point: Point, tolerance: number = 15): Point => {
    const centerX = canvasSize.width / 2
    const centerY = canvasSize.height / 2
    
    let snappedX = point.x
    let snappedY = point.y
    
    // Snap horizontal al centro
    if (Math.abs(point.x - centerX) < tolerance) {
      snappedX = centerX
    }
    
    // Snap vertical al centro
    if (Math.abs(point.y - centerY) < tolerance) {
      snappedY = centerY
    }
    
    return { x: snappedX, y: snappedY }
  }

  // Función para aplicar snap al centro para áreas (considerando el centro del área)
  const snapAreaToCenter = (area: { x: number, y: number, width: number, height: number }, tolerance: number = 15) => {
    const centerX = canvasSize.width / 2
    const centerY = canvasSize.height / 2
    
    // Centro actual del área
    const areaCenterX = area.x + area.width / 2
    const areaCenterY = area.y + area.height / 2
    
    let newX = area.x
    let newY = area.y
    
    // Snap horizontal del centro del área al centro del canvas
    if (Math.abs(areaCenterX - centerX) < tolerance) {
      newX = centerX - area.width / 2
    }
    
    // Snap vertical del centro del área al centro del canvas
    if (Math.abs(areaCenterY - centerY) < tolerance) {
      newY = centerY - area.height / 2
    }
    
    return { x: newX, y: newY }
  }

  // Función para convertir coordenadas del canvas a coordenadas sobre la imagen escalada
  const canvasToImageCoordinates = (canvasCoords: { x: number, y: number, width: number, height: number }) => {
    if (!imageTransform) return canvasCoords
    
    // Verificar si las coordenadas están dentro de la imagen escalada
    const imageLeft = imageTransform.left
    const imageTop = imageTransform.top
    const imageRight = imageTransform.left + imageTransform.width
    const imageBottom = imageTransform.top + imageTransform.height
    
    // Convertir coordenadas del canvas a coordenadas relativas de la imagen
    const relativeX = ((canvasCoords.x - imageLeft) / imageTransform.width) * 100
    const relativeY = ((canvasCoords.y - imageTop) / imageTransform.height) * 100
    const relativeWidth = (canvasCoords.width / imageTransform.width) * 100
    const relativeHeight = (canvasCoords.height / imageTransform.height) * 100
    
    return {
      x: Math.max(0, Math.min(100, relativeX)),
      y: Math.max(0, Math.min(100, relativeY)),
      width: Math.max(0, Math.min(100 - Math.max(0, relativeX), relativeWidth)),
      height: Math.max(0, Math.min(100 - Math.max(0, relativeY), relativeHeight))
    }
  }

  // Función para constrañir la línea de medición a horizontal o vertical
  const constrainMeasurementPoint = (startPoint: Point, currentPoint: Point): Point => {
    const deltaX = Math.abs(currentPoint.x - startPoint.x)
    const deltaY = Math.abs(currentPoint.y - startPoint.y)
    
    // Si el movimiento es más horizontal que vertical, constrañir a horizontal
    if (deltaX > deltaY) {
      return {
        x: currentPoint.x,
        y: startPoint.y
      }
    } else {
      // Si el movimiento es más vertical que horizontal, constrañir a vertical
      return {
        x: startPoint.x,
        y: currentPoint.y
      }
    }
  }

  // Función para escalar área para que encaje en el canvas con margen
  const scaleAreaToFitCanvas = (widthInPixels: number, heightInPixels: number) => {
    const margin = 40 // Margen en píxeles
    const maxWidth = canvasSize.width - margin * 2
    const maxHeight = canvasSize.height - margin * 2
    
    // Si el área encaja perfectamente, no hacer nada
    if (widthInPixels <= maxWidth && heightInPixels <= maxHeight) {
      return { width: widthInPixels, height: heightInPixels, scale: 1 }
    }
    
    // Calcular el factor de escala necesario
    const scaleX = maxWidth / widthInPixels
    const scaleY = maxHeight / heightInPixels
    const scale = Math.min(scaleX, scaleY)
    
    return {
      width: widthInPixels * scale,
      height: heightInPixels * scale,
      scale
    }
  }

  const getControlHandle = (point: Point, area: PrintArea): 'delete' | 'rotate' | 'move' | 'resize' | null => {
    if (!imageTransform) return null
    
    const handleSize = 24
    
    // Convertir coordenadas del área a coordenadas absolutas del canvas
    let absoluteCoords: AbsoluteCoordinates
    if (area.isRelativeCoordinates) {
      const relativeCoords: RelativeCoordinates = {
        x: area.x,
        y: area.y,
        width: area.width,
        height: area.height
      }
      absoluteCoords = calculatePrintAreaOnScaledImage(
        relativeCoords,
        imageTransform,
        canvasSize
      )
    } else {
      // Para áreas legacy
      const referenceSize = {
        width: area.referenceWidth || STANDARD_CANVAS_SIZE.width,
        height: area.referenceHeight || STANDARD_CANVAS_SIZE.height
      }
      
      const relativeCoords: RelativeCoordinates = {
        x: (area.x / referenceSize.width) * 100,
        y: (area.y / referenceSize.height) * 100,
        width: (area.width / referenceSize.width) * 100,
        height: (area.height / referenceSize.height) * 100
      }
      
      absoluteCoords = calculatePrintAreaOnScaledImage(
        relativeCoords,
        imageTransform,
        canvasSize
      )
    }
    
    const centerX = absoluteCoords.x + absoluteCoords.width / 2
    const centerY = absoluteCoords.y + absoluteCoords.height / 2
    
    // Calcular posiciones de los controles en coordenadas del canvas
    const handles = [
      { type: 'delete' as const, x: centerX - absoluteCoords.width / 2, y: centerY - absoluteCoords.height / 2 },
      { type: 'rotate' as const, x: centerX + absoluteCoords.width / 2, y: centerY - absoluteCoords.height / 2 },
      { type: 'move' as const, x: centerX - absoluteCoords.width / 2, y: centerY + absoluteCoords.height / 2 },
      { type: 'resize' as const, x: centerX + absoluteCoords.width / 2, y: centerY + absoluteCoords.height / 2 }
    ]
    
    // Verificar si el click está dentro de algún handle
    for (const handle of handles) {
      const distance = Math.sqrt(Math.pow(point.x - handle.x, 2) + Math.pow(point.y - handle.y, 2))
      if (distance <= handleSize / 2) {
        return handle.type
      }
    }
    
    return null
  }

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getCanvasPoint(event)
    
    if (mode === 'measure') {
      if (!isDrawingMeasurement) {
        setIsDrawingMeasurement(true)
        setMeasurementStart(point)
      } else {
        if (measurementStart) {
          // Constrañir el punto final a línea recta
          const constrainedPoint = constrainMeasurementPoint(measurementStart, point)
          setTempMeasurementLine({ start: measurementStart, end: constrainedPoint })
          setShowMeasurementInput(true)
        }
      }
    } else if (mode === 'area') {
      if (!isDrawingArea) {
        setIsDrawingArea(true)
        setAreaStart(point)
      } else {
        if (areaStart) {
          const width = Math.abs(point.x - areaStart.x)
          const height = Math.abs(point.y - areaStart.y)
          const x = Math.min(point.x, areaStart.x)
          const y = Math.min(point.y, areaStart.y)
          
          // Convertir coordenadas del canvas a coordenadas relativas sobre la imagen
          const relativeCoords = canvasToImageCoordinates({ x, y, width, height })
          
          
          // Calcular medidas reales si tenemos referencia y imageTransform
          let realWidth, realHeight
          if (pixelsPerCm && imageTransform) {
            // Convertir el ancho y alto relativos a píxeles de la imagen original
            const imageWidthInPixels = (relativeCoords.width / 100) * imageTransform.width
            const imageHeightInPixels = (relativeCoords.height / 100) * imageTransform.height
            realWidth = imageWidthInPixels / pixelsPerCm
            realHeight = imageHeightInPixels / pixelsPerCm
          }
          
          const areaNameFromDrawing = mainAreaName.trim() || `Área ${areas.length + 1}`
          
          const newArea: PrintArea = {
            id: Date.now().toString(),
            name: areaNameFromDrawing,
            shape: currentShape,
            x: relativeCoords.x,
            y: relativeCoords.y,
            width: relativeCoords.width,
            height: relativeCoords.height,
            rotation: 0,
            realWidth,
            realHeight,
            isRelativeCoordinates: true,
            referenceWidth: STANDARD_CANVAS_SIZE.width,
            referenceHeight: STANDARD_CANVAS_SIZE.height
          }
          
          setAreas(prev => [...prev, newArea])
          setIsDrawingArea(false)
          setAreaStart(null)
          setTempArea(null)
          // No resetear mainAreaName aquí - mantener el nombre para futuras áreas
          
          // Cambiar automáticamente a modo seleccionar y seleccionar el área recién creada
          setMode('select')
          setSelectedArea(newArea.id)
        }
      }
    } else if (mode === 'select') {
      // Primero verificar si el click es en un control de área seleccionada
      if (selectedArea) {
        const area = areas.find(a => a.id === selectedArea)
        if (area) {
          const controlType = getControlHandle(point, area)
          if (controlType) {
            handleControlClick(controlType, area)
            return
          }
        }
      }
      
      // Si no es un control, detectar click en área (solo si no estamos arrastrando)
      if (!isDragging && !isResizing && !isRotating) {
        const clickedArea = areas.find(area => {
          if (!imageTransform) return false
          
          // Convertir coordenadas del área a coordenadas absolutas del canvas
          let absoluteCoords: AbsoluteCoordinates
          if (area.isRelativeCoordinates) {
            const relativeCoords: RelativeCoordinates = {
              x: area.x,
              y: area.y,
              width: area.width,
              height: area.height
            }
            absoluteCoords = calculatePrintAreaOnScaledImage(
              relativeCoords,
              imageTransform,
              canvasSize
            )
          } else {
            // Para áreas legacy
            const referenceSize = {
              width: area.referenceWidth || STANDARD_CANVAS_SIZE.width,
              height: area.referenceHeight || STANDARD_CANVAS_SIZE.height
            }
            
            const relativeCoords: RelativeCoordinates = {
              x: (area.x / referenceSize.width) * 100,
              y: (area.y / referenceSize.height) * 100,
              width: (area.width / referenceSize.width) * 100,
              height: (area.height / referenceSize.height) * 100
            }
            
            absoluteCoords = calculatePrintAreaOnScaledImage(
              relativeCoords,
              imageTransform,
              canvasSize
            )
          }
          
          return point.x >= absoluteCoords.x && 
                 point.x <= absoluteCoords.x + absoluteCoords.width && 
                 point.y >= absoluteCoords.y && 
                 point.y <= absoluteCoords.y + absoluteCoords.height
        })
        
        if (clickedArea) {
          setSelectedArea(clickedArea.id)
          setMode('select')
        } else {
          setSelectedArea(null)
        }
      }
    }
  }

  const handleControlClick = (controlType: 'delete' | 'rotate' | 'move' | 'resize', area: PrintArea) => {
    switch (controlType) {
      case 'delete':
        if (confirm('¿Estás seguro de que quieres eliminar esta área?')) {
          handleDeleteArea(area.id)
        }
        break
      case 'rotate':
        handleRotateArea(area.id, 45)
        break
      case 'move':
        // Los modos de arrastre se configuran en handleMouseDown
        break
      case 'resize':
        // Los modos de arrastre se configuran en handleMouseDown
        break
    }
  }

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getCanvasPoint(event)
    const canvas = canvasRef.current
    
    if (mode === 'measure' && isDrawingMeasurement && measurementStart) {
      // Constrañir el punto a línea recta durante el movimiento
      const constrainedPoint = constrainMeasurementPoint(measurementStart, point)
      setTempMeasurementLine({ start: measurementStart, end: constrainedPoint })
    } else if (mode === 'area' && isDrawingArea && areaStart) {
      setTempArea({ start: areaStart, end: point })
    } else if (mode === 'select' && (isDragging || isResizing || isRotating) && selectedArea && dragStart) {
      handleAreaTransform(point)
    } else if (mode === 'select' && selectedArea && !isDragging && !isResizing && !isRotating) {
      // Cambiar cursor basado en el control sobre el que esté el mouse
      const area = areas.find(a => a.id === selectedArea)
      if (area && canvas) {
        const controlType = getControlHandle(point, area)
        if (controlType === 'resize') {
          canvas.style.cursor = 'nw-resize'
        } else if (controlType === 'move') {
          canvas.style.cursor = 'move'
        } else if (controlType === 'rotate') {
          canvas.style.cursor = 'alias'
        } else if (controlType === 'delete') {
          canvas.style.cursor = 'pointer'
        } else {
          canvas.style.cursor = 'crosshair'
        }
      }
    } else if (canvas) {
      // Cursor por defecto según el modo
      if (mode === 'measure') {
        canvas.style.cursor = 'crosshair'
      } else if (mode === 'area') {
        canvas.style.cursor = 'crosshair'
      } else {
        canvas.style.cursor = 'default'
      }
    }
  }

  const handleAreaTransform = (currentPoint: Point) => {
    if (!selectedArea || !dragStart || !initialAreaState || !imageTransform) return
    
    setAreas(prev => prev.map(area => {
      if (area.id === selectedArea) {
        if (dragMode === 'move') {
          // Para movimiento, calcular el delta desde el inicio
          const deltaX = currentPoint.x - dragStart.x
          const deltaY = currentPoint.y - dragStart.y
          
          // Convertir delta de coordenadas de canvas a coordenadas relativas
          const relativeDeltaX = (deltaX / imageTransform.width) * 100
          const relativeDeltaY = (deltaY / imageTransform.height) * 100
          
          let newX = Math.max(0, Math.min(100 - initialAreaState.width, initialAreaState.x + relativeDeltaX))
          let newY = Math.max(0, Math.min(100 - initialAreaState.height, initialAreaState.y + relativeDeltaY))
          
          return {
            ...area,
            x: newX,
            y: newY
          }
        } else if (dragMode === 'resize') {
          // Para redimensionamiento desde la esquina inferior derecha
          const deltaX = currentPoint.x - dragStart.x
          const deltaY = currentPoint.y - dragStart.y
          
          // Convertir delta de coordenadas de canvas a coordenadas relativas
          const relativeDeltaX = (deltaX / imageTransform.width) * 100
          const relativeDeltaY = (deltaY / imageTransform.height) * 100
          
          // Calcular nuevas dimensiones desde el estado inicial
          let newWidth = Math.max(5, initialAreaState.width + relativeDeltaX) // Mínimo 5% de ancho
          let newHeight = Math.max(5, initialAreaState.height + relativeDeltaY) // Mínimo 5% de alto
          
          // Asegurar que el área no se salga de los límites
          newWidth = Math.min(newWidth, 100 - initialAreaState.x)
          newHeight = Math.min(newHeight, 100 - initialAreaState.y)
          
          // Calcular medidas reales usando las dimensiones absolutas para el cálculo de píxeles
          let realWidth, realHeight
          if (pixelsPerCm && imageTransform) {
            const absoluteWidth = (newWidth / 100) * imageTransform.width
            const absoluteHeight = (newHeight / 100) * imageTransform.height
            realWidth = absoluteWidth / pixelsPerCm
            realHeight = absoluteHeight / pixelsPerCm
          }
          
          return {
            ...area,
            width: newWidth,
            height: newHeight,
            realWidth: realWidth || area.realWidth,
            realHeight: realHeight || area.realHeight
          }
        } else if (dragMode === 'rotate') {
          // Para rotación, calcular el ángulo desde el centro del área
          const centerX = initialAreaState.x + initialAreaState.width / 2
          const centerY = initialAreaState.y + initialAreaState.height / 2
          
          // Convertir coordenadas del canvas a coordenadas relativas para el cálculo del ángulo
          const relativeCurrentX = ((currentPoint.x - imageTransform.left) / imageTransform.width) * 100
          const relativeCurrentY = ((currentPoint.y - imageTransform.top) / imageTransform.height) * 100
          
          const angle = Math.atan2(relativeCurrentY - centerY, relativeCurrentX - centerX)
          const degrees = (angle * 180) / Math.PI
          
          return {
            ...area,
            rotation: Math.round(degrees) % 360
          }
        }
      }
      return area
    }))
  }

  const handleMeasurementConfirm = () => {
    if (tempMeasurementLine && measurementValue) {
      const realDistance = parseFloat(measurementValue)
      if (!isNaN(realDistance) && realDistance > 0) {
        const newMeasurement: MeasurementLine = {
          start: tempMeasurementLine.start,
          end: tempMeasurementLine.end,
          realDistance
        }
        
        // Reemplazar la medición anterior con la nueva (solo una activa)
        setMeasurementLines([newMeasurement])
        
        // Calcular píxeles por cm
        const pixelDistance = Math.sqrt(
          Math.pow(tempMeasurementLine.end.x - tempMeasurementLine.start.x, 2) +
          Math.pow(tempMeasurementLine.end.y - tempMeasurementLine.start.y, 2)
        )
        const newPixelsPerCm = pixelDistance / realDistance
        setPixelsPerCm(newPixelsPerCm)
        
        // Recalcular las medidas reales de todas las áreas existentes
        setAreas(prevAreas => {
          const updatedAreas = prevAreas.map(area => ({
            ...area,
            realWidth: area.width / newPixelsPerCm,
            realHeight: area.height / newPixelsPerCm
          }))
          
          // Notificar si se recalcularon áreas existentes
          if (prevAreas.length > 0) {
            // Mostrar mensaje temporal de éxito
            const notification = document.createElement('div')
            notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-[100] text-sm'
            notification.textContent = `✓ ${prevAreas.length} área(s) recalculada(s) con nueva escala`
            document.body.appendChild(notification)
            setTimeout(() => {
              document.body.removeChild(notification)
            }, 3000)
          }
          
          return updatedAreas
        })
      }
    }
    
    resetMeasurement()
    
    // Cambiar automáticamente a la herramienta de rectángulo después de medir
    setMode('area')
    setCurrentShape('rectangle')
  }

  const resetMeasurement = () => {
    setIsDrawingMeasurement(false)
    setMeasurementStart(null)
    setTempMeasurementLine(null)
    setShowMeasurementInput(false)
    setMeasurementValue("")
  }

  const applyStandardSize = () => {
    if (!standardSize || !selectedArea || !pixelsPerCm) {
      console.log('Cannot apply standard size:', { standardSize, selectedArea, pixelsPerCm })
      return
    }
    
    const size = STANDARD_SIZES.find(s => s.name === standardSize)
    if (!size) {
      console.log('Size not found:', standardSize)
      return
    }
    
    console.log('Applying standard size:', size)
    
    const originalWidthInPixels = size.width * pixelsPerCm
    const originalHeightInPixels = size.height * pixelsPerCm
    
    // Escalar el área para que encaje en el canvas si es necesario
    const scaled = scaleAreaToFitCanvas(originalWidthInPixels, originalHeightInPixels)
    const widthInPixels = scaled.width
    const heightInPixels = scaled.height
    
    setAreas(prev => prev.map(area => 
      area.id === selectedArea 
        ? { 
            ...area, 
            width: widthInPixels, 
            height: heightInPixels,
            realWidth: size.width,
            realHeight: size.height
          }
        : area
    ))
    
    if (scaled.scale < 1) {
      console.log(`Área escalada al ${(scaled.scale * 100).toFixed(0)}% para encajar en el canvas`)
      
      // Mostrar notificación temporal
      const notification = document.createElement('div')
      notification.className = 'fixed top-4 right-4 bg-orange-500 text-white px-4 py-2 rounded-lg shadow-lg z-[100] text-sm'
      notification.textContent = `Área escalada al ${(scaled.scale * 100).toFixed(0)}% para encajar en el canvas`
      document.body.appendChild(notification)
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification)
        }
      }, 3000)
    }
    
    // Actualizar campos manuales
    setManualWidth(size.width.toString())
    setManualHeight(size.height.toString())
    setProportionalRatio(size.width / size.height)
    
    console.log('Standard size applied successfully')
  }

  const applyManualSize = () => {
    if (!selectedArea || !pixelsPerCm || !manualWidth || !manualHeight) {
      console.log('Cannot apply manual size:', { selectedArea, pixelsPerCm, manualWidth, manualHeight })
      return
    }
    
    const width = parseFloat(manualWidth)
    const height = parseFloat(manualHeight)
    
    if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
      console.log('Invalid manual dimensions:', { width, height })
      return
    }
    
    console.log('Applying manual size:', { width, height })
    
    const widthInPixels = width * pixelsPerCm
    const heightInPixels = height * pixelsPerCm
    
    setAreas(prev => prev.map(area => 
      area.id === selectedArea 
        ? { 
            ...area, 
            width: widthInPixels, 
            height: heightInPixels,
            realWidth: width,
            realHeight: height
          }
        : area
    ))
    
    console.log('Manual size applied successfully')
  }

  const handleSaveAreaConfiguration = () => {
    console.log('🔍 handleSaveAreaConfiguration called')
    console.log('🔍 mainAreaName:', mainAreaName)
    console.log('🔍 mainAreaName.trim():', mainAreaName.trim())
    console.log('🔍 areas.length:', areas.length)
    
    if (!pixelsPerCm || !manualWidth || !manualHeight || !imageTransform) {
      console.log('Cannot save area configuration - missing data')
      return
    }
    
    const width = parseFloat(manualWidth)
    const height = parseFloat(manualHeight)
    
    if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
      console.log('Invalid manual dimensions:', { width, height })
      return
    }
    
    // Convertir medidas a píxeles y luego a coordenadas relativas
    const widthInPixels = width * pixelsPerCm
    const heightInPixels = height * pixelsPerCm
    
    // Convertir a coordenadas relativas basadas en la imagen transformada
    const relativeWidth = (widthInPixels / imageTransform.width) * 100
    const relativeHeight = (heightInPixels / imageTransform.height) * 100
    
    // Centrar el área en la imagen (50% = centro)
    const centerX = 50
    const centerY = 50
    const relativeX = centerX - relativeWidth / 2
    const relativeY = centerY - relativeHeight / 2
    
    // Asegurar que el área no se salga de los límites de la imagen
    const finalX = Math.max(0, Math.min(100 - relativeWidth, relativeX))
    const finalY = Math.max(0, Math.min(100 - relativeHeight, relativeY))
    
    const finalAreaName = mainAreaName.trim() || `Área ${areas.length + 1}`
    console.log('🔍 finalAreaName will be:', finalAreaName)
    
    const newArea: PrintArea = {
      id: Date.now().toString(),
      name: finalAreaName,
      shape: currentShape,
      x: finalX,
      y: finalY,
      width: relativeWidth,
      height: relativeHeight,
      rotation: 0,
      realWidth: width,
      realHeight: height,
      isRelativeCoordinates: true,
      referenceWidth: STANDARD_CANVAS_SIZE.width,
      referenceHeight: STANDARD_CANVAS_SIZE.height
    }
    
    console.log('Creating new area from configuration:', {
      name: newArea.name,
      realDimensions: { width, height },
      pixelDimensions: { widthInPixels, heightInPixels },
      relativeDimensions: { x: finalX, y: finalY, width: relativeWidth, height: relativeHeight },
      imageTransform
    })
    
    setAreas(prev => [...prev, newArea])
    
    // Limpiar solo los campos de tamaño para permitir crear otra área con el mismo nombre base
    setManualWidth('')
    setManualHeight('')
    setStandardSize('')
    setSelectedArea(newArea.id) // Seleccionar la nueva área
    setMode('select')
    
    console.log('Área guardada exitosamente y campos limpiados')
  }

  const updateAreaName = async () => {
    if (!selectedArea || mode !== 'select') {
      console.log('No area selected or not in select mode')
      return
    }
    
    const newName = mainAreaName.trim()
    if (!newName) {
      console.log('Empty area name')
      return
    }
    
    console.log('🔍 Updating area name from API call. Selected area ID:', selectedArea, 'New name:', newName)
    
    try {
      setIsSaving(true)
      
      // Call API to update the area name
      const response = await fetch(`/api/personalization/areas/${selectedArea}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newName
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to update area name')
      }
      
      const result = await response.json()
      console.log('🔍 Area name update API response:', result)
      
      if (result.success || result.data) {
        // Update local state with the updated area from the API
        setAreas(prev => prev.map(area =>
          area.id === selectedArea
            ? { ...area, name: newName }
            : area
        ))

        console.log('✅ Area name updated successfully in database and local state')
      } else {
        console.error('❌ Failed to update area name:', result.error)
      }
    } catch (error) {
      console.error('❌ Error updating area name:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleManualWidthChange = (value: string) => {
    setManualWidth(value)
    if (proportionalLocked && proportionalRatio > 0) {
      const width = parseFloat(value)
      if (!isNaN(width) && width > 0) {
        setManualHeight((width / proportionalRatio).toFixed(1))
      }
    }
  }

  const handleManualHeightChange = (value: string) => {
    setManualHeight(value)
    if (proportionalLocked && proportionalRatio > 0) {
      const height = parseFloat(value)
      if (!isNaN(height) && height > 0) {
        setManualWidth((height * proportionalRatio).toFixed(1))
      }
    }
  }

  const handleDeleteArea = (areaId: string) => {
    setAreas(prev => prev.filter(area => area.id !== areaId))
    if (selectedArea === areaId) {
      setSelectedArea(null)
    }
  }

  const handleRotateArea = (areaId: string, degrees: number) => {
    setAreas(prev => prev.map(area => 
      area.id === areaId 
        ? { ...area, rotation: (area.rotation + degrees) % 360 }
        : area
    ))
  }

  const centerSelectedArea = () => {
    if (!selectedArea) return
    
    setAreas(prev => prev.map(area => {
      if (area.id === selectedArea) {
        // Usar coordenadas relativas (0-100%) para centrar
        // El centro está en 50%, 50%
        const centerX = 50
        const centerY = 50
        
        // Calcular nueva posición para centrar el área
        const newX = centerX - area.width / 2
        const newY = centerY - area.height / 2
        
        // Asegurar que el área no se salga de los límites (0-100%)
        const finalX = Math.max(0, Math.min(newX, 100 - area.width))
        const finalY = Math.max(0, Math.min(newY, 100 - area.height))
        
        console.log('Centrando área:', {
          areaId: area.id,
          originalPosition: { x: area.x, y: area.y },
          newPosition: { x: finalX, y: finalY },
          areaDimensions: { width: area.width, height: area.height }
        })
        
        return {
          ...area,
          x: finalX,
          y: finalY
        }
      }
      return area
    }))
  }

  // Funciones legacy para compatibilidad con el panel lateral
  const deleteArea = () => {
    if (selectedArea) {
      handleDeleteArea(selectedArea)
    }
  }

  const rotateArea = (degrees: number) => {
    if (selectedArea) {
      handleRotateArea(selectedArea, degrees)
    }
  }

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getCanvasPoint(event)
    
    if (mode === 'select' && selectedArea) {
      const area = areas.find(a => a.id === selectedArea)
      if (area) {
        const controlType = getControlHandle(point, area)
        if (controlType) {
          // Guardar el estado inicial del área para cálculos relativos
          setInitialAreaState({ ...area })
          
          // Configurar el drag start para controles
          setDragStart(point)
          setDragMode(controlType)
          
          if (controlType === 'move') {
            setIsDragging(true)
          } else if (controlType === 'resize') {
            setIsResizing(true)
          } else if (controlType === 'rotate') {
            setIsRotating(true)
          }
          
          // Prevenir el evento de click
          event.preventDefault()
          return
        }
      }
    }
  }

  const handleMouseUp = () => {
    // Terminar cualquier operación de arrastre
    if (isDragging || isResizing || isRotating) {
      setIsDragging(false)
      setIsResizing(false)
      setIsRotating(false)
      setDragStart(null)
      setDragMode(null)
      setInitialAreaState(null)
    }
  }

  const handleSave = async () => {
    console.log('🔍 handleSave called - saving all areas')
    console.log('🔍 areas to save:', areas.map(a => ({ id: a.id, name: a.name })))
    
    setIsSaving(true)
    try {
      // Incluir metadatos de medición junto con las áreas
      const saveData = {
        areas,
        measurementData: {
          pixelsPerCm,
          measurementLines,
          hasValidMeasurement: pixelsPerCm !== null && measurementLines.length > 0
        }
      }
      
      await onSave(areas, saveData.measurementData)
      onClose()
    } catch (error) {
      console.error('Error al guardar áreas:', error)
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] flex overflow-hidden">
        {/* Panel lateral */}
        <div className="w-80 border-r bg-gray-50 p-4 overflow-y-auto flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Editor de Áreas</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-4">
            {/* Configuración del Área */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Configuración del Área</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Nombre */}
                <div>
                  <Label className="text-xs">
                    {selectedArea && mode === 'select' ? 'Editar Nombre' : 'Nombre del Área'}
                  </Label>
                  <div className="flex gap-1">
                    <Input
                      value={mainAreaName}
                      onChange={(e) => {
                        console.log('🔍 mainAreaName input changed from:', mainAreaName, 'to:', e.target.value)
                        setMainAreaName(e.target.value)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          if (selectedArea && mode === 'select') {
                            updateAreaName()
                          }
                        }
                      }}
                      placeholder={selectedArea && mode === 'select' ? 'Editar nombre del área' : 'Ej: Logo frontal'}
                      className="h-8 text-xs flex-1"
                    />
                    {selectedArea && mode === 'select' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={updateAreaName}
                        disabled={!selectedArea || !mainAreaName.trim() || isSaving}
                        className="h-8 px-2"
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Tamaño */}
                <div>
                  <Label className="text-xs">Tamaño</Label>
                  <Select value={standardSize} onValueChange={(value) => {
                    setStandardSize(value)
                    
                    if (!value || !pixelsPerCm) return
                    
                    const size = STANDARD_SIZES.find(s => s.name === value)
                    if (!size) return
                    
                    const originalWidthInPixels = size.width * pixelsPerCm
                    const originalHeightInPixels = size.height * pixelsPerCm
                    
                    // Escalar el área para que encaje en el canvas si es necesario
                    const scaled = scaleAreaToFitCanvas(originalWidthInPixels, originalHeightInPixels)
                    const widthInPixels = scaled.width
                    const heightInPixels = scaled.height
                    
                    if (selectedArea) {
                      // Si hay un área seleccionada, modificar esa área
                      setAreas(prev => prev.map(area => 
                        area.id === selectedArea 
                          ? { 
                              ...area, 
                              width: widthInPixels, 
                              height: heightInPixels,
                              realWidth: size.width,
                              realHeight: size.height
                            }
                          : area
                      ))
                      console.log('Tamaño aplicado a área existente:', size, scaled.scale < 1 ? `(escalado ${(scaled.scale * 100).toFixed(0)}%)` : '')
                    } else {
                      // Si no hay área seleccionada, crear una nueva área centrada
                      const centerX = canvasSize.width / 2
                      const centerY = canvasSize.height / 2
                      const x = centerX - widthInPixels / 2
                      const y = centerY - heightInPixels / 2
                      
                      // Convertir a coordenadas relativas
                      const absoluteCoords = {
                        x: Math.max(0, x),
                        y: Math.max(0, y),
                        width: widthInPixels,
                        height: heightInPixels
                      }
                      const relativeCoords = absoluteToRelative(absoluteCoords, canvasSize)
                      
                      console.log('🔍 Creating area from standard size - mainAreaName:', mainAreaName)
                      const areaNameFromStandard = mainAreaName.trim() || `Área ${size.name}`
                      console.log('🔍 Final area name from standard size:', areaNameFromStandard)
                      
                      const newArea: PrintArea = {
                        id: Date.now().toString(),
                        name: areaNameFromStandard,
                        shape: 'rectangle',
                        x: relativeCoords.x,
                        y: relativeCoords.y,
                        width: relativeCoords.width,
                        height: relativeCoords.height,
                        rotation: 0,
                        realWidth: size.width,
                        realHeight: size.height,
                        isRelativeCoordinates: true,
                        referenceWidth: canvasSize.width,
                        referenceHeight: canvasSize.height
                      }
                      
                      setAreas(prev => [...prev, newArea])
                      setSelectedArea(newArea.id)
                      setMode('select')
                      console.log('Nueva área creada con tamaño:', size, scaled.scale < 1 ? `(escalado ${(scaled.scale * 100).toFixed(0)}%)` : '')
                    }
                    
                    // Mostrar notificación si el área fue escalada
                    if (scaled.scale < 1) {
                      const notification = document.createElement('div')
                      notification.className = 'fixed top-4 right-4 bg-orange-500 text-white px-4 py-2 rounded-lg shadow-lg z-[100] text-sm'
                      notification.textContent = `Área escalada al ${(scaled.scale * 100).toFixed(0)}% para encajar en el canvas`
                      document.body.appendChild(notification)
                      setTimeout(() => {
                        if (document.body.contains(notification)) {
                          document.body.removeChild(notification)
                        }
                      }, 3000)
                    }
                    
                    // Actualizar campos manuales
                    setManualWidth(size.width.toString())
                    setManualHeight(size.height.toString())
                    setProportionalRatio(size.width / size.height)
                  }}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Seleccionar tamaño" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border shadow-lg z-[10001]">
                      {STANDARD_SIZES.map(size => (
                        <SelectItem key={size.name} value={size.name}>
                          {size.name} ({size.width} × {size.height} cm)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Medidas manuales */}
                <div>
                  <Label className="text-xs">
                    {selectedArea && mode === 'select' ? 'Redimensionar Área' : 'Medidas del Área'}
                  </Label>
                  <div className="flex items-center gap-2 mb-2">
                    <Input
                      type="number"
                      step="0.1"
                      value={manualWidth}
                      onChange={(e) => {
                        handleManualWidthChange(e.target.value)
                        // Auto-aplicar si estamos editando un área existente
                        if (selectedArea && mode === 'select' && e.target.value && manualHeight) {
                          setTimeout(() => applyManualSize(), 100)
                        }
                      }}
                      placeholder="Ancho (cm)"
                      className="h-8 text-xs"
                    />
                    <Button
                      size="sm"
                      variant={proportionalLocked ? 'default' : 'outline'}
                      onClick={() => setProportionalLocked(!proportionalLocked)}
                      className="h-8 px-2"
                    >
                      <Link2 className="h-3 w-3" />
                    </Button>
                    <Input
                      type="number"
                      step="0.1"
                      value={manualHeight}
                      onChange={(e) => {
                        handleManualHeightChange(e.target.value)
                        // Auto-aplicar si estamos editando un área existente
                        if (selectedArea && mode === 'select' && manualWidth && e.target.value) {
                          setTimeout(() => applyManualSize(), 100)
                        }
                      }}
                      placeholder="Alto (cm)"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="flex gap-2">
                    {selectedArea && mode === 'select' ? (
                      // Modo edición: Botón para aplicar cambios manualmente
                      <>
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={applyManualSize}
                          disabled={!selectedArea || !pixelsPerCm || !manualWidth || !manualHeight}
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Aplicar Medidas
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={centerSelectedArea}
                          disabled={!selectedArea}
                          className="px-3"
                          title="Centrar área en el canvas"
                        >
                          <Target className="h-3 w-3" />
                        </Button>
                      </>
                    ) : (
                      // Modo creación: Botón para guardar nueva área
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={handleSaveAreaConfiguration}
                        disabled={!pixelsPerCm || !manualWidth || !manualHeight}
                      >
                        <Save className="h-3 w-3 mr-1" />
                        Guardar Área
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Herramientas y Formas */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-6">
                  <CardTitle className="text-sm">Herramientas</CardTitle>
                  <CardTitle className="text-sm">Formas</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Herramientas y Formas */}
                <div className="flex items-start gap-6">
                  {/* Herramientas */}
                  <div className="flex gap-1">
                    <Button
                      variant={mode === 'measure' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setMode('measure')}
                      className="h-8 px-2"
                    >
                      <Ruler className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  {/* Formas */}
                  <div className="flex gap-1">
                    <Button
                      variant={currentShape === 'rectangle' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setCurrentShape('rectangle')
                        setMode('area')
                      }}
                      className="h-8 px-2"
                    >
                      <Square className="h-3 w-3" />
                    </Button>
                    <Button
                      variant={currentShape === 'circle' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setCurrentShape('circle')
                        setMode('area')
                      }}
                      className="h-8 px-2"
                    >
                      <Circle className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Información de herramientas */}
                {mode === 'measure' && (
                  <div>
                    <p className="text-xs text-gray-600">
                      Haz clic en dos puntos de la prenda y especifica la distancia real. 
                      Una nueva medición reemplazará la anterior{areas.length > 0 ? ' y recalculará las áreas existentes' : ''}.
                    </p>
                    {pixelsPerCm && (
                      <div className="text-xs bg-green-50 p-2 rounded space-y-1 mt-2">
                        <div>✓ Escala establecida: {pixelsPerCm.toFixed(2)} píxeles/cm</div>
                        <div className="text-green-700">Las áreas se muestran con medidas reales</div>
                      </div>
                    )}
                    {measurementLines.length > 0 && (
                      <div className="space-y-2 mt-2">
                        <Label className="text-xs">Medición activa:</Label>
                        <div className="flex items-center justify-between bg-blue-50 p-2 rounded">
                          <span className="text-xs text-blue-800">
                            {measurementLines[0].realDistance} cm
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 px-2 text-xs"
                            onClick={() => {
                              setMeasurementLines([])
                              setPixelsPerCm(null)
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {mode === 'area' && (
                  <div>
                    <p className="text-xs text-gray-600">
                      Haz clic y arrastra para crear el área con forma {currentShape === 'rectangle' ? 'rectangular' : 'circular'}
                    </p>
                  </div>
                )}

                {mode === 'select' && (
                  <div>
                    <p className="text-xs text-gray-600">
                      Haz clic en un área para seleccionarla y poder moverla o editarla. Las guías centrales (líneas azules) ayudan a alinear elementos al centro.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Lista de áreas */}
            {areas.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Áreas Creadas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {areas.map(area => (
                    <div 
                      key={area.id}
                      className={`p-2 rounded cursor-pointer ${
                        selectedArea === area.id ? 'bg-orange-100 border border-orange-300' : 'bg-white border'
                      }`}
                      onClick={() => {
                        setSelectedArea(area.id)
                        setMode('select')
                      }}
                    >
                      <div className="text-xs font-medium">{area.name}</div>
                      <div className="text-xs text-gray-500">
                        {area.shape} - {area.realWidth?.toFixed(1) || '?'} × {area.realHeight?.toFixed(1) || '?'} cm
                      </div>
                      {pixelsPerCm && area.realWidth && area.realHeight && (
                        <div className="text-xs text-green-600">
                          ✓ Medidas calculadas con escala
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Botón para crear nueva área */}
            {pixelsPerCm && (
              <Card>
                <CardContent className="p-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      // Limpiar campos para crear nueva área
                      setMainAreaName('')
                      setManualWidth('')
                      setManualHeight('')
                      setStandardSize('')
                      setSelectedArea(null)
                      setMode('area')
                      setCurrentShape('rectangle')
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Nueva Área
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="mt-6 flex gap-2">
            <Button onClick={handleSave} className="flex-1" disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Guardando...' : 'Guardar'}
            </Button>
            <Button variant="outline" onClick={onClose} disabled={isSaving}>
              Cancelar
            </Button>
          </div>
        </div>

        {/* Canvas principal */}
        <div className="flex-1 p-4 flex flex-col bg-gray-100 overflow-hidden">
          <h3 className="text-lg font-medium mb-4 text-center text-gray-800">{sideName}</h3>
          <div className="flex-1 flex items-center justify-center min-h-0">
            <div className="bg-white p-4 rounded-lg shadow-inner max-w-full max-h-full flex items-center justify-center">
              {imageLoaded ? (
                <canvas
                  ref={canvasRef}
                  width={canvasSize.width}
                  height={canvasSize.height}
                  className="border border-gray-300 cursor-crosshair max-w-full max-h-full object-contain"
                  onClick={handleCanvasClick}
                  onMouseMove={handleMouseMove}
                  onMouseDown={handleMouseDown}
                  onMouseUp={handleMouseUp}
                />
              ) : (
                <div className="w-96 h-96 flex items-center justify-center border border-gray-300">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-600">Cargando imagen...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal para ingresar medida */}
      {showMeasurementInput && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000]">
          <div className="bg-white rounded-lg shadow-2xl w-80 max-w-[90vw]">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Especificar Medida</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <Label>Distancia real (cm)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={measurementValue}
                  onChange={(e) => setMeasurementValue(e.target.value)}
                  placeholder="Ej: 20.5"
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleMeasurementConfirm} className="flex-1">
                  Confirmar
                </Button>
                <Button variant="outline" onClick={resetMeasurement}>
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  // Render modal using portal to avoid z-index issues with admin layout
  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null
}