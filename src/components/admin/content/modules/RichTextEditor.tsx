"use client"

import { useState } from "react"
import { Settings, Eye, Type } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { sanitizeHTML } from "@/lib/html-sanitizer"

interface RichTextProps {
  content: string
  textAlign: 'left' | 'center' | 'right'
  backgroundColor: string
  padding: 'small' | 'medium' | 'large'
  maxWidth?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  textColor?: string
  fontSize?: 'sm' | 'base' | 'lg' | 'xl'
}

interface RichTextEditorProps {
  props: RichTextProps
  onUpdate: (newProps: Partial<RichTextProps>) => void
}

export default function RichTextEditor({ props, onUpdate }: RichTextEditorProps) {
  const [previewMode, setPreviewMode] = useState(false)

  const handleContentChange = (content: string) => {
    onUpdate({ content })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Configuración del Texto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Alineación */}
          <div>
            <Label>Alineación del Texto</Label>
            <div className="flex gap-2 mt-2">
              {[
                { value: 'left', label: 'Izquierda' },
                { value: 'center', label: 'Centro' },
                { value: 'right', label: 'Derecha' }
              ].map((align) => (
                <Button
                  key={align.value}
                  size="sm"
                  variant={props.textAlign === align.value ? 'default' : 'outline'}
                  onClick={() => onUpdate({ textAlign: align.value as any })}
                >
                  {align.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Tamaño de fuente */}
          <div>
            <Label>Tamaño de Fuente</Label>
            <div className="flex gap-2 mt-2">
              {[
                { value: 'sm', label: 'Pequeño' },
                { value: 'base', label: 'Normal' },
                { value: 'lg', label: 'Grande' },
                { value: 'xl', label: 'Extra Grande' }
              ].map((size) => (
                <Button
                  key={size.value}
                  size="sm"
                  variant={props.fontSize === size.value ? 'default' : 'outline'}
                  onClick={() => onUpdate({ fontSize: size.value as any })}
                >
                  {size.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Ancho máximo */}
          <div>
            <Label>Ancho Máximo</Label>
            <select
              value={props.maxWidth || 'none'}
              onChange={(e) => onUpdate({ maxWidth: e.target.value as any })}
              className="w-full mt-1 p-2 border border-gray-300 rounded-lg"
            >
              <option value="none">Sin límite</option>
              <option value="sm">Pequeño (640px)</option>
              <option value="md">Mediano (768px)</option>
              <option value="lg">Grande (1024px)</option>
              <option value="xl">Extra Grande (1280px)</option>
            </select>
          </div>

          {/* Padding */}
          <div>
            <Label>Espaciado Interno</Label>
            <div className="flex gap-2 mt-2">
              {[
                { value: 'small', label: 'Pequeño' },
                { value: 'medium', label: 'Mediano' },
                { value: 'large', label: 'Grande' }
              ].map((padding) => (
                <Button
                  key={padding.value}
                  size="sm"
                  variant={props.padding === padding.value ? 'default' : 'outline'}
                  onClick={() => onUpdate({ padding: padding.value as any })}
                >
                  {padding.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Color de fondo */}
          <div>
            <Label>Color de Fondo</Label>
            <div className="flex gap-2 mt-2">
              <input
                type="color"
                value={props.backgroundColor === 'transparent' ? '#ffffff' : props.backgroundColor}
                onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
                className="w-12 h-8 rounded border"
              />
              <Input
                value={props.backgroundColor}
                onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
                placeholder="transparent o #ffffff"
                className="flex-1"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => onUpdate({ backgroundColor: 'transparent' })}
              >
                Transparente
              </Button>
            </div>
          </div>

          {/* Color del texto */}
          <div>
            <Label>Color del Texto</Label>
            <div className="flex gap-2 mt-2">
              <input
                type="color"
                value={props.textColor || '#000000'}
                onChange={(e) => onUpdate({ textColor: e.target.value })}
                className="w-12 h-8 rounded border"
              />
              <Input
                value={props.textColor || '#000000'}
                onChange={(e) => onUpdate({ textColor: e.target.value })}
                placeholder="#000000"
                className="flex-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Type className="w-4 h-4" />
              Editor de Contenido
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPreviewMode(!previewMode)}
            >
              <Eye className="w-4 h-4 mr-1" />
              {previewMode ? 'Editar' : 'Vista Previa'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {previewMode ? (
            <div
              className={`p-4 border rounded-lg ${
                props.padding === 'small' ? 'p-4' :
                props.padding === 'medium' ? 'p-8' :
                'p-12'
              } text-${props.textAlign} ${
                props.fontSize === 'sm' ? 'text-sm' :
                props.fontSize === 'base' ? 'text-base' :
                props.fontSize === 'lg' ? 'text-lg' :
                'text-xl'
              }`}
              style={{
                backgroundColor: props.backgroundColor === 'transparent' ? 'transparent' : props.backgroundColor,
                color: props.textColor || '#000000'
              }}
              dangerouslySetInnerHTML={{ __html: sanitizeHTML(props.content) }}
            />
          ) : (
            <div className="space-y-4">
              <div>
                <Label>Contenido HTML</Label>
                <textarea
                  value={props.content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder="<h2>Título de ejemplo</h2><p>Escribe tu contenido aquí. Puedes usar HTML básico como <strong>negrita</strong>, <em>cursiva</em>, <a href='#'>enlaces</a>, etc.</p>"
                  rows={12}
                  className="w-full mt-1 p-3 border border-gray-300 rounded-lg font-mono text-sm resize-y"
                />
              </div>
              
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-2">Etiquetas HTML disponibles:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><code>&lt;h1&gt;</code> - <code>&lt;h6&gt;</code> Títulos</div>
                  <div><code>&lt;p&gt;</code> Párrafos</div>
                  <div><code>&lt;strong&gt;</code> Texto en negrita</div>
                  <div><code>&lt;em&gt;</code> Texto en cursiva</div>
                  <div><code>&lt;a href=""&gt;</code> Enlaces</div>
                  <div><code>&lt;ul&gt;&lt;li&gt;</code> Listas</div>
                  <div><code>&lt;br&gt;</code> Salto de línea</div>
                  <div><code>&lt;img src=""&gt;</code> Imágenes</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vista previa final */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Vista Previa Final
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-6 rounded-lg">
            <div
              className={`${
                props.maxWidth === 'sm' ? 'max-w-sm' :
                props.maxWidth === 'md' ? 'max-w-md' :
                props.maxWidth === 'lg' ? 'max-w-lg' :
                props.maxWidth === 'xl' ? 'max-w-xl' :
                'max-w-none'
              } mx-auto ${
                props.padding === 'small' ? 'p-4' :
                props.padding === 'medium' ? 'p-8' :
                'p-12'
              } text-${props.textAlign} ${
                props.fontSize === 'sm' ? 'text-sm' :
                props.fontSize === 'base' ? 'text-base' :
                props.fontSize === 'lg' ? 'text-lg' :
                'text-xl'
              } rounded-lg`}
              style={{
                backgroundColor: props.backgroundColor === 'transparent' ? 'transparent' : props.backgroundColor,
                color: props.textColor || '#000000'
              }}
              dangerouslySetInnerHTML={{ 
                __html: sanitizeHTML(props.content || '<p>Contenido de ejemplo</p>') 
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}