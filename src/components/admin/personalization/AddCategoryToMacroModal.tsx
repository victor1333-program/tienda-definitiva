"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Folder, Plus } from "lucide-react"
import toast from "react-hot-toast"

interface MacroCategory {
  id: string
  name: string
}

interface AddCategoryToMacroModalProps {
  isOpen: boolean
  onClose: () => void
  macroCategory: MacroCategory | null
  onSuccess?: () => void
}

export default function AddCategoryToMacroModal({
  isOpen,
  onClose,
  macroCategory,
  onSuccess
}: AddCategoryToMacroModalProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [sortOrder, setSortOrder] = useState(0)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Por favor ingresa un nombre para la categoría')
      return
    }

    if (!macroCategory) {
      toast.error('No se ha seleccionado macrocategoría')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/personalization/images/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          macroCategoryId: macroCategory.id,
          sortOrder
        })
      })

      if (response.ok) {
        toast.success('Categoría creada exitosamente')
        handleClose()
        onSuccess?.()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al crear categoría')
      }
    } catch (error) {
      console.error('Error creating category:', error)
      toast.error('Error al crear categoría')
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    setName("")
    setDescription("")
    setSortOrder(0)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Agregar categoría a {macroCategory?.name}
          </DialogTitle>
          <DialogDescription>
            Crea una nueva categoría dentro de la macrocategoría "{macroCategory?.name}"
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre de la categoría</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ej: Fútbol, Tenis, etc."
            />
          </div>

          <div>
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción de la categoría"
            />
          </div>

          <div>
            <Label htmlFor="sortOrder">Orden de visualización</Label>
            <Input
              id="sortOrder"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
              placeholder="0"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={saving || !name.trim()}>
            {saving ? 'Creando...' : 'Crear Categoría'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}