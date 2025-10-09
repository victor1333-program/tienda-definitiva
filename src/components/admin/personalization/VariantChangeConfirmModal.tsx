"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { 
  X, 
  Users, 
  User, 
  Palette, 
  Ruler,
  AlertCircle,
  Check
} from "lucide-react"

interface ProductVariant {
  id: string
  sku: string
  size?: string
  colorName?: string
  colorHex?: string
  colorDisplay?: string
  material?: string
  stock?: number
  price?: number
  isActive?: boolean
  images?: string
}

interface VariantChangeConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (applyTo: 'current' | 'all' | 'same-size' | 'same-color' | 'same-material') => void
  currentVariant: ProductVariant
  allVariants: ProductVariant[]
  changeType: 'image' | 'area'
  changeDescription: string
}

export default function VariantChangeConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  currentVariant,
  allVariants,
  changeType,
  changeDescription
}: VariantChangeConfirmModalProps) {
  const [selectedOption, setSelectedOption] = useState<'current' | 'all' | 'same-size' | 'same-color' | 'same-material'>('current')

  // Resetear el estado cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      console.log('🔄 Modal abierto, reseteando selectedOption a "current"')
      setSelectedOption('current')
    }
  }, [isOpen])

  // Debug: mostrar el valor actual del selectedOption
  console.log('🎛️ Estado actual del modal:', { selectedOption, isOpen })

  if (!isOpen) return null

  // Funciones para contar variantes afectadas
  const countVariantsWithSameSize = () => {
    if (!currentVariant.size) return 0
    return allVariants.filter(v => v.size === currentVariant.size).length
  }

  const countVariantsWithSameColor = () => {
    if (!currentVariant.colorName) return 0
    return allVariants.filter(v => v.colorName === currentVariant.colorName).length
  }

  const countVariantsWithSameMaterial = () => {
    if (!currentVariant.material) return 0
    return allVariants.filter(v => v.material === currentVariant.material).length
  }

  const getVariantDisplayName = (variant: ProductVariant) => {
    const values = []
    if (variant.colorName) values.push(variant.colorName)
    if (variant.size) values.push(variant.size)
    if (variant.material) values.push(variant.material)
    return values.length > 0 ? values.join(' - ') : variant.sku
  }

  const handleConfirm = () => {
    // Debug: mostrar qué opción fue seleccionada y cuántas variantes deberían ser afectadas
    console.log('📤 Modal confirmando cambio:', {
      selectedOption,
      selectedOptionType: typeof selectedOption,
      currentVariant: {
        id: currentVariant.id,
        sku: currentVariant.sku,
        colorName: currentVariant.colorName,
        size: currentVariant.size,
        material: currentVariant.material
      },
      totalVariants: allVariants.length,
      expectedAffected: selectedOption === 'all' ? allVariants.length :
                        selectedOption === 'same-color' ? countVariantsWithSameColor() :
                        selectedOption === 'same-size' ? countVariantsWithSameSize() :
                        selectedOption === 'same-material' ? countVariantsWithSameMaterial() : 1
    })

    // Asegurar que tenemos un valor válido
    const finalOption = selectedOption || 'current'
    console.log('📤 Enviando opción final:', finalOption)
    
    onConfirm(finalOption)
    onClose()
  }

  return (
    <div className="fixed top-20 left-56 right-0 bottom-0 bg-black/50 flex items-center justify-center z-[70] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Aplicar Cambios a Variantes
              </h2>
              <p className="text-sm text-gray-600">
                {changeType === 'image' ? 'Cambio de imagen' : 'Cambio de área'} en {getVariantDisplayName(currentVariant)}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Descripción del cambio */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-blue-900 text-sm">Cambio Realizado</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-blue-800 text-sm">{changeDescription}</p>
            </CardContent>
          </Card>

          {/* Opciones de aplicación */}
          <div>
            <h3 className="text-lg font-semibold mb-4">¿A qué variantes aplicar este cambio?</h3>
            
            <RadioGroup 
              value={selectedOption} 
              name="variant-selection"
              onValueChange={(value: 'current' | 'all' | 'same-size' | 'same-color' | 'same-material') => {
                console.log('🔄 Cambiando selectedOption de', selectedOption, 'a', value)
                setSelectedOption(value)
              }}
            >
              {/* Solo variante actual */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="current" id="current" />
                  <Label htmlFor="current" className="flex items-center gap-2 cursor-pointer">
                    <User className="h-4 w-4 text-gray-500" />
                    <span>Cambiar solo en la variante actual</span>
                    <Badge variant="outline" className="ml-auto">
                      1 variante
                    </Badge>
                  </Label>
                </div>
                <p className="text-sm text-gray-600 ml-6">
                  Solo afectará a: <strong>{getVariantDisplayName(currentVariant)}</strong>
                </p>
              </div>

              {/* Todas las variantes */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all" className="flex items-center gap-2 cursor-pointer">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span>Cambiar en todas las variantes</span>
                    <Badge variant="outline" className="ml-auto">
                      {allVariants.length} variantes
                    </Badge>
                  </Label>
                </div>
                <p className="text-sm text-gray-600 ml-6">
                  Afectará a todas las {allVariants.length} variantes del producto
                </p>
              </div>

              {/* Misma talla */}
              {currentVariant.size && countVariantsWithSameSize() > 1 && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="same-size" id="same-size" />
                    <Label htmlFor="same-size" className="flex items-center gap-2 cursor-pointer">
                      <Ruler className="h-4 w-4 text-gray-500" />
                      <span>Cambiar en todas las variantes con talla <strong>{currentVariant.size}</strong></span>
                      <Badge variant="outline" className="ml-auto">
                        {countVariantsWithSameSize()} variantes
                      </Badge>
                    </Label>
                  </div>
                  <p className="text-sm text-gray-600 ml-6">
                    Afectará a todas las variantes con talla {currentVariant.size}
                  </p>
                </div>
              )}

              {/* Mismo color */}
              {currentVariant.colorName && countVariantsWithSameColor() > 1 && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="same-color" id="same-color" />
                    <Label htmlFor="same-color" className="flex items-center gap-2 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Palette className="h-4 w-4 text-gray-500" />
                        <span>Cambiar en todas las variantes con color <strong>{currentVariant.colorName}</strong></span>
                        {currentVariant.colorHex && (
                          <div 
                            className="w-4 h-4 rounded-full border border-gray-300"
                            style={{ backgroundColor: currentVariant.colorHex }}
                          />
                        )}
                      </div>
                      <Badge variant="outline" className="ml-auto">
                        {countVariantsWithSameColor()} variantes
                      </Badge>
                    </Label>
                  </div>
                  <p className="text-sm text-gray-600 ml-6">
                    Afectará a todas las variantes con color {currentVariant.colorName}
                  </p>
                </div>
              )}

              {/* Mismo material */}
              {currentVariant.material && countVariantsWithSameMaterial() > 1 && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="same-material" id="same-material" />
                    <Label htmlFor="same-material" className="flex items-center gap-2 cursor-pointer">
                      <div className="w-4 h-4 bg-gray-400 rounded" />
                      <span>Cambiar en todas las variantes con material <strong>{currentVariant.material}</strong></span>
                      <Badge variant="outline" className="ml-auto">
                        {countVariantsWithSameMaterial()} variantes
                      </Badge>
                    </Label>
                  </div>
                  <p className="text-sm text-gray-600 ml-6">
                    Afectará a todas las variantes con material {currentVariant.material}
                  </p>
                </div>
              )}
            </RadioGroup>
          </div>

          {/* Vista previa de variantes afectadas */}
          {selectedOption !== 'current' && (
            <Card className="bg-gray-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-700">
                  Variantes que serán afectadas
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {selectedOption === 'all' && allVariants.map(variant => (
                    <div key={variant.id} className="text-sm text-gray-600 flex items-center justify-between">
                      <span>{getVariantDisplayName(variant)}</span>
                      <Badge variant="secondary" className="text-xs">{variant.sku}</Badge>
                    </div>
                  ))}
                  
                  {selectedOption === 'same-size' && allVariants
                    .filter(v => v.size === currentVariant.size)
                    .map(variant => (
                      <div key={variant.id} className="text-sm text-gray-600 flex items-center justify-between">
                        <span>{getVariantDisplayName(variant)}</span>
                        <Badge variant="secondary" className="text-xs">{variant.sku}</Badge>
                      </div>
                    ))}
                  
                  {selectedOption === 'same-color' && allVariants
                    .filter(v => v.colorName === currentVariant.colorName)
                    .map(variant => (
                      <div key={variant.id} className="text-sm text-gray-600 flex items-center justify-between">
                        <span>{getVariantDisplayName(variant)}</span>
                        <Badge variant="secondary" className="text-xs">{variant.sku}</Badge>
                      </div>
                    ))}
                  
                  {selectedOption === 'same-material' && allVariants
                    .filter(v => v.material === currentVariant.material)
                    .map(variant => (
                      <div key={variant.id} className="text-sm text-gray-600 flex items-center justify-between">
                        <span>{getVariantDisplayName(variant)}</span>
                        <Badge variant="secondary" className="text-xs">{variant.sku}</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} className="bg-orange-600 hover:bg-orange-700">
            <Check className="h-4 w-4 mr-2" />
            Aplicar Cambios
          </Button>
        </div>
      </div>
    </div>
  )
}