"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
  ArrowLeft,
  Calendar,
  Filter,
  Save,
  Eye,
  Settings,
  BarChart3,
  PieChart,
  Users,
  Package,
  Euro,
  TrendingUp,
  FileText,
  Target,
  Activity
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-hot-toast"

interface ReportField {
  id: string
  name: string
  label: string
  type: 'text' | 'number' | 'currency' | 'date' | 'percentage'
  required: boolean
  category: string
}

interface ReportTemplate {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  category: string
  fields: ReportField[]
}

export default function NewReportPage() {
  const router = useRouter()
  
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [reportName, setReportName] = useState('')
  const [reportDescription, setReportDescription] = useState('')
  const [selectedFields, setSelectedFields] = useState<string[]>([])
  const [dateRange, setDateRange] = useState<{startDate?: string, endDate?: string}>({})
  const [filters, setFilters] = useState<{[key: string]: string}>({})
  const [groupBy, setGroupBy] = useState<string>('')
  const [sortBy, setSortBy] = useState<string>('')
  const [format, setFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf')

  const reportTemplates: ReportTemplate[] = [
    {
      id: 'sales-summary',
      name: 'Resumen de Ventas',
      description: 'Informe general de ventas y ingresos',
      icon: <Euro className="w-6 h-6" />,
      category: 'Ventas',
      fields: [
        { id: 'total_revenue', name: 'total_revenue', label: 'Ingresos Totales', type: 'currency', required: true, category: 'Financiero' },
        { id: 'total_orders', name: 'total_orders', label: 'Número de Pedidos', type: 'number', required: true, category: 'Ventas' },
        { id: 'avg_order_value', name: 'avg_order_value', label: 'Valor Promedio Pedido', type: 'currency', required: true, category: 'Financiero' },
        { id: 'growth_rate', name: 'growth_rate', label: 'Tasa de Crecimiento', type: 'percentage', required: false, category: 'Financiero' },
        { id: 'top_products', name: 'top_products', label: 'Productos Más Vendidos', type: 'text', required: false, category: 'Productos' },
        { id: 'sales_by_category', name: 'sales_by_category', label: 'Ventas por Categoría', type: 'currency', required: false, category: 'Productos' }
      ]
    },
    {
      id: 'inventory-report',
      name: 'Reporte de Inventario',
      description: 'Estado actual del inventario y movimientos',
      icon: <Package className="w-6 h-6" />,
      category: 'Inventario',
      fields: [
        { id: 'current_stock', name: 'current_stock', label: 'Stock Actual', type: 'number', required: true, category: 'Inventario' },
        { id: 'stock_value', name: 'stock_value', label: 'Valor del Stock', type: 'currency', required: true, category: 'Financiero' },
        { id: 'low_stock_items', name: 'low_stock_items', label: 'Productos con Bajo Stock', type: 'number', required: true, category: 'Inventario' },
        { id: 'out_of_stock', name: 'out_of_stock', label: 'Productos Agotados', type: 'number', required: true, category: 'Inventario' },
        { id: 'stock_movements', name: 'stock_movements', label: 'Movimientos de Stock', type: 'number', required: false, category: 'Inventario' },
        { id: 'inventory_turnover', name: 'inventory_turnover', label: 'Rotación de Inventario', type: 'percentage', required: false, category: 'Financiero' }
      ]
    },
    {
      id: 'customer-analysis',
      name: 'Análisis de Clientes',
      description: 'Comportamiento y segmentación de clientes',
      icon: <Users className="w-6 h-6" />,
      category: 'Clientes',
      fields: [
        { id: 'total_customers', name: 'total_customers', label: 'Total de Clientes', type: 'number', required: true, category: 'Clientes' },
        { id: 'new_customers', name: 'new_customers', label: 'Clientes Nuevos', type: 'number', required: true, category: 'Clientes' },
        { id: 'repeat_customers', name: 'repeat_customers', label: 'Clientes Recurrentes', type: 'number', required: true, category: 'Clientes' },
        { id: 'customer_lifetime_value', name: 'customer_lifetime_value', label: 'Valor de Vida Cliente', type: 'currency', required: false, category: 'Financiero' },
        { id: 'top_customers', name: 'top_customers', label: 'Mejores Clientes', type: 'text', required: false, category: 'Clientes' },
        { id: 'customer_retention', name: 'customer_retention', label: 'Retención de Clientes', type: 'percentage', required: false, category: 'Clientes' }
      ]
    },
    {
      id: 'financial-report',
      name: 'Reporte Financiero',
      description: 'Estado financiero y rentabilidad',
      icon: <TrendingUp className="w-6 h-6" />,
      category: 'Financiero',
      fields: [
        { id: 'gross_revenue', name: 'gross_revenue', label: 'Ingresos Brutos', type: 'currency', required: true, category: 'Financiero' },
        { id: 'net_revenue', name: 'net_revenue', label: 'Ingresos Netos', type: 'currency', required: true, category: 'Financiero' },
        { id: 'total_expenses', name: 'total_expenses', label: 'Gastos Totales', type: 'currency', required: true, category: 'Financiero' },
        { id: 'profit_margin', name: 'profit_margin', label: 'Margen de Beneficio', type: 'percentage', required: true, category: 'Financiero' },
        { id: 'tax_summary', name: 'tax_summary', label: 'Resumen Fiscal', type: 'currency', required: false, category: 'Financiero' },
        { id: 'expense_breakdown', name: 'expense_breakdown', label: 'Desglose de Gastos', type: 'currency', required: false, category: 'Financiero' }
      ]
    },
    {
      id: 'production-report',
      name: 'Reporte de Producción',
      description: 'Eficiencia y tiempos de producción',
      icon: <Activity className="w-6 h-6" />,
      category: 'Producción',
      fields: [
        { id: 'orders_in_production', name: 'orders_in_production', label: 'Pedidos en Producción', type: 'number', required: true, category: 'Producción' },
        { id: 'avg_production_time', name: 'avg_production_time', label: 'Tiempo Promedio Producción', type: 'number', required: true, category: 'Producción' },
        { id: 'production_efficiency', name: 'production_efficiency', label: 'Eficiencia de Producción', type: 'percentage', required: true, category: 'Producción' },
        { id: 'bottlenecks', name: 'bottlenecks', label: 'Cuellos de Botella', type: 'text', required: false, category: 'Producción' },
        { id: 'material_usage', name: 'material_usage', label: 'Uso de Materiales', type: 'number', required: false, category: 'Producción' },
        { id: 'quality_metrics', name: 'quality_metrics', label: 'Métricas de Calidad', type: 'percentage', required: false, category: 'Producción' }
      ]
    }
  ]

  const groupByOptions = [
    { value: '', label: 'Sin agrupar' },
    { value: 'day', label: 'Por día' },
    { value: 'week', label: 'Por semana' },
    { value: 'month', label: 'Por mes' },
    { value: 'quarter', label: 'Por trimestre' },
    { value: 'year', label: 'Por año' },
    { value: 'category', label: 'Por categoría' },
    { value: 'product', label: 'Por producto' },
    { value: 'customer', label: 'Por cliente' }
  ]

  const sortByOptions = [
    { value: '', label: 'Sin ordenar' },
    { value: 'date_asc', label: 'Fecha (Ascendente)' },
    { value: 'date_desc', label: 'Fecha (Descendente)' },
    { value: 'amount_asc', label: 'Cantidad (Ascendente)' },
    { value: 'amount_desc', label: 'Cantidad (Descendente)' },
    { value: 'name_asc', label: 'Nombre (A-Z)' },
    { value: 'name_desc', label: 'Nombre (Z-A)' }
  ]

  const selectedTemplateData = reportTemplates.find(t => t.id === selectedTemplate)

  const handleFieldToggle = (fieldId: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldId) 
        ? prev.filter(f => f !== fieldId)
        : [...prev, fieldId]
    )
  }

  const handleGenerateReport = async () => {
    if (!selectedTemplate || !reportName) {
      toast.error('Por favor, selecciona una plantilla y nombre para el reporte')
      return
    }

    if (selectedFields.length === 0) {
      toast.error('Selecciona al menos un campo para el reporte')
      return
    }

    try {
      const response = await fetch('/api/reports/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: selectedTemplate,
          name: reportName,
          description: reportDescription,
          fields: selectedFields,
          dateRange,
          filters,
          groupBy,
          sortBy,
          format
        })
      })

      if (!response.ok) throw new Error('Error al generar reporte')

      const result = await response.json()
      toast.success('Reporte generado correctamente')
      router.push(`/admin/reports/${result.id}`)
    } catch (error) {
      toast.error('Error al generar el reporte')
    }
  }

  const handlePreview = () => {
    // Preview functionality
    toast.info('Vista previa no implementada aún')
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Crear Nuevo Reporte</h1>
            <p className="text-gray-600">Genera un reporte personalizado con los datos que necesites</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template Selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Choose Template */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm">1</span>
                Seleccionar Plantilla
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reportTemplates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedTemplate === template.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {template.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{template.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                        <Badge variant="outline" className="mt-2 text-xs">
                          {template.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Configure Report */}
          {selectedTemplateData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm">2</span>
                  Configurar Reporte
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del Reporte *
                    </label>
                    <Input
                      value={reportName}
                      onChange={(e) => setReportName(e.target.value)}
                      placeholder="Ej: Ventas Enero 2024"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Formato de Salida
                    </label>
                    <select
                      value={format}
                      onChange={(e) => setFormat(e.target.value as any)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="pdf">PDF</option>
                      <option value="excel">Excel</option>
                      <option value="csv">CSV</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Descripción opcional del reporte..."
                  />
                </div>

                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rango de Fechas
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="date"
                      value={dateRange.startDate || ""}
                      onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                      className="border border-gray-300 rounded-lg px-3 py-2"
                    />
                    <input
                      type="date"
                      value={dateRange.endDate || ""}
                      onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                      className="border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Agrupar por
                    </label>
                    <select
                      value={groupBy}
                      onChange={(e) => setGroupBy(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      {groupByOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ordenar por
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      {sortByOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Select Fields */}
          {selectedTemplateData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm">3</span>
                  Seleccionar Campos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Group fields by category */}
                  {Array.from(new Set(selectedTemplateData.fields.map(f => f.category))).map(category => (
                    <div key={category}>
                      <h4 className="font-medium text-gray-900 mb-2">{category}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectedTemplateData.fields
                          .filter(field => field.category === category)
                          .map((field) => (
                            <label
                              key={field.id}
                              className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                                selectedFields.includes(field.id)
                                  ? 'border-primary-500 bg-primary-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={selectedFields.includes(field.id)}
                                onChange={() => handleFieldToggle(field.id)}
                                className="rounded"
                              />
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{field.label}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {field.type}
                                  </Badge>
                                  {field.required && (
                                    <Badge variant="destructive" className="text-xs">
                                      Obligatorio
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </label>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Summary Sidebar */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Resumen del Reporte
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedTemplateData ? (
                <>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Plantilla:</p>
                    <p className="text-sm text-gray-900">{selectedTemplateData.name}</p>
                  </div>
                  
                  {reportName && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Nombre:</p>
                      <p className="text-sm text-gray-900">{reportName}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium text-gray-700">Campos seleccionados:</p>
                    <p className="text-sm text-gray-900">{selectedFields.length} de {selectedTemplateData.fields.length}</p>
                  </div>

                  {dateRange.startDate && dateRange.endDate && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Período:</p>
                      <p className="text-sm text-gray-900">
                        {new Date(dateRange.startDate).toLocaleDateString('es-ES')} - {' '}
                        {new Date(dateRange.endDate).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium text-gray-700">Formato:</p>
                    <p className="text-sm text-gray-900 uppercase">{format}</p>
                  </div>

                  <div className="pt-4 space-y-2">
                    <Button 
                      onClick={handlePreview}
                      variant="outline" 
                      className="w-full"
                      disabled={selectedFields.length === 0}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Vista Previa
                    </Button>
                    <Button 
                      onClick={handleGenerateReport}
                      className="w-full"
                      disabled={!selectedTemplate || !reportName || selectedFields.length === 0}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Generar Reporte
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    Selecciona una plantilla para comenzar
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}