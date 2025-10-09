"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import useSWR from "swr"
import { ArrowLeft, Save, User, Mail, Phone, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import fetcher from "@/lib/fetcher"
import { toast } from "react-hot-toast"

interface CustomerDetail {
  id: string
  name: string
  email: string
  phone?: string
  addresses: Array<{
    id: string
    name: string
    street: string
    city: string
    state: string
    postalCode: string
    country: string
    isDefault: boolean
  }>
}

export default function EditCustomerPage() {
  const params = useParams()
  const router = useRouter()
  const customerId = params.id as string
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  })

  const { data: customer, error: fetchError } = useSWR<CustomerDetail>(
    `/api/customers/${customerId}`,
    fetcher
  )

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        email: customer.email,
        phone: customer.phone || "",
      })
    }
  }, [customer])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
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

    const loadingToast = toast.loading("Actualizando cliente...")

    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.dismiss(loadingToast)
        toast.success("Cliente actualizado correctamente")
        router.push(`/admin/customers/${customerId}`)
      } else {
        const errorData = await response.json()
        toast.dismiss(loadingToast)
        
        if (errorData.error?.includes("email")) {
          toast.error("Este email ya está registrado por otro cliente")
        } else {
          toast.error(errorData.error || "Error al actualizar el cliente")
        }
        setError(errorData.error || "Error al actualizar el cliente")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.dismiss(loadingToast)
      toast.error("Error de conexión. Inténtalo de nuevo.")
      setError("Error al actualizar el cliente")
    } finally {
      setIsLoading(false)
    }
  }

  if (fetchError) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          Error al cargar el cliente
        </div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-gray-600 mt-2">Cargando cliente...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" asChild>
          <Link href={`/admin/customers/${customerId}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editar Cliente</h1>
          <p className="text-gray-600 mt-1">Modificar información de {customer.name}</p>
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

          {/* Direcciones existentes */}
          {customer.addresses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Direcciones registradas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">
                  Para modificar direcciones, utiliza la sección correspondiente en el perfil del cliente.
                </p>
                {customer.addresses.map((address) => (
                  <div key={address.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                    {address.isDefault && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mb-2">
                        Dirección principal
                      </span>
                    )}
                    <p className="font-medium">{address.name}</p>
                    <p className="text-sm text-gray-600">{address.street}</p>
                    <p className="text-sm text-gray-600">
                      {address.postalCode} {address.city}, {address.state}
                    </p>
                    <p className="text-sm text-gray-600">{address.country}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Acciones */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            asChild
          >
            <Link href={`/admin/customers/${customerId}`}>
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
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Guardar Cambios
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}