"use client"

import { useState, useEffect, memo } from "react"

// Helper para formatear precios de manera segura
const formatPrice = (price: any): string => {
  const numPrice = typeof price === 'number' ? price : parseFloat(price?.toString() || '0')
  return `€${numPrice.toFixed(2)}`
}
import { Plus, Edit2, Trash2, Save, X, Settings, Eye, EyeOff, RefreshCw, Upload, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ColoredSwitch } from "@/components/ui/ColoredSwitch"
import { toast } from "react-hot-toast"

// Definición de una opción dentro de un grupo
interface VariantOption {
  id: string
  name: string
  value: string
  colorHex?: string // Solo para colores
  // Medidas para tabla de tallas
  measurements?: {
    width?: number  // Ancho en cm
    length?: number // Largo en cm
  }
}

// Definición de un grupo de variantes (ej: Tallas, Colores)
interface VariantGroup {
  id: string
  name: string
  type: 'size' | 'color' | 'custom'
  options: VariantOption[]
  showSizeTable?: boolean // Habilitar tabla de tallas para grupos de tipo 'size'
}

// Definición de una combinación individual editable
interface VariantCombination {
  id: string
  groupCombinations: { groupId: string, optionId: string }[] // Las opciones seleccionadas
  sku: string
  stock: number
  price: number
  isActive: boolean
  displayName: string // Nombre generado automáticamente ej: "XL - Blanco"
  images?: string[] // Imágenes específicas de la combinación
}

interface AdvancedVariantsManagerProps {
  productId: string
  initialGroups?: VariantGroup[]
  initialCombinations?: VariantCombination[]
  basePrice: number
  onVariantsChange?: (groups: VariantGroup[], combinations: VariantCombination[]) => void
  onSaveVariants?: () => void
  isSaving?: boolean
  hasUnsavedChanges?: boolean
}

// Tipo para exportar la tabla de tallas
export interface SizeTableData {
  groupName: string
  sizes: Array<{
    name: string
    width?: number
    length?: number
  }>
}

// Función helper para generar datos de tabla de tallas
export const generateSizeTableData = (groups: VariantGroup[]): SizeTableData[] => {
  return groups
    .filter(group => group.type === 'size' && group.showSizeTable)
    .map(group => ({
      groupName: group.name,
      sizes: group.options
        .filter(option => option.measurements?.width || option.measurements?.length)
        .map(option => ({
          name: option.name,
          width: option.measurements?.width,
          length: option.measurements?.length
        }))
    }))
    .filter(table => table.sizes.length > 0)
}

