"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-hot-toast"
import { 
  TrendingUp, 
  TrendingDown, 
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
  Truck,
  Zap,
  Coffee,
  Wifi,
  Package,
  Users,
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  PiggyBank,
  CreditCard,
  Banknote,
  Calculator
} from "lucide-react"

interface Transaction {
  id: string
  description: string
  amount: number
  type: 'income' | 'expense'
  category: string
  date: string
  vendor?: string
  customer?: string
  status: 'pending' | 'approved' | 'completed' | 'rejected'
  paymentMethod: string
  receiptUrl?: string
  notes?: string
  tags: string[]
}

interface Category {
  id: string
  name: string
  icon: React.ElementType
  type: 'income' | 'expense'
  budget?: number
  spent?: number
  earned?: number
  color: string
}

export default function BalancePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [showNewTransactionModal, setShowNewTransactionModal] = useState(false)
  const [newTransactionType, setNewTransactionType] = useState<'income' | 'expense'>('income')
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [showMonthlyReport, setShowMonthlyReport] = useState(false)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)

  // Form state for new transaction
  const [newTransaction, setNewTransaction] = useState({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    vendor: '',
    customer: '',
    paymentMethod: 'Tarjeta',
    notes: '',
    tags: ''
  })

  const [categories] = useState<Category[]>([
    // Categorías de gastos
    {
      id: "materials",
      name: "Materiales",
      icon: Package,
      type: "expense",
      budget: 15000,
      spent: 12450,
      color: "blue"
    },
    {
      id: "utilities",
      name: "Servicios",
      icon: Zap,
      type: "expense",
      budget: 2500,
      spent: 1850,
      color: "yellow"
    },
    {
      id: "shipping",
      name: "Envíos",
      icon: Truck,
      type: "expense",
      budget: 3000,
      spent: 2340,
      color: "green"
    },
    {
      id: "office",
      name: "Oficina",
      icon: Building,
      type: "expense",
      budget: 1500,
      spent: 980,
      color: "purple"
    },
    {
      id: "marketing",
      name: "Marketing",
      icon: Users,
      type: "expense",
      budget: 5000,
      spent: 3200,
      color: "orange"
    },
    // Categorías de ingresos
    {
      id: "product_sales",
      name: "Ventas de Productos",
      icon: Package,
      type: "income",
      earned: 25000,
      color: "emerald"
    },
    {
      id: "custom_orders",
      name: "Pedidos Personalizados",
      icon: FileText,
      type: "income",
      earned: 18500,
      color: "teal"
    },
    {
      id: "workshops",
      name: "Talleres",
      icon: Users,
      type: "income",
      earned: 3200,
      color: "indigo"
    },
    {
      id: "other_income",
      name: "Otros Ingresos",
      icon: DollarSign,
      type: "income",
      earned: 1800,
      color: "green"
    }
  ])

  // Mock data
  useEffect(() => {
    const mockTransactions: Transaction[] = [
      // Ingresos
      {
        id: "INC-001",
        description: "Venta online - Camisetas personalizadas Lote #156",
        amount: 890.50,
        type: "income",
        category: "product_sales",
        date: "2025-06-12",
        customer: "María González",
        status: "completed",
        paymentMethod: "Tarjeta",
        tags: ["venta", "online", "camisetas"]
      },
      {
        id: "INC-002",
        description: "Pedido personalizado - Bodas Elena & Carlos",
        amount: 1250.00,
        type: "income",
        category: "custom_orders",
        date: "2025-06-11",
        customer: "Elena Martínez",
        status: "completed",
        paymentMethod: "Transferencia",
        receiptUrl: "/receipts/inc-002.pdf",
        tags: ["boda", "personalizado", "premium"]
      },
      {
        id: "INC-003",
        description: "Taller diseño textil - Grupo empresarial",
        amount: 450.00,
        type: "income",
        category: "workshops",
        date: "2025-06-10",
        customer: "Empresa TechCorp",
        status: "pending",
        paymentMethod: "Factura",
        tags: ["taller", "formación", "empresa"]
      },
      // Gastos
      {
        id: "EXP-001",
        description: "Compra de algodón orgánico - Lote 50kg",
        amount: 450.00,
        type: "expense",
        category: "materials",
        date: "2025-06-12",
        vendor: "Textiles Ecológicos S.L.",
        status: "completed",
        paymentMethod: "Transferencia",
        receiptUrl: "/receipts/exp-001.pdf",
        notes: "Material premium para nueva línea",
        tags: ["algodón", "orgánico", "premium"]
      },
      {
        id: "EXP-002",
        description: "Factura electricidad local comercial",
        amount: 180.50,
        type: "expense",
        category: "utilities",
        date: "2025-06-10",
        vendor: "Iberdrola",
        status: "pending",
        paymentMethod: "Domiciliación",
        tags: ["electricidad", "local"]
      },
      {
        id: "EXP-003",
        description: "Envíos express - Lote pedidos urgentes",
        amount: 125.80,
        type: "expense",
        category: "shipping",
        date: "2025-06-11",
        vendor: "Mensajería Express",
        status: "approved",
        paymentMethod: "Tarjeta",
        tags: ["envío", "urgente"]
      },
      {
        id: "INC-004",
        description: "Venta en tienda física - Productos varios",
        amount: 340.75,
        type: "income",
        category: "product_sales",
        date: "2025-06-09",
        customer: "Cliente de mostrador",
        status: "completed",
        paymentMethod: "Efectivo",
        tags: ["tienda", "efectivo", "varios"]
      },
      {
        id: "EXP-004",
        description: "Campaña publicitaria redes sociales",
        amount: 350.00,
        type: "expense",
        category: "marketing",
        date: "2025-06-08",
        vendor: "Facebook Ads",
        status: "completed",
        paymentMethod: "Tarjeta",
        notes: "Campaña promocional camisetas verano",
        tags: ["publicidad", "redes sociales", "campaña"]
      }
    ]
    
    setTransactions(mockTransactions)
    setFilteredTransactions(mockTransactions)
    setIsLoading(false)
  }, [])

  // Filtrar transacciones
  useEffect(() => {
    let filtered = transactions.filter(transaction => {
      const matchesSearch = 
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (transaction.vendor && transaction.vendor.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (transaction.customer && transaction.customer.toLowerCase().includes(searchTerm.toLowerCase())) ||
        transaction.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesType = selectedType === "all" || transaction.type === selectedType
      const matchesCategory = selectedCategory === "all" || transaction.category === selectedCategory
      const matchesStatus = selectedStatus === "all" || transaction.status === selectedStatus
      
      // Filtro por período
      const transactionDate = new Date(transaction.date)
      const selectedDate = new Date(selectedMonth)
      const matchesPeriod = selectedPeriod === 'all' || (
        selectedPeriod === 'month' && 
        transactionDate.getFullYear() === selectedDate.getFullYear() &&
        transactionDate.getMonth() === selectedDate.getMonth()
      ) || (
        selectedPeriod === 'year' &&
        transactionDate.getFullYear() === selectedDate.getFullYear()
      )
      
      return matchesSearch && matchesType && matchesCategory && matchesStatus && matchesPeriod
    })
    
    setFilteredTransactions(filtered)
  }, [transactions, searchTerm, selectedType, selectedCategory, selectedStatus, selectedMonth, selectedPeriod])

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800", icon: AlertCircle },
      approved: { label: "Aprobado", color: "bg-blue-100 text-blue-800", icon: CheckCircle },
      completed: { label: "Completado", color: "bg-green-100 text-green-800", icon: CheckCircle },
      rejected: { label: "Rechazado", color: "bg-red-100 text-red-800", icon: AlertCircle }
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

  const calculateStats = (transactionsList = filteredTransactions) => {
    const totalIncome = transactionsList.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
    const totalExpenses = transactionsList.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
    const netBalance = totalIncome - totalExpenses
    const pendingIncome = transactionsList.filter(t => t.type === 'income' && t.status === 'pending').reduce((sum, t) => sum + t.amount, 0)
    const pendingExpenses = transactionsList.filter(t => t.type === 'expense' && t.status === 'pending').reduce((sum, t) => sum + t.amount, 0)
    
    return { totalIncome, totalExpenses, netBalance, pendingIncome, pendingExpenses }
  }

  const stats = calculateStats()
  const periodStats = calculateStats(filteredTransactions)

  const handleApproveTransaction = (transactionId: string) => {
    setTransactions(transactions.map(t => 
      t.id === transactionId ? { ...t, status: 'approved' as const } : t
    ))
    toast.success("Transacción aprobada")
  }

  const handleCompleteTransaction = (transactionId: string) => {
    setTransactions(transactions.map(t => 
      t.id === transactionId ? { ...t, status: 'completed' as const } : t
    ))
    toast.success("Transacción completada")
  }

  const handleRejectTransaction = (transactionId: string) => {
    setTransactions(transactions.map(t =>
      t.id === transactionId ? { ...t, status: 'rejected' as const } : t
    ))
    toast.success("Transacción rechazada")
  }

  const openNewTransactionModal = (type: 'income' | 'expense') => {
    setNewTransactionType(type)
    setNewTransaction({
      description: '',
      amount: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      vendor: '',
      customer: '',
      paymentMethod: 'Tarjeta',
      notes: '',
      tags: ''
    })
    setShowNewTransactionModal(true)
  }

  const handleSaveTransaction = () => {
    if (!newTransaction.description || !newTransaction.amount || !newTransaction.category) {
      toast.error('Por favor completa todos los campos obligatorios')
      return
    }

    const transaction: Transaction = {
      id: `${newTransactionType === 'income' ? 'INC' : 'EXP'}-${String(transactions.length + 1).padStart(3, '0')}`,
      description: newTransaction.description,
      amount: parseFloat(newTransaction.amount),
      type: newTransactionType,
      category: newTransaction.category,
      date: newTransaction.date,
      vendor: newTransactionType === 'expense' ? newTransaction.vendor : undefined,
      customer: newTransactionType === 'income' ? newTransaction.customer : undefined,
      status: 'pending',
      paymentMethod: newTransaction.paymentMethod,
      notes: newTransaction.notes,
      tags: newTransaction.tags ? newTransaction.tags.split(',').map(t => t.trim()).filter(Boolean) : []
    }

    setTransactions([transaction, ...transactions])
    setShowNewTransactionModal(false)
    toast.success(`${newTransactionType === 'income' ? 'Ingreso' : 'Gasto'} creado correctamente`)
  }

  const generateMonthlyReport = async () => {
    setIsGeneratingReport(true)
    try {
      const monthName = new Date(selectedMonth).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
      const reportData = {
        period: monthName,
        stats: periodStats,
        transactions: filteredTransactions,
        categoryBreakdown: getCategoryBreakdown(filteredTransactions)
      }
      
      // Simular generación de informe
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Crear y descargar PDF o Excel
      downloadReport(reportData)
      toast.success('Informe mensual generado correctamente')
    } catch (error) {
      toast.error('Error al generar el informe')
    } finally {
      setIsGeneratingReport(false)
    }
  }

  const getCategoryBreakdown = (transactionsList: Transaction[]) => {
    const breakdown = categories.reduce((acc, category) => {
      const categoryTransactions = transactionsList.filter(t => t.category === category.id)
      const total = categoryTransactions.reduce((sum, t) => sum + t.amount, 0)
      const count = categoryTransactions.length
      
      if (count > 0) {
        acc[category.name] = {
          type: category.type,
          total,
          count,
          transactions: categoryTransactions
        }
      }
      return acc
    }, {} as Record<string, any>)
    
    return breakdown
  }

  const downloadReport = (reportData: any) => {
    // Crear contenido del informe
    const reportContent = `
INFORME MENSUAL DE BALANCE - ${reportData.period.toUpperCase()}
${'='.repeat(50)}

RESUMEN FINANCIERO:
• Ingresos Totales: ${formatCurrency(reportData.stats.totalIncome)}
• Gastos Totales: ${formatCurrency(reportData.stats.totalExpenses)}
• Balance Neto: ${formatCurrency(reportData.stats.netBalance)}
• Ingresos Pendientes: ${formatCurrency(reportData.stats.pendingIncome)}
• Gastos Pendientes: ${formatCurrency(reportData.stats.pendingExpenses)}

DESGLOSE POR CATEGORÍAS:
${Object.entries(reportData.categoryBreakdown).map(([name, data]: [string, any]) => 
  `• ${name} (${data.type === 'income' ? 'Ingresos' : 'Gastos'}): ${formatCurrency(data.total)} (${data.count} transacciones)`
).join('\n')}

TRANSACCIONES DETALLADAS:
${reportData.transactions.map((t: Transaction, i: number) => 
  `${i + 1}. ${formatDate(t.date)} - ${t.description} - ${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)} [${t.status}]`
).join('\n')}

Generado el: ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}
    `
    
    const blob = new Blob([reportContent], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = url
    a.download = `informe-balance-${selectedMonth}.txt`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getMonthlyTrend = () => {
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
    const currentMonth = new Date(selectedMonth).getMonth()
    const currentYear = new Date(selectedMonth).getFullYear()
    
    return months.map((month, index) => {
      const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.date)
        return tDate.getMonth() === index && tDate.getFullYear() === currentYear
      })
      
      const income = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
      const expenses = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
      
      return {
        month,
        income,
        expenses,
        balance: income - expenses,
        isCurrentMonth: index === currentMonth
      }
    })
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Balance Financiero</h1>
            <p className="text-gray-600">Controla ingresos y gastos para mantener un balance saludable</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={generateMonthlyReport}
              disabled={isGeneratingReport}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <FileText className="w-4 h-4 mr-2" />
              {isGeneratingReport ? 'Generando...' : 'Informe Mensual'}
            </Button>
            <Button 
              onClick={() => setShowMonthlyReport(!showMonthlyReport)}
              variant="outline"
            >
              <Calculator className="w-4 h-4 mr-2" />
              {showMonthlyReport ? 'Ocultar' : 'Ver'} Análisis
            </Button>
            <Button
              onClick={() => openNewTransactionModal('income')}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Ingreso
            </Button>
            <Button
              onClick={() => openNewTransactionModal('expense')}
              className="bg-red-600 hover:bg-red-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Gasto
            </Button>
          </div>
        </div>
      </div>

      {/* Selector de Período */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Período de Análisis</h3>
              <div className="flex gap-2">
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="month">Mensual</option>
                  <option value="year">Anual</option>
                  <option value="all">Todos los períodos</option>
                </select>
                {selectedPeriod !== 'all' && (
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Período seleccionado:</p>
              <p className="font-medium text-gray-900">
                {selectedPeriod === 'all' ? 'Todos los períodos' : 
                 selectedPeriod === 'year' ? new Date(selectedMonth).getFullYear() :
                 new Date(selectedMonth).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
              </p>
              <p className="text-xs text-gray-500">
                {filteredTransactions.length} transacciones encontradas
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {selectedPeriod === 'all' ? 'Ingresos Totales' : 
                   selectedPeriod === 'year' ? 'Ingresos del Año' : 'Ingresos del Mes'}
                </p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(periodStats.totalIncome)}</p>
                {selectedPeriod !== 'all' && stats.totalIncome !== periodStats.totalIncome && (
                  <p className="text-xs text-gray-500">Total general: {formatCurrency(stats.totalIncome)}</p>
                )}
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {selectedPeriod === 'all' ? 'Gastos Totales' : 
                   selectedPeriod === 'year' ? 'Gastos del Año' : 'Gastos del Mes'}
                </p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(periodStats.totalExpenses)}</p>
                {selectedPeriod !== 'all' && stats.totalExpenses !== periodStats.totalExpenses && (
                  <p className="text-xs text-gray-500">Total general: {formatCurrency(stats.totalExpenses)}</p>
                )}
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {selectedPeriod === 'all' ? 'Balance Neto' : 
                   selectedPeriod === 'year' ? 'Balance del Año' : 'Balance del Mes'}
                </p>
                <p className={`text-2xl font-bold ${periodStats.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(periodStats.netBalance)}
                </p>
                {selectedPeriod !== 'all' && stats.netBalance !== periodStats.netBalance && (
                  <p className="text-xs text-gray-500">Total general: {formatCurrency(stats.netBalance)}</p>
                )}
              </div>
              <Calculator className={`h-8 w-8 ${periodStats.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ingresos Pendientes</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(periodStats.pendingIncome)}</p>
              </div>
              <Banknote className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Gastos Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">{formatCurrency(periodStats.pendingExpenses)}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Analysis */}
      {showMonthlyReport && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Análisis del Período Seleccionado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Desglose por categorías */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Desglose por Categorías</h4>
                <div className="space-y-3">
                  {Object.entries(getCategoryBreakdown(filteredTransactions)).map(([name, data]: [string, any]) => {
                    const category = categories.find(c => c.name === name)
                    const CategoryIcon = category?.icon || DollarSign
                    
                    return (
                      <div key={name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <CategoryIcon className={`w-5 h-5 text-${category?.color || 'gray'}-600`} />
                          <div>
                            <p className="font-medium text-gray-900">{name}</p>
                            <p className="text-sm text-gray-600">{data.count} transacciones</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${data.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                            {data.type === 'income' ? '+' : '-'}{formatCurrency(data.total)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {((data.total / (data.type === 'income' ? periodStats.totalIncome : periodStats.totalExpenses)) * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
              
              {/* Tendencia mensual */}
              {selectedPeriod !== 'month' && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Tendencia Mensual del Año</h4>
                  <div className="space-y-2">
                    {getMonthlyTrend().map((monthData, index) => (
                      <div 
                        key={index} 
                        className={`flex items-center justify-between p-2 rounded-lg ${
                          monthData.isCurrentMonth ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-full ${
                            monthData.balance >= 0 ? 'bg-green-500' : 'bg-red-500'
                          }`}></span>
                          <span className={`text-sm capitalize ${
                            monthData.isCurrentMonth ? 'font-medium text-orange-700' : 'text-gray-700'
                          }`}>
                            {monthData.month}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${
                            monthData.balance >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatCurrency(monthData.balance)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatCurrency(monthData.income)} - {formatCurrency(monthData.expenses)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Resumen de transacciones pendientes */}
              {(periodStats.pendingIncome > 0 || periodStats.pendingExpenses > 0) && (
                <div className="lg:col-span-2">
                  <h4 className="font-medium text-gray-900 mb-4">Transacciones Pendientes de Aprobación</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {periodStats.pendingIncome > 0 && (
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Banknote className="w-5 h-5 text-blue-600" />
                          <span className="font-medium text-blue-900">Ingresos Pendientes</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-600 mb-1">{formatCurrency(periodStats.pendingIncome)}</p>
                        <p className="text-sm text-blue-700">
                          {filteredTransactions.filter(t => t.type === 'income' && t.status === 'pending').length} transacciones
                        </p>
                      </div>
                    )}
                    {periodStats.pendingExpenses > 0 && (
                      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="w-5 h-5 text-yellow-600" />
                          <span className="font-medium text-yellow-900">Gastos Pendientes</span>
                        </div>
                        <p className="text-2xl font-bold text-yellow-600 mb-1">{formatCurrency(periodStats.pendingExpenses)}</p>
                        <p className="text-sm text-yellow-700">
                          {filteredTransactions.filter(t => t.type === 'expense' && t.status === 'pending').length} transacciones
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros y búsqueda */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Buscar transacciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">Todos los tipos</option>
                <option value="income">Solo Ingresos</option>
                <option value="expense">Solo Gastos</option>
              </select>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">Todas las categorías</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({category.type === 'income' ? 'Ingreso' : 'Gasto'})
                  </option>
                ))}
              </select>
              
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">Todos los estados</option>
                <option value="pending">Pendiente</option>
                <option value="approved">Aprobado</option>
                <option value="completed">Completado</option>
                <option value="rejected">Rechazado</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de transacciones */}
      <Card>
        <CardHeader>
          <CardTitle>Transacciones ({filteredTransactions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando transacciones...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay transacciones</h3>
              <p className="text-gray-600">No se encontraron transacciones que coincidan con los filtros.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Tipo</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Descripción</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Categoría</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Cliente/Proveedor</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Fecha</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Importe</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Estado</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => {
                    const categoryInfo = getCategoryInfo(transaction.category)
                    const CategoryIcon = categoryInfo.icon
                    
                    return (
                      <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <Badge className={transaction.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {transaction.type === 'income' ? (
                              <>
                                <TrendingUp className="w-3 h-3 mr-1" />
                                Ingreso
                              </>
                            ) : (
                              <>
                                <TrendingDown className="w-3 h-3 mr-1" />
                                Gasto
                              </>
                            )}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{transaction.description}</p>
                            {transaction.tags.length > 0 && (
                              <div className="flex gap-1 mt-1">
                                {transaction.tags.slice(0, 3).map((tag) => (
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
                          <span className="text-sm text-gray-600">
                            {transaction.vendor || transaction.customer || '-'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-600">{formatDate(transaction.date)}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(transaction.status)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" title="Ver detalles">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" title="Editar">
                              <Edit className="w-4 h-4" />
                            </Button>
                            {transaction.receiptUrl && (
                              <Button size="sm" variant="outline" title="Ver recibo">
                                <Download className="w-4 h-4" />
                              </Button>
                            )}
                            {transaction.status === 'pending' && (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleApproveTransaction(transaction.id)}
                                  title="Aprobar"
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleRejectTransaction(transaction.id)}
                                  title="Rechazar"
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                            {transaction.status === 'approved' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleCompleteTransaction(transaction.id)}
                                title="Marcar como completado"
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

      {/* Modal de Nueva Transacción */}
      {showNewTransactionModal && (
        <div className="fixed top-20 left-56 right-0 bottom-0 bg-black/35 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {newTransactionType === 'income' ? '💰 Nuevo Ingreso' : '💸 Nuevo Gasto'}
                </h2>
                <button
                  onClick={() => setShowNewTransactionModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Descripción */}
              <div>
                <Label htmlFor="description" className="text-gray-700 font-medium">
                  Descripción *
                </Label>
                <Input
                  id="description"
                  type="text"
                  placeholder="Ej: Venta online - Camisetas personalizadas"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                  className="mt-1"
                />
              </div>

              {/* Categoría y Monto */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category" className="text-gray-700 font-medium">
                    Categoría *
                  </Label>
                  <select
                    id="category"
                    value={newTransaction.category}
                    onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Selecciona una categoría</option>
                    {categories
                      .filter(cat => cat.type === newTransactionType)
                      .map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="amount" className="text-gray-700 font-medium">
                    Importe (€) *
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Fecha y Método de Pago */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date" className="text-gray-700 font-medium">
                    Fecha *
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={newTransaction.date}
                    onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="paymentMethod" className="text-gray-700 font-medium">
                    Método de Pago
                  </Label>
                  <select
                    id="paymentMethod"
                    value={newTransaction.paymentMethod}
                    onChange={(e) => setNewTransaction({...newTransaction, paymentMethod: e.target.value})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="Tarjeta">Tarjeta</option>
                    <option value="Efectivo">Efectivo</option>
                    <option value="Transferencia">Transferencia</option>
                    <option value="Domiciliación">Domiciliación</option>
                    <option value="Factura">Factura</option>
                  </select>
                </div>
              </div>

              {/* Cliente o Proveedor */}
              <div>
                <Label htmlFor="clientVendor" className="text-gray-700 font-medium">
                  {newTransactionType === 'income' ? 'Cliente' : 'Proveedor'}
                </Label>
                <Input
                  id="clientVendor"
                  type="text"
                  placeholder={newTransactionType === 'income' ? 'Nombre del cliente' : 'Nombre del proveedor'}
                  value={newTransactionType === 'income' ? newTransaction.customer : newTransaction.vendor}
                  onChange={(e) => newTransactionType === 'income'
                    ? setNewTransaction({...newTransaction, customer: e.target.value})
                    : setNewTransaction({...newTransaction, vendor: e.target.value})
                  }
                  className="mt-1"
                />
              </div>

              {/* Etiquetas */}
              <div>
                <Label htmlFor="tags" className="text-gray-700 font-medium">
                  Etiquetas
                </Label>
                <Input
                  id="tags"
                  type="text"
                  placeholder="Ej: venta, online, premium (separadas por comas)"
                  value={newTransaction.tags}
                  onChange={(e) => setNewTransaction({...newTransaction, tags: e.target.value})}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">Separa las etiquetas con comas</p>
              </div>

              {/* Notas */}
              <div>
                <Label htmlFor="notes" className="text-gray-700 font-medium">
                  Notas
                </Label>
                <textarea
                  id="notes"
                  rows={3}
                  placeholder="Información adicional..."
                  value={newTransaction.notes}
                  onChange={(e) => setNewTransaction({...newTransaction, notes: e.target.value})}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <Button
                onClick={() => setShowNewTransactionModal(false)}
                variant="outline"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveTransaction}
                className={newTransactionType === 'income' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              >
                <Plus className="w-4 h-4 mr-2" />
                Guardar {newTransactionType === 'income' ? 'Ingreso' : 'Gasto'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}