'use client'

import { useState, useEffect } from 'react'
import { Plus, Minus, Edit3, Trash2, Package, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

interface BrandStock {
  id: string
  brand: string
  quantity: number
  costPrice: number
  location?: string
  isPreferred: boolean
  priority: number
  supplier?: {
    name: string
  }
}

interface BrandStockSummary {
  variantId: string
  totalStock: number
  brands: BrandStock[]
}

interface BrandStockManagerProps {
  variantId: string
  variantInfo: {
    sku: string
    size?: string
    color?: string
    product: {
      name: string
    }
  }
}

export default function BrandStockManager({ variantId, variantInfo }: BrandStockManagerProps) {
  const [stockSummary, setStockSummary] = useState<BrandStockSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingStock, setEditingStock] = useState<string | null>(null)
  const [suppliers, setSuppliers] = useState<any[]>([])
  
  const [newStock, setNewStock] = useState({
    brand: '',
    supplierId: '',
    quantity: 0,
    costPrice: 0,
    location: '',
    isPreferred: false,
    priority: 0
  })

  useEffect(() => {
    fetchStockSummary()
    fetchSuppliers()
  }, [variantId])

  const fetchStockSummary = async () => {
    try {
      const response = await fetch(`/api/brand-stock?variantId=${variantId}`)
      if (response.ok) {
        const data = await response.json()
        setStockSummary(data)
      }
    } catch (error) {
      console.error('Error fetching stock summary:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/suppliers')
      if (response.ok) {
        const data = await response.json()
        setSuppliers(data.suppliers || [])
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error)
    }
  }

  const handleAddStock = async () => {
    try {
      const response = await fetch('/api/brand-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variantId,
          ...newStock
        })
      })

      if (response.ok) {
        await fetchStockSummary()
        setShowAddForm(false)
        setNewStock({
          brand: '',
          supplierId: '',
          quantity: 0,
          costPrice: 0,
          location: '',
          isPreferred: false,
          priority: 0
        })
      }
    } catch (error) {
      console.error('Error adding brand stock:', error)
    }
  }

  const handleStockAdjustment = async (stockId: string, newQuantity: number, reason: string) => {
    try {
      const response = await fetch(`/api/brand-stock/${stockId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantity: newQuantity,
          reason
        })
      })

      if (response.ok) {
        await fetchStockSummary()
      }
    } catch (error) {
      console.error('Error adjusting stock:', error)
    }
  }

  const handleDeleteStock = async (stockId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este stock de marca?')) return

    try {
      const response = await fetch(`/api/brand-stock/${stockId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchStockSummary()
      }
    } catch (error) {
      console.error('Error deleting brand stock:', error)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold">Stock por Marca</h3>
          <p className="text-sm text-gray-500">
            {variantInfo.product.name} • {variantInfo.sku}
            {variantInfo.size && ` • ${variantInfo.size}`}
            {variantInfo.color && ` • ${variantInfo.color}`}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-green-600">
            {stockSummary?.totalStock || 0}
          </div>
          <div className="text-sm text-gray-500">
            unidades disponibles
          </div>
        </div>
      </div>

      {/* Brand Stocks List */}
      <div className="space-y-3 mb-6">
        {stockSummary?.brands.map(stock => (
          <div key={stock.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{stock.brand}</span>
                {stock.isPreferred && (
                  <Badge variant="default" className="text-xs">Preferida</Badge>
                )}
                {stock.quantity <= 5 && (
                  <Badge variant="destructive" className="text-xs">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Stock Bajo
                  </Badge>
                )}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {stock.supplier?.name && `${stock.supplier.name} • `}
                €{stock.costPrice.toFixed(2)}
                {stock.location && ` • ${stock.location}`}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Stock Quantity */}
              <div className="text-center">
                <div className="font-medium text-lg">{stock.quantity}</div>
                <div className="text-xs text-gray-400">unidades</div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center space-x-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStockAdjustment(stock.id, stock.quantity - 1, 'Ajuste manual (-1)')}
                  disabled={stock.quantity <= 0}
                  className="h-8 w-8 p-0"
                >
                  <Minus className="w-3 h-3" />
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStockAdjustment(stock.id, stock.quantity + 1, 'Ajuste manual (+1)')}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="w-3 h-3" />
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingStock(stock.id)}
                  className="h-8 w-8 p-0"
                >
                  <Edit3 className="w-3 h-3" />
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteStock(stock.id)}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {(!stockSummary?.brands || stockSummary.brands.length === 0) && (
          <div className="text-center py-8 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>No hay stock de marcas configurado</p>
            <p className="text-sm">Añade la primera marca para comenzar</p>
          </div>
        )}
      </div>

      {/* Add New Brand Form */}
      {showAddForm ? (
        <div className="border-t pt-6">
          <h4 className="font-medium mb-4">Añadir Nueva Marca</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="brand">Marca *</Label>
              <Input
                id="brand"
                value={newStock.brand}
                onChange={(e) => setNewStock({ ...newStock, brand: e.target.value })}
                placeholder="Ej: Roly, JHK, B&C"
              />
            </div>
            
            <div>
              <Label htmlFor="supplier">Proveedor</Label>
              <Select
                value={newStock.supplierId}
                onValueChange={(value) => setNewStock({ ...newStock, supplierId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar proveedor" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map(supplier => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="quantity">Cantidad *</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={newStock.quantity}
                onChange={(e) => setNewStock({ ...newStock, quantity: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div>
              <Label htmlFor="costPrice">Precio de Coste *</Label>
              <Input
                id="costPrice"
                type="number"
                min="0"
                step="0.01"
                value={newStock.costPrice}
                onChange={(e) => setNewStock({ ...newStock, costPrice: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div>
              <Label htmlFor="location">Ubicación</Label>
              <Input
                id="location"
                value={newStock.location}
                onChange={(e) => setNewStock({ ...newStock, location: e.target.value })}
                placeholder="Ej: Estantería A-3"
              />
            </div>

            <div>
              <Label htmlFor="priority">Prioridad</Label>
              <Input
                id="priority"
                type="number"
                min="0"
                value={newStock.priority}
                onChange={(e) => setNewStock({ ...newStock, priority: parseInt(e.target.value) || 0 })}
                placeholder="0 = mayor prioridad"
              />
            </div>
          </div>

          <div className="flex items-center mt-4">
            <input
              type="checkbox"
              id="isPreferred"
              checked={newStock.isPreferred}
              onChange={(e) => setNewStock({ ...newStock, isPreferred: e.target.checked })}
              className="mr-2"
            />
            <Label htmlFor="isPreferred">Marca preferida para esta variante</Label>
          </div>

          <div className="flex gap-2 mt-6">
            <Button
              onClick={handleAddStock}
              disabled={!newStock.brand || newStock.quantity < 0 || newStock.costPrice <= 0}
            >
              Añadir Stock
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowAddForm(false)}
            >
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <Button
          onClick={() => setShowAddForm(true)}
          variant="outline"
          className="w-full border-dashed border-2 hover:border-orange-400 hover:text-orange-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Añadir nueva marca/proveedor
        </Button>
      )}
    </div>
  )
}