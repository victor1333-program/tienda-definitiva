"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-hot-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  TrendingUp, 
  Plus, 
  Search, 
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  Receipt,
  Building,
  Users,
  CreditCard,
  ShoppingCart,
  Coins,
  FileText,
  AlertCircle,
  CheckCircle
} from "lucide-react"

interface Income {
  id: string
  description: string
  amount: number
  category: string
  date: string
  customer: string
  status: 'pending' | 'approved' | 'received' | 'cancelled'
  paymentMethod: string
  receiptUrl?: string
  notes?: string
  tags: string[]
}

interface IncomeCategory {
  id: string
  name: string
  icon: React.ElementType
  target: number
  received: number
  color: string
}

interface NewIncomeForm {
  description: string
  amount: string
  category: string
  customer: string
  paymentMethod: string
  notes: string
  isRecurring: boolean
  recurringFrequency: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
  recurringDayOfMonth: string
  recurringEndDate: string
}

export default function IngresosPage() {
  const [incomes, setIncomes] = useState<Income[]>([])
  const [filteredIncomes, setFilteredIncomes] = useState<Income[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [showNewIncomeModal, setShowNewIncomeModal] = useState(false)
  const [newIncomeForm, setNewIncomeForm] = useState<NewIncomeForm>({
    description: '',
    amount: '',
    category: 'sales',
    customer: '',
    paymentMethod: 'Transferencia',
    notes: '',
    isRecurring: false,
    recurringFrequency: 'MONTHLY',
    recurringDayOfMonth: '1',
    recurringEndDate: ''
  })

  const [categories] = useState<IncomeCategory[]>([
    {
      id: "sales",
      name: "Ventas",
      icon: ShoppingCart,
      target: 25000,
      received: 18750,
      color: "green"
    },
    {
      id: "services",
      name: "Servicios",
      icon: Users,
      target: 8000,
      received: 6200,
      color: "blue"
    },
    {
      id: "subscriptions",
      name: "Suscripciones",
      icon: CreditCard,
      target: 3000,
      received: 2850,
      color: "purple"
    },
    {
      id: "commissions",
      name: "Comisiones",
      icon: Coins,
      target: 2000,
      received: 1650,
      color: "yellow"
    },
    {
      id: "consulting",
      name: "Consultoría",
      icon: Building,
      target: 5000,
      received: 3400,
      color: "indigo"
    },
    {
      id: "other",
      name: "Otros",
      icon: FileText,
      target: 1000,
      received: 420,
      color: "gray"
    }
  ])

  // Mock data
  useEffect(() => {
    const mockIncomes: Income[] = [
      {
        id: "ING-001",
        description: "Venta online - Camisetas personalizadas",
        amount: 1250.00,
        category: "sales",
        date: "2025-06-12",
        customer: "María García López",
        status: "received",
        paymentMethod: "Tarjeta",
        receiptUrl: "/receipts/ing-001.pdf",
        notes: "Pedido completado y enviado",
        tags: ["online", "camisetas", "personalizado"]
      },
      {
        id: "ING-002",
        description: "Servicio diseño gráfico - Logo empresarial",
        amount: 450.00,
        category: "services",
        date: "2025-06-11",
        customer: "Empresa ABC S.L.",
        status: "pending",
        paymentMethod: "Transferencia",
        tags: ["diseño", "logo", "empresarial"]
      },
      {
        id: "ING-003",
        description: "Suscripción mensual - Plan Premium",
        amount: 89.99,
        category: "subscriptions",
        date: "2025-06-10",
        customer: "Juan Pérez Martín",
        status: "received",
        paymentMethod: "Domiciliación",
        tags: ["suscripción", "premium", "mensual"]
      },
      {
        id: "ING-004",
        description: "Comisión venta - Productos textiles",
        amount: 125.50,
        category: "commissions",
        date: "2025-06-09",
        customer: "Distribuidora Norte",
        status: "approved",
        paymentMethod: "Transferencia",
        tags: ["comisión", "textiles", "distribuidora"]
      },
      {
        id: "ING-005",
        description: "Consultoría - Optimización procesos",
        amount: 800.00,
        category: "consulting",
        date: "2025-06-08",
        customer: "Textiles Avanzados S.A.",
        status: "received",
        paymentMethod: "Transferencia",
        notes: "Proyecto finalizado satisfactoriamente",
        tags: ["consultoría", "optimización", "procesos"]
      },
      {
        id: "ING-006",
        description: "Venta local - Productos estampados",
        amount: 320.75,
        category: "sales",
        date: "2025-06-07",
        customer: "Local Fashion Store",
        status: "received",
        paymentMethod: "Efectivo",
        tags: ["venta", "local", "estampados"]
      }
    ]
    
    setIncomes(mockIncomes)
    setFilteredIncomes(mockIncomes)
    setIsLoading(false)
  }, [])

  // Filtrar ingresos
  useEffect(() => {
    let filtered = incomes.filter(income => {
      const matchesSearch = 
        income.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        income.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        income.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesCategory = selectedCategory === "all" || income.category === selectedCategory
      const matchesStatus = selectedStatus === "all" || income.status === selectedStatus
      
      return matchesSearch && matchesCategory && matchesStatus
    })
    
    setFilteredIncomes(filtered)
  }, [incomes, searchTerm, selectedCategory, selectedStatus])

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800", icon: AlertCircle },
      approved: { label: "Aprobado", color: "bg-blue-100 text-blue-800", icon: CheckCircle },
      received: { label: "Recibido", color: "bg-green-100 text-green-800", icon: CheckCircle },
      cancelled: { label: "Cancelado", color: "bg-red-100 text-red-800", icon: AlertCircle }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon
    
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const getCategoryInfo = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId) || categories[categories.length - 1]
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const calculateStats = () => {
    const totalIncomes = incomes.reduce((sum, inc) => sum + inc.amount, 0)
    const pendingIncomes = incomes.filter(inc => inc.status === 'pending').reduce((sum, inc) => sum + inc.amount, 0)
    const receivedIncomes = incomes.filter(inc => inc.status === 'received').reduce((sum, inc) => sum + inc.amount, 0)
    const totalTarget = categories.reduce((sum, cat) => sum + cat.target, 0)
    
    return { totalIncomes, pendingIncomes, receivedIncomes, totalTarget }
  }

  const stats = calculateStats()

  const handleApproveIncome = (incomeId: string) => {
    setIncomes(incomes.map(inc => 
      inc.id === incomeId ? { ...inc, status: 'approved' as const } : inc
    ))
    toast.success("Ingreso aprobado")
  }

  const handleMarkAsReceived = (incomeId: string) => {
    setIncomes(incomes.map(inc => 
      inc.id === incomeId ? { ...inc, status: 'received' as const } : inc
    ))
    toast.success("Ingreso marcado como recibido")
  }

  const handleCancelIncome = (incomeId: string) => {
    setIncomes(incomes.map(inc => 
      inc.id === incomeId ? { ...inc, status: 'cancelled' as const } : inc
    ))
    toast.success("Ingreso cancelado")
  }

  const handleCreateIncome = async () => {
    if (!newIncomeForm.description || !newIncomeForm.amount || !newIncomeForm.customer) {
      toast.error("Por favor completa todos los campos obligatorios")
      return
    }

    try {
      const response = await fetch('/api/finances/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: newIncomeForm.description,
          amount: newIncomeForm.amount,
          type: 'INCOME',
          category: newIncomeForm.category,
          customer: newIncomeForm.customer,
          paymentMethod: newIncomeForm.paymentMethod,
          notes: newIncomeForm.notes,
          tags: [],
          isRecurring: newIncomeForm.isRecurring,
          recurringFrequency: newIncomeForm.recurringFrequency,
          recurringDayOfMonth: newIncomeForm.recurringDayOfMonth,
          recurringEndDate: newIncomeForm.recurringEndDate
        })
      })

      if (!response.ok) {
        throw new Error('Error al crear el ingreso')
      }

      const data = await response.json()

      // Add to local state for immediate feedback
      const newIncome: Income = {
        id: data.transaction.id,
        description: newIncomeForm.description,
        amount: parseFloat(newIncomeForm.amount),
        category: newIncomeForm.category,
        date: new Date().toISOString().split('T')[0],
        customer: newIncomeForm.customer,
        status: 'pending',
        paymentMethod: newIncomeForm.paymentMethod,
        notes: newIncomeForm.notes,
        tags: []
      }

      setIncomes([newIncome, ...incomes])
      setShowNewIncomeModal(false)
      setNewIncomeForm({
        description: '',
        amount: '',
        category: 'sales',
        customer: '',
        paymentMethod: 'Transferencia',
        notes: '',
        isRecurring: false,
        recurringFrequency: 'MONTHLY',
        recurringDayOfMonth: '1',
        recurringEndDate: ''
      })
      
      if (newIncomeForm.isRecurring) {
        toast.success("Ingreso recurrente creado. Se generará automáticamente según la frecuencia seleccionada.")
      } else {
        toast.success("Ingreso creado exitosamente")
      }

    } catch (error) {
      console.error('Error creating income:', error)
      toast.error("Error al crear el ingreso. Por favor intenta de nuevo.")
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestión de Ingresos</h1>
            <p className="text-gray-600">Controla y administra todos los ingresos de la empresa</p>
          </div>
          <Button 
            onClick={() => setShowNewIncomeModal(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Ingreso
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Ingresos</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalIncomes)}</p>
                <p className="text-xs text-gray-500">
                  {((stats.totalIncomes / stats.totalTarget) * 100).toFixed(1)}% del objetivo
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">{formatCurrency(stats.pendingIncomes)}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Recibidos</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.receivedIncomes)}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Objetivo Total</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.totalTarget)}</p>
                <p className="text-xs text-gray-500">
                  Faltante: {formatCurrency(stats.totalTarget - stats.totalIncomes)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Objetivos por categorías */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Objetivos por Categorías</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => {
              const percentage = (category.received / category.target) * 100
              const isOverTarget = percentage > 100
              
              return (
                <div key={category.id} className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 bg-${category.color}-100 rounded-full`}>
                      <category.icon className={`w-5 h-5 text-${category.color}-600`} />
                    </div>
                    <div>
                      <p className="font-medium">{category.name}</p>
                      <p className="text-sm text-gray-600">
                        {formatCurrency(category.received)} / {formatCurrency(category.target)}
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        isOverTarget ? 'bg-green-600' : `bg-${category.color}-500`
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                  <p className={`text-xs mt-1 ${
                    isOverTarget ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {percentage.toFixed(1)}% conseguido
                    {isOverTarget && " (¡Objetivo superado!)"}
                  </p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Filtros y búsqueda */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Buscar por descripción, cliente o etiquetas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">Todas las categorías</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
              
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">Todos los estados</option>
                <option value="pending">Pendiente</option>
                <option value="approved">Aprobado</option>
                <option value="received">Recibido</option>
                <option value="cancelled">Cancelado</option>
              </select>
              
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de ingresos */}
      <Card>
        <CardHeader>
          <CardTitle>Ingresos ({filteredIncomes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando ingresos...</p>
            </div>
          ) : filteredIncomes.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay ingresos</h3>
              <p className="text-gray-600">No se encontraron ingresos que coincidan con los filtros.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Descripción</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Categoría</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Cliente</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Fecha</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Importe</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Estado</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIncomes.map((income) => {
                    const categoryInfo = getCategoryInfo(income.category)
                    const CategoryIcon = categoryInfo.icon
                    
                    return (
                      <tr key={income.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{income.description}</p>
                            {income.tags.length > 0 && (
                              <div className="flex gap-1 mt-1">
                                {income.tags.slice(0, 3).map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <CategoryIcon className={`w-4 h-4 text-${categoryInfo.color}-600`} />
                            <span className="text-sm">{categoryInfo.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-600">{income.customer}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-600">{formatDate(income.date)}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-green-600">{formatCurrency(income.amount)}</span>
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(income.status)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" title="Ver detalles">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" title="Editar">
                              <Edit className="w-4 h-4" />
                            </Button>
                            {income.receiptUrl && (
                              <Button size="sm" variant="outline" title="Ver recibo">
                                <Download className="w-4 h-4" />
                              </Button>
                            )}
                            {income.status === 'pending' && (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleApproveIncome(income.id)}
                                  title="Aprobar ingreso"
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleCancelIncome(income.id)}
                                  title="Cancelar ingreso"
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                            {income.status === 'approved' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleMarkAsReceived(income.id)}
                                title="Marcar como recibido"
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <DollarSign className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Nuevo Ingreso */}
      <Dialog open={showNewIncomeModal} onOpenChange={setShowNewIncomeModal}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Ingreso</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="description">Descripción *</Label>
              <Input
                id="description"
                placeholder="Ej: Venta de productos personalizados"
                value={newIncomeForm.description}
                onChange={(e) => setNewIncomeForm({...newIncomeForm, description: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Importe *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newIncomeForm.amount}
                  onChange={(e) => setNewIncomeForm({...newIncomeForm, amount: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="category">Categoría</Label>
                <select
                  id="category"
                  value={newIncomeForm.category}
                  onChange={(e) => setNewIncomeForm({...newIncomeForm, category: e.target.value})}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="customer">Cliente *</Label>
              <Input
                id="customer"
                placeholder="Nombre del cliente"
                value={newIncomeForm.customer}
                onChange={(e) => setNewIncomeForm({...newIncomeForm, customer: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="paymentMethod">Método de Pago</Label>
              <select
                id="paymentMethod"
                value={newIncomeForm.paymentMethod}
                onChange={(e) => setNewIncomeForm({...newIncomeForm, paymentMethod: e.target.value})}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="Transferencia">Transferencia</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Domiciliación">Domiciliación</option>
                <option value="PayPal">PayPal</option>
                <option value="Bizum">Bizum</option>
              </select>
            </div>

            <div>
              <Label htmlFor="notes">Notas</Label>
              <textarea
                id="notes"
                placeholder="Notas adicionales (opcional)"
                value={newIncomeForm.notes}
                onChange={(e) => setNewIncomeForm({...newIncomeForm, notes: e.target.value})}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            {/* Sección de Recurrencia */}
            <div className="border-t pt-4">
              <div className="flex items-center space-x-2 mb-4">
                <input
                  type="checkbox"
                  id="isRecurring"
                  checked={newIncomeForm.isRecurring}
                  onChange={(e) => setNewIncomeForm({...newIncomeForm, isRecurring: e.target.checked})}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <Label htmlFor="isRecurring" className="text-sm font-medium">
                  Ingreso recurrente
                </Label>
              </div>

              {newIncomeForm.isRecurring && (
                <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="recurringFrequency">Frecuencia</Label>
                      <select
                        id="recurringFrequency"
                        value={newIncomeForm.recurringFrequency}
                        onChange={(e) => setNewIncomeForm({...newIncomeForm, recurringFrequency: e.target.value as any})}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option value="MONTHLY">Mensual</option>
                        <option value="WEEKLY">Semanal</option>
                        <option value="QUARTERLY">Trimestral</option>
                        <option value="YEARLY">Anual</option>
                      </select>
                    </div>
                    
                    {newIncomeForm.recurringFrequency === 'MONTHLY' && (
                      <div>
                        <Label htmlFor="recurringDayOfMonth">Día del Mes</Label>
                        <select
                          id="recurringDayOfMonth"
                          value={newIncomeForm.recurringDayOfMonth}
                          onChange={(e) => setNewIncomeForm({...newIncomeForm, recurringDayOfMonth: e.target.value})}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                            <option key={day} value={day}>{day}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="recurringEndDate">Fecha de Finalización (opcional)</Label>
                    <Input
                      id="recurringEndDate"
                      type="date"
                      value={newIncomeForm.recurringEndDate}
                      onChange={(e) => setNewIncomeForm({...newIncomeForm, recurringEndDate: e.target.value})}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Dejar vacío para que se repita indefinidamente
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowNewIncomeModal(false)}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleCreateIncome}
                className="bg-green-600 hover:bg-green-700"
              >
                {newIncomeForm.isRecurring ? 'Crear Ingreso Recurrente' : 'Crear Ingreso'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}