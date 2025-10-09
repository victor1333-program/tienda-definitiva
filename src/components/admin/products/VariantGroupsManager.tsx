"use client"

import { useState, useEffect } from "react"
import { Plus, Edit2, Trash2, Save, X, Palette, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ColoredSwitch } from "@/components/ui/ColoredSwitch"
import { toast } from "react-hot-toast"

interface VariantOption {
  id?: string
  name: string
  value: string
  colorHex?: string // Para opciones de color
  priceModifier: number // Modificador del precio base
  stock: number
  sku: string
}

interface VariantGroup {
  id?: string
  name: string
  type: 'size' | 'color' | 'custom'
  isRequired: boolean
  options: VariantOption[]
}

interface VariantCombination {
  id?: string
  options: { groupId: string, optionId: string }[] // Combinación de opciones
  finalPrice: number
  totalStock: number
  combinationSku: string
}

interface VariantGroupsManagerProps {
  productId: string
  variantGroups: VariantGroup[]
  basePrice: number
  onVariantsChange?: (groups: VariantGroup[], combinations: VariantCombination[]) => void
}

export default function VariantGroupsManager({
  productId,
  variantGroups: initialGroups = [],
  basePrice,
  onVariantsChange
}: VariantGroupsManagerProps) {
  const [variantGroups, setVariantGroups] = useState<VariantGroup[]>(initialGroups)
  const [combinations, setCombinations] = useState<VariantCombination[]>([])
  const [isAddingGroup, setIsAddingGroup] = useState(false)
  const [editingGroup, setEditingGroup] = useState<string | null>(null)
  const [newGroup, setNewGroup] = useState<VariantGroup>({
    name: '',
    type: 'custom',
    isRequired: true,
    options: []
  })

  // Generar todas las combinaciones posibles
  const generateCombinations = () => {
    if (variantGroups.length === 0) {
      setCombinations([])
      return
    }

    const generateCombos = (groups: VariantGroup[]): VariantCombination[] => {
      if (groups.length === 0) return []
      if (groups.length === 1) {
        return groups[0].options.map(option => ({
          options: [{ groupId: groups[0].id!, optionId: option.id! }],
          finalPrice: basePrice + option.priceModifier,
          totalStock: option.stock,
          combinationSku: option.sku
        }))
      }

      const [first, ...rest] = groups
      const restCombos = generateCombos(rest)
      const result: VariantCombination[] = []

      first.options.forEach(option => {
        if (restCombos.length === 0) {
          result.push({
            options: [{ groupId: first.id!, optionId: option.id! }],
            finalPrice: basePrice + option.priceModifier,
            totalStock: option.stock,
            combinationSku: option.sku
          })
        } else {
          restCombos.forEach(combo => {
            const totalPriceModifier = option.priceModifier + 
              combo.options.reduce((sum, opt) => {
                const group = variantGroups.find(g => g.id === opt.groupId)
                const groupOption = group?.options.find(o => o.id === opt.optionId)
                return sum + (groupOption?.priceModifier || 0)
              }, 0)

            result.push({
              options: [
                { groupId: first.id!, optionId: option.id! },
                ...combo.options
              ],
              finalPrice: basePrice + totalPriceModifier,
              totalStock: Math.min(option.stock, combo.totalStock),
              combinationSku: `${option.sku}-${combo.combinationSku}`
            })
          })
        }
      })

      return result
    }

    const groupsWithIds = variantGroups.filter(g => g.id && g.options.length > 0)
    const newCombinations = generateCombos(groupsWithIds)
    setCombinations(newCombinations)
  }

  useEffect(() => {
    generateCombinations()
  }, [variantGroups, basePrice])

  useEffect(() => {
    if (onVariantsChange) {
      onVariantsChange(variantGroups, combinations)
    }
  }, [variantGroups, combinations, onVariantsChange])

  // Agregar nuevo grupo
  const handleAddGroup = () => {
    if (!newGroup.name.trim()) {
      toast.error('El nombre del grupo es obligatorio')
      return
    }

    const group = {
      ...newGroup,
      id: Date.now().toString(),
      options: []
    }

    setVariantGroups([...variantGroups, group])
    setNewGroup({
      name: '',
      type: 'custom',
      isRequired: true,
      options: []
    })
    setIsAddingGroup(false)
    toast.success('Grupo de variantes creado')
  }

  // Agregar opción a un grupo
  const addOptionToGroup = (groupId: string, option: Omit<VariantOption, 'id'>) => {
    if (!option.name.trim() || !option.sku.trim()) {
      toast.error('Nombre y SKU son obligatorios')
      return
    }

    const optionWithId = {
      ...option,
      id: Date.now().toString()
    }

    setVariantGroups(variantGroups.map(group => 
      group.id === groupId 
        ? { ...group, options: [...group.options, optionWithId] }
        : group
    ))
    toast.success('Opción agregada')
  }

  // Eliminar grupo
  const deleteGroup = (groupId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este grupo de variantes?')) {
      setVariantGroups(variantGroups.filter(g => g.id !== groupId))
      toast.success('Grupo eliminado')
    }
  }

  // Eliminar opción
  const deleteOption = (groupId: string, optionId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta opción?')) {
      setVariantGroups(variantGroups.map(group =>
        group.id === groupId
          ? { ...group, options: group.options.filter(o => o.id !== optionId) }
          : group
      ))
      toast.success('Opción eliminada')
    }
  }

  // Obtener nombre de opción por IDs
  const getOptionName = (groupId: string, optionId: string) => {
    const group = variantGroups.find(g => g.id === groupId)
    const option = group?.options.find(o => o.id === optionId)
    return option?.name || 'Opción desconocida'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Sistema de Variantes por Grupos</h3>
        <Button onClick={() => setIsAddingGroup(true)} disabled={isAddingGroup}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Grupo
        </Button>
      </div>

      {/* Formulario nuevo grupo */}
      {isAddingGroup && (
        <Card className="border-2 border-dashed border-green-300">
          <CardHeader>
            <CardTitle>➕ Crear Nuevo Grupo de Variantes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="groupName">Nombre del Grupo *</Label>
                <Input
                  id="groupName"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  placeholder="Ej: Tallas, Colores, Acabados..."
                />
              </div>
              <div>
                <Label htmlFor="groupType">Tipo de Grupo</Label>
                <select
                  id="groupType"
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

            <div className="flex items-center space-x-2">
              <ColoredSwitch
                checked={newGroup.isRequired}
                onCheckedChange={(checked) => setNewGroup({ ...newGroup, isRequired: checked })}
                activeColor="orange"
                inactiveColor="gray"
              />
              <Label>Grupo Obligatorio</Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddingGroup(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleAddGroup}>
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
          {variantGroups.map((group) => (
            <VariantGroupCard
              key={group.id}
              group={group}
              onAddOption={(option) => addOptionToGroup(group.id!, option)}
              onDeleteGroup={() => deleteGroup(group.id!)}
              onDeleteOption={(optionId) => deleteOption(group.id!, optionId)}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No hay grupos de variantes configurados</p>
            <p className="text-sm text-gray-400">
              Crea grupos como "Tallas" o "Colores" para organizar las opciones del producto
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tabla de combinaciones */}
      {combinations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>🔄 Combinaciones Generadas ({combinations.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Combinación</th>
                    <th className="text-left p-2">SKU Final</th>
                    <th className="text-left p-2">Precio Final</th>
                    <th className="text-left p-2">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {combinations.slice(0, 10).map((combo, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <div className="flex flex-wrap gap-1">
                          {combo.options.map((opt, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {getOptionName(opt.groupId, opt.optionId)}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="p-2 font-mono text-xs">{combo.combinationSku}</td>
                      <td className="p-2 font-medium">€{combo.finalPrice.toFixed(2)}</td>
                      <td className="p-2">{combo.totalStock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {combinations.length > 10 && (
                <p className="text-sm text-gray-500 mt-2 text-center">
                  Mostrando 10 de {combinations.length} combinaciones
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Información */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-medium text-blue-900 mb-2">💡 Cómo funciona</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• Crea grupos como "Tallas" y "Colores"</p>
            <p>• Agrega opciones a cada grupo (S, M, L / Rojo, Azul, Verde)</p>
            <p>• El sistema genera automáticamente todas las combinaciones posibles</p>
            <p>• Cada opción puede tener su propio modificador de precio y stock</p>
            <p>• El precio final se calcula: Precio Base + Suma de Modificadores</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Componente para cada grupo de variantes
function VariantGroupCard({
  group,
  onAddOption,
  onDeleteGroup,
  onDeleteOption
}: {
  group: VariantGroup
  onAddOption: (option: Omit<VariantOption, 'id'>) => void
  onDeleteGroup: () => void
  onDeleteOption: (optionId: string) => void
}) {
  const [isAddingOption, setIsAddingOption] = useState(false)
  const [newOption, setNewOption] = useState<Omit<VariantOption, 'id'>>({
    name: '',
    value: '',
    priceModifier: 0,
    stock: 0,
    sku: ''
  })

  const handleAddOption = () => {
    onAddOption(newOption)
    setNewOption({
      name: '',
      value: '',
      priceModifier: 0,
      stock: 0,
      sku: ''
    })
    setIsAddingOption(false)
  }

  const predefinedSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL']
  const predefinedColors = [
    { name: 'Negro', hex: '#000000' },
    { name: 'Blanco', hex: '#FFFFFF' },
    { name: 'Rojo', hex: '#DC2626' },
    { name: 'Azul', hex: '#2563EB' },
    { name: 'Verde', hex: '#16A34A' },
    { name: 'Amarillo', hex: '#EAB308' },
    { name: 'Rosa', hex: '#EC4899' },
    { name: 'Morado', hex: '#9333EA' },
    { name: 'Naranja', hex: '#EA580C' },
    { name: 'Gris', hex: '#6B7280' }
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              {group.type === 'size' && <Tag className="h-4 w-4" />}
              {group.type === 'color' && <Palette className="h-4 w-4" />}
              {group.type === 'custom' && <Tag className="h-4 w-4" />}
              {group.name}
              {group.isRequired && <Badge variant="secondary">Obligatorio</Badge>}
            </CardTitle>
            <p className="text-sm text-gray-500">
              {group.options.length} opciones disponibles
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => setIsAddingOption(true)}
              disabled={isAddingOption}
            >
              <Plus className="h-3 w-3 mr-1" />
              Opción
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onDeleteGroup}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Formulario nueva opción */}
        {isAddingOption && (
          <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 space-y-4">
            <h4 className="font-medium">➕ Nueva Opción para {group.name}</h4>
            
            {/* Botones rápidos para tallas */}
            {group.type === 'size' && (
              <div>
                <Label>Tallas Predefinidas</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {predefinedSizes.map(size => (
                    <Button
                      key={size}
                      variant="outline"
                      size="sm"
                      onClick={() => setNewOption({
                        ...newOption,
                        name: size,
                        value: size,
                        sku: `${size.toLowerCase()}`
                      })}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Botones rápidos para colores */}
            {group.type === 'color' && (
              <div>
                <Label>Colores Predefinidos</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {predefinedColors.map(color => (
                    <button
                      key={color.hex}
                      type="button"
                      onClick={() => setNewOption({
                        ...newOption,
                        name: color.name,
                        value: color.name,
                        colorHex: color.hex,
                        sku: color.name.toLowerCase()
                      })}
                      className="w-8 h-8 rounded-full border-2 border-gray-300 hover:border-gray-500"
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Nombre de la Opción *</Label>
                <Input
                  value={newOption.name}
                  onChange={(e) => setNewOption({ ...newOption, name: e.target.value })}
                  placeholder="Ej: Rojo, Talla M..."
                />
              </div>
              <div>
                <Label>SKU de la Opción *</Label>
                <Input
                  value={newOption.sku}
                  onChange={(e) => setNewOption({ ...newOption, sku: e.target.value })}
                  placeholder="Ej: red, m, custom1..."
                />
              </div>
              <div>
                <Label>Stock</Label>
                <Input
                  type="number"
                  value={newOption.stock}
                  onChange={(e) => setNewOption({ ...newOption, stock: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Modificador de Precio (€)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newOption.priceModifier}
                  onChange={(e) => setNewOption({ ...newOption, priceModifier: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-500">
                  Positivo = precio más alto, Negativo = descuento
                </p>
              </div>
              {group.type === 'color' && (
                <div>
                  <Label>Color Personalizado (Hex)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={newOption.colorHex || '#000000'}
                      onChange={(e) => setNewOption({ ...newOption, colorHex: e.target.value })}
                      className="w-16"
                    />
                    <Input
                      value={newOption.colorHex || ''}
                      onChange={(e) => setNewOption({ ...newOption, colorHex: e.target.value })}
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddingOption(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleAddOption}>
                <Save className="h-4 w-4 mr-2" />
                Agregar Opción
              </Button>
            </div>
          </div>
        )}

        {/* Lista de opciones */}
        {group.options.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {group.options.map((option) => (
              <div
                key={option.id}
                className="border rounded-lg p-3 hover:bg-gray-50"
              >
                <div className="flex justify-between items-start mb-2">
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
                    onClick={() => onDeleteOption(option.id!)}
                    className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>SKU:</span>
                    <code className="text-xs">{option.sku}</code>
                  </div>
                  <div className="flex justify-between">
                    <span>Precio:</span>
                    <span className={option.priceModifier !== 0 ? 
                      (option.priceModifier > 0 ? 'text-red-600' : 'text-green-600') : ''}>
                      {option.priceModifier > 0 ? '+' : ''}
                      €{option.priceModifier.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Stock:</span>
                    <span className={option.stock < 10 ? 'text-red-600' : ''}>
                      {option.stock}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <p className="text-sm">No hay opciones en este grupo</p>
            <p className="text-xs">Agrega opciones como tallas, colores, etc.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}