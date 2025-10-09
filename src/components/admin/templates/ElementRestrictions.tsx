"use client"

import { useState } from "react"
import { 
  Settings, 
  Type, 
  Palette, 
  Image, 
  Lock, 
  Unlock,
  AlertTriangle,
  Plus,
  Trash2,
  X
} from "lucide-react"

interface Restriction {
  id: string
  type: 'text' | 'color' | 'image' | 'size'
  elementId?: string // Si es específico para un elemento
  global: boolean
  rules: {
    // Text restrictions
    maxCharacters?: number
    minCharacters?: number
    allowedFonts?: string[]
    forbiddenWords?: string[]
    
    // Color restrictions
    allowedColors?: string[]
    colorPalette?: string[]
    mustUseFromPalette?: boolean
    
    // Image restrictions
    maxFileSize?: number // in MB
    allowedFormats?: string[]
    minResolution?: { width: number, height: number }
    
    // Size restrictions
    maxWidth?: number
    maxHeight?: number
    minWidth?: number
    minHeight?: number
    aspectRatioLocked?: boolean
  }
}

interface ElementRestrictionsProps {
  elementId: string | null
  onRestrictionsChange: (restrictions: Restriction[]) => void
  existingRestrictions: Restriction[]
}

export default function ElementRestrictions({
  elementId,
  onRestrictionsChange,
  existingRestrictions
}: ElementRestrictionsProps) {
  const [restrictions, setRestrictions] = useState<Restriction[]>(existingRestrictions)
  const [showAddRestriction, setShowAddRestriction] = useState(false)
  const [newRestrictionType, setNewRestrictionType] = useState<'text' | 'color' | 'image' | 'size'>('text')

  // Colores predefinidos para paletas
  const predefinedColors = [
    '#FF6B35', '#F7931E', '#FFD23F', '#06FFA5', '#4ECDC4',
    '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF',
    '#00D2D3', '#FF6B9D', '#C44569', '#F8B500', '#6C5CE7',
    '#A55EEA', '#26DE81', '#FD79A8', '#FDCB6E', '#6C5CE7'
  ]

  const addRestriction = () => {
    const newRestriction: Restriction = {
      id: `restriction_${Date.now()}`,
      type: newRestrictionType,
      elementId: elementId || undefined,
      global: !elementId,
      rules: {}
    }

    // Valores por defecto según el tipo
    switch (newRestrictionType) {
      case 'text':
        newRestriction.rules = {
          maxCharacters: 50,
          minCharacters: 1,
          allowedFonts: ['Arial', 'Helvetica', 'Times New Roman'],
          forbiddenWords: []
        }
        break
      case 'color':
        newRestriction.rules = {
          allowedColors: predefinedColors.slice(0, 5),
          mustUseFromPalette: true
        }
        break
      case 'image':
        newRestriction.rules = {
          maxFileSize: 5,
          allowedFormats: ['jpg', 'png', 'svg'],
          minResolution: { width: 300, height: 300 }
        }
        break
      case 'size':
        newRestriction.rules = {
          maxWidth: 400,
          maxHeight: 400,
          minWidth: 50,
          minHeight: 50,
          aspectRatioLocked: false
        }
        break
    }

    const updated = [...restrictions, newRestriction]
    setRestrictions(updated)
    onRestrictionsChange(updated)
    setShowAddRestriction(false)
  }

  const updateRestriction = (id: string, rules: Partial<Restriction['rules']>) => {
    const updated = restrictions.map(r => 
      r.id === id ? { ...r, rules: { ...r.rules, ...rules } } : r
    )
    setRestrictions(updated)
    onRestrictionsChange(updated)
  }

  const deleteRestriction = (id: string) => {
    const updated = restrictions.filter(r => r.id !== id)
    setRestrictions(updated)
    onRestrictionsChange(updated)
  }

  const getRestrictionIcon = (type: string) => {
    switch (type) {
      case 'text': return <Type className="h-4 w-4" />
      case 'color': return <Palette className="h-4 w-4" />
      case 'image': return <Image className="h-4 w-4" />
      case 'size': return <Settings className="h-4 w-4" />
      default: return <Settings className="h-4 w-4" />
    }
  }

  const getRestrictionTitle = (type: string) => {
    switch (type) {
      case 'text': return 'Restricciones de Texto'
      case 'color': return 'Restricciones de Color'
      case 'image': return 'Restricciones de Imagen'
      case 'size': return 'Restricciones de Tamaño'
      default: return 'Restricción'
    }
  }

  const relevantRestrictions = elementId 
    ? restrictions.filter(r => r.elementId === elementId || r.global)
    : restrictions.filter(r => r.global)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Lock className="h-4 w-4" />
          Restricciones {elementId ? 'del Elemento' : 'Globales'}
        </h3>
        <button
          onClick={() => setShowAddRestriction(true)}
          className="text-orange-600 hover:text-orange-700 text-sm flex items-center gap-1"
        >
          <Plus className="h-3 w-3" />
          Agregar
        </button>
      </div>

      {/* Add Restriction Modal */}
      {showAddRestriction && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">Nueva Restricción</h4>
            <button
              onClick={() => setShowAddRestriction(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Tipo</label>
            <select
              value={newRestrictionType}
              onChange={(e) => setNewRestrictionType(e.target.value as any)}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
            >
              <option value="text">Texto</option>
              <option value="color">Color</option>
              <option value="image">Imagen</option>
              <option value="size">Tamaño</option>
            </select>
          </div>

          <button
            onClick={addRestriction}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded text-xs font-medium"
          >
            Crear Restricción
          </button>
        </div>
      )}

      {/* Existing Restrictions */}
      <div className="space-y-3 max-h-60 overflow-y-auto">
        {relevantRestrictions.map((restriction) => (
          <div key={restriction.id} className="bg-white border border-gray-200 rounded-lg p-3 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getRestrictionIcon(restriction.type)}
                <span className="text-sm font-medium text-gray-900">
                  {getRestrictionTitle(restriction.type)}
                </span>
                {restriction.global && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    Global
                  </span>
                )}
              </div>
              <button
                onClick={() => deleteRestriction(restriction.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>

            {/* Text Restrictions */}
            {restriction.type === 'text' && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Mín. caracteres</label>
                    <input
                      type="number"
                      value={restriction.rules.minCharacters || 1}
                      onChange={(e) => updateRestriction(restriction.id, { 
                        minCharacters: parseInt(e.target.value) || 1 
                      })}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Máx. caracteres</label>
                    <input
                      type="number"
                      value={restriction.rules.maxCharacters || 50}
                      onChange={(e) => updateRestriction(restriction.id, { 
                        maxCharacters: parseInt(e.target.value) || 50 
                      })}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Fuentes permitidas</label>
                  <select
                    multiple
                    value={restriction.rules.allowedFonts || []}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, option => option.value)
                      updateRestriction(restriction.id, { allowedFonts: selected })
                    }}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    size={3}
                  >
                    <option value="Arial">Arial</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Verdana">Verdana</option>
                  </select>
                </div>
              </div>
            )}

            {/* Color Restrictions */}
            {restriction.type === 'color' && (
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={restriction.rules.mustUseFromPalette || false}
                    onChange={(e) => updateRestriction(restriction.id, { 
                      mustUseFromPalette: e.target.checked 
                    })}
                    className="rounded"
                  />
                  <span className="font-medium text-gray-700">Solo usar colores de la paleta</span>
                </label>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Paleta de colores permitidos</label>
                  <div className="grid grid-cols-5 gap-1">
                    {predefinedColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => {
                          const allowedColors = restriction.rules.allowedColors || []
                          const isSelected = allowedColors.includes(color)
                          const updated = isSelected
                            ? allowedColors.filter(c => c !== color)
                            : [...allowedColors, color]
                          updateRestriction(restriction.id, { allowedColors: updated })
                        }}
                        className={`w-6 h-6 rounded border-2 ${
                          (restriction.rules.allowedColors || []).includes(color)
                            ? 'border-gray-900' 
                            : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Image Restrictions */}
            {restriction.type === 'image' && (
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tamaño máximo (MB)</label>
                  <input
                    type="number"
                    value={restriction.rules.maxFileSize || 5}
                    onChange={(e) => updateRestriction(restriction.id, { 
                      maxFileSize: parseFloat(e.target.value) || 5 
                    })}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    min="0.1"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Formatos permitidos</label>
                  <div className="flex gap-2">
                    {['jpg', 'png', 'svg', 'gif'].map(format => (
                      <label key={format} className="flex items-center gap-1 text-xs">
                        <input
                          type="checkbox"
                          checked={(restriction.rules.allowedFormats || []).includes(format)}
                          onChange={(e) => {
                            const formats = restriction.rules.allowedFormats || []
                            const updated = e.target.checked
                              ? [...formats, format]
                              : formats.filter(f => f !== format)
                            updateRestriction(restriction.id, { allowedFormats: updated })
                          }}
                          className="rounded"
                        />
                        {format.toUpperCase()}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Size Restrictions */}
            {restriction.type === 'size' && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Ancho mín.</label>
                    <input
                      type="number"
                      value={restriction.rules.minWidth || 50}
                      onChange={(e) => updateRestriction(restriction.id, { 
                        minWidth: parseInt(e.target.value) || 50 
                      })}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Ancho máx.</label>
                    <input
                      type="number"
                      value={restriction.rules.maxWidth || 400}
                      onChange={(e) => updateRestriction(restriction.id, { 
                        maxWidth: parseInt(e.target.value) || 400 
                      })}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                      min="1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Alto mín.</label>
                    <input
                      type="number"
                      value={restriction.rules.minHeight || 50}
                      onChange={(e) => updateRestriction(restriction.id, { 
                        minHeight: parseInt(e.target.value) || 50 
                      })}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Alto máx.</label>
                    <input
                      type="number"
                      value={restriction.rules.maxHeight || 400}
                      onChange={(e) => updateRestriction(restriction.id, { 
                        maxHeight: parseInt(e.target.value) || 400 
                      })}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                      min="1"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={restriction.rules.aspectRatioLocked || false}
                    onChange={(e) => updateRestriction(restriction.id, { 
                      aspectRatioLocked: e.target.checked 
                    })}
                    className="rounded"
                  />
                  <span className="font-medium text-gray-700">Bloquear proporción de aspecto</span>
                </label>
              </div>
            )}
          </div>
        ))}

        {relevantRestrictions.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            <AlertTriangle className="h-6 w-6 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay restricciones configuradas</p>
          </div>
        )}
      </div>
    </div>
  )
}