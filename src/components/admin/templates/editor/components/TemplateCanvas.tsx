"use client"

import React, { memo, useRef, useEffect, useCallback, useMemo } from 'react'
import { useTemplateEditor } from '../context/TemplateEditorContext'

export const TemplateCanvas = memo(() => {
  const canvasRef = useRef<HTMLDivElement>(null)
  const { 
    state, 
    updateElement, 
    selectElements, 
    moveElement,
    saveToHistory 
  } = useTemplateEditor()
  
  const [isDragging, setIsDragging] = React.useState(false)
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 })
  const [dragElementId, setDragElementId] = React.useState<string | null>(null)

  // Estilos del canvas
  const canvasStyle = useMemo(() => ({
    width: state.canvasWidth * state.zoom,
    height: state.canvasHeight * state.zoom,
    transform: `scale(${state.zoom})`,
    transformOrigin: 'top left',
    position: 'relative' as const,
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    cursor: state.activeTool === 'select' ? 'default' : 'crosshair'
  }), [state.canvasWidth, state.canvasHeight, state.zoom, state.activeTool])

  // Grid overlay
  const gridStyle = useMemo(() => {
    if (!state.showGrid) return {}
    
    const gridSize = 20 * state.zoom
    return {
      backgroundImage: `
        linear-gradient(to right, #f1f5f9 1px, transparent 1px),
        linear-gradient(to bottom, #f1f5f9 1px, transparent 1px)
      `,
      backgroundSize: `${gridSize}px ${gridSize}px`
    }
  }, [state.showGrid, state.zoom])

  // Manejo de clics en el canvas
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      // Clic en el canvas vacío - deseleccionar todo
      selectElements([])
    }
  }, [selectElements])

  // Manejo de drag & drop
  const handleMouseDown = useCallback((e: React.MouseEvent, elementId: string) => {
    e.stopPropagation()
    setIsDragging(true)
    setDragElementId(elementId)
    setDragStart({ x: e.clientX, y: e.clientY })
    selectElements([elementId])
  }, [selectElements])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragElementId) return

    const deltaX = (e.clientX - dragStart.x) / state.zoom
    const deltaY = (e.clientY - dragStart.y) / state.zoom

    // Snap to grid si está habilitado
    const snapSize = state.snapToGrid ? 10 : 1
    const snappedDeltaX = Math.round(deltaX / snapSize) * snapSize
    const snappedDeltaY = Math.round(deltaY / snapSize) * snapSize

    const element = state.elements.find(el => el.id === dragElementId)
    if (element) {
      updateElement(dragElementId, {
        x: Math.max(0, Math.min(state.canvasWidth - element.width, element.x + snappedDeltaX)),
        y: Math.max(0, Math.min(state.canvasHeight - element.height, element.y + snappedDeltaY))
      })
    }

    setDragStart({ x: e.clientX, y: e.clientY })
  }, [isDragging, dragElementId, dragStart, state.zoom, state.snapToGrid, state.elements, state.canvasWidth, state.canvasHeight, updateElement])

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false)
      setDragElementId(null)
      saveToHistory()
    }
  }, [isDragging, saveToHistory])

  // Event listeners globales para drag
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  // Renderizar elemento individual
  const renderElement = useCallback((element: typeof state.elements[0]) => {
    const isSelected = state.selectedElementIds.includes(element.id)
    
    const elementStyle = {
      position: 'absolute' as const,
      left: element.x,
      top: element.y,
      width: element.width,
      height: element.height,
      transform: `rotate(${element.rotation}deg) scale(${element.scaleX}, ${element.scaleY})`,
      opacity: element.opacity,
      zIndex: element.zIndex,
      visibility: element.isVisible ? 'visible' as const : 'hidden' as const,
      cursor: element.isLocked ? 'not-allowed' : 'move',
      border: isSelected ? '2px solid #3b82f6' : '1px solid transparent',
      borderRadius: '2px'
    }

    const handleElementClick = (e: React.MouseEvent) => {
      e.stopPropagation()
      if (!element.isLocked) {
        selectElements([element.id])
      }
    }

    return (
      <div
        key={element.id}
        style={elementStyle}
        onClick={handleElementClick}
        onMouseDown={!element.isLocked ? (e) => handleMouseDown(e, element.id) : undefined}
        className={`${isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}
      >
        {element.type === 'text' && (
          <div
            style={{
              fontSize: element.fontSize || 16,
              fontFamily: element.fontFamily || 'Arial',
              fontWeight: element.fontWeight || 'normal',
              fontStyle: element.fontStyle || 'normal',
              color: element.fill || '#000000',
              textAlign: element.textAlign as any || 'left',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              userSelect: 'none',
              pointerEvents: 'none'
            }}
          >
            {element.text || 'Texto'}
          </div>
        )}

        {element.type === 'image' && element.src && (
          <img
            src={element.src}
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              userSelect: 'none',
              pointerEvents: 'none'
            }}
            crossOrigin={element.crossOrigin}
          />
        )}

        {element.type === 'shape' && (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: element.fillColor === 'transparent' ? 'transparent' : (element.fillColor || '#ff6b35'),
              border: element.strokeWidth && element.strokeColor
                ? `${element.strokeWidth}px solid ${element.strokeColor}`
                : 'none',
              borderRadius: element.shapeType === 'circle' ? '50%' : 
                           element.shapeType === 'star' ? '8px' :
                           element.shapeType === 'heart' ? '8px' : '0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '24px',
              userSelect: 'none',
              pointerEvents: 'none'
            }}
          >
            {element.shapeType === 'star' && '⭐'}
            {element.shapeType === 'heart' && '❤️'}
          </div>
        )}

        {/* Handles de redimensionamiento para elementos seleccionados */}
        {isSelected && !element.isLocked && (
          <>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-sm cursor-se-resize" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-sm cursor-nw-resize" />
            <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 rounded-sm cursor-ne-resize" />
            <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-sm cursor-sw-resize" />
          </>
        )}
      </div>
    )
  }, [state.selectedElementIds, selectElements, handleMouseDown])

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-8">
      <div className="flex justify-center">
        <div
          ref={canvasRef}
          style={{
            ...canvasStyle,
            ...gridStyle
          }}
          onClick={handleCanvasClick}
          className="relative shadow-lg"
        >
          {/* Reglas */}
          {state.showRulers && (
            <>
              {/* Regla horizontal */}
              <div 
                className="absolute -top-6 left-0 h-6 bg-gray-100 border-b border-gray-300"
                style={{ width: state.canvasWidth }}
              >
                {Array.from({ length: Math.floor(state.canvasWidth / 50) + 1 }, (_, i) => (
                  <div
                    key={i}
                    className="absolute top-0 text-xs text-gray-500"
                    style={{ 
                      left: i * 50,
                      transform: 'translateX(-50%)'
                    }}
                  >
                    {i * 50}
                  </div>
                ))}
              </div>

              {/* Regla vertical */}
              <div 
                className="absolute -left-6 top-0 w-6 bg-gray-100 border-r border-gray-300"
                style={{ height: state.canvasHeight }}
              >
                {Array.from({ length: Math.floor(state.canvasHeight / 50) + 1 }, (_, i) => (
                  <div
                    key={i}
                    className="absolute left-0 text-xs text-gray-500"
                    style={{ 
                      top: i * 50,
                      transform: 'translateY(-50%) rotate(-90deg)',
                      transformOrigin: 'center',
                      width: '24px',
                      textAlign: 'center'
                    }}
                  >
                    {i * 50}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Elementos del canvas */}
          {state.elements.map(renderElement)}

          {/* Overlay de herramienta activa */}
          {state.activeTool !== 'select' && (
            <div 
              className="absolute inset-0 pointer-events-none bg-blue-500 bg-opacity-5"
              style={{ zIndex: 9999 }}
            >
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-75 text-white px-3 py-1 rounded text-sm">
                {state.activeTool === 'text' && 'Haz clic para agregar texto'}
                {state.activeTool === 'image' && 'Haz clic para agregar imagen'}
                {state.activeTool === 'shape' && 'Haz clic para agregar forma'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

TemplateCanvas.displayName = 'TemplateCanvas'