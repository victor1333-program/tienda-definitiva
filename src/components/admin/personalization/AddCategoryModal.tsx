"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TreeDeciduous, Folder, Plus } from "lucide-react"
import toast from "react-hot-toast"

interface MacroCategory {
  id: string
  slug: string
  name: string
  description?: string
  sortOrder: number
  isActive: boolean
  totalImages: number
  totalCategories: number
}

interface AddCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  macroCategories: MacroCategory[]
  onSuccess?: () => void
}

export default function AddCategoryModal({
  isOpen,
  onClose,
  macroCategories,
  onSuccess
}: AddCategoryModalProps) {
  const [type, setType] = useState<"macrocategory" | "category">("macrocategory")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [macroCategoryId, setMacroCategoryId] = useState("")
  const [sortOrder, setSortOrder] = useState(0)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Por favor ingresa un nombre')
      return
    }

    if (type === "category" && !macroCategoryId) {
      toast.error('Por favor selecciona una macrocategoría')
      return
    }

    setSaving(true)
    try {
      let response
      
      if (type === "macrocategory") {
        response = await fetch('/api/personalization/images/macro-categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: name.trim(),
            description: description.trim() || undefined,
            sortOrder
          })
        })
      } else {
        response = await fetch('/api/personalization/images/categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: name.trim(),
            description: description.trim() || undefined,
            macroCategoryId,
            sortOrder
          })
        })
      }

      if (response.ok) {
        toast.success(`${type === "macrocategory" ? "Macrocategoría" : "Categoría"} creada exitosamente`)
        handleClose()
        onSuccess?.()
      } else {
        const error = await response.json()
        toast.error(error.error || `Error al crear ${type === "macrocategory" ? "macrocategoría" : "categoría"}`)
      }
    } catch (error) {
      console.error('Error creating:', error)
      toast.error(`Error al crear ${type === "macrocategory" ? "macrocategoría" : "categoría"}`)
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    setType("macrocategory")
    setName("")
    setDescription("")
    setMacroCategoryId("")
    setSortOrder(0)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Agregar nueva macrocategoría o categoría
          </DialogTitle>
          <DialogDescription>
            Selecciona el tipo y completa la información requerida
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="type">Tipo</Label>
            <Select value={type} onValueChange={(value: "macrocategory" | "category") => setType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="macrocategory">
                  <div className="flex items-center gap-2">
                    <TreeDeciduous className="h-4 w-4" />
                    Macrocategoría
                  </div>
                </SelectItem>
                <SelectItem value="category">
                  <div className="flex items-center gap-2">
                    <Folder className="h-4 w-4" />
                    Categoría
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="name">
              Nombre {type === "macrocategory" ? "de la macrocategoría" : "de la categoría"}
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={
                type === "macrocategory" 
                  ? "ej: Deportes, Animales, etc."
                  : "ej: Fútbol, Tenis, etc."
              }
            />
          </div>

          {type === "category" && (
            <div>
              <Label htmlFor="macroCategory">Dentro de macrocategoría</Label>
              <Select value={macroCategoryId} onValueChange={setMacroCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar macrocategoría" />
                </SelectTrigger>
                <SelectContent>
                  {macroCategories.map((macro) => (
                    <SelectItem key={macro.id} value={macro.id}>
                      <div className="flex items-center gap-2">
                        <TreeDeciduous className="h-4 w-4" />
                        {macro.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción opcional"
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
          <Button 
            onClick={handleSubmit} 
            disabled={saving || !name.trim() || (type === "category" && !macroCategoryId)}
          >
            {saving ? 'Creando...' : `Crear ${type === "macrocategory" ? "Macrocategoría" : "Categoría"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}