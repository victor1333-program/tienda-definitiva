"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { 
  Trophy,
  Star,
  Gift,
  Users,
  TrendingUp,
  Calendar,
  Award,
  Crown,
  Zap,
  Heart,
  Percent,
  Target,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  RefreshCw,
  Coins,
  ShoppingBag,
  Clock,
  CheckCircle
} from "lucide-react"

interface LoyaltyProgram {
  id: string
  name: string
  description: string
  isActive: boolean
  pointsPerEuro: number
  minimumRedemption: number
  expirationMonths: number
  tiers: LoyaltyTier[]
  rewards: LoyaltyReward[]
  rules: LoyaltyRule[]
}

interface LoyaltyTier {
  id: string
  name: string
  minPoints: number
  benefits: string[]
  color: string
  icon: string
  multiplier: number
  perks: {
    freeShipping: boolean
    prioritySupport: boolean
    exclusiveOffers: boolean
    birthdayBonus: number
  }
}

interface LoyaltyReward {
  id: string
  name: string
  description: string
  pointsCost: number
  type: 'discount' | 'product' | 'shipping' | 'experience'
  value: number
  isActive: boolean
  category: string
  image?: string
  limitPerCustomer?: number
  validUntil?: string
}

interface LoyaltyRule {
  id: string
  action: string
  points: number
  description: string
  isActive: boolean
  frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'unlimited'
}

interface CustomerLoyalty {
  id: string
  customerName: string
  customerEmail: string
  totalPoints: number
  availablePoints: number
  currentTier: string
  nextTier?: string
  pointsToNextTier?: number
  joinDate: string
  lastActivity: string
  lifetimeSpent: number
  rewardsRedeemed: number
}

