"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-hot-toast"
import { 
  FileText, 
  Plus, 
  Search, 
  Filter,
  Download,
  Eye,
  Edit,
  Send,
  Calendar,
  DollarSign,
  User,
  Building,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Trash2,
  X
} from "lucide-react"

interface Invoice {
  id: string
  number: string
  customerId: string
  customerName: string
  customerEmail: string
  issueDate: string
  dueDate: string
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  subtotal: number
  tax: number
  total: number
  items: InvoiceItem[]
  notes?: string
  type: 'invoice' | 'note' // Nuevo campo para diferenciar
}

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  taxId?: string
  vatNumber?: string
}

interface CompanySettings {
  businessName: string
  legalName: string
  taxId: string
  vatNumber: string
  address: string
  postalCode: string
  city: string
  province: string
  country: string
  businessEmail: string
  businessPhone: string
  businessWebsite: string
  logo: string | null
  invoicePrefix: string
  nextInvoiceNumber: number
}

export default function InvoicesPage() {
  const router = useRouter()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null)
  const [newInvoice, setNewInvoice] = useState({
    customerId: '',
    items: [{ id: '1', description: '', quantity: 1, unitPrice: 0, total: 0 }] as InvoiceItem[],
    notes: '',
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 15 días
    type: 'invoice' as 'invoice' | 'note' // Nuevo campo
  })
  const [customerSearchTerm, setCustomerSearchTerm] = useState('')
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const customerDropdownRef = useRef<HTMLDivElement>(null)
  const [isCreating, setIsCreating] = useState(false)

  // Cargar datos iniciales
  useEffect(() => {
    loadCompanySettings()
    loadCustomers()
    loadInvoices()
  }, [])
  
  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target as Node)) {
        setShowCustomerDropdown(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const loadCompanySettings = async () => {
    // Mock de configuración de empresa
    const mockSettings: CompanySettings = {
      businessName: "Lovilike",
      legalName: "Lovilike S.L.",
      taxId: "B12345678",
      vatNumber: "ES12345678",
      address: "Calle Principal 123",
      postalCode: "28001",
      city: "Madrid",
      province: "Madrid",
      country: "España",
      businessEmail: "admin@lovilike.es",
      businessPhone: "+34 900 123 456",
      businessWebsite: "https://lovilike.es",
      logo: "/images/logo.png",
      invoicePrefix: "FAC",
      nextInvoiceNumber: 5
    }
    setCompanySettings(mockSettings)
  }

  const loadCustomers = async () => {
    // Mock de clientes
    const mockCustomers: Customer[] = [
      {
        id: "CUST-001",
        name: "María García",
        email: "maria@ejemplo.com",
        phone: "+34 600 123 456",
        address: "Calle Falsa 123, 28001 Madrid",
        taxId: "12345678Z"
      },
      {
        id: "CUST-002",
        name: "Carlos López",
        email: "carlos@ejemplo.com",
        phone: "+34 600 789 123",
        address: "Avenida Principal 456, 08001 Barcelona",
        taxId: "87654321Y"
      },
      {
        id: "CUST-003",
        name: "Ana Martínez",
        email: "ana@ejemplo.com",
        phone: "+34 600 456 789",
        address: "Plaza Mayor 789, 41001 Sevilla"
      },
      {
        id: "CUST-004",
        name: "David Ruiz",
        email: "david@ejemplo.com",
        phone: "+34 600 321 654",
        address: "Calle Comercio 321, 46001 Valencia",
        taxId: "11223344A"
      }
    ]
    setCustomers(mockCustomers)
  }

  // Filtrar clientes por búsqueda
  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
    (customer.phone && customer.phone.includes(customerSearchTerm)) ||
    (customer.taxId && customer.taxId.toLowerCase().includes(customerSearchTerm.toLowerCase()))
  )

  const selectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setNewInvoice({ ...newInvoice, customerId: customer.id })
    setCustomerSearchTerm(customer.name)
    setShowCustomerDropdown(false)
  }

  const resetCustomerSelection = () => {
    setSelectedCustomer(null)
    setNewInvoice({ ...newInvoice, customerId: '' })
    setCustomerSearchTerm('')
  }

  const handleCustomerSearchFocus = () => {
    setShowCustomerDropdown(true)
    if (customerSearchTerm === '' && selectedCustomer) {
      setCustomerSearchTerm('')
    }
  }

  const handleCustomerSearchChange = (value: string) => {
    setCustomerSearchTerm(value)
    setShowCustomerDropdown(true)
    if (selectedCustomer && value !== selectedCustomer.name) {
      setSelectedCustomer(null)
      setNewInvoice({ ...newInvoice, customerId: '' })
    }
  }

  const loadInvoices = async () => {
    try {
      // Intentar cargar facturas desde la API
      const response = await fetch('/api/invoices')
      if (response.ok) {
        const data = await response.json()
        if (data.invoices && Array.isArray(data.invoices)) {
          setInvoices(data.invoices)
          setFilteredInvoices(data.invoices)
          setIsLoading(false)
          return
        }
      }
    } catch (error) {
      console.log('API not available, using mock data:', error)
    }

    // Fallback a datos mock si la API no está disponible
    const mockInvoices: Invoice[] = [
      {
        id: "INV-001",
        number: "FAC-2025-001",
        customerId: "CUST-001",
        customerName: "María García",
        customerEmail: "maria@ejemplo.com",
        issueDate: "2025-06-01",
        dueDate: "2025-06-15",
        status: "paid",
        subtotal: 85.00,
        tax: 17.85,
        total: 102.85,
        items: [
          {
            id: "ITEM-001",
            description: "Camiseta personalizada - Diseño A",
            quantity: 2,
            unitPrice: 25.00,
            total: 50.00
          },
          {
            id: "ITEM-002", 
            description: "Taza personalizada",
            quantity: 1,
            unitPrice: 35.00,
            total: 35.00
          }
        ],
        notes: "Entrega urgente solicitada",
        type: "invoice"
      },
      {
        id: "INV-002",
        number: "FAC-2025-002",
        customerId: "CUST-002",
        customerName: "Carlos López",
        customerEmail: "carlos@ejemplo.com",
        issueDate: "2025-06-05",
        dueDate: "2025-06-19",
        status: "sent",
        subtotal: 120.00,
        tax: 25.20,
        total: 145.20,
        items: [
          {
            id: "ITEM-003",
            description: "Sudadera personalizada - Talla L",
            quantity: 3,
            unitPrice: 40.00,
            total: 120.00
          }
        ],
        type: "invoice"
      },
      {
        id: "INV-003",
        number: "NOT-2025-001",
        customerId: "CUST-003",
        customerName: "Ana Martínez",
        customerEmail: "ana@ejemplo.com",
        issueDate: "2025-05-28",
        dueDate: "2025-06-11",
        status: "overdue",
        subtotal: 75.00,
        tax: 0.00,
        total: 75.00,
        items: [
          {
            id: "ITEM-004",
            description: "Trabajo pendiente - Diseño logo",
            quantity: 1,
            unitPrice: 75.00,
            total: 75.00
          }
        ],
        type: "note"
      },
      {
        id: "INV-004",
        number: "FAC-2025-004",
        customerId: "CUST-004",
        customerName: "David Ruiz",
        customerEmail: "david@ejemplo.com",
        issueDate: "2025-06-10",
        dueDate: "2025-06-24",
        status: "draft",
        subtotal: 200.00,
        tax: 42.00,
        total: 242.00,
        items: [
          {
            id: "ITEM-005",
            description: "Pack promocional - 10 camisetas",
            quantity: 1,
            unitPrice: 200.00,
            total: 200.00
          }
        ],
        type: "invoice"
      }
    ]
    
    setInvoices(mockInvoices)
    setFilteredInvoices(mockInvoices)
    setIsLoading(false)
  }

  // Filtrar facturas
  useEffect(() => {
    let filtered = invoices.filter(invoice => {
      const matchesSearch = 
        invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = selectedStatus === "all" || invoice.status === selectedStatus
      
      return matchesSearch && matchesStatus
    })
    
    setFilteredInvoices(filtered)
  }, [invoices, searchTerm, selectedStatus])

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: "Borrador", color: "bg-gray-100 text-gray-800", icon: Edit },
      sent: { label: "Enviada", color: "bg-blue-100 text-blue-800", icon: Send },
      paid: { label: "Pagada", color: "bg-green-100 text-green-800", icon: CheckCircle },
      overdue: { label: "Vencida", color: "bg-red-100 text-red-800", icon: AlertCircle },
      cancelled: { label: "Cancelada", color: "bg-orange-100 text-orange-800", icon: XCircle }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    const Icon = config.icon
    
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
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
    const total = invoices.length
    const paid = invoices.filter(inv => inv.status === 'paid').length
    const pending = invoices.filter(inv => inv.status === 'sent').length
    const overdue = invoices.filter(inv => inv.status === 'overdue').length
    const totalAmount = invoices.reduce((sum, inv) => sum + inv.total, 0)
    const paidAmount = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total, 0)
    
    return { total, paid, pending, overdue, totalAmount, paidAmount }
  }

  const stats = calculateStats()

  const handleSendInvoice = (invoiceId: string) => {
    setInvoices(invoices.map(inv => 
      inv.id === invoiceId ? { ...inv, status: 'sent' as const } : inv
    ))
    toast.success("Factura enviada correctamente")
  }

  const handleMarkAsPaid = (invoiceId: string) => {
    setInvoices(invoices.map(inv => 
      inv.id === invoiceId ? { ...inv, status: 'paid' as const } : inv
    ))
    toast.success("Factura marcada como pagada")
  }

  const calculateItemTotal = (quantity: number, unitPrice: number) => {
    return quantity * unitPrice
  }

  const updateInvoiceItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const updatedItems = [...newInvoice.items]
    updatedItems[index] = { ...updatedItems[index], [field]: value }
    
    if (field === 'quantity' || field === 'unitPrice') {
      updatedItems[index].total = calculateItemTotal(
        updatedItems[index].quantity,
        updatedItems[index].unitPrice
      )
    }
    
    setNewInvoice({ ...newInvoice, items: updatedItems })
  }

  const addInvoiceItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    }
    setNewInvoice({ ...newInvoice, items: [...newInvoice.items, newItem] })
  }

  const removeInvoiceItem = (index: number) => {
    if (newInvoice.items.length > 1) {
      const updatedItems = newInvoice.items.filter((_, i) => i !== index)
      setNewInvoice({ ...newInvoice, items: updatedItems })
    }
  }

  const calculateInvoiceTotals = () => {
    const subtotal = newInvoice.items.reduce((sum, item) => sum + item.total, 0)
    const tax = newInvoice.type === 'invoice' ? subtotal * 0.21 : 0 // IVA 21% solo para facturas
    const total = subtotal + tax
    return { subtotal, tax, total }
  }

  const generateInvoiceNumber = () => {
    if (!companySettings) return newInvoice.type === 'invoice' ? 'FAC-2025-001' : 'NOT-2025-001'
    try {
      const year = new Date().getFullYear()
      const prefix = newInvoice.type === 'invoice' ? (companySettings.invoicePrefix || 'FAC') : 'NOT'
      const number = companySettings.nextInvoiceNumber.toString().padStart(3, '0')
      return `${prefix}-${year}-${number}`
    } catch (error) {
      console.error('Error generating invoice number:', error)
      return 'FAC-2025-001'
    }
  }

  const createInvoice = async () => {
    if (!selectedCustomer) {
      toast.error('Selecciona un cliente')
      return
    }
    
    if (newInvoice.items.some(item => !item.description || item.quantity <= 0 || item.unitPrice <= 0)) {
      toast.error('Completa todos los elementos de la factura')
      return
    }

    if (!companySettings) {
      toast.error('No se han cargado los datos de la empresa')
      return
    }

    setIsCreating(true)
    
    try {
      const totals = calculateInvoiceTotals()
      
      const invoice: Invoice = {
        id: `INV-${Date.now()}`,
        number: generateInvoiceNumber(),
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        customerEmail: selectedCustomer.email,
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: newInvoice.dueDate,
        status: 'draft',
        subtotal: totals.subtotal,
        tax: totals.tax,
        total: totals.total,
        items: newInvoice.items.map(item => ({ ...item })),
        notes: newInvoice.notes,
        type: newInvoice.type
      }
      
      // Simular creación en el servidor
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setInvoices([invoice, ...invoices])
      
      // Actualizar número de factura
      setCompanySettings({
        ...companySettings,
        nextInvoiceNumber: companySettings.nextInvoiceNumber + 1
      })
      
      // Generar PDF
      generateInvoicePDF(invoice, selectedCustomer, companySettings)
      
      // Reset form
      setNewInvoice({
        customerId: '',
        items: [{ id: '1', description: '', quantity: 1, unitPrice: 0, total: 0 }],
        notes: '',
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        type: 'invoice'
      })
      
      // Reset customer selection
      resetCustomerSelection()
      
      setShowNewInvoiceModal(false)
      toast.success('Factura creada correctamente')
      
    } catch (error) {
      console.error('Error creating invoice:', error)
      toast.error('Error al crear la factura: ' + (error instanceof Error ? error.message : 'Error desconocido'))
    } finally {
      setIsCreating(false)
    }
  }


  const generateInvoicePDF = (invoice: Invoice, customer: Customer, company: CompanySettings) => {
    try {
      // Crear contenido de la factura
      const invoiceContent = `
${company.businessName || 'Empresa'}
${company.legalName || ''}
${company.address || ''}
${company.postalCode || ''} ${company.city || ''}, ${company.province || ''}
${company.country || ''}

CIF/NIF: ${company.taxId || ''}
Nº IVA: ${company.vatNumber || ''}
Teléfono: ${company.businessPhone || ''}
Email: ${company.businessEmail || ''}
Web: ${company.businessWebsite || ''}

${'='.repeat(60)}
FACTURA
${'='.repeat(60)}

Número de Factura: ${invoice.number}
Fecha de Emisión: ${formatDate(invoice.issueDate)}
Fecha de Vencimiento: ${formatDate(invoice.dueDate)}

CLIENTE:
${customer.name}
${customer.email}
${customer.phone || ''}
${customer.address || ''}
${customer.taxId ? `NIF/CIF: ${customer.taxId}` : ''}

${'='.repeat(60)}
DETALLE DE PRODUCTOS/SERVICIOS
${'='.repeat(60)}

${'Descripción'.padEnd(30)} ${'Cant.'.padEnd(8)} ${'Precio'.padEnd(12)} ${'Total'.padEnd(12)}
${'-'.repeat(60)}
${invoice.items.map(item => 
  `${item.description.substring(0, 29).padEnd(30)} ${item.quantity.toString().padEnd(8)} ${formatCurrency(item.unitPrice).padEnd(12)} ${formatCurrency(item.total).padEnd(12)}`
).join('\n')}

${'-'.repeat(60)}
Subtotal: ${formatCurrency(invoice.subtotal).padStart(48)}
IVA (21%): ${formatCurrency(invoice.tax).padStart(47)}
TOTAL: ${formatCurrency(invoice.total).padStart(51)}

${invoice.notes ? `\nNotas:\n${invoice.notes}` : ''}

${'='.repeat(60)}
Gracias por confiar en ${company.businessName}
${'='.repeat(60)}

Generado el: ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}
    `
    
      // Crear y descargar el archivo
      const blob = new Blob([invoiceContent], { type: 'text/plain;charset=utf-8' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `${invoice.number}.txt`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      
      toast.success('PDF de factura generado y descargado')
    } catch (error) {
      console.error('Error generating invoice PDF:', error)
      toast.error('Error al generar el PDF de la factura')
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestión de Facturas</h1>
            <p className="text-gray-600">Administra y controla todas las facturas</p>
          </div>
          <Button 
            onClick={() => setShowNewInvoiceModal(true)}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Factura
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Facturas</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pagadas</p>
                <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-blue-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Vencidas</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumen financiero */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Importe Total Facturado</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Importe Cobrado</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.paidAmount)}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Buscar por número, cliente o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">Todos los estados</option>
                <option value="draft">Borrador</option>
                <option value="sent">Enviadas</option>
                <option value="paid">Pagadas</option>
                <option value="overdue">Vencidas</option>
                <option value="cancelled">Canceladas</option>
              </select>
              
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de facturas */}
      <Card>
        <CardHeader>
          <CardTitle>Facturas ({filteredInvoices.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando facturas...</p>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay facturas</h3>
              <p className="text-gray-600">No se encontraron facturas que coincidan con los filtros.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Número</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Tipo</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Cliente</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Fecha Emisión</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Vencimiento</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Estado</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Importe</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <span className="font-mono text-sm font-medium">{invoice.number}</span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={`${invoice.type === 'invoice' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                          {invoice.type === 'invoice' ? 'Factura' : 'Nota'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{invoice.customerName}</p>
                          <p className="text-sm text-gray-600">{invoice.customerEmail}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600">{formatDate(invoice.issueDate)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600">{formatDate(invoice.dueDate)}</span>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(invoice.status)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold">{formatCurrency(invoice.total)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            title="Ver detalles"
                            onClick={() => router.push(`/admin/invoices/${invoice.id}`)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            title="Editar"
                            onClick={() => router.push(`/admin/invoices/${invoice.id}/edit`)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            title="Descargar PDF"
                            onClick={() => toast.info('Función de descarga PDF próximamente')}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          {invoice.status === 'draft' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleSendInvoice(invoice.id)}
                              title="Enviar factura"
                            >
                              <Send className="w-4 h-4" />
                            </Button>
                          )}
                          {invoice.status === 'sent' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleMarkAsPaid(invoice.id)}
                              title="Marcar como pagada"
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Nueva Factura */}
      {showNewInvoiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                  {newInvoice.type === 'invoice' ? 'Nueva Factura' : 'Nueva Nota'}
                </h2>
                <Button
                  variant="outline"
                  onClick={() => setShowNewInvoiceModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Selector de Tipo de Documento */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-700">Tipo de Documento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div 
                      onClick={() => setNewInvoice({ ...newInvoice, type: 'invoice' })}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        newInvoice.type === 'invoice' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="w-6 h-6 text-blue-600" />
                        <div>
                          <h3 className="font-medium">Factura Formal</h3>
                          <p className="text-sm text-gray-600">
                            Con numeración oficial, IVA incluido y datos fiscales completos
                          </p>
                        </div>
                      </div>
                    </div>
                    <div 
                      onClick={() => setNewInvoice({ ...newInvoice, type: 'note' })}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        newInvoice.type === 'note' 
                          ? 'border-purple-500 bg-purple-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Edit className="w-6 h-6 text-purple-600" />
                        <div>
                          <h3 className="font-medium">Nota de Control</h3>
                          <p className="text-sm text-gray-600">
                            Registro interno sin IVA, para control de trabajos pendientes
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Información de la empresa */}
              {companySettings && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-gray-700">Datos de la Empresa</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="font-semibold">{companySettings.businessName}</p>
                        <p className="text-gray-600">{companySettings.legalName}</p>
                        <p className="text-gray-600">{companySettings.address}</p>
                        <p className="text-gray-600">{companySettings.postalCode} {companySettings.city}</p>
                        <p className="text-gray-600">{companySettings.province}, {companySettings.country}</p>
                      </div>
                      <div>
                        <p><span className="font-medium">CIF:</span> {companySettings.taxId}</p>
                        <p><span className="font-medium">IVA:</span> {companySettings.vatNumber}</p>
                        <p><span className="font-medium">Teléfono:</span> {companySettings.businessPhone}</p>
                        <p><span className="font-medium">Email:</span> {companySettings.businessEmail}</p>
                        <p><span className="font-medium">Web:</span> {companySettings.businessWebsite}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Selector de cliente */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-700">Cliente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="relative" ref={customerDropdownRef}>
                      <Label htmlFor="customer">Buscar Cliente</Label>
                      <div className="relative mt-1">
                        <Input
                          id="customer"
                          type="text"
                          placeholder="Buscar por nombre, email, teléfono o NIF..."
                          value={customerSearchTerm}
                          onChange={(e) => handleCustomerSearchChange(e.target.value)}
                          onFocus={handleCustomerSearchFocus}
                          className="pr-10"
                        />
                        {selectedCustomer && (
                          <button
                            type="button"
                            onClick={resetCustomerSelection}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                        
                        {/* Dropdown de resultados */}
                        {showCustomerDropdown && customerSearchTerm.length > 0 && (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                            {filteredCustomers.length > 0 ? (
                              filteredCustomers.map((customer) => (
                                <div
                                  key={customer.id}
                                  onClick={() => selectCustomer(customer)}
                                  className="px-4 py-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="font-medium text-gray-900">{customer.name}</p>
                                      <p className="text-sm text-gray-600">{customer.email}</p>
                                      {customer.phone && (
                                        <p className="text-xs text-gray-500">{customer.phone}</p>
                                      )}
                                    </div>
                                    {customer.taxId && (
                                      <Badge variant="outline" className="text-xs">
                                        {customer.taxId}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="px-4 py-3 text-sm text-gray-500">
                                No se encontraron clientes
                              </div>
                            )}
                            
                            {/* Opción para crear cliente nuevo */}
                            <div className="border-t border-gray-200 p-2">
                              <button
                                type="button"
                                className="w-full px-3 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 rounded-md flex items-center gap-2"
                                onClick={() => {
                                  toast.info('Funcionalidad para crear cliente nuevo próximamente')
                                }}
                              >
                                <Plus className="w-4 h-4" />
                                Crear cliente nuevo: "{customerSearchTerm}"
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="dueDate">Fecha de Vencimiento</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={newInvoice.dueDate}
                        onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  {/* Mostrar datos del cliente seleccionado */}
                  {selectedCustomer && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-green-900">Cliente Seleccionado</h4>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p><span className="font-medium text-gray-700">Nombre:</span> {selectedCustomer.name}</p>
                          <p><span className="font-medium text-gray-700">Email:</span> {selectedCustomer.email}</p>
                          {selectedCustomer.phone && <p><span className="font-medium text-gray-700">Teléfono:</span> {selectedCustomer.phone}</p>}
                        </div>
                        <div>
                          {selectedCustomer.address && <p><span className="font-medium text-gray-700">Dirección:</span> {selectedCustomer.address}</p>}
                          {selectedCustomer.taxId && <p><span className="font-medium text-gray-700">NIF/CIF:</span> {selectedCustomer.taxId}</p>}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Líneas de factura */}
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-700">Productos/Servicios</CardTitle>
                    <Button onClick={addInvoiceItem} size="sm" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Añadir Línea
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {newInvoice.items.map((item, index) => (
                      <div key={item.id} className="grid grid-cols-12 gap-3 items-end">
                        <div className="col-span-5">
                          <Label>Descripción</Label>
                          <Input
                            value={item.description}
                            onChange={(e) => updateInvoiceItem(index, 'description', e.target.value)}
                            placeholder="Descripción del producto/servicio"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label>Cantidad</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateInvoiceItem(index, 'quantity', parseInt(e.target.value) || 1)}
                          />
                        </div>
                        <div className="col-span-2">
                          <Label>Precio Unitario</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => updateInvoiceItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div className="col-span-2">
                          <Label>Total</Label>
                          <Input
                            value={formatCurrency(item.total)}
                            readOnly
                            className="bg-gray-50"
                          />
                        </div>
                        <div className="col-span-1">
                          {newInvoice.items.length > 1 && (
                            <Button
                              onClick={() => removeInvoiceItem(index)}
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Totales */}
                  <div className="mt-6 border-t pt-4">
                    <div className="flex justify-end">
                      <div className="w-64 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Subtotal:</span>
                          <span>{formatCurrency(calculateInvoiceTotals().subtotal)}</span>
                        </div>
                        {newInvoice.type === 'invoice' && (
                          <div className="flex justify-between text-sm">
                            <span>IVA (21%):</span>
                            <span>{formatCurrency(calculateInvoiceTotals().tax)}</span>
                          </div>
                        )}
                        {newInvoice.type === 'note' && (
                          <div className="flex justify-between text-sm text-gray-500">
                            <span>IVA:</span>
                            <span>No aplicable</span>
                          </div>
                        )}
                        <div className="flex justify-between font-semibold text-lg border-t pt-2">
                          <span>Total:</span>
                          <span>{formatCurrency(calculateInvoiceTotals().total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notas */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-700">Notas</CardTitle>
                </CardHeader>
                <CardContent>
                  <textarea
                    value={newInvoice.notes}
                    onChange={(e) => setNewInvoice({ ...newInvoice, notes: e.target.value })}
                    placeholder="Notas adicionales (opcional)"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </CardContent>
              </Card>

              {/* Botones de acción */}
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowNewInvoiceModal(false)}
                  disabled={isCreating}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={createInvoice}
                  disabled={isCreating || !selectedCustomer}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {isCreating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creando...
                    </>
                  ) : (
                    <>
                      {newInvoice.type === 'invoice' ? (
                        <>
                          <FileText className="w-4 h-4 mr-2" />
                          Crear Factura y Generar PDF
                        </>
                      ) : (
                        <>
                          <Edit className="w-4 h-4 mr-2" />
                          Crear Nota de Control
                        </>
                      )}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}