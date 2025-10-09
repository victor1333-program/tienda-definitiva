"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import {
  CreditCard,
  Settings,
  Shield,
  Zap,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Percent,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Download,
  Upload,
  TestTube,
  Activity,
  TrendingUp,
  Users,
  Calendar,
  MapPin,
  Smartphone,
  Wallet,
  Building
} from "lucide-react"

interface PaymentGateway {
  id: string
  name: string
  provider: 'stripe' | 'paypal' | 'redsys' | 'bizum' | 'apple_pay' | 'google_pay'
  isEnabled: boolean
  isLive: boolean
  configuration: {
    publicKey: string
    secretKey: string
    webhookSecret?: string
    merchantId?: string
    environment: 'sandbox' | 'production'
  }
  fees: {
    fixedFee: number
    percentageFee: number
    currency: string
  }
  supportedCurrencies: string[]
  supportedCountries: string[]
  features: {
    recurringPayments: boolean
    refunds: boolean
    disputes: boolean
    webhooks: boolean
    thirdPartySecure: boolean
  }
  limits: {
    minAmount: number
    maxAmount: number
    dailyLimit: number
    monthlyLimit: number
  }
  lastSync: string
  status: 'active' | 'inactive' | 'error' | 'testing'
}

interface PaymentMethod {
  id: string
  name: string
  type: 'card' | 'bank_transfer' | 'digital_wallet' | 'buy_now_pay_later' | 'crypto' | 'cash'
  gatewayId: string
  isEnabled: boolean
  displayOrder: number
  icon: string
  description: string
  processingTime: string
  availability: {
    countries: string[]
    minAmount: number
    maxAmount: number
  }
}

interface PaymentStats {
  totalTransactions: number
  totalVolume: number
  successRate: number
  averageProcessingTime: number
  topGateways: {
    gateway: string
    volume: number
    transactions: number
    successRate: number
  }[]
  recentTransactions: {
    id: string
    amount: number
    currency: string
    gateway: string
    method: string
    status: string
    customer: string
    date: string
  }[]
  monthlyTrends: {
    month: string
    volume: number
    transactions: number
    fees: number
  }[]
}

