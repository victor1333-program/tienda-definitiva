"use client"

import React, { memo, forwardRef } from 'react'
import { ProductVariant, ProductSide } from '../types/ZakekeTypes'

interface ZakekeCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement>
  selectedVariant: ProductVariant | null
  currentSide: string
  zoom: number
  width?: number
  height?: number
  className?: string
}

export const ZakekeCanvas = memo(forwardRef<HTMLDivElement, ZakekeCanvasProps>(({
  canvasRef,
  selectedVariant,
  currentSide,
  zoom,
  width = 600,
  height = 400,
  className = ''
}, ref) => {
  // Obtener el lado actual de la variante seleccionada
  const currentSideData = selectedVariant?.sides.find(side => side.id === currentSide)
  
  return (
    <div 
      ref={ref}
      className={`relative bg-gray-50 border-2 border-gray-200 rounded-lg overflow-hidden ${className}`}
      style={{ width: width * zoom, height: height * zoom }}
    >
      {/* Imagen de fondo del producto si está disponible */}
      {currentSideData?.backgroundImage && (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
          style={{ 
            backgroundImage: `url(${currentSideData.backgroundImage})`,
            transform: `scale(${zoom})`,
            transformOrigin: 'top left'
          }}
        />
      )}

      {/* Canvas principal de Fabric.js */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'top left'
        }}
      />

      {/* Overlay para áreas de impresión si están definidas */}
      {currentSideData?.printAreas && currentSideData.printAreas.map((area) => (
        <div
          key={area.id}
          className="absolute border-2 border-dashed border-blue-400 bg-blue-100/20 pointer-events-none"
          style={{
            left: area.relativeX * width * zoom,
            top: area.relativeY * height * zoom,
            width: area.relativeWidth * width * zoom,
            height: area.relativeHeight * height * zoom,
          }}
          title={`Área de impresión: ${area.name}`}
        >
          <div className="absolute -top-6 left-0 text-xs text-blue-600 bg-white px-1 rounded">
            {area.name}
          </div>
        </div>
      ))}

      {/* Grid de referencia */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
          transform: `scale(${zoom})`,
          transformOrigin: 'top left'
        }}
      />

      {/* Indicador de canvas vacío */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-gray-400 text-center">
          <p className="text-sm">Canvas de diseño</p>
          <p className="text-xs mt-1">
            {selectedVariant ? `${selectedVariant.name} - ${currentSideData?.displayName || currentSide}` : 'Sin variante'}
          </p>
        </div>
      </div>

      {/* Información de zoom en esquina */}
      <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded pointer-events-none">
        Zoom: {Math.round(zoom * 100)}%
      </div>
    </div>
  )
}))

ZakekeCanvas.displayName = 'ZakekeCanvas'