const AdvancedVariantsManager = memo(function AdvancedVariantsManager({
  productId,
  initialGroups = [],
  initialCombinations = [],
  basePrice,
  onVariantsChange,
  onSaveVariants,
  isSaving = false,
  hasUnsavedChanges = false
}: AdvancedVariantsManagerProps) {
  const [variantGroups, setVariantGroups] = useState<VariantGroup[]>(initialGroups)
  const [combinations, setCombinations] = useState<VariantCombination[]>(initialCombinations)
  const [activeTab, setActiveTab] = useState<'groups' | 'combinations'>('groups')
  const [justSaved, setJustSaved] = useState(false)
  
  // Estados para crear grupos
  const [isAddingGroup, setIsAddingGroup] = useState(false)
  const [newGroup, setNewGroup] = useState<Omit<VariantGroup, 'id' | 'options'>>({
    name: '',
    type: 'custom'
  })

  // Estados para editar combinaciones
  const [editingCombination, setEditingCombination] = useState<string | null>(null)

  // Colores predefinidos para el selector
  const colorPresets = [
    { name: 'Negro', hex: '#000000' },
    { name: 'Blanco', hex: '#FFFFFF' },
    { name: 'Rojo', hex: '#DC2626' },
    { name: 'Azul', hex: '#1E3A8A' },
    { name: 'Verde', hex: '#16A34A' },
    { name: 'Amarillo', hex: '#EAB308' },
    { name: 'Rosa', hex: '#EC4899' },
    { name: 'Morado', hex: '#9333EA' },
    { name: 'Naranja', hex: '#EA580C' },
    { name: 'Gris', hex: '#6B7280' }
  ]

  // Tallas predefinidas
  const sizePresets = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL']

  // Generar ID único
  const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  // Crear nuevo grupo
  const handleCreateGroup = () => {
    if (!newGroup.name.trim()) {
      toast.error('El nombre del grupo es obligatorio')
      return
    }

    const group: VariantGroup = {
      ...newGroup,
      id: generateId(),
      options: [],
      // Habilitar automáticamente tabla de tallas si el tipo es 'size'
      showSizeTable: newGroup.type === 'size'
    }

    const updatedGroups = [...variantGroups, group]
    setVariantGroups(updatedGroups)
    setNewGroup({ name: '', type: 'custom' })
    setIsAddingGroup(false)
    
    if (newGroup.type === 'size') {
      toast.success('Grupo de tallas creado. Tabla de tallas habilitada automáticamente.')
    } else {
      toast.success('Grupo creado correctamente')
    }
  }

  // Agregar opción a un grupo
  const addOptionToGroup = (groupId: string, option: Omit<VariantOption, 'id'>) => {
    if (!option.name.trim()) {
      toast.error('El nombre de la opción es obligatorio')
      return
    }

    const newOption: VariantOption = {
      ...option,
      id: generateId()
    }

    const updatedGroups = variantGroups.map(group =>
      group.id === groupId
        ? { ...group, options: [...group.options, newOption] }
        : group
    )

    setVariantGroups(updatedGroups)

    // Auto-generar combinaciones solo si TODOS los grupos tienen opciones
    const groupsWithOptions = updatedGroups.filter(g => g.options.length > 0)
    const allGroupsHaveOptions = groupsWithOptions.length === updatedGroups.length
    const hasMinimumGroups = updatedGroups.length >= 1
    
    // Deshabilitar generación automática - usuario debe usar botones manualmente
    // if (allGroupsHaveOptions && hasMinimumGroups) {
    //   setTimeout(() => {
    //     generateAllCombinationsFromGroups(updatedGroups)
    //   }, 100)
    // }
    console.log('ℹ️ Grupos actualizados. Usa "Generar Combinaciones" para crear variantes.')

    toast.success('Opción agregada')
  }

  // Eliminar opción de un grupo
  const removeOptionFromGroup = (groupId: string, optionId: string) => {
    setVariantGroups(variantGroups.map(group =>
      group.id === groupId
        ? { ...group, options: group.options.filter(opt => opt.id !== optionId) }
        : group
    ))

    // También eliminar las combinaciones que usen esta opción
    setCombinations(combinations.filter(combo =>
      !combo.groupCombinations.some(gc => gc.optionId === optionId)
    ))

    toast.success('Opción eliminada')
  }

  // Eliminar grupo completo
  const removeGroup = (groupId: string) => {
    if (!confirm('¿Estás seguro? Esto eliminará todas las combinaciones que usen este grupo.')) {
      return
    }

    setVariantGroups(variantGroups.filter(g => g.id !== groupId))
    
    // Eliminar combinaciones que usen este grupo
    setCombinations(combinations.filter(combo =>
      !combo.groupCombinations.some(gc => gc.groupId === groupId)
    ))

    toast.success('Grupo eliminado')
  }

  // Actualizar grupo existente
  const updateGroup = (updatedGroup: VariantGroup) => {
    setVariantGroups(variantGroups.map(g => 
      g.id === updatedGroup.id ? updatedGroup : g
    ))
  }

  // Función helper para generar combinaciones sin afectar UI
  const generateAllCombinationsFromGroups = (groups: VariantGroup[]) => {
    if (groups.length === 0) {
      return
    }

    const groupsWithOptions = groups.filter(g => g.options.length > 0)
    
    if (groupsWithOptions.length === 0) {
      return
    }

    // Solo generar combinaciones si TODOS los grupos tienen opciones
    const allGroupsHaveOptions = groups.length === groupsWithOptions.length
    
    if (!allGroupsHaveOptions) {
      return
    }

    // Generar combinaciones cartesianas - incluir variantes individuales
    const generateCartesian = (groups: VariantGroup[]): VariantCombination[] => {
      if (groups.length === 0) return []
      
      // Para un solo grupo, crear variantes individuales
      if (groups.length === 1) {
        const singleGroup = groups[0]
        return singleGroup.options.map(option => ({
          id: `${productId}-${singleGroup.id}-${option.id}`,
          groupCombinations: [{ groupId: singleGroup.id, optionId: option.id }],
          sku: `${productId}-${option.value.toUpperCase()}`,
          stock: 0,
          price: basePrice,
          isActive: true,
          displayName: option.name,
          images: []
        }))
      }

      // Para múltiples grupos, crear SOLO combinaciones (no variantes individuales)
      const [firstGroup, ...restGroups] = groups
      const restCombinations = generateCartesian(restGroups)
      const result: VariantCombination[] = []

      firstGroup.options.forEach(option => {
        if (restCombinations.length > 0) {
          // Solo crear las combinaciones entre grupos
          restCombinations.forEach(restCombo => {
            const displayName = `${option.name} - ${restCombo.displayName}`
            const skuParts = [
              productId,
              option.value.toLowerCase(),
              ...restCombo.groupCombinations.map(gc => {
                const group = groups.find(g => g.id === gc.groupId)
                const opt = group?.options.find(o => o.id === gc.optionId)
                return opt?.value.toLowerCase() || ''
              })
            ].filter(Boolean)

            result.push({
              id: generateId(),
              groupCombinations: [
                { groupId: firstGroup.id, optionId: option.id },
                ...restCombo.groupCombinations
              ],
              sku: skuParts.join('-'),
              stock: 0,
              price: basePrice,
              isActive: true,
              displayName,
              images: []
            })
          })
        }
        // NO crear variantes individuales cuando hay múltiples grupos
      })

      return result
    }

    const newCombinations = generateCartesian(groupsWithOptions)
    
    // Solo agregar combinaciones que no existan ya
    const existingCombinationKeys = new Set(
      combinations.map(combo => 
        combo.groupCombinations
          .map(gc => `${gc.groupId}:${gc.optionId}`)
          .sort()
          .join('|')
      )
    )

    const uniqueNewCombinations = newCombinations.filter(combo => {
      const key = combo.groupCombinations
        .map(gc => `${gc.groupId}:${gc.optionId}`)
        .sort()
        .join('|')
      return !existingCombinationKeys.has(key)
    })

    if (uniqueNewCombinations.length > 0) {
      setCombinations(prevCombinations => [...prevCombinations, ...uniqueNewCombinations])
      toast.success(`${uniqueNewCombinations.length} combinaciones generadas automáticamente`)
    } else {
    }
  }

  // Limpiar y regenerar todas las combinaciones
  const clearAndRegenerateCombinations = () => {
    if (variantGroups.length === 0) {
      toast.error('Necesitas al menos un grupo con opciones')
      return
    }
    
    if (combinations.length > 0) {
      if (!confirm('Esto eliminará todas las variantes existentes y las recreará. ¿Continuar?')) {
        return
      }
    }
    
    // Limpiar combinaciones existentes
    setCombinations([])
    
    // Regenerar después de un pequeño delay
    setTimeout(() => {
      generateAllCombinations()
    }, 100)
  }

  // Generar todas las combinaciones posibles
  const generateAllCombinations = () => {
    if (variantGroups.length === 0) {
      toast.error('Necesitas al menos un grupo con opciones')
      return
    }

    const groupsWithOptions = variantGroups.filter(g => g.options.length > 0)
    
    if (groupsWithOptions.length === 0) {
      toast.error('Los grupos necesitan tener opciones')
      return
    }

    // Verificar que TODOS los grupos tengan opciones antes de generar
    const allGroupsHaveOptions = variantGroups.length === groupsWithOptions.length
    
    if (!allGroupsHaveOptions) {
      toast.error(`Todos los grupos deben tener opciones. Faltan opciones en ${variantGroups.length - groupsWithOptions.length} grupo(s)`)
      return
    }

    // Permitir generar con 1 o más grupos
    if (variantGroups.length < 1) {
      toast.error('Necesitas al menos 1 grupo para crear variantes')
      return
    }

    // Generar combinaciones cartesianas correctamente
    const generateCartesian = (groups: VariantGroup[]): VariantCombination[] => {
      if (groups.length === 0) return []
      
      // Para un solo grupo, crear variantes individuales
      if (groups.length === 1) {
        const singleGroup = groups[0]
        return singleGroup.options.map(option => ({
          id: `${productId}-${singleGroup.id}-${option.id}`,
          groupCombinations: [{ groupId: singleGroup.id, optionId: option.id }],
          sku: `${productId}-${option.value.toUpperCase()}`,
          stock: 0,
          price: basePrice,
          isActive: true,
          displayName: option.name,
          images: []
        }))
      }

      // Para múltiples grupos, generar SOLO las combinaciones cruzadas
      const allCombinations: VariantCombination[] = []
      
      function generateCrossProduct(groupIndex: number, currentCombination: { groupId: string, optionId: string }[], currentNames: string[]): void {
        if (groupIndex >= groups.length) {
          // Crear la combinación final
          const skuParts = [productId, ...currentCombination.map(gc => {
            const group = groups.find(g => g.id === gc.groupId)
            const opt = group?.options.find(o => o.id === gc.optionId)
            return opt?.value.toLowerCase() || ''
          })].filter(Boolean)

          allCombinations.push({
            id: generateId(),
            groupCombinations: [...currentCombination],
            sku: skuParts.join('-'),
            stock: 0,
            price: basePrice,
            isActive: true,
            displayName: currentNames.join(' - '),
            images: []
          })
          return
        }

        const currentGroup = groups[groupIndex]
        currentGroup.options.forEach(option => {
          generateCrossProduct(
            groupIndex + 1,
            [...currentCombination, { groupId: currentGroup.id, optionId: option.id }],
            [...currentNames, option.name]
          )
        })
      }

      generateCrossProduct(0, [], [])
      return allCombinations
    }

    const newCombinations = generateCartesian(groupsWithOptions)
    
    // Solo agregar combinaciones que no existan ya
    const existingCombinationKeys = new Set(
      combinations.map(combo => 
        combo.groupCombinations
          .map(gc => `${gc.groupId}:${gc.optionId}`)
          .sort()
          .join('|')
      )
    )

    const uniqueNewCombinations = newCombinations.filter(combo => {
      const key = combo.groupCombinations
        .map(gc => `${gc.groupId}:${gc.optionId}`)
        .sort()
        .join('|')
      return !existingCombinationKeys.has(key)
    })

    if (uniqueNewCombinations.length === 0) {
      toast.success('Todas las combinaciones ya existen')
      return
    }

    setCombinations([...combinations, ...uniqueNewCombinations])
    toast.success(`${uniqueNewCombinations.length} combinaciones generadas`)
    setActiveTab('combinations')
  }

  // Actualizar combinación individual
  const updateCombination = (id: string, updates: Partial<VariantCombination>) => {
    setCombinations(combinations.map(combo =>
      combo.id === id ? { ...combo, ...updates } : combo
    ))
  }

  // Función para subir imágenes de combinaciones
  const uploadCombinationImages = async (files: FileList): Promise<string[]> => {
    const formData = new FormData()
    Array.from(files).forEach(file => {
      formData.append('files', file)
    })

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        const data = await response.json()
        return data.urls || []
      } else {
        throw new Error('Error al subir imágenes')
      }
    } catch (error) {
      console.error('Error uploading images:', error)
      toast.error('Error al subir las imágenes')
      return []
    }
  }

  // Manejar subida de imágenes para combinaciones
  const handleCombinationImageUpload = async (combinationId: string, files: FileList) => {
    if (!files || files.length === 0) return

    const urls = await uploadCombinationImages(files)
    if (urls.length > 0) {
      const combination = combinations.find(c => c.id === combinationId)
      const currentImages = combination?.images || []
      
      updateCombination(combinationId, {
        images: [...currentImages, ...urls]
      })
      
      toast.success(`${urls.length} imagen(es) subida(s) correctamente`)
    }
  }

  // Eliminar imagen de combinación
  const removeCombinationImage = (combinationId: string, imageUrl: string) => {
    const combination = combinations.find(c => c.id === combinationId)
    if (combination) {
      updateCombination(combinationId, {
        images: combination.images?.filter(img => img !== imageUrl) || []
      })
    }
  }

  // Eliminar combinación
  const removeCombination = (id: string) => {
    setCombinations(combinations.filter(combo => combo.id !== id))
    toast.success('Combinación eliminada')
  }

  // Obtener el nombre de una opción por IDs
  const getOptionDisplay = (groupId: string, optionId: string) => {
    const group = variantGroups.find(g => g.id === groupId)
    const option = group?.options.find(o => o.id === optionId)
    return {
      groupName: group?.name || 'Grupo',
      optionName: option?.name || 'Opción',
      colorHex: option?.colorHex
    }
  }

  // Marcar como guardado cuando inicia el proceso de guardado
  useEffect(() => {
    if (isSaving && !justSaved) {
      console.log('🔄 Save started, setting justSaved flag')
      setJustSaved(true)
    }
  }, [isSaving, justSaved])

  // Resetear el flag de guardado cuando termine la operación
  useEffect(() => {
    if (!isSaving && justSaved) {
      console.log('🔄 Save completed, resetting justSaved flag after delay')
      // Pequeño delay para asegurar que no se disparen cambios inmediatamente
      setTimeout(() => {
        setJustSaved(false)
      }, 500)
    }
  }, [isSaving, justSaved])

  // Notificar cambios al componente padre
  useEffect(() => {
    console.log('🔄 AdvancedVariantsManager useEffect triggered')
    console.log('🔄 variantGroups:', variantGroups.length, variantGroups.map(g => `${g.name}(${g.options.length})`))
    console.log('🔄 combinations:', combinations.length)
    console.log('🔄 onVariantsChange exists:', !!onVariantsChange)
    console.log('🔄 justSaved:', justSaved, 'isSaving:', isSaving)
    
    if (onVariantsChange && !justSaved) {
      // Solo llamar onVariantsChange si hay datos significativos que reportar
      const hasGroups = variantGroups.length > 0
      const hasGroupsWithOptions = variantGroups.some(g => g.options.length > 0)
      const hasCombinations = combinations.length > 0
      
      console.log('🔄 hasGroups:', hasGroups, 'hasGroupsWithOptions:', hasGroupsWithOptions, 'hasCombinations:', hasCombinations)
      
      // Siempre notificar si hay combinaciones, o si hay grupos (para limpiar combinaciones cuando se eliminen grupos)
      if (hasCombinations || hasGroups) {
        onVariantsChange(variantGroups, combinations)
      } else {
      }
    } else {
    }
  }, [variantGroups, combinations, onVariantsChange, justSaved])

  // Función helper para obtener las tablas de tallas configuradas
  const getSizeTables = () => generateSizeTableData(variantGroups)

  return (
    <div className="space-y-6">
      {/* Header con tabs */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('groups')}
            className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'groups'
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🏷️ Grupos ({variantGroups.length})
          </button>
          <button
            onClick={() => setActiveTab('combinations')}
            className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'combinations'
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🔄 Combinaciones ({combinations.length})
          </button>
        </div>

        {activeTab === 'groups' && (
          <Button onClick={() => setIsAddingGroup(true)} disabled={isAddingGroup}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Grupo
          </Button>
        )}

        {activeTab === 'combinations' && (
          <div className="flex gap-2">
            <Button onClick={generateAllCombinations}>
              <Plus className="h-4 w-4 mr-2" />
              Generar Combinaciones
            </Button>
            {combinations.length > 0 && (
              <Button onClick={clearAndRegenerateCombinations} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Limpiar y Regenerar
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Tab: Grupos */}
      {activeTab === 'groups' && (
        <div className="space-y-6">
          {/* Formulario nuevo grupo */}
          {isAddingGroup && (
            <Card className="border-2 border-dashed border-green-300">
              <CardHeader>
                <CardTitle>➕ Crear Nuevo Grupo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nombre del Grupo *</Label>
                    <Input
                      value={newGroup.name}
                      onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                      placeholder="Ej: Tallas, Colores, Acabados..."
                    />
                  </div>
                  <div>
                    <Label>Tipo de Grupo</Label>
                    <select
                      value={newGroup.type}
                      onChange={(e) => setNewGroup({ ...newGroup, type: e.target.value as any })}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                      <option value="custom">Personalizado</option>
                      <option value="size">Tallas</option>
                      <option value="color">Colores</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddingGroup(false)}>
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateGroup}>
                    <Save className="h-4 w-4 mr-2" />
                    Crear Grupo
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lista de grupos */}
          {variantGroups.length > 0 ? (
            <div className="space-y-4">
              {variantGroups.map(group => (
                <GroupCard
                  key={group.id}
                  group={group}
                  colorPresets={colorPresets}
                  sizePresets={sizePresets}
                  onAddOption={(option) => addOptionToGroup(group.id, option)}
                  onRemoveOption={(optionId) => removeOptionFromGroup(group.id, optionId)}
                  onRemoveGroup={() => removeGroup(group.id)}
                  onUpdateGroup={updateGroup}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No hay grupos de variantes</p>
                <p className="text-sm text-gray-400">
                  Crea grupos como "Tallas" o "Colores" para organizar las opciones
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Tab: Combinaciones */}
      {activeTab === 'combinations' && (
        <div className="space-y-6">
          {combinations.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>
                  🔄 Tabla de Combinaciones ({combinations.filter(c => c.isActive).length} activas de {combinations.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left p-3 font-medium">Combinación</th>
                        <th className="text-left p-3 font-medium">SKU</th>
                        <th className="text-left p-3 font-medium">Stock</th>
                        <th className="text-left p-3 font-medium">Precio (€)</th>
                        <th className="text-left p-3 font-medium">Estado</th>
                        <th className="text-left p-3 font-medium">Imágenes</th>
                        <th className="text-left p-3 font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {combinations.map(combination => (
                        <CombinationRow
                          key={combination.id}
                          combination={combination}
                          isEditing={editingCombination === combination.id}
                          variantGroups={variantGroups}
                          onUpdate={(updates) => updateCombination(combination.id, updates)}
                          onEdit={() => setEditingCombination(combination.id)}
                          onSave={() => setEditingCombination(null)}
                          onCancel={() => setEditingCombination(null)}
                          onRemove={() => removeCombination(combination.id)}
                          getOptionDisplay={getOptionDisplay}
                          onImageUpload={(files) => handleCombinationImageUpload(combination.id, files)}
                          onImageRemove={(imageUrl) => removeCombinationImage(combination.id, imageUrl)}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <RefreshCw className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No hay combinaciones generadas</p>
                <p className="text-sm text-gray-400 mb-4">
                  Primero crea grupos con opciones, luego genera las combinaciones
                </p>
                <div className="flex flex-col gap-2">
                  <Button onClick={generateAllCombinations} disabled={variantGroups.length === 0}>
                    <Plus className="h-4 w-4 mr-2" />
                    Generar Combinaciones
                  </Button>
                  {combinations.length > 0 && (
                    <Button onClick={clearAndRegenerateCombinations} variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Limpiar y Regenerar Todo
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Resumen de tablas de tallas configuradas */}
      {getSizeTables().length > 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <h4 className="font-medium text-green-900 mb-2 flex items-center gap-2">
              📊 Tablas de Tallas Configuradas
            </h4>
            <div className="space-y-2">
              {getSizeTables().map((table, index) => (
                <div key={index} className="text-sm text-green-700">
                  <strong>{table.groupName}:</strong> {table.sizes.length} tallas con medidas
                  <span className="text-green-600 ml-2">
                    ({table.sizes.map(s => s.name).join(', ')})
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-green-600 mt-2">
              ✅ Estas tablas se mostrarán automáticamente en la página del producto
            </p>
          </CardContent>
        </Card>
      )}

      {/* Información del proceso */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-medium text-blue-900 mb-2">💡 Cómo usar este sistema</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p><strong>Paso 1:</strong> Crea grupos (ej: "Tallas", "Colores")</p>
            <p><strong>Paso 2:</strong> Agrega opciones a cada grupo (ej: XL, Rojo)</p>
            <p><strong>Paso 3:</strong> Para tallas, habilita la tabla de medidas y agrega ancho/largo</p>
            <p><strong>Paso 4:</strong> ✨ Las combinaciones se generan automáticamente al agregar opciones</p>
            <p><strong>Paso 5:</strong> Edita cada combinación individual (stock, precio, SKU)</p>
            <p><strong>Resultado:</strong> Control total sobre cada variante específica + tabla de tallas</p>
          </div>
          <div className="mt-3 p-2 bg-green-100 rounded border border-green-200">
            <p className="text-xs text-green-700">
              <strong>🚀 Nuevo:</strong> Las combinaciones se crean automáticamente cuando TODOS los grupos tengan opciones. Con 1 grupo se crean variantes individuales (ej: "S", "M", "L"), con 2+ grupos se crean combinaciones completas (ej: "BLANCO - L"). Recuerda hacer clic en "Guardar Variantes" para aplicar los cambios.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Botón para guardar variantes manualmente */}
      {variantGroups.length > 0 && onSaveVariants && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {hasUnsavedChanges && (
                  <>
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-orange-700 font-medium">
                      Cambios sin guardar
                    </span>
                  </>
                )}
                {!hasUnsavedChanges && (
                  <span className="text-sm text-green-700 font-medium">
                    ✅ Configuración guardada
                  </span>
                )}
              </div>
              <Button
                onClick={onSaveVariants}
                disabled={isSaving || !hasUnsavedChanges}
                className={`
                  ${hasUnsavedChanges 
                    ? 'bg-orange-600 hover:bg-orange-700' 
                    : 'bg-green-600 hover:bg-green-700'
                  }
                `}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving 
                  ? 'Guardando...' 
                  : hasUnsavedChanges 
                    ? (combinations.length > 0 ? 'Guardar Variantes' : 'Guardar Configuración')
                    : 'Guardado'
                }
              </Button>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              {combinations.length > 0 
                ? `${combinations.length} combinación${combinations.length !== 1 ? 'es' : ''} ${hasUnsavedChanges ? 'pendientes de guardar' : 'guardadas'}`
                : `${variantGroups.length} grupo${variantGroups.length !== 1 ? 's' : ''} de variantes ${hasUnsavedChanges ? 'pendientes de guardar' : 'guardados'}`
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
})

// Componente para gestionar un grupo individual
function GroupCard({
  group,
  colorPresets,
  sizePresets,
  onAddOption,
  onRemoveOption,
  onRemoveGroup,
  onUpdateGroup
}: {
  group: VariantGroup
  colorPresets: Array<{ name: string; hex: string }>
  sizePresets: string[]
  onAddOption: (option: Omit<VariantOption, 'id'>) => void
  onRemoveOption: (optionId: string) => void
  onRemoveGroup: () => void
  onUpdateGroup: (updatedGroup: VariantGroup) => void
}) {
  const [isAddingOption, setIsAddingOption] = useState(false)
  const [newOption, setNewOption] = useState<Omit<VariantOption, 'id'>>({
    name: '',
    value: '',
    colorHex: '#000000',
    measurements: {
      width: undefined,
      length: undefined
    }
  })

  const handleAddOption = () => {
    if (!newOption.name.trim()) {
      toast.error('El nombre es obligatorio')
      return
    }

    onAddOption(newOption)
    setNewOption({ 
      name: '', 
      value: '', 
      colorHex: '#000000',
      measurements: {
        width: undefined,
        length: undefined
      }
    })
    setIsAddingOption(false)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              {group.type === 'size' && '📏'}
              {group.type === 'color' && '🎨'}
              {group.type === 'custom' && '🏷️'}
              {group.name}
              {group.type === 'size' && group.showSizeTable && (
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                  📊 Tabla de tallas
                </Badge>
              )}
            </CardTitle>
            <p className="text-sm text-gray-500">
              {group.options.length} opciones
              {group.type === 'size' && group.showSizeTable && 
                group.options.some(opt => opt.measurements?.width || opt.measurements?.length) && 
                ' • Con medidas'
              }
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setIsAddingOption(true)}>
              <Plus className="h-3 w-3 mr-1" />
              Opción
            </Button>
            <Button size="sm" variant="outline" onClick={onRemoveGroup}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Formulario nueva opción */}
        {isAddingOption && (
          <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 space-y-4">
            <h4 className="font-medium">➕ Nueva Opción</h4>

            {/* Opciones rápidas para tallas */}
            {group.type === 'size' && (
              <div>
                <Label>Tallas Rápidas</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {sizePresets.map(size => (
                    <Button
                      key={size}
                      variant="outline"
                      size="sm"
                      onClick={() => setNewOption({
                        name: size,
                        value: size.toLowerCase(),
                        colorHex: newOption.colorHex,
                        measurements: newOption.measurements
                      })}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Opciones rápidas para colores */}
            {group.type === 'color' && (
              <div>
                <Label>Colores Rápidos</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {colorPresets.map(color => (
                    <button
                      key={color.hex}
                      onClick={() => setNewOption({
                        name: color.name,
                        value: color.name.toLowerCase(),
                        colorHex: color.hex,
                        measurements: newOption.measurements
                      })}
                      className="w-8 h-8 rounded-full border-2 border-gray-300 hover:border-gray-500"
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Nombre *</Label>
                <Input
                  value={newOption.name}
                  onChange={(e) => setNewOption({ ...newOption, name: e.target.value })}
                  placeholder="Nombre de la opción"
                />
              </div>
              <div>
                <Label>Valor</Label>
                <Input
                  value={newOption.value}
                  onChange={(e) => setNewOption({ ...newOption, value: e.target.value })}
                  placeholder="Valor para SKU (automático si está vacío)"
                />
              </div>
            </div>

            {group.type === 'color' && (
              <div>
                <Label>Color Personalizado</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={newOption.colorHex}
                    onChange={(e) => setNewOption({ ...newOption, colorHex: e.target.value })}
                    className="w-16"
                  />
                  <Input
                    value={newOption.colorHex}
                    onChange={(e) => setNewOption({ ...newOption, colorHex: e.target.value })}
                    placeholder="#000000"
                    className="flex-1"
                  />
                </div>
              </div>
            )}

            {/* Medidas para tallas */}
            {group.type === 'size' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="enableMeasurements"
                    checked={group.showSizeTable || false}
                    onChange={(e) => {
                      // Actualizar el grupo para habilitar/deshabilitar tabla de tallas
                      onUpdateGroup({ ...group, showSizeTable: e.target.checked })
                    }}
                    className="rounded"
                  />
                  <Label htmlFor="enableMeasurements">Habilitar tabla de tallas con medidas</Label>
                </div>
                
                {group.showSizeTable && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Label>Medidas (cm)</Label>
                      <div className="flex items-center gap-1 text-gray-500">
                        {/* Icono de prenda con flechas */}
                        <div className="relative">
                          <svg 
                            width="24" 
                            height="24" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="1.5"
                            className="text-gray-400"
                          >
                            {/* Silueta de camiseta */}
                            <path d="M8 3h8l2 2v16H6V5l2-2z" fill="none" stroke="currentColor" strokeWidth="1"/>
                            <path d="M6 5l-2 2v4l2-2" fill="none" stroke="currentColor" strokeWidth="1"/>
                            <path d="M18 5l2 2v4l-2-2" fill="none" stroke="currentColor" strokeWidth="1"/>
                            {/* Cuello */}
                            <path d="M10 3v2h4V3" fill="none" stroke="currentColor" strokeWidth="1"/>
                          </svg>
                          {/* Flecha horizontal (ancho) */}
                          <svg 
                            width="16" 
                            height="8" 
                            viewBox="0 0 16 8" 
                            fill="none" 
                            className="absolute -bottom-2 left-1/2 transform -translate-x-1/2"
                          >
                            <path d="M1 4h14M2 2l-2 2 2 2M14 2l2 2-2 2" stroke="#6B7280" strokeWidth="1" fill="none"/>
                          </svg>
                          {/* Flecha vertical (largo) */}
                          <svg 
                            width="8" 
                            height="16" 
                            viewBox="0 0 8 16" 
                            fill="none" 
                            className="absolute -right-2 top-1/2 transform -translate-y-1/2"
                          >
                            <path d="M4 1v14M2 2l2-2 2 2M2 14l2 2 2-2" stroke="#6B7280" strokeWidth="1" fill="none"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <Label className="text-sm flex items-center gap-1">
                          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" className="text-blue-500">
                            <path d="M1 4h10M2 2l-2 2 2 2M10 2l2 2-2 2" stroke="currentColor" strokeWidth="1" fill="none"/>
                          </svg>
                          Ancho
                        </Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={newOption.measurements?.width || ''}
                          onChange={(e) => setNewOption({ 
                            ...newOption, 
                            measurements: {
                              ...newOption.measurements,
                              width: e.target.value ? parseFloat(e.target.value) : undefined
                            }
                          })}
                          placeholder="Ancho en cm"
                        />
                      </div>
                      <div>
                        <Label className="text-sm flex items-center gap-1">
                          <svg width="8" height="12" viewBox="0 0 8 12" fill="none" className="text-green-500">
                            <path d="M4 1v10M2 2l2-2 2 2M2 10l2 2 2-2" stroke="currentColor" strokeWidth="1" fill="none"/>
                          </svg>
                          Largo
                        </Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={newOption.measurements?.length || ''}
                          onChange={(e) => setNewOption({ 
                            ...newOption, 
                            measurements: {
                              ...newOption.measurements,
                              length: e.target.value ? parseFloat(e.target.value) : undefined
                            }
                          })}
                          placeholder="Largo en cm"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddingOption(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleAddOption}>
                <Save className="h-4 w-4 mr-2" />
                Agregar
              </Button>
            </div>
          </div>
        )}

        {/* Lista de opciones */}
        {group.options.length > 0 ? (
          <div className="space-y-4">
            {/* Vista de opciones */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {group.options.map(option => (
                <div key={option.id} className="border rounded-lg p-3 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      {option.colorHex && (
                        <div
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: option.colorHex }}
                        />
                      )}
                      <span className="font-medium">{option.name}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onRemoveOption(option.id)}
                      className="h-6 w-6 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  {option.value && (
                    <p className="text-xs text-gray-500 mt-1">
                      Valor: {option.value}
                    </p>
                  )}
                  {option.measurements && (option.measurements.width || option.measurements.length) && (
                    <div className="text-xs text-blue-600 mt-1 space-y-1">
                      {option.measurements.width && (
                        <p>Ancho: {option.measurements.width} cm</p>
                      )}
                      {option.measurements.length && (
                        <p>Largo: {option.measurements.length} cm</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Preview de tabla de tallas */}
            {group.type === 'size' && group.showSizeTable && 
             group.options.some(opt => opt.measurements?.width || opt.measurements?.length) && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Vista previa de la tabla de tallas
                </h4>
                <div className="bg-white rounded border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="text-left p-3 font-medium">Talla</th>
                        {group.options.some(opt => opt.measurements?.width) && (
                          <th className="text-left p-3 font-medium">Ancho (cm)</th>
                        )}
                        {group.options.some(opt => opt.measurements?.length) && (
                          <th className="text-left p-3 font-medium">Largo (cm)</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {group.options
                        .filter(opt => opt.measurements?.width || opt.measurements?.length)
                        .map(option => (
                        <tr key={option.id} className="border-t">
                          <td className="p-3 font-medium">{option.name}</td>
                          {group.options.some(opt => opt.measurements?.width) && (
                            <td className="p-3">
                              {option.measurements?.width || '-'}
                            </td>
                          )}
                          {group.options.some(opt => opt.measurements?.length) && (
                            <td className="p-3">
                              {option.measurements?.length || '-'}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Esta tabla se mostrará en la página del producto si está habilitada
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <p className="text-sm">No hay opciones en este grupo</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

AdvancedVariantsManager.displayName = 'AdvancedVariantsManager'

export default AdvancedVariantsManager

// Componente para una fila de combinación en la tabla
function CombinationRow({
  combination,
  isEditing,
  variantGroups,
  onUpdate,
  onEdit,
  onSave,
  onCancel,
  onRemove,
  getOptionDisplay,
  onImageUpload,
  onImageRemove
}: {
  combination: VariantCombination
  isEditing: boolean
  variantGroups: VariantGroup[]
  onUpdate: (updates: Partial<VariantCombination>) => void
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
  onRemove: () => void
  getOptionDisplay: (groupId: string, optionId: string) => {
    groupName: string
    optionName: string
    colorHex?: string
  }
  onImageUpload: (files: FileList) => void
  onImageRemove: (imageUrl: string) => void
}) {
  const [editData, setEditData] = useState(combination)
  const [isEditingStock, setIsEditingStock] = useState(false)
  const [stockValue, setStockValue] = useState(combination.stock)

  useEffect(() => {
    if (isEditing) {
      setEditData(combination)
    }
  }, [isEditing, combination])

  useEffect(() => {
    setStockValue(combination.stock)
  }, [combination.stock])

  const handleSave = () => {
    onUpdate(editData)
    onSave()
  }

  const handleStockDoubleClick = () => {
    setIsEditingStock(true)
  }

  const handleStockSave = () => {
    const updatedCombination = { ...combination, stock: stockValue }
    onUpdate(updatedCombination)
    setIsEditingStock(false)
    toast.success('Stock actualizado')
  }

  const handleStockCancel = () => {
    setStockValue(combination.stock)
    setIsEditingStock(false)
  }

  const handleStockKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleStockSave()
    } else if (e.key === 'Escape') {
      handleStockCancel()
    }
  }

  return (
    <tr className={`border-b hover:bg-gray-50 ${!combination.isActive ? 'opacity-50' : ''}`}>
      {/* Combinación */}
      <td className="p-3">
        <div className="flex flex-wrap gap-1">
          {combination.groupCombinations.map((gc, index) => {
            const display = getOptionDisplay(gc.groupId, gc.optionId)
            return (
              <div key={index} className="flex items-center gap-1">
                {display.colorHex && (
                  <div
                    className="w-3 h-3 rounded-full border"
                    style={{ backgroundColor: display.colorHex }}
                  />
                )}
                <Badge variant="outline" className="text-xs">
                  {display.optionName}
                </Badge>
              </div>
            )
          })}
        </div>
      </td>

      {/* SKU */}
      <td className="p-3">
        {isEditing ? (
          <Input
            value={editData.sku}
            onChange={(e) => setEditData({ ...editData, sku: e.target.value })}
            className="text-xs"
          />
        ) : (
          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
            {combination.sku}
          </code>
        )}
      </td>

      {/* Stock */}
      <td className="p-3">
        {isEditing ? (
          <Input
            type="number"
            value={editData.stock}
            onChange={(e) => setEditData({ ...editData, stock: parseInt(e.target.value) || 0 })}
            className="w-20"
            min="0"
          />
        ) : isEditingStock ? (
          <div className="flex items-center gap-1">
            <Input
              type="number"
              value={stockValue}
              onChange={(e) => setStockValue(parseInt(e.target.value) || 0)}
              onKeyDown={handleStockKeyPress}
              onBlur={handleStockSave}
              className="w-16 h-8 text-sm"
              min="0"
              autoFocus
            />
          </div>
        ) : (
          <span 
            className={`cursor-pointer hover:bg-gray-100 px-2 py-1 rounded transition-colors ${
              combination.stock < 5 ? 'text-red-600 font-medium' : ''
            }`}
            onDoubleClick={handleStockDoubleClick}
            title="Doble clic para editar"
          >
            {combination.stock}
          </span>
        )}
      </td>

      {/* Precio */}
      <td className="p-3">
        {isEditing ? (
          <Input
            type="number"
            step="0.01"
            value={editData.price}
            onChange={(e) => setEditData({ ...editData, price: parseFloat(e.target.value) || 0 })}
            className="w-24"
            min="0"
          />
        ) : (
          <span className="font-medium">
            {formatPrice(combination.price)}
          </span>
        )}
      </td>

      {/* Estado */}
      <td className="p-3">
        {isEditing ? (
          <ColoredSwitch
            checked={editData.isActive}
            onCheckedChange={(checked) => setEditData({ ...editData, isActive: checked })}
            activeColor="green"
            inactiveColor="red"
          />
        ) : (
          <Badge variant={combination.isActive ? 'default' : 'secondary'}>
            {combination.isActive ? 'Activa' : 'Inactiva'}
          </Badge>
        )}
      </td>

      {/* Imágenes */}
      <td className="p-3">
        <div className="flex flex-col gap-2">
          {/* Mostrar imágenes existentes */}
          {combination.images && combination.images.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {combination.images.map((imageUrl, index) => (
                <div key={index} className="relative group">
                  <img
                    src={imageUrl}
                    alt={`Imagen ${index + 1}`}
                    className="w-8 h-8 object-cover rounded border"
                  />
                  <button
                    onClick={() => onImageRemove(imageUrl)}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    title="Eliminar imagen"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {/* Botón para subir imágenes */}
          <div className="relative">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => e.target.files && onImageUpload(e.target.files)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              title="Subir imágenes"
            />
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs py-1 px-2 h-6"
            >
              <Upload className="h-3 w-3 mr-1" />
              {combination.images && combination.images.length > 0 ? 'Más' : 'Subir'}
            </Button>
          </div>
        </div>
      </td>

      {/* Acciones */}
      <td className="p-3">
        <div className="flex gap-1">
          {isEditing ? (
            <>
              <Button size="sm" onClick={handleSave}>
                <Save className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="outline" onClick={onCancel}>
                <X className="h-3 w-3" />
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="outline" onClick={onEdit}>
                <Edit2 className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="outline" onClick={onRemove}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>
      </td>
    </tr>
  )
}