"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  ArrowLeft,
  Save,
  Upload,
  Store,
  Mail,
  Phone,
  MapPin,
  Globe,
  Clock,
  DollarSign,
  FileText,
  Calendar,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Info,
  Eye
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-hot-toast"

interface GeneralSettings {
  // Business Information
  businessName: string
  businessDescription: string
  businessType: string
  foundedYear: string
  
  // Contact Information
  businessEmail: string
  businessPhone: string
  businessWhatsapp: string
  businessWebsite: string
  
  // Address Information
  address: string
  postalCode: string
  city: string
  province: string
  country: string
  
  // Legal Information
  legalName: string
  taxId: string
  vatNumber: string
  registrationNumber: string

  // Regional Settings
  language: string
  timezone: string
  dateFormat: string
  timeFormat: string
  currency: string
  currencySymbol: string
  currencyPosition: 'before' | 'after'
  currencyDecimals: number
  
  // Operational Settings
  businessHours: {
    monday: { open: string; close: string; enabled: boolean }
    tuesday: { open: string; close: string; enabled: boolean }
    wednesday: { open: string; close: string; enabled: boolean }
    thursday: { open: string; close: string; enabled: boolean }
    friday: { open: string; close: string; enabled: boolean }
    saturday: { open: string; close: string; enabled: boolean }
    sunday: { open: string; close: string; enabled: boolean }
  }
  
  // Media Settings
  logo: string | null
  favicon: string | null
  socialMediaBanner: string | null
  
  // SEO Settings
  metaTitle: string
  metaDescription: string
  metaKeywords: string
  
  // Feature Flags
  features: {
    multiLanguage: boolean
    multiCurrency: boolean
    guestCheckout: boolean
    wishlist: boolean
    reviews: boolean
    loyaltyProgram: boolean
    subscriptions: boolean
    digitalProducts: boolean
  }
}

