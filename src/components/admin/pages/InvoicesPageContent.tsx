"use client"

import { useState, useEffect, useRef } from "react"
import { Eye, Download, Mail, Plus, Search, FileText, X, Trash2, Calendar, User, Building, CheckCircle } from "lucide-react"

interface Invoice {
  id: string
  invoiceNumber: string
  status: string
  totalAmount: number
  issueDate: string
  dueDate: string
  paidDate?: string
  customerName: string
  customerEmail: string
  order: {
    orderNumber: string
    id: string
  }
  type: 'invoice' | 'note'
}

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800",
  SENT: "bg-blue-100 text-blue-800", 
  PAID: "bg-green-100 text-green-800",
  OVERDUE: "bg-red-100 text-red-800",
  CANCELLED: "bg-gray-100 text-gray-800",
  DRAFT: "bg-gray-100 text-gray-600"
}

const statusLabels = {
  PENDING: "Pendiente",
  SENT: "Enviada", 
  PAID: "Pagada",
  OVERDUE: "Vencida",
  CANCELLED: "Cancelada",
  DRAFT: "Borrador"
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

export default function InvoicesPageContent() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [newInvoice, setNewInvoice] = useState({
    customerId: '',
    items: [{ id: '1', description: '', quantity: 1, unitPrice: 0, total: 0 }] as InvoiceItem[],
    notes: '',
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    type: 'invoice' as 'invoice' | 'note'
  })
  const [customerSearchTerm, setCustomerSearchTerm] = useState('')
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const customerDropdownRef = useRef<HTMLDivElement>(null)
  const [showInvoiceDetailsModal, setShowInvoiceDetailsModal] = useState(false)
  const [selectedInvoiceForDetails, setSelectedInvoiceForDetails] = useState<Invoice | null>(null)
  const [exampleInvoicesState, setExampleInvoicesState] = useState([
    {
      id: "example-1",
      invoiceNumber: "FAC-2025-001",
      status: "PAID",
      totalAmount: 125.50,
      issueDate: "2025-06-15",
      dueDate: "2025-06-30",
      customerName: "María García",
      customerEmail: "maria@ejemplo.com",
      order: { orderNumber: "PED-001", id: "order-1" },
      type: "invoice" as const
    },
    {
      id: "example-2", 
      invoiceNumber: "NOT-2025-001",
      status: "PENDING",
      totalAmount: 75.00,
      issueDate: "2025-06-20",
      dueDate: "2025-07-05",
      customerName: "Carlos López",
      customerEmail: "carlos@ejemplo.com",
      order: { orderNumber: "N/A", id: "none" },
      type: "note" as const
    }
  ])

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20"
      })
      
      if (statusFilter) params.append("status", statusFilter)
      
      const response = await fetch(`/api/invoices?${params}`)
      const data = await response.json()
      
      if (response.ok) {
        setInvoices(data.invoices)
        setTotalPages(data.pagination.pages)
      } else {
        console.error("Error fetching invoices:", data.error)
      }
    } catch (error) {
      console.error("Error fetching invoices:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvoices()
    loadInitialData()
  }, [page, statusFilter])
  
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

  const loadInitialData = async () => {
    // Cargar clientes
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

  // Combinar facturas reales con ejemplos
  const exampleInvoices = invoices.length === 0 ? exampleInvoicesState : [...invoices, ...exampleInvoicesState]

  const filteredInvoices = exampleInvoices.filter(invoice =>
    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (invoice.order?.orderNumber && invoice.order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const formatDate = (date: string | Date) => {
    try {
      return new Date(date).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    } catch (error) {
      console.error('Error formatting date:', error)
      return 'Fecha inválida'
    }
  }

  const handleUpdateStatus = async (invoiceId: string, newStatus: string) => {
    try {
      if (invoiceId.startsWith('example-')) {
        setExampleInvoicesState(prev => 
          prev.map(inv => 
            inv.id === invoiceId 
              ? { ...inv, status: newStatus } 
              : inv
          )
        )
        console.log(`Estado de factura de ejemplo ${invoiceId} actualizado a ${newStatus}`)
        return
      }

      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (response.ok) {
        fetchInvoices()
      } else {
        console.error('Error en la respuesta del servidor:', response.status)
      }
    } catch (error) {
      console.error("Error updating invoice status:", error)
    }
  }

  const calculateItemTotal = (quantity: number, unitPrice: number) => {
    return quantity * unitPrice
  }

  const handleViewDetails = (invoice: Invoice) => {
    setSelectedInvoiceForDetails(invoice)
    setShowInvoiceDetailsModal(true)
  }

  const handleDownloadPDF = async (invoice: Invoice) => {
    try {
      const mockCustomer = {
        name: invoice.customerName,
        email: invoice.customerEmail,
        phone: '+34 600 000 000',
        address: 'Dirección del cliente',
        taxId: '12345678Z'
      }

      const mockCompany = {
        businessName: 'Lovilike',
        legalName: 'Lovilike S.L.',
        address: 'Calle Principal 123',
        postalCode: '28001',
        city: 'Madrid',
        province: 'Madrid',
        country: 'España',
        taxId: 'B12345678',
        vatNumber: 'ES12345678',
        businessPhone: '+34 900 123 456',
        businessEmail: 'admin@lovilike.es',
        businessWebsite: 'https://lovilike.es'
      }

      await generateInvoicePDF(invoice, mockCustomer, mockCompany)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error al generar el PDF')
    }
  }

  const handleSendEmail = (invoice: Invoice) => {
    const subject = `Factura ${invoice.invoiceNumber} - Lovilike`
    const body = `Estimado/a cliente,

Adjunto encontrará la factura ${invoice.invoiceNumber} por un importe de ${formatCurrency(invoice.totalAmount)}.

Fecha de emisión: ${formatDate(invoice.issueDate)}
Fecha de vencimiento: ${formatDate(invoice.dueDate)}

Gracias por confiar en Lovilike.

Saludos cordiales,
El equipo de Lovilike`

    window.location.href = `mailto:${invoice.customerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    
    console.log(`Email preparado para ${invoice.customerEmail}`)
  }

  const loadCompanyLogo = (): Promise<{dataUrl: string, width: number, height: number}> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')!
        
        const targetWidthMM = 40
        const targetHeightMM = 20
        
        const originalWidth = img.width
        const originalHeight = img.height
        const aspectRatio = originalWidth / originalHeight
        
        let finalWidth, finalHeight
        if (aspectRatio > targetWidthMM / targetHeightMM) {
          finalWidth = targetWidthMM
          finalHeight = targetWidthMM / aspectRatio
        } else {
          finalHeight = targetHeightMM
          finalWidth = targetHeightMM * aspectRatio
        }
        
        const scaleFactor = 4
        const canvasWidth = Math.round(finalWidth * scaleFactor * 3.779)
        const canvasHeight = Math.round(finalHeight * scaleFactor * 3.779)
        
        canvas.width = canvasWidth
        canvas.height = canvasHeight
        
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        
        ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight)
        
        resolve({
          dataUrl: canvas.toDataURL('image/png', 1.0),
          width: finalWidth,
          height: finalHeight
        })
      }
      
      img.onerror = () => {
        console.warn('No se pudo cargar el logo, usando logo por defecto')
        const canvas = document.createElement('canvas')
        const width = 40
        const height = 20
        const scaleFactor = 4
        
        canvas.width = width * scaleFactor * 3.779
        canvas.height = height * scaleFactor * 3.779
        const ctx = canvas.getContext('2d')!
        
        ctx.scale(scaleFactor * 3.779, scaleFactor * 3.779)
        
        const gradient = ctx.createLinearGradient(0, 0, width, 0)
        gradient.addColorStop(0, '#f97316')
        gradient.addColorStop(1, '#ea580c')
        
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, width, height)
        
        ctx.fillStyle = 'white'
        ctx.font = 'bold 12px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('Lovilike', width/2, height/2 + 3)
        
        resolve({
          dataUrl: canvas.toDataURL('image/png', 1.0),
          width: width,
          height: height
        })
      }
      
      img.src = '/img/Social_Logo.png'
    })
  }

  const generateInvoicePDF = async (invoice: any, customer: any, company: any) => {
    try {
      const { jsPDF } = await import('jspdf')
      
      const doc = new jsPDF()
      
      const mockItems = invoice.id?.startsWith('example-') ? [
        {
          description: invoice.type === 'invoice' ? 'Producto personalizado' : 'Trabajo de diseño',
          quantity: 1,
          unitPrice: invoice.type === 'invoice' ? invoice.totalAmount / 1.21 : invoice.totalAmount,
          total: invoice.type === 'invoice' ? invoice.totalAmount / 1.21 : invoice.totalAmount
        }
      ] : (invoice.items || [])

      const subtotal = mockItems.reduce((sum: number, item: any) => sum + item.total, 0)
      const tax = invoice.type === 'invoice' ? subtotal * 0.21 : 0
      const total = subtotal + tax

      doc.setFont('helvetica')
      
      const logoData = await loadCompanyLogo()
      doc.addImage(logoData.dataUrl, 'PNG', 15, 15, logoData.width, logoData.height)
      
      doc.setFontSize(10)
      doc.setTextColor(100)
      doc.text(company.businessName, 120, 22)
      doc.text(company.legalName, 120, 27)
      doc.text(company.address, 120, 32)
      doc.text(`${company.postalCode} ${company.city}, ${company.province}`, 120, 37)
      doc.text(`CIF: ${company.taxId} | IVA: ${company.vatNumber}`, 120, 42)
      doc.text(`Tel: ${company.businessPhone}`, 120, 47)
      doc.text(`Email: ${company.businessEmail}`, 120, 52)
      
      doc.setFontSize(24)
      doc.setTextColor(0)
      doc.setFont('helvetica', 'bold')
      const docTitle = invoice.type === 'invoice' ? 'FACTURA' : 'NOTA DE CONTROL'
      doc.text(docTitle, 15, 70)
      
      doc.setDrawColor(240, 240, 240)
      doc.line(15, 75, 195, 75)
      
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(0)
      
      doc.text(`Número: ${invoice.invoiceNumber}`, 15, 90)
      doc.text(`Fecha de Emisión: ${formatDate(invoice.issueDate)}`, 15, 96)
      doc.text(`Fecha de Vencimiento: ${formatDate(invoice.dueDate)}`, 15, 102)
      
      doc.setFont('helvetica', 'bold')
      doc.text('CLIENTE:', 15, 115)
      doc.setFont('helvetica', 'normal')
      doc.text(customer.name, 15, 122)
      doc.text(customer.email, 15, 128)
      if (customer.phone) doc.text(customer.phone, 15, 134)
      if (customer.address) doc.text(customer.address, 15, 140)
      if (customer.taxId) doc.text(`NIF/CIF: ${customer.taxId}`, 15, 146)
      
      const startY = 160
      
      doc.setFillColor(248, 250, 252)
      doc.rect(15, startY, 180, 8, 'F')
      
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.text('Descripción', 20, startY + 5)
      doc.text('Cant.', 130, startY + 5)
      doc.text('Precio', 150, startY + 5)
      doc.text('Total', 175, startY + 5)
      
      doc.setFont('helvetica', 'normal')
      let currentY = startY + 12
      
      mockItems.forEach((item: any) => {
        doc.text(item.description.substring(0, 45), 20, currentY)
        doc.text(item.quantity.toString(), 130, currentY)
        doc.text(formatCurrency(item.unitPrice), 150, currentY)
        doc.text(formatCurrency(item.total), 175, currentY)
        currentY += 8
      })
      
      doc.line(15, currentY + 5, 195, currentY + 5)
      
      const totalsY = currentY + 15
      doc.setFont('helvetica', 'normal')
      
      doc.text('Subtotal:', 140, totalsY)
      doc.text(formatCurrency(subtotal), 175, totalsY)
      
      if (invoice.type === 'invoice') {
        doc.text('IVA (21%):', 140, totalsY + 8)
        doc.text(formatCurrency(tax), 175, totalsY + 8)
      } else {
        doc.setTextColor(100)
        doc.text('IVA: No aplicable', 140, totalsY + 8)
        doc.setTextColor(0)
      }
      
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
      doc.text('TOTAL:', 140, totalsY + 18)
      doc.text(formatCurrency(total), 175, totalsY + 18)
      
      if (invoice.notes) {
        const notesY = totalsY + 35
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(10)
        doc.text('Notas:', 15, notesY)
        doc.setFont('helvetica', 'normal')
        doc.text(invoice.notes, 15, notesY + 6)
      }
      
      const footerY = 280
      doc.setTextColor(100)
      doc.setFontSize(9)
      doc.text(
        invoice.type === 'invoice' ? 'Gracias por confiar en Lovilike' : 'Documento interno de control',
        105, footerY, { align: 'center' }
      )
      doc.text(
        `Generado el ${formatDate(new Date())} a las ${new Date().toLocaleTimeString('es-ES')}`,
        105, footerY + 5, { align: 'center' }
      )
      
      doc.save(`${invoice.invoiceNumber}.pdf`)
      
      console.log('PDF generado correctamente')
      
    } catch (error) {
      console.error('Error generating invoice PDF:', error)
      throw new Error(`Error al generar el PDF: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  // ... (resto de las funciones de la página original)

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Facturas</h1>
          <p className="text-gray-600 mt-1">Gestión de facturas automáticas del sistema</p>
        </div>
        <a
          href="/admin/finances/invoices"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Nueva Factura Manual
        </a>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-sm font-medium text-gray-600 mb-2">Total Facturas</div>
          <div className="text-2xl font-bold">{exampleInvoices.length}</div>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-sm font-medium text-gray-600 mb-2">Pendientes</div>
          <div className="text-2xl font-bold text-yellow-600">
            {exampleInvoices.filter(i => i.status === 'PENDING').length}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-sm font-medium text-gray-600 mb-2">Pagadas</div>
          <div className="text-2xl font-bold text-green-600">
            {exampleInvoices.filter(i => i.status === 'PAID').length}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-sm font-medium text-gray-600 mb-2">Importe Total</div>
          <div className="text-2xl font-bold">
            {formatCurrency(exampleInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Filtros</h3>
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar por número, cliente, email o pedido..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los estados</option>
            <option value="PENDING">Pendiente</option>
            <option value="SENT">Enviada</option>
            <option value="PAID">Pagada</option>
            <option value="OVERDUE">Vencida</option>
            <option value="CANCELLED">Cancelada</option>
            <option value="DRAFT">Borrador</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Lista de Facturas</h3>
          </div>
          <p className="text-gray-600">
            {filteredInvoices.length} factura{filteredInvoices.length !== 1 ? 's' : ''} encontrada{filteredInvoices.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Número</th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Tipo</th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Pedido</th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Cliente</th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Fecha Emisión</th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Vencimiento</th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Importe</th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Estado</th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6 font-medium">
                    {invoice.invoiceNumber}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      invoice.type === 'invoice' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {invoice.type === 'invoice' ? 'Factura' : 'Nota'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <button className="text-blue-600 hover:text-blue-800 font-medium">
                      {invoice.order?.orderNumber || 'N/A'}
                    </button>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <div className="font-medium">{invoice.customerName}</div>
                      <div className="text-sm text-gray-500">{invoice.customerEmail}</div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    {formatDate(invoice.issueDate)}
                  </td>
                  <td className="py-4 px-6">
                    {formatDate(invoice.dueDate)}
                  </td>
                  <td className="py-4 px-6 font-medium">
                    {formatCurrency(invoice.totalAmount)}
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[invoice.status as keyof typeof statusColors]}`}>
                        {statusLabels[invoice.status as keyof typeof statusLabels]}
                      </span>
                      <select
                        value={invoice.status}
                        onChange={(e) => handleUpdateStatus(invoice.id, e.target.value)}
                        className="block w-full text-xs border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="PENDING">Pendiente</option>
                        <option value="SENT">Enviada</option>
                        <option value="PAID">Pagada</option>
                        <option value="OVERDUE">Vencida</option>
                        <option value="CANCELLED">Cancelada</option>
                      </select>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleViewDetails(invoice)}
                        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDownloadPDF(invoice)}
                        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                        title="Descargar PDF"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleSendEmail(invoice)}
                        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                        title="Enviar por email"
                      >
                        <Mail className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-6 border-t bg-gray-50">
            <div className="flex justify-center gap-2">
              <button 
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Anterior
              </button>
              <span className="flex items-center px-4 text-sm text-gray-600">
                Página {page} de {totalPages}
              </span>
              <button 
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}