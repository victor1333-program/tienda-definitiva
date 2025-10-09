"use client"

import React, { memo } from 'react'
import { TemplateElement } from '../types'
import { IsolatedShapeRenderer } from '../IsolatedShapeRenderer'

interface TemplateCanvasProps {
  elements: TemplateElement[]
  selectedElement: string | null
  zoom: number
  onElementSelect: (elementId: string | null) => void
  onElementUpdate: (elementId: string, updates: Partial<TemplateElement>) => void
  canvasWidth?: number
  canvasHeight?: number
}

export const TemplateCanvas = memo(({
  elements,
  selectedElement,
  zoom,
  onElementSelect,
  onElementUpdate,
  canvasWidth = 400,
  canvasHeight = 600
}: TemplateCanvasProps) => {
  const handleElementClick = (elementId: string) => {
    onElementSelect(elementId === selectedElement ? null : elementId)
  }

  const handleElementDragEnd = (elementId: string, newPosition: { x: number; y: number }) => {
    onElementUpdate(elementId, {
      x: newPosition.x,
      y: newPosition.y,
      relativeX: newPosition.x / canvasWidth,
      relativeY: newPosition.y / canvasHeight
    })
  }

  return (
    <div className="relative bg-white border-2 border-gray-200 rounded-lg overflow-hidden">
      <div 
        className="relative"
        style={{ 
          width: canvasWidth * zoom, 
          height: canvasHeight * zoom,
          minWidth: '300px',
          minHeight: '400px'
        }}
      >
        {/* Grid pattern for design assistance */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
            `,
            backgroundSize: `${20 * zoom}px ${20 * zoom}px`
          }}
        />

        {/* Elementos del template */}
        {elements.map((element, index) => (
          <div
            key={element.id}
            className={`absolute cursor-pointer transition-all duration-200 ${
              selectedElement === element.id ? 'ring-2 ring-blue-500 ring-offset-2' : ''
            }`}
            style={{
              left: (element.x || 0) * zoom,
              top: (element.y || 0) * zoom,
              zIndex: element.zIndex || index,
              transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined
            }}
            onClick={() => handleElementClick(element.id)}
          >
            {element.type === 'shape' || element.type === 'image' ? (
              <IsolatedShapeRenderer element={element} zoom={zoom} />
            ) : element.type === 'text' || element.type === 'i-text' ? (
              <div
                style={{
                  fontSize: (element.fontSize || 16) * zoom,
                  fontFamily: element.fontFamily || 'Arial',
                  fontWeight: element.fontWeight || 'normal',
                  color: element.fill || element.fillColor || '#000000',
                  textAlign: element.textAlign as any || 'left',
                  opacity: element.opacity !== undefined ? element.opacity : 1,
                  width: element.width ? element.width * zoom : 'auto',
                  height: element.height ? element.height * zoom : 'auto'
                }}
                className="select-none"
              >
                {element.text || 'Texto'}
              </div>
            ) : null}
          </div>
        ))}

        {/* Indicador de canvas vacío */}
        {elements.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
            <div className="text-center">
              <p>Canvas vacío</p>
              <p className="text-xs mt-1">Arrastra elementos aquí para empezar</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
})

TemplateCanvas.displayName = 'TemplateCanvas'