export default function GeneralSettingsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [activeTab, setActiveTab] = useState('business')
  
  const [settings, setSettings] = useState<GeneralSettings>({
    // Business Information
    businessName: "",
    businessDescription: "",
    businessType: "personalization",
    foundedYear: new Date().getFullYear().toString(),
    
    // Contact Information
    businessEmail: "",
    businessPhone: "",
    businessWhatsapp: "",
    businessWebsite: "",
    
    // Address Information
    address: "",
    postalCode: "",
    city: "",
    province: "",
    country: "España",
    
    // Legal Information
    legalName: "",
    taxId: "",
    vatNumber: "",
    registrationNumber: "",

    // Regional Settings
    language: "es",
    timezone: "Europe/Madrid",
    dateFormat: "dd/MM/yyyy",
    timeFormat: "24h",
    currency: "EUR",
    currencySymbol: "€",
    currencyPosition: "after",
    currencyDecimals: 2,
    
    // Operational Settings
    businessHours: {
      monday: { open: "09:00", close: "18:00", enabled: true },
      tuesday: { open: "09:00", close: "18:00", enabled: true },
      wednesday: { open: "09:00", close: "18:00", enabled: true },
      thursday: { open: "09:00", close: "18:00", enabled: true },
      friday: { open: "09:00", close: "18:00", enabled: true },
      saturday: { open: "10:00", close: "14:00", enabled: true },
      sunday: { open: "10:00", close: "14:00", enabled: false }
    },
    
    // Media Settings
    logo: null,
    favicon: null,
    socialMediaBanner: null,
    
    // SEO Settings
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    
    // Feature Flags
    features: {
      multiLanguage: false,
      multiCurrency: false,
      guestCheckout: true,
      wishlist: true,
      reviews: true,
      loyaltyProgram: false,
      subscriptions: false,
      digitalProducts: false
    }
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings/general')
      if (response.ok) {
        const data = await response.json()
        setSettings(prev => ({ ...prev, ...data }))
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/settings/general', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      if (!response.ok) throw new Error('Error al guardar configuración')

      toast.success('Configuración guardada correctamente')
    } catch (error) {
      toast.error('Error al guardar la configuración')
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof GeneralSettings],
        [field]: value
      }
    }))
  }

  const businessTypes = [
    { value: 'personalization', label: 'Tienda de Personalización' },
    { value: 'printing', label: 'Imprenta Digital' },
    { value: 'sublimation', label: 'Sublimación' },
    { value: 'vinyl', label: 'Vinilo y Corte' },
    { value: 'laser', label: 'Corte Láser' },
    { value: 'embroidery', label: 'Bordado' },
    { value: 'mixed', label: 'Servicios Mixtos' }
  ]

  const currencies = [
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'USD', symbol: '$', name: 'Dólar Estadounidense' },
    { code: 'GBP', symbol: '£', name: 'Libra Esterlina' },
    { code: 'MXN', symbol: '$', name: 'Peso Mexicano' },
    { code: 'ARS', symbol: '$', name: 'Peso Argentino' },
    { code: 'COP', symbol: '$', name: 'Peso Colombiano' }
  ]

  const languages = [
    { code: 'es', name: 'Español' },
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'it', name: 'Italiano' },
    { code: 'pt', name: 'Português' }
  ]

  const timezones = [
    { value: 'Europe/Madrid', label: 'Madrid (CET/CEST)' },
    { value: 'America/Mexico_City', label: 'Ciudad de México (CST/CDT)' },
    { value: 'America/New_York', label: 'Nueva York (EST/EDT)' },
    { value: 'America/Los_Angeles', label: 'Los Ángeles (PST/PDT)' },
    { value: 'Europe/London', label: 'Londres (GMT/BST)' },
    { value: 'Europe/Paris', label: 'París (CET/CEST)' }
  ]

  const tabs = [
    { id: 'business', label: 'Información del Negocio', icon: <Store className="w-4 h-4" /> },
    { id: 'contact', label: 'Contacto y Ubicación', icon: <MapPin className="w-4 h-4" /> },
    { id: 'regional', label: 'Configuración Regional', icon: <Globe className="w-4 h-4" /> },
    { id: 'hours', label: 'Horarios de Operación', icon: <Clock className="w-4 h-4" /> },
    { id: 'features', label: 'Características', icon: <CheckCircle className="w-4 h-4" /> }
  ]

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando configuración...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Configuración General</h1>
            <p className="text-gray-600 mt-1">
              Información básica y configuración regional de tu tienda
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
            <Eye className="h-4 w-4 mr-2" />
            {previewMode ? 'Editar' : 'Vista Previa'}
          </Button>
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
              <strong>Configuración Base:</strong> Esta configuración afecta a toda la tienda. 
              Los cambios se aplicarán inmediatamente en el frontend.
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

      {/* Business Information Tab */}
      {activeTab === 'business' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Negocio *
                </label>
                <Input
                  value={settings.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                  placeholder="Mi Tienda de Personalización"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción del Negocio
                </label>
                <textarea
                  value={settings.businessDescription}
                  onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Describe brevemente tu negocio..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Negocio
                </label>
                <select
                  value={settings.businessType}
                  onChange={(e) => handleInputChange('businessType', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  {businessTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Año de Fundación
                </label>
                <Input
                  type="number"
                  value={settings.foundedYear}
                  onChange={(e) => handleInputChange('foundedYear', e.target.value)}
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Información Legal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Razón Social
                </label>
                <Input
                  value={settings.legalName}
                  onChange={(e) => handleInputChange('legalName', e.target.value)}
                  placeholder="Nombre legal de la empresa"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CIF/NIF
                </label>
                <Input
                  value={settings.taxId}
                  onChange={(e) => handleInputChange('taxId', e.target.value)}
                  placeholder="12345678A"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de IVA
                </label>
                <Input
                  value={settings.vatNumber}
                  onChange={(e) => handleInputChange('vatNumber', e.target.value)}
                  placeholder="ES12345678A"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Registro Mercantil
                </label>
                <Input
                  value={settings.registrationNumber}
                  onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
                  placeholder="Número de registro"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Contact Information Tab */}
      {activeTab === 'contact' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Datos de Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Principal *
                </label>
                <Input
                  type="email"
                  value={settings.businessEmail}
                  onChange={(e) => handleInputChange('businessEmail', e.target.value)}
                  placeholder="contacto@mitienda.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono Principal
                </label>
                <Input
                  value={settings.businessPhone}
                  onChange={(e) => handleInputChange('businessPhone', e.target.value)}
                  placeholder="+34 123 456 789"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp Business
                </label>
                <Input
                  value={settings.businessWhatsapp}
                  onChange={(e) => handleInputChange('businessWhatsapp', e.target.value)}
                  placeholder="+34 123 456 789"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sitio Web
                </label>
                <Input
                  value={settings.businessWebsite}
                  onChange={(e) => handleInputChange('businessWebsite', e.target.value)}
                  placeholder="https://mitienda.com"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dirección Fiscal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección *
                </label>
                <Input
                  value={settings.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Calle Principal, 123"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Código Postal *
                  </label>
                  <Input
                    value={settings.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    placeholder="28001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ciudad *
                  </label>
                  <Input
                    value={settings.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Madrid"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Provincia *
                  </label>
                  <Input
                    value={settings.province}
                    onChange={(e) => handleInputChange('province', e.target.value)}
                    placeholder="Madrid"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    País *
                  </label>
                  <Input
                    value={settings.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    placeholder="España"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Regional Settings Tab */}
      {activeTab === 'regional' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Idioma y Localización</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Idioma Principal
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => handleInputChange('language', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  {languages.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zona Horaria
                </label>
                <select
                  value={settings.timezone}
                  onChange={(e) => handleInputChange('timezone', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  {timezones.map(tz => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Formato de Fecha
                  </label>
                  <select
                    value={settings.dateFormat}
                    onChange={(e) => handleInputChange('dateFormat', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="dd/MM/yyyy">DD/MM/AAAA</option>
                    <option value="MM/dd/yyyy">MM/DD/AAAA</option>
                    <option value="yyyy-MM-dd">AAAA-MM-DD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Formato de Hora
                  </label>
                  <select
                    value={settings.timeFormat}
                    onChange={(e) => handleInputChange('timeFormat', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="24h">24 Horas</option>
                    <option value="12h">12 Horas (AM/PM)</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configuración de Moneda</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Moneda Principal
                </label>
                <select
                  value={settings.currency}
                  onChange={(e) => {
                    const currency = currencies.find(c => c.code === e.target.value)
                    handleInputChange('currency', e.target.value)
                    if (currency) {
                      handleInputChange('currencySymbol', currency.symbol)
                    }
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  {currencies.map(currency => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name} ({currency.symbol})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Símbolo de Moneda
                  </label>
                  <Input
                    value={settings.currencySymbol}
                    onChange={(e) => handleInputChange('currencySymbol', e.target.value)}
                    placeholder="€"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Posición del Símbolo
                  </label>
                  <select
                    value={settings.currencyPosition}
                    onChange={(e) => handleInputChange('currencyPosition', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="before">Antes (€100)</option>
                    <option value="after">Después (100€)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Decimales de Moneda
                </label>
                <select
                  value={settings.currencyDecimals}
                  onChange={(e) => handleInputChange('currencyDecimals', parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="0">Sin decimales (100)</option>
                  <option value="2">2 decimales (100,00)</option>
                  <option value="3">3 decimales (100,000)</option>
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Ejemplo:</strong> {' '}
                  {settings.currencyPosition === 'before' 
                    ? `${settings.currencySymbol}100${settings.currencyDecimals > 0 ? ',' + '0'.repeat(settings.currencyDecimals) : ''}`
                    : `100${settings.currencyDecimals > 0 ? ',' + '0'.repeat(settings.currencyDecimals) : ''}${settings.currencySymbol}`
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Business Hours Tab */}
      {activeTab === 'hours' && (
        <Card>
          <CardHeader>
            <CardTitle>Horarios de Atención</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(settings.businessHours).map(([day, hours]) => (
                <div key={day} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="w-24">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={hours.enabled}
                        onChange={(e) => handleNestedChange('businessHours', day, { ...hours, enabled: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="font-medium capitalize">
                        {day === 'monday' ? 'Lunes' :
                         day === 'tuesday' ? 'Martes' :
                         day === 'wednesday' ? 'Miércoles' :
                         day === 'thursday' ? 'Jueves' :
                         day === 'friday' ? 'Viernes' :
                         day === 'saturday' ? 'Sábado' : 'Domingo'}
                      </span>
                    </label>
                  </div>
                  
                  {hours.enabled ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={hours.open}
                        onChange={(e) => handleNestedChange('businessHours', day, { ...hours, open: e.target.value })}
                        className="border border-gray-300 rounded px-2 py-1"
                      />
                      <span className="text-gray-500">a</span>
                      <input
                        type="time"
                        value={hours.close}
                        onChange={(e) => handleNestedChange('businessHours', day, { ...hours, close: e.target.value })}
                        className="border border-gray-300 rounded px-2 py-1"
                      />
                    </div>
                  ) : (
                    <span className="text-gray-500 italic">Cerrado</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Features Tab */}
      {activeTab === 'features' && (
        <Card>
          <CardHeader>
            <CardTitle>Características de la Tienda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(settings.features).map(([feature, enabled]) => (
                <div key={feature} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">
                      {feature === 'multiLanguage' ? 'Multi-idioma' :
                       feature === 'multiCurrency' ? 'Multi-moneda' :
                       feature === 'guestCheckout' ? 'Checkout sin registro' :
                       feature === 'wishlist' ? 'Lista de deseos' :
                       feature === 'reviews' ? 'Reseñas de productos' :
                       feature === 'loyaltyProgram' ? 'Programa de lealtad' :
                       feature === 'subscriptions' ? 'Suscripciones' :
                       feature === 'digitalProducts' ? 'Productos digitales' : feature}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {feature === 'multiLanguage' ? 'Permitir múltiples idiomas en la tienda' :
                       feature === 'multiCurrency' ? 'Soporte para múltiples monedas' :
                       feature === 'guestCheckout' ? 'Permitir comprar sin crear cuenta' :
                       feature === 'wishlist' ? 'Los clientes pueden guardar productos favoritos' :
                       feature === 'reviews' ? 'Habilitar reseñas y valoraciones' :
                       feature === 'loyaltyProgram' ? 'Sistema de puntos y recompensas' :
                       feature === 'subscriptions' ? 'Productos por suscripción' :
                       feature === 'digitalProducts' ? 'Venta de productos digitales' : 'Característica adicional'}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) => handleNestedChange('features', feature, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}