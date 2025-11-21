"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-hot-toast"
import { 
  Menu as MenuIcon, Plus, Trash2, Edit3, ArrowUp, ArrowDown,
  ExternalLink, Home, Package, Phone, Mail, User, Palette,
  ChevronDown, ChevronRight, Save, Eye, Undo2, GripVertical,
  Settings, Link as LinkIcon, Folder, Globe, ShoppingCart, X
} from "lucide-react"

interface MenuOption {
  categories: Array<{
    id: string
    name: string
    slug: string
    description?: string
    icon?: string
  }>
  featuredProducts: Array<{
    id: string
    name: string
    slug: string
    description?: string
  }>
  pageTypes: Array<{
    id: string
    label: string
    url: string
  }>
  linkTypes: Array<{
    id: string
    label: string
  }>
  targets: Array<{
    id: string
    label: string
  }>
  availableIcons: Array<{
    id: string
    label: string
  }>
}

interface MenuItem {
  id: string
  label: string
  url?: string
  linkType: string
  target: string
  categoryId?: string
  productId?: string
  pageType?: string
  parentId?: string
  sortOrder: number
  isActive: boolean
  icon?: string
  badge?: string
  children?: MenuItem[]
  category?: {
    id: string
    name: string
    slug: string
  }
  product?: {
    id: string
    name: string
    slug: string
  }
}

interface Menu {
  id: string
  name: string
  slug: string
  location: string
  isActive: boolean
  items: MenuItem[]
}

const iconMap: { [key: string]: any } = {
  Home, Package, Phone, Mail, User, Palette, ChevronDown, ChevronRight,
  ExternalLink, Settings, LinkIcon, Folder, Globe, ShoppingCart, Plus,
  Edit3, Eye, Save, Trash2
}

