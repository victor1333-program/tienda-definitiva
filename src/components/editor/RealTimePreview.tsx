"use client"

import React, { useState, useEffect, useRef } from 'react'
import { 
  Eye,
  Smartphone,
  Tablet,
  Monitor,
  Printer,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Download,
  Share2,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Camera,
  Video,
  Maximize2,
  Minimize2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { toast } from 'react-hot-toast'

interface PreviewDevice {
  id: string
  name: string
  width: number
  height: number
  dpi: number
  icon: React.ReactNode
  type: 'mobile' | 'tablet' | 'desktop' | 'print'
}

interface PreviewMode {
  id: string
  name: string
  description: string
}

interface RealTimePreviewProps {
  designData: any
  productData?: any
  onExport?: (format: string, options: any) => void
  onShare?: (platform: string) => void
  className?: string
  fullscreen?: boolean
}

export default function RealTimePreview({
  designData,
  productData,
  onExport,
  onShare,
  className = "",
  fullscreen = false
}: RealTimePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  
  const [selectedDevice, setSelectedDevice] = useState<string>('desktop')
  const [previewMode, setPreviewMode] = useState<string>('realistic')
  const [zoom, setZoom] = useState(100)
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationStep, setAnimationStep] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(fullscreen)
  const [backgroundVariant, setBackgroundVariant] = useState('white')
  const [qualitySettings, setQualitySettings] = useState({
    resolution: 'high',
    antialiasing: true,
    shadows: true
  })

  const devices: PreviewDevice[] = [
    {
      id: 'mobile',
      name: 'Móvil',
      width: 375,
      height: 667,
      dpi: 326,
      icon: <Smartphone className="w-4 h-4" />,
      type: 'mobile'
    },
    {
      id: 'tablet',
      name: 'Tablet',
      width: 768,
      height: 1024,
      dpi: 264,
      icon: <Tablet className="w-4 h-4" />,
      type: 'tablet'
    },
    {
      id: 'desktop',
      name: 'Escritorio',
      width: 1920,
      height: 1080,
      dpi: 96,
      icon: <Monitor className="w-4 h-4" />,
      type: 'desktop'
    },
    {
      id: 'print',
      name: 'Impresión',
      width: 2480,
      height: 3508, // A4 at 300 DPI
      dpi: 300,
      icon: <Printer className="w-4 h-4" />,
      type: 'print'
    }
  ]

  const previewModes: PreviewMode[] = [
    {
      id: 'realistic',
      name: 'Vista Realista',
      description: 'Vista con efectos y sombras reales'
    },
    {
      id: 'print',
      name: 'Vista de Impresión',
      description: 'Como se verá al imprimir'
    },
    {
      id: 'mockup',
      name: 'Mockup 3D',
      description: 'Visualización en contexto 3D'
    },
    {
      id: 'animation',
      name: 'Animación',
      description: 'Preview animado del diseño'
    }
  ]

  const backgroundVariants = [
    { id: 'white', name: 'Blanco', color: '#ffffff' },
    { id: 'transparent', name: 'Transparente', color: 'transparent' },
    { id: 'dark', name: 'Oscuro', color: '#1f2937' },
    { id: 'gradient', name: 'Degradado', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
  ]

  const currentDevice = devices.find(d => d.id === selectedDevice) || devices[2]

  useEffect(() => {
    renderPreview()
  }, [designData, selectedDevice, previewMode, backgroundVariant, qualitySettings, zoom])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isAnimating && previewMode === 'animation') {
      interval = setInterval(() => {
        setAnimationStep(prev => (prev + 1) % 10)
      }, 500)
    }
    return () => clearInterval(interval)
  }, [isAnimating, previewMode])

  const renderPreview = () => {
    const canvas = canvasRef.current
    if (!canvas || !designData) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size based on device
    const scale = currentDevice.dpi / 96 // Scale for device DPI
    canvas.width = currentDevice.width * scale
    canvas.height = currentDevice.height * scale
    canvas.style.width = `${currentDevice.width * (zoom / 100)}px`
    canvas.style.height = `${currentDevice.height * (zoom / 100)}px`

    // Configure rendering quality
    if (qualitySettings.antialiasing) {
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Apply background
    applyBackground(ctx, canvas.width, canvas.height)

    // Render design elements
    renderDesignElements(ctx, scale)

    // Apply preview mode effects
    applyPreviewEffects(ctx, canvas.width, canvas.height)
  }

  const applyBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const variant = backgroundVariants.find(v => v.id === backgroundVariant)
    if (!variant) return

    if (variant.id === 'transparent') {
      // Draw checkerboard pattern for transparency
      const checkSize = 20
      for (let x = 0; x < width; x += checkSize) {
        for (let y = 0; y < height; y += checkSize) {
          const isEven = (Math.floor(x / checkSize) + Math.floor(y / checkSize)) % 2 === 0
          ctx.fillStyle = isEven ? '#f0f0f0' : '#ffffff'
          ctx.fillRect(x, y, checkSize, checkSize)
        }
      }
    } else if (variant.id === 'gradient') {
      const gradient = ctx.createLinearGradient(0, 0, width, height)
      gradient.addColorStop(0, '#667eea')
      gradient.addColorStop(1, '#764ba2')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)
    } else {
      ctx.fillStyle = variant.color
      ctx.fillRect(0, 0, width, height)
    }
  }

  const renderDesignElements = (ctx: CanvasRenderingContext2D, scale: number) => {
    if (!designData.elements) return

    // Sort by z-index
    const sortedElements = [...designData.elements].sort((a, b) => a.style.zIndex - b.style.zIndex)

    sortedElements.forEach((element, index) => {
      if (!element.style.visible) return

      ctx.save()

      // Apply transformations
      const x = element.style.x * scale
      const y = element.style.y * scale
      const width = element.style.width * scale
      const height = element.style.height * scale

      ctx.globalAlpha = element.style.opacity
      ctx.translate(x + width / 2, y + height / 2)
      ctx.rotate((element.style.rotation * Math.PI) / 180)
      ctx.translate(-width / 2, -height / 2)

      // Animation effects
      if (isAnimating && previewMode === 'animation') {
        const animationOffset = Math.sin(animationStep * 0.5 + index * 0.3) * 10
        ctx.translate(0, animationOffset)
      }

      // Render based on element type
      switch (element.type) {
        case 'text':
          renderTextElement(ctx, element, width, height, scale)
          break
        case 'shape':
          renderShapeElement(ctx, element, width, height)
          break
        case 'image':
          renderImageElement(ctx, element, width, height)
          break
      }

      ctx.restore()
    })
  }

  const renderTextElement = (ctx: CanvasRenderingContext2D, element: any, width: number, height: number, scale: number) => {
    ctx.fillStyle = element.content.color || '#000000'
    ctx.font = `${element.content.fontSize * scale}px ${element.content.fontFamily || 'Arial'}`
    ctx.textAlign = element.content.textAlign || 'left'
    ctx.textBaseline = 'top'

    // Add text shadow for realistic mode
    if (previewMode === 'realistic' && qualitySettings.shadows) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
      ctx.shadowBlur = 2 * scale
      ctx.shadowOffsetX = 1 * scale
      ctx.shadowOffsetY = 1 * scale
    }

    // Word wrap
    const words = element.content.text.split(' ')
    const lines: string[] = []
    let currentLine = ''
    const maxWidth = width - (20 * scale) // padding

    words.forEach(word => {
      const testLine = currentLine + (currentLine ? ' ' : '') + word
      const metrics = ctx.measureText(testLine)
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    })
    if (currentLine) lines.push(currentLine)

    // Render lines
    const lineHeight = element.content.fontSize * scale * 1.2
    lines.forEach((line, index) => {
      ctx.fillText(line, 10 * scale, (10 + index * lineHeight / scale) * scale)
    })

    // Reset shadow
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
  }

  const renderShapeElement = (ctx: CanvasRenderingContext2D, element: any, width: number, height: number) => {
    ctx.fillStyle = element.content.fillColor || '#3B82F6'
    ctx.strokeStyle = element.content.strokeColor || '#1E40AF'
    ctx.lineWidth = element.content.strokeWidth || 2

    // Add shadow for realistic mode
    if (previewMode === 'realistic' && qualitySettings.shadows) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
      ctx.shadowBlur = 5
      ctx.shadowOffsetX = 2
      ctx.shadowOffsetY = 2
    }

    switch (element.content.shape) {
      case 'rectangle':
        ctx.fillRect(0, 0, width, height)
        if (element.content.strokeWidth > 0) {
          ctx.strokeRect(0, 0, width, height)
        }
        break

      case 'circle':
        const radius = Math.min(width, height) / 2
        ctx.beginPath()
        ctx.arc(width / 2, height / 2, radius, 0, 2 * Math.PI)
        ctx.fill()
        if (element.content.strokeWidth > 0) {
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
        if (element.content.strokeWidth > 0) {
          ctx.stroke()
        }
        break

      case 'star':
        drawStar(ctx, width / 2, height / 2, Math.min(width, height) / 4, Math.min(width, height) / 2, 5)
        ctx.fill()
        if (element.content.strokeWidth > 0) {
          ctx.stroke()
        }
        break

      case 'heart':
        drawHeart(ctx, width / 2, height / 2, Math.min(width, height) / 2)
        ctx.fill()
        if (element.content.strokeWidth > 0) {
          ctx.stroke()
        }
        break
    }

    // Reset shadow
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
  }

  const renderImageElement = (ctx: CanvasRenderingContext2D, element: any, width: number, height: number) => {
    // Placeholder for image rendering
    ctx.fillStyle = '#f3f4f6'
    ctx.fillRect(0, 0, width, height)
    ctx.strokeStyle = '#d1d5db'
    ctx.strokeRect(0, 0, width, height)
    
    // Draw image icon placeholder
    ctx.fillStyle = '#9ca3af'
    ctx.font = `${Math.min(width, height) / 4}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('📷', width / 2, height / 2)
  }

  const drawStar = (ctx: CanvasRenderingContext2D, cx: number, cy: number, innerRadius: number, outerRadius: number, points: number) => {
    ctx.beginPath()
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius
      const angle = (i * Math.PI) / points
      const x = cx + Math.cos(angle) * radius
      const y = cy + Math.sin(angle) * radius
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.closePath()
  }

  const drawHeart = (ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) => {
    ctx.beginPath()
    ctx.moveTo(cx, cy + size / 4)
    ctx.bezierCurveTo(cx, cy, cx - size / 2, cy, cx - size / 2, cy + size / 4)
    ctx.bezierCurveTo(cx - size / 2, cy + size / 2, cx, cy + size, cx, cy + size)
    ctx.bezierCurveTo(cx, cy + size, cx + size / 2, cy + size / 2, cx + size / 2, cy + size / 4)
    ctx.bezierCurveTo(cx + size / 2, cy, cx, cy, cx, cy + size / 4)
    ctx.closePath()
  }

  const applyPreviewEffects = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    switch (previewMode) {
      case 'print':
        // Add print marks/guides
        ctx.strokeStyle = '#00ffff'
        ctx.lineWidth = 1
        ctx.setLineDash([5, 5])
        
        // Corner marks
        const markSize = 20
        // Top-left
        ctx.beginPath()
        ctx.moveTo(0, markSize)
        ctx.lineTo(0, 0)
        ctx.lineTo(markSize, 0)
        ctx.stroke()
        
        // Add more corner marks...
        break

      case 'mockup':
        // Add 3D perspective effect
        ctx.save()
        ctx.globalCompositeOperation = 'multiply'
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
        
        // Create perspective shadow
        ctx.beginPath()
        ctx.moveTo(width * 0.9, height * 0.9)
        ctx.lineTo(width, height * 0.95)
        ctx.lineTo(width, height)
        ctx.lineTo(width * 0.95, height)
        ctx.closePath()
        ctx.fill()
        ctx.restore()
        break
    }
  }

  const handleExport = (format: string) => {
    const canvas = canvasRef.current
    if (!canvas) return

    try {
      let dataURL: string
      let filename = `preview-${Date.now()}`

      switch (format) {
        case 'png':
          dataURL = canvas.toDataURL('image/png', 1.0)
          filename += '.png'
          break
        case 'jpg':
          dataURL = canvas.toDataURL('image/jpeg', 0.9)
          filename += '.jpg'
          break
        case 'webp':
          dataURL = canvas.toDataURL('image/webp', 0.9)
          filename += '.webp'
          break
        default:
          throw new Error('Formato no soportado')
      }

      // Download
      const link = document.createElement('a')
      link.download = filename
      link.href = dataURL
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success(`Preview exportado como ${format.toUpperCase()}`)
      
      if (onExport) {
        onExport(format, {
          device: currentDevice,
          mode: previewMode,
          quality: qualitySettings
        })
      }
    } catch (error) {
      console.error('Error exporting:', error)
      toast.error('Error al exportar el preview')
    }
  }

  const handleShare = (platform: string) => {
    if (!canvasRef.current) return

    try {
      const dataURL = canvasRef.current.toDataURL('image/png', 0.8)
      
      // Create share data
      const shareData = {
        title: 'Mi diseño personalizado',
        text: 'Mira este diseño que he creado',
        url: window.location.href
      }

      if (navigator.share && platform === 'native') {
        navigator.share(shareData)
      } else {
        // Fallback to specific platform URLs
        const urls = {
          facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
          twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(window.location.href)}`,
          whatsapp: `https://wa.me/?text=${encodeURIComponent(shareData.text + ' ' + window.location.href)}`,
          email: `mailto:?subject=${encodeURIComponent(shareData.title)}&body=${encodeURIComponent(shareData.text + '\n\n' + window.location.href)}`
        }

        const url = urls[platform as keyof typeof urls]
        if (url) {
          window.open(url, '_blank', 'width=600,height=400')
        }
      }

      if (onShare) {
        onShare(platform)
      }

      toast.success('Diseño compartido')
    } catch (error) {
      console.error('Error sharing:', error)
      toast.error('Error al compartir')
    }
  }

  const toggleFullscreen = () => {
    if (!isFullscreen && previewRef.current) {
      previewRef.current.requestFullscreen?.()
    } else if (document.fullscreenElement) {
      document.exitFullscreen()
    }
    setIsFullscreen(!isFullscreen)
  }

  return (
    <div ref={previewRef} className={`${className} ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Vista Previa en Tiempo Real
              <Badge className="bg-green-100 text-green-800">
                Live
              </Badge>
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4">
            {/* Device Selection */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Dispositivo</Label>
              <Select value={selectedDevice} onValueChange={setSelectedDevice}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {devices.map(device => (
                    <SelectItem key={device.id} value={device.id}>
                      <div className="flex items-center gap-2">
                        {device.icon}
                        <span>{device.name}</span>
                        <span className="text-xs text-gray-500">
                          {device.width}×{device.height}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Preview Mode */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Modo de Vista</Label>
              <Select value={previewMode} onValueChange={setPreviewMode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {previewModes.map(mode => (
                    <SelectItem key={mode.id} value={mode.id}>
                      <div>
                        <div className="font-medium">{mode.name}</div>
                        <div className="text-xs text-gray-500">{mode.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Background */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Fondo</Label>
              <Select value={backgroundVariant} onValueChange={setBackgroundVariant}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {backgroundVariants.map(variant => (
                    <SelectItem key={variant.id} value={variant.id}>
                      {variant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Zoom */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Zoom: {zoom}%</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom(Math.max(25, zoom - 25))}
                >
                  <ZoomOut className="w-3 h-3" />
                </Button>
                <Slider
                  value={[zoom]}
                  onValueChange={([value]) => setZoom(value)}
                  min={25}
                  max={200}
                  step={25}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom(Math.min(200, zoom + 25))}
                >
                  <ZoomIn className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-2">
              {previewMode === 'animation' && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAnimating(!isAnimating)}
                  >
                    {isAnimating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAnimationStep(0)}
                  >
                    <SkipBack className="w-4 h-4" />
                  </Button>
                </div>
              )}
              
              <Badge className="bg-blue-100 text-blue-800">
                {currentDevice.name} • {currentDevice.width}×{currentDevice.height}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              {/* Export */}
              <Select onValueChange={handleExport}>
                <SelectTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar
                  </Button>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="png">PNG (Mejor calidad)</SelectItem>
                  <SelectItem value="jpg">JPG (Tamaño reducido)</SelectItem>
                  <SelectItem value="webp">WebP (Moderno)</SelectItem>
                </SelectContent>
              </Select>

              {/* Share */}
              <Select onValueChange={handleShare}>
                <SelectTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartir
                  </Button>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="native">Compartir nativo</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>

              {/* Screenshot */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('png')}
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex items-center justify-center p-6 bg-gray-50">
          <div className="relative">
            {/* Device Frame */}
            <div 
              className={`relative bg-gray-800 rounded-lg p-2 ${
                currentDevice.type === 'mobile' ? 'rounded-3xl' : 
                currentDevice.type === 'tablet' ? 'rounded-2xl' : 
                'rounded-lg'
              }`}
              style={{
                width: (currentDevice.width * (zoom / 100)) + 16,
                height: (currentDevice.height * (zoom / 100)) + 16
              }}
            >
              {/* Screen */}
              <div className="relative overflow-hidden bg-white rounded-lg">
                <canvas
                  ref={canvasRef}
                  className="block"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%'
                  }}
                />
                
                {/* Loading overlay */}
                {!designData && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-600">Generando preview...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Device-specific elements */}
              {currentDevice.type === 'mobile' && (
                <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gray-600 rounded-full"></div>
              )}
            </div>

            {/* Preview Info */}
            <div className="absolute -bottom-8 left-0 right-0 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-black bg-opacity-75 text-white text-xs rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                Vista en tiempo real
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}