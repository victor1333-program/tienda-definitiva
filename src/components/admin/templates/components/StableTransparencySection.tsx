"use client"

import React, { useState, useEffect, useCallback, memo } from 'react'
import { DEFAULT_COLOR_PALETTE } from './ColorUtils'

interface StableTransparencySectionProps {
  elementData: {
    id: string
    fillColor?: string
    strokeColor?: string
    lastFillColor?: string
    lastStrokeColor?: string
  }
  onUpdate: (id: string, updates: any) => void
}

export const StableTransparencySection = memo<StableTransparencySectionProps>(({ 
  elementData, 
  onUpdate 
}) => {
  // Estado local estable - EXACTO al editor funcional
  const [fillColor, setFillColor] = useState(elementData.fillColor || '#ff6b35')
  const [strokeColor, setStrokeColor] = useState(elementData.strokeColor || '#000000')
  
  // Sincronizar con props solo cuando el elemento cambia
  useEffect(() => {
    setFillColor(elementData.fillColor || '#ff6b35')
    setStrokeColor(elementData.strokeColor || '#000000')
  }, [elementData.id]) // Solo cuando cambia el ID del elemento
  
  // Handlers estables
  const handleFillTransparency = useCallback(() => {
    if (fillColor === 'transparent') {
      // Volver al último color sólido
      const lastColor = elementData.lastFillColor || '#ff6b35'
      setFillColor(lastColor)
      onUpdate(elementData.id, { fillColor: lastColor })
    } else {
      // Hacer transparente
      setFillColor('transparent')
      onUpdate(elementData.id, { 
        fillColor: 'transparent',
        lastFillColor: fillColor
      })
    }
  }, [fillColor, elementData.id, elementData.lastFillColor, onUpdate])
  
  const handleFillColorChange = useCallback((color: string) => {
    setFillColor(color)
    onUpdate(elementData.id, { 
      fillColor: color,
      lastFillColor: color
    })
  }, [elementData.id, onUpdate])
  
  const handleStrokeTransparency = useCallback(() => {
    if (strokeColor === 'transparent') {
      // Volver al último color sólido
      const lastColor = elementData.lastStrokeColor || '#000000'
      setStrokeColor(lastColor)
      onUpdate(elementData.id, { strokeColor: lastColor })
    } else {
      // Hacer transparente
      setStrokeColor('transparent')
      onUpdate(elementData.id, { 
        strokeColor: 'transparent',
        lastStrokeColor: strokeColor
      })
    }
  }, [strokeColor, elementData.id, elementData.lastStrokeColor, onUpdate])
  
  const handleStrokeColorChange = useCallback((color: string) => {
    setStrokeColor(color)
    onUpdate(elementData.id, { 
      strokeColor: color,
      lastStrokeColor: color
    })
  }, [elementData.id, onUpdate])
  
  return (
    <>
      {/* Color de relleno */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">Color de relleno</label>
        <div className="grid grid-cols-8 gap-1 mb-3">
          {DEFAULT_COLOR_PALETTE.map((color, index) => (
            <button
              key={`fill-color-${index}-${color}`}
              onClick={() => handleFillColorChange(color)}
              className={`w-6 h-6 rounded border transition-all hover:scale-110 ${
                fillColor === color ? 'border-gray-900 shadow-md border-2' : 'border-gray-300'
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
        
        {/* Botón transparente y selector de color */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleFillTransparency}
            className={`px-3 py-2 text-xs rounded border-2 transition-all ${
              fillColor === 'transparent' 
                ? 'bg-blue-100 border-blue-400 text-blue-800 shadow-md' 
                : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400'
            }`}
            title={fillColor === 'transparent' ? 'Volver a color sólido' : 'Sin relleno (transparente)'}
          >
            {fillColor === 'transparent' ? '✓ Transparente' : '∅ Transparente'}
          </button>
          <input
            type="color"
            value={fillColor === 'transparent' ? (elementData.lastFillColor || '#ff6b35') : fillColor}
            onChange={(e) => handleFillColorChange(e.target.value)}
            className="flex-1 h-10 rounded border border-gray-300"
            disabled={fillColor === 'transparent'}
          />
        </div>
      </div>

      {/* Color de borde */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">Color de borde</label>
        
        {/* Botón transparente y selector de color */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleStrokeTransparency}
            className={`px-3 py-2 text-xs rounded border-2 transition-all ${
              strokeColor === 'transparent'
                ? 'bg-blue-100 border-blue-400 text-blue-800 shadow-md' 
                : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400'
            }`}
            title={strokeColor === 'transparent' ? 'Volver a color sólido' : 'Sin borde (transparente)'}
          >
            {strokeColor === 'transparent' ? '✓ Transparente' : '∅ Transparente'}
          </button>
          
          <input
            type="color"
            value={strokeColor === 'transparent' ? (elementData.lastStrokeColor || '#000000') : strokeColor}
            onChange={(e) => handleStrokeColorChange(e.target.value)}
            className="flex-1 h-10 rounded border border-gray-300"
            disabled={strokeColor === 'transparent'}
          />
        </div>
      </div>
    </>
  )
})