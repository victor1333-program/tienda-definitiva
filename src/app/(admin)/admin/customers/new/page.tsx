"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, User, Mail, Phone, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "react-hot-toast"

export default function NewCustomerPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "ES"
    }
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAddressChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validaciones básicas
    if (!formData.name || !formData.email) {
      toast.error("El nombre y email son campos requeridos")
      return
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast.error("Por favor introduce un email válido")
      return
    }

    setIsLoading(true)
    setError("")

    const loadingToast = toast.loading("Creando cliente...")

    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const customer = await response.json()
        toast.dismiss(loadingToast)
        toast.success("Cliente creado correctamente")
        router.push(`/admin/customers/${customer.id}`)
      } else {
        const errorData = await response.json()
        toast.dismiss(loadingToast)
        
        if (errorData.error?.includes("email")) {
          toast.error("Este email ya está registrado en el sistema")
        } else {
          toast.error(errorData.error || "Error al crear el cliente")
        }
        setError(errorData.error || "Error al crear el cliente")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.dismiss(loadingToast)
      toast.error("Error de conexión. Inténtalo de nuevo.")
      setError("Error al crear el cliente")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" asChild>
          <Link href="/admin/customers">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nuevo Cliente</h1>
          <p className="text-gray-600 mt-1">Crear un nuevo cliente en el sistema</p>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Información básica */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información básica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo *
                </label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Nombre y apellidos del cliente"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="cliente@ejemplo.com"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+34 600 000 000"
                    className="pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dirección */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Dirección (opcional)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección
                </label>
                <Input
                  id="street"
                  type="text"
                  value={formData.address.street}
                  onChange={(e) => handleAddressChange("street", e.target.value)}
                  placeholder="Calle, número, piso..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                    Ciudad
                  </label>
                  <Input
                    id="city"
                    type="text"
                    value={formData.address.city}
                    onChange={(e) => handleAddressChange("city", e.target.value)}
                    placeholder="Madrid"
                  />
                </div>

                <div>
                  <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                    Código postal
                  </label>
                  <Input
                    id="postalCode"
                    type="text"
                    value={formData.address.postalCode}
                    onChange={(e) => handleAddressChange("postalCode", e.target.value)}
                    placeholder="28001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                    Provincia
                  </label>
                  <Input
                    id="state"
                    type="text"
                    value={formData.address.state}
                    onChange={(e) => handleAddressChange("state", e.target.value)}
                    placeholder="Madrid"
                  />
                </div>

                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                    País
                  </label>
                  <select
                    id="country"
                    value={formData.address.country}
                    onChange={(e) => handleAddressChange("country", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="ES">España</option>
                    <option value="FR">Francia</option>
                    <option value="PT">Portugal</option>
                    <option value="IT">Italia</option>
                    <option value="DE">Alemania</option>
                    <option value="GB">Reino Unido</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Acciones */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            asChild
          >
            <Link href="/admin/customers">
              Cancelar
            </Link>
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Crear Cliente
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}