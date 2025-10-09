"use client"

import React, { useState, useEffect } from 'react'
import { 
  DollarSign,
  Calculator,
  TrendingUp,
  Settings,
  Plus,
  Minus,
  Edit,
  Trash2,
  Copy,
  Save,
  RefreshCw,
  Target,
  Zap,
  Clock,
  Users,
  Star,
  AlertTriangle,
  Check,
  X,
  Info,
  PieChart,
  BarChart3,
  Activity
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { toast } from 'react-hot-toast'

interface PricingRule {
  id: string
  name: string
  description: string
  type: 'base' | 'element' | 'complexity' | 'time' | 'volume' | 'rush' | 'special'
  conditions: {
    elementType?: string
    complexity?: 'simple' | 'medium' | 'complex'
    timeEstimate?: { min: number; max: number }
    quantity?: { min: number; max: number }
    customerType?: 'new' | 'returning' | 'vip'
    rushDelivery?: boolean
  }
  pricing: {
    basePrice?: number
    pricePerUnit?: number
    percentage?: number
    multiplier?: number
    fixedPrice?: number
  }
  isActive: boolean
  priority: number
  validFrom: string
  validTo?: string
}

interface PricingTier {
  id: string
  name: string
  description: string
  minQuantity: number
  maxQuantity?: number
  discount: number
  isActive: boolean
}

interface ComplexityLevel {
  id: string
  name: string
  description: string
  criteria: string[]
  baseMultiplier: number
  timeMultiplier: number
  skillRequired: 'basic' | 'intermediate' | 'advanced' | 'expert'
  examples: string[]
}

interface PricingPreset {
  id: string
  name: string
  description: string
  rules: PricingRule[]
  isDefault: boolean
  category: string
}

interface AdvancedPricingConfigurationProps {
  productId?: string
  onSave?: (configuration: any) => void
  initialConfiguration?: any
  readonly?: boolean
}

export default function AdvancedPricingConfiguration({
  productId,
  onSave,
  initialConfiguration,
  readonly = false
}: AdvancedPricingConfigurationProps) {
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([])
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([])
  const [complexityLevels, setComplexityLevels] = useState<ComplexityLevel[]>([])
  const [pricingPresets, setPricingPresets] = useState<PricingPreset[]>([])
  
  const [selectedRule, setSelectedRule] = useState<PricingRule | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('rules')
  
  const [pricingCalculator, setPricingCalculator] = useState({
    elementType: 'text',
    complexity: 'simple',
    timeEstimate: 10,
    quantity: 1,
    customerType: 'new',
    rushDelivery: false
  })
  
  const [calculatedPrice, setCalculatedPrice] = useState(0)
  const [priceBreakdown, setPriceBreakdown] = useState<any>({})

  // Initialize with default configuration
  useEffect(() => {
    if (initialConfiguration) {
      setPricingRules(initialConfiguration.rules || [])
      setPricingTiers(initialConfiguration.tiers || [])
      setComplexityLevels(initialConfiguration.complexityLevels || getDefaultComplexityLevels())
    } else {
      loadDefaultConfiguration()
    }
  }, [initialConfiguration])

  // Recalculate price when calculator values change
  useEffect(() => {
    calculatePrice()
  }, [pricingCalculator, pricingRules, pricingTiers, complexityLevels])

  const loadDefaultConfiguration = () => {
    setPricingRules(getDefaultPricingRules())
    setPricingTiers(getDefaultPricingTiers())
    setComplexityLevels(getDefaultComplexityLevels())
    setPricingPresets(getDefaultPresets())
  }

  const getDefaultPricingRules = (): PricingRule[] => [
    {
      id: 'base-text',
      name: 'Texto Base',
      description: 'Precio base para elementos de texto',
      type: 'element',
      conditions: { elementType: 'text' },
      pricing: { basePrice: 2.50 },
      isActive: true,
      priority: 1,
      validFrom: new Date().toISOString()
    },
    {
      id: 'base-image',
      name: 'Imagen Base',
      description: 'Precio base para elementos de imagen',
      type: 'element',
      conditions: { elementType: 'image' },
      pricing: { basePrice: 5.00 },
      isActive: true,
      priority: 1,
      validFrom: new Date().toISOString()
    },
    {
      id: 'complexity-multiplier',
      name: 'Multiplicador de Complejidad',
      description: 'Ajuste de precio basado en complejidad',
      type: 'complexity',
      conditions: {},
      pricing: { multiplier: 1.5 },
      isActive: true,
      priority: 2,
      validFrom: new Date().toISOString()
    },
    {
      id: 'rush-delivery',
      name: 'Entrega Urgente',
      description: 'Recargo por entrega urgente (24h)',
      type: 'rush',
      conditions: { rushDelivery: true },
      pricing: { percentage: 50 },
      isActive: true,
      priority: 3,
      validFrom: new Date().toISOString()
    }
  ]

  const getDefaultPricingTiers = (): PricingTier[] => [
    {
      id: 'tier-1',
      name: 'Cantidad Estándar',
      description: '1-10 unidades',
      minQuantity: 1,
      maxQuantity: 10,
      discount: 0,
      isActive: true
    },
    {
      id: 'tier-2',
      name: 'Cantidad Media',
      description: '11-50 unidades',
      minQuantity: 11,
      maxQuantity: 50,
      discount: 10,
      isActive: true
    },
    {
      id: 'tier-3',
      name: 'Cantidad Grande',
      description: '51+ unidades',
      minQuantity: 51,
      discount: 20,
      isActive: true
    }
  ]

  const getDefaultComplexityLevels = (): ComplexityLevel[] => [
    {
      id: 'simple',
      name: 'Simple',
      description: 'Diseños básicos con elementos simples',
      criteria: ['Texto plano', 'Formas básicas', 'Colores sólidos'],
      baseMultiplier: 1.0,
      timeMultiplier: 1.0,
      skillRequired: 'basic',
      examples: ['Texto con nombre', 'Logo simple', 'Forma geométrica']
    },
    {
      id: 'medium',
      name: 'Medio',
      description: 'Diseños con cierta complejidad',
      criteria: ['Múltiples elementos', 'Efectos básicos', 'Composición elaborada'],
      baseMultiplier: 1.5,
      timeMultiplier: 1.3,
      skillRequired: 'intermediate',
      examples: ['Texto con efectos', 'Composición con imágenes', 'Degradados']
    },
    {
      id: 'complex',
      name: 'Complejo',
      description: 'Diseños avanzados y elaborados',
      criteria: ['Efectos avanzados', 'Múltiples capas', 'Ilustraciones detalladas'],
      baseMultiplier: 2.5,
      timeMultiplier: 2.0,
      skillRequired: 'advanced',
      examples: ['Ilustraciones personalizadas', 'Efectos 3D', 'Composiciones artísticas']
    },
    {
      id: 'expert',
      name: 'Experto',
      description: 'Diseños que requieren máxima experiencia',
      criteria: ['Técnicas avanzadas', 'Originalidad total', 'Complejidad extrema'],
      baseMultiplier: 4.0,
      timeMultiplier: 3.0,
      skillRequired: 'expert',
      examples: ['Arte digital original', 'Diseños únicos exclusivos', 'Técnicas experimentales']
    }
  ]

  const getDefaultPresets = (): PricingPreset[] => [
    {
      id: 'wedding-events',
      name: 'Bodas y Eventos',
      description: 'Configuración optimizada para eventos especiales',
      rules: [...getDefaultPricingRules()],
      isDefault: false,
      category: 'events'
    },
    {
      id: 'corporate',
      name: 'Corporativo',
      description: 'Precios para clientes empresariales',
      rules: [...getDefaultPricingRules()],
      isDefault: false,
      category: 'business'
    }
  ]

  const calculatePrice = () => {
    let totalPrice = 0
    const breakdown: any = {
      base: 0,
      complexity: 0,
      volume: 0,
      rush: 0,
      special: 0,
      total: 0
    }

    // Find applicable rules
    const applicableRules = pricingRules
      .filter(rule => rule.isActive)
      .filter(rule => isRuleApplicable(rule, pricingCalculator))
      .sort((a, b) => a.priority - b.priority)

    // Calculate base price
    const baseRule = applicableRules.find(rule => rule.type === 'element')
    if (baseRule && baseRule.pricing.basePrice) {
      breakdown.base = baseRule.pricing.basePrice
      totalPrice += breakdown.base
    }

    // Apply complexity multiplier
    const complexityLevel = complexityLevels.find(level => level.id === pricingCalculator.complexity)
    if (complexityLevel) {
      breakdown.complexity = totalPrice * (complexityLevel.baseMultiplier - 1)
      totalPrice *= complexityLevel.baseMultiplier
    }

    // Apply volume discounts
    const applicableTier = pricingTiers
      .filter(tier => tier.isActive)
      .find(tier => 
        pricingCalculator.quantity >= tier.minQuantity && 
        (!tier.maxQuantity || pricingCalculator.quantity <= tier.maxQuantity)
      )
    
    if (applicableTier && applicableTier.discount > 0) {
      breakdown.volume = -totalPrice * (applicableTier.discount / 100)
      totalPrice *= (1 - applicableTier.discount / 100)
    }

    // Apply rush delivery
    if (pricingCalculator.rushDelivery) {
      const rushRule = applicableRules.find(rule => rule.type === 'rush')
      if (rushRule && rushRule.pricing.percentage) {
        breakdown.rush = totalPrice * (rushRule.pricing.percentage / 100)
        totalPrice *= (1 + rushRule.pricing.percentage / 100)
      }
    }

    // Apply quantity
    totalPrice *= pricingCalculator.quantity

    breakdown.total = totalPrice
    setCalculatedPrice(totalPrice)
    setPriceBreakdown(breakdown)
  }

  const isRuleApplicable = (rule: PricingRule, calculator: any): boolean => {
    const { conditions } = rule
    
    if (conditions.elementType && conditions.elementType !== calculator.elementType) return false
    if (conditions.complexity && conditions.complexity !== calculator.complexity) return false
    if (conditions.customerType && conditions.customerType !== calculator.customerType) return false
    if (conditions.rushDelivery !== undefined && conditions.rushDelivery !== calculator.rushDelivery) return false
    
    if (conditions.timeEstimate) {
      if (calculator.timeEstimate < conditions.timeEstimate.min || 
          calculator.timeEstimate > conditions.timeEstimate.max) return false
    }
    
    if (conditions.quantity) {
      if (calculator.quantity < conditions.quantity.min || 
          calculator.quantity > conditions.quantity.max) return false
    }
    
    return true
  }

  const addPricingRule = () => {
    const newRule: PricingRule = {
      id: `rule-${Date.now()}`,
      name: 'Nueva Regla',
      description: '',
      type: 'base',
      conditions: {},
      pricing: { basePrice: 0 },
      isActive: true,
      priority: pricingRules.length + 1,
      validFrom: new Date().toISOString()
    }
    setPricingRules(prev => [...prev, newRule])
    setSelectedRule(newRule)
    setIsEditing(true)
  }

  const updatePricingRule = (rule: PricingRule) => {
    setPricingRules(prev => prev.map(r => r.id === rule.id ? rule : r))
    if (selectedRule?.id === rule.id) {
      setSelectedRule(rule)
    }
  }

  const deletePricingRule = (ruleId: string) => {
    setPricingRules(prev => prev.filter(r => r.id !== ruleId))
    if (selectedRule?.id === ruleId) {
      setSelectedRule(null)
      setIsEditing(false)
    }
  }

  const duplicatePricingRule = (rule: PricingRule) => {
    const duplicated: PricingRule = {
      ...rule,
      id: `rule-${Date.now()}`,
      name: `${rule.name} (Copia)`,
      priority: pricingRules.length + 1
    }
    setPricingRules(prev => [...prev, duplicated])
  }

  const handleSave = () => {
    const configuration = {
      rules: pricingRules,
      tiers: pricingTiers,
      complexityLevels,
      presets: pricingPresets,
      lastUpdated: new Date().toISOString()
    }
    
    if (onSave) {
      onSave(configuration)
    }
    
    toast.success('Configuración de precios guardada')
  }

  const applyPreset = (preset: PricingPreset) => {
    setPricingRules(preset.rules)
    toast.success(`Preset "${preset.name}" aplicado`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calculator className="w-6 h-6" />
            Configuración Avanzada de Precios
          </h2>
          <p className="text-gray-600 mt-1">
            Configura reglas dinámicas de precios para personalización
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadDefaultConfiguration}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Resetear
          </Button>
          <Button onClick={handleSave} disabled={readonly}>
            <Save className="w-4 h-4 mr-2" />
            Guardar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Configuration Panel */}
        <div className="xl:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="rules">Reglas</TabsTrigger>
              <TabsTrigger value="tiers">Niveles</TabsTrigger>
              <TabsTrigger value="complexity">Complejidad</TabsTrigger>
              <TabsTrigger value="presets">Presets</TabsTrigger>
            </TabsList>

            {/* Pricing Rules Tab */}
            <TabsContent value="rules" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Reglas de Precios</CardTitle>
                    <Button onClick={addPricingRule} disabled={readonly}>
                      <Plus className="w-4 h-4 mr-2" />
                      Nueva Regla
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pricingRules.map((rule) => (
                      <div
                        key={rule.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedRule?.id === rule.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                        } ${!rule.isActive ? 'opacity-50' : ''}`}
                        onClick={() => setSelectedRule(rule)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{rule.name}</h4>
                              <Badge className={`${
                                rule.type === 'base' ? 'bg-blue-100 text-blue-800' :
                                rule.type === 'element' ? 'bg-green-100 text-green-800' :
                                rule.type === 'complexity' ? 'bg-purple-100 text-purple-800' :
                                rule.type === 'rush' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {rule.type}
                              </Badge>
                              {!rule.isActive && (
                                <Badge className="bg-gray-100 text-gray-800">
                                  Inactiva
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{rule.description}</p>
                            <div className="text-xs text-gray-500 mt-1">
                              Prioridad: {rule.priority} • 
                              {rule.pricing.basePrice && ` Base: ${rule.pricing.basePrice}€`}
                              {rule.pricing.percentage && ` Porcentaje: ${rule.pricing.percentage}%`}
                              {rule.pricing.multiplier && ` Multiplicador: ${rule.pricing.multiplier}x`}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedRule(rule)
                                setIsEditing(true)
                              }}
                              disabled={readonly}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                duplicatePricingRule(rule)
                              }}
                              disabled={readonly}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                deletePricingRule(rule.id)
                              }}
                              disabled={readonly}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Rule Editor */}
              {selectedRule && isEditing && (
                <Card>
                  <CardHeader>
                    <CardTitle>Editar Regla</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PricingRuleEditor
                      rule={selectedRule}
                      onUpdate={updatePricingRule}
                      onCancel={() => setIsEditing(false)}
                      readonly={readonly}
                    />
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Pricing Tiers Tab */}
            <TabsContent value="tiers" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Niveles de Cantidad</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pricingTiers.map((tier) => (
                      <div key={tier.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{tier.name}</h4>
                            <p className="text-sm text-gray-600">{tier.description}</p>
                            <div className="text-xs text-gray-500 mt-1">
                              {tier.minQuantity}+ unidades • {tier.discount}% descuento
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={tier.isActive}
                              onCheckedChange={(checked) => {
                                setPricingTiers(prev => prev.map(t => 
                                  t.id === tier.id ? { ...t, isActive: checked } : t
                                ))
                              }}
                              disabled={readonly}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Complexity Levels Tab */}
            <TabsContent value="complexity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Niveles de Complejidad</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {complexityLevels.map((level) => (
                      <div key={level.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium flex items-center gap-2">
                              {level.name}
                              <Badge className={`${
                                level.skillRequired === 'basic' ? 'bg-green-100 text-green-800' :
                                level.skillRequired === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                level.skillRequired === 'advanced' ? 'bg-orange-100 text-orange-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {level.skillRequired}
                              </Badge>
                            </h4>
                            <p className="text-sm text-gray-600">{level.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {level.baseMultiplier}x precio
                            </div>
                            <div className="text-xs text-gray-500">
                              {level.timeMultiplier}x tiempo
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div>
                            <Label className="text-xs font-medium">Criterios:</Label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {level.criteria.map((criterion, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {criterion}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <Label className="text-xs font-medium">Ejemplos:</Label>
                            <div className="text-xs text-gray-600 mt-1">
                              {level.examples.join(', ')}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Presets Tab */}
            <TabsContent value="presets" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Presets de Configuración</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pricingPresets.map((preset) => (
                      <div key={preset.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium flex items-center gap-2">
                              {preset.name}
                              {preset.isDefault && (
                                <Badge className="bg-blue-100 text-blue-800">
                                  Por defecto
                                </Badge>
                              )}
                            </h4>
                            <p className="text-sm text-gray-600">{preset.description}</p>
                            <div className="text-xs text-gray-500 mt-1">
                              {preset.rules.length} reglas • Categoría: {preset.category}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => applyPreset(preset)}
                            disabled={readonly}
                          >
                            Aplicar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Price Calculator Sidebar */}
        <div className="space-y-6">
          {/* Calculator */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Calculadora de Precios
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Tipo de Elemento</Label>
                <Select
                  value={pricingCalculator.elementType}
                  onValueChange={(value) => setPricingCalculator(prev => ({ ...prev, elementType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Texto</SelectItem>
                    <SelectItem value="image">Imagen</SelectItem>
                    <SelectItem value="shape">Forma</SelectItem>
                    <SelectItem value="background">Fondo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Complejidad</Label>
                <Select
                  value={pricingCalculator.complexity}
                  onValueChange={(value) => setPricingCalculator(prev => ({ ...prev, complexity: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {complexityLevels.map(level => (
                      <SelectItem key={level.id} value={level.id}>
                        {level.name} ({level.baseMultiplier}x)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">
                  Tiempo Estimado: {pricingCalculator.timeEstimate} min
                </Label>
                <Slider
                  value={[pricingCalculator.timeEstimate]}
                  onValueChange={([value]) => setPricingCalculator(prev => ({ ...prev, timeEstimate: value }))}
                  min={5}
                  max={120}
                  step={5}
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Cantidad</Label>
                <Input
                  type="number"
                  value={pricingCalculator.quantity}
                  onChange={(e) => setPricingCalculator(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                  min={1}
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Tipo de Cliente</Label>
                <Select
                  value={pricingCalculator.customerType}
                  onValueChange={(value) => setPricingCalculator(prev => ({ ...prev, customerType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Nuevo</SelectItem>
                    <SelectItem value="returning">Recurrente</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="rush-delivery"
                  checked={pricingCalculator.rushDelivery}
                  onCheckedChange={(checked) => setPricingCalculator(prev => ({ ...prev, rushDelivery: checked }))}
                />
                <Label htmlFor="rush-delivery" className="text-sm">
                  Entrega Urgente
                </Label>
              </div>

              <Separator />

              {/* Price Display */}
              <div className="space-y-3">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {calculatedPrice.toFixed(2)}€
                  </div>
                  <div className="text-sm text-gray-600">
                    Precio total calculado
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 text-sm">
                  {Object.entries(priceBreakdown).map(([key, value]) => {
                    if (key === 'total' || value === 0) return null
                    return (
                      <div key={key} className="flex justify-between">
                        <span className="capitalize">{key}:</span>
                        <span className={value > 0 ? 'text-green-600' : 'text-red-600'}>
                          {value > 0 ? '+' : ''}{(value as number).toFixed(2)}€
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Estadísticas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Reglas activas:</span>
                <Badge className="bg-green-100 text-green-800">
                  {pricingRules.filter(r => r.isActive).length}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Niveles de cantidad:</span>
                <Badge className="bg-blue-100 text-blue-800">
                  {pricingTiers.filter(t => t.isActive).length}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Niveles de complejidad:</span>
                <Badge className="bg-purple-100 text-purple-800">
                  {complexityLevels.length}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Pricing Rule Editor Component
function PricingRuleEditor({
  rule,
  onUpdate,
  onCancel,
  readonly = false
}: {
  rule: PricingRule
  onUpdate: (rule: PricingRule) => void
  onCancel: () => void
  readonly?: boolean
}) {
  const [editedRule, setEditedRule] = useState<PricingRule>({ ...rule })

  const handleSave = () => {
    onUpdate(editedRule)
    onCancel()
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Nombre</Label>
          <Input
            value={editedRule.name}
            onChange={(e) => setEditedRule(prev => ({ ...prev, name: e.target.value }))}
            disabled={readonly}
          />
        </div>
        <div>
          <Label>Tipo</Label>
          <Select
            value={editedRule.type}
            onValueChange={(value) => setEditedRule(prev => ({ ...prev, type: value as any }))}
            disabled={readonly}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="base">Base</SelectItem>
              <SelectItem value="element">Elemento</SelectItem>
              <SelectItem value="complexity">Complejidad</SelectItem>
              <SelectItem value="time">Tiempo</SelectItem>
              <SelectItem value="volume">Volumen</SelectItem>
              <SelectItem value="rush">Urgente</SelectItem>
              <SelectItem value="special">Especial</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Descripción</Label>
        <Input
          value={editedRule.description}
          onChange={(e) => setEditedRule(prev => ({ ...prev, description: e.target.value }))}
          disabled={readonly}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Precio Base (€)</Label>
          <Input
            type="number"
            step="0.01"
            value={editedRule.pricing.basePrice || ''}
            onChange={(e) => setEditedRule(prev => ({
              ...prev,
              pricing: { ...prev.pricing, basePrice: Number(e.target.value) }
            }))}
            disabled={readonly}
          />
        </div>
        <div>
          <Label>Porcentaje (%)</Label>
          <Input
            type="number"
            value={editedRule.pricing.percentage || ''}
            onChange={(e) => setEditedRule(prev => ({
              ...prev,
              pricing: { ...prev.pricing, percentage: Number(e.target.value) }
            }))}
            disabled={readonly}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Multiplicador</Label>
          <Input
            type="number"
            step="0.1"
            value={editedRule.pricing.multiplier || ''}
            onChange={(e) => setEditedRule(prev => ({
              ...prev,
              pricing: { ...prev.pricing, multiplier: Number(e.target.value) }
            }))}
            disabled={readonly}
          />
        </div>
        <div>
          <Label>Prioridad</Label>
          <Input
            type="number"
            value={editedRule.priority}
            onChange={(e) => setEditedRule(prev => ({ ...prev, priority: Number(e.target.value) }))}
            disabled={readonly}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="active"
          checked={editedRule.isActive}
          onCheckedChange={(checked) => setEditedRule(prev => ({ ...prev, isActive: checked }))}
          disabled={readonly}
        />
        <Label htmlFor="active">Regla activa</Label>
      </div>

      <div className="flex gap-2 pt-4">
        <Button onClick={handleSave} disabled={readonly}>
          <Check className="w-4 h-4 mr-2" />
          Guardar
        </Button>
        <Button variant="outline" onClick={onCancel}>
          <X className="w-4 h-4 mr-2" />
          Cancelar
        </Button>
      </div>
    </div>
  )
}