export default function LoyaltyProgramPage() {
  const [program, setProgram] = useState<LoyaltyProgram | null>(null)
  const [customers, setCustomers] = useState<CustomerLoyalty[]>([])
  const [selectedTab, setSelectedTab] = useState('overview')
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    pointsIssued: 0,
    rewardsRedeemed: 0,
    averagePoints: 0,
    conversionRate: 0
  })

  useEffect(() => {
    loadLoyaltyProgram()
    loadCustomers()
    loadStats()
  }, [])

  const loadLoyaltyProgram = async () => {
    try {
      const response = await fetch('/api/loyalty-program/config')
      if (response.ok) {
        const data = await response.json()
        setProgram(data)
      }
    } catch (error) {
      console.error('Error loading loyalty program:', error)
    }
  }

  const loadCustomers = async () => {
    try {
      const response = await fetch('/api/loyalty-program/customers')
      if (response.ok) {
        const data = await response.json()
        setCustomers(data)
      }
    } catch (error) {
      console.error('Error loading customers:', error)
    }
  }

  const loadStats = async () => {
    try {
      const response = await fetch('/api/loyalty-program/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const saveProgram = async () => {
    if (!program) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/loyalty-program/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(program)
      })
      
      if (response.ok) {
        toast.success('Programa de fidelización guardado')
        loadLoyaltyProgram()
      } else {
        toast.error('Error al guardar el programa')
      }
    } catch (error) {
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const getTierIcon = (icon: string) => {
    switch (icon) {
      case 'bronze': return <Award className="h-5 w-5" />
      case 'silver': return <Star className="h-5 w-5" />
      case 'gold': return <Crown className="h-5 w-5" />
      case 'platinum': return <Trophy className="h-5 w-5" />
      default: return <Award className="h-5 w-5" />
    }
  }

  const getTierProgress = (customer: CustomerLoyalty) => {
    if (!program || !customer.nextTier) return 100
    const currentTier = program.tiers.find(t => t.name === customer.currentTier)
    const nextTier = program.tiers.find(t => t.name === customer.nextTier)
    if (!currentTier || !nextTier) return 0
    
    const pointsInTier = customer.totalPoints - currentTier.minPoints
    const pointsNeeded = nextTier.minPoints - currentTier.minPoints
    return Math.min(100, (pointsInTier / pointsNeeded) * 100)
  }

  const exportCustomers = async () => {
    try {
      const response = await fetch('/api/loyalty-program/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format: 'csv' })
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `loyalty-program-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      toast.error('Error al exportar datos')
    }
  }

  if (!program) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Programa de Fidelización</h1>
          <p className="text-gray-600 mt-2">Sistema de puntos y recompensas para clientes</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={program.isActive ? "default" : "secondary"} className="px-3 py-1">
            <Zap className="h-4 w-4 mr-1" />
            {program.isActive ? 'Activo' : 'Inactivo'}
          </Badge>
          <Button onClick={exportCustomers}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={loadStats}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Miembros</p>
                <p className="text-xl font-bold">{stats.totalMembers.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Activos</p>
                <p className="text-xl font-bold">{stats.activeMembers.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Puntos Emitidos</p>
                <p className="text-xl font-bold">{stats.pointsIssued.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Canjeados</p>
                <p className="text-xl font-bold">{stats.rewardsRedeemed.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Promedio</p>
                <p className="text-xl font-bold">{stats.averagePoints.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Percent className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Conversión</p>
                <p className="text-xl font-bold">{stats.conversionRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="tiers">Niveles</TabsTrigger>
          <TabsTrigger value="rewards">Recompensas</TabsTrigger>
          <TabsTrigger value="customers">Clientes</TabsTrigger>
          <TabsTrigger value="settings">Configuración</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Program Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Resumen del Programa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Estado</span>
                  <Badge variant={program.isActive ? "default" : "secondary"}>
                    {program.isActive ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Puntos por €</span>
                  <span className="font-semibold">{program.pointsPerEuro}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Canje mínimo</span>
                  <span className="font-semibold">{program.minimumRedemption} puntos</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Caducidad</span>
                  <span className="font-semibold">{program.expirationMonths} meses</span>
                </div>
              </CardContent>
            </Card>

            {/* Top Customers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  Top Clientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {customers.slice(0, 5).map((customer, index) => (
                    <div key={customer.id} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{customer.customerName}</p>
                        <p className="text-xs text-gray-600">{customer.totalPoints.toLocaleString()} puntos</p>
                      </div>
                      <Badge variant="outline">{customer.currentTier}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tiers Tab */}
        <TabsContent value="tiers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {program.tiers.map((tier) => (
              <Card key={tier.id} className="border-2" style={{ borderColor: tier.color }}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div style={{ color: tier.color }}>
                      {getTierIcon(tier.icon)}
                    </div>
                    {tier.name}
                  </CardTitle>
                  <CardDescription>
                    Desde {tier.minPoints.toLocaleString()} puntos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-center p-3 rounded-lg" style={{ backgroundColor: `${tier.color}15` }}>
                    <p className="text-lg font-bold" style={{ color: tier.color }}>
                      {tier.multiplier}x Puntos
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Beneficios:</p>
                    <ul className="space-y-1">
                      {tier.benefits.map((benefit, index) => (
                        <li key={index} className="text-xs text-gray-600 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {tier.perks.freeShipping && (
                    <Badge variant="secondary" className="text-xs">Envío Gratis</Badge>
                  )}
                  {tier.perks.prioritySupport && (
                    <Badge variant="secondary" className="text-xs">Soporte Prioritario</Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Rewards Tab */}
        <TabsContent value="rewards" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recompensas Disponibles</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Recompensa
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {program.rewards.map((reward) => (
              <Card key={reward.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{reward.name}</CardTitle>
                    <Badge variant={reward.isActive ? "default" : "secondary"}>
                      {reward.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                  <CardDescription>{reward.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Costo</span>
                    <span className="font-semibold text-orange-600">
                      {reward.pointsCost.toLocaleString()} puntos
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Valor</span>
                    <span className="font-semibold">
                      {reward.type === 'discount' && `${reward.value}% descuento`}
                      {reward.type === 'shipping' && 'Envío gratis'}
                      {reward.type === 'product' && `€${reward.value}`}
                      {reward.type === 'experience' && 'Experiencia'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Clientes del Programa</CardTitle>
              <CardDescription>
                Lista de todos los miembros del programa de fidelización
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customers.map((customer) => (
                  <div key={customer.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{customer.customerName}</h4>
                        <Badge variant="outline">{customer.currentTier}</Badge>
                        <span className="text-sm text-gray-600">{customer.customerEmail}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Puntos Totales</p>
                          <p className="font-semibold">{customer.totalPoints.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Disponibles</p>
                          <p className="font-semibold text-green-600">{customer.availablePoints.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Gastado Total</p>
                          <p className="font-semibold">€{customer.lifetimeSpent.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Recompensas</p>
                          <p className="font-semibold">{customer.rewardsRedeemed}</p>
                        </div>
                      </div>
                      
                      {customer.nextTier && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-gray-600">Progreso a {customer.nextTier}</span>
                            <span className="font-medium">
                              {customer.pointsToNextTier?.toLocaleString()} puntos restantes
                            </span>
                          </div>
                          <Progress value={getTierProgress(customer)} className="h-2" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Gift className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuración del Programa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="active">Programa Activo</Label>
                    <Switch
                      id="active"
                      checked={program.isActive}
                      onCheckedChange={(checked) => 
                        setProgram(prev => prev ? { ...prev, isActive: checked } : null)
                      }
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="pointsPerEuro">Puntos por Euro Gastado</Label>
                    <Input
                      id="pointsPerEuro"
                      type="number"
                      value={program.pointsPerEuro}
                      onChange={(e) => 
                        setProgram(prev => prev ? { 
                          ...prev, 
                          pointsPerEuro: parseInt(e.target.value) || 0 
                        } : null)
                      }
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="minimumRedemption">Canje Mínimo (puntos)</Label>
                    <Input
                      id="minimumRedemption"
                      type="number"
                      value={program.minimumRedemption}
                      onChange={(e) => 
                        setProgram(prev => prev ? { 
                          ...prev, 
                          minimumRedemption: parseInt(e.target.value) || 0 
                        } : null)
                      }
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="expirationMonths">Caducidad (meses)</Label>
                    <Input
                      id="expirationMonths"
                      type="number"
                      value={program.expirationMonths}
                      onChange={(e) => 
                        setProgram(prev => prev ? { 
                          ...prev, 
                          expirationMonths: parseInt(e.target.value) || 0 
                        } : null)
                      }
                    />
                  </div>
                </div>
              </div>
              
              <Button onClick={saveProgram} disabled={loading}>
                <Settings className="h-4 w-4 mr-2" />
                Guardar Configuración
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}