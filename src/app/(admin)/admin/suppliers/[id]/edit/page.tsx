'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-hot-toast"
import {
  Building2,
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  FileText,
  ArrowLeft,
  Save,
  Eye,
  EyeOff
} from "lucide-react"

interface SupplierFormData {
  name: string
  contactName: string
  email: string
  phone: string
  address: string
  website: string
  notes: string
  isActive: boolean
}

export default function EditSupplierPage() {
  const params = useParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [formData, setFormData] = useState<SupplierFormData>({
    name: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    notes: '',
    isActive: true
  })

  useEffect(() => {
    if (params.id) {
      loadSupplier()
    }
  }, [params.id])

  const loadSupplier = async () => {
    setIsLoadingData(true)
    try {
      const response = await fetch(`/api/suppliers/${params.id}`)
      if (response.ok) {
        const supplier = await response.json()
        setFormData({
          name: supplier.name || '',
          contactName: supplier.contactName || '',
          email: supplier.email || '',
          phone: supplier.phone || '',
          address: supplier.address || '',
          website: supplier.website || '',
          notes: supplier.notes || '',
          isActive: supplier.isActive
        })
        // Show advanced section if there's additional data
        if (supplier.address || supplier.website || supplier.notes) {
          setShowAdvanced(true)
        }
      } else {
        toast.error('Error al cargar el proveedor')
        router.push('/admin/suppliers')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al cargar el proveedor')
    } finally {
      setIsLoadingData(false)
    }
  }

  const handleInputChange = (field: keyof SupplierFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('El nombre del proveedor es requerido')
      return false
    }

    if (formData.email && !formData.email.includes('@')) {
      toast.error('El email debe tener un formato válido')
      return false
    }

    if (formData.website && !formData.website.startsWith('http')) {
      toast.error('El sitio web debe comenzar con http:// o https://')
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
      const response = await fetch(`/api/suppliers/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          email: formData.email || undefined,
          website: formData.website || undefined,
          contactName: formData.contactName || undefined,
          phone: formData.phone || undefined,
          address: formData.address || undefined,
          notes: formData.notes || undefined
        })
      })

      if (response.ok) {
        toast.success('Proveedor actualizado exitosamente')
        router.push(`/admin/suppliers/${params.id}`)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al actualizar el proveedor')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al actualizar el proveedor')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando proveedor...</p>
        </div>
      </div>
    )
  }

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
            <h1 className="text-3xl font-bold text-gray-900">✏️ Editar Proveedor</h1>
            <p className="text-gray-600 mt-1">
              Modifica la información del proveedor
            </p>
          </div>
        </div>
        <Badge className={formData.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
          {formData.isActive ? 'Activo' : 'Inactivo'}
        </Badge>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Información Básica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Proveedor *
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ej: Textiles Madrid S.L."
                  required
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Persona de Contacto
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    value={formData.contactName}
                    onChange={(e) => handleInputChange('contactName', e.target.value)}
                    placeholder="Ej: Juan Pérez"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email de Contacto
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="contacto@proveedor.com"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+34 XXX XXX XXX"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Estado del Proveedor</h3>
                <p className="text-sm text-gray-600">
                  {formData.isActive ? 'El proveedor estará activo y disponible para pedidos' : 'El proveedor estará inactivo'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleInputChange('isActive', !formData.isActive)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                  formData.isActive ? 'bg-orange-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.isActive ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Información Adicional
              </CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                {showAdvanced ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    Ocultar
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Mostrar
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          {showAdvanced && (
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sitio Web
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://www.proveedor.com"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección Completa
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                  <textarea
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Dirección completa del proveedor..."
                    rows={3}
                    className="w-full pl-10 pt-2 pb-2 pr-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas Adicionales
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Información adicional sobre el proveedor (términos de pago, especialidades, etc.)"
                    rows={4}
                    className="w-full pl-10 pt-2 pb-2 pr-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>
            </CardContent>
          )}
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
                  disabled={isLoading || !formData.name.trim()}
                  className="min-w-[140px]"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Guardar Cambios
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