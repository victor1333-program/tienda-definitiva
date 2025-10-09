"use client"

import React, { useEffect, useRef } from 'react'

interface FabricOnlyBorderShapeProps {
  element: any
  zoom: number
}

// Componente para renderizar solo borde con Fabric.js
export const FabricOnlyBorderShape = ({ element, zoom }: FabricOnlyBorderShapeProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricCanvasRef = useRef<any>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    // Limpiar canvas anterior si existe
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.dispose()
      fabricCanvasRef.current = null
    }

    // Importar y configurar Fabric.js
    import('fabric').then((fabricModule) => {
      try {
        const fabric = fabricModule.fabric
        
        if (!canvasRef.current) return
        
        // Crear nuevo canvas con dimensiones correctas
        const canvasWidth = element.width * zoom
        const canvasHeight = element.height * zoom
        
        const canvas = new fabric.Canvas(canvasRef.current, {
          width: canvasWidth,
          height: canvasHeight,
          selection: false,
          interactive: false
        })
        
        fabricCanvasRef.current = canvas
        
        // Cargar el SVG de la forma
        try {
          fabric.loadSVGFromURL(element.src, (objects, options) => {
            try {
              const shape = fabric.util.groupSVGElements(objects, options)
              
              if (!shape) return
              
              // Obtener dimensiones originales del SVG
              const originalWidth = shape.width || options.width || 100
              const originalHeight = shape.height || options.height || 100
              
              // Calcular escala para que quepa completamente en el canvas
              const scaleX = canvasWidth / originalWidth
              const scaleY = canvasHeight / originalHeight
              const scale = Math.min(scaleX, scaleY) // Usar la escala menor para mantener proporción
              
              // Centrar la forma en el canvas
              const scaledWidth = originalWidth * scale
              const scaledHeight = originalHeight * scale
              const left = (canvasWidth - scaledWidth) / 2
              const top = (canvasHeight - scaledHeight) / 2
              
              // Solo borde configuración - CORREGIDO para manejar transparencia
              shape.set({
                left: left,
                top: top,
                scaleX: scale,
                scaleY: scale,
                fill: 'transparent', // CLAVE: transparencia real del relleno
                stroke: (element.strokeColor === 'transparent' || !element.strokeColor) ? 'transparent' : element.strokeColor,
                strokeWidth: (element.strokeColor === 'transparent' || !element.strokeColor || !element.strokeWidth) ? 0 : (element.strokeWidth || 1),
              })
              
              canvas.add(shape)
              canvas.renderAll()
            } catch (err) {
              console.error('Error processing SVG:', err)
            }
          })
        } catch (err) {
          console.error('Error loading SVG from URL:', err)
        }
      } catch (err) {
        console.error('Error in Fabric.js setup:', err)
      }
    }).catch(err => {
      console.error('Error cargando Fabric.js:', err)
      // Don't throw - handle gracefully
    })

    // Cleanup
    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose()
        fabricCanvasRef.current = null
      }
    }
  }, [element.id, element.src, element.strokeColor, element.strokeWidth, element.width, element.height, zoom])

  return (
    <canvas 
      ref={canvasRef}
      className="w-full h-full"
    />
  )
}