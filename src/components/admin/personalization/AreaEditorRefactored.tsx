"use client"

import React, { memo, Suspense, lazy } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { AreaEditorProps } from './types/AreaEditorTypes'
import { useAreaEditor } from './hooks/useAreaEditor'
import { toast } from 'react-hot-toast'

// Lazy load componentes pesados
const AreaCanvas = lazy(() => import('./components/AreaCanvas'))
const AreaToolbar = lazy(() => import('./components/AreaToolbar'))
const AreaPropertiesPanel = lazy(() => import('./components/AreaPropertiesPanel'))
const MeasurementPanel = lazy(() => import('./components/MeasurementPanel'))

const AreaEditorRefactored = memo(({
  isOpen,
  onClose,
  sideImage,
  sideName,
  onSave,
  existingAreas = [],
  existingMeasurementData,
  readonly = false,
  showMeasurements = true,
  canvasSize = { width: 600, height: 400 }
}: AreaEditorProps) => {
  const {
    state,
    tools,
    canvasRef,
    containerRef,
    imageRef,
    addArea,
    updateArea,
    removeArea,
    selectArea,
    addMeasurementLine,
    removeMeasurementLine,
    setPixelsPerCm,
    setTool,
    setZoom,
    zoomIn,
    zoomOut,
    resetZoom,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    convertToRelativeCoordinates
  } = useAreaEditor({
    sideImage,
    existingAreas,
    existingMeasurementData,
    readonly
  })

  const handleSave = async () => {
    try {
      const convertedAreas = convertToRelativeCoordinates(state.areas)
      await onSave(convertedAreas, state.measurementData)
      toast.success('Áreas guardadas correctamente')
      onClose()
    } catch (error) {
      console.error('Error saving areas:', error)
      toast.error('Error guardando las áreas')
    }
  }

  const handleCancel = () => {
    if (state.areas.length > existingAreas.length || state.measurement.lines.length > 0) {
      if (confirm('¿Estás seguro? Se perderán los cambios no guardados.')) {
        onClose()
      }
    } else {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DialogTitle>Editor de Áreas de Impresión</DialogTitle>
              <Badge variant="outline">{sideName}</Badge>
              {readonly && <Badge variant="secondary">Solo lectura</Badge>}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                Áreas: {state.areas.length}
              </span>
              {state.measurementData.hasValidMeasurement && (
                <Badge variant="outline" className="text-green-600">
                  Calibrado: {state.measurementData.pixelsPerCm?.toFixed(2)} px/cm
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden">
          {/* Toolbar lateral */}
          <div className="w-16 bg-gray-50 border-r border-gray-200 flex flex-col items-center py-4 gap-2">
            <Suspense fallback={
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-12 h-12 bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
            }>
              <AreaToolbar
                tools={tools}
                activeTool={state.canvas.tool}
                zoom={state.canvas.zoom}
                onToolChange={setTool}
                onZoomIn={zoomIn}
                onZoomOut={zoomOut}
                onResetZoom={resetZoom}
                readonly={readonly}
              />
            </Suspense>
          </div>

          {/* Canvas principal */}
          <div className="flex-1 flex items-center justify-center p-4 bg-gray-100">
            <div 
              ref={containerRef}
              className="relative border-2 border-gray-300 bg-white shadow-lg"
              style={{ 
                width: canvasSize.width * state.canvas.zoom,
                height: canvasSize.height * state.canvas.zoom,
                minWidth: 400,
                minHeight: 300
              }}
            >
              <Suspense fallback={
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <div className="text-gray-500">Cargando canvas...</div>
                </div>
              }>
                <AreaCanvas
                  canvasRef={canvasRef}
                  imageRef={imageRef}
                  sideImage={sideImage}
                  areas={state.areas}
                  selectedAreaId={state.canvas.selectedArea}
                  measurementLines={state.measurement.lines}
                  previewArea={state.areaCreation.previewArea}
                  zoom={state.canvas.zoom}
                  panX={state.canvas.panX}
                  panY={state.canvas.panY}
                  tool={state.canvas.tool}
                  showMeasurements={showMeasurements}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  readonly={readonly}
                />
              </Suspense>
            </div>
          </div>

          {/* Panel de propiedades */}
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
            {/* Panel de área seleccionada */}
            <div className="flex-1 overflow-y-auto">
              <Suspense fallback={
                <div className="p-4">
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-8 bg-gray-200 rounded animate-pulse" />
                    <div className="h-20 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              }>
                <AreaPropertiesPanel
                  selectedArea={state.selectedArea}
                  pixelsPerCm={state.measurement.pixelsPerCm}
                  onAreaUpdate={updateArea}
                  onAreaDelete={removeArea}
                  readonly={readonly}
                />
              </Suspense>
            </div>

            {/* Panel de medición */}
            {showMeasurements && (
              <>
                <Separator />
                <div className="max-h-60 overflow-y-auto">
                  <Suspense fallback={
                    <div className="p-4">
                      <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                      <div className="h-8 bg-gray-200 rounded animate-pulse" />
                    </div>
                  }>
                    <MeasurementPanel
                      measurementData={state.measurementData}
                      measurementLines={state.measurement.lines}
                      onLineDelete={removeMeasurementLine}
                      onPixelsPerCmChange={setPixelsPerCm}
                      readonly={readonly}
                    />
                  </Suspense>
                </div>
              </>
            )}

            {/* Botones de acción */}
            <div className="border-t border-gray-200 p-4 space-y-2">
              {!readonly ? (
                <>
                  <Button 
                    onClick={handleSave}
                    className="w-full"
                    disabled={state.areas.length === 0}
                  >
                    Guardar áreas ({state.areas.length})
                  </Button>
                  <Button 
                    onClick={handleCancel}
                    variant="outline"
                    className="w-full"
                  >
                    Cancelar
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={onClose}
                  variant="outline"
                  className="w-full"
                >
                  Cerrar
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Footer con información */}
        <div className="border-t border-gray-200 px-6 py-3 bg-gray-50">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span>Herramienta: {tools.find(t => t.id === state.canvas.tool)?.name}</span>
              <span>Zoom: {Math.round(state.canvas.zoom * 100)}%</span>
              {state.imageLoaded ? (
                <span className="text-green-600">✓ Imagen cargada</span>
              ) : (
                <span className="text-orange-600">⌛ Cargando imagen...</span>
              )}
            </div>
            <div>
              {state.selectedArea ? (
                <span>Seleccionada: {state.selectedArea.name}</span>
              ) : (
                <span>Ningún área seleccionada</span>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
})

AreaEditorRefactored.displayName = 'AreaEditorRefactored'

export default AreaEditorRefactored