'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignVerticalJustifyCenter,
  AlignHorizontalJustifyCenter,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyEnd,
  AlignHorizontalJustifyStart,
  AlignHorizontalJustifyEnd,
  Grid3X3,
  Move,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Lock,
  Unlock,
  Copy,
  Layers
} from 'lucide-react'

interface AlignmentToolsProps {
  selectedElements: string[]
  allElements: any[]
  canvasSize: { width: number; height: number }
  onUpdateElements: (updates: { [id: string]: any }) => void
  onMoveElement: (elementId: string, direction: 'front' | 'back' | 'forward' | 'backward') => void
}

export default function AlignmentTools({
  selectedElements,
  allElements,
  canvasSize,
  onUpdateElements,
  onMoveElement
}: AlignmentToolsProps) {
  if (selectedElements.length === 0) {
    return (
      <Card>
        <CardContent className="p-4 text-center text-gray-500">
          <Move className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Selecciona elementos para usar herramientas de alineación</p>
        </CardContent>
      </Card>
    )
  }

  const getSelectedElementsData = () => {
    return selectedElements.map(id => 
      allElements.find(el => el.id === id)
    ).filter(Boolean)
  }

  const alignElements = (type: string) => {
    const elements = getSelectedElementsData()
    if (elements.length < 2) return

    const updates: { [id: string]: any } = {}

    switch (type) {
      case 'left':
        const leftmost = Math.min(...elements.map(el => el.x))
        elements.forEach(el => {
          updates[el.id] = { x: leftmost }
        })
        break

      case 'center-horizontal':
        const centerX = elements.reduce((sum, el) => sum + el.x + el.width / 2, 0) / elements.length
        elements.forEach(el => {
          updates[el.id] = { x: centerX - el.width / 2 }
        })
        break

      case 'right':
        const rightmost = Math.max(...elements.map(el => el.x + el.width))
        elements.forEach(el => {
          updates[el.id] = { x: rightmost - el.width }
        })
        break

      case 'top':
        const topmost = Math.min(...elements.map(el => el.y))
        elements.forEach(el => {
          updates[el.id] = { y: topmost }
        })
        break

      case 'center-vertical':
        const centerY = elements.reduce((sum, el) => sum + el.y + el.height / 2, 0) / elements.length
        elements.forEach(el => {
          updates[el.id] = { y: centerY - el.height / 2 }
        })
        break

      case 'bottom':
        const bottommost = Math.max(...elements.map(el => el.y + el.height))
        elements.forEach(el => {
          updates[el.id] = { y: bottommost - el.height }
        })
        break
    }

    onUpdateElements(updates)
  }

  const distributeElements = (direction: 'horizontal' | 'vertical') => {
    const elements = getSelectedElementsData()
    if (elements.length < 3) return

    const updates: { [id: string]: any } = {}
    
    if (direction === 'horizontal') {
      elements.sort((a, b) => a.x - b.x)
      const leftmost = elements[0].x
      const rightmost = elements[elements.length - 1].x + elements[elements.length - 1].width
      const totalSpace = rightmost - leftmost
      const elementSpace = elements.reduce((sum, el) => sum + el.width, 0)
      const gap = (totalSpace - elementSpace) / (elements.length - 1)
      
      let currentX = leftmost
      elements.forEach(el => {
        updates[el.id] = { x: currentX }
        currentX += el.width + gap
      })
    } else {
      elements.sort((a, b) => a.y - b.y)
      const topmost = elements[0].y
      const bottommost = elements[elements.length - 1].y + elements[elements.length - 1].height
      const totalSpace = bottommost - topmost
      const elementSpace = elements.reduce((sum, el) => sum + el.height, 0)
      const gap = (totalSpace - elementSpace) / (elements.length - 1)
      
      let currentY = topmost
      elements.forEach(el => {
        updates[el.id] = { y: currentY }
        currentY += el.height + gap
      })
    }

    onUpdateElements(updates)
  }

  const alignToCanvas = (type: string) => {
    const elements = getSelectedElementsData()
    const updates: { [id: string]: any } = {}

    elements.forEach(el => {
      switch (type) {
        case 'canvas-left':
          updates[el.id] = { x: 0 }
          break
        case 'canvas-center-horizontal':
          updates[el.id] = { x: (canvasSize.width - el.width) / 2 }
          break
        case 'canvas-right':
          updates[el.id] = { x: canvasSize.width - el.width }
          break
        case 'canvas-top':
          updates[el.id] = { y: 0 }
          break
        case 'canvas-center-vertical':
          updates[el.id] = { y: (canvasSize.height - el.height) / 2 }
          break
        case 'canvas-bottom':
          updates[el.id] = { y: canvasSize.height - el.height }
          break
        case 'canvas-center':
          updates[el.id] = { 
            x: (canvasSize.width - el.width) / 2,
            y: (canvasSize.height - el.height) / 2
          }
          break
      }
    })

    onUpdateElements(updates)
  }

  const transformElements = (type: string) => {
    const elements = getSelectedElementsData()
    const updates: { [id: string]: any } = {}

    elements.forEach(el => {
      switch (type) {
        case 'flip-horizontal':
          // Implementar flip horizontal
          updates[el.id] = { scaleX: (el.scaleX || 1) * -1 }
          break
        case 'flip-vertical':
          // Implementar flip vertical
          updates[el.id] = { scaleY: (el.scaleY || 1) * -1 }
          break
        case 'rotate-90':
          updates[el.id] = { rotation: (el.rotation || 0) + 90 }
          break
        case 'rotate-minus-90':
          updates[el.id] = { rotation: (el.rotation || 0) - 90 }
          break
      }
    })

    onUpdateElements(updates)
  }

  const selectedElement = selectedElements.length === 1 ? 
    allElements.find(el => el.id === selectedElements[0]) : null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Move className="w-5 h-5" />
          Alineación y Posición
          {selectedElements.length > 1 && (
            <span className="text-sm font-normal text-gray-500">
              ({selectedElements.length} elementos)
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Alineación entre elementos */}
        {selectedElements.length > 1 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Alinear elementos</h4>
            <div className="grid grid-cols-3 gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => alignElements('left')}
                title="Alinear izquierda"
              >
                <AlignLeft className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => alignElements('center-horizontal')}
                title="Centrar horizontalmente"
              >
                <AlignCenter className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => alignElements('right')}
                title="Alinear derecha"
              >
                <AlignRight className="w-4 h-4" />
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => alignElements('top')}
                title="Alinear arriba"
              >
                <AlignVerticalJustifyStart className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => alignElements('center-vertical')}
                title="Centrar verticalmente"
              >
                <AlignVerticalJustifyCenter className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => alignElements('bottom')}
                title="Alinear abajo"
              >
                <AlignVerticalJustifyEnd className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Distribuir elementos */}
        {selectedElements.length > 2 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Distribuir elementos</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => distributeElements('horizontal')}
                className="text-xs"
              >
                Horizontal
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => distributeElements('vertical')}
                className="text-xs"
              >
                Vertical
              </Button>
            </div>
          </div>
        )}

        {/* Alineación al canvas */}
        <div>
          <h4 className="text-sm font-medium mb-2">Alinear al canvas</h4>
          <div className="grid grid-cols-3 gap-1 mb-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => alignToCanvas('canvas-left')}
              title="Izquierda del canvas"
            >
              <AlignHorizontalJustifyStart className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => alignToCanvas('canvas-center-horizontal')}
              title="Centro horizontal del canvas"
            >
              <AlignHorizontalJustifyCenter className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => alignToCanvas('canvas-right')}
              title="Derecha del canvas"
            >
              <AlignHorizontalJustifyEnd className="w-4 h-4" />
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-1 mb-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => alignToCanvas('canvas-top')}
              title="Arriba del canvas"
            >
              <AlignVerticalJustifyStart className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => alignToCanvas('canvas-center-vertical')}
              title="Centro vertical del canvas"
            >
              <AlignVerticalJustifyCenter className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => alignToCanvas('canvas-bottom')}
              title="Abajo del canvas"
            >
              <AlignVerticalJustifyEnd className="w-4 h-4" />
            </Button>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => alignToCanvas('canvas-center')}
            className="w-full text-xs"
          >
            Centro absoluto
          </Button>
        </div>

        {/* Transformaciones */}
        <div>
          <h4 className="text-sm font-medium mb-2">Transformar</h4>
          <div className="grid grid-cols-2 gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => transformElements('flip-horizontal')}
              title="Voltear horizontalmente"
            >
              <FlipHorizontal className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => transformElements('flip-vertical')}
              title="Voltear verticalmente"
            >
              <FlipVertical className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => transformElements('rotate-90')}
              title="Rotar 90° horario"
            >
              <RotateCw className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => transformElements('rotate-minus-90')}
              title="Rotar 90° antihorario"
            >
              <RotateCw className="w-4 h-4 transform scale-x-[-1]" />
            </Button>
          </div>
        </div>

        {/* Capas (solo para elemento único) */}
        {selectedElement && (
          <div>
            <h4 className="text-sm font-medium mb-2">Orden de capas</h4>
            <div className="grid grid-cols-2 gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onMoveElement(selectedElement.id, 'front')}
                title="Traer al frente"
                className="text-xs"
              >
                Al frente
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onMoveElement(selectedElement.id, 'back')}
                title="Enviar atrás"
                className="text-xs"
              >
                Atrás
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onMoveElement(selectedElement.id, 'forward')}
                title="Adelantar"
                className="text-xs"
              >
                <Layers className="w-4 h-4" />
                +1
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onMoveElement(selectedElement.id, 'backward')}
                title="Atrasar"
                className="text-xs"
              >
                <Layers className="w-4 h-4" />
                -1
              </Button>
            </div>
          </div>
        )}

        {/* Información del elemento */}
        {selectedElement && (
          <div className="p-3 bg-gray-50 rounded text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <strong>Posición:</strong> {Math.round(selectedElement.x)}, {Math.round(selectedElement.y)}
              </div>
              <div>
                <strong>Tamaño:</strong> {Math.round(selectedElement.width)} × {Math.round(selectedElement.height)}
              </div>
              <div>
                <strong>Rotación:</strong> {selectedElement.rotation || 0}°
              </div>
              <div>
                <strong>Capa:</strong> {selectedElement.zIndex}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}