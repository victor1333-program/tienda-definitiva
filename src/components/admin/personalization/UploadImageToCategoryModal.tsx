"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Upload } from "lucide-react"
import toast from "react-hot-toast"

interface Category {
  id: string
  name: string
  macroCategoryId?: string
  macroCategory?: {
    id: string
    name: string
  }
}

interface UploadImageToCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  category: Category | null
  onSuccess?: () => void
}

export default function UploadImageToCategoryModal({
  isOpen,
  onClose,
  category,
  onSuccess
}: UploadImageToCategoryModalProps) {
  const [name, setName] = useState("")
  const [tags, setTags] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [isPublic, setIsPublic] = useState(true)
  const [files, setFiles] = useState<FileList | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleSubmit = async () => {
    if (!files || files.length === 0) {
      toast.error('Por favor selecciona al menos una imagen')
      return
    }

    if (!category) {
      toast.error('No se ha seleccionado categoría')
      return
    }

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp']
    const invalidFiles = Array.from(files).filter(file => !validTypes.includes(file.type))
    
    if (invalidFiles.length > 0) {
      toast.error('Solo se permiten archivos de imagen (PNG, JPG, GIF, WEBP, SVG, BMP)')
      return
    }

    setUploading(true)
    try {
      const form = new FormData()
      
      Array.from(files).forEach((file) => {
        form.append(`files`, file)
      })
      
      form.append('categoryId', category.id)
      // Only add macro category if it exists and we have the ID
      if (category.macroCategory?.id) {
        form.append('macroCategoryId', category.macroCategory.id)
      } else if (category.macroCategoryId) {
        form.append('macroCategoryId', category.macroCategoryId)
      }
      // If no macro category is available, that's fine - the image will just be assigned to the category
      form.append('isActive', isActive.toString())
      form.append('isPublic', isPublic.toString())
      form.append('tags', tags)
      form.append('baseName', name)

      const response = await fetch('/api/personalization/images', {
        method: 'POST',
        body: form
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(`${result.uploaded} imagen(es) subida(s) exitosamente`)
        handleClose()
        onSuccess?.()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al subir imágenes')
      }
    } catch (error) {
      console.error('Error uploading images:', error)
      toast.error('Error al subir imágenes')
    } finally {
      setUploading(false)
    }
  }

  const handleClose = () => {
    setName("")
    setTags("")
    setFiles(null)
    setIsActive(true)
    setIsPublic(true)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Subir imágenes a {category?.name}
          </DialogTitle>
          <DialogDescription>
            Sube imágenes directamente a la categoría "{category?.name}"
            {category?.macroCategory && ` en ${category.macroCategory.name}`}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="files">Archivos de Imagen</Label>
            <Input
              id="files"
              type="file"
              multiple
              accept=".png,.jpg,.jpeg,.gif,.webp,.svg,.bmp"
              onChange={(e) => setFiles(e.target.files)}
            />
            {files && files.length > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                {files.length} archivo(s) seleccionado(s)
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="baseName">Nombre Base (opcional)</Label>
            <Input
              id="baseName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Si se deja vacío, se usará el nombre del archivo"
            />
          </div>

          <div>
            <Label htmlFor="tags">Etiquetas (separadas por comas)</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="animales, perros, mascotas"
            />
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={isActive}
                onCheckedChange={(checked) => setIsActive(!!checked)}
              />
              <Label htmlFor="isActive">Activar imágenes</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPublic"
                checked={isPublic}
                onCheckedChange={(checked) => setIsPublic(!!checked)}
              />
              <Label htmlFor="isPublic">Públicas</Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={uploading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={uploading || !files || files.length === 0}>
            {uploading ? 'Subiendo...' : 'Subir Imágenes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}