'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { toast } from "react-hot-toast"
import {
  ArrowLeft,
  Save,
  Package,
  Building2,
  AlertTriangle,
  Info
} from "lucide-react"

interface MaterialFormData {
  name: string
  description: string
  type: string
  unit: string
  costPerUnit: number
  currentStock: number
  minimumStock: number
  maximumStock: number
  supplierId: string
  location: string
  notes: string
}

export default function NewMaterialPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<MaterialFormData>({
    name: '',
    description: '',
    type: 'fabric',
    unit: 'metros',
    costPerUnit: 0,
    currentStock: 0,
    minimumStock: 5,
    maximumStock: 100,
    supplierId: '',
    location: '',
    notes: ''
  })

  const handleInputChange = (field: keyof MaterialFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('El nombre del material es requerido')
      return false
    }

    if (formData.costPerUnit <= 0) {
      toast.error('El costo por unidad debe ser mayor a 0')
      return false
    }

    if (formData.minimumStock < 0 || formData.maximumStock < 0 || formData.currentStock < 0) {
      toast.error('Los valores de stock no pueden ser negativos')
      return false
    }

    if (formData.minimumStock >= formData.maximumStock) {
      toast.error('El stock mínimo debe ser menor al stock máximo')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch('/api/materials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          supplierId: formData.supplierId || null
        })
      })

      if (response.ok) {
        const material = await response.json()
        toast.success('Material creado exitosamente')
        router.push(`/admin/production/material-stock`)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al crear el material')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al crear el material')
    } finally {
      setIsLoading(false)
    }
  }

  const materialTypes = [
    { value: 'fabric', label: 'Tela/Textil' },
    { value: 'vinyl', label: 'Vinilo' },
    { value: 'paper', label: 'Papel' },
    { value: 'ink', label: 'Tinta' },
    { value: 'adhesive', label: 'Adhesivo' },
    { value: 'packaging', label: 'Empaque' },
    { value: 'hardware', label: 'Hardware' },
    { value: 'other', label: 'Otro' }
  ]

  const units = [
    { value: 'metros', label: 'Metros' },
    { value: 'centimetros', label: 'Centímetros' },
    { value: 'litros', label: 'Litros' },
    { value: 'mililitros', label: 'Mililitros' },
    { value: 'kilogramos', label: 'Kilogramos' },
    { value: 'gramos', label: 'Gramos' },
    { value: 'unidades', label: 'Unidades' },
    { value: 'hojas', label: 'Hojas' },
    { value: 'rollos', label: 'Rollos' }
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📦 Nuevo Material</h1>
            <p className="text-gray-600 mt-1">
              Agrega un nuevo material al inventario de producción
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Información Básica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Material *
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ej: Tela Cotton Premium"
                  required
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Material
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {materialTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Descripción detallada del material..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Cost and Units */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              Costo y Unidades
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unidad de Medida
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => handleInputChange('unit', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {units.map(unit => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Costo por Unidad (€) *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.costPerUnit}
                  onChange={(e) => handleInputChange('costPerUnit', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  required
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stock Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Gestión de Stock
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Actual
                </label>
                <Input
                  type="number"
                  min="0"
                  value={formData.currentStock}
                  onChange={(e) => handleInputChange('currentStock', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Mínimo
                </label>
                <Input
                  type="number"
                  min="0"
                  value={formData.minimumStock}
                  onChange={(e) => handleInputChange('minimumStock', parseInt(e.target.value) || 0)}
                  placeholder="5"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Máximo
                </label>
                <Input
                  type="number"
                  min="0"
                  value={formData.maximumStock}
                  onChange={(e) => handleInputChange('maximumStock', parseInt(e.target.value) || 0)}
                  placeholder="100"
                  className="w-full"
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <Info className="w-5 h-5 text-blue-400 mr-2 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900">Información de Stock</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    El stock mínimo se usa para alertas automáticas cuando el inventario está bajo.
                    El stock máximo ayuda a controlar las compras excesivas.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Información Adicional
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ubicación/Almacén
                </label>
                <Input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Ej: Almacén A - Estante 3"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Proveedor (Opcional)
                </label>
                <Input
                  type="text"
                  value={formData.supplierId}
                  onChange={(e) => handleInputChange('supplierId', e.target.value)}
                  placeholder="ID del proveedor"
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas Adicionales
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Información adicional sobre el material (cuidados especiales, restricciones, etc.)"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                * Campos requeridos
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !formData.name.trim() || formData.costPerUnit <= 0}
                  className="min-w-[120px]"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Crear Material
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}