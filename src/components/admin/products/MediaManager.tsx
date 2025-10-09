"use client"

import { useState, useRef, useCallback } from "react"
import { Upload, X, Image as ImageIcon, Video, FileText, Move, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-hot-toast"

interface MediaFile {
  id?: string
  url: string
  type: 'image' | 'video' | 'document'
  name: string
  size?: number
  order: number
}

interface MediaManagerProps {
  productId: string
  media: MediaFile[]
  onMediaChange?: (media: MediaFile[]) => void
}

export default function MediaManager({ 
  productId, 
  media: initialMedia = [], 
  onMediaChange 
}: MediaManagerProps) {
  const [media, setMedia] = useState<MediaFile[]>(initialMedia)
  const [isUploading, setIsUploading] = useState(false)
  const [draggedItem, setDraggedItem] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const updateMedia = (newMedia: MediaFile[]) => {
    setMedia(newMedia)
    if (onMediaChange) {
      onMediaChange(newMedia)
    }
  }

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', `products/${productId}`)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error('Error uploading file')
    }

    const data = await response.json()
    // The API can return either data.url (direct) or data.data.secure_url (structured response)
    return data.url || data.data?.secure_url || data.secure_url || data.data
  }

  const handleFileUpload = async (files: FileList) => {
    if (!files.length) return

    setIsUploading(true)
    const newMediaFiles: MediaFile[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Validate file type
        const isImage = file.type.startsWith('image/')
        const isVideo = file.type.startsWith('video/')
        const isDocument = file.type.startsWith('application/') || file.type.startsWith('text/')

        if (!isImage && !isVideo && !isDocument) {
          toast.error(`Tipo de archivo no soportado: ${file.name}`)
          continue
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`Archivo muy grande: ${file.name} (máximo 10MB)`)
          continue
        }

        try {
          const url = await uploadFile(file)
          const type = isImage ? 'image' : isVideo ? 'video' : 'document'
          
          newMediaFiles.push({
            url,
            type,
            name: file.name,
            size: file.size,
            order: media.length + newMediaFiles.length
          })
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error)
          toast.error(`Error subiendo ${file.name}`)
        }
      }

      if (newMediaFiles.length > 0) {
        updateMedia([...media, ...newMediaFiles])
        toast.success(`${newMediaFiles.length} archivo(s) subido(s) correctamente`)
      }
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveMedia = (index: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este archivo?')) {
      const newMedia = media.filter((_, i) => i !== index)
      updateMedia(newMedia)
      toast.success('Archivo eliminado')
    }
  }

  const handleDragStart = (index: number) => {
    setDraggedItem(index)
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    
    if (draggedItem === null || draggedItem === targetIndex) {
      setDraggedItem(null)
      return
    }

    const newMedia = [...media]
    const [draggedMediaItem] = newMedia.splice(draggedItem, 1)
    newMedia.splice(targetIndex, 0, draggedMediaItem)
    
    // Update order
    const updatedMedia = newMedia.map((item, index) => ({
      ...item,
      order: index
    }))

    updateMedia(updatedMedia)
    setDraggedItem(null)
    toast.success('Orden actualizado')
  }, [draggedItem, media, updateMedia])

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="h-5 w-5" />
      case 'video':
        return <Video className="h-5 w-5" />
      case 'document':
        return <FileText className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card className="border-dashed border-2 border-gray-300 hover:border-gray-400 transition-colors">
        <CardContent className="p-6">
          <div 
            className="text-center cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            onDrop={(e) => {
              e.preventDefault()
              const files = e.dataTransfer.files
              if (files.length > 0) {
                handleFileUpload(files)
              }
            }}
            onDragOver={(e) => e.preventDefault()}
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Subir archivos multimedia
            </h3>
            <p className="text-gray-600 mb-4">
              Arrastra archivos aquí o haz clic para seleccionar
            </p>
            <div className="text-sm text-gray-500 space-y-1">
              <p>• Imágenes: JPG, PNG, GIF, WebP (máx. 10MB)</p>
              <p>• Videos: MP4, WebM, MOV (máx. 10MB)</p>
              <p>• Documentos: PDF, DOC, DOCX (máx. 10MB)</p>
            </div>
            {isUploading && (
              <div className="mt-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-blue-600 mt-2">Subiendo archivos...</p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx"
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Media Grid */}
      {media.length > 0 ? (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Archivos Multimedia ({media.length})</CardTitle>
              <Badge variant="outline" className="flex items-center gap-1">
                <Move className="h-3 w-3" />
                Arrastra para reordenar
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {media.map((item, index) => (
                <div
                  key={`${item.url}-${index}`}
                  className={`group relative border rounded-lg overflow-hidden cursor-move transition-all ${
                    draggedItem === index ? 'opacity-50 scale-95' : 'hover:shadow-md'
                  }`}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                >
                  {/* Preview */}
                  <div className="aspect-video bg-gray-100 flex items-center justify-center">
                    {item.type === 'image' ? (
                      <img
                        src={item.url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-gray-400">
                        {getFileIcon(item.type)}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      {getFileIcon(item.type)}
                      <span className="text-sm font-medium truncate">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>{item.type.toUpperCase()}</span>
                      {item.size && (
                        <span>{formatFileSize(item.size)}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0 bg-white/90"
                        onClick={() => window.open(item.url, '_blank')}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0 bg-white/90 text-red-600 hover:text-red-700"
                        onClick={() => handleRemoveMedia(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Order indicator */}
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className="text-xs">
                      {index + 1}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No hay archivos multimedia</p>
            <p className="text-sm text-gray-400">
              Sube imágenes, videos o documentos para tu producto
            </p>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      {media.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h4 className="font-medium text-blue-900 mb-2">📊 Resumen</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-blue-700">Imágenes: </span>
                <span className="font-medium">
                  {media.filter(m => m.type === 'image').length}
                </span>
              </div>
              <div>
                <span className="text-blue-700">Videos: </span>
                <span className="font-medium">
                  {media.filter(m => m.type === 'video').length}
                </span>
              </div>
              <div>
                <span className="text-blue-700">Documentos: </span>
                <span className="font-medium">
                  {media.filter(m => m.type === 'document').length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}