"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Zap, Calendar, Target, Package, Layers, ShoppingCart, Globe, Save, Eye } from 'lucide-react'
import Link from 'next/link'

interface Category {
  id: string
  name: string
  slug: string
}

interface Product {
  id: string
  name: string
  slug: string
}

export default function NewDiscountPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [searchProduct, setSearchProduct] = useState('')
  const [searchCategory, setSearchCategory] = useState('')
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'PRODUCT_DISCOUNT',
    value: 0,
    isPercentage: false,
    targetType: 'ALL',
    targetProductIds: [] as string[],
    targetCategoryIds: [] as string[],
    minOrderAmount: '',
    minOrderQuantity: '',
    maxUses: '',
    usesPerCustomer: '',
    oneTimePerCustomer: false,
    countries: [] as string[],
    allCountries: true,
    validFrom: new Date().toISOString().slice(0, 16),
    validUntil: '',
    hasValidUntil: false,
    description: '',
    internalNotes: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (formData.targetType === 'CATEGORIES') {
      fetchCategories()
    } else if (formData.targetType === 'PRODUCTS') {
      fetchProducts()
    }
  }, [formData.targetType])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || data || [])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || data || [])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const generateRandomCode = async () => {
    try {
      const response = await fetch('/api/discounts/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ length: 8 })
      })
      
      if (response.ok) {
        const data = await response.json()
        setFormData(prev => ({ ...prev, code: data.code }))
      }
    } catch (error) {
      console.error('Error generating code:', error)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.code.trim()) {
      newErrors.code = 'El código es requerido'
    }

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido'
    }

    if (formData.type !== 'FREE_SHIPPING' && formData.value <= 0) {
      newErrors.value = 'El valor debe ser mayor que 0'
    }

    if (formData.isPercentage && formData.value > 100) {
      newErrors.value = 'El porcentaje no puede ser mayor a 100'
    }

    if (formData.hasValidUntil && formData.validUntil) {
      const validFrom = new Date(formData.validFrom)
      const validUntil = new Date(formData.validUntil)
      if (validUntil <= validFrom) {
        newErrors.validUntil = 'La fecha de fin debe ser posterior a la fecha de inicio'
      }
    }

    if (formData.targetType === 'PRODUCTS' && formData.targetProductIds.length === 0) {
      newErrors.targetProducts = 'Selecciona al menos un producto'
    }

    if (formData.targetType === 'CATEGORIES' && formData.targetCategoryIds.length === 0) {
      newErrors.targetCategories = 'Selecciona al menos una categoría'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      const payload = {
        code: formData.code.toUpperCase(),
        name: formData.name,
        type: formData.type,
        value: formData.type === 'FREE_SHIPPING' ? 0 : formData.value,
        isPercentage: formData.type === 'FREE_SHIPPING' ? false : formData.isPercentage,
        targetType: formData.targetType,
        targetProductIds: formData.targetProductIds,
        targetCategoryIds: formData.targetCategoryIds,
        minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : null,
        minOrderQuantity: formData.minOrderQuantity ? parseInt(formData.minOrderQuantity) : null,
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
        usesPerCustomer: formData.usesPerCustomer ? parseInt(formData.usesPerCustomer) : null,
        oneTimePerCustomer: formData.oneTimePerCustomer,
        countries: formData.countries,
        allCountries: formData.allCountries,
        validFrom: formData.validFrom,
        validUntil: formData.hasValidUntil && formData.validUntil ? formData.validUntil : null,
        description: formData.description,
        internalNotes: formData.internalNotes
      }

      const response = await fetch('/api/discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        router.push('/admin/discounts')
      } else {
        const error = await response.json()
        setErrors({ general: error.error || 'Error al crear descuento' })
      }
    } catch (error) {
      setErrors({ general: 'Error al crear descuento' })
    } finally {
      setLoading(false)
    }
  }

  const getTypeDescription = (type: string) => {
    switch (type) {
      case 'PRODUCT_DISCOUNT':
        return 'Aplica descuento a productos específicos o todos los productos'
      case 'CATEGORY_DISCOUNT':
        return 'Aplica descuento a productos de categorías específicas'
      case 'FREE_SHIPPING':
        return 'Ofrece envío gratuito si se cumplen las condiciones'
      default:
        return ''
    }
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchProduct.toLowerCase())
  )

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchCategory.toLowerCase())
  )

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/admin/discounts">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Crear Nuevo Descuento</h1>
            <p className="text-gray-600">Configura un nuevo código de descuento o promoción</p>
          </div>
        </div>
      </div>

      {errors.general && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{errors.general}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tipo de Descuento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Tipo de Descuento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { value: 'PRODUCT_DISCOUNT', label: 'Descuento de Producto', icon: Package },
                { value: 'CATEGORY_DISCOUNT', label: 'Descuento de Categoría', icon: Layers },
                { value: 'FREE_SHIPPING', label: 'Envío Gratis', icon: ShoppingCart }
              ].map(({ value, label, icon: Icon }) => (
                <div
                  key={value}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    formData.type === value
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, type: value }))}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-6 w-6 ${formData.type === value ? 'text-orange-600' : 'text-gray-400'}`} />
                    <div>
                      <div className="font-medium">{label}</div>
                      <div className="text-sm text-gray-500">{getTypeDescription(value)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Información Básica */}
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código de Descuento *
                </label>
                <div className="flex gap-2">
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    placeholder="DESCUENTO10"
                    className={errors.code ? 'border-red-500' : ''}
                  />
                  <Button type="button" variant="outline" onClick={generateRandomCode}>
                    <Zap className="h-4 w-4" />
                  </Button>
                </div>
                {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Descuento *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Descuento de bienvenida"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Descripción del descuento para mostrar al cliente..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Valor del Descuento */}
        {formData.type !== 'FREE_SHIPPING' && (
          <Card>
            <CardHeader>
              <CardTitle>Valor del Descuento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="valueType"
                      checked={!formData.isPercentage}
                      onChange={() => setFormData(prev => ({ ...prev, isPercentage: false }))}
                      className="mr-2"
                    />
                    <span>Cantidad Fija (€)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="valueType"
                      checked={formData.isPercentage}
                      onChange={() => setFormData(prev => ({ ...prev, isPercentage: true }))}
                      className="mr-2"
                    />
                    <span>Porcentaje (%)</span>
                  </label>
                </div>

                <div className="max-w-xs">
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.value}
                    onChange={(e) => setFormData(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                    placeholder={formData.isPercentage ? '10' : '5.00'}
                    className={errors.value ? 'border-red-500' : ''}
                  />
                  {errors.value && <p className="text-red-500 text-sm mt-1">{errors.value}</p>}
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.isPercentage 
                      ? `Descuento del ${formData.value}%` 
                      : `Descuento de €${formData.value.toFixed(2)}`
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Aplicar a */}
        {formData.type !== 'FREE_SHIPPING' && (
          <Card>
            <CardHeader>
              <CardTitle>Aplicar a</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Select value={formData.targetType} onValueChange={(value) => setFormData(prev => ({ ...prev, targetType: value, targetProductIds: [], targetCategoryIds: [] }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos los productos</SelectItem>
                    <SelectItem value="CATEGORIES">Categorías específicas</SelectItem>
                    <SelectItem value="PRODUCTS">Productos específicos</SelectItem>
                  </SelectContent>
                </Select>

                {formData.targetType === 'CATEGORIES' && (
                  <div>
                    <Input
                      placeholder="Buscar categorías..."
                      value={searchCategory}
                      onChange={(e) => setSearchCategory(e.target.value)}
                      className="mb-3"
                    />
                    <div className="max-h-48 overflow-y-auto border rounded-lg">
                      {filteredCategories.map((category) => (
                        <label key={category.id} className="flex items-center p-3 hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={formData.targetCategoryIds.includes(category.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData(prev => ({
                                  ...prev,
                                  targetCategoryIds: [...prev.targetCategoryIds, category.id]
                                }))
                              } else {
                                setFormData(prev => ({
                                  ...prev,
                                  targetCategoryIds: prev.targetCategoryIds.filter(id => id !== category.id)
                                }))
                              }
                            }}
                            className="mr-3"
                          />
                          <span>{category.name}</span>
                        </label>
                      ))}
                    </div>
                    {errors.targetCategories && <p className="text-red-500 text-sm mt-1">{errors.targetCategories}</p>}
                  </div>
                )}

                {formData.targetType === 'PRODUCTS' && (
                  <div>
                    <Input
                      placeholder="Buscar productos..."
                      value={searchProduct}
                      onChange={(e) => setSearchProduct(e.target.value)}
                      className="mb-3"
                    />
                    <div className="max-h-48 overflow-y-auto border rounded-lg">
                      {filteredProducts.map((product) => (
                        <label key={product.id} className="flex items-center p-3 hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={formData.targetProductIds.includes(product.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData(prev => ({
                                  ...prev,
                                  targetProductIds: [...prev.targetProductIds, product.id]
                                }))
                              } else {
                                setFormData(prev => ({
                                  ...prev,
                                  targetProductIds: prev.targetProductIds.filter(id => id !== product.id)
                                }))
                              }
                            }}
                            className="mr-3"
                          />
                          <span>{product.name}</span>
                        </label>
                      ))}
                    </div>
                    {errors.targetProducts && <p className="text-red-500 text-sm mt-1">{errors.targetProducts}</p>}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Requisitos Mínimos */}
        <Card>
          <CardHeader>
            <CardTitle>Requisitos Mínimos de Compra</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto Mínimo de Compra (€)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.minOrderAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, minOrderAmount: e.target.value }))}
                  placeholder="50.00"
                />
                <p className="text-sm text-gray-500 mt-1">Opcional. Si está vacío, no hay monto mínimo.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad Mínima de Artículos
                </label>
                <Input
                  type="number"
                  value={formData.minOrderQuantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, minOrderQuantity: e.target.value }))}
                  placeholder="2"
                />
                <p className="text-sm text-gray-500 mt-1">Opcional. Si está vacío, no hay cantidad mínima.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usos Máximos */}
        <Card>
          <CardHeader>
            <CardTitle>Usos Máximos del Descuento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número Total de Usos
                  </label>
                  <Input
                    type="number"
                    value={formData.maxUses}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxUses: e.target.value }))}
                    placeholder="100"
                  />
                  <p className="text-sm text-gray-500 mt-1">Opcional. Si está vacío, usos ilimitados.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Usos por Cliente
                  </label>
                  <Input
                    type="number"
                    value={formData.usesPerCustomer}
                    onChange={(e) => setFormData(prev => ({ ...prev, usesPerCustomer: e.target.value }))}
                    placeholder="1"
                  />
                  <p className="text-sm text-gray-500 mt-1">Opcional. Si está vacío, usos ilimitados por cliente.</p>
                </div>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.oneTimePerCustomer}
                    onChange={(e) => setFormData(prev => ({ ...prev, oneTimePerCustomer: e.target.checked }))}
                    className="mr-2"
                  />
                  <span>Limitar a un uso por cliente</span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Países */}
        {formData.type === 'FREE_SHIPPING' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Países
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.allCountries}
                    onChange={(e) => setFormData(prev => ({ ...prev, allCountries: e.target.checked }))}
                    className="mr-2"
                  />
                  <span>Todos los países</span>
                </label>

                {!formData.allCountries && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Seleccionar países específicos:</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {['España', 'Francia', 'Portugal', 'Italia', 'Alemania', 'Reino Unido'].map((country) => (
                        <label key={country} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.countries.includes(country)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData(prev => ({
                                  ...prev,
                                  countries: [...prev.countries, country]
                                }))
                              } else {
                                setFormData(prev => ({
                                  ...prev,
                                  countries: prev.countries.filter(c => c !== country)
                                }))
                              }
                            }}
                            className="mr-2"
                          />
                          <span className="text-sm">{country}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Fechas Activas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Fechas Activas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Inicio *
                </label>
                <Input
                  type="datetime-local"
                  value={formData.validFrom}
                  onChange={(e) => setFormData(prev => ({ ...prev, validFrom: e.target.value }))}
                />
              </div>

              <div>
                <label className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    checked={formData.hasValidUntil}
                    onChange={(e) => setFormData(prev => ({ ...prev, hasValidUntil: e.target.checked }))}
                    className="mr-2"
                  />
                  <span>Establecer Fecha de Finalización</span>
                </label>

                {formData.hasValidUntil && (
                  <div>
                    <Input
                      type="datetime-local"
                      value={formData.validUntil}
                      onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
                      className={errors.validUntil ? 'border-red-500' : ''}
                    />
                    {errors.validUntil && <p className="text-red-500 text-sm mt-1">{errors.validUntil}</p>}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notas Internas */}
        <Card>
          <CardHeader>
            <CardTitle>Notas Internas</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              value={formData.internalNotes}
              onChange={(e) => setFormData(prev => ({ ...prev, internalNotes: e.target.value }))}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Notas internas para el equipo (no visible para clientes)..."
            />
          </CardContent>
        </Card>

        {/* Acciones */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/discounts')}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Creando...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                <span>Crear Descuento</span>
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}