export default function PaymentGatewaysPage() {
  const [gateways, setGateways] = useState<PaymentGateway[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [stats, setStats] = useState<PaymentStats>({
    totalTransactions: 0,
    totalVolume: 0,
    successRate: 0,
    averageProcessingTime: 0,
    topGateways: [],
    recentTransactions: [],
    monthlyTrends: []
  })
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | null>(null)
  const [isConfiguring, setIsConfiguring] = useState(false)
  const [showSecrets, setShowSecrets] = useState<{[key: string]: boolean}>({})
  const [testMode, setTestMode] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadPaymentGateways()
    loadPaymentMethods()
    loadPaymentStats()
    loadTestModeSettings()
  }, [])

  // Load test mode settings from localStorage or API
  const loadTestModeSettings = async () => {
    try {
      const savedTestMode = localStorage.getItem('payment-test-mode')
      if (savedTestMode) {
        setTestMode(JSON.parse(savedTestMode))
      }
    } catch (error) {
      console.error('Error loading test mode settings:', error)
    }
  }

  const loadPaymentGateways = async () => {
    try {
      const response = await fetch('/api/payment-gateways')
      if (response.ok) {
        const data = await response.json()
        setGateways(data)
      }
    } catch (error) {
      console.error('Error loading payment gateways:', error)
    }
  }

  const loadPaymentMethods = async () => {
    try {
      const response = await fetch('/api/payment-methods')
      if (response.ok) {
        const data = await response.json()
        setPaymentMethods(data)
      }
    } catch (error) {
      console.error('Error loading payment methods:', error)
    }
  }

  const loadPaymentStats = async () => {
    try {
      const response = await fetch('/api/payment-gateways/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error loading payment stats:', error)
    }
  }

  const toggleGateway = async (gatewayId: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/payment-gateways/${gatewayId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isEnabled: enabled })
      })
      
      if (response.ok) {
        toast.success(`Pasarela ${enabled ? 'activada' : 'desactivada'} correctamente`)
        loadPaymentGateways()
      } else {
        toast.error('Error al actualizar pasarela')
      }
    } catch (error) {
      toast.error('Error de conexión')
    }
  }

  const testGateway = async (gatewayId: string) => {
    setLoading(true)
    try {
      const endpoint = testMode 
        ? `/api/payment-gateways/${gatewayId}/test-quick`
        : `/api/payment-gateways/${gatewayId}/test`
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testMode: testMode })
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          if (testMode) {
            toast.success(`✅ Test rápido exitoso: ${result.message || 'Conexión establecida correctamente'}`)
          } else {
            toast.success('Prueba de pasarela exitosa')
          }
        } else {
          toast.error(`Error en prueba: ${result.error}`)
        }
      } else {
        toast.error('Error al probar pasarela')
      }
    } catch (error) {
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const updateGatewayConfig = async (gatewayId: string, config: any) => {
    try {
      const response = await fetch(`/api/payment-gateways/${gatewayId}/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })
      
      if (response.ok) {
        toast.success('Configuración actualizada correctamente')
        loadPaymentGateways()
        setIsConfiguring(false)
      } else {
        toast.error('Error al actualizar configuración')
      }
    } catch (error) {
      toast.error('Error de conexión')
    }
  }

  const handleTestModeChange = async (enabled: boolean) => {
    try {
      setTestMode(enabled)
      localStorage.setItem('payment-test-mode', JSON.stringify(enabled))
      
      // Update all gateways to test mode
      const response = await fetch('/api/payment-gateways/test-mode', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testMode: enabled })
      })
      
      if (response.ok) {
        toast.success(enabled ? 'Modo pruebas activado - Usando entorno sandbox' : 'Modo pruebas desactivado - Usando entorno producción')
        loadPaymentGateways()
      } else {
        toast.error('Error al actualizar modo pruebas')
      }
    } catch (error) {
      toast.error('Error de conexión')
      // Revert state if error
      setTestMode(!enabled)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'inactive': return <XCircle className="h-4 w-4 text-gray-500" />
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'testing': return <TestTube className="h-4 w-4 text-blue-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'error': return 'bg-red-100 text-red-800'
      case 'testing': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'stripe': return <CreditCard className="h-5 w-5 text-purple-600" />
      case 'paypal': return <Wallet className="h-5 w-5 text-blue-600" />
      case 'redsys': return <Building className="h-5 w-5 text-red-600" />
      case 'bizum': return <Smartphone className="h-5 w-5 text-orange-600" />
      case 'apple_pay': return <Smartphone className="h-5 w-5 text-gray-800" />
      case 'google_pay': return <Smartphone className="h-5 w-5 text-green-600" />
      default: return <CreditCard className="h-5 w-5 text-gray-600" />
    }
  }

  const formatCurrency = (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pasarelas de Pago</h1>
          <p className="text-gray-600 mt-2">
            Gestión integral de métodos de pago y pasarelas
            {testMode && (
              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                <TestTube className="h-3 w-3 mr-1" />
                Modo Pruebas Activo
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center space-x-2">
            <Switch
              id="test-mode"
              checked={testMode}
              onCheckedChange={handleTestModeChange}
            />
            <Label htmlFor="test-mode" className="text-sm font-medium">
              Modo Test
              {testMode && <span className="ml-1 text-xs text-blue-600">(Activo)</span>}
            </Label>
          </div>
          <Button onClick={() => loadPaymentStats()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Dialog open={isConfiguring} onOpenChange={(open) => {
            setIsConfiguring(open)
            if (!open) {
              setSelectedGateway(null)
            }
          }}>
            <DialogTrigger asChild>
              <Button 
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                onClick={() => setSelectedGateway(null)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nueva Pasarela
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {selectedGateway ? `Configurar ${selectedGateway.name}` : 'Configurar Nueva Pasarela'}
                </DialogTitle>
                <DialogDescription>
                  {selectedGateway 
                    ? `Actualiza la configuración de ${selectedGateway.provider}`
                    : 'Añade una nueva pasarela de pago al sistema'}
                </DialogDescription>
              </DialogHeader>
              <GatewayConfigurationForm 
                selectedGateway={selectedGateway}
                onSave={updateGatewayConfig}
                onCancel={() => {
                  setIsConfiguring(false)
                  setSelectedGateway(null)
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Transacciones</p>
                <p className="text-xl font-bold">{stats.totalTransactions.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Volumen Total</p>
                <p className="text-xl font-bold">{formatCurrency(stats.totalVolume)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              <div>
                <p className="text-sm text-gray-600">Tasa Éxito</p>
                <p className="text-xl font-bold">{stats.successRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">T. Procesamiento</p>
                <p className="text-xl font-bold">{stats.averageProcessingTime}s</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Crecimiento</p>
                <p className="text-xl font-bold">+12.5%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="gateways" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="gateways">Pasarelas</TabsTrigger>
          <TabsTrigger value="methods">Métodos</TabsTrigger>
          <TabsTrigger value="transactions">Transacciones</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Configuración</TabsTrigger>
        </TabsList>

        {/* Payment Gateways Tab */}
        <TabsContent value="gateways" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {gateways.map((gateway) => (
              <Card key={gateway.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 pt-1">
                      {getProviderIcon(gateway.provider)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{gateway.name}</h3>
                          <p className="text-gray-600 capitalize">{gateway.provider}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(gateway.status)}>
                            {gateway.status}
                          </Badge>
                          <Switch
                            checked={gateway.isEnabled}
                            onCheckedChange={(enabled) => toggleGateway(gateway.id, enabled)}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Entorno</p>
                          <div className="flex items-center gap-1">
                            {testMode || !gateway.isLive ? (
                              <><TestTube className="h-3 w-3 text-blue-500" />Sandbox</>
                            ) : (
                              <><Shield className="h-3 w-3 text-green-500" />Producción</>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Comisión</p>
                          <p className="font-medium">
                            {gateway.fees.percentageFee}% + {formatCurrency(gateway.fees.fixedFee)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Monedas</p>
                          <p className="font-medium">{gateway.supportedCurrencies.length} soportadas</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Límite Diario</p>
                          <p className="font-medium">{formatCurrency(gateway.limits.dailyLimit)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => {
                          setSelectedGateway(gateway)
                          setIsConfiguring(true)
                        }}>
                          <Settings className="h-3 w-3 mr-1" />
                          Configurar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => testGateway(gateway.id)}
                          disabled={loading}
                          className={testMode ? 'border-blue-300 text-blue-700 hover:bg-blue-50' : ''}
                        >
                          <TestTube className="h-3 w-3 mr-1" />
                          {testMode ? 'Test Rápido' : 'Probar'}
                        </Button>
                        {testMode && (
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                            <TestTube className="h-3 w-3 mr-1" />
                            Test Mode
                          </Badge>
                        )}
                        <Badge variant="outline" className="ml-auto">
                          {gateway.features.recurringPayments && '🔄'}
                          {gateway.features.refunds && '↩️'}
                          {gateway.features.thirdPartySecure && '🔒'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Payment Methods Tab */}
        <TabsContent value="methods" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Métodos de Pago Disponibles</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Añadir Método
            </Button>
          </div>
          
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <Card key={method.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <img src={method.icon} alt={method.name} className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{method.name}</h4>
                          <p className="text-sm text-gray-600">{method.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{method.type}</Badge>
                          <Switch
                            checked={method.isEnabled}
                            onCheckedChange={(enabled) => {
                              // Update payment method
                            }}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                        <div>
                          <span className="text-gray-600">Procesamiento:</span>
                          <span className="ml-1 font-medium">{method.processingTime}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Min:</span>
                          <span className="ml-1 font-medium">{formatCurrency(method.availability.minAmount)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Max:</span>
                          <span className="ml-1 font-medium">{formatCurrency(method.availability.maxAmount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Transacciones Recientes</CardTitle>
              <CardDescription>Últimas transacciones procesadas por el sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.status === 'completed' ? 'bg-green-100 text-green-700' :
                        transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {getStatusIcon(transaction.status)}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.customer}</p>
                        <p className="text-sm text-gray-600">
                          {transaction.id} • {transaction.gateway} • {transaction.method}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(transaction.amount, transaction.currency)}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(transaction.date).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Gateways */}
            <Card>
              <CardHeader>
                <CardTitle>Rendimiento por Pasarela</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.topGateways.map((gateway, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getProviderIcon(gateway.gateway)}
                        <div>
                          <p className="font-medium capitalize">{gateway.gateway}</p>
                          <p className="text-sm text-gray-600">{gateway.transactions} transacciones</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(gateway.volume)}</p>
                        <p className="text-sm text-green-600">{gateway.successRate.toFixed(1)}% éxito</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Monthly Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Tendencias Mensuales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.monthlyTrends.map((trend, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{trend.month}</p>
                        <p className="text-sm text-gray-600">{trend.transactions} transacciones</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(trend.volume)}</p>
                        <p className="text-sm text-gray-600">Comisiones: {formatCurrency(trend.fees)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración Global de Pagos</CardTitle>
              <CardDescription>
                Ajustes generales para el procesamiento de pagos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="default-currency">Moneda por Defecto</Label>
                    <Select defaultValue="EUR">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EUR">Euro (EUR)</SelectItem>
                        <SelectItem value="USD">Dólar (USD)</SelectItem>
                        <SelectItem value="GBP">Libra (GBP)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="min-amount">Monto Mínimo</Label>
                    <Input
                      id="min-amount"
                      type="number"
                      placeholder="1.00"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="max-amount">Monto Máximo</Label>
                    <Input
                      id="max-amount"
                      type="number"
                      placeholder="10000.00"
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Requerir 3D Secure</Label>
                      <p className="text-sm text-gray-600">Para pagos superiores a 30€</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Guardar Métodos de Pago</Label>
                      <p className="text-sm text-gray-600">Permitir a clientes guardar tarjetas</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Webhooks Automáticos</Label>
                      <p className="text-sm text-gray-600">Procesar notificaciones automáticamente</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Modo Desarrollo</Label>
                      <p className="text-sm text-gray-600">Usar endpoints de prueba</p>
                    </div>
                    <Switch checked={testMode} onCheckedChange={handleTestModeChange} />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 pt-4 border-t">
                <Button>
                  <Settings className="h-4 w-4 mr-2" />
                  Guardar Configuración
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Config
                </Button>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Importar Config
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Componente para configuración de pasarelas
interface GatewayConfigurationFormProps {
  selectedGateway: PaymentGateway | null
  onSave: (gatewayId: string, config: any) => void
  onCancel: () => void
}

function GatewayConfigurationForm({ selectedGateway, onSave, onCancel }: GatewayConfigurationFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    provider: 'redsys' as PaymentGateway['provider'],
    isEnabled: true,
    isLive: false,
    configuration: {
      publicKey: '',
      secretKey: '',
      webhookSecret: '',
      merchantId: '',
      environment: 'sandbox' as 'sandbox' | 'production',
      // Campos específicos de Redsys
      merchantCode: '',
      terminal: '',
      currency: 'EUR',
      // Campos específicos de Bizum
      phoneNumber: '',
      concept: ''
    },
    fees: {
      fixedFee: 0,
      percentageFee: 0,
      currency: 'EUR'
    },
    limits: {
      minAmount: 1,
      maxAmount: 10000,
      dailyLimit: 50000,
      monthlyLimit: 500000
    }
  })

  const [showSecrets, setShowSecrets] = useState(false)

  useEffect(() => {
    if (selectedGateway) {
      setFormData({
        name: selectedGateway.name,
        provider: selectedGateway.provider,
        isEnabled: selectedGateway.isEnabled,
        isLive: selectedGateway.isLive,
        configuration: { 
          ...selectedGateway.configuration,
          merchantCode: selectedGateway.configuration.merchantId || '',
          terminal: '1',
          currency: 'EUR',
          phoneNumber: '',
          concept: ''
        },
        fees: { ...selectedGateway.fees },
        limits: { ...selectedGateway.limits }
      })
    } else {
      // Reset form for new gateway
      setFormData({
        name: '',
        provider: 'redsys',
        isEnabled: true,
        isLive: false,
        configuration: {
          publicKey: '',
          secretKey: '',
          webhookSecret: '',
          merchantId: '',
          environment: 'sandbox',
          merchantCode: '',
          terminal: '1',
          currency: 'EUR',
          phoneNumber: '',
          concept: ''
        },
        fees: {
          fixedFee: 0,
          percentageFee: 0,
          currency: 'EUR'
        },
        limits: {
          minAmount: 1,
          maxAmount: 10000,
          dailyLimit: 50000,
          monthlyLimit: 500000
        }
      })
    }
  }, [selectedGateway])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const gatewayId = selectedGateway?.id || 'new'
    onSave(gatewayId, formData)
  }

  const renderRedsysConfig = () => {
    console.log('🟠 Renderizando configuración de Redsys')
    return (
    <div className="space-y-4">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h4 className="font-semibold text-red-800 mb-2">Configuración Redsys TPV</h4>
        <p className="text-sm text-red-700">
          Configuración para el TPV virtual de Redsys. Necesitarás los datos proporcionados por tu banco.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="merchantCode">Código de Comercio *</Label>
          <Input
            id="merchantCode"
            value={formData.configuration.merchantCode}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              configuration: { ...prev.configuration, merchantCode: e.target.value }
            }))}
            placeholder="999008881"
            className="font-mono"
          />
          <p className="text-xs text-gray-500 mt-1">Código asignado por el banco (9 dígitos)</p>
        </div>

        <div>
          <Label htmlFor="terminal">Terminal</Label>
          <Input
            id="terminal"
            value={formData.configuration.terminal}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              configuration: { ...prev.configuration, terminal: e.target.value }
            }))}
            placeholder="1"
            className="font-mono"
          />
          <p className="text-xs text-gray-500 mt-1">Número de terminal (por defecto: 1)</p>
        </div>

        <div>
          <Label htmlFor="redsys-secret">Clave Secreta *</Label>
          <div className="relative">
            <Input
              id="redsys-secret"
              type={showSecrets ? "text" : "password"}
              value={formData.configuration.secretKey}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                configuration: { ...prev.configuration, secretKey: e.target.value }
              }))}
              placeholder="sq7HjrUOBfKmC576ILgskD5srU870gJ7"
              className="font-mono pr-10"
            />
            <button
              type="button"
              onClick={() => setShowSecrets(!showSecrets)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
            >
              {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">Clave secreta proporcionada por el banco</p>
        </div>

        <div>
          <Label htmlFor="currency">Moneda</Label>
          <Select value={formData.configuration.currency} onValueChange={(value) => 
            setFormData(prev => ({
              ...prev,
              configuration: { ...prev.configuration, currency: value }
            }))
          }>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EUR">Euro (978)</SelectItem>
              <SelectItem value="USD">Dólar (840)</SelectItem>
              <SelectItem value="GBP">Libra (826)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="redsys-webhook">URL de Notificación</Label>
        <Input
          id="redsys-webhook"
          value={typeof window !== 'undefined' ? `${window.location.origin}/api/webhooks/redsys` : 'https://tu-dominio.com/api/webhooks/redsys'}
          readOnly
          className="bg-gray-50"
        />
        <p className="text-xs text-gray-500 mt-1">
          Configura esta URL en tu panel de Redsys para recibir notificaciones
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h5 className="font-medium text-blue-800 mb-2">URLs de Entorno</h5>
        <div className="text-sm text-blue-700 space-y-1">
          <div><strong>Sandbox:</strong> https://sis-t.redsys.es:25443/sis/realizarPago</div>
          <div><strong>Producción:</strong> https://sis.redsys.es/sis/realizarPago</div>
        </div>
      </div>
    </div>
    )
  }

  const renderBizumConfig = () => {
    console.log('🟠 Renderizando configuración de Bizum')
    return (
    <div className="space-y-4">
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <h4 className="font-semibold text-orange-800 mb-2">Configuración Bizum</h4>
        <p className="text-sm text-orange-700">
          Configuración para pagos con Bizum. Integrado con Redsys TPV.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="bizum-merchant">Código de Comercio Bizum *</Label>
          <Input
            id="bizum-merchant"
            value={formData.configuration.merchantCode}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              configuration: { ...prev.configuration, merchantCode: e.target.value }
            }))}
            placeholder="999008881"
            className="font-mono"
          />
          <p className="text-xs text-gray-500 mt-1">Mismo código que Redsys si está integrado</p>
        </div>

        <div>
          <Label htmlFor="bizum-terminal">Terminal Bizum</Label>
          <Input
            id="bizum-terminal"
            value={formData.configuration.terminal}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              configuration: { ...prev.configuration, terminal: e.target.value }
            }))}
            placeholder="2"
            className="font-mono"
          />
          <p className="text-xs text-gray-500 mt-1">Terminal específico para Bizum</p>
        </div>

        <div>
          <Label htmlFor="bizum-concept">Concepto por Defecto</Label>
          <Input
            id="bizum-concept"
            value={formData.configuration.concept}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              configuration: { ...prev.configuration, concept: e.target.value }
            }))}
            placeholder="Compra en tienda online"
            maxLength={35}
          />
          <p className="text-xs text-gray-500 mt-1">Máximo 35 caracteres</p>
        </div>

        <div>
          <Label htmlFor="bizum-phone">Teléfono de Pruebas</Label>
          <Input
            id="bizum-phone"
            value={formData.configuration.phoneNumber}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              configuration: { ...prev.configuration, phoneNumber: e.target.value }
            }))}
            placeholder="+34600000000"
            className="font-mono"
          />
          <p className="text-xs text-gray-500 mt-1">Para pruebas en sandbox</p>
        </div>
      </div>

      <div>
        <Label htmlFor="bizum-secret">Clave Secreta Bizum *</Label>
        <div className="relative">
          <Input
            id="bizum-secret"
            type={showSecrets ? "text" : "password"}
            value={formData.configuration.secretKey}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              configuration: { ...prev.configuration, secretKey: e.target.value }
            }))}
            placeholder="sq7HjrUOBfKmC576ILgskD5srU870gJ7"
            className="font-mono pr-10"
          />
          <button
            type="button"
            onClick={() => setShowSecrets(!showSecrets)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
          >
            {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">Puede ser la misma que Redsys</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h5 className="font-medium text-blue-800 mb-2">Información Importante</h5>
        <div className="text-sm text-blue-700 space-y-2">
          <div>• Bizum funciona solo con números de teléfono españoles</div>
          <div>• Límites: 0,50€ - 1.000€ por transacción</div>
          <div>• Máximo 2.000€ al mes por usuario</div>
          <div>• Disponible 24/7 incluyendo festivos</div>
        </div>
      </div>
    </div>
    )
  }

  const renderGeneralConfig = () => {
    console.log('🟠 Renderizando configuración general')
    return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="gateway-name">Nombre de la Pasarela *</Label>
          <Input
            id="gateway-name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Redsys TPV Principal"
          />
        </div>

        <div>
          <Label htmlFor="provider">Proveedor</Label>
          <Select value={formData.provider} onValueChange={(value: PaymentGateway['provider']) => 
            setFormData(prev => ({ ...prev, provider: value }))
          }>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="redsys">Redsys</SelectItem>
              <SelectItem value="bizum">Bizum</SelectItem>
              <SelectItem value="stripe">Stripe</SelectItem>
              <SelectItem value="paypal">PayPal</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="environment">Entorno</Label>
          <Select value={formData.configuration.environment} onValueChange={(value: 'sandbox' | 'production') => 
            setFormData(prev => ({
              ...prev,
              configuration: { ...prev.configuration, environment: value }
            }))
          }>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sandbox">Sandbox (Pruebas)</SelectItem>
              <SelectItem value="production">Producción</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            checked={formData.isEnabled}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isEnabled: checked }))}
          />
          <Label>Activar Pasarela</Label>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold">Comisiones</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="fixed-fee">Comisión Fija</Label>
            <Input
              id="fixed-fee"
              type="number"
              step="0.01"
              min="0"
              value={formData.fees.fixedFee}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                fees: { ...prev.fees, fixedFee: parseFloat(e.target.value) || 0 }
              }))}
            />
          </div>

          <div>
            <Label htmlFor="percentage-fee">Comisión Porcentual (%)</Label>
            <Input
              id="percentage-fee"
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={formData.fees.percentageFee}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                fees: { ...prev.fees, percentageFee: parseFloat(e.target.value) || 0 }
              }))}
            />
          </div>

          <div>
            <Label htmlFor="fee-currency">Moneda</Label>
            <Select value={formData.fees.currency} onValueChange={(value) => 
              setFormData(prev => ({
                ...prev,
                fees: { ...prev.fees, currency: value }
              }))
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold">Límites de Transacción</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="min-amount">Monto Mínimo (€)</Label>
            <Input
              id="min-amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.limits.minAmount}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                limits: { ...prev.limits, minAmount: parseFloat(e.target.value) || 0 }
              }))}
            />
          </div>

          <div>
            <Label htmlFor="max-amount">Monto Máximo (€)</Label>
            <Input
              id="max-amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.limits.maxAmount}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                limits: { ...prev.limits, maxAmount: parseFloat(e.target.value) || 0 }
              }))}
            />
          </div>

          <div>
            <Label htmlFor="daily-limit">Límite Diario (€)</Label>
            <Input
              id="daily-limit"
              type="number"
              step="0.01"
              min="0"
              value={formData.limits.dailyLimit}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                limits: { ...prev.limits, dailyLimit: parseFloat(e.target.value) || 0 }
              }))}
            />
          </div>

          <div>
            <Label htmlFor="monthly-limit">Límite Mensual (€)</Label>
            <Input
              id="monthly-limit"
              type="number"
              step="0.01"
              min="0"
              value={formData.limits.monthlyLimit}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                limits: { ...prev.limits, monthlyLimit: parseFloat(e.target.value) || 0 }
              }))}
            />
          </div>
        </div>
      </div>
    </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="specific">
            {formData.provider === 'redsys' ? 'Redsys' : 
             formData.provider === 'bizum' ? 'Bizum' : 'Configuración'}
          </TabsTrigger>
          <TabsTrigger value="test">Pruebas</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          {renderGeneralConfig()}
        </TabsContent>

        <TabsContent value="specific" className="space-y-4">
          {(() => {
            if (formData.provider === 'redsys') {
              return renderRedsysConfig()
            }
            if (formData.provider === 'bizum') {
              return renderBizumConfig()
            }
            return (
              <div className="text-center py-8 text-gray-500">
                <div className="mb-4">
                  <p className="text-lg font-medium">Selecciona un proveedor de pago</p>
                  <p className="text-sm mt-2">Elige Redsys o Bizum para ver las opciones de configuración específicas</p>
                </div>
                <div className="text-xs text-gray-400">
                  Proveedor actual: "{formData.provider}"
                </div>
              </div>
            )
          })()}
        </TabsContent>

        <TabsContent value="test" className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">Modo de Pruebas</h4>
            <p className="text-sm text-blue-700 mb-4">
              Configura el entorno de pruebas para validar la configuración antes de pasar a producción.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Usar Entorno Sandbox</Label>
                  <p className="text-xs text-gray-600">Todas las transacciones serán de prueba</p>
                </div>
                <Switch
                  checked={formData.configuration.environment === 'sandbox'}
                  onCheckedChange={(checked) => setFormData(prev => ({
                    ...prev,
                    configuration: {
                      ...prev.configuration,
                      environment: checked ? 'sandbox' : 'production'
                    }
                  }))}
                />
              </div>

              {formData.provider === 'redsys' && (
                <div className="bg-white border rounded-lg p-4">
                  <h5 className="font-medium mb-2">Datos de Prueba Redsys</h5>
                  <div className="text-sm space-y-1">
                    <div><strong>Tarjeta de Prueba:</strong> 4548812049400004</div>
                    <div><strong>Caducidad:</strong> 12/30</div>
                    <div><strong>CVV:</strong> 123</div>
                    <div><strong>Resultado:</strong> Pago autorizado</div>
                  </div>
                </div>
              )}

              {formData.provider === 'bizum' && (
                <div className="bg-white border rounded-lg p-4">
                  <h5 className="font-medium mb-2">Datos de Prueba Bizum</h5>
                  <div className="text-sm space-y-1">
                    <div><strong>Teléfono:</strong> +34600000000</div>
                    <div><strong>Resultado:</strong> Pago autorizado</div>
                    <div><strong>Teléfono Error:</strong> +34600000001</div>
                    <div><strong>Resultado:</strong> Pago denegado</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex items-center justify-end gap-3 pt-6 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
          <Settings className="h-4 w-4 mr-2" />
          Guardar Configuración
        </Button>
      </div>
    </form>
  )
}