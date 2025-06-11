"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  ArrowLeft,
  Save,
  CreditCard,
  Smartphone,
  Banknote,
  Building,
  Globe,
  Shield,
  CheckCircle,
  AlertTriangle,
  Info,
  Eye,
  Settings,
  RefreshCw,
  Copy,
  ExternalLink
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Badge } from "@/components/ui/Badge"
import { toast } from "react-hot-toast"

interface PaymentMethod {
  id: string
  name: string
  type: 'card' | 'wallet' | 'bank' | 'crypto' | 'cash'
  enabled: boolean
  configuration: any
  fees: {
    percentage: number
    fixed: number
    currency: string
  }
  limits: {
    min: number
    max: number
    currency: string
  }
  settings: any
}

interface PaymentSettings {
  // Stripe Configuration
  stripe: {
    enabled: boolean
    publicKey: string
    secretKey: string
    webhookSecret: string
    mode: 'test' | 'live'
    acceptedCards: string[]
    captureMethod: 'automatic' | 'manual'
    fees: { percentage: number; fixed: number }
  }
  
  // PayPal Configuration
  paypal: {
    enabled: boolean
    clientId: string
    clientSecret: string
    mode: 'sandbox' | 'live'
    fees: { percentage: number; fixed: number }
  }
  
  // Redsys Configuration (Spanish banks)
  redsys: {
    enabled: boolean
    merchantCode: string
    terminal: string
    secretKey: string
    mode: 'test' | 'live'
    fees: { percentage: number; fixed: number }
  }
  
  // Bank Transfer
  bankTransfer: {
    enabled: boolean
    bankName: string
    accountHolder: string
    iban: string
    swift: string
    instructions: string
    fees: { percentage: number; fixed: number }
  }
  
  // Cash on Delivery
  cashOnDelivery: {
    enabled: boolean
    maxAmount: number
    availableZones: string[]
    fees: { percentage: number; fixed: number }
  }
  
  // Bizum (Spanish mobile payment)
  bizum: {
    enabled: boolean
    phoneNumber: string
    fees: { percentage: number; fixed: number }
  }
  
  // Cryptocurrency
  crypto: {
    enabled: boolean
    acceptedCoins: string[]
    walletAddresses: any
    fees: { percentage: number; fixed: number }
  }
  
  // General Settings
  general: {
    defaultCurrency: string
    autoCapture: boolean
    refundPolicy: string
    maxRefundDays: number
    requireAddressVerification: boolean
    requireCvv: boolean
    savePaymentMethods: boolean
  }
}

