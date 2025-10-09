"use client"

import React, { memo, useEffect } from 'react'
import { PrintArea, MeasurementLine, Point } from '../types/AreaEditorTypes'

interface AreaCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement>
  imageRef: React.RefObject<HTMLImageElement>
  sideImage: string
  areas: PrintArea[]
  selectedAreaId: string | null
  measurementLines: MeasurementLine[]
  previewArea: Partial<PrintArea> | null
  zoom: number
  panX: number
  panY: number
  tool: string
  showMeasurements: boolean
  onMouseDown: (e: React.MouseEvent) => void
  onMouseMove: (e: React.MouseEvent) => void
  onMouseUp: (e: React.MouseEvent) => void
  readonly?: boolean
}

const AreaCanvas = memo(({
  canvasRef,
  imageRef,
  sideImage,
  areas,
  selectedAreaId,
  measurementLines,
  previewArea,
  zoom,
  panX,
  panY,
  tool,
  showMeasurements,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  readonly = false
}: AreaCanvasProps) => {
  // Redibujar canvas cuando cambien las props
  useEffect(() => {
    const canvas = canvasRef.current
    const image = imageRef.current
    if (!canvas || !image) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height

    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Aplicar transformaciones
    ctx.save()
    ctx.scale(zoom, zoom)
    ctx.translate(panX, panY)

    // Dibujar imagen de fondo si está cargada
    if (image.complete && image.naturalWidth !== 0) {
      ctx.drawImage(image, 0, 0, canvas.width / zoom, canvas.height / zoom)
    }

    // Dibujar áreas existentes
    areas.forEach(area => {
      const isSelected = area.id === selectedAreaId
      
      ctx.save()
      ctx.globalAlpha = area.opacity || 0.3
      
      // Color del área
      ctx.fillStyle = isSelected ? '#EF4444' : (area.color || '#3B82F6')
      ctx.strokeStyle = isSelected ? '#DC2626' : '#1E40AF'
      ctx.lineWidth = isSelected ? 3 : 2

      if (area.shape === 'rectangle') {
        ctx.fillRect(area.x, area.y, area.width, area.height)
        ctx.strokeRect(area.x, area.y, area.width, area.height)
      } else if (area.shape === 'circle') {
        const centerX = area.x + area.width / 2
        const centerY = area.y + area.height / 2
        const radius = Math.min(area.width, area.height) / 2
        
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
        ctx.fill()
        ctx.stroke()
      } else if (area.shape === 'ellipse') {
        const centerX = area.x + area.width / 2
        const centerY = area.y + area.height / 2
        
        ctx.beginPath()
        ctx.ellipse(centerX, centerY, area.width / 2, area.height / 2, 0, 0, 2 * Math.PI)
        ctx.fill()
        ctx.stroke()
      }

      ctx.restore()

      // Dibujar nombre del área
      if (area.name) {
        ctx.save()
        ctx.fillStyle = '#000'
        ctx.font = '12px Arial'
        ctx.fillText(area.name, area.x, area.y - 5)
        ctx.restore()
      }

      // Dibujar handles de redimensionamiento si está seleccionada
      if (isSelected && !readonly) {
        const handleSize = 6
        const handles = [
          { x: area.x - handleSize/2, y: area.y - handleSize/2 }, // Top-left
          { x: area.x + area.width - handleSize/2, y: area.y - handleSize/2 }, // Top-right
          { x: area.x - handleSize/2, y: area.y + area.height - handleSize/2 }, // Bottom-left
          { x: area.x + area.width - handleSize/2, y: area.y + area.height - handleSize/2 }, // Bottom-right
          { x: area.x + area.width/2 - handleSize/2, y: area.y - handleSize/2 }, // Top-center
          { x: area.x + area.width/2 - handleSize/2, y: area.y + area.height - handleSize/2 }, // Bottom-center
          { x: area.x - handleSize/2, y: area.y + area.height/2 - handleSize/2 }, // Left-center
          { x: area.x + area.width - handleSize/2, y: area.y + area.height/2 - handleSize/2 } // Right-center
        ]

        ctx.fillStyle = '#FFF'
        ctx.strokeStyle = '#000'
        ctx.lineWidth = 1

        handles.forEach(handle => {
          ctx.fillRect(handle.x, handle.y, handleSize, handleSize)
          ctx.strokeRect(handle.x, handle.y, handleSize, handleSize)
        })
      }
    })

    // Dibujar líneas de medición
    if (showMeasurements) {
      measurementLines.forEach(line => {
        ctx.save()
        ctx.strokeStyle = line.color || '#EF4444'
        ctx.lineWidth = 2
        ctx.setLineDash([5, 5])

        ctx.beginPath()
        ctx.moveTo(line.start.x, line.start.y)
        ctx.lineTo(line.end.x, line.end.y)
        ctx.stroke()

        // Dibujar puntos de inicio y fin
        ctx.fillStyle = line.color || '#EF4444'
        ctx.beginPath()
        ctx.arc(line.start.x, line.start.y, 4, 0, 2 * Math.PI)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(line.end.x, line.end.y, 4, 0, 2 * Math.PI)
        ctx.fill()

        // Dibujar etiqueta
        if (line.label) {
          const midX = (line.start.x + line.end.x) / 2
          const midY = (line.start.y + line.end.y) / 2
          
          ctx.fillStyle = '#000'
          ctx.font = '12px Arial'
          ctx.fillText(line.label, midX, midY - 10)
        }

        ctx.restore()
      })
    }

    // Dibujar área de preview si está creando una
    if (previewArea && previewArea.width && previewArea.height) {
      ctx.save()
      ctx.globalAlpha = 0.5
      ctx.fillStyle = '#10B981'
      ctx.strokeStyle = '#059669'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])

      if (previewArea.shape === 'rectangle') {
        ctx.fillRect(previewArea.x!, previewArea.y!, previewArea.width, previewArea.height)
        ctx.strokeRect(previewArea.x!, previewArea.y!, previewArea.width, previewArea.height)
      } else if (previewArea.shape === 'circle') {
        const centerX = previewArea.x! + previewArea.width / 2
        const centerY = previewArea.y! + previewArea.height / 2
        const radius = Math.min(previewArea.width, previewArea.height) / 2
        
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
        ctx.fill()
        ctx.stroke()
      }

      ctx.restore()
    }

    ctx.restore()
  }, [
    areas, 
    selectedAreaId, 
    measurementLines, 
    previewArea, 
    zoom, 
    panX, 
    panY, 
    showMeasurements,
    readonly
  ])

  const getCursorStyle = () => {
    switch (tool) {
      case 'rectangle':
      case 'circle':
      case 'measure':
        return 'crosshair'
      case 'pan':
        return 'grab'
      case 'select':
      default:
        return 'default'
    }
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Imagen de fondo (oculta, solo para cargar) */}
      <img
        ref={imageRef}
        src={sideImage}
        alt="Side template"
        className="hidden"
        onError={() => console.error('Error loading image:', sideImage)}
      />

      {/* Canvas principal */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ cursor: getCursorStyle() }}
        onMouseDown={readonly ? undefined : onMouseDown}
        onMouseMove={readonly ? undefined : onMouseMove}
        onMouseUp={readonly ? undefined : onMouseUp}
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* Indicador de herramienta activa */}
      <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
        {tool === 'select' && 'Seleccionar'}
        {tool === 'rectangle' && 'Dibujar rectángulo'}
        {tool === 'circle' && 'Dibujar círculo'}
        {tool === 'measure' && 'Medir distancia'}
        {tool === 'pan' && 'Mover vista'}
      </div>

      {/* Grid de referencia */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
          transform: `scale(${zoom}) translate(${panX}px, ${panY}px)`,
          transformOrigin: 'top left'
        }}
      />
    </div>
  )
})

AreaCanvas.displayName = 'AreaCanvas'

export default AreaCanvas