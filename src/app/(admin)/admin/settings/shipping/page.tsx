"use client"

import { useState, useEffect, memo } from "react"
import { useRouter } from "next/navigation"
import { 
  ArrowLeft,
  Save,
  Truck,
  MapPin,
  Clock,
  Package,
  Calculator,
  Globe,
  Building,
  CheckCircle,
  AlertTriangle,
  Info,
  Eye,
  Settings,
  RefreshCw,
  Plus,
  Trash2,
  Edit
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-hot-toast"

interface ShippingZone {
  id: string
  name: string
  countries: string[]
  regions: string[]
  postalCodes: string[]
  enabled: boolean
}

interface ShippingMethod {
  id: string
  name: string
  description: string
  type: 'flat_rate' | 'weight_based' | 'quantity_based' | 'free' | 'calculated'
  enabled: boolean
  zones: string[]
  minAmount: number
  maxAmount: number
  minWeight: number
  maxWeight: number
  price: number
  freeShippingThreshold: number
  estimatedDays: { min: number; max: number }
  carrier: string
  trackingEnabled: boolean
  requiresSignature: boolean
  insuranceIncluded: boolean
}

interface CarrierIntegration {
  id: string
  name: string
  enabled: boolean
  apiKey: string
  apiSecret: string
  accountNumber: string
  mode: 'test' | 'live'
  services: string[]
}

interface ShippingSettings {
  // General Settings
  general: {
    defaultWeightUnit: 'kg' | 'g' | 'lb' | 'oz'
    defaultDimensionUnit: 'cm' | 'm' | 'in' | 'ft'
    enableShippingCalculator: boolean
    enableShippingInsurance: boolean
    enableSignatureRequired: boolean
    enableTrackingNotifications: boolean
    defaultPackagingWeight: number
    maxPackageWeight: number
    processingTime: { min: number; max: number }
  }
  
  // Shipping Zones
  zones: ShippingZone[]
  
  // Shipping Methods
  methods: ShippingMethod[]
  
  // Carrier Integrations
  carriers: {
    correos: CarrierIntegration
    ups: CarrierIntegration
    dhl: CarrierIntegration
    fedex: CarrierIntegration
    mrw: CarrierIntegration
    seur: CarrierIntegration
    gls: CarrierIntegration
  }
  
  // Local Delivery
  localDelivery: {
    enabled: boolean
    radius: number
    basePrice: number
    pricePerKm: number
    freeDeliveryThreshold: number
    availableDays: string[]
    timeSlots: Array<{ start: string; end: string; price: number }>
  }
  
  // Pickup Points
  pickupPoints: {
    enabled: boolean
    locations: Array<{
      id: string
      name: string
      address: string
      coordinates: { lat: number; lng: number }
      hours: any
      contactInfo: string
    }>
  }
}

const ShippingPage = memo(function ShippingPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('methods')
  const [editingZone, setEditingZone] = useState<string | null>(null)
  
  const [settings, setSettings] = useState<ShippingSettings>({
    general: {
      defaultWeightUnit: 'kg',
      defaultDimensionUnit: 'cm',
      enableShippingCalculator: true,
      enableShippingInsurance: false,
      enableSignatureRequired: false,
      enableTrackingNotifications: true,
      defaultPackagingWeight: 0.1,
      maxPackageWeight: 30,
      processingTime: { min: 1, max: 3 }
    },
    zones: [
      {
        id: 'spain',
        name: 'España Peninsular',
        countries: ['ES'],
        regions: ['madrid', 'barcelona', 'valencia'],
        postalCodes: [],
        enabled: true
      },
      {
        id: 'spain-islands',
        name: 'Islas Baleares y Canarias',
        countries: ['ES'],
        regions: ['baleares', 'canarias'],
        postalCodes: [],
        enabled: true
      },
      {
        id: 'europe',
        name: 'Unión Europea',
        countries: ['FR', 'DE', 'IT', 'PT'],
        regions: [],
        postalCodes: [],
        enabled: true
      }
    ],
    methods: [
      {
        id: 'standard',
        name: 'Envío Estándar',
        description: 'Entrega en 3-5 días laborables',
        type: 'flat_rate',
        enabled: true,
        zones: ['spain'],
        minAmount: 0,
        maxAmount: 999999,
        minWeight: 0,
        maxWeight: 30,
        price: 4.95,
        freeShippingThreshold: 50,
        estimatedDays: { min: 3, max: 5 },
        carrier: 'correos',
        trackingEnabled: true,
        requiresSignature: false,
        insuranceIncluded: false
      },
      {
        id: 'express',
        name: 'Envío Express',
        description: 'Entrega en 24-48 horas',
        type: 'flat_rate',
        enabled: true,
        zones: ['spain'],
        minAmount: 0,
        maxAmount: 999999,
        minWeight: 0,
        maxWeight: 10,
        price: 9.95,
        freeShippingThreshold: 100,
        estimatedDays: { min: 1, max: 2 },
        carrier: 'seur',
        trackingEnabled: true,
        requiresSignature: true,
        insuranceIncluded: true
      }
    ],
    carriers: {
      correos: {
        id: 'correos',
        name: 'Correos España',
        enabled: true,
        apiKey: '',
        apiSecret: '',
        accountNumber: '',
        mode: 'test',
        services: ['standard', 'certified']
      },
      ups: {
        id: 'ups',
        name: 'UPS',
        enabled: false,
        apiKey: '',
        apiSecret: '',
        accountNumber: '',
        mode: 'test',
        services: ['ground', 'express']
      },
      dhl: {
        id: 'dhl',
        name: 'DHL',
        enabled: false,
        apiKey: '',
        apiSecret: '',
        accountNumber: '',
        mode: 'test',
        services: ['express', 'economy']
      },
      fedex: {
        id: 'fedex',
        name: 'FedEx',
        enabled: false,
        apiKey: '',
        apiSecret: '',
        accountNumber: '',
        mode: 'test',
        services: ['ground', 'express']
      },
      mrw: {
        id: 'mrw',
        name: 'MRW',
        enabled: false,
        apiKey: '',
        apiSecret: '',
        accountNumber: '',
        mode: 'test',
        services: ['standard', 'express']
      },
      seur: {
        id: 'seur',
        name: 'SEUR',
        enabled: false,
        apiKey: '',
        apiSecret: '',
        accountNumber: '',
        mode: 'test',
        services: ['standard', 'express', 'international']
      },
      gls: {
        id: 'gls',
        name: 'GLS',
        enabled: false,
        apiKey: '',
        apiSecret: '',
        accountNumber: '',
        mode: 'test',
        services: ['standard', 'express', 'international', 'business-parcel']
      }
    },
    localDelivery: {
      enabled: false,
      radius: 50,
      basePrice: 5,
      pricePerKm: 0.5,
      freeDeliveryThreshold: 75,
      availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      timeSlots: [
        { start: '09:00', end: '13:00', price: 0 },
        { start: '14:00', end: '18:00', price: 0 },
        { start: '18:00', end: '21:00', price: 2 }
      ]
    },
    pickupPoints: {
      enabled: false,
      locations: []
    }
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings/shipping')
      if (response.ok) {
        const data = await response.json()
        setSettings(prev => ({ ...prev, ...data }))
      }
    } catch (error) {
      console.error('Error loading shipping settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/settings/shipping', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      if (!response.ok) throw new Error('Error al guardar configuración')

      toast.success('Configuración de envíos guardada correctamente')
    } catch (error) {
      toast.error('Error al guardar la configuración')
    } finally {
      setIsSaving(false)
    }
  }

  const handleGeneralChange = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      general: { ...prev.general, [field]: value }
    }))
  }

  const addShippingMethod = () => {
    const newMethod: ShippingMethod = {
      id: `method-${Date.now()}`,
      name: 'Nuevo Método',
      description: '',
      type: 'flat_rate',
      enabled: false,
      zones: [],
      minAmount: 0,
      maxAmount: 999999,
      minWeight: 0,
      maxWeight: 30,
      price: 0,
      freeShippingThreshold: 0,
      estimatedDays: { min: 1, max: 5 },
      carrier: 'correos',
      trackingEnabled: true,
      requiresSignature: false,
      insuranceIncluded: false
    }
    
    setSettings(prev => ({
      ...prev,
      methods: [...prev.methods, newMethod]
    }))
  }

  const updateShippingMethod = (methodId: string, updates: Partial<ShippingMethod>) => {
    setSettings(prev => ({
      ...prev,
      methods: prev.methods.map(method => 
        method.id === methodId ? { ...method, ...updates } : method
      )
    }))
  }

  const deleteShippingMethod = (methodId: string) => {
    setSettings(prev => ({
      ...prev,
      methods: prev.methods.filter(method => method.id !== methodId)
    }))
  }

  const tabs = [
    { id: 'methods', label: 'Métodos de Envío', icon: <Truck className="w-4 h-4" /> },
    { id: 'zones', label: 'Zonas de Envío', icon: <MapPin className="w-4 h-4" /> },
    { id: 'carriers', label: 'Transportistas', icon: <Building className="w-4 h-4" /> },
    { id: 'local', label: 'Entrega Local', icon: <MapPin className="w-4 h-4" /> },
    { id: 'general', label: 'General', icon: <Settings className="w-4 h-4" /> }
  ]

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando configuración de envíos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Envíos y Logística</h1>
            <p className="text-gray-600 mt-1">
              Configura métodos de envío, zonas de entrega y transportistas
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadSettings}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Recargar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </div>

      {/* Status Banner */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
        <div className="flex items-center">
          <Info className="h-5 w-5 text-blue-400 mr-2" />
          <div>
            <p className="text-sm text-blue-700">
              <strong>Métodos Activos:</strong> {settings.methods.filter(m => m.enabled).length} de {settings.methods.length} métodos configurados. 
              Zonas: {settings.zones.filter(z => z.enabled).length} activas.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Shipping Methods Tab */}
      {activeTab === 'methods' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Métodos de Envío</h2>
            <Button onClick={addShippingMethod}>
              <Plus className="w-4 h-4 mr-2" />
              Añadir Método
            </Button>
          </div>

          <div className="grid gap-6">
            {settings.methods.map((method) => (
              <Card key={method.id}>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">{method.name}</h3>
                        <div className="flex gap-2">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={method.enabled}
                              onChange={(e) => updateShippingMethod(method.id, { enabled: e.target.checked })}
                              className="mr-2"
                            />
                            <span className="text-sm">Activo</span>
                          </label>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteShippingMethod(method.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nombre
                        </label>
                        <Input
                          value={method.name}
                          onChange={(e) => updateShippingMethod(method.id, { name: e.target.value })}
                          disabled={!method.enabled}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Descripción
                        </label>
                        <Input
                          value={method.description}
                          onChange={(e) => updateShippingMethod(method.id, { description: e.target.value })}
                          disabled={!method.enabled}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tipo
                        </label>
                        <select
                          value={method.type}
                          onChange={(e) => updateShippingMethod(method.id, { type: e.target.value as any })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          disabled={!method.enabled}
                        >
                          <option value="flat_rate">Tarifa Plana</option>
                          <option value="weight_based">Por Peso</option>
                          <option value="quantity_based">Por Cantidad</option>
                          <option value="free">Gratis</option>
                          <option value="calculated">Calculado</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Precio (€)
                          </label>
                          <Input
                            type="number"
                            step="0.01"
                            value={method.price}
                            onChange={(e) => updateShippingMethod(method.id, { price: parseFloat(e.target.value) })}
                            disabled={!method.enabled}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Envío Gratis desde (€)
                          </label>
                          <Input
                            type="number"
                            step="0.01"
                            value={method.freeShippingThreshold}
                            onChange={(e) => updateShippingMethod(method.id, { freeShippingThreshold: parseFloat(e.target.value) })}
                            disabled={!method.enabled}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Días mínimos
                          </label>
                          <Input
                            type="number"
                            value={method.estimatedDays.min}
                            onChange={(e) => updateShippingMethod(method.id, { 
                              estimatedDays: { ...method.estimatedDays, min: parseInt(e.target.value) }
                            })}
                            disabled={!method.enabled}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Días máximos
                          </label>
                          <Input
                            type="number"
                            value={method.estimatedDays.max}
                            onChange={(e) => updateShippingMethod(method.id, { 
                              estimatedDays: { ...method.estimatedDays, max: parseInt(e.target.value) }
                            })}
                            disabled={!method.enabled}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Transportista
                        </label>
                        <select
                          value={method.carrier}
                          onChange={(e) => updateShippingMethod(method.id, { carrier: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          disabled={!method.enabled}
                        >
                          <option value="correos">Correos</option>
                          <option value="seur">SEUR</option>
                          <option value="mrw">MRW</option>
                          <option value="ups">UPS</option>
                          <option value="dhl">DHL</option>
                          <option value="fedex">FedEx</option>
                          <option value="gls">GLS</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Opciones
                        </label>
                        <div className="space-y-2">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={method.trackingEnabled}
                              onChange={(e) => updateShippingMethod(method.id, { trackingEnabled: e.target.checked })}
                              className="mr-2"
                              disabled={!method.enabled}
                            />
                            <span className="text-sm">Seguimiento habilitado</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={method.requiresSignature}
                              onChange={(e) => updateShippingMethod(method.id, { requiresSignature: e.target.checked })}
                              className="mr-2"
                              disabled={!method.enabled}
                            />
                            <span className="text-sm">Requiere firma</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={method.insuranceIncluded}
                              onChange={(e) => updateShippingMethod(method.id, { insuranceIncluded: e.target.checked })}
                              className="mr-2"
                              disabled={!method.enabled}
                            />
                            <span className="text-sm">Seguro incluido</span>
                          </label>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Peso min (kg)
                          </label>
                          <Input
                            type="number"
                            step="0.1"
                            value={method.minWeight}
                            onChange={(e) => updateShippingMethod(method.id, { minWeight: parseFloat(e.target.value) })}
                            disabled={!method.enabled}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Peso máx (kg)
                          </label>
                          <Input
                            type="number"
                            step="0.1"
                            value={method.maxWeight}
                            onChange={(e) => updateShippingMethod(method.id, { maxWeight: parseFloat(e.target.value) })}
                            disabled={!method.enabled}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Shipping Zones Tab */}
      {activeTab === 'zones' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Zonas de Envío</h2>
            <Button onClick={() => {
              const newZone: ShippingZone = {
                id: `zone-${Date.now()}`,
                name: 'Nueva Zona',
                countries: [],
                regions: [],
                postalCodes: [],
                enabled: false
              }
              setSettings(prev => ({
                ...prev,
                zones: [...prev.zones, newZone]
              }))
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Añadir Zona
            </Button>
          </div>

          <div className="grid gap-6">
            {settings.zones.map((zone) => (
              <Card key={zone.id}>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">{zone.name}</h3>
                        <div className="flex gap-2">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={zone.enabled}
                              onChange={(e) => {
                                setSettings(prev => ({
                                  ...prev,
                                  zones: prev.zones.map(z => 
                                    z.id === zone.id ? { ...z, enabled: e.target.checked } : z
                                  )
                                }))
                              }}
                              className="mr-2"
                            />
                            <span className="text-sm">Activa</span>
                          </label>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSettings(prev => ({
                                ...prev,
                                zones: prev.zones.filter(z => z.id !== zone.id)
                              }))
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nombre de la Zona
                        </label>
                        <Input
                          value={zone.name}
                          onChange={(e) => {
                            setSettings(prev => ({
                              ...prev,
                              zones: prev.zones.map(z => 
                                z.id === zone.id ? { ...z, name: e.target.value } : z
                              )
                            }))
                          }}
                          disabled={!zone.enabled}
                          placeholder="Ej: España Peninsular"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Países (códigos ISO)
                        </label>
                        <Input
                          value={zone.countries.join(', ')}
                          onChange={(e) => {
                            const countries = e.target.value.split(',').map(c => c.trim().toUpperCase()).filter(c => c)
                            setSettings(prev => ({
                              ...prev,
                              zones: prev.zones.map(z => 
                                z.id === zone.id ? { ...z, countries } : z
                              )
                            }))
                          }}
                          disabled={!zone.enabled}
                          placeholder="ES, FR, DE"
                        />
                        <p className="text-xs text-gray-500 mt-1">Separar con comas. Ej: ES, FR, DE</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Regiones/Provincias
                        </label>
                        <Input
                          value={zone.regions.join(', ')}
                          onChange={(e) => {
                            const regions = e.target.value.split(',').map(r => r.trim().toLowerCase()).filter(r => r)
                            setSettings(prev => ({
                              ...prev,
                              zones: prev.zones.map(z => 
                                z.id === zone.id ? { ...z, regions } : z
                              )
                            }))
                          }}
                          disabled={!zone.enabled}
                          placeholder="madrid, barcelona, valencia"
                        />
                        <p className="text-xs text-gray-500 mt-1">Separar con comas. Opcional para filtrar por regiones</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Códigos Postales
                        </label>
                        <textarea
                          value={zone.postalCodes.join(', ')}
                          onChange={(e) => {
                            const postalCodes = e.target.value.split(',').map(p => p.trim()).filter(p => p)
                            setSettings(prev => ({
                              ...prev,
                              zones: prev.zones.map(z => 
                                z.id === zone.id ? { ...z, postalCodes } : z
                              )
                            }))
                          }}
                          rows={3}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          disabled={!zone.enabled}
                          placeholder="28001, 28002, 08001-08999"
                        />
                        <p className="text-xs text-gray-500 mt-1">Separar con comas. Usar guiones para rangos (ej: 28001-28999)</p>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <h5 className="font-medium text-blue-800 mb-2">📍 Métodos Disponibles</h5>
                        <div className="text-sm text-blue-700">
                          {settings.methods.filter(m => m.zones.includes(zone.id)).length > 0 ? (
                            <ul className="space-y-1">
                              {settings.methods.filter(m => m.zones.includes(zone.id)).map(method => (
                                <li key={method.id}>• {method.name} - {method.price}€</li>
                              ))}
                            </ul>
                          ) : (
                            <p>No hay métodos de envío asignados a esta zona</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Carriers Tab */}
      {activeTab === 'carriers' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Configuración de Transportistas</h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => {
                // Test all enabled carriers
                Object.values(settings.carriers).filter(c => c.enabled).forEach(carrier => {
                  // Simulate API test
                  toast.success(`Conexión con ${carrier.name} verificada`)
                })
              }}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Probar Conexiones
              </Button>
            </div>
          </div>

          <div className="grid gap-6">
            {Object.entries(settings.carriers).map(([carrierId, carrier]) => (
              <Card key={carrierId} className={carrier.id === 'gls' ? 'border-orange-200 bg-orange-50' : ''}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Truck className="w-5 h-5" />
                    {carrier.name}
                    {carrier.id === 'gls' && (
                      <Badge className="bg-orange-100 text-orange-800">Recomendado</Badge>
                    )}
                    {carrier.enabled && (
                      <Badge className="bg-green-100 text-green-800">Activo</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={carrier.enabled}
                        onChange={(e) => {
                          setSettings(prev => ({
                            ...prev,
                            carriers: {
                              ...prev.carriers,
                              [carrierId]: { ...carrier, enabled: e.target.checked }
                            }
                          }))
                        }}
                        className="mr-2"
                      />
                      <span className="font-medium">Habilitar {carrier.name}</span>
                    </label>
                    {carrier.enabled && (
                      <Button size="sm" variant="outline" onClick={() => {
                        // Simulate API test
                        toast.success(`Conexión con ${carrier.name} exitosa`)
                      }}>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Probar Conexión
                      </Button>
                    )}
                  </div>

                  {carrier.id === 'gls' && (
                    <div className="bg-orange-100 border border-orange-200 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-800 mb-2">🚚 GLS - Configuración Avanzada</h4>
                      <p className="text-sm text-orange-700 mb-3">
                        GLS ofrece integración completa con generación automática de números de envío y etiquetas.
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>Servicios disponibles:</strong>
                          <ul className="mt-1 space-y-1">
                            <li>• BusinessParcel (estándar)</li>
                            <li>• Express (24h)</li>
                            <li>• International</li>
                            <li>• ShopDelivery</li>
                          </ul>
                        </div>
                        <div>
                          <strong>Características:</strong>
                          <ul className="mt-1 space-y-1">
                            <li>• Seguimiento en tiempo real</li>
                            <li>• Generación automática de etiquetas</li>
                            <li>• Notificaciones SMS/Email</li>
                            <li>• Entrega en punto de recogida</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {carrier.id === 'gls' ? 'Customer ID / Usuario' : 'API Key'}
                        </label>
                        <Input
                          type={carrier.id === 'gls' ? 'text' : 'password'}
                          value={carrier.apiKey}
                          onChange={(e) => {
                            setSettings(prev => ({
                              ...prev,
                              carriers: {
                                ...prev.carriers,
                                [carrierId]: { ...carrier, apiKey: e.target.value }
                              }
                            }))
                          }}
                          disabled={!carrier.enabled}
                          placeholder={carrier.id === 'gls' ? 'Tu Customer ID de GLS' : 'Tu API Key'}
                        />
                        {carrier.id === 'gls' && (
                          <p className="text-xs text-gray-500 mt-1">Customer ID proporcionado por GLS al contratar el servicio</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {carrier.id === 'gls' ? 'Contraseña / Password' : 'API Secret'}
                        </label>
                        <Input
                          type="password"
                          value={carrier.apiSecret}
                          onChange={(e) => {
                            setSettings(prev => ({
                              ...prev,
                              carriers: {
                                ...prev.carriers,
                                [carrierId]: { ...carrier, apiSecret: e.target.value }
                              }
                            }))
                          }}
                          disabled={!carrier.enabled}
                          placeholder={carrier.id === 'gls' ? 'Tu contraseña de GLS' : 'Tu API Secret'}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {carrier.id === 'gls' ? 'Contact ID' : 'Número de Cuenta'}
                        </label>
                        <Input
                          value={carrier.accountNumber}
                          onChange={(e) => {
                            setSettings(prev => ({
                              ...prev,
                              carriers: {
                                ...prev.carriers,
                                [carrierId]: { ...carrier, accountNumber: e.target.value }
                              }
                            }))
                          }}
                          disabled={!carrier.enabled}
                          placeholder={carrier.id === 'gls' ? 'Contact ID de GLS' : 'Tu número de cuenta'}
                        />
                        {carrier.id === 'gls' && (
                          <p className="text-xs text-gray-500 mt-1">Contact ID para identificar tu cuenta en GLS</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Modo de Operación
                        </label>
                        <select
                          value={carrier.mode}
                          onChange={(e) => {
                            setSettings(prev => ({
                              ...prev,
                              carriers: {
                                ...prev.carriers,
                                [carrierId]: { ...carrier, mode: e.target.value as 'test' | 'live' }
                              }
                            }))
                          }}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          disabled={!carrier.enabled}
                        >
                          <option value="test">Pruebas (Sandbox)</option>
                          <option value="live">Producción</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Servicios Disponibles
                        </label>
                        <div className="space-y-2">
                          {carrier.services.map(service => (
                            <div key={service} className="flex items-center">
                              <input type="checkbox" checked readOnly className="mr-2" />
                              <span className="text-sm capitalize">{service.replace('-', ' ')}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {carrier.id === 'gls' && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <h5 className="font-medium text-blue-800 mb-2">🔗 URLs de API</h5>
                          <div className="text-sm text-blue-700 space-y-1">
                            <div><strong>Test:</strong> https://shipit-wbm-test01.gls-group.eu:8443</div>
                            <div><strong>Producción:</strong> https://shipit-wbm-prod.gls-group.eu</div>
                          </div>
                        </div>
                      )}

                      {carrier.id === 'gls' && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <h5 className="font-medium text-green-800 mb-2">📋 Datos de Prueba</h5>
                          <div className="text-sm text-green-700 space-y-1">
                            <div><strong>Customer ID:</strong> 2762179</div>
                            <div><strong>Contact ID:</strong> 27621790001</div>
                            <div><strong>Password:</strong> test</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {carrier.id === 'gls' && carrier.enabled && (
                    <div className="border-t pt-6">
                      <h4 className="font-semibold mb-4">Configuración de Etiquetas y Envíos</h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Remitente - Nombre
                            </label>
                            <Input placeholder="Tu Empresa S.L." />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Remitente - Dirección
                            </label>
                            <Input placeholder="Calle Principal 123" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Código Postal
                              </label>
                              <Input placeholder="28001" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ciudad
                              </label>
                              <Input placeholder="Madrid" />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                País
                              </label>
                              <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                                <option value="ES">España</option>
                                <option value="FR">Francia</option>
                                <option value="DE">Alemania</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Teléfono
                              </label>
                              <Input placeholder="+34 123 456 789" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Email de Notificaciones
                            </label>
                            <Input placeholder="envios@tuempresa.com" />
                          </div>
                          <div className="space-y-2">
                            <label className="flex items-center">
                              <input type="checkbox" className="mr-2" />
                              <span className="text-sm">Generar etiquetas automáticamente</span>
                            </label>
                            <label className="flex items-center">
                              <input type="checkbox" className="mr-2" />
                              <span className="text-sm">Enviar notificaciones al cliente</span>
                            </label>
                            <label className="flex items-center">
                              <input type="checkbox" className="mr-2" />
                              <span className="text-sm">Seguimiento automático</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Local Delivery Tab */}
      {activeTab === 'local' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Entrega Local</h2>
            <Badge className={settings.localDelivery.enabled ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
              {settings.localDelivery.enabled ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Configuración de Entrega Local
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.localDelivery.enabled}
                    onChange={(e) => {
                      setSettings(prev => ({
                        ...prev,
                        localDelivery: { ...prev.localDelivery, enabled: e.target.checked }
                      }))
                    }}
                    className="mr-2"
                  />
                  <span className="font-medium">Habilitar Entrega Local</span>
                </label>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Radio de Entrega (km)
                    </label>
                    <Input
                      type="number"
                      value={settings.localDelivery.radius}
                      onChange={(e) => {
                        setSettings(prev => ({
                          ...prev,
                          localDelivery: { ...prev.localDelivery, radius: parseInt(e.target.value) }
                        }))
                      }}
                      disabled={!settings.localDelivery.enabled}
                    />
                    <p className="text-xs text-gray-500 mt-1">Distancia máxima desde tu ubicación</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Precio Base (€)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={settings.localDelivery.basePrice}
                      onChange={(e) => {
                        setSettings(prev => ({
                          ...prev,
                          localDelivery: { ...prev.localDelivery, basePrice: parseFloat(e.target.value) }
                        }))
                      }}
                      disabled={!settings.localDelivery.enabled}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Precio por Km (€)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={settings.localDelivery.pricePerKm}
                      onChange={(e) => {
                        setSettings(prev => ({
                          ...prev,
                          localDelivery: { ...prev.localDelivery, pricePerKm: parseFloat(e.target.value) }
                        }))
                      }}
                      disabled={!settings.localDelivery.enabled}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Entrega Gratis desde (€)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={settings.localDelivery.freeDeliveryThreshold}
                      onChange={(e) => {
                        setSettings(prev => ({
                          ...prev,
                          localDelivery: { ...prev.localDelivery, freeDeliveryThreshold: parseFloat(e.target.value) }
                        }))
                      }}
                      disabled={!settings.localDelivery.enabled}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Días Disponibles
                    </label>
                    <div className="space-y-2">
                      {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                        <label key={day} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={settings.localDelivery.availableDays.includes(day)}
                            onChange={(e) => {
                              const days = e.target.checked 
                                ? [...settings.localDelivery.availableDays, day]
                                : settings.localDelivery.availableDays.filter(d => d !== day)
                              setSettings(prev => ({
                                ...prev,
                                localDelivery: { ...prev.localDelivery, availableDays: days }
                              }))
                            }}
                            className="mr-2"
                            disabled={!settings.localDelivery.enabled}
                          />
                          <span className="text-sm capitalize">
                            {day === 'monday' ? 'Lunes' :
                             day === 'tuesday' ? 'Martes' :
                             day === 'wednesday' ? 'Miércoles' :
                             day === 'thursday' ? 'Jueves' :
                             day === 'friday' ? 'Viernes' :
                             day === 'saturday' ? 'Sábado' : 'Domingo'}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Franjas Horarias</h4>
                <div className="space-y-3">
                  {settings.localDelivery.timeSlots.map((slot, index) => (
                    <div key={index} className="grid grid-cols-4 gap-4 items-center">
                      <div>
                        <Input
                          type="time"
                          value={slot.start}
                          onChange={(e) => {
                            const newSlots = [...settings.localDelivery.timeSlots]
                            newSlots[index] = { ...slot, start: e.target.value }
                            setSettings(prev => ({
                              ...prev,
                              localDelivery: { ...prev.localDelivery, timeSlots: newSlots }
                            }))
                          }}
                          disabled={!settings.localDelivery.enabled}
                        />
                      </div>
                      <div>
                        <Input
                          type="time"
                          value={slot.end}
                          onChange={(e) => {
                            const newSlots = [...settings.localDelivery.timeSlots]
                            newSlots[index] = { ...slot, end: e.target.value }
                            setSettings(prev => ({
                              ...prev,
                              localDelivery: { ...prev.localDelivery, timeSlots: newSlots }
                            }))
                          }}
                          disabled={!settings.localDelivery.enabled}
                        />
                      </div>
                      <div>
                        <Input
                          type="number"
                          step="0.01"
                          value={slot.price}
                          onChange={(e) => {
                            const newSlots = [...settings.localDelivery.timeSlots]
                            newSlots[index] = { ...slot, price: parseFloat(e.target.value) }
                            setSettings(prev => ({
                              ...prev,
                              localDelivery: { ...prev.localDelivery, timeSlots: newSlots }
                            }))
                          }}
                          disabled={!settings.localDelivery.enabled}
                          placeholder="Coste extra"
                        />
                      </div>
                      <div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            const newSlots = settings.localDelivery.timeSlots.filter((_, i) => i !== index)
                            setSettings(prev => ({
                              ...prev,
                              localDelivery: { ...prev.localDelivery, timeSlots: newSlots }
                            }))
                          }}
                          disabled={!settings.localDelivery.enabled}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button
                    onClick={() => {
                      const newSlot = { start: '09:00', end: '13:00', price: 0 }
                      setSettings(prev => ({
                        ...prev,
                        localDelivery: { 
                          ...prev.localDelivery, 
                          timeSlots: [...prev.localDelivery.timeSlots, newSlot] 
                        }
                      }))
                    }}
                    disabled={!settings.localDelivery.enabled}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Añadir Franja
                  </Button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="font-medium text-blue-800 mb-2">💡 Ejemplo de Configuración</h5>
                <div className="text-sm text-blue-700">
                  <p>Con la configuración actual:</p>
                  <ul className="mt-2 space-y-1">
                    <li>• Radio: {settings.localDelivery.radius}km desde tu ubicación</li>
                    <li>• Precio: {settings.localDelivery.basePrice}€ + {settings.localDelivery.pricePerKm}€/km</li>
                    <li>• Gratis desde: {settings.localDelivery.freeDeliveryThreshold}€</li>
                    <li>• Días: {settings.localDelivery.availableDays.length} días disponibles</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* General Settings Tab */}
      {activeTab === 'general' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unidad de Peso
                  </label>
                  <select
                    value={settings.general.defaultWeightUnit}
                    onChange={(e) => handleGeneralChange('defaultWeightUnit', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="kg">Kilogramos (kg)</option>
                    <option value="g">Gramos (g)</option>
                    <option value="lb">Libras (lb)</option>
                    <option value="oz">Onzas (oz)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unidad de Dimensión
                  </label>
                  <select
                    value={settings.general.defaultDimensionUnit}
                    onChange={(e) => handleGeneralChange('defaultDimensionUnit', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="cm">Centímetros (cm)</option>
                    <option value="m">Metros (m)</option>
                    <option value="in">Pulgadas (in)</option>
                    <option value="ft">Pies (ft)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Peso del Embalaje (kg)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={settings.general.defaultPackagingWeight}
                    onChange={(e) => handleGeneralChange('defaultPackagingWeight', parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Peso Máximo por Paquete (kg)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={settings.general.maxPackageWeight}
                    onChange={(e) => handleGeneralChange('maxPackageWeight', parseFloat(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiempo de Procesamiento Mínimo (días)
                  </label>
                  <Input
                    type="number"
                    value={settings.general.processingTime.min}
                    onChange={(e) => handleGeneralChange('processingTime', { 
                      ...settings.general.processingTime, 
                      min: parseInt(e.target.value) 
                    })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiempo de Procesamiento Máximo (días)
                  </label>
                  <Input
                    type="number"
                    value={settings.general.processingTime.max}
                    onChange={(e) => handleGeneralChange('processingTime', { 
                      ...settings.general.processingTime, 
                      max: parseInt(e.target.value) 
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Opciones Avanzadas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.general.enableShippingCalculator}
                    onChange={(e) => handleGeneralChange('enableShippingCalculator', e.target.checked)}
                    className="mr-2"
                  />
                  <span>Habilitar Calculadora de Envíos</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.general.enableShippingInsurance}
                    onChange={(e) => handleGeneralChange('enableShippingInsurance', e.target.checked)}
                    className="mr-2"
                  />
                  <span>Habilitar Seguro de Envío</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.general.enableSignatureRequired}
                    onChange={(e) => handleGeneralChange('enableSignatureRequired', e.target.checked)}
                    className="mr-2"
                  />
                  <span>Permitir Firma Requerida</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.general.enableTrackingNotifications}
                    onChange={(e) => handleGeneralChange('enableTrackingNotifications', e.target.checked)}
                    className="mr-2"
                  />
                  <span>Notificaciones de Seguimiento</span>
                </label>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 mr-2" />
                  <div>
                    <p className="text-sm text-yellow-800">
                      <strong>Importante:</strong> Configura las API de los transportistas 
                      en la pestaña correspondiente para habilitar el seguimiento automático.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
})

ShippingPage.displayName = 'ShippingPage'

export default ShippingPage