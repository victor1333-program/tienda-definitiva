"use client"

import React, { lazy, Suspense, memo, useMemo } from 'react'
import { X, Save, Eye, Layers, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTemplateEditor } from './hooks/useTemplateEditor'
import { TemplateCanvas } from './components/TemplateCanvas'
import { ElementPropertiesPanel } from './components/ElementPropertiesPanel'
import { toast } from 'react-hot-toast'
import { TemplateEditorProps } from './types'

// Lazy load del panel de elementos para mejor performance
const ElementsLibrary = lazy(() => import('./ElementsLibrary'))

const TemplateEditorRefactored = memo(({
  isOpen,
  onClose,
  productId,
  templateName,
  category,
  onSave,
  isEditMode = false,
  existingTemplateData = null
}: TemplateEditorProps) => {
  const {
    elements,
    selectedElement,
    currentSide,
    zoom,
    isLoading,
    error,
    addElement,
    updateElement,
    removeElement,
    selectElement,
    setCurrentSide,
    setZoom,
    saveTemplate,
    setError
  } = useTemplateEditor({
    productId,
    templateName,
    category,
    isEditMode,
    existingTemplateData
  })

  // Elemento seleccionado computado
  const selectedElementData = useMemo(() => 
    elements.find(el => el.id === selectedElement) || null,
    [elements, selectedElement]
  )

  // Early return si no está abierto
  if (!isOpen) return null

  // Validación de props
  if (!productId || !onClose || !onSave) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg">
          <p className="text-red-600">Error: Props requeridos faltantes</p>
          <Button onClick={onClose} className="mt-4">Cerrar</Button>
        </div>
      </div>
    )
  }

  const handleSave = async () => {
    try {
      const templateData = await saveTemplate()
      await onSave(templateData)
      toast.success('Template guardado exitosamente')
      onClose()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error guardando template'
      toast.error(errorMessage)
    }
  }

  const handleZoomChange = (newZoom: number) => {
    const clampedZoom = Math.max(0.5, Math.min(2, newZoom))
    setZoom(clampedZoom)
  }

  const handleElementUpdate = (elementId: string, updates: any) => {
    updateElement(elementId, updates)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Delete' && selectedElement) {
      removeElement(selectedElement)
    } else if (e.key === 'Escape') {
      selectElement(null)
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="bg-white w-full h-full max-w-7xl max-h-[90vh] rounded-lg shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditMode ? 'Editar' : 'Crear'} Template: {templateName}
            </h2>
            <p className="text-sm text-gray-600">Categoría: {category}</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Controles de zoom */}
            <div className="flex items-center gap-2 bg-white border rounded-lg px-2 py-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleZoomChange(zoom - 0.1)}
                disabled={zoom <= 0.5}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm font-mono w-12 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleZoomChange(zoom + 0.1)}
                disabled={zoom >= 2}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setZoom(1)}
                title="Reset zoom"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>

            {/* Selector de lado */}
            <select
              value={currentSide}
              onChange={(e) => setCurrentSide(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
            >
              <option value="frontal">Frontal</option>
              <option value="trasera">Trasera</option>
              <option value="lateral">Lateral</option>
            </select>

            {/* Botones de acción */}
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Guardando...' : 'Guardar'}
            </Button>
            
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 m-4 rounded">
            <div className="flex justify-between items-center">
              <span>{error}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setError(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Contenido principal */}
        <div className="flex flex-1 overflow-hidden">
          {/* Panel izquierdo - Elementos */}
          <div className="w-80 bg-gray-50 border-r overflow-y-auto">
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <Layers className="w-5 h-5 mr-2" />
                Elementos
              </h3>
              <Suspense fallback={
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              }>
                <ElementsLibrary onElementAdd={addElement} />
              </Suspense>
            </div>
          </div>

          {/* Canvas central */}
          <div className="flex-1 flex items-center justify-center p-6 bg-gray-100 overflow-auto">
            <TemplateCanvas
              elements={elements}
              selectedElement={selectedElement}
              zoom={zoom}
              onElementSelect={selectElement}
              onElementUpdate={handleElementUpdate}
            />
          </div>

          {/* Panel derecho - Propiedades */}
          <ElementPropertiesPanel
            selectedElement={selectedElementData}
            onElementUpdate={(updates) => {
              if (selectedElement) {
                handleElementUpdate(selectedElement, updates)
              }
            }}
          />
        </div>

        {/* Footer con estadísticas */}
        <div className="border-t bg-gray-50 px-4 py-2">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Elementos: {elements.length}</span>
            <span>Lado: {currentSide}</span>
            <span>
              {selectedElement ? 
                `Seleccionado: ${selectedElementData?.type || 'Desconocido'}` : 
                'Ningún elemento seleccionado'
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  )
})

TemplateEditorRefactored.displayName = 'TemplateEditorRefactored'

export default TemplateEditorRefactored