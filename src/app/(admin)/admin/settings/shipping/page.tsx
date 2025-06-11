"use client"

import { useState, useEffect } from "react"
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
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Badge } from "@/components/ui/Badge"
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

export default function ShippingPage() {
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
}