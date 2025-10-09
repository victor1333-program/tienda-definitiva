// Simplified menu editor without drag-drop functionality
// Original react-beautiful-dnd dependency removed for optimization

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Trash2, Plus, Edit, ArrowUp, ArrowDown } from 'lucide-react'

interface MenuItem {
  id: string
  label: string
  url: string
  isActive: boolean
  order: number
}

interface DragDropMenuEditorProps {
  items: MenuItem[]
  onUpdate: (items: MenuItem[]) => void
}

export default function DragDropMenuEditor({ items, onUpdate }: DragDropMenuEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newItem, setNewItem] = useState({ label: '', url: '' })

  const handleUpdate = (id: string, updates: Partial<MenuItem>) => {
    const updatedItems = items.map(item => 
      item.id === id ? { ...item, ...updates } : item
    )
    onUpdate(updatedItems)
    setEditingId(null)
  }

  const handleAdd = () => {
    if (newItem.label && newItem.url) {
      const item: MenuItem = {
        id: Date.now().toString(),
        label: newItem.label,
        url: newItem.url,
        isActive: true,
        order: items.length
      }
      onUpdate([...items, item])
      setNewItem({ label: '', url: '' })
    }
  }

  const handleDelete = (id: string) => {
    onUpdate(items.filter(item => item.id !== id))
  }

  const moveItem = (id: string, direction: 'up' | 'down') => {
    const currentIndex = items.findIndex(item => item.id === id)
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    
    if (newIndex >= 0 && newIndex < items.length) {
      const newItems = [...items]
      const [removed] = newItems.splice(currentIndex, 1)
      newItems.splice(newIndex, 0, removed)
      
      // Update order values
      const updatedItems = newItems.map((item, index) => ({ ...item, order: index }))
      onUpdate(updatedItems)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Editor de Menú (Simplificado)</h3>
      <p className="text-sm text-gray-600">
        Usa los botones de flecha para reordenar elementos
      </p>

      {/* Add new item */}
      <Card className="p-4">
        <h4 className="font-medium mb-3">Agregar elemento</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input
            placeholder="Etiqueta"
            value={newItem.label}
            onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
          />
          <Input
            placeholder="URL"
            value={newItem.url}
            onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
          />
          <Button onClick={handleAdd} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Agregar
          </Button>
        </div>
      </Card>

      {/* Items list */}
      <div className="space-y-2">
        {items.map((item, index) => (
          <Card key={item.id} className="p-4">
            {editingId === item.id ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input
                  value={item.label}
                  onChange={(e) => handleUpdate(item.id, { label: e.target.value })}
                />
                <Input
                  value={item.url}
                  onChange={(e) => handleUpdate(item.id, { url: e.target.value })}
                />
                <Button
                  onClick={() => setEditingId(null)}
                  variant="outline"
                  className="w-full"
                >
                  Guardar
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-sm text-gray-500">{item.url}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => moveItem(item.id, 'up')}
                    disabled={index === 0}
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => moveItem(item.id, 'down')}
                    disabled={index === items.length - 1}
                  >
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingId(item.id)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No hay elementos en el menú. Agrega el primero arriba.
        </div>
      )}
    </div>
  )
}