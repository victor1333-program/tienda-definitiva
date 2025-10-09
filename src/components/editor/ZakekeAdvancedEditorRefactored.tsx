"use client"

import React, { memo, useMemo, Suspense, lazy } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useZakekeEditor } from './hooks/useZakekeEditor'
import { ZakekeToolbar } from './components/ZakekeToolbar'
import { ZakekeCanvas } from './components/ZakekeCanvas'
import { ZakekePropertiesPanel } from './components/ZakekePropertiesPanel'
import { ZakekeAdvancedEditorProps } from './types/ZakekeTypes'
import { toast } from 'react-hot-toast'

// Lazy load componentes pesados
const ImageLibrary = lazy(() => import('./ImageLibrary'))
const ShapesLibrary = lazy(() => import('./ShapesLibrary'))

const ZakekeAdvancedEditorRefactored = memo(({
  productId,
  variants,
  onSave,
  onCancel,
  initialDesignData,
  isReadOnly = false,
  showVariantSelector = true,
  customCanvasSize
}: ZakekeAdvancedEditorProps) => {
  const {
    selectedVariant,
    currentSide,
    elements,
    selectedElement,
    canvasState,
    toolState,
    history,
    canvasRef,
    fabricCanvasRef,
    setSelectedVariant,
    setCurrentSide,
    addElement,
    updateElement,
    removeElement,
    setSelectedElement,
    setToolState,
    setZoom,
    zoomIn,
    zoomOut,
    resetZoom,
    undo,
    redo,
    saveDesign,
    loadDesign
  } = useZakekeEditor({
    productId,
    variants,
    initialDesignData,
    onSave
  })

  // Elemento seleccionado computado
  const selectedElementData = useMemo(() =>
    elements.find(el => el.id === selectedElement) || null,
    [elements, selectedElement]
  )

  // Lados disponibles de la variante actual
  const availableSides = useMemo(() =>
    selectedVariant?.sides?.filter(side => side.isActive) || [],
    [selectedVariant]
  )

  // Handlers de la toolbar
  const handleToolChange = (tool: 'select' | 'text' | 'image' | 'shape' | 'draw') => {
    setToolState(prev => ({ ...prev, activeTool: tool }))
    
    // Acciones específicas por herramienta
    switch (tool) {
      case 'text':
        addElement({
          type: 'text',
          text: 'Nuevo texto',
          fontSize: 24,
          fontFamily: 'Arial',
          fill: '#000000'
        })
        break
      case 'image':
        // Trigger file upload
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'image/*'
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0]
          if (file) {
            handleImageUpload(file)
          }
        }
        input.click()
        break
      case 'shape':
        // Mostrar librería de formas
        break
    }
  }

  const handleImageUpload = async (file: File) => {
    try {
      const reader = new FileReader()
      reader.onload = (e) => {
        const src = e.target?.result as string
        addElement({
          type: 'image',
          src,
          width: 200,
          height: 200
        })
        toast.success('Imagen añadida al diseño')
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Error subiendo la imagen')
    }
  }

  const handleDeleteSelected = () => {
    if (selectedElement) {
      removeElement(selectedElement)
      toast.success('Elemento eliminado')
    }
  }

  const handleCopySelected = () => {
    if (selectedElementData) {
      const copiedElement = {
        ...selectedElementData,
        x: (selectedElementData.x || 0) + 20,
        y: (selectedElementData.y || 0) + 20
      }
      addElement(copiedElement)
      toast.success('Elemento copiado')
    }
  }

  const handleSave = async () => {
    try {
      await saveDesign()
    } catch (error) {
      // Error ya manejado en saveDesign
    }
  }

  const handleExportDesign = () => {
    if (fabricCanvasRef.current) {
      const dataURL = fabricCanvasRef.current.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 2
      })
      
      const link = document.createElement('a')
      link.download = `design-${productId}-${Date.now()}.png`
      link.href = dataURL
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success('Diseño exportado')
    }
  }

  // Validaciones
  if (!variants || variants.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-500">No hay variantes disponibles para este producto</p>
      </Card>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header con selectores */}
      {showVariantSelector && (
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold">Editor Avanzado</h2>
              <Badge variant="outline">Producto: {productId}</Badge>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Selector de variante */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Variante:</label>
                <Select
                  value={selectedVariant?.id || ''}
                  onValueChange={(value) => {
                    const variant = variants.find(v => v.id === value)
                    if (variant) setSelectedVariant(variant)
                  }}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Seleccionar variante" />
                  </SelectTrigger>
                  <SelectContent>
                    {variants.map(variant => (
                      <SelectItem key={variant.id} value={variant.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: variant.color }}
                          />
                          {variant.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Selector de lado */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Lado:</label>
                <Select
                  value={currentSide}
                  onValueChange={setCurrentSide}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSides.map(side => (
                      <SelectItem key={side.id} value={side.id}>
                        {side.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <ZakekeToolbar
        toolState={toolState}
        historyState={history}
        canvasZoom={canvasState.zoom}
        isModified={canvasState.isModified}
        selectedElementId={selectedElement}
        onToolChange={handleToolChange}
        onUndo={undo}
        onRedo={redo}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetZoom={resetZoom}
        onDeleteSelected={handleDeleteSelected}
        onCopySelected={handleCopySelected}
        onSave={handleSave}
        onImportImage={() => handleToolChange('image')}
        onExportDesign={handleExportDesign}
      />

      {/* Contenido principal */}
      <div className="flex-1 flex overflow-hidden">
        {/* Panel izquierdo - Librería de elementos */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <h3 className="font-semibold mb-4">Elementos</h3>
            
            {/* Tabs para diferentes librerías */}
            <div className="space-y-4">
              {toolState.activeTool === 'image' && (
                <Suspense fallback={
                  <div className="animate-pulse">
                    <div className="grid grid-cols-2 gap-2">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-gray-200 aspect-square rounded" />
                      ))}
                    </div>
                  </div>
                }>
                  <ImageLibrary onImageSelect={(imageData) => {
                    addElement({
                      type: 'image',
                      src: imageData.src,
                      width: imageData.width || 200,
                      height: imageData.height || 200
                    })
                  }} />
                </Suspense>
              )}
              
              {toolState.activeTool === 'shape' && (
                <Suspense fallback={
                  <div className="animate-pulse">
                    <div className="grid grid-cols-3 gap-2">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-gray-200 aspect-square rounded" />
                      ))}
                    </div>
                  </div>
                }>
                  <ShapesLibrary onShapeSelect={(shapeData) => {
                    addElement({
                      type: 'shape',
                      src: shapeData.src,
                      width: shapeData.width || 100,
                      height: shapeData.height || 100,
                      shapeType: shapeData.id
                    })
                  }} />
                </Suspense>
              )}
              
              {toolState.activeTool === 'select' && (
                <div className="text-center text-gray-500 py-8">
                  <p className="text-sm">Selecciona una herramienta para ver los elementos disponibles</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Canvas central */}
        <div className="flex-1 flex items-center justify-center p-6">
          <ZakekeCanvas
            canvasRef={canvasRef}
            selectedVariant={selectedVariant}
            currentSide={currentSide}
            zoom={canvasState.zoom}
            width={customCanvasSize?.width || 600}
            height={customCanvasSize?.height || 400}
          />
        </div>

        {/* Panel derecho - Propiedades */}
        <ZakekePropertiesPanel
          selectedElement={selectedElementData}
          onElementUpdate={updateElement}
          onElementDelete={removeElement}
        />
      </div>

      {/* Footer con información */}
      <div className="bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <span>Elementos: {elements.length}</span>
            <span>Zoom: {Math.round(canvasState.zoom * 100)}%</span>
            {canvasState.isModified && (
              <Badge variant="outline" className="text-orange-600 border-orange-300">
                Sin guardar
              </Badge>
            )}
          </div>
          <div>
            {selectedElementData ? (
              <span>Seleccionado: {selectedElementData.type} • {selectedElementData.name || selectedElementData.id.slice(-6)}</span>
            ) : (
              <span>Ningún elemento seleccionado</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})

ZakekeAdvancedEditorRefactored.displayName = 'ZakekeAdvancedEditorRefactored'

export default ZakekeAdvancedEditorRefactored