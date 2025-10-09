"use client"

import React, { memo, useState, useRef, useEffect } from 'react'
import { getHueRotation } from './ColorUtils'

interface IsolatedShapeRendererProps {
  element: any
  zoom: number
}

// Componente aislado para renderizado de formas - evita DOM manipulations problemáticas
export const IsolatedShapeRenderer = memo(({ element, zoom }: IsolatedShapeRendererProps) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    setImageLoaded(false)
    setImageError(false)
  }, [element.src])

  const handleImageLoad = () => {
    setImageLoaded(true)
    setImageError(false)
  }

  const handleImageError = () => {
    setImageError(true)
    setImageLoaded(false)
  }

  // Calcular estilos de filtro para recolorización
  const getFilterStyle = () => {
    if (!element.fillColor || element.fillColor === 'transparent' || element.fillColor === '#000000') {
      return {}
    }

    const hueRotation = getHueRotation(element.fillColor)
    
    // Para colores claros, usar filtros más suaves
    const isLightColor = element.fillColor && element.fillColor.length === 7 && 
      parseInt(element.fillColor.slice(1), 16) > 0x888888
    
    return {
      filter: `hue-rotate(${hueRotation}deg) ${
        isLightColor 
          ? 'brightness(1.1) contrast(0.9)' 
          : 'brightness(0.9) contrast(1.1) saturate(1.2)'
      }`
    }
  }

  // Estilos del contenedor
  const containerStyle = {
    width: `${(element.width || 100) * zoom}px`,
    height: `${(element.height || 100) * zoom}px`,
    position: 'relative' as const,
    opacity: element.opacity !== undefined ? element.opacity : 1,
  }

  // Estilos de borde si existen
  const borderStyle = element.strokeColor && element.strokeColor !== 'transparent' ? {
    border: `${(element.strokeWidth || 1) * zoom}px solid ${element.strokeColor}`,
    borderRadius: element.borderRadius ? `${element.borderRadius * zoom}px` : 0,
  } : {}

  if (imageError) {
    return (
      <div 
        style={containerStyle}
        className="flex items-center justify-center bg-gray-100 text-gray-400 text-xs border border-dashed border-gray-300"
      >
        Error
      </div>
    )
  }

  return (
    <div style={{ ...containerStyle, ...borderStyle }}>
      {element.src && (
        <>
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 animate-pulse">
              <div className="w-4 h-4 bg-gray-300 rounded-full animate-bounce"></div>
            </div>
          )}
          <img
            ref={imgRef}
            src={element.src}
            alt={element.alt || 'Elemento de plantilla'}
            onLoad={handleImageLoad}
            onError={handleImageError}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: imageLoaded ? 'block' : 'none',
              ...getFilterStyle()
            }}
            loading="lazy"
          />
        </>
      )}
      
      {/* Overlay para elementos seleccionados */}
      {element.selected && (
        <div 
          className="absolute inset-0 border-2 border-blue-500 bg-blue-500/10 pointer-events-none"
          style={{ 
            borderRadius: element.borderRadius ? `${element.borderRadius * zoom}px` : 0 
          }}
        />
      )}
    </div>
  )
})

IsolatedShapeRenderer.displayName = 'IsolatedShapeRenderer'