"use client"

import { useState, useRef } from "react"
import { Upload, Eye, Settings, Palette, Type, Link as LinkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ColoredSwitch } from "@/components/ui/ColoredSwitch"
import { toast } from "react-hot-toast"

interface HeroBannerProps {
  backgroundImage: string
  title: string
  subtitle: string
  buttonText: string
  buttonLink: string
  height: 'small' | 'medium' | 'large' | 'full'
  textAlign: 'left' | 'center' | 'right'
  overlay: number
  textColor?: string
  buttonStyle?: 'primary' | 'secondary' | 'outline'
  showButton?: boolean
}

interface HeroBannerEditorProps {
  props: HeroBannerProps
  onUpdate: (newProps: Partial<HeroBannerProps>) => void
}

export default function HeroBannerEditor({ props, onUpdate }: HeroBannerEditorProps) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (file: File) => {
    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'banners')

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        onUpdate({ backgroundImage: data.url })
        toast.success('Imagen subida correctamente')
      } else {
        toast.error('Error al subir la imagen')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Error al subir la imagen')
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Configuración del Banner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Imagen de fondo */}
          <div>
            <Label>Imagen de Fondo</Label>
            <div className="mt-2">
              {props.backgroundImage ? (
                <div className="relative">
                  <img
                    src={props.backgroundImage}
                    alt="Banner preview"
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2 bg-white"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-3 h-3 mr-1" />
                    Cambiar
                  </Button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
                >
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Haz clic para subir una imagen</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG hasta 5MB</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              {isUploading && (
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                  Subiendo imagen...
                </div>
              )}
            </div>
          </div>

          {/* Altura del banner */}
          <div>
            <Label>Altura del Banner</Label>
            <select
              value={props.height}
              onChange={(e) => onUpdate({ height: e.target.value as any })}
              className="w-full mt-1 p-2 border border-gray-300 rounded-lg"
            >
              <option value="small">Pequeño (300px)</option>
              <option value="medium">Mediano (500px)</option>
              <option value="large">Grande (700px)</option>
              <option value="full">Pantalla completa</option>
            </select>
          </div>

          {/* Opacidad del overlay */}
          <div>
            <Label>Opacidad del Overlay</Label>
            <div className="flex items-center gap-4 mt-2">
              <input
                type="range"
                min="0"
                max="0.8"
                step="0.1"
                value={props.overlay}
                onChange={(e) => onUpdate({ overlay: parseFloat(e.target.value) })}
                className="flex-1"
              />
              <span className="text-sm text-gray-600 w-12">
                {Math.round(props.overlay * 100)}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="w-4 h-4" />
            Contenido del Texto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Título */}
          <div>
            <Label>Título Principal</Label>
            <Input
              value={props.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="Título llamativo del banner"
              className="mt-1"
            />
          </div>

          {/* Subtítulo */}
          <div>
            <Label>Subtítulo</Label>
            <Input
              value={props.subtitle}
              onChange={(e) => onUpdate({ subtitle: e.target.value })}
              placeholder="Descripción o mensaje secundario"
              className="mt-1"
            />
          </div>

          {/* Alineación del texto */}
          <div>
            <Label>Alineación del Texto</Label>
            <div className="flex gap-2 mt-2">
              {['left', 'center', 'right'].map((align) => (
                <Button
                  key={align}
                  size="sm"
                  variant={props.textAlign === align ? 'default' : 'outline'}
                  className={props.textAlign === align ? 'bg-orange-600 hover:bg-orange-700 border-orange-600' : ''}
                  onClick={() => onUpdate({ textAlign: align as any })}
                >
                  {align === 'left' && 'Izquierda'}
                  {align === 'center' && 'Centro'}
                  {align === 'right' && 'Derecha'}
                </Button>
              ))}
            </div>
          </div>

          {/* Color del texto */}
          <div>
            <Label>Color del Texto</Label>
            <div className="flex gap-2 mt-2">
              <input
                type="color"
                value={props.textColor || '#ffffff'}
                onChange={(e) => onUpdate({ textColor: e.target.value })}
                className="w-12 h-8 rounded border"
              />
              <Input
                value={props.textColor || '#ffffff'}
                onChange={(e) => onUpdate({ textColor: e.target.value })}
                placeholder="#ffffff"
                className="flex-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="w-4 h-4" />
            Configuración del Botón
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mostrar botón */}
          <div className="flex items-center justify-between">
            <Label>Mostrar Botón</Label>
            <ColoredSwitch
              checked={props.showButton ?? true}
              onCheckedChange={(checked) => onUpdate({ showButton: checked })}
              activeColor="green"
              inactiveColor="gray"
            />
          </div>

          {(props.showButton ?? true) && (
            <>
              {/* Texto del botón */}
              <div>
                <Label>Texto del Botón</Label>
                <Input
                  value={props.buttonText}
                  onChange={(e) => onUpdate({ buttonText: e.target.value })}
                  placeholder="Ver productos"
                  className="mt-1"
                />
              </div>

              {/* Enlace del botón */}
              <div>
                <Label>Enlace del Botón</Label>
                <Input
                  value={props.buttonLink}
                  onChange={(e) => onUpdate({ buttonLink: e.target.value })}
                  placeholder="/productos"
                  className="mt-1"
                />
              </div>

              {/* Estilo del botón */}
              <div>
                <Label>Estilo del Botón</Label>
                <div className="flex gap-2 mt-2">
                  {[
                    { value: 'primary', label: 'Primario' },
                    { value: 'secondary', label: 'Secundario' },
                    { value: 'outline', label: 'Contorno' }
                  ].map((style) => (
                    <Button
                      key={style.value}
                      size="sm"
                      variant={props.buttonStyle === style.value ? 'default' : 'outline'}
                      className={props.buttonStyle === style.value ? 'bg-orange-600 hover:bg-orange-700 border-orange-600' : ''}
                      onClick={() => onUpdate({ buttonStyle: style.value as any })}
                    >
                      {style.label}
                    </Button>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Vista previa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Vista Previa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`relative rounded-lg overflow-hidden ${
              props.height === 'small' ? 'h-32' :
              props.height === 'medium' ? 'h-48' :
              props.height === 'large' ? 'h-64' :
              'h-80'
            }`}
            style={{
              backgroundImage: props.backgroundImage ? `url(${props.backgroundImage})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {/* Overlay */}
            <div
              className="absolute inset-0 bg-black"
              style={{ opacity: props.overlay }}
            />
            
            {/* Contenido */}
            <div className={`relative h-full flex flex-col justify-center px-8 text-${props.textAlign}`}>
              <h1
                className="text-2xl md:text-4xl font-bold mb-4"
                style={{ color: props.textColor || '#ffffff' }}
              >
                {props.title || 'Título del banner'}
              </h1>
              {props.subtitle && (
                <p
                  className="text-lg mb-6 opacity-90"
                  style={{ color: props.textColor || '#ffffff' }}
                >
                  {props.subtitle}
                </p>
              )}
              {(props.showButton ?? true) && props.buttonText && (
                <div className={props.textAlign === 'center' ? 'flex justify-center' : props.textAlign === 'right' ? 'flex justify-end' : ''}>
                  <button
                    className={`px-6 py-3 rounded-lg font-medium ${
                      props.buttonStyle === 'primary' ? 'bg-orange-500 text-white hover:bg-orange-600' :
                      props.buttonStyle === 'secondary' ? 'bg-gray-800 text-white hover:bg-gray-900' :
                      'border-2 border-white text-white hover:bg-white hover:text-gray-900'
                    } transition-colors`}
                  >
                    {props.buttonText}
                  </button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}