export default function DynamicMenuEditor() {
  const [menus, setMenus] = useState<Menu[]>([])
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null)
  const [menuOptions, setMenuOptions] = useState<MenuOption | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasChanges, setHasChanges] = useState(false)
  const [showAddItemModal, setShowAddItemModal] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [draggedItem, setDraggedItem] = useState<MenuItem | null>(null)

  // Cargar menús y opciones
  useEffect(() => {
    Promise.all([
      fetch('/api/menus?location=HEADER&includeInactive=true').then(res => {
        if (!res.ok) throw new Error(`Error fetching menus: ${res.status}`)
        return res.json()
      }),
      fetch('/api/menus/options').then(res => {
        if (!res.ok) throw new Error(`Error fetching options: ${res.status}`)
        return res.json()
      })
    ]).then(([menusData, optionsData]) => {
      console.log('Loaded menus:', menusData)
      console.log('Loaded options:', optionsData)
      
      // Asegurar que menusData es un array
      const menusArray = Array.isArray(menusData) ? menusData : (menusData?.menus || [])
      setMenus(menusArray)
      setMenuOptions(optionsData || { pageTypes: [], categories: [], featuredProducts: [], availableIcons: [], linkTypes: [], targets: [] })
      
      if (menusArray && menusArray.length > 0) {
        setSelectedMenu(menusArray[0])
      }
      setIsLoading(false)
    }).catch(error => {
      console.error('Error loading data:', error)
      toast.error('Error al cargar los datos')
      // Set default empty values to prevent crashes
      setMenuOptions({ 
        pageTypes: [], 
        categories: [], 
        featuredProducts: [], 
        availableIcons: [], 
        linkTypes: [], 
        targets: [] 
      })
      setIsLoading(false)
    })
  }, [])

  const buildMenuTree = (items: MenuItem[]): MenuItem[] => {
    const itemMap = new Map<string, MenuItem>()
    const rootItems: MenuItem[] = []

    // Crear mapa de items
    items.forEach(item => {
      itemMap.set(item.id, { ...item, children: [] })
    })

    // Construir árbol
    items.forEach(item => {
      const mappedItem = itemMap.get(item.id)!
      if (item.parentId) {
        const parent = itemMap.get(item.parentId)
        if (parent) {
          parent.children!.push(mappedItem)
        }
      } else {
        rootItems.push(mappedItem)
      }
    })

    return rootItems.sort((a, b) => a.sortOrder - b.sortOrder)
  }

  const flattenMenuTree = (items: MenuItem[], parentId?: string): MenuItem[] => {
    let result: MenuItem[] = []
    
    items.forEach((item, index) => {
      result.push({
        ...item,
        parentId: parentId || null,
        sortOrder: index
      })
      
      if (item.children && item.children.length > 0) {
        result = result.concat(flattenMenuTree(item.children, item.id))
      }
    })
    
    return result
  }

  const getItemUrl = (item: MenuItem): string => {
    if (!item) return '#'
    
    switch (item.linkType) {
      case 'HOME':
        return '/'
      case 'CATEGORY':
        return item.category ? `/categories/${item.category.slug}` : '#'
      case 'PRODUCT':
        return item.product ? `/products/${item.product.slug}` : '#'
      case 'PAGE':
        if (!menuOptions?.pageTypes) return '#'
        const pageType = menuOptions.pageTypes.find(p => p.id === item.pageType)
        return pageType?.url || '#'
      case 'CUSTOMIZER':
        return '/customizer'
      case 'EXTERNAL':
      case 'CUSTOM':
        return item.url || '#'
      default:
        return '#'
    }
  }

  const getItemIcon = (item: MenuItem) => {
    const IconComponent = iconMap[item.icon || 'Package']
    return IconComponent || Package
  }

  const handleSaveChanges = async () => {
    if (!selectedMenu) return

    try {
      const flatItems = flattenMenuTree(buildMenuTree(selectedMenu.items))
      
      await fetch('/api/menus/items', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'reorder',
          items: flatItems
        })
      })

      setHasChanges(false)
      toast.success('Cambios guardados correctamente')
    } catch (error) {
      console.error('Error saving changes:', error)
      toast.error('Error al guardar los cambios')
    }
  }

  const handleAddItem = async (newItem: Partial<MenuItem>) => {
    if (!selectedMenu) return

    try {
      const response = await fetch('/api/menus/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newItem,
          menuId: selectedMenu.id,
          sortOrder: selectedMenu.items.length
        })
      })

      if (response.ok) {
        const createdItem = await response.json()
        setSelectedMenu({
          ...selectedMenu,
          items: [...selectedMenu.items, createdItem]
        })
        setHasChanges(true)
        setShowAddItemModal(false)
        toast.success('Elemento añadido')
      }
    } catch (error) {
      console.error('Error adding item:', error)
      toast.error('Error al añadir elemento')
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    if (!selectedMenu) return

    try {
      await fetch(`/api/menus/items?id=${itemId}`, {
        method: 'DELETE'
      })

      setSelectedMenu({
        ...selectedMenu,
        items: selectedMenu.items.filter(item => item.id !== itemId)
      })
      setHasChanges(true)
      toast.success('Elemento eliminado')
    } catch (error) {
      console.error('Error deleting item:', error)
      toast.error('Error al eliminar elemento')
    }
  }

  const handleCreateDefaultMenu = async () => {
    try {
      const response = await fetch('/api/menus/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        const result = await response.json()
        toast.success('Menú inicial creado correctamente')
        // Recargar menús
        window.location.reload()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al crear menú inicial')
      }
    } catch (error) {
      console.error('Error creating default menu:', error)
      toast.error('Error al crear menú inicial')
    }
  }

  const handleDragStart = (item: MenuItem) => {
    setDraggedItem(item)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (targetItem: MenuItem, position: 'before' | 'after' | 'inside') => {
    if (!draggedItem || !selectedMenu || draggedItem.id === targetItem.id) {
      setDraggedItem(null)
      return
    }

    let updatedItems = [...selectedMenu.items]
    
    // Remover el item arrastrado de su posición actual
    updatedItems = updatedItems.filter(item => item.id !== draggedItem.id)
    
    // Encontrar el índice del item objetivo
    const targetIndex = updatedItems.findIndex(item => item.id === targetItem.id)
    
    if (targetIndex === -1) {
      setDraggedItem(null)
      return
    }
    
    // Calcular nueva posición
    let newIndex = targetIndex
    if (position === 'after') {
      newIndex = targetIndex + 1
    }
    
    // Actualizar el sortOrder del item arrastrado
    const updatedDraggedItem = {
      ...draggedItem,
      sortOrder: newIndex,
      parentId: position === 'inside' ? targetItem.id : targetItem.parentId
    }
    
    // Insertar en la nueva posición
    updatedItems.splice(newIndex, 0, updatedDraggedItem)
    
    // Reajustar sortOrder para todos los items
    updatedItems = updatedItems.map((item, index) => ({
      ...item,
      sortOrder: index
    }))
    
    setSelectedMenu({
      ...selectedMenu,
      items: updatedItems
    })
    setHasChanges(true)
    setDraggedItem(null)
  }

  const renderMenuItem = (item: MenuItem, depth: number = 0) => {
    const IconComponent = getItemIcon(item)
    const isDragging = draggedItem?.id === item.id
    const canDrop = draggedItem && draggedItem.id !== item.id
    
    return (
      <div key={item.id} className="relative">
        {/* Drop zone before */}
        {canDrop && (
          <div
            className="h-2 bg-orange-200 opacity-0 hover:opacity-100 transition-opacity border-2 border-dashed border-orange-400 rounded mb-1"
            onDragOver={handleDragOver}
            onDrop={(e) => {
              e.preventDefault()
              handleDrop(item, 'before')
            }}
          />
        )}
        
        <div
          className={`border rounded-lg p-3 mb-2 transition-all ${
            isDragging 
              ? 'opacity-50 bg-gray-100 border-dashed' 
              : 'bg-white hover:bg-gray-50'
          } ${
            depth > 0 ? 'ml-6 border-l-4 border-l-orange-200' : ''
          } ${
            canDrop ? 'hover:border-orange-300' : ''
          }`}
          draggable
          onDragStart={(e) => {
            handleDragStart(item)
            e.dataTransfer.effectAllowed = 'move'
          }}
          onDragOver={handleDragOver}
          onDrop={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleDrop(item, 'inside')
          }}
        >
          <div className="flex items-center gap-3">
            <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
            <IconComponent className="w-4 h-4 text-gray-600" />
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{item.label}</span>
                {item.badge && (
                  <Badge variant="outline" className="text-xs">{item.badge}</Badge>
                )}
                {!item.isActive && (
                  <Badge variant="outline" className="text-xs text-gray-500">Inactivo</Badge>
                )}
              </div>
              <div className="text-sm text-gray-600">
                {getItemUrl(item)} 
                {item.target === 'BLANK' && <ExternalLink className="w-3 h-3 inline ml-1" />}
              </div>
            </div>

            <div className="flex gap-1">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setEditingItem(item)}
                title="Editar"
              >
                <Edit3 className="w-3 h-3" />
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleDeleteItem(item.id)}
                title="Eliminar"
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {item.children && item.children.length > 0 && (
            <div className="mt-2">
              {item.children.map(child => renderMenuItem(child, depth + 1))}
            </div>
          )}
        </div>
        
        {canDrop && (
          <div
            className="h-2 bg-orange-200 opacity-0 hover:opacity-100 transition-opacity border-2 border-dashed border-orange-400 rounded mt-1"
            onDragOver={handleDragOver}
            onDrop={(e) => {
              e.preventDefault()
              handleDrop(item, 'after')
            }}
          />
        )}
      </div>
    )
  }

  // Modal para editar elemento existente
  const EditItemModal = () => {
    if (!editingItem) return null

    const [editItem, setEditItem] = useState({
      label: editingItem.label || '',
      linkType: editingItem.linkType || 'HOME',
      target: editingItem.target || 'SELF',
      url: editingItem.url || '',
      categoryId: editingItem.categoryId || '',
      productId: editingItem.productId || '',
      pageType: editingItem.pageType || '',
      icon: editingItem.icon || 'Package',
      badge: editingItem.badge || '',
      isActive: editingItem.isActive ?? true
    })

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()

      if (!editItem.label.trim()) {
        toast.error('El nombre es obligatorio')
        return
      }

      try {
        const response = await fetch('/api/menus/items', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingItem.id,
            label: editItem.label,
            linkType: editItem.linkType,
            target: editItem.target,
            url: editItem.url || null,
            categoryId: editItem.categoryId || null,
            productId: editItem.productId || null,
            pageType: editItem.pageType || null,
            icon: editItem.icon,
            badge: editItem.badge || null,
            isActive: editItem.isActive
          })
        })

        if (response.ok) {
          const updatedItem = await response.json()

          if (selectedMenu) {
            setSelectedMenu({
              ...selectedMenu,
              items: selectedMenu.items.map(item =>
                item.id === editingItem.id ? { ...item, ...updatedItem } : item
              )
            })
          }

          toast.success('Elemento actualizado')
          setEditingItem(null)
        } else {
          toast.error('Error al actualizar elemento')
        }
      } catch (error) {
        console.error('Error updating item:', error)
        toast.error('Error al actualizar elemento')
      }
    }

    return (
      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Editar Elemento de Menú</h3>
            <Button
              variant="outline"
              onClick={() => setEditingItem(null)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-label">Texto del Menú *</Label>
                <Input
                  id="edit-label"
                  value={editItem.label}
                  onChange={(e) => setEditItem({...editItem, label: e.target.value})}
                  placeholder="Ej: Inicio, Productos..."
                  required
                />
              </div>

              <div>
                <Label htmlFor="edit-linkType">Tipo de Enlace</Label>
                <select
                  id="edit-linkType"
                  value={editItem.linkType}
                  onChange={(e) => setEditItem({...editItem, linkType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {menuOptions?.linkTypes?.map(type => (
                    <option key={type.id} value={type.id}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {editItem.linkType === 'CATEGORY' && (
              <div>
                <Label htmlFor="edit-categoryId">Categoría</Label>
                <select
                  id="edit-categoryId"
                  value={editItem.categoryId}
                  onChange={(e) => setEditItem({...editItem, categoryId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Seleccionar categoría...</option>
                  {menuOptions?.categories?.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            )}

            {editItem.linkType === 'PRODUCT' && (
              <div>
                <Label htmlFor="edit-productId">Producto</Label>
                <select
                  id="edit-productId"
                  value={editItem.productId}
                  onChange={(e) => setEditItem({...editItem, productId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Seleccionar producto...</option>
                  {menuOptions?.featuredProducts?.map(prod => (
                    <option key={prod.id} value={prod.id}>{prod.name}</option>
                  ))}
                </select>
              </div>
            )}

            {editItem.linkType === 'PAGE' && (
              <div>
                <Label htmlFor="edit-pageType">Tipo de Página</Label>
                <select
                  id="edit-pageType"
                  value={editItem.pageType}
                  onChange={(e) => setEditItem({...editItem, pageType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Seleccionar página...</option>
                  {menuOptions?.pageTypes?.map(page => (
                    <option key={page.id} value={page.id}>{page.label}</option>
                  ))}
                </select>
              </div>
            )}

            {(editItem.linkType === 'EXTERNAL' || editItem.linkType === 'CUSTOM') && (
              <div>
                <Label htmlFor="edit-url">URL Personalizada</Label>
                <Input
                  id="edit-url"
                  value={editItem.url}
                  onChange={(e) => setEditItem({...editItem, url: e.target.value})}
                  placeholder="https://ejemplo.com"
                  type="url"
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-icon">Icono</Label>
                <select
                  id="edit-icon"
                  value={editItem.icon}
                  onChange={(e) => setEditItem({...editItem, icon: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {menuOptions?.availableIcons?.map(icon => (
                    <option key={icon.id} value={icon.id}>{icon.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="edit-target">Objetivo</Label>
                <select
                  id="edit-target"
                  value={editItem.target}
                  onChange={(e) => setEditItem({...editItem, target: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {menuOptions?.targets?.map(target => (
                    <option key={target.id} value={target.id}>{target.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="edit-badge">Badge (opcional)</Label>
                <Input
                  id="edit-badge"
                  value={editItem.badge}
                  onChange={(e) => setEditItem({...editItem, badge: e.target.value})}
                  placeholder="Nuevo, Hot..."
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="edit-isActive"
                  checked={editItem.isActive}
                  onChange={(e) => setEditItem({...editItem, isActive: e.target.checked})}
                  className="mr-2"
                />
                <Label htmlFor="edit-isActive">Elemento activo</Label>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingItem(null)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // Modal para añadir nuevo elemento
  const AddItemModal = () => {
    const [newItem, setNewItem] = useState({
      label: '',
      linkType: 'HOME',
      target: 'SELF',
      url: '',
      categoryId: '',
      productId: '',
      pageType: '',
      icon: 'Package',
      badge: '',
      isActive: true
    })

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      
      if (!newItem.label.trim()) {
        toast.error('El nombre es obligatorio')
        return
      }

      const itemData = {
        ...newItem,
        categoryId: newItem.categoryId || undefined,
        productId: newItem.productId || undefined,
        pageType: newItem.pageType || undefined,
        url: newItem.url || undefined,
        badge: newItem.badge || undefined
      }

      await handleAddItem(itemData)
      setNewItem({
        label: '',
        linkType: 'HOME',
        target: 'SELF',
        url: '',
        categoryId: '',
        productId: '',
        pageType: '',
        icon: 'Package',
        badge: '',
        isActive: true
      })
    }

    return (
      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Añadir Elemento de Menú</h3>
            <Button
              variant="outline"
              onClick={() => setShowAddItemModal(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="label">Texto del Menú *</Label>
                <Input
                  id="label"
                  value={newItem.label}
                  onChange={(e) => setNewItem({...newItem, label: e.target.value})}
                  placeholder="Ej: Inicio, Productos..."
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="linkType">Tipo de Enlace</Label>
                <select
                  id="linkType"
                  value={newItem.linkType}
                  onChange={(e) => setNewItem({...newItem, linkType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {menuOptions?.linkTypes?.map(type => (
                    <option key={type.id} value={type.id}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {newItem.linkType === 'CATEGORY' && (
              <div>
                <Label htmlFor="categoryId">Categoría</Label>
                <select
                  id="categoryId"
                  value={newItem.categoryId}
                  onChange={(e) => setNewItem({...newItem, categoryId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Seleccionar categoría...</option>
                  {menuOptions?.categories?.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            )}
            
            {newItem.linkType === 'PRODUCT' && (
              <div>
                <Label htmlFor="productId">Producto</Label>
                <select
                  id="productId"
                  value={newItem.productId}
                  onChange={(e) => setNewItem({...newItem, productId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Seleccionar producto...</option>
                  {menuOptions?.featuredProducts?.map(prod => (
                    <option key={prod.id} value={prod.id}>{prod.name}</option>
                  ))}
                </select>
              </div>
            )}
            
            {newItem.linkType === 'PAGE' && (
              <div>
                <Label htmlFor="pageType">Tipo de Página</Label>
                <select
                  id="pageType"
                  value={newItem.pageType}
                  onChange={(e) => setNewItem({...newItem, pageType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Seleccionar página...</option>
                  {menuOptions?.pageTypes?.map(page => (
                    <option key={page.id} value={page.id}>{page.label}</option>
                  ))}
                </select>
              </div>
            )}
            
            {(newItem.linkType === 'EXTERNAL' || newItem.linkType === 'CUSTOM') && (
              <div>
                <Label htmlFor="url">URL Personalizada</Label>
                <Input
                  id="url"
                  value={newItem.url}
                  onChange={(e) => setNewItem({...newItem, url: e.target.value})}
                  placeholder="https://ejemplo.com"
                  type="url"
                />
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="icon">Icono</Label>
                <select
                  id="icon"
                  value={newItem.icon}
                  onChange={(e) => setNewItem({...newItem, icon: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {menuOptions?.availableIcons?.map(icon => (
                    <option key={icon.id} value={icon.id}>{icon.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="target">Objetivo</Label>
                <select
                  id="target"
                  value={newItem.target}
                  onChange={(e) => setNewItem({...newItem, target: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {menuOptions?.targets?.map(target => (
                    <option key={target.id} value={target.id}>{target.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="badge">Badge (opcional)</Label>
                <Input
                  id="badge"
                  value={newItem.badge}
                  onChange={(e) => setNewItem({...newItem, badge: e.target.value})}
                  placeholder="Nuevo, Hot..."
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={newItem.isActive}
                  onChange={(e) => setNewItem({...newItem, isActive: e.target.checked})}
                  className="mr-2"
                />
                <Label htmlFor="isActive">Elemento activo</Label>
              </div>
              
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddItemModal(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Añadir Elemento
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    )
  }

  if (isLoading || !menuOptions) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  if (menus.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MenuIcon className="w-5 h-5" />
              Configurar Menú Principal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <MenuIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay menús configurados</h3>
              <p className="text-gray-600 mb-6">
                Crea un menú principal con elementos básicos para comenzar
              </p>
              <Button 
                onClick={handleCreateDefaultMenu}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear Menú Inicial
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 relative">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MenuIcon className="w-5 h-5" />
              Editor de Menú Dinámico
            </CardTitle>
            <div className="flex gap-2">
              {hasChanges && (
                <Button variant="outline" onClick={() => setHasChanges(false)}>
                  <Undo2 className="w-4 h-4 mr-2" />
                  Descartar
                </Button>
              )}
              <Button 
                onClick={handleSaveChanges}
                disabled={!hasChanges}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Guardar Cambios
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {selectedMenu && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{selectedMenu.name}</h3>
                  <p className="text-sm text-gray-600">
                    Menú principal del sitio web - Arrastra y suelta para reordenar
                  </p>
                </div>
                <Button 
                  onClick={() => setShowAddItemModal(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Añadir Elemento
                </Button>
              </div>

              <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 min-h-[200px]">
                {selectedMenu.items.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MenuIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>No hay elementos en el menú</p>
                    <p className="text-sm">Añade elementos para comenzar a construir tu menú</p>
                  </div>
                ) : (
                  <div>
                    {buildMenuTree(selectedMenu.items).map(item => renderMenuItem(item, 0))}
                  </div>
                )}
              </div>

              {hasChanges && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <Settings className="w-4 h-4" />
                    <span className="font-medium">Tienes cambios sin guardar</span>
                  </div>
                  <p className="text-sm text-yellow-700 mt-1">
                    Recuerda guardar los cambios para que se reflejen en el sitio web.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vista previa del menú */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Vista Previa
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedMenu && (
            <div className="bg-gray-50 rounded-lg p-4">
              <nav className="flex items-center space-x-6">
                {buildMenuTree(selectedMenu.items).filter(item => item.isActive).map(item => {
                  const IconComponent = getItemIcon(item)
                  return (
                    <div key={item.id} className="relative group">
                      <a 
                        href={getItemUrl(item)}
                        className="flex items-center gap-2 text-gray-700 hover:text-orange-600 transition-colors"
                        target={item.target === 'BLANK' ? '_blank' : '_self'}
                      >
                        <IconComponent className="w-4 h-4" />
                        {item.label}
                        {item.badge && (
                          <Badge className="text-xs bg-orange-100 text-orange-800">
                            {item.badge}
                          </Badge>
                        )}
                        {item.children && item.children.length > 0 && (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </a>
                      
                      {item.children && item.children.length > 0 && (
                        <div className="absolute top-full left-0 bg-white shadow-lg border rounded-lg p-2 mt-1 min-w-48 hidden group-hover:block z-10">
                          {item.children.filter(child => child.isActive).map(child => {
                            const ChildIconComponent = getItemIcon(child)
                            return (
                              <a
                                key={child.id}
                                href={getItemUrl(child)}
                                className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded text-sm"
                                target={child.target === 'BLANK' ? '_blank' : '_self'}
                              >
                                <ChildIconComponent className="w-3 h-3" />
                                {child.label}
                              </a>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </nav>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modales */}
      {showAddItemModal && <AddItemModal />}
      {editingItem && <EditItemModal />}
    </div>
  )
}