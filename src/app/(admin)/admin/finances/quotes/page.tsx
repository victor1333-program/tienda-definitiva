"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-hot-toast"
import jsPDF from 'jspdf'
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
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Copy,
  RefreshCw,
  Trash2,
  X
} from "lucide-react"

interface Quote {
  id: string
  number: string
  customerId: string
  customerName: string
  customerEmail: string
  issueDate: string
  expiryDate: string
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted'
  subtotal: number
  tax: number
  total: number
  items: QuoteItem[]
  notes?: string
  validityDays: number
}

interface QuoteItem {
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
  quotePrefix: string
  nextQuoteNumber: number
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [filteredQuotes, setFilteredQuotes] = useState<Quote[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [showNewQuoteModal, setShowNewQuoteModal] = useState(false)
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  // Estados para creación de presupuestos
  const [customers, setCustomers] = useState<Customer[]>([])
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null)
  const [newQuote, setNewQuote] = useState({
    customerId: '',
    items: [{ id: '1', description: '', quantity: 1, unitPrice: 0, total: 0 }] as QuoteItem[],
    notes: '',
    validityDays: 15,
    expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  })
  const [customerSearchTerm, setCustomerSearchTerm] = useState('')
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const customerDropdownRef = useRef<HTMLDivElement>(null)
  const [isCreating, setIsCreating] = useState(false)

  // Estados para autocompletado de productos
  const [products, setProducts] = useState<any[]>([])
  const [productSearch, setProductSearch] = useState<{[key: number]: string}>({})
  const [showProductDropdown, setShowProductDropdown] = useState<{[key: number]: boolean}>({})
  const productDropdownRefs = useRef<{[key: number]: HTMLDivElement | null}>({})

