'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Download, 
  X, 
  Image as ImageIcon,
  FileImage,
  FileText,
  Settings,
  Check,
  Eye,
  Copy
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  canvasRef: React.RefObject<HTMLCanvasElement>
  elements: any[]
  canvasSize: { width: number; height: number }
  canvasBackground: string
}

interface ExportSettings {
  format: 'png' | 'jpg' | 'svg' | 'pdf'
  quality: number
  scale: number
  includeBackground: boolean
  filename: string
}

const exportFormats = [
  {
    id: 'png',
    name: 'PNG',
    description: 'Imagen con transparencia',
    icon: <FileImage className="w-5 h-5" />,
    extension: 'png',
    supportsTransparency: true,
    bestFor: 'Logos, iconos, diseños con transparencia'
  },
  {
    id: 'jpg',
    name: 'JPG',
    description: 'Imagen comprimida',
    icon: <ImageIcon className="w-5 h-5" />,
    extension: 'jpg',
    supportsTransparency: false,
    bestFor: 'Fotografías, diseños complejos'
  },
  {
    id: 'svg',
    name: 'SVG',
    description: 'Gráfico vectorial escalable',
    icon: <FileText className="w-5 h-5" />,
    extension: 'svg',
    supportsTransparency: true,
    bestFor: 'Logos, iconos, impresión profesional'
  },
  {
    id: 'pdf',
    name: 'PDF',
    description: 'Documento portable',
    icon: <FileText className="w-5 h-5" />,
    extension: 'pdf',
    supportsTransparency: true,
    bestFor: 'Impresión, documentos'
  }
]

const exportSizes = [
  { name: 'Original', scale: 1, description: 'Tamaño original del canvas' },
  { name: 'HD (2x)', scale: 2, description: 'Doble resolución' },
  { name: '4K (4x)', scale: 4, description: 'Ultra alta resolución' },
  { name: 'Impresión (8x)', scale: 8, description: 'Calidad de impresión profesional' },
]

