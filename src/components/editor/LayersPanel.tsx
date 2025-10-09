"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Trash2,
  Type,
  Image,
  Square,
  Layers,
  Edit3,
  Check,
  X
} from "lucide-react"

interface DesignElement {
  id: string
  type: 'TEXT' | 'IMAGE' | 'SHAPE' | 'CLIPART' | 'SVG'
  name?: string
  visible: boolean
  locked: boolean
  zIndex: number
  [key: string]: any
}

interface LayersPanelProps {
  elements: DesignElement[]
  onElementSelect: (elementId: string) => void
  onElementUpdate?: (elementId: string, updates: Partial<DesignElement>) => void
  onElementDelete?: (elementId: string) => void
  onElementReorder?: (elementId: string, direction: 'up' | 'down') => void
}

export default function LayersPanel({ 
  elements, 
  onElementSelect,
  onElementUpdate,
  onElementDelete,
  onElementReorder
}: LayersPanelProps) {
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [canvasElements, setCanvasElements] = useState<DesignElement[]>([])
  const [editingTextId, setEditingTextId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState<string>('')

  useEffect(() => {
    // Listen for canvas changes
    const updateElements = () => {
      const canvas = (window as any).zakekeCanvas?.canvas
      if (canvas) {
        const objects = canvas.getObjects().filter((obj: any) => 
          obj.selectable !== false && obj.evented !== false
        )
        
        const elementsList = objects.map((obj: any, index: number) => ({
          id: obj.id || `element_${index}`,
          type: getElementType(obj),
          name: getElementName(obj),
          visible: obj.visible !== false,
          locked: obj.selectable === false,
          zIndex: index,
          fabricObject: obj
        }))
        
        setCanvasElements(elementsList.reverse()) // Reverse to show top elements first
      }
    }

    // Update elements periodically
    const interval = setInterval(updateElements, 1000)
    updateElements()

    return () => clearInterval(interval)
  }, [])

  const getElementType = (obj: any): DesignElement['type'] => {
    if (obj.type === 'text' || obj.type === 'i-text') return 'TEXT'
    if (obj.type === 'image') return 'IMAGE'
    if (obj.type === 'rect' || obj.type === 'circle' || obj.type === 'triangle') return 'SHAPE'
    return 'SHAPE'
  }

  const getElementName = (obj: any): string => {
    if (obj.type === 'text' || obj.type === 'i-text') {
      return obj.text?.substring(0, 20) + (obj.text?.length > 20 ? '...' : '') || 'Texto'
    }
    if (obj.type === 'image') {
      // Si tiene un nombre personalizado, usarlo; sino usar 'Imagen'
      return obj.customName || 'Imagen'
    }
    
    // Para formas y otros elementos, usar nombre personalizado si existe
    if (obj.customName) {
      return obj.customName
    }
    
    // Nombres por defecto para formas básicas
    if (obj.type === 'rect') return 'Rectángulo'
    if (obj.type === 'circle') return 'Círculo'
    if (obj.type === 'triangle') return 'Triángulo'
    if (obj.type === 'path') return 'Forma SVG'
    
    return 'Elemento'
  }

  const getElementIcon = (type: DesignElement['type']) => {
    switch (type) {
      case 'TEXT': return Type
      case 'IMAGE': return Image
      case 'SHAPE': return Square
      default: return Square
    }
  }

  const handleElementSelect = (element: DesignElement) => {
    setSelectedElement(element.id)
    onElementSelect(element.id)
    
    // Select in canvas
    const canvas = (window as any).zakekeCanvas?.canvas
    if (canvas && element.fabricObject) {
      canvas.setActiveObject(element.fabricObject)
      canvas.renderAll()
    }
  }

  const handleVisibilityToggle = (element: DesignElement) => {
    const canvas = (window as any).zakekeCanvas?.canvas
    if (canvas && element.fabricObject) {
      const newVisible = !element.visible
      element.fabricObject.set('visible', newVisible)
      canvas.renderAll()
      
      setCanvasElements(prev => 
        prev.map(el => el.id === element.id ? {...el, visible: newVisible} : el)
      )
    }
  }

  const handleLockToggle = (element: DesignElement) => {
    const canvas = (window as any).zakekeCanvas?.canvas
    if (canvas && element.fabricObject) {
      const newLocked = !element.locked
      element.fabricObject.set({
        selectable: !newLocked,
        evented: !newLocked
      })
      canvas.renderAll()
      
      setCanvasElements(prev => 
        prev.map(el => el.id === element.id ? {...el, locked: newLocked} : el)
      )
    }
  }

  const handleDelete = (element: DesignElement) => {
    const canvas = (window as any).zakekeCanvas?.canvas
    if (canvas && element.fabricObject) {
      canvas.remove(element.fabricObject)
      canvas.renderAll()
      
      setCanvasElements(prev => prev.filter(el => el.id !== element.id))
      if (selectedElement === element.id) {
        setSelectedElement(null)
      }
    }
  }

  const handleReorder = (element: DesignElement, direction: 'up' | 'down') => {
    const canvas = (window as any).zakekeCanvas?.canvas
    if (canvas && element.fabricObject) {
      if (direction === 'up') {
        canvas.bringForward(element.fabricObject)
      } else {
        canvas.sendBackwards(element.fabricObject)
      }
      canvas.renderAll()
      
      // Update z-indexes
      setTimeout(() => {
        const objects = canvas.getObjects().filter((obj: any) => 
          obj.selectable !== false && obj.evented !== false
        )
        
        const updatedElements = objects.map((obj: any, index: number) => {
          const existingElement = canvasElements.find(el => el.fabricObject === obj)
          return existingElement ? {...existingElement, zIndex: index} : null
        }).filter(Boolean).reverse()
        
        setCanvasElements(updatedElements as DesignElement[])
      }, 100)
    }
  }

  const clearAllElements = () => {
    const canvas = (window as any).zakekeCanvas
    if (canvas) {
      canvas.clearCanvas()
      setCanvasElements([])
      setSelectedElement(null)
    }
  }

  const startTextEdit = (element: DesignElement) => {
    if (element.type === 'TEXT' && element.fabricObject) {
      setEditingTextId(element.id)
      setEditingText(element.fabricObject.text || '')
    }
  }

  const saveTextEdit = () => {
    if (!editingTextId) return
    
    const element = canvasElements.find(el => el.id === editingTextId)
    if (element && element.fabricObject) {
      const canvas = (window as any).zakekeCanvas?.canvas
      if (canvas) {
        element.fabricObject.set('text', editingText)
        canvas.renderAll()
        
        // Update the element name
        setCanvasElements(prev => 
          prev.map(el => 
            el.id === editingTextId 
              ? { ...el, name: getElementName(element.fabricObject) }
              : el
          )
        )
      }
    }
    
    cancelTextEdit()
  }

  const cancelTextEdit = () => {
    setEditingTextId(null)
    setEditingText('')
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Capas</h3>
        <Button 
          variant="outline" 
          size="sm"
          onClick={clearAllElements}
          disabled={canvasElements.length === 0}
        >
          <Trash2 className="h-3 w-3 mr-1" />
          Limpiar
        </Button>
      </div>

      {canvasElements.length === 0 ? (
        <div className="text-center py-8">
          <Layers className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">No hay elementos en el canvas</p>
          <p className="text-gray-400 text-xs mt-1">Agrega texto, imágenes o formas para verlos aquí</p>
        </div>
      ) : (
        <div className="space-y-2">
          {canvasElements.map((element, index) => {
            const Icon = getElementIcon(element.type)
            const isSelected = selectedElement === element.id
            
            return (
              <Card 
                key={element.id}
                className={`group cursor-pointer transition-all ${
                  isSelected ? 'ring-2 ring-orange-500 bg-orange-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => handleElementSelect(element)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    {/* Element Icon */}
                    <div className={`p-1.5 rounded ${
                      element.type === 'TEXT' ? 'bg-blue-100 text-blue-600' :
                      element.type === 'IMAGE' ? 'bg-green-100 text-green-600' :
                      'bg-purple-100 text-purple-600'
                    }`}>
                      <Icon className="h-3 w-3" />
                    </div>

                    {/* Element Info */}
                    <div className="flex-1 min-w-0">
                      {editingTextId === element.id ? (
                        // Edición de texto inline
                        <div className="flex items-center gap-1">
                          <Input
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            className="h-6 text-xs border-2 border-blue-500 bg-blue-50 focus:border-blue-600"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                saveTextEdit()
                              } else if (e.key === 'Escape') {
                                e.preventDefault()
                                cancelTextEdit()
                              }
                            }}
                            autoFocus
                            onBlur={saveTextEdit}
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              saveTextEdit()
                            }}
                            className="p-0.5 hover:bg-green-100 text-green-600 rounded"
                          >
                            <Check className="h-3 w-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              cancelTextEdit()
                            }}
                            className="p-0.5 hover:bg-red-100 text-red-600 rounded"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        // Vista normal
                        <div className="flex items-center gap-1">
                          <div className="text-sm font-medium truncate">
                            {element.name}
                          </div>
                          {element.type === 'TEXT' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                startTextEdit(element)
                              }}
                              className="p-0.5 hover:bg-blue-100 text-blue-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Edit3 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      )}
                      <div className="text-xs text-gray-500">
                        {element.type}
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-1">
                      {/* Visibility */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleVisibilityToggle(element)
                        }}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        {element.visible ? (
                          <Eye className="h-3 w-3 text-gray-600" />
                        ) : (
                          <EyeOff className="h-3 w-3 text-gray-400" />
                        )}
                      </button>

                      {/* Lock */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleLockToggle(element)
                        }}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        {element.locked ? (
                          <Lock className="h-3 w-3 text-gray-600" />
                        ) : (
                          <Unlock className="h-3 w-3 text-gray-400" />
                        )}
                      </button>


                      {/* Delete */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(element)
                        }}
                        className="p-1 hover:bg-red-100 text-red-500 rounded"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}