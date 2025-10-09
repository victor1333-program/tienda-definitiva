"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Menu as MenuIcon, Plus, Trash2, Edit3, ArrowUp, ArrowDown,
  ExternalLink, Home, Package, Phone, Mail, User,
  ChevronDown, ChevronRight, Save, Eye, Undo2
} from "lucide-react"
import { toast } from "react-hot-toast"

// Simplified menu editor without drag-drop
import DragDropMenuEditor from './DragDropMenuEditor'

interface MenuItem {
  id: string
  label: string
  url: string
  icon?: string
  isActive: boolean
  target?: '_blank' | '_self'
  description?: string
  order: number
  children?: MenuItem[]
}

interface MenuEditorProps {
  menuItems?: MenuItem[]
  onSave?: (items: MenuItem[]) => void
  isLoading?: boolean
}

export default function MenuEditor({ 
  menuItems = [], 
  onSave,
  isLoading = false 
}: MenuEditorProps) {
  const [items, setItems] = useState<MenuItem[]>(menuItems)
  const [previewMode, setPreviewMode] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    setItems(menuItems)
  }, [menuItems])

  const handleSave = async () => {
    try {
      if (onSave) {
        await onSave(items)
        setHasChanges(false)
        toast.success('Menú guardado exitosamente')
      }
    } catch (error) {
      toast.error('Error al guardar el menú')
    }
  }

  const handleItemsUpdate = (newItems: MenuItem[]) => {
    setItems(newItems)
    setHasChanges(true)
  }

  const resetChanges = () => {
    setItems(menuItems)
    setHasChanges(false)
    toast.success('Cambios revertidos')
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MenuIcon className="h-5 w-5 text-blue-600" />
              <CardTitle>Editor de Menú de Navegación</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
              >
                {previewMode ? (
                  <>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Editar
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Vista Previa
                  </>
                )}
              </Button>
              
              {hasChanges && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetChanges}
                  >
                    <Undo2 className="h-4 w-4 mr-2" />
                    Revertir
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={isLoading}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {previewMode ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <h3 className="font-medium mb-4">Vista Previa del Menú</h3>
              {items.length > 0 ? (
                <nav className="space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center space-x-2 p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                    >
                      {item.icon && <span className="text-lg">{item.icon}</span>}
                      <span className="font-medium">{item.label}</span>
                      {item.target === '_blank' && (
                        <ExternalLink className="h-3 w-3 text-gray-400" />
                      )}
                      <span className="text-sm text-gray-500 ml-auto">{item.url}</span>
                    </div>
                  ))}
                </nav>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No hay elementos en el menú
                </p>
              )}
            </div>
          ) : (
            <DragDropMenuEditor 
              items={items} 
              onUpdate={handleItemsUpdate}
            />
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const homeItem: MenuItem = {
                  id: Date.now().toString(),
                  label: 'Inicio',
                  url: '/',
                  icon: '🏠',
                  isActive: true,
                  order: items.length
                }
                handleItemsUpdate([...items, homeItem])
              }}
            >
              <Home className="h-4 w-4 mr-2" />
              + Inicio
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const productsItem: MenuItem = {
                  id: Date.now().toString(),
                  label: 'Productos',
                  url: '/productos',
                  icon: '📦',
                  isActive: true,
                  order: items.length
                }
                handleItemsUpdate([...items, productsItem])
              }}
            >
              <Package className="h-4 w-4 mr-2" />
              + Productos
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const contactItem: MenuItem = {
                  id: Date.now().toString(),
                  label: 'Contacto',
                  url: '/contacto',
                  icon: '📞',
                  isActive: true,
                  order: items.length
                }
                handleItemsUpdate([...items, contactItem])
              }}
            >
              <Phone className="h-4 w-4 mr-2" />
              + Contacto
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const customItem: MenuItem = {
                  id: Date.now().toString(),
                  label: 'Personalizar',
                  url: '/personalizador',
                  icon: '🎨',
                  isActive: true,
                  order: items.length
                }
                handleItemsUpdate([...items, customItem])
              }}
            >
              <Edit3 className="h-4 w-4 mr-2" />
              + Personalizar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}