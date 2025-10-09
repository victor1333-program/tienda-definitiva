"use client"

import { useState, useRef } from "react"
import { Plus, Trash2, Edit2, Star, Upload, Settings, Eye, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ColoredSwitch } from "@/components/ui/ColoredSwitch"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-hot-toast"

interface Testimonial {
  id: string
  name: string
  role?: string
  company?: string
  content: string
  rating: number
  avatar?: string
  order: number
}

interface TestimonialsProps {
  title: string
  subtitle: string
  testimonials: Testimonial[]
  layout: 'carousel' | 'grid' | 'list'
  columns?: 2 | 3 | 4
  showStars: boolean
  autoplay: boolean
  autoplaySpeed?: number
  showAvatars?: boolean
  maxTestimonials?: number
}

interface TestimonialsEditorProps {
  props: TestimonialsProps
  onUpdate: (newProps: Partial<TestimonialsProps>) => void
}

export default function TestimonialsEditor({ props, onUpdate }: TestimonialsEditorProps) {
  const [isAddingTestimonial, setIsAddingTestimonial] = useState(false)
  const [editingTestimonial, setEditingTestimonial] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [newTestimonial, setNewTestimonial] = useState<Omit<Testimonial, 'id' | 'order'>>({
    name: '',
    role: '',
    company: '',
    content: '',
    rating: 5,
    avatar: ''
  })

  const handleAddTestimonial = () => {
    if (!newTestimonial.name.trim() || !newTestimonial.content.trim()) {
      toast.error('Nombre y contenido son obligatorios')
      return
    }

    const testimonial: Testimonial = {
      ...newTestimonial,
      id: `testimonial_${Date.now()}`,
      order: props.testimonials.length + 1
    }

    const updatedTestimonials = [...props.testimonials, testimonial]
    onUpdate({ testimonials: updatedTestimonials })
    
    setNewTestimonial({
      name: '',
      role: '',
      company: '',
      content: '',
      rating: 5,
      avatar: ''
    })
    setIsAddingTestimonial(false)
    toast.success('Testimonio agregado')
  }

  const handleUpdateTestimonial = (id: string, updates: Partial<Testimonial>) => {
    const updatedTestimonials = props.testimonials.map(testimonial =>
      testimonial.id === id ? { ...testimonial, ...updates } : testimonial
    )
    onUpdate({ testimonials: updatedTestimonials })
  }

  const handleRemoveTestimonial = (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este testimonio?')) return

    const updatedTestimonials = props.testimonials.filter(t => t.id !== id)
    onUpdate({ testimonials: updatedTestimonials })
    toast.success('Testimonio eliminado')
  }

  const handleReorder = (fromIndex: number, toIndex: number) => {
    const newTestimonials = [...props.testimonials]
    const [moved] = newTestimonials.splice(fromIndex, 1)
    newTestimonials.splice(toIndex, 0, moved)

    // Actualizar orden
    const reordered = newTestimonials.map((testimonial, index) => ({
      ...testimonial,
      order: index + 1
    }))

    onUpdate({ testimonials: reordered })
  }

  const handleAvatarUpload = async (file: File, testimonialId?: string) => {
    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'testimonials')

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        
        if (testimonialId) {
          handleUpdateTestimonial(testimonialId, { avatar: data.url })
        } else {
          setNewTestimonial({ ...newTestimonial, avatar: data.url })
        }
        
        toast.success('Avatar subido correctamente')
      } else {
        toast.error('Error al subir el avatar')
      }
    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast.error('Error al subir el avatar')
    } finally {
      setIsUploading(false)
    }
  }

  const renderStarRating = (rating: number, onChange?: (rating: number) => void, readonly = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => onChange && onChange(star)}
            className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
          >
            <Star
              className={`w-4 h-4 ${
                star <= rating 
                  ? 'fill-yellow-400 text-yellow-400' 
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Configuración General
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Título y subtítulo */}
          <div>
            <Label>Título de la Sección</Label>
            <Input
              value={props.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="Lo que dicen nuestros clientes"
              className="mt-1"
            />
          </div>

          <div>
            <Label>Subtítulo</Label>
            <Input
              value={props.subtitle}
              onChange={(e) => onUpdate({ subtitle: e.target.value })}
              placeholder="Testimonios reales de clientes satisfechos"
              className="mt-1"
            />
          </div>

          {/* Layout */}
          <div>
            <Label>Tipo de Layout</Label>
            <div className="flex gap-2 mt-2">
              {[
                { value: 'carousel', label: 'Carrusel' },
                { value: 'grid', label: 'Grid' },
                { value: 'list', label: 'Lista' }
              ].map((layout) => (
                <Button
                  key={layout.value}
                  size="sm"
                  variant={props.layout === layout.value ? 'default' : 'outline'}
                  onClick={() => onUpdate({ layout: layout.value as any })}
                >
                  {layout.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Columnas (solo para grid) */}
          {props.layout === 'grid' && (
            <div>
              <Label>Columnas</Label>
              <div className="flex gap-2 mt-2">
                {[2, 3, 4].map((cols) => (
                  <Button
                    key={cols}
                    size="sm"
                    variant={props.columns === cols ? 'default' : 'outline'}
                    onClick={() => onUpdate({ columns: cols as any })}
                  >
                    {cols} columnas
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Opciones */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label>Mostrar Estrellas</Label>
              <ColoredSwitch
                checked={props.showStars}
                onCheckedChange={(checked) => onUpdate({ showStars: checked })}
                activeColor="green"
                inactiveColor="gray"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Mostrar Avatares</Label>
              <ColoredSwitch
                checked={props.showAvatars ?? true}
                onCheckedChange={(checked) => onUpdate({ showAvatars: checked })}
                activeColor="green"
                inactiveColor="gray"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Autoplay</Label>
              <ColoredSwitch
                checked={props.autoplay}
                onCheckedChange={(checked) => onUpdate({ autoplay: checked })}
                activeColor="green"
                inactiveColor="gray"
              />
            </div>
          </div>

          {/* Velocidad de autoplay */}
          {props.autoplay && (
            <div>
              <Label>Velocidad de Autoplay (segundos)</Label>
              <div className="flex items-center gap-4 mt-2">
                <input
                  type="range"
                  min="2"
                  max="10"
                  step="1"
                  value={props.autoplaySpeed || 5}
                  onChange={(e) => onUpdate({ autoplaySpeed: parseInt(e.target.value) })}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600 w-8">
                  {props.autoplaySpeed || 5}s
                </span>
              </div>
            </div>
          )}

          {/* Máximo de testimonios */}
          <div>
            <Label>Máximo de Testimonios</Label>
            <select
              value={props.maxTestimonials || 10}
              onChange={(e) => onUpdate({ maxTestimonials: parseInt(e.target.value) })}
              className="w-full mt-1 p-2 border border-gray-300 rounded-lg"
            >
              <option value={5}>5 testimonios</option>
              <option value={10}>10 testimonios</option>
              <option value={15}>15 testimonios</option>
              <option value={20}>20 testimonios</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Formulario para agregar testimonio */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Testimonios ({props.testimonials.length})</CardTitle>
            <Button onClick={() => setIsAddingTestimonial(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Agregar Testimonio
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isAddingTestimonial && (
            <div className="border-2 border-dashed border-green-300 rounded-lg p-4 space-y-4 mb-6">
              <h4 className="font-medium">➕ Nuevo Testimonio</h4>
              
              {/* Avatar */}
              <div>
                <Label>Avatar del Cliente</Label>
                <div className="mt-2 flex items-center gap-4">
                  {newTestimonial.avatar ? (
                    <div className="relative">
                      <img
                        src={newTestimonial.avatar}
                        alt="Avatar"
                        className="w-16 h-16 rounded-full object-cover border"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
                    >
                      <User className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleAvatarUpload(file)
                    }}
                    className="hidden"
                  />
                  {isUploading && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                      Subiendo...
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nombre del Cliente *</Label>
                  <Input
                    value={newTestimonial.name}
                    onChange={(e) => setNewTestimonial({ ...newTestimonial, name: e.target.value })}
                    placeholder="María García"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Cargo/Puesto</Label>
                  <Input
                    value={newTestimonial.role}
                    onChange={(e) => setNewTestimonial({ ...newTestimonial, role: e.target.value })}
                    placeholder="Directora de Marketing"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label>Empresa/Organización</Label>
                <Input
                  value={newTestimonial.company}
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, company: e.target.value })}
                  placeholder="Tech Solutions S.L."
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Contenido del Testimonio *</Label>
                <textarea
                  value={newTestimonial.content}
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, content: e.target.value })}
                  placeholder="Excelente servicio, productos de alta calidad y entrega rápida. Definitivamente lo recomendaría a otros..."
                  rows={4}
                  className="w-full mt-1 p-3 border border-gray-300 rounded-lg resize-none"
                />
              </div>

              <div>
                <Label>Valoración</Label>
                <div className="mt-2">
                  {renderStarRating(newTestimonial.rating, (rating) => 
                    setNewTestimonial({ ...newTestimonial, rating })
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAddTestimonial}>
                  Agregar Testimonio
                </Button>
                <Button variant="outline" onClick={() => setIsAddingTestimonial(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {/* Lista de testimonios */}
          {props.testimonials.length > 0 ? (
            <div className="space-y-4">
              {props.testimonials
                .sort((a, b) => a.order - b.order)
                .map((testimonial, index) => (
                  <div
                    key={testimonial.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4 flex-1">
                        {/* Avatar */}
                        {testimonial.avatar ? (
                          <img
                            src={testimonial.avatar}
                            alt={testimonial.name}
                            className="w-12 h-12 rounded-full object-cover border"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                            <User className="w-6 h-6 text-gray-400" />
                          </div>
                        )}

                        {/* Contenido */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium">{testimonial.name}</span>
                            {testimonial.role && (
                              <Badge variant="outline" className="text-xs">
                                {testimonial.role}
                              </Badge>
                            )}
                            {testimonial.company && (
                              <span className="text-sm text-gray-500">
                                @ {testimonial.company}
                              </span>
                            )}
                          </div>
                          
                          <p className="text-gray-700 mb-2 line-clamp-3">
                            "{testimonial.content}"
                          </p>
                          
                          <div className="flex items-center gap-2">
                            {renderStarRating(testimonial.rating, undefined, true)}
                            <span className="text-sm text-gray-500">
                              ({testimonial.rating}/5)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Controles */}
                      <div className="flex items-center gap-1 ml-4">
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded mr-2">
                          #{testimonial.order}
                        </span>
                        
                        {index > 0 && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 w-6 p-0"
                            onClick={() => handleReorder(index, index - 1)}
                          >
                            ↑
                          </Button>
                        )}
                        {index < props.testimonials.length - 1 && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 w-6 p-0"
                            onClick={() => handleReorder(index, index + 1)}
                          >
                            ↓
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 w-6 p-0"
                          onClick={() => setEditingTestimonial(testimonial.id)}
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 w-6 p-0 text-red-600"
                          onClick={() => handleRemoveTestimonial(testimonial.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <User className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No hay testimonios agregados</p>
              <p className="text-xs">Agrega testimonios de tus clientes satisfechos</p>
            </div>
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
          <div className="bg-gray-50 p-6 rounded-lg">
            {/* Títulos */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {props.title || 'Lo que dicen nuestros clientes'}
              </h2>
              {props.subtitle && (
                <p className="text-gray-600">
                  {props.subtitle}
                </p>
              )}
            </div>

            {/* Testimonios */}
            {props.testimonials.length > 0 ? (
              <div className={`${
                props.layout === 'grid' 
                  ? `grid gap-6 ${
                      props.columns === 2 ? 'grid-cols-2' :
                      props.columns === 3 ? 'grid-cols-3' :
                      'grid-cols-4'
                    }`
                  : props.layout === 'carousel'
                  ? 'flex gap-6 overflow-x-auto pb-4'
                  : 'space-y-6'
              }`}>
                {props.testimonials
                  .slice(0, props.maxTestimonials || 10)
                  .map((testimonial) => (
                    <div
                      key={testimonial.id}
                      className={`bg-white rounded-lg shadow-sm p-6 ${
                        props.layout === 'carousel' ? 'flex-shrink-0 w-80' : ''
                      }`}
                    >
                      {/* Contenido del testimonio */}
                      <p className="text-gray-700 mb-4 italic">
                        "{testimonial.content}"
                      </p>

                      {/* Rating */}
                      {props.showStars && (
                        <div className="mb-4">
                          {renderStarRating(testimonial.rating, undefined, true)}
                        </div>
                      )}

                      {/* Info del cliente */}
                      <div className="flex items-center gap-3">
                        {props.showAvatars && testimonial.avatar ? (
                          <img
                            src={testimonial.avatar}
                            alt={testimonial.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : props.showAvatars && (
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-900">
                            {testimonial.name}
                          </div>
                          {(testimonial.role || testimonial.company) && (
                            <div className="text-sm text-gray-600">
                              {testimonial.role}
                              {testimonial.role && testimonial.company && ' • '}
                              {testimonial.company}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <User className="w-12 h-12 mx-auto mb-2" />
                <p>No hay testimonios para mostrar</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}