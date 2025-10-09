"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ColoredSwitch } from "@/components/ui/ColoredSwitch"
import { toast } from "react-hot-toast"
import { 
  Percent, 
  Plus,
  Save,
  Edit,
  Trash2,
  Globe,
  MapPin,
  Calculator,
  FileText,
  AlertCircle,
  CheckCircle,
  Info,
  Settings,
  Eye,
  Download
} from "lucide-react"

interface TaxRate {
  id: string
  name: string
  rate: number
  description: string
  type: 'standard' | 'reduced' | 'zero' | 'exempt'
  isDefault: boolean
  isActive: boolean
  applicableProducts: string[]
  countries: string[]
  regions: string[]
  createdAt: string
}

interface TaxZone {
  id: string
  name: string
  description: string
  countries: string[]
  regions: string[]
  defaultTaxRate: string
  isActive: boolean
}

interface TaxSettings {
  pricesIncludeTax: boolean
  displayTaxInCart: boolean
  roundingMode: 'up' | 'down' | 'nearest'
  compoundTaxes: boolean
  taxExemptOrders: boolean
  digitalProductTax: boolean
  shippingTaxable: boolean
}

export default function TaxSettingsPage() {
  const [taxRates, setTaxRates] = useState<TaxRate[]>([])
  const [taxZones, setTaxZones] = useState<TaxZone[]>([])
  const [settings, setSettings] = useState<TaxSettings>({
    pricesIncludeTax: false,
    displayTaxInCart: true,
    roundingMode: 'nearest',
    compoundTaxes: false,
    taxExemptOrders: true,
    digitalProductTax: true,
    shippingTaxable: true
  })
  
  const [isLoading, setIsLoading] = useState(true)
  const [showNewRateModal, setShowNewRateModal] = useState(false)
  const [showNewZoneModal, setShowNewZoneModal] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Mock data
  useEffect(() => {
    const mockTaxRates: TaxRate[] = [
      {
        id: "TAX-001",
        name: "IVA General",
        rate: 21,
        description: "Tipo general de IVA aplicable a la mayoría de productos",
        type: "standard",
        isDefault: true,
        isActive: true,
        applicableProducts: ["all"],
        countries: ["ES"],
        regions: ["all"],
        createdAt: "2024-01-15T10:00:00Z"
      },
      {
        id: "TAX-002",
        name: "IVA Reducido",
        rate: 10,
        description: "Tipo reducido para productos específicos",
        type: "reduced",
        isDefault: false,
        isActive: true,
        applicableProducts: ["books", "food"],
        countries: ["ES"],
        regions: ["all"],
        createdAt: "2024-01-15T10:05:00Z"
      },
      {
        id: "TAX-003",
        name: "IVA Superreducido",
        rate: 4,
        description: "Tipo superreducido para productos básicos",
        type: "reduced",
        isDefault: false,
        isActive: true,
        applicableProducts: ["medicine", "basic-food"],
        countries: ["ES"],
        regions: ["all"],
        createdAt: "2024-01-15T10:10:00Z"
      },
      {
        id: "TAX-004",
        name: "Canarias IGIC",
        rate: 7,
        description: "Impuesto General Indirecto Canario",
        type: "standard",
        isDefault: false,
        isActive: true,
        applicableProducts: ["all"],
        countries: ["ES"],
        regions: ["CN"],
        createdAt: "2024-02-01T11:00:00Z"
      },
      {
        id: "TAX-005",
        name: "Exento UE",
        rate: 0,
        description: "Productos exentos para envíos intracomunitarios",
        type: "exempt",
        isDefault: false,
        isActive: true,
        applicableProducts: ["all"],
        countries: ["EU"],
        regions: ["all"],
        createdAt: "2024-02-15T14:30:00Z"
      }
    ]

    const mockTaxZones: TaxZone[] = [
      {
        id: "ZONE-001",
        name: "España Peninsular",
        description: "España peninsular y Baleares",
        countries: ["ES"],
        regions: ["PE", "BA"],
        defaultTaxRate: "TAX-001",
        isActive: true
      },
      {
        id: "ZONE-002",
        name: "Canarias",
        description: "Islas Canarias",
        countries: ["ES"],
        regions: ["CN"],
        defaultTaxRate: "TAX-004",
        isActive: true
      },
      {
        id: "ZONE-003",
        name: "Unión Europea",
        description: "Países de la Unión Europea",
        countries: ["FR", "DE", "IT", "PT"],
        regions: ["all"],
        defaultTaxRate: "TAX-005",
        isActive: true
      },
      {
        id: "ZONE-004",
        name: "Internacional",
        description: "Resto del mundo",
        countries: ["*"],
        regions: ["all"],
        defaultTaxRate: "TAX-005",
        isActive: true
      }
    ]
    
    setTaxRates(mockTaxRates)
    setTaxZones(mockTaxZones)
    setIsLoading(false)
  }, [])

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      standard: { label: "Estándar", color: "bg-blue-100 text-blue-800" },
      reduced: { label: "Reducido", color: "bg-green-100 text-green-800" },
      zero: { label: "Cero", color: "bg-gray-100 text-gray-800" },
      exempt: { label: "Exento", color: "bg-yellow-100 text-yellow-800" }
    }
    
    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.standard
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success("Configuración de impuestos guardada correctamente")
      setHasChanges(false)
    } catch (error) {
      toast.error("Error al guardar la configuración")
    } finally {
      setIsLoading(false)
    }
  }

  const updateSettings = (field: string, value: any) => {
    setSettings({
      ...settings,
      [field]: value
    })
    setHasChanges(true)
  }

  const toggleTaxRateStatus = (rateId: string) => {
    setTaxRates(taxRates.map(rate => 
      rate.id === rateId ? { ...rate, isActive: !rate.isActive } : rate
    ))
    setHasChanges(true)
    toast.success("Estado del tipo de impuesto actualizado")
  }

  const setDefaultTaxRate = (rateId: string) => {
    setTaxRates(taxRates.map(rate => 
      ({ ...rate, isDefault: rate.id === rateId })
    ))
    setHasChanges(true)
    toast.success("Tipo de impuesto por defecto actualizado")
  }

  const deleteTaxRate = (rateId: string) => {
    const rate = taxRates.find(r => r.id === rateId)
    if (rate?.isDefault) {
      toast.error("No puedes eliminar el tipo de impuesto por defecto")
      return
    }
    
    if (confirm('¿Estás seguro de que quieres eliminar este tipo de impuesto?')) {
      setTaxRates(taxRates.filter(rate => rate.id !== rateId))
      setHasChanges(true)
      toast.success("Tipo de impuesto eliminado")
    }
  }

  const calculateTaxExample = (basePrice: number, taxRate: number) => {
    if (settings.pricesIncludeTax) {
      const taxAmount = basePrice - (basePrice / (1 + taxRate / 100))
      return {
        basePrice: basePrice - taxAmount,
        taxAmount,
        finalPrice: basePrice
      }
    } else {
      const taxAmount = basePrice * (taxRate / 100)
      return {
        basePrice,
        taxAmount,
        finalPrice: basePrice + taxAmount
      }
    }
  }

  const exportTaxSettings = () => {
    const exportData = {
      taxRates,
      taxZones,
      settings,
      exportDate: new Date().toISOString()
    }
    
    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'tax-settings.json'
    link.click()
    toast.success("Configuración de impuestos exportada")
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Configuración de Impuestos</h1>
            <p className="text-gray-600">Gestiona los tipos de impuestos y zonas fiscales</p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportTaxSettings}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!hasChanges || isLoading}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </div>
        
        {hasChanges && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">Tienes cambios sin guardar</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuración general */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configuración General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Precios con Impuestos Incluidos</Label>
                <p className="text-sm text-gray-600">Los precios mostrados incluyen impuestos</p>
              </div>
              <ColoredSwitch
                checked={settings.pricesIncludeTax}
                onCheckedChange={(checked) => updateSettings('pricesIncludeTax', checked)}
                activeColor="green"
                inactiveColor="gray"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Mostrar Impuestos en Carrito</Label>
                <p className="text-sm text-gray-600">Desglosar impuestos en el carrito</p>
              </div>
              <ColoredSwitch
                checked={settings.displayTaxInCart}
                onCheckedChange={(checked) => updateSettings('displayTaxInCart', checked)}
                activeColor="green"
                inactiveColor="gray"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Impuestos Compuestos</Label>
                <p className="text-sm text-gray-600">Aplicar impuestos sobre impuestos</p>
              </div>
              <ColoredSwitch
                checked={settings.compoundTaxes}
                onCheckedChange={(checked) => updateSettings('compoundTaxes', checked)}
                activeColor="green"
                inactiveColor="gray"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Pedidos Exentos</Label>
                <p className="text-sm text-gray-600">Permitir pedidos exentos de impuestos</p>
              </div>
              <ColoredSwitch
                checked={settings.taxExemptOrders}
                onCheckedChange={(checked) => updateSettings('taxExemptOrders', checked)}
                activeColor="green"
                inactiveColor="gray"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Impuesto en Envíos</Label>
                <p className="text-sm text-gray-600">Aplicar impuestos a los envíos</p>
              </div>
              <ColoredSwitch
                checked={settings.shippingTaxable}
                onCheckedChange={(checked) => updateSettings('shippingTaxable', checked)}
                activeColor="green"
                inactiveColor="gray"
              />
            </div>
            
            <div>
              <Label htmlFor="roundingMode">Modo de Redondeo</Label>
              <select
                id="roundingMode"
                value={settings.roundingMode}
                onChange={(e) => updateSettings('roundingMode', e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="up">Redondear hacia arriba</option>
                <option value="down">Redondear hacia abajo</option>
                <option value="nearest">Redondear al más cercano</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Tipos de impuestos */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Percent className="w-5 h-5" />
                Tipos de Impuestos
              </CardTitle>
              <Button 
                onClick={() => setShowNewRateModal(true)}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Tipo
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando tipos de impuestos...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {taxRates.map((rate) => (
                  <div key={rate.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{rate.name}</span>
                            {getTypeBadge(rate.type)}
                            {rate.isDefault && (
                              <Badge className="bg-orange-100 text-orange-800">Por defecto</Badge>
                            )}
                            {!rate.isActive && (
                              <Badge className="bg-gray-100 text-gray-800">Inactivo</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{rate.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                            <span>Tasa: {rate.rate}%</span>
                            <span>Países: {rate.countries.join(', ')}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant={rate.isActive ? "outline" : "default"}
                          onClick={() => toggleTaxRateStatus(rate.id)}
                          className={rate.isActive ? "" : "bg-green-600 hover:bg-green-700"}
                        >
                          {rate.isActive ? "Desactivar" : "Activar"}
                        </Button>
                        
                        {!rate.isDefault && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setDefaultTaxRate(rate.id)}
                          >
                            Por Defecto
                          </Button>
                        )}
                        
                        <Button size="sm" variant="outline" title="Editar">
                          <Edit className="w-4 h-4" />
                        </Button>
                        
                        {!rate.isDefault && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => deleteTaxRate(rate.id)}
                            title="Eliminar"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Zonas fiscales */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Zonas Fiscales
            </CardTitle>
            <Button 
              onClick={() => setShowNewZoneModal(true)}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Zona
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {taxZones.map((zone) => {
              const defaultRate = taxRates.find(rate => rate.id === zone.defaultTaxRate)
              
              return (
                <div key={zone.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{zone.name}</h4>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" title="Editar">
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline" title="Eliminar" className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{zone.description}</p>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="font-medium">Países:</span>
                      <p className="text-gray-600">{zone.countries.join(', ')}</p>
                    </div>
                    <div>
                      <span className="font-medium">Impuesto por defecto:</span>
                      <p className="text-gray-600">{defaultRate?.name} ({defaultRate?.rate}%)</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Calculadora de impuestos */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Calculadora de Impuestos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="calcPrice">Precio Base</Label>
                <Input
                  id="calcPrice"
                  type="number"
                  step="0.01"
                  placeholder="100.00"
                  defaultValue="100"
                />
              </div>
              
              <div>
                <Label htmlFor="calcTaxRate">Tipo de Impuesto</Label>
                <select
                  id="calcTaxRate"
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {taxRates.filter(rate => rate.isActive).map((rate) => (
                    <option key={rate.id} value={rate.rate}>
                      {rate.name} ({rate.rate}%)
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-3">Ejemplo de Cálculo</h4>
              <div className="space-y-2 text-sm">
                {(() => {
                  const example = calculateTaxExample(100, 21)
                  return (
                    <>
                      <div className="flex justify-between">
                        <span>Precio base:</span>
                        <span>{example.basePrice.toFixed(2)}€</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Impuestos (21%):</span>
                        <span>{example.taxAmount.toFixed(2)}€</span>
                      </div>
                      <div className="flex justify-between font-medium border-t pt-2">
                        <span>Total:</span>
                        <span>{example.finalPrice.toFixed(2)}€</span>
                      </div>
                    </>
                  )
                })()}
              </div>
              
              <div className="mt-4 text-xs text-gray-600">
                <Info className="w-4 h-4 inline mr-1" />
                {settings.pricesIncludeTax 
                  ? "Los precios incluyen impuestos" 
                  : "Los impuestos se añaden al precio base"
                }
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}