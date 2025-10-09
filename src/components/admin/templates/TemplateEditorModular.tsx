"use client"

import React, { Suspense, useCallback } from 'react'
import { 
  TemplateEditorProvider, 
  useTemplateEditor,
  TemplateToolbar,
  TemplateCanvas, 
  PropertiesPanel 
} from './editor'
import { Card } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface TemplateEditorModularProps {
  templateId?: string
  productId?: string
  onSave?: (templateData: any) => Promise<void>
  onClose?: () => void
}

// Componente interno que usa el contexto
const TemplateEditorContent = ({ onSave, onClose }: Pick<TemplateEditorModularProps, 'onSave' | 'onClose'>) => {
  const { state, dispatch } = useTemplateEditor()

  const handleSave = useCallback(async () => {
    if (!onSave) return

    dispatch({ type: 'SET_SAVING', payload: true })
    
    try {
      const templateData = {
        elements: state.elements,
        canvasSize: {
          width: state.canvasWidth,
          height: state.canvasHeight
        },
        settings: {
          showGrid: state.showGrid,
          showRulers: state.showRulers,
          snapToGrid: state.snapToGrid
        }
      }

      await onSave(templateData)
      dispatch({ type: 'MARK_SAVED' })
      toast.success('Template guardado correctamente')
    } catch (error) {
      console.error('Error saving template:', error)
      toast.error('Error al guardar el template')
    } finally {
      dispatch({ type: 'SET_SAVING', payload: false })
    }
  }, [state, onSave, dispatch])

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Toolbar */}
      <TemplateToolbar onSave={handleSave} />

      {/* Área principal */}
      <div className="flex-1 flex overflow-hidden">
        {/* Panel izquierdo - Librerías */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          {state.isImageLibraryOpen && (
            <Suspense fallback={
              <div className="p-4 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="ml-2">Cargando imágenes...</span>
              </div>
            }>
              <div className="p-4">
                <h3 className="font-medium mb-3">Librería de Imágenes</h3>
                <p className="text-sm text-gray-500">
                  Funcionalidad de librería de imágenes pendiente de implementar
                </p>
              </div>
            </Suspense>
          )}

          {state.isShapesLibraryOpen && (
            <Suspense fallback={
              <div className="p-4 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="ml-2">Cargando formas...</span>
              </div>
            }>
              <div className="p-4">
                <h3 className="font-medium mb-3">Librería de Formas</h3>
                <p className="text-sm text-gray-500">
                  Funcionalidad de librería de formas pendiente de implementar
                </p>
              </div>
            </Suspense>
          )}

          {state.isElementsLibraryOpen && (
            <Suspense fallback={
              <div className="p-4 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="ml-2">Cargando elementos...</span>
              </div>
            }>
              <div className="p-4">
                <h3 className="font-medium mb-3">Librería de Elementos</h3>
                <p className="text-sm text-gray-500">
                  Funcionalidad de librería de elementos pendiente de implementar
                </p>
              </div>
            </Suspense>
          )}

          {!state.isImageLibraryOpen && !state.isShapesLibraryOpen && !state.isElementsLibraryOpen && (
            <div className="p-4">
              <Card className="p-4">
                <h3 className="font-medium mb-2">Bienvenido al Editor</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Selecciona una herramienta de la barra superior para comenzar a diseñar.
                </p>
                <div className="space-y-2 text-sm">
                  <div>• <strong>Seleccionar:</strong> Mueve y edita elementos</div>
                  <div>• <strong>Texto:</strong> Agrega texto personalizable</div>
                  <div>• <strong>Imagen:</strong> Inserta imágenes</div>
                  <div>• <strong>Forma:</strong> Crea formas básicas</div>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Canvas central */}
        <TemplateCanvas />

        {/* Panel derecho - Propiedades */}
        <PropertiesPanel />
      </div>

      {/* Indicador de estado */}
      {state.hasUnsavedChanges && (
        <div className="fixed bottom-4 right-4 bg-orange-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-sm">Cambios sin guardar</span>
          </div>
        </div>
      )}
    </div>
  )
}

// Componente principal que provee el contexto
export const TemplateEditorModular: React.FC<TemplateEditorModularProps> = ({ 
  templateId, 
  productId, 
  onSave, 
  onClose 
}) => {
  return (
    <TemplateEditorProvider>
      <TemplateEditorContent onSave={onSave} onClose={onClose} />
    </TemplateEditorProvider>
  )
}

export default TemplateEditorModular