export default function ExportModal({ 
  isOpen, 
  onClose, 
  canvasRef,
  elements,
  canvasSize,
  canvasBackground 
}: ExportModalProps) {
  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    format: 'png',
    quality: 0.9,
    scale: 1,
    includeBackground: true,
    filename: `diseño-${new Date().toISOString().split('T')[0]}`
  })
  const [isExporting, setIsExporting] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)

  if (!isOpen) return null

  const updateSetting = (key: keyof ExportSettings, value: any) => {
    setExportSettings(prev => ({ ...prev, [key]: value }))
  }

  const generatePreview = async () => {
    if (!canvasRef.current) return

    const sourceCanvas = canvasRef.current
    const previewCanvas = previewCanvasRef.current
    if (!previewCanvas) return

    const ctx = previewCanvas.getContext('2d')
    if (!ctx) return

    // Configurar el canvas de preview
    const previewScale = 0.5
    previewCanvas.width = canvasSize.width * previewScale
    previewCanvas.height = canvasSize.height * previewScale

    // Limpiar
    ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height)

    // Fondo
    if (exportSettings.includeBackground) {
      ctx.fillStyle = canvasBackground
      ctx.fillRect(0, 0, previewCanvas.width, previewCanvas.height)
    }

    // Escalar y dibujar el contenido del canvas original
    ctx.scale(previewScale, previewScale)
    ctx.drawImage(sourceCanvas, 0, 0)

    // Generar URL de preview
    const dataUrl = previewCanvas.toDataURL('image/png')
    setPreviewUrl(dataUrl)
  }

  const drawElementsToCanvas = (
    ctx: CanvasRenderingContext2D, 
    scale: number = 1
  ) => {
    elements
      .sort((a, b) => a.zIndex - b.zIndex)
      .forEach(element => {
        ctx.save()
        
        // Aplicar transformaciones con escala
        ctx.translate(element.x * scale, element.y * scale)
        ctx.rotate((element.rotation * Math.PI) / 180)
        
        switch (element.type) {
          case 'text':
            drawTextElement(ctx, element, scale)
            break
          case 'image':
            drawImageElement(ctx, element, scale)
            break
          case 'shape':
            drawShapeElement(ctx, element, scale)
            break
        }
        
        ctx.restore()
      })
  }

  const drawTextElement = (ctx: CanvasRenderingContext2D, element: any, scale: number) => {
    if (!element.text) return

    ctx.fillStyle = element.color || '#000000'
    ctx.font = `${element.fontStyle || 'normal'} ${element.fontWeight || 'normal'} ${(element.fontSize || 24) * scale}px ${element.fontFamily || 'Arial'}`
    ctx.textAlign = element.textAlign || 'left'
    
    const lines = element.text.split('\n')
    const lineHeight = (element.fontSize || 24) * scale * 1.2
    
    lines.forEach((line: string, index: number) => {
      ctx.fillText(line, 0, index * lineHeight)
    })
  }

  const drawImageElement = (ctx: CanvasRenderingContext2D, element: any, scale: number) => {
    // Si hay una imagen real, dibujarla, sino placeholder
    if (element.imageData) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, element.width * scale, element.height * scale)
      }
      img.src = element.imageData
    } else {
      // Placeholder
      ctx.fillStyle = '#f3f4f6'
      ctx.fillRect(0, 0, element.width * scale, element.height * scale)
      ctx.strokeStyle = '#9ca3af'
      ctx.strokeRect(0, 0, element.width * scale, element.height * scale)
    }
  }

  const drawShapeElement = (ctx: CanvasRenderingContext2D, element: any, scale: number) => {
    const width = element.width * scale
    const height = element.height * scale

    ctx.fillStyle = element.fillColor || '#3b82f6'
    ctx.strokeStyle = element.strokeColor || '#1e40af'
    ctx.lineWidth = (element.strokeWidth || 2) * scale

    switch (element.shapeType) {
      case 'rectangle':
      case 'square':
        ctx.fillRect(0, 0, width, height)
        if (element.strokeWidth > 0) {
          ctx.strokeRect(0, 0, width, height)
        }
        break
      case 'circle':
      case 'ellipse':
        ctx.beginPath()
        ctx.ellipse(width/2, height/2, width/2, height/2, 0, 0, 2 * Math.PI)
        ctx.fill()
        if (element.strokeWidth > 0) {
          ctx.stroke()
        }
        break
      case 'triangle':
        ctx.beginPath()
        ctx.moveTo(width / 2, 0)
        ctx.lineTo(0, height)
        ctx.lineTo(width, height)
        ctx.closePath()
        ctx.fill()
        if (element.strokeWidth > 0) {
          ctx.stroke()
        }
        break
      // Añadir más formas según sea necesario
    }
  }

  const exportAsRaster = async () => {
    setIsExporting(true)
    
    try {
      // Crear canvas temporal para exportación
      const exportCanvas = document.createElement('canvas')
      const ctx = exportCanvas.getContext('2d')
      if (!ctx) throw new Error('No se pudo crear contexto de canvas')

      // Configurar tamaño con escala
      const finalWidth = canvasSize.width * exportSettings.scale
      const finalHeight = canvasSize.height * exportSettings.scale
      exportCanvas.width = finalWidth
      exportCanvas.height = finalHeight

      // Fondo
      if (exportSettings.includeBackground) {
        ctx.fillStyle = canvasBackground
        ctx.fillRect(0, 0, finalWidth, finalHeight)
      }

      // Dibujar elementos
      drawElementsToCanvas(ctx, exportSettings.scale)

      // Exportar
      const mimeType = exportSettings.format === 'jpg' ? 'image/jpeg' : 'image/png'
      const dataUrl = exportCanvas.toDataURL(mimeType, exportSettings.quality)

      // Descargar
      const link = document.createElement('a')
      link.download = `${exportSettings.filename}.${exportSettings.format}`
      link.href = dataUrl
      link.click()

      toast.success(`Diseño exportado como ${exportSettings.format.toUpperCase()}`)
    } catch (error) {
      console.error('Error exporting:', error)
      toast.error('Error al exportar el diseño')
    } finally {
      setIsExporting(false)
    }
  }

  const exportAsSVG = async () => {
    setIsExporting(true)
    
    try {
      // Crear SVG
      let svgContent = `<svg width="${canvasSize.width * exportSettings.scale}" height="${canvasSize.height * exportSettings.scale}" xmlns="http://www.w3.org/2000/svg">`
      
      // Fondo
      if (exportSettings.includeBackground) {
        svgContent += `<rect width="100%" height="100%" fill="${canvasBackground}"/>`
      }

      // Elementos (simplificado, solo texto y formas básicas)
      elements
        .sort((a, b) => a.zIndex - b.zIndex)
        .forEach(element => {
          const x = element.x * exportSettings.scale
          const y = element.y * exportSettings.scale
          const width = element.width * exportSettings.scale
          const height = element.height * exportSettings.scale

          switch (element.type) {
            case 'text':
              if (element.text) {
                svgContent += `<text x="${x}" y="${y + (element.fontSize || 24) * exportSettings.scale}" fill="${element.color || '#000000'}" font-family="${element.fontFamily || 'Arial'}" font-size="${(element.fontSize || 24) * exportSettings.scale}" font-weight="${element.fontWeight || 'normal'}" font-style="${element.fontStyle || 'normal'}">${element.text}</text>`
              }
              break
            case 'shape':
              switch (element.shapeType) {
                case 'rectangle':
                case 'square':
                  svgContent += `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${element.fillColor || '#3b82f6'}" stroke="${element.strokeColor || '#1e40af'}" stroke-width="${(element.strokeWidth || 2) * exportSettings.scale}"/>`
                  break
                case 'circle':
                case 'ellipse':
                  svgContent += `<ellipse cx="${x + width/2}" cy="${y + height/2}" rx="${width/2}" ry="${height/2}" fill="${element.fillColor || '#3b82f6'}" stroke="${element.strokeColor || '#1e40af'}" stroke-width="${(element.strokeWidth || 2) * exportSettings.scale}"/>`
                  break
              }
              break
          }
        })

      svgContent += '</svg>'

      // Descargar
      const blob = new Blob([svgContent], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.download = `${exportSettings.filename}.svg`
      link.href = url
      link.click()
      URL.revokeObjectURL(url)

      toast.success('Diseño exportado como SVG')
    } catch (error) {
      console.error('Error exporting SVG:', error)
      toast.error('Error al exportar como SVG')
    } finally {
      setIsExporting(false)
    }
  }

  const handleExport = async () => {
    if (exportSettings.format === 'svg') {
      await exportAsSVG()
    } else {
      await exportAsRaster()
    }
  }

  const copyToClipboard = async () => {
    if (!canvasRef.current) return

    try {
      const canvas = canvasRef.current
      canvas.toBlob(async (blob) => {
        if (blob) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ])
          toast.success('Diseño copiado al portapapeles')
        }
      })
    } catch (error) {
      toast.error('Error al copiar al portapapeles')
    }
  }

  // Generar preview cuando cambien las configuraciones
  useState(() => {
    if (isOpen) {
      setTimeout(generatePreview, 100)
    }
  }, [isOpen, exportSettings.includeBackground])

  const selectedFormat = exportFormats.find(f => f.id === exportSettings.format)

  return (
    <div className="fixed inset-0 bg-black/35 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <Download className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold">Exportar Diseño</h2>
              <p className="text-sm text-gray-600">
                Configura las opciones de exportación y descarga tu diseño
              </p>
            </div>
          </div>
          
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Settings Panel */}
          <div className="w-80 border-r bg-gray-50 p-4 overflow-y-auto">
            {/* Format Selection */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Formato de Exportación</h3>
              <div className="grid grid-cols-2 gap-2">
                {exportFormats.map(format => (
                  <Card 
                    key={format.id}
                    className={`cursor-pointer transition-all ${
                      exportSettings.format === format.id 
                        ? 'ring-2 ring-orange-500 bg-orange-50' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => updateSetting('format', format.id)}
                  >
                    <CardContent className="p-3 text-center">
                      <div className="flex justify-center mb-2">
                        {format.icon}
                      </div>
                      <h4 className="font-medium text-sm">{format.name}</h4>
                      <p className="text-xs text-gray-500">{format.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {selectedFormat && (
                <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                  <strong>Ideal para:</strong> {selectedFormat.bestFor}
                </div>
              )}
            </div>

            {/* Quality Settings */}
            {exportSettings.format === 'jpg' && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Calidad ({Math.round(exportSettings.quality * 100)}%)
                </h3>
                <Input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={exportSettings.quality}
                  onChange={(e) => updateSetting('quality', Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Menor tamaño</span>
                  <span>Mejor calidad</span>
                </div>
              </div>
            )}

            {/* Size Settings */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Tamaño de Exportación</h3>
              <div className="space-y-2">
                {exportSizes.map(size => (
                  <button
                    key={size.scale}
                    onClick={() => updateSetting('scale', size.scale)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      exportSettings.scale === size.scale
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">{size.name}</div>
                        <div className="text-xs text-gray-500">{size.description}</div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {canvasSize.width * size.scale} × {canvasSize.height * size.scale}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Additional Options */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Opciones Adicionales</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={exportSettings.includeBackground}
                    onChange={(e) => updateSetting('includeBackground', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Incluir fondo del canvas</span>
                </label>
              </div>
            </div>

            {/* Filename */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Nombre del Archivo</h3>
              <Input
                value={exportSettings.filename}
                onChange={(e) => updateSetting('filename', e.target.value)}
                placeholder="mi-diseño"
              />
              <p className="text-xs text-gray-500 mt-1">
                Se añadirá la extensión automáticamente
              </p>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="flex-1 p-4 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Vista Previa</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generatePreview}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Actualizar
                </Button>
              </div>
            </div>

            {/* Preview Canvas */}
            <div className="flex-1 flex items-center justify-center bg-gray-100 rounded-lg p-4">
              {previewUrl ? (
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="max-w-full max-h-full object-contain border rounded shadow-lg bg-white"
                />
              ) : (
                <div className="text-center text-gray-500">
                  <Download className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Generando vista previa...</p>
                </div>
              )}
            </div>

            {/* Export Info */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Formato:</strong> {selectedFormat?.name}
                </div>
                <div>
                  <strong>Resolución:</strong> {canvasSize.width * exportSettings.scale} × {canvasSize.height * exportSettings.scale}
                </div>
                <div>
                  <strong>Escala:</strong> {exportSettings.scale}x
                </div>
                <div>
                  <strong>Archivo:</strong> {exportSettings.filename}.{selectedFormat?.extension}
                </div>
              </div>
            </div>

            {/* Export Button */}
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full mt-4 bg-orange-600 hover:bg-orange-700"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Diseño
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Hidden canvas for preview generation */}
        <canvas 
          ref={previewCanvasRef} 
          className="hidden" 
        />
      </div>
    </div>
  )
}