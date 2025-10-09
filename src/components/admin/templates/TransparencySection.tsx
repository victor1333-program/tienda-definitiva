"use client"

import React, { memo } from 'react'

interface StableTransparencySectionProps {
  elementData: any
  onUpdate: (updates: any) => void
}

// SOLUCIÓN RADICAL: Componente completamente aislado replicando la arquitectura del editor funcional
export const StableTransparencySection = memo(({ elementData, onUpdate }: StableTransparencySectionProps) => {
  if (!elementData) return null

  const handleTransparencyChange = (value: number) => {
    const opacity = value / 100
    onUpdate({ 
      opacity: opacity,
      transparency: value 
    })
  }

  return (
    <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          Transparencia
        </label>
        <span className="text-xs text-gray-500">
          {Math.round((elementData.transparency || 0))}%
        </span>
      </div>
      
      <input
        type="range"
        min="0"
        max="100"
        step="1"
        value={elementData.transparency || 0}
        onChange={(e) => handleTransparencyChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        style={{
          background: `linear-gradient(to right, 
            rgba(0,0,0,0.1) 0%, 
            rgba(0,0,0,0.3) ${elementData.transparency || 0}%, 
            #e5e7eb ${elementData.transparency || 0}%, 
            #e5e7eb 100%)`
        }}
      />
      
      <div className="flex justify-between text-xs text-gray-400">
        <span>Opaco</span>
        <span>Transparente</span>
      </div>
    </div>
  )
})

StableTransparencySection.displayName = 'StableTransparencySection'