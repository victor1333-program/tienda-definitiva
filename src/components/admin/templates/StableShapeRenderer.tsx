"use client"

import { memo } from 'react'

// Renderizador ESTABLE de formas - sin condiciones complejas que causen re-mounting
const StableShapeRenderer = memo(({ element, zoom, updateElement }: { 
  element: any, 
  zoom: number,
  updateElement: (id: string, updates: any) => void 
}) => {
  // Asegurar valores por defecto
  const strokeColor = element.strokeColor || '#000000'
  const strokeWidth = element.strokeWidth || 2
  const fillColor = element.fillColor || '#ff6b35'
  
  // Calcular estilos de borde - LÓGICA MEJORADA
  const hasValidStroke = strokeColor !== 'transparent' && strokeColor !== null && strokeColor !== undefined && strokeWidth > 0
  const borderStyle = hasValidStroke ? `${Math.max(1, strokeWidth)}px solid ${strokeColor}` : 'none'
  
  return (
    <div
      className="element-content cursor-move"
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
      }}
      data-debug={`fill:${fillColor} stroke:${strokeColor} width:${strokeWidth} border:${borderStyle}`}
    >
      {/* Formas custom con máscara - manejo especial */}
      {element.shapeType === 'custom' && element.src ? (
        <div className="relative w-full h-full">
          {/* LÓGICA CORREGIDA: Solo borde cuando stroke NO es transparente */}
          {strokeColor !== 'transparent' && strokeColor !== null && strokeColor !== undefined && (
            <div 
              className="absolute inset-0"
              style={{
                backgroundColor: strokeColor,
                WebkitMask: `url(${element.src}) no-repeat center/contain`,
                mask: `url(${element.src}) no-repeat center/contain`
              }}
            />
          )}
          {/* LÓGICA CORREGIDA: Solo relleno cuando fill NO es transparente */}
          {fillColor !== 'transparent' && (
            <div 
              className="absolute"
              style={{
                backgroundColor: fillColor,
                WebkitMask: `url(${element.src}) no-repeat center/contain`,
                mask: `url(${element.src}) no-repeat center/contain`,
                // Ajustar posición solo si hay borde válido
                top: `${hasValidStroke ? Math.max(1, strokeWidth) : 0}px`,
                left: `${hasValidStroke ? Math.max(1, strokeWidth) : 0}px`,
                right: `${hasValidStroke ? Math.max(1, strokeWidth) : 0}px`,
                bottom: `${hasValidStroke ? Math.max(1, strokeWidth) : 0}px`,
              }}
            />
          )}
        </div>
      ) : (
        /* Formas básicas con CSS normal - LÓGICA CORREGIDA */
        <div
          className="w-full h-full"
          style={{
            // SOLO aplicar backgroundColor si NO es transparente
            backgroundColor: fillColor === 'transparent' ? 'transparent' : fillColor,
            borderRadius: element.shapeType === 'circle' ? '50%' : 
                         element.shapeType === 'star' ? '8px' :
                         element.shapeType === 'heart' ? '8px' : '0',
            // SOLO aplicar border si strokeColor NO es transparente
            border: (strokeColor === 'transparent' || strokeColor === null || strokeColor === undefined || strokeWidth <= 0) 
              ? 'none' 
              : `${Math.max(1, strokeWidth)}px solid ${strokeColor}`,
            boxSizing: 'border-box'
          }}
        />
      )}
      
      {/* Contenido especial para formas complejas - SIEMPRE RENDERIZADO */}
      <div 
        className="absolute inset-0 flex items-center justify-center font-bold"
        style={{ 
          fontSize: element.height * 0.3,
          opacity: element.shapeType === 'star' ? 1 : 0,
          pointerEvents: 'none'
        }}
      >
        ⭐
      </div>
      <div 
        className="absolute inset-0 flex items-center justify-center font-bold"
        style={{ 
          fontSize: element.height * 0.4,
          opacity: element.shapeType === 'heart' ? 1 : 0,
          pointerEvents: 'none'
        }}
      >
        ❤️
      </div>
      
      {/* Máscara de imagen - SOLO cuando está habilitada */}
      {element.useAsFillableShape && (
        <div 
          className="absolute inset-0 overflow-hidden"
          style={{
            borderRadius: element.shapeType === 'circle' ? '50%' : 
                         element.shapeType === 'star' ? '8px' :
                         element.shapeType === 'heart' ? '8px' : '0',
            // Aplicar máscara SOLO al área de la forma
            WebkitMask: element.shapeType === 'custom' && element.src ? `url(${element.src}) no-repeat center/contain` : undefined,
            mask: element.shapeType === 'custom' && element.src ? `url(${element.src}) no-repeat center/contain` : undefined
          }}
        >
          {/* Imagen con escalado independiente del contenedor */}
          <img
            src={element.maskImageSrc || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg"%3E%3C/svg%3E'}
            alt="Imagen de máscara"
            className="absolute object-cover"
            style={{
              // CORRECCIÓN: La escala NO debe afectar las dimensiones del contenedor
              width: '100%',
              height: '100%',
              transform: `translate(${(element.maskImageX || 0)}px, ${(element.maskImageY || 0)}px) scale(${element.maskImageScale || 1})`,
              transformOrigin: 'center center',
              opacity: element.maskImageSrc ? 1 : 0
            }}
          />
          {/* Ícono de cámara - SOLO visible cuando no hay imagen */}
          {!element.maskImageSrc && (
            <div 
              className="absolute inset-0 bg-gray-200 bg-opacity-70 flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-all"
              style={{
                borderRadius: element.shapeType === 'circle' ? '50%' : 
                             element.shapeType === 'star' ? '8px' :
                             element.shapeType === 'heart' ? '8px' : '0'
              }}
              onClick={(e) => {
                e.stopPropagation()
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = 'image/*'
                input.onchange = (event) => {
                  const file = (event.target as HTMLInputElement).files?.[0]
                  if (file) {
                    const reader = new FileReader()
                    reader.onload = (e) => {
                      const imageData = e.target?.result as string
                      updateElement(element.id, { 
                        maskImageSrc: imageData,
                        maskImageX: 0,
                        maskImageY: 0,
                        maskImageScale: 1
                      })
                    }
                    reader.readAsDataURL(file)
                  }
                }
                input.click()
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-600">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}
        </div>
      )}
    </div>
  )
})

StableShapeRenderer.displayName = 'StableShapeRenderer'

export default StableShapeRenderer