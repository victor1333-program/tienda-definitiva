"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  ArrowLeft, 
  Save, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  User,
  Package,
  Calculator,
  CheckCircle,
  AlertCircle,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-hot-toast"
import { formatPrice } from "@/lib/utils"

interface Product {
  id: string
  name: string
  basePrice: number
  images: string
  sku: string
  variants: Array<{
    id: string
    sku: string
    size?: string
    color?: string
    price?: number
    stock: number
  }>
}

interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  address?: {
    address: string
    city: string
    postalCode: string
    province: string
    country: string
  }
}

interface OrderItem {
  productId: string
  variantId?: string
  name: string
  sku: string
  quantity: number
  unitPrice: number
  totalPrice: number
  image?: string
}

interface OrderData {
  customerId: string
  items: OrderItem[]
  subtotal: number
  taxAmount: number
  shippingCost: number
  totalAmount: number
  customerNotes: string
  adminNotes: string
  shippingMethod: string
}

const TAX_RATE = 0.21 // 21% IVA

export default function NewOrderPage() {
  const router = useRouter()
  const [orderData, setOrderData] = useState<OrderData>({
    customerId: '',
    items: [],
    subtotal: 0,
    taxAmount: 0,
    shippingCost: 4.50, // Valor inicial para envío estándar
    totalAmount: 0,
    customerNotes: '',
    adminNotes: '',
    shippingMethod: 'Envío estándar'
  })
  
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [productSearch, setProductSearch] = useState('')
  const [customerSearch, setCustomerSearch] = useState('')
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [customerResults, setCustomerResults] = useState<Customer[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [allCustomers, setAllCustomers] = useState<Customer[]>([])
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const [showProductDropdown, setShowProductDropdown] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Cargar todos los productos y clientes al inicio
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true)
      try {
        const [productsResponse, customersResponse] = await Promise.all([
          fetch('/api/products?limit=100'),
          fetch('/api/customers?limit=100')
        ])

        if (productsResponse.ok) {
          const productsData = await productsResponse.json()
          setAllProducts(productsData.products || [])
        }

        if (customersResponse.ok) {
          const customersData = await customersResponse.json()
          setAllCustomers(customersData.customers || [])
        }
      } catch (error) {
        console.error('Error loading initial data:', error)
        toast.error('Error al cargar los datos iniciales')
      } finally {
        setIsLoading(false)
      }
    }

    loadInitialData()
  }, [])

  // Calcular totales
  useEffect(() => {
    const subtotal = orderData.items.reduce((sum, item) => sum + item.totalPrice, 0)
    const taxAmount = subtotal * TAX_RATE
    
    // Calcular costo de envío con envío gratuito incluido
    const freeShippingThreshold = 50 // Umbral para envío gratuito
    let shippingCost = 0
    
    switch (orderData.shippingMethod) {
      case 'Envío estándar':
        shippingCost = subtotal >= freeShippingThreshold ? 0 : 4.50
        break
      case 'Envío express':
        shippingCost = subtotal >= freeShippingThreshold ? 0 : 6.50
        break
      case 'Recogida en tienda':
        shippingCost = 0
        break
      default:
        shippingCost = subtotal >= freeShippingThreshold ? 0 : 4.50 // Por defecto envío estándar
    }
    
    const totalAmount = subtotal + taxAmount + shippingCost

    setOrderData(prev => ({
      ...prev,
      subtotal,
      taxAmount,
      shippingCost,
      totalAmount
    }))
  }, [orderData.items, orderData.shippingMethod])

  // Filtrar productos
  const filterProducts = (query: string) => {
    if (!query.trim()) {
      setSearchResults(allProducts.slice(0, 10)) // Mostrar los primeros 10 si no hay búsqueda
      return
    }

    const filtered = allProducts.filter(product => 
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.sku.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 10)
    
    setSearchResults(filtered)
  }

  // Filtrar clientes
  const filterCustomers = (query: string) => {
    if (!query.trim()) {
      setCustomerResults(allCustomers.slice(0, 10)) // Mostrar los primeros 10 si no hay búsqueda
      return
    }

    const filtered = allCustomers.filter(customer => 
      customer.name.toLowerCase().includes(query.toLowerCase()) ||
      customer.email.toLowerCase().includes(query.toLowerCase()) ||
      (customer.phone && customer.phone.includes(query))
    ).slice(0, 10)
    
    setCustomerResults(filtered)
  }

  // Debounce para búsquedas
  useEffect(() => {
    const timer = setTimeout(() => {
      filterProducts(productSearch)
    }, 300)
    return () => clearTimeout(timer)
  }, [productSearch, allProducts])

  useEffect(() => {
    const timer = setTimeout(() => {
      filterCustomers(customerSearch)
    }, 300)
    return () => clearTimeout(timer)
  }, [customerSearch, allCustomers])

  // Mostrar dropdowns iniciales al cargar datos
  useEffect(() => {
    if (allCustomers.length > 0) {
      filterCustomers('')
    }
  }, [allCustomers])

  useEffect(() => {
    if (allProducts.length > 0) {
      filterProducts('')
    }
  }, [allProducts])

  // Agregar producto al pedido
  const addProductToOrder = (product: Product, variant?: any) => {
    const existingItemIndex = orderData.items.findIndex(
      item => item.productId === product.id && item.variantId === variant?.id
    )

    const unitPrice = variant?.price || product.basePrice
    const images = product.images ? JSON.parse(product.images) : []
    const image = Array.isArray(images) && images.length > 0 ? images[0] : null

    if (existingItemIndex >= 0) {
      // Si ya existe, incrementar cantidad
      const updatedItems = [...orderData.items]
      updatedItems[existingItemIndex].quantity += 1
      updatedItems[existingItemIndex].totalPrice = 
        updatedItems[existingItemIndex].quantity * updatedItems[existingItemIndex].unitPrice

      setOrderData(prev => ({ ...prev, items: updatedItems }))
    } else {
      // Agregar nuevo item
      const newItem: OrderItem = {
        productId: product.id,
        variantId: variant?.id,
        name: variant ? `${product.name} (${variant.size || ''} ${variant.color || ''})` : product.name,
        sku: variant?.sku || product.sku,
        quantity: 1,
        unitPrice,
        totalPrice: unitPrice,
        image
      }

      setOrderData(prev => ({
        ...prev,
        items: [...prev.items, newItem]
      }))
    }

    toast.success('Producto agregado al pedido')
  }

  // Actualizar cantidad de item
  const updateItemQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(index)
      return
    }

    const updatedItems = [...orderData.items]
    updatedItems[index].quantity = newQuantity
    updatedItems[index].totalPrice = newQuantity * updatedItems[index].unitPrice

    setOrderData(prev => ({ ...prev, items: updatedItems }))
  }

  // Remover item del pedido
  const removeItem = (index: number) => {
    const updatedItems = orderData.items.filter((_, i) => i !== index)
    setOrderData(prev => ({ ...prev, items: updatedItems }))
    toast.success('Producto eliminado del pedido')
  }

  // Seleccionar cliente
  const selectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setOrderData(prev => ({ ...prev, customerId: customer.id }))
    setCustomerSearch('')
    setCustomerResults([])
    setShowCustomerDropdown(false)
    toast.success(`Cliente ${customer.name} seleccionado`)
  }

  // Manejar foco en campo de búsqueda de clientes
  const handleCustomerSearchFocus = () => {
    setShowCustomerDropdown(true)
    if (customerResults.length === 0) {
      filterCustomers(customerSearch)
    }
  }

  // Manejar foco en campo de búsqueda de productos
  const handleProductSearchFocus = () => {
    setShowProductDropdown(true)
    if (searchResults.length === 0) {
      filterProducts(productSearch)
    }
  }

  // Guardar pedido
  const saveOrder = async () => {
    if (!selectedCustomer) {
      toast.error('Debes seleccionar un cliente')
      return
    }

    if (orderData.items.length === 0) {
      toast.error('Debes agregar al menos un producto')
      return
    }

    setIsSaving(true)
    try {
      // Transformar los datos para que coincidan con el esquema esperado por la API
      const orderPayload = {
        customerEmail: selectedCustomer.email,
        customerName: selectedCustomer.name,
        customerPhone: selectedCustomer.phone || '+34 600 000 000',
        shippingMethod: orderData.shippingMethod || 'Envío estándar',
        shippingAddress: selectedCustomer.address || 'Dirección no especificada, Ciudad no especificada, 00000, Provincia no especificada, España',
        paymentMethod: 'manual', // Pedido manual desde admin
        customerNotes: orderData.customerNotes || null,
        items: orderData.items.map(item => ({
          productId: item.productId,
          variantId: item.variantId || null,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        })),
        userId: selectedCustomer.id, // Vincular con el usuario/cliente seleccionado
        addressId: null // Por ahora no usamos direcciones específicas
      }

      console.log('Enviando pedido:', orderPayload)
      console.log('Items del pedido:', orderPayload.items)
      console.log('Cliente seleccionado:', selectedCustomer)

      console.log('🚀 About to send request to /api/orders-simple...')
      
      // Add a timeout to detect hanging requests
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        console.error('⏰ Request timeout after 30 seconds')
        controller.abort()
      }, 30000)

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      console.log('📡 Response received:', response)

      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))
      
      if (response.ok) {
        const result = await response.json()
        console.log('Pedido creado exitosamente:', result)
        toast.success('Pedido creado exitosamente')
        
        // Manejar diferentes tipos de respuesta
        if (result.order?.id) {
          // API real - redirigir a la vista del pedido creado
          router.push(`/admin/orders/${result.order.id}`)
        } else if (result.success && result.validationPassed) {
          // API de debug - mostrar éxito
          console.log('✅ API de debug funcionando correctamente')
          toast.success('¡Validación exitosa! Ahora probemos con el API real.')
          // Resetear formulario después del test exitoso
          setOrderData({
            customerId: '',
            items: [],
            subtotal: 0,
            taxAmount: 0,
            shippingCost: 4.50,
            totalAmount: 0,
            customerNotes: '',
            adminNotes: '',
            shippingMethod: 'Envío estándar'
          })
          setSelectedCustomer(null)
        } else {
          // Otro tipo de respuesta exitosa
          console.log('✅ Respuesta exitosa:', result)
          toast.success('¡Prueba exitosa! El API responde correctamente.')
        }
      } else {
        let error;
        const responseText = await response.text()
        console.log('Response text:', responseText)
        
        try {
          error = JSON.parse(responseText)
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError)
          error = { error: `HTTP ${response.status}: ${responseText || 'Unknown error'}` }
        }
        
        console.error('Error del servidor:', error)
        console.error('Response status:', response.status)
        
        toast.error(error.error || `Error ${response.status}: ${response.statusText}`)
        
        // Mostrar detalles del error si están disponibles
        if (error.details && Array.isArray(error.details)) {
          error.details.forEach((detail: string) => {
            toast.error(detail, { duration: 5000 })
          })
        }
      }
    } catch (error) {
      console.error('Error:', error)
      
      if (error instanceof Error && error.name === 'AbortError') {
        toast.error('La solicitud tardó demasiado tiempo. Verifica tu conexión.')
      } else {
        toast.error('Error al crear el pedido')
      }
    } finally {
      setIsSaving(false)
    }
  }

  const getProductImages = (imagesString: string) => {
    try {
      const images = JSON.parse(imagesString)
      return Array.isArray(images) ? images : []
    } catch {
      return []
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/admin/orders">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Pedidos
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🛒 Nuevo Pedido Manual</h1>
            <p className="text-gray-600 mt-1">Crea un pedido manualmente para un cliente</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel izquierdo - Búsqueda y selección */}
        <div className="lg:col-span-2 space-y-6">
          {/* Selección de cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Seleccionar Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedCustomer ? (
                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                      {selectedCustomer.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-green-900">{selectedCustomer.name}</p>
                      <p className="text-sm text-green-700">{selectedCustomer.email}</p>
                      {selectedCustomer.phone && (
                        <p className="text-sm text-green-700">{selectedCustomer.phone}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedCustomer(null)
                      setOrderData(prev => ({ ...prev, customerId: '' }))
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar cliente por nombre o email..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      onFocus={handleCustomerSearchFocus}
                      onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 200)}
                      className="pl-10"
                    />
                  </div>
                  
                  {(showCustomerDropdown || customerSearch) && customerResults.length > 0 && (
                    <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto shadow-lg bg-white relative z-10">
                      {customerResults.map((customer) => (
                        <div
                          key={customer.id}
                          className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          onClick={() => selectCustomer(customer)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                              {customer.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{customer.name}</p>
                              <p className="text-sm text-gray-600">{customer.email}</p>
                              {customer.phone && (
                                <p className="text-xs text-gray-500">{customer.phone}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {(showCustomerDropdown || customerSearch) && customerSearch && customerResults.length === 0 && (
                    <div className="border border-gray-200 rounded-lg p-4 text-center text-gray-500">
                      No se encontraron clientes
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Búsqueda de productos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Buscar Productos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar productos por nombre o SKU..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    onFocus={handleProductSearchFocus}
                    onBlur={() => setTimeout(() => setShowProductDropdown(false), 200)}
                    className="pl-10"
                  />
                </div>

                {(showProductDropdown || productSearch) && searchResults.length > 0 && (
                  <div className="space-y-3 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-2 shadow-lg bg-white relative z-10">
                    {searchResults.map((product) => {
                      const images = getProductImages(product.images)
                      return (
                        <div key={product.id} className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                              {images.length > 0 ? (
                                <img 
                                  src={images[0]} 
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Package className="h-8 w-8 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{product.name}</h4>
                              <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                              <p className="text-lg font-bold text-orange-600">
                                {formatPrice(product.basePrice)}
                              </p>
                            </div>
                            <div className="flex flex-col gap-2">
                              <Button
                                size="sm"
                                onClick={() => {
                                  addProductToOrder(product)
                                  setShowProductDropdown(false)
                                }}
                                className="bg-orange-500 hover:bg-orange-600"
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Agregar
                              </Button>
                              {product.variants && product.variants.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {product.variants.slice(0, 2).map((variant) => (
                                    <Button
                                      key={variant.id}
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        addProductToOrder(product, variant)
                                        setShowProductDropdown(false)
                                      }}
                                      className="text-xs"
                                    >
                                      {variant.size || variant.color || 'Variante'}
                                    </Button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {(showProductDropdown || productSearch) && productSearch && searchResults.length === 0 && (
                  <div className="border border-gray-200 rounded-lg p-8 text-center text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No se encontraron productos</p>
                  </div>
                )}

                {showProductDropdown && !productSearch && searchResults.length === 0 && allProducts.length === 0 && (
                  <div className="border border-gray-200 rounded-lg p-8 text-center text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Cargando productos...</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel derecho - Resumen del pedido */}
        <div className="space-y-6">
          {/* Items del pedido */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Resumen del Pedido
              </CardTitle>
            </CardHeader>
            <CardContent>
              {orderData.items.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No hay productos en el pedido</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orderData.items.map((item, index) => (
                    <div key={`${item.productId}-${item.variantId}`} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">{item.name}</p>
                        <p className="text-xs text-gray-600">{item.sku}</p>
                        <p className="text-sm font-medium text-orange-600">
                          {formatPrice(item.unitPrice)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateItemQuantity(index, item.quantity - 1)}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateItemQuantity(index, item.quantity + 1)}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeItem(index)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Totales */}
          {orderData.items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Desglose de Precios</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">{formatPrice(orderData.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">IVA (21%):</span>
                  <span className="font-medium">{formatPrice(orderData.taxAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Envío:</span>
                  <span className="font-medium">
                    {orderData.shippingCost === 0 && orderData.shippingMethod !== 'Recogida en tienda' ? (
                      <span className="text-green-600">¡Envío gratuito!</span>
                    ) : (
                      formatPrice(orderData.shippingCost)
                    )}
                  </span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-orange-600">{formatPrice(orderData.totalAmount)}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notas */}
          <Card>
            <CardHeader>
              <CardTitle>Notas del Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas del cliente
                </label>
                <textarea
                  value={orderData.customerNotes}
                  onChange={(e) => setOrderData(prev => ({ ...prev, customerNotes: e.target.value }))}
                  placeholder="Instrucciones especiales del cliente..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Método de envío
                </label>
                <select
                  value={orderData.shippingMethod}
                  onChange={(e) => setOrderData(prev => ({ ...prev, shippingMethod: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="Envío estándar">Envío estándar (€4.50 - Gratis desde €50)</option>
                  <option value="Envío express">Envío express (€6.50 - Gratis desde €50)</option>
                  <option value="Recogida en tienda">Recogida en tienda (Gratis)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas internas
                </label>
                <textarea
                  value={orderData.adminNotes}
                  onChange={(e) => setOrderData(prev => ({ ...prev, adminNotes: e.target.value }))}
                  placeholder="Notas internas del pedido..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Botón de guardar */}
          <Button
            onClick={saveOrder}
            disabled={isSaving || !selectedCustomer || orderData.items.length === 0}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creando Pedido...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Crear Pedido
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}