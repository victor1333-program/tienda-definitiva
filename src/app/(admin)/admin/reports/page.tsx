"use client"

import { useState } from "react"
import useSWR from "swr"
import { 
  FileText,
  Download,
  Calendar,
  Filter,
  Search,
  Euro,
  TrendingUp,
  Users,
  Package,
  Eye,
  Mail,
  Printer,
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  BarChart3,
  PieChart
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import fetcher from "@/lib/fetcher"
import { formatPrice, formatDate } from "@/lib/utils"
import Link from "next/link"

interface Invoice {
  id: string
  number: string
  orderId: string
  orderNumber: string
  customerId: string
  customerName: string
  customerEmail: string
  issuedDate: string
  dueDate: string
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  subtotal: number
  tax: number
  total: number
  items: Array<{
    description: string
    quantity: number
    unitPrice: number
    total: number
  }>
  notes?: string
  paymentMethod?: string
  paidAt?: string
}

interface Report {
  id: string
  name: string
  type: 'sales' | 'inventory' | 'customers' | 'taxes' | 'custom'
  period: string
  createdAt: string
  status: 'generating' | 'ready' | 'failed'
  fileUrl?: string
  fileSize?: number
}

interface ReportTemplate {
  id: string
  name: string
  description: string
  type: 'sales' | 'inventory' | 'customers' | 'taxes' | 'custom'
  icon: React.ReactNode
  fields: string[]
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'invoices' | 'reports'>('invoices')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState<{startDate?: string, endDate?: string}>({})
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([])

  // Fetch invoices
  const invoiceParams = new URLSearchParams({
    ...(searchTerm && { search: searchTerm }),
    ...(statusFilter !== 'all' && { status: statusFilter }),
    ...(dateRange.startDate && { startDate: dateRange.startDate }),
    ...(dateRange.endDate && { endDate: dateRange.endDate }),
  })

  const { data: invoices, error: invoicesError, mutate: mutateInvoices } = useSWR<Invoice[]>(
    `/api/invoices?${invoiceParams}`,
    fetcher
  )

  // Fetch reports
  const { data: reports, error: reportsError, mutate: mutateReports } = useSWR<Report[]>(
    '/api/reports',
    fetcher
  )

  const reportTemplates: ReportTemplate[] = [
    {
      id: 'sales-summary',
      name: 'Resumen de Ventas',
      description: 'Informe completo de ventas por período',
      type: 'sales',
      icon: <Euro className="w-5 h-5" />,
      fields: ['ingresos', 'pedidos', 'productos', 'clientes']
    },
    {
      id: 'sales-detailed',
      name: 'Ventas Detalladas',
      description: 'Listado detallado de todas las ventas',
      type: 'sales',
      icon: <BarChart3 className="w-5 h-5" />,
      fields: ['fecha', 'cliente', 'productos', 'total', 'estado']
    },
    {
      id: 'inventory-stock',
      name: 'Estado de Inventario',
      description: 'Stock actual y movimientos de productos',
      type: 'inventory',
      icon: <Package className="w-5 h-5" />,
      fields: ['producto', 'stock', 'valoración', 'movimientos']
    },
    {
      id: 'customers-analysis',
      name: 'Análisis de Clientes',
      description: 'Comportamiento y segmentación de clientes',
      type: 'customers',
      icon: <Users className="w-5 h-5" />,
      fields: ['cliente', 'pedidos', 'total_gastado', 'ultima_compra']
    },
    {
      id: 'tax-report',
      name: 'Informe Fiscal',
      description: 'Datos para declaraciones fiscales',
      type: 'taxes',
      icon: <FileText className="w-5 h-5" />,
      fields: ['base_imponible', 'iva', 'retenciones', 'total']
    },
    {
      id: 'production-report',
      name: 'Informe de Producción',
      description: 'Estado y tiempos de producción',
      type: 'custom',
      icon: <TrendingUp className="w-5 h-5" />,
      fields: ['producto', 'tiempo_produccion', 'estado', 'recursos']
    }
  ]

  const invoiceStatuses = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'draft', label: 'Borrador' },
    { value: 'sent', label: 'Enviada' },
    { value: 'paid', label: 'Pagada' },
    { value: 'overdue', label: 'Vencida' },
    { value: 'cancelled', label: 'Cancelada' }
  ]

  const getInvoiceStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Borrador', variant: 'secondary' as const },
      sent: { label: 'Enviada', variant: 'default' as const },
      paid: { label: 'Pagada', variant: 'default' as const },
      overdue: { label: 'Vencida', variant: 'destructive' as const },
      cancelled: { label: 'Cancelada', variant: 'secondary' as const }
    }
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'secondary' as const }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getReportStatusBadge = (status: string) => {
    const statusConfig = {
      generating: { label: 'Generando', variant: 'secondary' as const, icon: <Clock className="w-3 h-3" /> },
      ready: { label: 'Listo', variant: 'default' as const, icon: <CheckCircle className="w-3 h-3" /> },
      failed: { label: 'Error', variant: 'destructive' as const, icon: <AlertCircle className="w-3 h-3" /> }
    }
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'secondary' as const, icon: null }
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {config.label}
      </Badge>
    )
  }

  const handleGenerateInvoice = async (orderId: string) => {
    try {
      const response = await fetch('/api/invoices/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      })
      
      if (!response.ok) throw new Error('Error al generar factura')
      
      mutateInvoices()
    } catch (error) {
      console.error('Error generating invoice:', error)
    }
  }

  const handleSendInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/send`, {
        method: 'POST'
      })
      
      if (!response.ok) throw new Error('Error al enviar factura')
      
      mutateInvoices()
    } catch (error) {
      console.error('Error sending invoice:', error)
    }
  }

  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/download`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `factura-${invoiceId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading invoice:', error)
    }
  }

  const handleGenerateReport = async (templateId: string, period: string) => {
    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          templateId, 
          period,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        })
      })
      
      if (!response.ok) throw new Error('Error al generar reporte')
      
      mutateReports()
    } catch (error) {
      console.error('Error generating report:', error)
    }
  }

  const handleBulkAction = async (action: string) => {
    if (selectedInvoices.length === 0) return

    try {
      const response = await fetch('/api/invoices/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action,
          invoiceIds: selectedInvoices
        })
      })
      
      if (!response.ok) throw new Error('Error en acción masiva')
      
      setSelectedInvoices([])
      mutateInvoices()
    } catch (error) {
      console.error('Error in bulk action:', error)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📄 Reportes y Facturas</h1>
          <p className="text-gray-600 mt-1">
            Gestiona facturas y genera reportes financieros
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => mutateInvoices()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Link href="/admin/reports/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Reporte
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('invoices')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'invoices'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText className="w-4 h-4 inline-block mr-2" />
            Facturas ({invoices?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'reports'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <BarChart3 className="w-4 h-4 inline-block mr-2" />
            Reportes ({reports?.length || 0})
          </button>
        </nav>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder={activeTab === 'invoices' ? "Buscar facturas..." : "Buscar reportes..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {activeTab === 'invoices' && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2"
              >
                {invoiceStatuses.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            )}

            <input
              type="date"
              value={dateRange.startDate || ""}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Fecha inicio"
            />
            
            <input
              type="date"
              value={dateRange.endDate || ""}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Fecha fin"
            />
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {activeTab === 'invoices' && (
        <div className="space-y-6">
          {/* Bulk Actions */}
          {selectedInvoices.length > 0 && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <span className="text-blue-900">
                    {selectedInvoices.length} factura{selectedInvoices.length !== 1 ? 's' : ''} seleccionada{selectedInvoices.length !== 1 ? 's' : ''}
                  </span>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleBulkAction('send')}>
                      <Mail className="w-4 h-4 mr-1" />
                      Enviar Seleccionadas
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleBulkAction('download')}>
                      <Download className="w-4 h-4 mr-1" />
                      Descargar Seleccionadas
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setSelectedInvoices([])}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Invoices Table */}
          <Card>
            <CardHeader>
              <CardTitle>Facturas</CardTitle>
            </CardHeader>
            <CardContent>
              {invoices && invoices.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2">
                          <input
                            type="checkbox"
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedInvoices(invoices.map(i => i.id))
                              } else {
                                setSelectedInvoices([])
                              }
                            }}
                          />
                        </th>
                        <th className="text-left py-3 px-2">Número</th>
                        <th className="text-left py-3 px-2">Cliente</th>
                        <th className="text-left py-3 px-2">Fecha</th>
                        <th className="text-left py-3 px-2">Estado</th>
                        <th className="text-left py-3 px-2">Total</th>
                        <th className="text-left py-3 px-2">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((invoice) => (
                        <tr key={invoice.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-2">
                            <input
                              type="checkbox"
                              checked={selectedInvoices.includes(invoice.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedInvoices([...selectedInvoices, invoice.id])
                                } else {
                                  setSelectedInvoices(selectedInvoices.filter(id => id !== invoice.id))
                                }
                              }}
                            />
                          </td>
                          <td className="py-3 px-2">
                            <div>
                              <p className="font-medium">{invoice.number}</p>
                              <p className="text-sm text-gray-500">Pedido: {invoice.orderNumber}</p>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <div>
                              <p className="font-medium">{invoice.customerName}</p>
                              <p className="text-sm text-gray-500">{invoice.customerEmail}</p>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <div>
                              <p className="text-sm">{formatDate(new Date(invoice.issuedDate))}</p>
                              <p className="text-xs text-gray-500">
                                Vence: {formatDate(new Date(invoice.dueDate))}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            {getInvoiceStatusBadge(invoice.status)}
                          </td>
                          <td className="py-3 px-2">
                            <p className="font-medium">{formatPrice(invoice.total)}</p>
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline" onClick={() => handleDownloadInvoice(invoice.id)}>
                                <Download className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleSendInvoice(invoice.id)}>
                                <Mail className="w-3 h-3" />
                              </Button>
                              <Link href={`/admin/invoices/${invoice.id}`}>
                                <Button size="sm" variant="outline">
                                  <Eye className="w-3 h-3" />
                                </Button>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay facturas</h3>
                  <p className="text-gray-500">Las facturas aparecerán aquí cuando tengas pedidos</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* Report Templates */}
          <Card>
            <CardHeader>
              <CardTitle>Generar Nuevo Reporte</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reportTemplates.map((template) => (
                  <Card key={template.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary-50 rounded-lg">
                          {template.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-1">{template.name}</h3>
                          <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                          <div className="flex flex-wrap gap-1 mb-3">
                            {template.fields.slice(0, 3).map((field, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {field}
                              </Badge>
                            ))}
                            {template.fields.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{template.fields.length - 3} más
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => handleGenerateReport(template.id, '30')}
                              className="flex-1"
                            >
                              Generar
                            </Button>
                            <Link href={`/admin/reports/templates/${template.id}`}>
                              <Button size="sm" variant="outline">
                                <Eye className="w-3 h-3" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Generated Reports */}
          <Card>
            <CardHeader>
              <CardTitle>Reportes Generados</CardTitle>
            </CardHeader>
            <CardContent>
              {reports && reports.length > 0 ? (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <FileText className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{report.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm text-gray-600">
                              {formatDate(new Date(report.createdAt))}
                            </p>
                            <span className="text-gray-300">•</span>
                            <p className="text-sm text-gray-600">{report.period}</p>
                            {report.fileSize && (
                              <>
                                <span className="text-gray-300">•</span>
                                <p className="text-sm text-gray-600">
                                  {(report.fileSize / 1024 / 1024).toFixed(1)} MB
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getReportStatusBadge(report.status)}
                        {report.status === 'ready' && (
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline">
                              <Download className="w-3 h-3 mr-1" />
                              Descargar
                            </Button>
                            <Button size="sm" variant="outline">
                              <Eye className="w-3 h-3 mr-1" />
                              Ver
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay reportes generados</h3>
                  <p className="text-gray-500">Genera tu primer reporte usando las plantillas de arriba</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}