export default function PaymentMethodsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('stripe')
  const [testMode, setTestMode] = useState(false)
  
  const [settings, setSettings] = useState<PaymentSettings>({
    stripe: {
      enabled: false,
      publicKey: "",
      secretKey: "",
      webhookSecret: "",
      mode: "test",
      acceptedCards: ["visa", "mastercard", "amex"],
      captureMethod: "automatic",
      fees: { percentage: 2.9, fixed: 0.30 }
    },
    paypal: {
      enabled: false,
      clientId: "",
      clientSecret: "",
      mode: "sandbox",
      fees: { percentage: 3.4, fixed: 0.35 }
    },
    redsys: {
      enabled: false,
      merchantCode: "",
      terminal: "1",
      secretKey: "",
      mode: "test",
      fees: { percentage: 1.5, fixed: 0.20 }
    },
    bankTransfer: {
      enabled: true,
      bankName: "",
      accountHolder: "",
      iban: "",
      swift: "",
      instructions: "Realizar transferencia bancaria con el número de pedido como concepto.",
      fees: { percentage: 0, fixed: 0 }
    },
    cashOnDelivery: {
      enabled: false,
      maxAmount: 300,
      availableZones: ["local"],
      fees: { percentage: 0, fixed: 5 }
    },
    bizum: {
      enabled: false,
      phoneNumber: "",
      fees: { percentage: 0, fixed: 0 }
    },
    crypto: {
      enabled: false,
      acceptedCoins: ["BTC", "ETH"],
      walletAddresses: {},
      fees: { percentage: 1, fixed: 0 }
    },
    general: {
      defaultCurrency: "EUR",
      autoCapture: true,
      refundPolicy: "14 días",
      maxRefundDays: 14,
      requireAddressVerification: true,
      requireCvv: true,
      savePaymentMethods: true
    }
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings/payment-methods')
      if (response.ok) {
        const data = await response.json()
        setSettings(prev => ({ ...prev, ...data }))
      }
    } catch (error) {
      console.error('Error loading payment settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/settings/payment-methods', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      if (!response.ok) throw new Error('Error al guardar configuración')

      toast.success('Configuración de pagos guardada correctamente')
    } catch (error) {
      toast.error('Error al guardar la configuración')
    } finally {
      setIsSaving(false)
    }
  }

  const handleMethodChange = (method: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [method]: {
        ...prev[method as keyof PaymentSettings],
        [field]: value
      }
    }))
  }

  const handleNestedChange = (method: string, parent: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [method]: {
        ...prev[method as keyof PaymentSettings],
        [parent]: {
          ...prev[method as keyof PaymentSettings][parent],
          [field]: value
        }
      }
    }))
  }

  const testConnection = async (method: string) => {
    try {
      const response = await fetch(`/api/settings/payment-methods/test/${method}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings[method as keyof PaymentSettings])
      })
      
      if (response.ok) {
        toast.success(`Conexión con ${method} exitosa`)
      } else {
        toast.error(`Error en la conexión con ${method}`)
      }
    } catch (error) {
      toast.error(`Error al probar conexión con ${method}`)
    }
  }

  const tabs = [
    { id: 'stripe', label: 'Stripe', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'paypal', label: 'PayPal', icon: <Globe className="w-4 h-4" /> },
    { id: 'redsys', label: 'Redsys', icon: <Building className="w-4 h-4" /> },
    { id: 'bank', label: 'Transferencia', icon: <Banknote className="w-4 h-4" /> },
    { id: 'bizum', label: 'Bizum', icon: <Smartphone className="w-4 h-4" /> },
    { id: 'cod', label: 'Contra Reembolso', icon: <Banknote className="w-4 h-4" /> },
    { id: 'general', label: 'General', icon: <Settings className="w-4 h-4" /> }
  ]

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando configuración de pagos...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Métodos de Pago</h1>
            <p className="text-gray-600 mt-1">
              Configura los métodos de pago disponibles en tu tienda
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setTestMode(!testMode)}>
            <Eye className="h-4 w-4 mr-2" />
            {testMode ? 'Modo Producción' : 'Modo Pruebas'}
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
              <strong>Métodos Activos:</strong> {Object.values(settings).filter((s: any) => s.enabled).length} configurados. 
              Recuerda probar las conexiones antes de activar en producción.
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
              {settings[tab.id as keyof PaymentSettings]?.enabled && (
                <Badge className="bg-green-100 text-green-800 text-xs ml-1">Activo</Badge>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Stripe Configuration */}
      {activeTab === 'stripe' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Configuración de Stripe
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.stripe.enabled}
                    onChange={(e) => handleMethodChange('stripe', 'enabled', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="font-medium">Habilitar Stripe</span>
                </label>
                {settings.stripe.enabled && (
                  <Button size="sm" variant="outline" onClick={() => testConnection('stripe')}>
                    Probar Conexión
                  </Button>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Clave Pública
                </label>
                <Input
                  value={settings.stripe.publicKey}
                  onChange={(e) => handleMethodChange('stripe', 'publicKey', e.target.value)}
                  placeholder="pk_test_..."
                  disabled={!settings.stripe.enabled}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Clave Secreta
                </label>
                <Input
                  type="password"
                  value={settings.stripe.secretKey}
                  onChange={(e) => handleMethodChange('stripe', 'secretKey', e.target.value)}
                  placeholder="sk_test_..."
                  disabled={!settings.stripe.enabled}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Webhook Secret
                </label>
                <Input
                  value={settings.stripe.webhookSecret}
                  onChange={(e) => handleMethodChange('stripe', 'webhookSecret', e.target.value)}
                  placeholder="whsec_..."
                  disabled={!settings.stripe.enabled}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Modo
                </label>
                <select
                  value={settings.stripe.mode}
                  onChange={(e) => handleMethodChange('stripe', 'mode', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  disabled={!settings.stripe.enabled}
                >
                  <option value="test">Pruebas</option>
                  <option value="live">Producción</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configuración Avanzada</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Método de Captura
                </label>
                <select
                  value={settings.stripe.captureMethod}
                  onChange={(e) => handleMethodChange('stripe', 'captureMethod', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  disabled={!settings.stripe.enabled}
                >
                  <option value="automatic">Automático</option>
                  <option value="manual">Manual</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comisión (%)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={settings.stripe.fees.percentage}
                    onChange={(e) => handleNestedChange('stripe', 'fees', 'percentage', parseFloat(e.target.value))}
                    disabled={!settings.stripe.enabled}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comisión Fija (€)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={settings.stripe.fees.fixed}
                    onChange={(e) => handleNestedChange('stripe', 'fees', 'fixed', parseFloat(e.target.value))}
                    disabled={!settings.stripe.enabled}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tarjetas Aceptadas
                </label>
                <div className="space-y-2">
                  {['visa', 'mastercard', 'amex', 'discover'].map(card => (
                    <label key={card} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.stripe.acceptedCards.includes(card)}
                        onChange={(e) => {
                          const cards = e.target.checked 
                            ? [...settings.stripe.acceptedCards, card]
                            : settings.stripe.acceptedCards.filter(c => c !== card)
                          handleMethodChange('stripe', 'acceptedCards', cards)
                        }}
                        className="mr-2"
                        disabled={!settings.stripe.enabled}
                      />
                      <span className="capitalize">{card}</span>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* PayPal Configuration */}
      {activeTab === 'paypal' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Configuración de PayPal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.paypal.enabled}
                  onChange={(e) => handleMethodChange('paypal', 'enabled', e.target.checked)}
                  className="mr-2"
                />
                <span className="font-medium">Habilitar PayPal</span>
              </label>
              {settings.paypal.enabled && (
                <Button size="sm" variant="outline" onClick={() => testConnection('paypal')}>
                  Probar Conexión
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client ID
                </label>
                <Input
                  value={settings.paypal.clientId}
                  onChange={(e) => handleMethodChange('paypal', 'clientId', e.target.value)}
                  placeholder="AXxXxXxXxXxXxXxXx..."
                  disabled={!settings.paypal.enabled}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client Secret
                </label>
                <Input
                  type="password"
                  value={settings.paypal.clientSecret}
                  onChange={(e) => handleMethodChange('paypal', 'clientSecret', e.target.value)}
                  placeholder="EXxXxXxXxXxXxXxXx..."
                  disabled={!settings.paypal.enabled}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Modo
                </label>
                <select
                  value={settings.paypal.mode}
                  onChange={(e) => handleMethodChange('paypal', 'mode', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  disabled={!settings.paypal.enabled}
                >
                  <option value="sandbox">Sandbox</option>
                  <option value="live">Producción</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comisión (%)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  value={settings.paypal.fees.percentage}
                  onChange={(e) => handleNestedChange('paypal', 'fees', 'percentage', parseFloat(e.target.value))}
                  disabled={!settings.paypal.enabled}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bank Transfer Configuration */}
      {activeTab === 'bank' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Transferencia Bancaria
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.bankTransfer.enabled}
                  onChange={(e) => handleMethodChange('bankTransfer', 'enabled', e.target.checked)}
                  className="mr-2"
                />
                <span className="font-medium">Habilitar Transferencia Bancaria</span>
              </label>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banco
                </label>
                <Input
                  value={settings.bankTransfer.bankName}
                  onChange={(e) => handleMethodChange('bankTransfer', 'bankName', e.target.value)}
                  placeholder="Banco Santander"
                  disabled={!settings.bankTransfer.enabled}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titular de la Cuenta
                </label>
                <Input
                  value={settings.bankTransfer.accountHolder}
                  onChange={(e) => handleMethodChange('bankTransfer', 'accountHolder', e.target.value)}
                  placeholder="Mi Empresa S.L."
                  disabled={!settings.bankTransfer.enabled}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IBAN
                </label>
                <Input
                  value={settings.bankTransfer.iban}
                  onChange={(e) => handleMethodChange('bankTransfer', 'iban', e.target.value)}
                  placeholder="ES12 1234 5678 9012 3456 7890"
                  disabled={!settings.bankTransfer.enabled}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SWIFT/BIC
                </label>
                <Input
                  value={settings.bankTransfer.swift}
                  onChange={(e) => handleMethodChange('bankTransfer', 'swift', e.target.value)}
                  placeholder="BSCHESMM"
                  disabled={!settings.bankTransfer.enabled}
                />
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instrucciones para el Cliente
                </label>
                <textarea
                  value={settings.bankTransfer.instructions}
                  onChange={(e) => handleMethodChange('bankTransfer', 'instructions', e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Instrucciones detalladas para realizar la transferencia..."
                  disabled={!settings.bankTransfer.enabled}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Moneda Predeterminada
                </label>
                <select
                  value={settings.general.defaultCurrency}
                  onChange={(e) => handleMethodChange('general', 'defaultCurrency', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="EUR">Euro (€)</option>
                  <option value="USD">Dólar ($)</option>
                  <option value="GBP">Libra (£)</option>
                </select>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.general.autoCapture}
                    onChange={(e) => handleMethodChange('general', 'autoCapture', e.target.checked)}
                    className="mr-2"
                  />
                  <span>Captura Automática de Pagos</span>
                </label>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.general.requireAddressVerification}
                    onChange={(e) => handleMethodChange('general', 'requireAddressVerification', e.target.checked)}
                    className="mr-2"
                  />
                  <span>Verificación de Dirección Obligatoria</span>
                </label>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.general.requireCvv}
                    onChange={(e) => handleMethodChange('general', 'requireCvv', e.target.checked)}
                    className="mr-2"
                  />
                  <span>CVV Obligatorio</span>
                </label>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.general.savePaymentMethods}
                    onChange={(e) => handleMethodChange('general', 'savePaymentMethods', e.target.checked)}
                    className="mr-2"
                  />
                  <span>Permitir Guardar Métodos de Pago</span>
                </label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Política de Reembolsos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Política de Reembolso
                </label>
                <Input
                  value={settings.general.refundPolicy}
                  onChange={(e) => handleMethodChange('general', 'refundPolicy', e.target.value)}
                  placeholder="14 días desde la entrega"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Días Máximos para Reembolso
                </label>
                <Input
                  type="number"
                  value={settings.general.maxRefundDays}
                  onChange={(e) => handleMethodChange('general', 'maxRefundDays', parseInt(e.target.value))}
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 mr-2" />
                  <div>
                    <p className="text-sm text-yellow-800">
                      <strong>Importante:</strong> Asegúrate de configurar correctamente los webhooks 
                      en tus proveedores de pago para recibir notificaciones de estado.
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