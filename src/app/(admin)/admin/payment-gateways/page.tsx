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
  provider: 'stripe' | 'paypal' | 'redsys' | 'bizum' | 'apple_pay' | 'google_pay' | 'klarna' | 'afterpay'
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
  }, [])

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
      const response = await fetch(`/api/payment-gateways/${gatewayId}/test`, {
        method: 'POST'
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          toast.success('Prueba de pasarela exitosa')
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
          <p className="text-gray-600 mt-2">Gestión integral de métodos de pago y pasarelas</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center space-x-2">
            <Switch
              id="test-mode"
              checked={testMode}
              onCheckedChange={setTestMode}
            />
            <Label htmlFor="test-mode" className="text-sm">Modo Test</Label>
          </div>
          <Button onClick={() => loadPaymentStats()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Dialog open={isConfiguring} onOpenChange={setIsConfiguring}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Pasarela
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Configurar Nueva Pasarela</DialogTitle>
                <DialogDescription>
                  Añade una nueva pasarela de pago al sistema
                </DialogDescription>
              </DialogHeader>
              {/* Configuración de pasarela aquí */}
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
                            {gateway.isLive ? (
                              <><Shield className="h-3 w-3 text-green-500" />Producción</>
                            ) : (
                              <><TestTube className="h-3 w-3 text-blue-500" />Sandbox</>
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
                        <Button size="sm" variant="outline" onClick={() => setSelectedGateway(gateway)}>
                          <Settings className="h-3 w-3 mr-1" />
                          Configurar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => testGateway(gateway.id)}
                          disabled={loading}
                        >
                          <TestTube className="h-3 w-3 mr-1" />
                          Probar
                        </Button>
                        <Badge variant="outline" className="ml-auto">
                          {gateway.features.recurringPayments && '🔄'}
                          {gateway.features.refunds && '↩️'}
                          {gateway.features['3dSecure'] && '🔒'}
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
                    <Switch checked={testMode} onCheckedChange={setTestMode} />
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