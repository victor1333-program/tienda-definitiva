"use client"

import { useState, useEffect } from "react"
import { 
  Copy, 
  Link, 
  Unlink, 
  ArrowLeftRight, 
  Eye, 
  EyeOff,
  RefreshCw,
  Settings
} from "lucide-react"

interface Side {
  id: string
  name: string
  elements: any[]
  visible: boolean
}

interface SyncRule {
  id: string
  sourceElementId: string
  targetElementId: string
  sourceSide: string
  targetSide: string
  syncProperties: {
    position: boolean
    size: boolean
    rotation: boolean
    text: boolean
    color: boolean
    style: boolean
  }
  active: boolean
}

interface SidesSynchronizationProps {
  sides: Side[]
  onSidesChange: (sides: Side[]) => void
  currentSide: string
  onSideChange: (sideId: string) => void
  elements: any[]
  onElementsChange: (elements: any[]) => void
}

export default function SidesSynchronization({
  sides,
  onSidesChange,
  currentSide,
  onSideChange,
  elements,
  onElementsChange
}: SidesSynchronizationProps) {
  const [syncRules, setSyncRules] = useState<SyncRule[]>([])
  const [showSyncSettings, setShowSyncSettings] = useState(false)
  const [selectedSourceElement, setSelectedSourceElement] = useState<string | null>(null)

  // Inicializar lados predeterminados si no existen
  useEffect(() => {
    if (sides.length === 0) {
      const defaultSides: Side[] = [
        { id: 'front', name: 'Frente', elements: [], visible: true },
        { id: 'back', name: 'Atrás', elements: [], visible: false }
      ]
      onSidesChange(defaultSides)
    }
  }, [sides.length, onSidesChange])

  // Cambiar de lado
  const switchSide = (sideId: string) => {
    // Guardar elementos del lado actual
    const updatedSides = sides.map(side => 
      side.id === currentSide 
        ? { ...side, elements: elements }
        : side
    )
    
    // Cargar elementos del nuevo lado
    const newSide = updatedSides.find(side => side.id === sideId)
    if (newSide) {
      onElementsChange(newSide.elements)
      onSideChange(sideId)
      onSidesChange(updatedSides)
    }
  }

  // Duplicar elementos al lado opuesto
  const duplicateToOtherSide = () => {
    const targetSideId = currentSide === 'front' ? 'back' : 'front'
    const updatedSides = sides.map(side => {
      if (side.id === targetSideId) {
        // Duplicar elementos con nuevos IDs
        const duplicatedElements = elements.map(element => ({
          ...element,
          id: `${element.id}_${targetSideId}`,
          // Para el lado trasero, invertir horizontalmente
          x: targetSideId === 'back' ? 400 - element.x - element.width : element.x
        }))
        return { ...side, elements: duplicatedElements }
      } else if (side.id === currentSide) {
        return { ...side, elements: elements }
      }
      return side
    })
    
    onSidesChange(updatedSides)
  }

  // Crear regla de sincronización
  const createSyncRule = (sourceElementId: string, targetSide: string) => {
    // Buscar elemento correspondiente en el lado objetivo
    const targetSideData = sides.find(side => side.id === targetSide)
    if (!targetSideData) return

    // Intentar encontrar elemento correspondiente por nombre/tipo
    const sourceElement = elements.find(el => el.id === sourceElementId)
    if (!sourceElement) return

    const targetElement = targetSideData.elements.find(el => 
      el.type === sourceElement.type && 
      el.text === sourceElement.text // Para elementos de texto
    )

    if (targetElement) {
      const newRule: SyncRule = {
        id: `sync_${Date.now()}`,
        sourceElementId,
        targetElementId: targetElement.id,
        sourceSide: currentSide,
        targetSide,
        syncProperties: {
          position: true,
          size: true,
          rotation: true,
          text: true,
          color: true,
          style: true
        },
        active: true
      }
      
      setSyncRules([...syncRules, newRule])
    }
  }

  // Aplicar sincronización
  const applySynchronization = (sourceElement: any) => {
    const activeRules = syncRules.filter(rule => 
      rule.sourceElementId === sourceElement.id && 
      rule.sourceSide === currentSide &&
      rule.active
    )

    activeRules.forEach(rule => {
      const targetSideData = sides.find(side => side.id === rule.targetSide)
      if (!targetSideData) return

      const updatedTargetElements = targetSideData.elements.map(element => {
        if (element.id === rule.targetElementId) {
          const updates: any = {}

          if (rule.syncProperties.position) {
            updates.x = rule.targetSide === 'back' ? 
              400 - sourceElement.x - sourceElement.width : sourceElement.x
            updates.y = sourceElement.y
          }
          
          if (rule.syncProperties.size) {
            updates.width = sourceElement.width
            updates.height = sourceElement.height
          }
          
          if (rule.syncProperties.rotation) {
            updates.rotation = sourceElement.rotation
          }
          
          if (rule.syncProperties.text && sourceElement.text) {
            updates.text = sourceElement.text
          }
          
          if (rule.syncProperties.color) {
            updates.color = sourceElement.color
            updates.fillColor = sourceElement.fillColor
            updates.strokeColor = sourceElement.strokeColor
          }
          
          if (rule.syncProperties.style) {
            updates.fontSize = sourceElement.fontSize
            updates.fontFamily = sourceElement.fontFamily
            updates.fontWeight = sourceElement.fontWeight
            updates.textAlign = sourceElement.textAlign
          }

          return { ...element, ...updates }
        }
        return element
      })

      // Actualizar el lado objetivo
      const updatedSides = sides.map(side => 
        side.id === rule.targetSide 
          ? { ...side, elements: updatedTargetElements }
          : side
      )
      onSidesChange(updatedSides)
    })
  }

  // Alternar visibilidad de lado
  const toggleSideVisibility = (sideId: string) => {
    const updatedSides = sides.map(side => 
      side.id === sideId 
        ? { ...side, visible: !side.visible }
        : side
    )
    onSidesChange(updatedSides)
  }

  // Eliminar regla de sincronización
  const removeSyncRule = (ruleId: string) => {
    setSyncRules(syncRules.filter(rule => rule.id !== ruleId))
  }

  const otherSides = sides.filter(side => side.id !== currentSide)
  const currentSideData = sides.find(side => side.id === currentSide)

  return (
    <div className="space-y-4">
      {/* Header con controles de lado */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <ArrowLeftRight className="h-4 w-4" />
          Gestión de Lados
        </h3>
        <button
          onClick={() => setShowSyncSettings(!showSyncSettings)}
          className="text-gray-600 hover:text-gray-800"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>

      {/* Selector de lados */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        {sides.map((side) => (
          <div
            key={side.id}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              currentSide === side.id 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <button
              onClick={() => switchSide(side.id)}
              className="flex-1 text-center"
            >
              {side.name}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleSideVisibility(side.id)
              }}
              className="text-gray-400 hover:text-gray-600 ml-2"
            >
              {side.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            </button>
          </div>
        ))}
      </div>

      {/* Acciones rápidas */}
      <div className="grid grid-cols-1 gap-2">
        <button
          onClick={duplicateToOtherSide}
          className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Copy className="h-4 w-4" />
          Duplicar al lado opuesto
        </button>
        
        {otherSides.length > 0 && (
          <button
            onClick={() => {
              // Crear sincronización automática para todos los elementos
              elements.forEach(element => {
                otherSides.forEach(side => {
                  createSyncRule(element.id, side.id)
                })
              })
            }}
            className="w-full bg-green-100 hover:bg-green-200 text-green-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Link className="h-4 w-4" />
            Sincronizar todo
          </button>
        )}
      </div>

      {/* Configuración de sincronización */}
      {showSyncSettings && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Reglas de Sincronización</h4>
          
          {syncRules.length > 0 ? (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {syncRules.map((rule) => (
                <div key={rule.id} className="bg-white border border-gray-200 rounded p-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-700">
                      {rule.sourceSide} → {rule.targetSide}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          const updated = syncRules.map(r => 
                            r.id === rule.id ? { ...r, active: !r.active } : r
                          )
                          setSyncRules(updated)
                        }}
                        className={`p-1 rounded ${
                          rule.active ? 'text-green-600' : 'text-gray-400'
                        }`}
                        title={rule.active ? 'Activo' : 'Inactivo'}
                      >
                        {rule.active ? <Link className="h-3 w-3" /> : <Unlink className="h-3 w-3" />}
                      </button>
                      <button
                        onClick={() => removeSyncRule(rule.id)}
                        className="p-1 rounded text-red-600 hover:text-red-700"
                        title="Eliminar"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-1 text-xs">
                    {Object.entries(rule.syncProperties).map(([prop, enabled]) => (
                      <label key={prop} className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={(e) => {
                            const updated = syncRules.map(r => 
                              r.id === rule.id 
                                ? { 
                                    ...r, 
                                    syncProperties: { 
                                      ...r.syncProperties, 
                                      [prop]: e.target.checked 
                                    } 
                                  }
                                : r
                            )
                            setSyncRules(updated)
                          }}
                          className="rounded"
                        />
                        <span className="text-gray-600 capitalize">{prop}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 text-center py-2">
              No hay reglas de sincronización configuradas
            </p>
          )}
        </div>
      )}

      {/* Info del lado actual */}
      <div className="text-xs text-gray-500">
        <p>Lado actual: <span className="font-medium">{currentSideData?.name}</span></p>
        <p>Elementos: <span className="font-medium">{elements.length}</span></p>
        {syncRules.filter(r => r.sourceSide === currentSide && r.active).length > 0 && (
          <p>Sincronizaciones activas: <span className="font-medium text-green-600">
            {syncRules.filter(r => r.sourceSide === currentSide && r.active).length}
          </span></p>
        )}
      </div>
    </div>
  )
}