  // Cargar datos iniciales
  useEffect(() => {
    loadCompanySettings()
    loadCustomers()
    loadProducts()
  }, [])

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Cerrar dropdown de clientes
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target as Node)) {
        setShowCustomerDropdown(false)
      }

      // Cerrar dropdowns de productos
      Object.keys(productDropdownRefs.current).forEach(key => {
        const index = parseInt(key)
        const ref = productDropdownRefs.current[index]
        if (ref && !ref.contains(event.target as Node)) {
          setShowProductDropdown(prev => ({ ...prev, [index]: false }))
        }
      })
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const loadCompanySettings = async () => {
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
      quotePrefix: "PRES",
      nextQuoteNumber: 6
    }
    setCompanySettings(mockSettings)
  }

  const loadCustomers = async () => {
    const mockCustomers: Customer[] = [
      {
        id: "CUST-001",
        name: "Empresa ABC S.L.",
        email: "contacto@empresaabc.com",
        phone: "+34 600 111 222",
        address: "Calle Industrial 123, 28001 Madrid",
        taxId: "B12345678"
      },
      {
        id: "CUST-002",
        name: "María Rodríguez",
        email: "maria.rodriguez@email.com",
        phone: "+34 600 333 444",
        address: "Avenida Central 456, 08001 Barcelona"
      },
      {
        id: "CUST-003",
        name: "Carlos Gómez",
        email: "carlos@ejemplo.com",
        phone: "+34 600 555 666",
        address: "Plaza Mayor 789, 41001 Sevilla"
      },
      {
        id: "CUST-004",
        name: "Ana López",
        email: "ana.lopez@empresa.com",
        phone: "+34 600 777 888",
        address: "Calle Comercio 321, 46001 Valencia",
        taxId: "11223344A"
      },
      {
        id: "CUST-005",
        name: "Tech Solutions",
        email: "info@techsolutions.com",
        phone: "+34 900 999 000",
        address: "Polígono Industrial 99, 28015 Madrid",
        taxId: "B99887766"
      }
    ]
    setCustomers(mockCustomers)
  }

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/products?limit=100', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      if (response.ok) {
        const data = await response.json()
        // La API retorna en data.data.products
        const productsArray = data.data?.products || data.products || []
        console.log('Productos cargados:', productsArray.length)
        console.log('Primer producto:', productsArray[0])
        setProducts(productsArray)
      } else {
        console.error('Error al cargar productos:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error loading products:', error)
      setProducts([])
    }
  }

  // Funciones de manejo de productos
  const getFilteredProducts = (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 2) return []
    return products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 10)
  }

  const selectProduct = (index: number, product: any) => {
    const updatedItems = [...newQuote.items]
    const productPrice = product.basePrice || product.price || 0
    updatedItems[index].description = product.name
    updatedItems[index].unitPrice = parseFloat(productPrice)
    updatedItems[index].total = updatedItems[index].quantity * parseFloat(productPrice)

    setNewQuote({ ...newQuote, items: updatedItems })
    setProductSearch({ ...productSearch, [index]: product.name })
    setShowProductDropdown({ ...showProductDropdown, [index]: false })
  }

  const handleProductSearchChange = (index: number, value: string) => {
    const updatedItems = [...newQuote.items]
    updatedItems[index].description = value

    setNewQuote({ ...newQuote, items: updatedItems })
    setProductSearch({ ...productSearch, [index]: value })
    setShowProductDropdown({ ...showProductDropdown, [index]: value.length >= 2 })
  }

  // Funciones de manejo de clientes
  const filteredCustomers = customers.filter(customer =>
    (customer.name || '').toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
    (customer.email || '').toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
    (customer.phone && customer.phone.includes(customerSearchTerm)) ||
    (customer.taxId && customer.taxId.toLowerCase().includes(customerSearchTerm.toLowerCase()))
  )

  const selectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setNewQuote({ ...newQuote, customerId: customer.id })
    setCustomerSearchTerm(customer.name)
    setShowCustomerDropdown(false)
  }

  const resetCustomerSelection = () => {
    setSelectedCustomer(null)
    setNewQuote({ ...newQuote, customerId: '' })
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
      setNewQuote({ ...newQuote, customerId: '' })
    }
  }

  // Funciones de manejo de items
  const calculateItemTotal = (quantity: number, unitPrice: number) => {
    return quantity * unitPrice
  }

  const updateQuoteItem = (index: number, field: keyof QuoteItem, value: any) => {
    const updatedItems = [...newQuote.items]
    updatedItems[index] = { ...updatedItems[index], [field]: value }

    if (field === 'quantity' || field === 'unitPrice') {
      updatedItems[index].total = calculateItemTotal(
        updatedItems[index].quantity,
        updatedItems[index].unitPrice
      )
    }

    setNewQuote({ ...newQuote, items: updatedItems })
  }

  const addQuoteItem = () => {
    const newItem: QuoteItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    }
    setNewQuote({ ...newQuote, items: [...newQuote.items, newItem] })
  }

  const removeQuoteItem = (index: number) => {
    if (newQuote.items.length > 1) {
      const updatedItems = newQuote.items.filter((_, i) => i !== index)
      setNewQuote({ ...newQuote, items: updatedItems })
    }
  }

  const calculateQuoteTotals = () => {
    const subtotal = newQuote.items.reduce((sum, item) => sum + item.total, 0)
    const tax = subtotal * 0.21 // IVA 21%
    const total = subtotal + tax
    return { subtotal, tax, total }
  }

  const generateQuoteNumber = () => {
    if (!companySettings) return 'PRES-2025-001'
    const year = new Date().getFullYear()
    const prefix = companySettings.quotePrefix || 'PRES'
    const number = companySettings.nextQuoteNumber.toString().padStart(3, '0')
    return `${prefix}-${year}-${number}`
  }

  const createQuote = async () => {
    if (!selectedCustomer) {
      toast.error('Selecciona un cliente')
      return
    }

    if (newQuote.items.some(item => !item.description || item.quantity <= 0 || item.unitPrice <= 0)) {
      toast.error('Completa todos los elementos del presupuesto')
      return
    }

    if (!companySettings) {
      toast.error('No se han cargado los datos de la empresa')
      return
    }

    setIsCreating(true)

    try {
      const totals = calculateQuoteTotals()

      const quote: Quote = {
        id: `QUO-${Date.now()}`,
        number: generateQuoteNumber(),
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        customerEmail: selectedCustomer.email,
        issueDate: new Date().toISOString().split('T')[0],
        expiryDate: newQuote.expiryDate,
        status: 'draft',
        subtotal: totals.subtotal,
        tax: totals.tax,
        total: totals.total,
        items: newQuote.items.map(item => ({ ...item })),
        notes: newQuote.notes,
        validityDays: newQuote.validityDays
      }

      await new Promise(resolve => setTimeout(resolve, 500))

      setQuotes([quote, ...quotes])

      // Actualizar número de presupuesto
      setCompanySettings({
        ...companySettings,
        nextQuoteNumber: companySettings.nextQuoteNumber + 1
      })

      // Reset form
      setNewQuote({
        customerId: '',
        items: [{ id: '1', description: '', quantity: 1, unitPrice: 0, total: 0 }],
        notes: '',
        validityDays: 15,
        expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      })

      resetCustomerSelection()
      setShowNewQuoteModal(false)
      toast.success('Presupuesto creado correctamente')

    } catch (error) {
      console.error('Error creating quote:', error)
      toast.error('Error al crear el presupuesto')
    } finally {
      setIsCreating(false)
    }
  }

  // Mock data
  useEffect(() => {
    const mockQuotes: Quote[] = [
      {
        id: "QUO-001",
        number: "PRES-2025-001",
        customerId: "CUST-001",
        customerName: "Empresa ABC S.L.",
        customerEmail: "contacto@empresaabc.com",
        issueDate: "2025-06-10",
        expiryDate: "2025-06-25",
        status: "sent",
        subtotal: 450.00,
        tax: 94.50,
        total: 544.50,
        validityDays: 15,
        items: [
          {
            id: "ITEM-001",
            description: "Lote 50 camisetas corporativas con logo",
            quantity: 50,
            unitPrice: 9.00,
            total: 450.00
          }
        ],
        notes: "Incluye diseño personalizado y configuración inicial"
      },
      {
        id: "QUO-002", 
        number: "PRES-2025-002",
        customerId: "CUST-002",
        customerName: "María Rodríguez",
        customerEmail: "maria.rodriguez@email.com",
        issueDate: "2025-06-08",
        expiryDate: "2025-06-23",
        status: "accepted",
        subtotal: 125.00,
        tax: 26.25,
        total: 151.25,
        validityDays: 15,
        items: [
          {
            id: "ITEM-002",
            description: "Sudadera personalizada - Diseño premium",
            quantity: 3,
            unitPrice: 35.00,
            total: 105.00
          },
          {
            id: "ITEM-003",
            description: "Servicio diseño gráfico",
            quantity: 1,
            unitPrice: 20.00,
            total: 20.00
          }
        ]
      },
      {
        id: "QUO-003",
        number: "PRES-2025-003",
        customerId: "CUST-003",
        customerName: "Carlos Gómez",
        customerEmail: "carlos@ejemplo.com",
        issueDate: "2025-05-25",
        expiryDate: "2025-06-09",
        status: "expired",
        subtotal: 280.00,
        tax: 58.80,
        total: 338.80,
        validityDays: 15,
        items: [
          {
            id: "ITEM-004",
            description: "Pack regalo personalizado",
            quantity: 10,
            unitPrice: 28.00,
            total: 280.00
          }
        ]
      },
      {
        id: "QUO-004",
        number: "PRES-2025-004",
        customerId: "CUST-004",
        customerName: "Ana López",
        customerEmail: "ana.lopez@empresa.com",
        issueDate: "2025-06-12",
        expiryDate: "2025-06-27",
        status: "draft",
        subtotal: 650.00,
        tax: 136.50,
        total: 786.50,
        validityDays: 15,
        items: [
          {
            id: "ITEM-005",
            description: "Uniformes de trabajo personalizados",
            quantity: 25,
            unitPrice: 26.00,
            total: 650.00
          }
        ],
        notes: "Pendiente confirmación de tallas y colores"
      },
      {
        id: "QUO-005",
        number: "PRES-2025-005",
        customerId: "CUST-005", 
        customerName: "Tech Solutions",
        customerEmail: "info@techsolutions.com",
        issueDate: "2025-06-05",
        expiryDate: "2025-06-20",
        status: "converted",
        subtotal: 890.00,
        tax: 186.90,
        total: 1076.90,
        validityDays: 15,
        items: [
          {
            id: "ITEM-006",
            description: "Material promocional evento - Pack completo",
            quantity: 1,
            unitPrice: 890.00,
            total: 890.00
          }
        ]
      }
    ]
    
    setQuotes(mockQuotes)
    setFilteredQuotes(mockQuotes)
    setIsLoading(false)
  }, [])

  // Filtrar presupuestos
  useEffect(() => {
    let filtered = quotes.filter(quote => {
      const matchesSearch =
        (quote.number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (quote.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (quote.customerEmail || '').toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = selectedStatus === "all" || quote.status === selectedStatus

      return matchesSearch && matchesStatus
    })
    
    setFilteredQuotes(filtered)
  }, [quotes, searchTerm, selectedStatus])

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: "Borrador", color: "bg-gray-100 text-gray-800", icon: Edit },
      sent: { label: "Enviado", color: "bg-blue-100 text-blue-800", icon: Send },
      accepted: { label: "Aceptado", color: "bg-green-100 text-green-800", icon: CheckCircle },
      rejected: { label: "Rechazado", color: "bg-red-100 text-red-800", icon: XCircle },
      expired: { label: "Expirado", color: "bg-orange-100 text-orange-800", icon: Clock },
      converted: { label: "Convertido", color: "bg-purple-100 text-purple-800", icon: RefreshCw }
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
    const total = quotes.length
    const sent = quotes.filter(q => q.status === 'sent').length
    const accepted = quotes.filter(q => q.status === 'accepted').length
    const converted = quotes.filter(q => q.status === 'converted').length
    const expired = quotes.filter(q => q.status === 'expired').length
    const totalAmount = quotes.reduce((sum, q) => sum + q.total, 0)
    const acceptedAmount = quotes.filter(q => q.status === 'accepted' || q.status === 'converted').reduce((sum, q) => sum + q.total, 0)
    
    return { total, sent, accepted, converted, expired, totalAmount, acceptedAmount }
  }

  const stats = calculateStats()

  const handleSendQuote = (quoteId: string) => {
    setQuotes(quotes.map(quote => 
      quote.id === quoteId ? { ...quote, status: 'sent' as const } : quote
    ))
    toast.success("Presupuesto enviado correctamente")
  }

  const handleAcceptQuote = (quoteId: string) => {
    setQuotes(quotes.map(quote => 
      quote.id === quoteId ? { ...quote, status: 'accepted' as const } : quote
    ))
    toast.success("Presupuesto marcado como aceptado")
  }

  const handleConvertToInvoice = async (quoteId: string) => {
    const quote = quotes.find(q => q.id === quoteId)
    if (!quote) {
      toast.error("Presupuesto no encontrado")
      return
    }

    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quoteData: quote
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al convertir presupuesto')
      }

      const data = await response.json()
      
      // Actualizar el estado del presupuesto a convertido
      setQuotes(quotes.map(q => 
        q.id === quoteId ? { ...q, status: 'converted' as const } : q
      ))
      
      toast.success(`Presupuesto convertido a factura ${data.invoice.invoiceNumber}`)
      
      // Opcionalmente, ir a la página de facturas
      if (confirm('¿Deseas ir a la página de facturas para ver la factura creada?')) {
        window.location.href = '/admin/finances/invoices'
      }
      
    } catch (error) {
      console.error('Error converting quote to invoice:', error)
      toast.error('Error al convertir presupuesto a factura')
    }
  }

  const handleDuplicateQuote = (quoteId: string) => {
    const originalQuote = quotes.find(q => q.id === quoteId)
    if (originalQuote) {
      const newQuote = {
        ...originalQuote,
        id: `QUO-${Date.now()}`,
        number: `PRES-2025-${String(quotes.length + 1).padStart(3, '0')}`,
        status: 'draft' as const,
        issueDate: new Date().toISOString().split('T')[0],
        expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
      setQuotes([...quotes, newQuote])
      toast.success("Presupuesto duplicado")
    }
  }

  const handleViewDetails = (quoteId: string) => {
    setSelectedQuoteId(quoteId)
    setShowDetailsModal(true)
  }

  const handleEditQuote = (quoteId: string) => {
    setSelectedQuoteId(quoteId)
    setShowEditModal(true)
  }

  const handleDownloadPDF = (quoteId: string) => {
    const quote = quotes.find(q => q.id === quoteId)
    if (!quote) {
      toast.error("Presupuesto no encontrado")
      return
    }

    try {
      // Crear nuevo documento PDF
      const doc = new jsPDF()
      
      // Configuración de fuentes y colores
      const primaryColor = '#f97316' // orange-500
      const darkColor = '#1f2937' // gray-800
      const lightColor = '#6b7280' // gray-500
      
      // Header con logo/título de empresa
      doc.setFillColor(248, 115, 22) // orange-500
      doc.rect(0, 0, 210, 25, 'F')
      
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(20)
      doc.setFont('helvetica', 'bold')
      doc.text('LOVILIKE', 20, 17)
      
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.text('Textiles Personalizados', 135, 17)
      
      // Título del documento
      doc.setTextColor(31, 41, 55) // gray-800
      doc.setFontSize(24)
      doc.setFont('helvetica', 'bold')
      doc.text('PRESUPUESTO', 20, 40)
      
      // Información del presupuesto
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.text(`Número: ${quote.number}`, 20, 55)
      doc.text(`Fecha de emisión: ${formatDate(quote.issueDate)}`, 20, 65)
      doc.text(`Fecha de vencimiento: ${formatDate(quote.expiryDate)}`, 20, 75)
      doc.text(`Estado: ${getStatusLabel(quote.status)}`, 20, 85)
      
      // Información del cliente
      doc.setFont('helvetica', 'bold')
      doc.text('DATOS DEL CLIENTE:', 20, 105)
      doc.setFont('helvetica', 'normal')
      doc.text(quote.customerName, 20, 115)
      doc.text(quote.customerEmail, 20, 125)
      
      // Tabla de artículos
      let yPosition = 145
      
      // Header de la tabla
      doc.setFillColor(248, 250, 252) // gray-50
      doc.rect(20, yPosition, 170, 10, 'F')
      
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.text('DESCRIPCIÓN', 25, yPosition + 7)
      doc.text('CANT.', 120, yPosition + 7)
      doc.text('PRECIO UNIT.', 140, yPosition + 7)
      doc.text('TOTAL', 170, yPosition + 7)
      
      yPosition += 15
      
      // Artículos
      doc.setFont('helvetica', 'normal')
      quote.items.forEach((item, index) => {
        if (yPosition > 270) { // Nueva página si es necesario
          doc.addPage()
          yPosition = 20
        }
        
        // Alternar color de fondo
        if (index % 2 === 0) {
          doc.setFillColor(249, 250, 251)
          doc.rect(20, yPosition - 5, 170, 10, 'F')
        }
        
        // Texto del artículo
        const description = item.description.length > 40 
          ? item.description.substring(0, 40) + '...' 
          : item.description
        
        doc.text(description, 25, yPosition + 2)
        doc.text(item.quantity.toString(), 125, yPosition + 2)
        doc.text(`€${item.unitPrice.toFixed(2)}`, 145, yPosition + 2)
        doc.text(`€${item.total.toFixed(2)}`, 172, yPosition + 2)
        
        yPosition += 10
      })
      
      // Totales
      yPosition += 10
      doc.setDrawColor(229, 231, 235) // gray-200
      doc.line(20, yPosition, 190, yPosition)
      
      yPosition += 15
      
      doc.setFont('helvetica', 'normal')
      doc.text('Subtotal:', 140, yPosition)
      doc.text(`€${quote.subtotal.toFixed(2)}`, 172, yPosition)
      
      yPosition += 8
      doc.text('IVA (21%):', 140, yPosition)
      doc.text(`€${quote.tax.toFixed(2)}`, 172, yPosition)
      
      yPosition += 10
      doc.setDrawColor(229, 231, 235)
      doc.line(140, yPosition - 2, 190, yPosition - 2)
      
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.text('TOTAL:', 140, yPosition + 5)
      doc.text(`€${quote.total.toFixed(2)}`, 172, yPosition + 5)
      
      // Notas si existen
      if (quote.notes) {
        yPosition += 20
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(12)
        doc.text('NOTAS:', 20, yPosition)
        
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        const notes = quote.notes.length > 80 
          ? quote.notes.substring(0, 80) + '...' 
          : quote.notes
        doc.text(notes, 20, yPosition + 10)
      }
      
      // Footer
      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(107, 114, 128) // gray-500
        doc.text(`Página ${i} de ${pageCount}`, 170, 285)
        doc.text('Generado automáticamente por LOVILIKE', 20, 285)
      }
      
      // Guardar el PDF
      doc.save(`presupuesto-${quote.number}.pdf`)
      toast.success(`PDF del presupuesto ${quote.number} descargado correctamente`)
      
    } catch (error) {
      console.error('Error generando PDF:', error)
      toast.error('Error al generar el PDF del presupuesto')
    }
  }

  const getStatusLabel = (status: string) => {
    const statusLabels = {
      draft: 'Borrador',
      sent: 'Enviado',
      accepted: 'Aceptado',
      rejected: 'Rechazado',
      expired: 'Expirado',
      converted: 'Convertido'
    }
    return statusLabels[status as keyof typeof statusLabels] || status
  }

  const handleCreateNewQuote = () => {
    setShowNewQuoteModal(true)
  }

  const isExpiringSoon = (expiryDate: string) => {
    const today = new Date()
    const expiry = new Date(expiryDate)
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 3 && diffDays > 0
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestión de Presupuestos</h1>
            <p className="text-gray-600">Administra y controla todos los presupuestos</p>
          </div>
          <Button 
            onClick={handleCreateNewQuote}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Presupuesto
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
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
                <p className="text-sm text-gray-600">Enviados</p>
                <p className="text-2xl font-bold text-blue-600">{stats.sent}</p>
              </div>
              <Send className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aceptados</p>
                <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Convertidos</p>
                <p className="text-2xl font-bold text-purple-600">{stats.converted}</p>
              </div>
              <RefreshCw className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Expirados</p>
                <p className="text-2xl font-bold text-orange-600">{stats.expired}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
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
                <p className="text-sm text-gray-600">Valor Total Presupuestado</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Valor Aceptado/Convertido</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.acceptedAmount)}</p>
                <p className="text-sm text-gray-500">
                  Tasa conversión: {stats.total > 0 ? ((stats.accepted + stats.converted) / stats.total * 100).toFixed(1) : 0}%
                </p>
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
                <option value="sent">Enviados</option>
                <option value="accepted">Aceptados</option>
                <option value="rejected">Rechazados</option>
                <option value="expired">Expirados</option>
                <option value="converted">Convertidos</option>
              </select>
              
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de presupuestos */}
      <Card>
        <CardHeader>
          <CardTitle>Presupuestos ({filteredQuotes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando presupuestos...</p>
            </div>
          ) : filteredQuotes.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay presupuestos</h3>
              <p className="text-gray-600">No se encontraron presupuestos que coincidan con los filtros.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Número</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Cliente</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Fecha Emisión</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Vencimiento</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Estado</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Importe</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuotes.map((quote) => (
                    <tr key={quote.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <span className="font-mono text-sm font-medium">{quote.number}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{quote.customerName}</p>
                          <p className="text-sm text-gray-600">{quote.customerEmail}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600">{formatDate(quote.issueDate)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">{formatDate(quote.expiryDate)}</span>
                          {isExpiringSoon(quote.expiryDate) && quote.status === 'sent' && (
                            <AlertTriangle className="w-4 h-4 text-orange-500" title="Expira pronto" />
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(quote.status)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold">{formatCurrency(quote.total)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleViewDetails(quote.id)}
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleEditQuote(quote.id)}
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleDuplicateQuote(quote.id)}
                            title="Duplicar"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleDownloadPDF(quote.id)}
                            title="Descargar PDF"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          {quote.status === 'draft' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleSendQuote(quote.id)}
                              title="Enviar presupuesto"
                            >
                              <Send className="w-4 h-4" />
                            </Button>
                          )}
                          {quote.status === 'sent' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleAcceptQuote(quote.id)}
                              title="Marcar como aceptado"
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                          {quote.status === 'accepted' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleConvertToInvoice(quote.id)}
                              title="Convertir a factura"
                              className="text-purple-600 hover:text-purple-700"
                            >
                              <RefreshCw className="w-4 h-4" />
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

      {/* Modal de detalles */}
      {showDetailsModal && selectedQuoteId && (
        <div className="fixed top-20 left-56 right-0 bottom-0 bg-black/35 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Detalles del Presupuesto</h2>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowDetailsModal(false)}
              >
                ✕
              </Button>
            </div>
            {(() => {
              const quote = quotes.find(q => q.id === selectedQuoteId)
              if (!quote) return null
              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Número de Presupuesto</Label>
                      <p className="font-mono">{quote.number}</p>
                    </div>
                    <div>
                      <Label>Estado</Label>
                      <div className="mt-1">{getStatusBadge(quote.status)}</div>
                    </div>
                    <div>
                      <Label>Cliente</Label>
                      <p>{quote.customerName}</p>
                      <p className="text-sm text-gray-600">{quote.customerEmail}</p>
                    </div>
                    <div>
                      <Label>Fechas</Label>
                      <p>Emisión: {formatDate(quote.issueDate)}</p>
                      <p>Vencimiento: {formatDate(quote.expiryDate)}</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Artículos</Label>
                    <div className="border rounded-lg mt-2">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-gray-50">
                            <th className="text-left p-3">Descripción</th>
                            <th className="text-right p-3">Cant.</th>
                            <th className="text-right p-3">Precio Unit.</th>
                            <th className="text-right p-3">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {quote.items.map((item) => (
                            <tr key={item.id} className="border-b">
                              <td className="p-3">{item.description}</td>
                              <td className="text-right p-3">{item.quantity}</td>
                              <td className="text-right p-3">{formatCurrency(item.unitPrice)}</td>
                              <td className="text-right p-3">{formatCurrency(item.total)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-y-1">
                    <div className="text-right">
                      <p>Subtotal: {formatCurrency(quote.subtotal)}</p>
                      <p>IVA: {formatCurrency(quote.tax)}</p>
                      <p className="font-bold text-lg">Total: {formatCurrency(quote.total)}</p>
                    </div>
                  </div>
                  
                  {quote.notes && (
                    <div>
                      <Label>Notas</Label>
                      <p className="mt-1 p-3 bg-gray-50 rounded">{quote.notes}</p>
                    </div>
                  )}
                </div>
              )
            })()}
          </div>
        </div>
      )}

      {/* Modal de edición */}
      {showEditModal && selectedQuoteId && (
        <div className="fixed top-20 left-56 right-0 bottom-0 bg-black/35 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Editar Presupuesto</h2>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowEditModal(false)}
              >
                ✕
              </Button>
            </div>
            <p className="text-gray-600 text-center py-8">
              Funcionalidad de edición en desarrollo.
              Por favor, contacte al administrador del sistema.
            </p>
            <div className="flex justify-end gap-2 mt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowEditModal(false)}
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de nuevo presupuesto */}
      {showNewQuoteModal && (
        <div className="fixed top-20 left-56 right-0 bottom-0 bg-black/35 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[85vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Nuevo Presupuesto</h2>
                <Button
                  variant="outline"
                  onClick={() => setShowNewQuoteModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

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
                      <Label htmlFor="validityDays">Días de Validez</Label>
                      <Input
                        id="validityDays"
                        type="number"
                        min="1"
                        value={newQuote.validityDays}
                        onChange={(e) => {
                          const days = parseInt(e.target.value) || 15
                          const expiryDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                          setNewQuote({ ...newQuote, validityDays: days, expiryDate })
                        }}
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Vence el: {formatDate(newQuote.expiryDate)}
                      </p>
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

              {/* Líneas de presupuesto */}
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-700">Productos/Servicios</CardTitle>
                    <Button onClick={addQuoteItem} size="sm" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Añadir Línea
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {newQuote.items.map((item, index) => (
                      <div key={item.id} className="grid grid-cols-12 gap-3 items-end">
                        <div className="col-span-5 relative" ref={(el) => { productDropdownRefs.current[index] = el }}>
                          <Label>Descripción</Label>
                          <Input
                            value={item.description}
                            onChange={(e) => handleProductSearchChange(index, e.target.value)}
                            onFocus={() => setShowProductDropdown({ ...showProductDropdown, [index]: item.description.length >= 2 })}
                            placeholder="Descripción del producto/servicio"
                            autoComplete="off"
                          />

                          {/* Dropdown de sugerencias de productos */}
                          {showProductDropdown[index] && item.description.length >= 2 && (
                            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                              {getFilteredProducts(item.description).length > 0 ? (
                                getFilteredProducts(item.description).map((product) => (
                                  <div
                                    key={product.id}
                                    onClick={() => selectProduct(index, product)}
                                    className="px-4 py-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <p className="font-medium text-gray-900">{product.name}</p>
                                        {product.description && (
                                          <p className="text-sm text-gray-600 truncate">{product.description}</p>
                                        )}
                                      </div>
                                      <div className="ml-4 text-right">
                                        <p className="font-semibold text-blue-600">{formatCurrency(product.basePrice || product.price || 0)}</p>
                                      </div>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="px-4 py-3 text-sm text-gray-500">
                                  No se encontraron productos
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="col-span-2">
                          <Label>Cantidad</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateQuoteItem(index, 'quantity', parseInt(e.target.value) || 1)}
                          />
                        </div>
                        <div className="col-span-2">
                          <Label>Precio Unitario</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => updateQuoteItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
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
                          {newQuote.items.length > 1 && (
                            <Button
                              onClick={() => removeQuoteItem(index)}
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
                          <span>{formatCurrency(calculateQuoteTotals().subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>IVA (21%):</span>
                          <span>{formatCurrency(calculateQuoteTotals().tax)}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-lg border-t pt-2">
                          <span>Total:</span>
                          <span>{formatCurrency(calculateQuoteTotals().total)}</span>
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
                    value={newQuote.notes}
                    onChange={(e) => setNewQuote({ ...newQuote, notes: e.target.value })}
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
                  onClick={() => setShowNewQuoteModal(false)}
                  disabled={isCreating}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={createQuote}
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
                      <FileText className="w-4 h-4 mr-2" />
                      Crear Presupuesto
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