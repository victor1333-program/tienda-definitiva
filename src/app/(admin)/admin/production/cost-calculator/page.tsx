"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-hot-toast"
import { 
  Calculator, 
  Plus, 
  Trash2, 
  Save,
  DollarSign,
  Package,
  Clock,
  Users,
  TrendingUp,
  Info,
  Edit,
  Copy,
  FileText
} from "lucide-react"

interface CostItem {
  id: string
  name: string
  quantity: number
  unitCost: number
  category: 'material' | 'labor' | 'overhead' | 'other'
  notes?: string
}

interface CostCalculation {
  id: string
  name: string
  productType: string
  items: CostItem[]
  laborHours: number
  laborRate: number
  overheadPercentage: number
  profitMargin: number
  createdAt: string
}

export default function CostCalculatorPage() {
  const [calculations, setCalculations] = useState<CostCalculation[]>([])
  const [currentCalc, setCurrentCalc] = useState<CostCalculation>({
    id: '',
    name: '',
    productType: '',
    items: [],
    laborHours: 0,
    laborRate: 15,
    overheadPercentage: 20,
    profitMargin: 30,
    createdAt: ''
  })
  const [showNewItem, setShowNewItem] = useState(false)
  const [newItem, setNewItem] = useState<Partial<CostItem>>({
    name: '',
    quantity: 1,
    unitCost: 0,
    category: 'material',
    notes: ''
  })

  const addCostItem = () => {
    if (!newItem.name || !newItem.quantity || !newItem.unitCost) {
      toast.error("Completa todos los campos obligatorios")
      return
    }

    const item: CostItem = {
      id: `item_${Date.now()}`,
      name: newItem.name!,
      quantity: newItem.quantity!,
      unitCost: newItem.unitCost!,
      category: newItem.category as any,
      notes: newItem.notes
    }

    setCurrentCalc({
      ...currentCalc,
      items: [...currentCalc.items, item]
    })

    setNewItem({
      name: '',
      quantity: 1,
      unitCost: 0,
      category: 'material',
      notes: ''
    })
    setShowNewItem(false)
    toast.success("Elemento añadido")
  }

  const removeItem = (itemId: string) => {
    setCurrentCalc({
      ...currentCalc,
      items: currentCalc.items.filter(item => item.id !== itemId)
    })
    toast.success("Elemento eliminado")
  }

  const calculateTotalMaterialCost = () => {
    return currentCalc.items
      .filter(item => item.category === 'material')
      .reduce((total, item) => total + (item.quantity * item.unitCost), 0)
  }

  const calculateTotalLaborCost = () => {
    return currentCalc.laborHours * currentCalc.laborRate
  }

  const calculateOverheadCost = () => {
    const materialAndLabor = calculateTotalMaterialCost() + calculateTotalLaborCost()
    return materialAndLabor * (currentCalc.overheadPercentage / 100)
  }

  const calculateOtherCosts = () => {
    return currentCalc.items
      .filter(item => item.category === 'other')
      .reduce((total, item) => total + (item.quantity * item.unitCost), 0)
  }

  const calculateTotalCost = () => {
    return calculateTotalMaterialCost() + 
           calculateTotalLaborCost() + 
           calculateOverheadCost() + 
           calculateOtherCosts()
  }

  const calculateSellingPrice = () => {
    const totalCost = calculateTotalCost()
    return totalCost * (1 + currentCalc.profitMargin / 100)
  }

  const calculateProfit = () => {
    return calculateSellingPrice() - calculateTotalCost()
  }

  const saveCalculation = () => {
    if (!currentCalc.name || !currentCalc.productType) {
      toast.error("Completa el nombre y tipo de producto")
      return
    }

    const calculationToSave: CostCalculation = {
      ...currentCalc,
      id: `calc_${Date.now()}`,
      createdAt: new Date().toISOString()
    }

    setCalculations([...calculations, calculationToSave])
    setCurrentCalc({
      id: '',
      name: '',
      productType: '',
      items: [],
      laborHours: 0,
      laborRate: 15,
      overheadPercentage: 20,
      profitMargin: 30,
      createdAt: ''
    })
    toast.success("Cálculo guardado")
  }

  const loadCalculation = (calc: CostCalculation) => {
    setCurrentCalc(calc)
    toast.success("Cálculo cargado")
  }

  const getCategoryBadge = (category: string) => {
    const config = {
      material: { label: "Material", color: "bg-blue-100 text-blue-800" },
      labor: { label: "Mano de obra", color: "bg-green-100 text-green-800" },
      overhead: { label: "Gastos generales", color: "bg-yellow-100 text-yellow-800" },
      other: { label: "Otros", color: "bg-gray-100 text-gray-800" }
    }
    
    const conf = config[category as keyof typeof config] || config.other
    return <Badge className={conf.color}>{conf.label}</Badge>
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Calculadora de Costes</h1>
        <p className="text-gray-600">Calcula los costes de producción y precios de venta</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel principal - Cálculo actual */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información básica */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Información del Producto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="productName">Nombre del Producto</Label>
                  <Input
                    id="productName"
                    value={currentCalc.name}
                    onChange={(e) => setCurrentCalc({...currentCalc, name: e.target.value})}
                    placeholder="Ej: Camiseta Personalizada"
                  />
                </div>
                <div>
                  <Label htmlFor="productType">Tipo de Producto</Label>
                  <Input
                    id="productType"
                    value={currentCalc.productType}
                    onChange={(e) => setCurrentCalc({...currentCalc, productType: e.target.value})}
                    placeholder="Ej: Textil, Accesorio, etc."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Elementos de coste */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Elementos de Coste
                </CardTitle>
                <Button 
                  onClick={() => setShowNewItem(true)}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Añadir Elemento
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showNewItem && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
                  <h4 className="font-medium">Nuevo Elemento de Coste</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label>Nombre</Label>
                      <Input
                        value={newItem.name}
                        onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                        placeholder="Ej: Algodón"
                      />
                    </div>
                    <div>
                      <Label>Categoría</Label>
                      <select
                        value={newItem.category}
                        onChange={(e) => setNewItem({...newItem, category: e.target.value as any})}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                      >
                        <option value="material">Material</option>
                        <option value="labor">Mano de obra</option>
                        <option value="overhead">Gastos generales</option>
                        <option value="other">Otros</option>
                      </select>
                    </div>
                    <div>
                      <Label>Cantidad</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={newItem.quantity}
                        onChange={(e) => setNewItem({...newItem, quantity: parseFloat(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label>Coste Unitario (€)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={newItem.unitCost}
                        onChange={(e) => setNewItem({...newItem, unitCost: parseFloat(e.target.value)})}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Notas (opcional)</Label>
                    <Input
                      value={newItem.notes}
                      onChange={(e) => setNewItem({...newItem, notes: e.target.value})}
                      placeholder="Información adicional"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={addCostItem} className="bg-green-600 hover:bg-green-700">
                      Añadir
                    </Button>
                    <Button variant="outline" onClick={() => setShowNewItem(false)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}

              {/* Lista de elementos */}
              <div className="space-y-2">
                {currentCalc.items.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calculator className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No hay elementos de coste añadidos</p>
                  </div>
                ) : (
                  currentCalc.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.name}</span>
                          {getCategoryBadge(item.category)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {item.quantity} x {item.unitCost}€ = {(item.quantity * item.unitCost).toFixed(2)}€
                        </div>
                        {item.notes && (
                          <div className="text-xs text-gray-500">{item.notes}</div>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Configuración de costes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Configuración de Costes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label>Horas de Trabajo</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    value={currentCalc.laborHours}
                    onChange={(e) => setCurrentCalc({...currentCalc, laborHours: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <Label>Tarifa por Hora (€)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={currentCalc.laborRate}
                    onChange={(e) => setCurrentCalc({...currentCalc, laborRate: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <Label>Gastos Generales (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={currentCalc.overheadPercentage}
                    onChange={(e) => setCurrentCalc({...currentCalc, overheadPercentage: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <Label>Beneficio por venta (€)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={calculateProfit().toFixed(2)}
                    readOnly
                    className="bg-green-50 border-green-200 text-green-800 font-medium"
                  />
                </div>
                <div>
                  <Label>Margen de Beneficio (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={currentCalc.profitMargin}
                    onChange={(e) => setCurrentCalc({...currentCalc, profitMargin: parseFloat(e.target.value)})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel lateral - Resumen y guardados */}
        <div className="space-y-6">
          {/* Resumen de costes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Resumen de Costes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Materiales:</span>
                <span className="font-medium">{calculateTotalMaterialCost().toFixed(2)}€</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Mano de obra:</span>
                <span className="font-medium">{calculateTotalLaborCost().toFixed(2)}€</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Gastos generales:</span>
                <span className="font-medium">{calculateOverheadCost().toFixed(2)}€</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Otros costes:</span>
                <span className="font-medium">{calculateOtherCosts().toFixed(2)}€</span>
              </div>
              <hr />
              <div className="flex justify-between text-lg font-semibold">
                <span>Coste Total:</span>
                <span>{calculateTotalCost().toFixed(2)}€</span>
              </div>
              <div className="flex justify-between text-lg font-semibold text-orange-600">
                <span>Precio de Venta:</span>
                <span>{calculateSellingPrice().toFixed(2)}€</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Beneficio:</span>
                <span>{calculateProfit().toFixed(2)}€</span>
              </div>

              <Button 
                onClick={saveCalculation}
                className="w-full bg-orange-600 hover:bg-orange-700 mt-4"
              >
                <Save className="w-4 h-4 mr-2" />
                Guardar Cálculo
              </Button>
            </CardContent>
          </Card>

          {/* Cálculos guardados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Cálculos Guardados ({calculations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {calculations.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <p className="text-sm">No hay cálculos guardados</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {calculations.map((calc) => (
                    <div key={calc.id} className="p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{calc.name}</p>
                          <p className="text-xs text-gray-600">{calc.productType}</p>
                          <p className="text-xs text-orange-600 font-medium">
                            {(calc.items.reduce((total, item) => total + (item.quantity * item.unitCost), 0) + 
                             calc.laborHours * calc.laborRate).toFixed(2)}€
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => loadCalculation(calc)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Información de ayuda */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                Ayuda
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 space-y-2">
              <p><strong>Materiales:</strong> Costes de materias primas</p>
              <p><strong>Mano de obra:</strong> Horas × tarifa por hora</p>
              <p><strong>Gastos generales:</strong> % sobre materiales + mano de obra</p>
              <p><strong>Margen de beneficio:</strong> % sobre coste total</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}