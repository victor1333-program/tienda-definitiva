"use client"

import React, { memo } from 'react'
import { TemplateElement } from '../types'
import { TransparencySection } from '../TransparencySection'

interface ElementPropertiesPanelProps {
  selectedElement: TemplateElement | null
  onElementUpdate: (updates: Partial<TemplateElement>) => void
}

export const ElementPropertiesPanel = memo(({
  selectedElement,
  onElementUpdate
}: ElementPropertiesPanelProps) => {
  if (!selectedElement) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-4">
        <div className="text-center text-gray-500">
          <p className="text-sm">No hay elemento seleccionado</p>
          <p className="text-xs mt-1">Selecciona un elemento para ver sus propiedades</p>
        </div>
      </div>
    )
  }

  const handleInputChange = (property: keyof TemplateElement, value: any) => {
    onElementUpdate({ [property]: value })
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
      <h3 className="font-semibold text-lg mb-4">Propiedades</h3>
      
      {/* Información básica */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo
          </label>
          <p className="text-sm bg-gray-100 px-3 py-2 rounded capitalize">
            {selectedElement.type}
          </p>
        </div>

        {/* Posición */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              X
            </label>
            <input
              type="number"
              value={selectedElement.x || 0}
              onChange={(e) => handleInputChange('x', Number(e.target.value))}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              step="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Y
            </label>
            <input
              type="number"
              value={selectedElement.y || 0}
              onChange={(e) => handleInputChange('y', Number(e.target.value))}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              step="1"
            />
          </div>
        </div>

        {/* Dimensiones */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ancho
            </label>
            <input
              type="number"
              value={selectedElement.width || 100}
              onChange={(e) => handleInputChange('width', Number(e.target.value))}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              min="1"
              step="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alto
            </label>
            <input
              type="number"
              value={selectedElement.height || 100}
              onChange={(e) => handleInputChange('height', Number(e.target.value))}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              min="1"
              step="1"
            />
          </div>
        </div>

        {/* Rotación */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rotación (grados)
          </label>
          <input
            type="number"
            value={selectedElement.rotation || 0}
            onChange={(e) => handleInputChange('rotation', Number(e.target.value))}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            step="1"
            min="-360"
            max="360"
          />
        </div>
      </div>

      {/* Propiedades específicas por tipo */}
      {selectedElement.type === 'text' || selectedElement.type === 'i-text' ? (
        <div className="space-y-4 mb-6">
          <h4 className="font-medium text-gray-800 border-b pb-2">Texto</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contenido
            </label>
            <textarea
              value={selectedElement.text || ''}
              onChange={(e) => handleInputChange('text', e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tamaño de fuente
            </label>
            <input
              type="number"
              value={selectedElement.fontSize || 16}
              onChange={(e) => handleInputChange('fontSize', Number(e.target.value))}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              min="8"
              max="72"
              step="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color del texto
            </label>
            <input
              type="color"
              value={selectedElement.fill || selectedElement.fillColor || '#000000'}
              onChange={(e) => {
                handleInputChange('fill', e.target.value)
                handleInputChange('fillColor', e.target.value)
              }}
              className="w-full h-10 px-1 py-1 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alineación
            </label>
            <select
              value={selectedElement.textAlign || 'left'}
              onChange={(e) => handleInputChange('textAlign', e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="left">Izquierda</option>
              <option value="center">Centro</option>
              <option value="right">Derecha</option>
            </select>
          </div>
        </div>
      ) : (
        <div className="space-y-4 mb-6">
          <h4 className="font-medium text-gray-800 border-b pb-2">Elemento</h4>
          
          {/* Color de relleno */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color de relleno
            </label>
            <input
              type="color"
              value={selectedElement.fillColor || '#000000'}
              onChange={(e) => handleInputChange('fillColor', e.target.value)}
              className="w-full h-10 px-1 py-1 border border-gray-300 rounded"
            />
          </div>

          {/* Color de borde */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color de borde
            </label>
            <input
              type="color"
              value={selectedElement.strokeColor || '#000000'}
              onChange={(e) => handleInputChange('strokeColor', e.target.value)}
              className="w-full h-10 px-1 py-1 border border-gray-300 rounded"
            />
          </div>

          {/* Grosor de borde */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Grosor de borde
            </label>
            <input
              type="number"
              value={selectedElement.strokeWidth || 1}
              onChange={(e) => handleInputChange('strokeWidth', Number(e.target.value))}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              min="0"
              max="10"
              step="0.5"
            />
          </div>
        </div>
      )}

      {/* Transparencia */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-800 border-b pb-2 mb-4">Transparencia</h4>
        <TransparencySection
          elementData={selectedElement}
          onUpdate={(updates) => onElementUpdate(updates)}
        />
      </div>

      {/* Z-Index */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Capa (Z-Index)
        </label>
        <input
          type="number"
          value={selectedElement.zIndex || 0}
          onChange={(e) => handleInputChange('zIndex', Number(e.target.value))}
          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
          step="1"
        />
      </div>
    </div>
  )
})

ElementPropertiesPanel.displayName = 'ElementPropertiesPanel'