'use client'

import React, { useEffect, useRef, useState } from 'react'

interface TemplateElement {
  id: string
  type: string
  x: number
  y: number
  width: number
  height: number
  fillColor?: string
  strokeColor?: string
  strokeWidth?: number
  src?: string
  rotation?: number
  visible?: boolean
}

interface TemplateData {
  productSides: Array<{
    id: string
    name: string
    image2D: string
    displayName: string
  }>
  sideElements: {
    [sideId: string]: TemplateElement[]
  }
  canvasSize: {
    width: number
    height: number
  }
  currentSide: string
}

interface TemplatePreviewRendererProps {
  templateData: TemplateData
  className?: string
  width?: number
  height?: number
  onImageGenerated?: (dataUrl: string) => void
}

export default function TemplatePreviewRenderer({ 
  templateData, 
  className = '', 
  width = 400, 
  height = 400,
  onImageGenerated 
}: TemplatePreviewRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    renderTemplate()
  }, [templateData, width, height])

  const renderTemplate = async () => {
    if (!canvasRef.current || !templateData) return

    try {
      setIsLoading(true)
      setError(null)

      // Validar estructura básica del templateData
      if (!templateData || typeof templateData !== 'object') {
        throw new Error('Datos de plantilla inválidos')
      }

      // Si no tiene la estructura esperada, mostrar información útil
      if (!templateData.productSides || !Array.isArray(templateData.productSides)) {
        console.error('Estructura de templateData recibida:', Object.keys(templateData))
        throw new Error(`Estructura de plantilla no válida. Se esperaba 'productSides' pero se encontró: ${Object.keys(templateData).join(', ')}`)
      }

      // Si productSides está vacío, crear un lado de producto básico
      if (templateData.productSides.length === 0) {
        // Si hay elementos en sideElements, usar esas claves como lados
        const sideKeys = Object.keys(templateData.sideElements || {})
        if (sideKeys.length > 0) {
          templateData.productSides = sideKeys.map(sideId => ({
            id: sideId,
            name: 'Vista Principal',
            image2D: '/images/placeholder-category.jpg',
            displayName: 'Vista Principal'
          }))
        } else {
          // Si no hay sideElements, crear un lado básico
          templateData.productSides = [{
            id: templateData.currentSide || 'default-side',
            name: 'Vista Principal',
            image2D: '/images/placeholder-category.jpg',
            displayName: 'Vista Principal'
          }]
        }
      }

      if (!templateData.canvasSize) {
        throw new Error('No se encontró información del tamaño del canvas')
      }

      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('No se pudo obtener el contexto del canvas')

      // Configurar tamaño del canvas
      canvas.width = width
      canvas.height = height
      ctx.clearRect(0, 0, width, height)

      // Obtener el lado actual y sus elementos
      let currentSide = templateData.productSides.find(side => side.id === templateData.currentSide)
      
      // Si no se encuentra el lado actual, usar el primer lado disponible
      if (!currentSide && templateData.productSides.length > 0) {
        currentSide = templateData.productSides[0]
        console.warn(`No se encontró el lado actual "${templateData.currentSide}", usando el primer lado disponible: "${currentSide.id}"`)
      }
      
      if (!currentSide) {
        throw new Error('No hay lados de producto disponibles en los datos de la plantilla')
      }

      const elements = templateData.sideElements[currentSide.id] || []

      // Cargar y dibujar imagen base
      await loadAndDrawImage(ctx, currentSide.image2D, width, height)

      // Calcular escala para los elementos
      const scaleX = width / templateData.canvasSize.width
      const scaleY = height / templateData.canvasSize.height

      // Dibujar elementos (filtrar imágenes duplicadas del producto base)
      const baseImageUrl = currentSide.image2D
      
      for (const element of elements) {
        if (!element.visible) continue

        // Filtrar solo imágenes que son realmente duplicados del producto base
        if (element.type === 'image' && element.src) {
          // Saltear si es exactamente la misma URL que la imagen base
          if (element.src === baseImageUrl) {
            console.log('Skipping exact duplicate base image:', element.src)
            continue
          }
          
          // Saltear solo imágenes que son claramente del producto base (no elementos de personalización)
          const isProductBaseImage = (
            element.src.includes('/uploads/products/') && 
            // Y además tiene dimensiones muy grandes (imagen completa del producto)
            element.width > 400 && element.height > 400
          ) || (
            element.src.includes('product-base') ||
            element.src.includes('background')
          )
          
          if (isProductBaseImage) {
            console.log('Skipping product base/background image:', element.src, `${element.width}x${element.height}`)
            continue
          }
          
          // Permitir imágenes de personalización (como la "A") que son más pequeñas
          console.log('Allowing personalization image:', element.src, `${element.width}x${element.height}`)
        }

        await drawElement(ctx, element, scaleX, scaleY)
      }

      // Generar imagen y notificar
      if (onImageGenerated) {
        const dataUrl = canvas.toDataURL('image/png')
        onImageGenerated(dataUrl)
      }

      setIsLoading(false)
    } catch (err) {
      console.error('Error renderizando plantilla:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
      setIsLoading(false)
    }
  }

  const loadAndDrawImage = (ctx: CanvasRenderingContext2D, src: string, width: number, height: number): Promise<void> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height)
        resolve()
      }
      img.onerror = () => {
        console.warn(`Error cargando imagen: ${src}, usando placeholder`)
        // Dibujar un placeholder en caso de error
        ctx.fillStyle = '#f8f9fa'
        ctx.fillRect(0, 0, width, height)
        ctx.strokeStyle = '#dee2e6'
        ctx.strokeRect(0, 0, width, height)
        
        // No dibujar texto, solo fondo gris claro
        resolve()
      }
      img.src = src
    })
  }

  const drawElement = async (ctx: CanvasRenderingContext2D, element: TemplateElement, scaleX: number, scaleY: number) => {
    const x = element.x * scaleX
    const y = element.y * scaleY
    const elementWidth = element.width * scaleX
    const elementHeight = element.height * scaleY

    ctx.save()

    // Aplicar rotación si existe
    if (element.rotation) {
      ctx.translate(x + elementWidth / 2, y + elementHeight / 2)
      ctx.rotate((element.rotation * Math.PI) / 180)
      ctx.translate(-(elementWidth / 2), -(elementHeight / 2))
    } else {
      ctx.translate(x, y)
    }

    if (element.type === 'shape') {
      await drawShape(ctx, element, elementWidth, elementHeight)
    } else if (element.type === 'text') {
      drawText(ctx, element, elementWidth, elementHeight)
    } else if (element.type === 'image') {
      await drawImage(ctx, element, elementWidth, elementHeight)
    }

    ctx.restore()
  }

  const drawShape = async (ctx: CanvasRenderingContext2D, element: TemplateElement, width: number, height: number) => {
    const isCircle = element.src && element.src.includes('circle')
    
    if (isCircle) {
      // Dibujar círculo
      const centerX = width / 2
      const centerY = height / 2
      const radius = Math.min(width, height) / 2
      
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
      
      // Rellenar si tiene color de relleno
      if (element.fillColor && element.fillColor !== 'transparent') {
        ctx.fillStyle = element.fillColor
        ctx.fill()
      }
      
      // Dibujar borde si tiene stroke
      if (element.strokeColor && element.strokeWidth) {
        ctx.strokeStyle = element.strokeColor
        ctx.lineWidth = element.strokeWidth
        ctx.stroke()
      }
    } else {
      // Dibujar rectángulo (forma por defecto)
      if (element.fillColor && element.fillColor !== 'transparent') {
        ctx.fillStyle = element.fillColor
        ctx.fillRect(0, 0, width, height)
      }

      if (element.strokeColor && element.strokeWidth) {
        ctx.strokeStyle = element.strokeColor
        ctx.lineWidth = element.strokeWidth
        ctx.strokeRect(0, 0, width, height)
      }
    }
  }

  const drawText = (ctx: CanvasRenderingContext2D, element: TemplateElement, width: number, height: number) => {
    const textElement = element as any // Cast para acceder a propiedades de texto
    
    if (!textElement.text) return
    
    ctx.fillStyle = textElement.color || element.fillColor || '#000000'
    
    // Configurar fuente
    const fontSize = textElement.fontSize || Math.min(width, height) / 4
    const fontWeight = textElement.fontWeight || 'normal'
    const fontFamily = textElement.fontFamily || 'Arial'
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
    
    // Configurar alineación
    ctx.textAlign = textElement.textAlign || 'center'
    ctx.textBaseline = 'middle'
    
    // Dibujar el texto
    ctx.fillText(textElement.text, width / 2, height / 2)
  }

  const drawImage = async (ctx: CanvasRenderingContext2D, element: TemplateElement, width: number, height: number) => {
    if (!element.src) return

    try {
      // Cargar la imagen del elemento (no redimensionar a todo el canvas)
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          // Dibujar la imagen en la posición y tamaño específicos del elemento
          ctx.drawImage(img, 0, 0, width, height)
          resolve()
        }
        img.onerror = () => reject(new Error(`Error cargando imagen del elemento: ${element.src}`))
        img.src = element.src
      })
    } catch (err) {
      console.warn('Error cargando imagen del elemento:', err)
      // Dibujar un placeholder para la imagen
      ctx.fillStyle = '#f0f0f0'
      ctx.fillRect(0, 0, width, height)
      ctx.strokeStyle = '#ccc'
      ctx.strokeRect(0, 0, width, height)
      
      // Dibujar texto indicando imagen no disponible
      ctx.fillStyle = '#666'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('Imagen no disponible', width / 2, height / 2)
    }
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`} style={{ width, height }}>
        <span className="text-red-500 text-sm">Error: {error}</span>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover"
        style={{ maxWidth: width, maxHeight: height }}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
        </div>
      )}
    </div>
  )
}