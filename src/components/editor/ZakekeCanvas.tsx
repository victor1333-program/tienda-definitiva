"use client"

import { useEffect, useRef, useState } from "react"
import { toast } from "react-hot-toast"
import {
  STANDARD_CANVAS_SIZE,
  relativeToAbsolute,
  scaleImageToCanvas,
  calculatePrintAreaOnScaledImage,
  type RelativeCoordinates,
  type AbsoluteCoordinates
} from "@/lib/canvas-utils"

// Dynamic import para Fabric.js
let fabric: any = null
if (typeof window !== 'undefined') {
  import('fabric').then((fabricModule) => {
    fabric = fabricModule.fabric
  })
}

interface PrintArea {
  id: string
  name: string
  x: number
  y: number
  width: number
  height: number
  printingMethod: string
  allowText: boolean
  allowImages: boolean
  allowShapes: boolean
  allowClipart: boolean
  // Nuevos campos para coordenadas relativas
  isRelativeCoordinates?: boolean
  referenceWidth?: number
  referenceHeight?: number
}

interface ZakekeCanvasProps {
  area: PrintArea
  sideImage?: string
  onElementsChange?: (elements: any[]) => void
}

export default function ZakekeCanvas({ area, sideImage, onElementsChange }: ZakekeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [canvas, setCanvas] = useState<any>(null)
  const [isReady, setIsReady] = useState(false)
  const [fabricLoaded, setFabricLoaded] = useState(false)

  // Wait for Fabric.js to load
  useEffect(() => {
    const checkFabric = async () => {
      if (typeof window !== 'undefined' && !fabric) {
        const fabricModule = await import('fabric')
        fabric = fabricModule.fabric
      }
      setFabricLoaded(!!fabric)
    }
    
    checkFabric()
    
    // Retry if fabric is not loaded
    const interval = setInterval(() => {
      if (fabric) {
        setFabricLoaded(true)
        clearInterval(interval)
      }
    }, 100)
    
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!canvasRef.current || !fabricLoaded || !fabric) return

    // Initialize Fabric.js canvas with standard size
    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: STANDARD_CANVAS_SIZE.width,
      height: STANDARD_CANVAS_SIZE.height,
      backgroundColor: '#ffffff',
      preserveObjectStacking: true,
      imageSmoothingEnabled: true,
      allowTouchScrolling: false,
      selection: true,
      skipTargetFind: false,
      targetFindTolerance: 10,
    })

    // Configure canvas defaults
    fabric.Object.prototype.transparentCorners = false
    fabric.Object.prototype.cornerColor = '#ff6b35'
    fabric.Object.prototype.cornerStyle = 'circle'
    fabric.Object.prototype.cornerSize = 8
    fabric.Object.prototype.borderColor = '#ff6b35'
    fabric.Object.prototype.borderScaleFactor = 2

    // Add background image with proper scaling
    if (sideImage) {
      fabric.Image.fromURL(sideImage, (img) => {
        if (!img) return
        
        // Calculate image transformation for consistent sizing
        const imageTransform = scaleImageToCanvas(
          { width: img.width, height: img.height },
          STANDARD_CANVAS_SIZE
        )
        
        img.set({
          left: imageTransform.left,
          top: imageTransform.top,
          scaleX: imageTransform.scaleX,
          scaleY: imageTransform.scaleY,
          selectable: false,
          evented: false,
          opacity: 0.7
        })
        
        fabricCanvas.setBackgroundImage(img, fabricCanvas.renderAll.bind(fabricCanvas))
        
        // Add print area overlay with relative coordinates
        addPrintAreaOverlay(fabricCanvas, area, imageTransform)
      })
    } else {
      // Add print area overlay without background image
      addPrintAreaOverlay(fabricCanvas, area, null)
    }


    // Setup event listeners
    setupCanvasEvents(fabricCanvas)

    setCanvas(fabricCanvas)
    setIsReady(true)

    // Cleanup
    return () => {
      fabricCanvas.dispose()
    }
  }, [area.id, sideImage, fabricLoaded])

  const addPrintAreaOverlay = (fabricCanvas: fabric.Canvas, printArea: PrintArea, imageTransform: any = null) => {
    // Convert area coordinates using relative system
    let absoluteCoords: AbsoluteCoordinates
    
    if (printArea.isRelativeCoordinates) {
      // Already in relative format, convert to absolute for canvas
      const relativeCoords: RelativeCoordinates = {
        x: printArea.x,
        y: printArea.y,
        width: printArea.width,
        height: printArea.height
      }
      
      if (imageTransform) {
        // Calculate area position on scaled image
        absoluteCoords = calculatePrintAreaOnScaledImage(
          relativeCoords,
          imageTransform,
          STANDARD_CANVAS_SIZE
        )
      } else {
        // Direct relative to absolute conversion
        absoluteCoords = relativeToAbsolute(relativeCoords, STANDARD_CANVAS_SIZE)
      }
    } else {
      // Legacy absolute coordinates, convert to relative first
      const referenceSize = {
        width: printArea.referenceWidth || STANDARD_CANVAS_SIZE.width,
        height: printArea.referenceHeight || STANDARD_CANVAS_SIZE.height
      }
      
      const relativeCoords: RelativeCoordinates = {
        x: (printArea.x / referenceSize.width) * 100,
        y: (printArea.y / referenceSize.height) * 100,
        width: (printArea.width / referenceSize.width) * 100,
        height: (printArea.height / referenceSize.height) * 100
      }
      
      if (imageTransform) {
        absoluteCoords = calculatePrintAreaOnScaledImage(
          relativeCoords,
          imageTransform,
          STANDARD_CANVAS_SIZE
        )
      } else {
        absoluteCoords = relativeToAbsolute(relativeCoords, STANDARD_CANVAS_SIZE)
      }
    }
    
    const areaRect = new fabric.Rect({
      left: absoluteCoords.x,
      top: absoluteCoords.y,
      width: absoluteCoords.width,
      height: absoluteCoords.height,
      fill: 'rgba(255, 107, 53, 0.1)',
      stroke: '#ff6b35',
      strokeWidth: 2,
      strokeDashArray: [5, 5],
      selectable: false,
      evented: false,
      opacity: 0.8,
      excludeFromExport: true
    })

    // Add area label
    const areaLabel = new fabric.Text(
      `${printArea.name} ${printArea.isRelativeCoordinates ? '📐' : ''}`,
      {
        left: absoluteCoords.x + 5,
        top: absoluteCoords.y - 20,
        fontSize: 12,
        fill: '#ff6b35',
        fontFamily: 'Arial',
        selectable: false,
        evented: false,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        excludeFromExport: true
      }
    )

    fabricCanvas.add(areaRect, areaLabel)
  }

  const setupCanvasEvents = (fabricCanvas: fabric.Canvas) => {
    // Selection events
    fabricCanvas.on('selection:created', (e) => {
      console.log('Object selected:', e.selected)
    })

    fabricCanvas.on('selection:cleared', () => {
      console.log('Selection cleared')
    })

    // Object modification events
    fabricCanvas.on('object:modified', (e) => {
      console.log('Object modified:', e.target)
      updateElementsData(fabricCanvas)
    })

    fabricCanvas.on('object:added', (e) => {
      console.log('Object added:', e.target)
      updateElementsData(fabricCanvas)
    })

    fabricCanvas.on('object:removed', (e) => {
      console.log('Object removed:', e.target)
      updateElementsData(fabricCanvas)
    })

    // Prevent objects from moving outside print area
    fabricCanvas.on('object:moving', (e) => {
      const obj = e.target!
      constrainToArea(obj, area, fabricCanvas)
    })

    fabricCanvas.on('object:scaling', (e) => {
      const obj = e.target!
      constrainToArea(obj, area, fabricCanvas)
    })
  }

  const constrainToArea = (obj: fabric.Object, printArea: PrintArea, fabricCanvas: fabric.Canvas) => {
    const scaleX = fabricCanvas.width! / 800
    const scaleY = fabricCanvas.height! / 600
    
    const areaLeft = printArea.x * scaleX
    const areaTop = printArea.y * scaleY
    const areaWidth = printArea.width * scaleX
    const areaHeight = printArea.height * scaleY

    const objLeft = obj.left!
    const objTop = obj.top!
    const objWidth = obj.getScaledWidth()
    const objHeight = obj.getScaledHeight()

    // Constrain position
    if (objLeft < areaLeft) {
      obj.set('left', areaLeft)
    }
    if (objTop < areaTop) {
      obj.set('top', areaTop)
    }
    if (objLeft + objWidth > areaLeft + areaWidth) {
      obj.set('left', areaLeft + areaWidth - objWidth)
    }
    if (objTop + objHeight > areaTop + areaHeight) {
      obj.set('top', areaTop + areaHeight - objHeight)
    }
  }

  const updateElementsData = (fabricCanvas: fabric.Canvas) => {
    const objects = fabricCanvas.getObjects().filter(obj => 
      obj.selectable !== false && obj.evented !== false
    )
    
    const elements = objects.map(obj => ({
      id: obj.id || Math.random().toString(36),
      type: getObjectType(obj),
      left: obj.left,
      top: obj.top,
      scaleX: obj.scaleX,
      scaleY: obj.scaleY,
      rotation: obj.angle,
      opacity: obj.opacity,
      zIndex: fabricCanvas.getObjects().indexOf(obj),
      ...getObjectSpecificData(obj)
    }))

    onElementsChange?.(elements)
  }

  const getObjectType = (obj: fabric.Object): string => {
    if (obj instanceof fabric.Text) return 'TEXT'
    if (obj instanceof fabric.Image) return 'IMAGE'
    if (obj instanceof fabric.Rect) return 'SHAPE'
    if (obj instanceof fabric.Circle) return 'SHAPE'
    if (obj instanceof fabric.Triangle) return 'SHAPE'
    return 'UNKNOWN'
  }

  const getObjectSpecificData = (obj: fabric.Object) => {
    if (obj instanceof fabric.Text) {
      return {
        text: obj.text,
        fontSize: obj.fontSize,
        fontFamily: obj.fontFamily,
        fill: obj.fill,
        fontWeight: obj.fontWeight,
        fontStyle: obj.fontStyle,
        textAlign: obj.textAlign
      }
    }
    
    if (obj instanceof fabric.Image) {
      return {
        src: (obj as any)._originalElement?.src || obj.getSrc()
      }
    }

    if (obj instanceof fabric.Rect || obj instanceof fabric.Circle || obj instanceof fabric.Triangle) {
      return {
        fill: obj.fill,
        stroke: obj.stroke,
        strokeWidth: obj.strokeWidth
      }
    }

    return {}
  }

  // Public methods for external control
  const addText = (text: string = 'Nuevo Texto') => {
    if (!canvas || !area.allowText) {
      toast.error('No se permite agregar texto en esta área')
      return
    }

    const textObj = new fabric.Text(text, {
      left: area.x + 50,
      top: area.y + 50,
      fontSize: 24,
      fill: '#000000',
      fontFamily: 'Arial',
      selectable: true,
      editable: true
    })

    canvas.add(textObj)
    canvas.setActiveObject(textObj)
    canvas.renderAll()
  }

  const addImage = (imageUrl: string) => {
    if (!canvas || !area.allowImages) {
      toast.error('No se permite agregar imágenes en esta área')
      return
    }

    fabric.Image.fromURL(imageUrl, (img) => {
      img.set({
        left: area.x + 50,
        top: area.y + 50,
        scaleX: 0.5,
        scaleY: 0.5,
        selectable: true
      })

      canvas.add(img)
      canvas.setActiveObject(img)
      canvas.renderAll()
    })
  }

  const addShape = (shapeType: 'rect' | 'circle' | 'triangle') => {
    if (!canvas || !area.allowShapes) {
      toast.error('No se permite agregar formas en esta área')
      return
    }

    let shape: fabric.Object

    switch (shapeType) {
      case 'rect':
        shape = new fabric.Rect({
          left: area.x + 50,
          top: area.y + 50,
          width: 100,
          height: 100,
          fill: '#ff6b35',
          selectable: true
        })
        break
      
      case 'circle':
        shape = new fabric.Circle({
          left: area.x + 50,
          top: area.y + 50,
          radius: 50,
          fill: '#ff6b35',
          selectable: true
        })
        break
      
      case 'triangle':
        shape = new fabric.Triangle({
          left: area.x + 50,
          top: area.y + 50,
          width: 100,
          height: 100,
          fill: '#ff6b35',
          selectable: true
        })
        break
    }

    canvas.add(shape)
    canvas.setActiveObject(shape)
    canvas.renderAll()
  }

  const deleteSelected = () => {
    if (!canvas) return

    const activeObjects = canvas.getActiveObjects()
    if (activeObjects.length > 0) {
      activeObjects.forEach(obj => canvas.remove(obj))
      canvas.discardActiveObject()
      canvas.renderAll()
    }
  }

  const clearCanvas = () => {
    if (!canvas) return
    
    // Remove only selectable objects, keep background and area overlay
    const objects = canvas.getObjects().filter(obj => obj.selectable === true)
    objects.forEach(obj => canvas.remove(obj))
    canvas.renderAll()
  }

  // Expose methods to parent component
  useEffect(() => {
    if (isReady && canvas) {
      (window as any).zakekeCanvas = {
        addText,
        addImage,
        addShape,
        deleteSelected,
        clearCanvas,
        canvas
      }
    }
  }, [isReady, canvas])

  if (!fabricLoaded) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando editor visual...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="mb-4 text-center">
          <h3 className="font-semibold text-gray-800">
            {area.name}
          </h3>
          <p className="text-sm text-gray-600">
            {area.width}x{area.height}px
          </p>
        </div>
        
        <div className="border border-gray-200 rounded">
          <canvas ref={canvasRef} />
        </div>

        <div className="mt-4 text-xs text-gray-500 text-center">
          {area.allowText && '📝 Texto'} 
          {area.allowImages && ' 🖼️ Imágenes'} 
          {area.allowShapes && ' 🔷 Formas'} 
          {area.allowClipart && ' 🎨 Clipart'}
        </div>
      </div>
    </div>
  )
}