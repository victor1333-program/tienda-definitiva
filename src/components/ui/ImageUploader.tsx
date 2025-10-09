"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X, ImageIcon, Loader2 } from "lucide-react"
import Image from "next/image"
import { toast } from "react-hot-toast"

interface ImageUploaderProps {
  onImageUpload: (imageUrl: string) => void
  currentImage?: string
  maxSize?: number // en MB
  acceptedTypes?: string[]
  disabled?: boolean
}

export default function ImageUploader({
  onImageUpload,
  currentImage,
  maxSize = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  disabled = false
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (!acceptedTypes.includes(file.type)) {
      toast.error(`Tipo de archivo no permitido. Use: ${acceptedTypes.join(', ')}`)
      return
    }

    // Validar tamaño
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`El archivo es muy grande. Máximo: ${maxSize}MB`)
      return
    }

    uploadFile(file)
  }

  const uploadFile = async (file: File) => {
    setUploading(true)
    try {
      // Crear preview local
      const previewUrl = URL.createObjectURL(file)
      setPreview(previewUrl)

      // Preparar FormData para subida
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'personalization/sides')

      // Subir archivo
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Error al subir la imagen')
      }

      const data = await response.json()
      
      if (data.success && data.url) {
        // Limpiar preview local y usar URL del servidor
        URL.revokeObjectURL(previewUrl)
        setPreview(data.url)
        onImageUpload(data.url)
        toast.success('Imagen subida exitosamente')
      } else {
        throw new Error(data.error || 'Error al subir la imagen')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      toast.error('Error al subir la imagen')
      setPreview(currentImage || null)
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setPreview(null)
    onImageUpload('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (disabled || uploading) return

    const files = Array.from(e.dataTransfer.files)
    const imageFile = files.find(file => acceptedTypes.includes(file.type))
    
    if (imageFile) {
      uploadFile(imageFile)
    } else {
      toast.error('Por favor, arrastra un archivo de imagen válido')
    }
  }

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />

      {preview ? (
        <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
          <div className="p-0">
            <div className="relative">
              <div className="aspect-square bg-gray-100">
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              </div>
              {!disabled && (
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2"
                  onClick={handleRemoveImage}
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg transition-colors ${
            disabled ? 'border-gray-200 bg-gray-50' : 'border-gray-300 hover:border-gray-400 cursor-pointer'
          }`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
        >
          <div className="p-8">
            <div className="text-center space-y-4">
              {uploading ? (
                <Loader2 className="h-12 w-12 text-gray-400 mx-auto animate-spin" />
              ) : (
                <ImageIcon className="h-12 w-12 text-gray-400 mx-auto" />
              )}
              
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {uploading ? 'Subiendo imagen...' : 'Sube una imagen'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {uploading 
                    ? 'Por favor espera...'
                    : 'Arrastra y suelta o haz clic para seleccionar'
                  }
                </p>
              </div>

              {!disabled && !uploading && (
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Seleccionar Archivo
                </Button>
              )}

              <div className="text-xs text-gray-400">
                <p>Formatos permitidos: {acceptedTypes.map(type => type.split('/')[1]).join(', ').toUpperCase()}</p>
                <p>Tamaño máximo: {maxSize}MB</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}