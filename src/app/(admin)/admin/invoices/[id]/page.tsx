"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import useSWR from "swr"
import { 
  ArrowLeft,
  Download,
  Mail,
  Printer,
  Edit3,
  Trash2,
  CheckCircle,
  AlertCircle,
  Calendar,
  User,
  Package,
  Euro,
  FileText,
  Copy,
  Send
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import fetcher from "@/lib/fetcher"
import { formatPrice, formatDate, COMPANY_INFO } from "@/lib/utils"
import { toast } from "react-hot-toast"

interface InvoiceDetail {
  id: string
  number: string
  orderId: string
  orderNumber: string
  customerId: string
  customer: {
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
    taxId?: string
    isCompany: boolean
    companyName?: string
  }
  issuedDate: string
  dueDate: string
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  subtotal: number
  tax: number
  taxRate: number
  total: number
  items: Array<{
    id: string
    description: string
    quantity: number
    unitPrice: number
    total: number
    taxRate: number
  }>
  notes?: string
  paymentMethod?: string
  paidAt?: string
  sentAt?: string
  createdAt: string
  updatedAt: string
}

export default function InvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const invoiceId = params.id as string
  
  const [isEditing, setIsEditing] = useState(false)
  const [notes, setNotes] = useState('')

  const { data: invoice, error, mutate } = useSWR<InvoiceDetail>(
    `/api/invoices/${invoiceId}`,
    fetcher
  )

  useState(() => {
    if (invoice?.notes) {
      setNotes(invoice.notes)
    }
  }, [invoice?.notes])

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Borrador', variant: 'secondary' as const, icon: <Edit3 className="w-3 h-3" /> },
      sent: { label: 'Enviada', variant: 'default' as const, icon: <Send className="w-3 h-3" /> },
      paid: { label: 'Pagada', variant: 'default' as const, icon: <CheckCircle className="w-3 h-3" /> },
      overdue: { label: 'Vencida', variant: 'destructive' as const, icon: <AlertCircle className="w-3 h-3" /> },
      cancelled: { label: 'Cancelada', variant: 'secondary' as const, icon: <Trash2 className="w-3 h-3" /> }
    }
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'secondary' as const, icon: null }
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {config.label}
      </Badge>
    )
  }

  const handleSendInvoice = async () => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/send`, {
        method: 'POST'
      })
      
      if (!response.ok) throw new Error('Error al enviar factura')
      
      mutate()
      toast.success('Factura enviada correctamente')
    } catch (error) {
      toast.error('Error al enviar la factura')
    }
  }

  const handleMarkAsPaid = async () => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/mark-paid`, {
        method: 'POST'
      })
      
      if (!response.ok) throw new Error('Error al marcar como pagada')
      
      mutate()
      toast.success('Factura marcada como pagada')
    } catch (error) {
      toast.error('Error al marcar como pagada')
    }
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/download`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `factura-${invoice?.number}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      toast.error('Error al descargar la factura')
    }
  }

  const handleUpdateNotes = async () => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      })
      
      if (!response.ok) throw new Error('Error al actualizar notas')
      
      mutate()
      setIsEditing(false)
      toast.success('Notas actualizadas')
    } catch (error) {
      toast.error('Error al actualizar las notas')
    }
  }

  const handleCopyLink = () => {
    const publicUrl = `${window.location.origin}/invoices/public/${invoiceId}`
    navigator.clipboard.writeText(publicUrl)
    toast.success('Enlace copiado al portapapeles')
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar la factura</h2>
          <p className="text-gray-600 mb-4">No se pudo encontrar la factura solicitada</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando factura...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Factura {invoice.number}</h1>
            <p className="text-gray-600">Pedido: {invoice.orderNumber}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(invoice.status)}
        </div>
      </div>

      {/* Actions */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Descargar PDF
            </Button>
            <Button variant="outline" onClick={handleSendInvoice} disabled={invoice.status === 'cancelled'}>
              <Mail className="w-4 h-4 mr-2" />
              Enviar por Email
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="w-4 h-4 mr-2" />
              Imprimir
            </Button>
            <Button variant="outline" onClick={handleCopyLink}>
              <Copy className="w-4 h-4 mr-2" />
              Copiar Enlace
            </Button>
            {invoice.status === 'sent' && (
              <Button variant="outline" onClick={handleMarkAsPaid}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Marcar como Pagada
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Invoice Content */}
      <Card className="print:shadow-none">
        <CardContent className="p-8">
          {/* Header with company info */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-2xl font-bold text-primary-600 mb-2">
                {COMPANY_INFO.name}
              </h2>
              <div className="text-gray-600 space-y-1">
                <p>{COMPANY_INFO.address}</p>
                <p>{COMPANY_INFO.postalCode} {COMPANY_INFO.city}, {COMPANY_INFO.province}</p>
                <p>CIF: {COMPANY_INFO.cif}</p>
                <p>Tel: {COMPANY_INFO.phone}</p>
                <p>Email: {COMPANY_INFO.email}</p>
              </div>
            </div>
            <div className="text-right">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">FACTURA</h3>
              <div className="text-gray-600 space-y-1">
                <p><strong>Número:</strong> {invoice.number}</p>
                <p><strong>Fecha:</strong> {formatDate(new Date(invoice.issuedDate))}</p>
                <p><strong>Vencimiento:</strong> {formatDate(new Date(invoice.dueDate))}</p>
                {invoice.paidAt && (
                  <p><strong>Pagada:</strong> {formatDate(new Date(invoice.paidAt))}</p>
                )}
              </div>
            </div>
          </div>

          {/* Customer info */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Facturar a:</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              {invoice.customer.isCompany && invoice.customer.companyName ? (
                <p className="font-semibold">{invoice.customer.companyName}</p>
              ) : null}
              <p className="font-medium">{invoice.customer.name}</p>
              <p>{invoice.customer.email}</p>
              {invoice.customer.phone && <p>{invoice.customer.phone}</p>}
              {invoice.customer.address && (
                <div className="mt-2">
                  <p>{invoice.customer.address.address}</p>
                  <p>
                    {invoice.customer.address.postalCode} {invoice.customer.address.city}, {invoice.customer.address.province}
                  </p>
                  <p>{invoice.customer.address.country}</p>
                </div>
              )}
              {invoice.customer.taxId && (
                <p className="mt-2"><strong>NIF/CIF:</strong> {invoice.customer.taxId}</p>
              )}
            </div>
          </div>

          {/* Items table */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Detalles:</h4>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left">Descripción</th>
                    <th className="border border-gray-300 px-4 py-2 text-center">Cantidad</th>
                    <th className="border border-gray-300 px-4 py-2 text-right">Precio Unit.</th>
                    <th className="border border-gray-300 px-4 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item) => (
                    <tr key={item.id}>
                      <td className="border border-gray-300 px-4 py-2">{item.description}</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">{item.quantity}</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">{formatPrice(item.unitPrice)}</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">{formatPrice(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-64">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatPrice(invoice.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>IVA ({invoice.taxRate}%):</span>
                  <span>{formatPrice(invoice.tax)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>{formatPrice(invoice.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Observaciones:</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              {isEditing ? (
                <div className="space-y-3">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Añadir observaciones..."
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleUpdateNotes}>
                      Guardar
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  {invoice.notes ? (
                    <p className="whitespace-pre-wrap">{invoice.notes}</p>
                  ) : (
                    <p className="text-gray-500 italic">Sin observaciones</p>
                  )}
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="mt-2" 
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit3 className="w-3 h-3 mr-1" />
                    Editar
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Payment info */}
          {invoice.paymentMethod && (
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Información de Pago:</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><strong>Método de pago:</strong> {invoice.paymentMethod}</p>
                {invoice.status === 'paid' && invoice.paidAt && (
                  <p><strong>Fecha de pago:</strong> {formatDate(new Date(invoice.paidAt))}</p>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-gray-500 text-sm border-t pt-4">
            <p>Gracias por confiar en {COMPANY_INFO.name}</p>
            <p>Esta factura ha sido generada electrónicamente y es válida sin firma</p>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Historial de la Factura
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Factura creada</p>
                <p className="text-sm text-gray-500">{formatDate(new Date(invoice.createdAt))}</p>
              </div>
            </div>
            
            {invoice.sentAt && (
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Send className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Factura enviada</p>
                  <p className="text-sm text-gray-500">{formatDate(new Date(invoice.sentAt))}</p>
                </div>
              </div>
            )}
            
            {invoice.paidAt && (
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium">Factura pagada</p>
                  <p className="text-sm text-gray-500">{formatDate(new Date(invoice.paidAt))}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}