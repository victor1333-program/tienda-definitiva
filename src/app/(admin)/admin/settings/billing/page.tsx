"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ColoredSwitch } from "@/components/ui/ColoredSwitch"
import { toast } from "react-hot-toast"
import { 
  Receipt, 
  Save,
  FileText,
  Building,
  MapPin,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Percent,
  Calculator,
  Settings,
  Upload,
  Download,
  Eye,
  Edit,
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react"

interface BillingSettings {
  companyInfo: {
    name: string
    taxId: string
    address: string
    city: string
    postalCode: string
    country: string
    phone: string
    email: string
    website: string
  }
  documentSettings: {
    invoicePrefix: string
    quotePrefix: string
    orderPrefix: string
    nextInvoiceNumber: number
    nextQuoteNumber: number
    nextOrderNumber: number
    defaultTerms: number
    footerText: string
    logoUrl: string
    autoSend: boolean
    includeQR: boolean
  }
  taxSettings: {
    defaultTaxRate: number
    taxName: string
    taxNumber: string
    applyToShipping: boolean
    includedInPrice: boolean
  }
  paymentSettings: {
    lateFee: number
    lateFeeDays: number
    reminderDays: number[]
    acceptPartialPayments: boolean
  }
}

export default function BillingSettingsPage() {
  const [settings, setSettings] = useState<BillingSettings>({
    companyInfo: {
      name: "Lovilike",
      taxId: "B12345678",
      address: "Calle Principal, 123",
      city: "Madrid",
      postalCode: "28001",
      country: "España",
      phone: "+34 911 234 567",
      email: "facturacion@lovilike.es",
      website: "www.lovilike.es"
    },
    documentSettings: {
      invoicePrefix: "INV-",
      quotePrefix: "PRE-",
      orderPrefix: "PED-",
      nextInvoiceNumber: 1000,
      nextQuoteNumber: 1000,
      nextOrderNumber: 1000,
      defaultTerms: 30,
      footerText: "Gracias por confiar en Lovilike. Para cualquier consulta, no dude en contactarnos.",
      logoUrl: "/logo.png",
      autoSend: true,
      includeQR: false
    },
    taxSettings: {
      defaultTaxRate: 21,
      taxName: "IVA",
      taxNumber: "ESB12345678",
      applyToShipping: true,
      includedInPrice: false
    },
    paymentSettings: {
      lateFee: 5.0,
      lateFeeDays: 15,
      reminderDays: [7, 14, 30],
      acceptPartialPayments: true
    }
  })

  const [isLoading, setIsLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success("Configuración de facturación guardada correctamente")
      setHasChanges(false)
    } catch (error) {
      toast.error("Error al guardar la configuración")
    } finally {
      setIsLoading(false)
    }
  }

  const updateCompanyInfo = (field: string, value: string) => {
    setSettings({
      ...settings,
      companyInfo: {
        ...settings.companyInfo,
        [field]: value
      }
    })
    setHasChanges(true)
  }

  const updateDocumentSettings = (field: string, value: any) => {
    setSettings({
      ...settings,
      documentSettings: {
        ...settings.documentSettings,
        [field]: value
      }
    })
    setHasChanges(true)
  }

  const updateTaxSettings = (field: string, value: any) => {
    setSettings({
      ...settings,
      taxSettings: {
        ...settings.taxSettings,
        [field]: value
      }
    })
    setHasChanges(true)
  }

  const updatePaymentSettings = (field: string, value: any) => {
    setSettings({
      ...settings,
      paymentSettings: {
        ...settings.paymentSettings,
        [field]: value
      }
    })
    setHasChanges(true)
  }

  const testInvoice = () => {
    toast.success("Factura de prueba generada. Revisa tu email.")
  }

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'billing-settings.json'
    link.click()
    toast.success("Configuración exportada")
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Configuración de Facturación</h1>
            <p className="text-gray-600">Gestiona la información de facturación y configuración fiscal</p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportSettings}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button variant="outline" onClick={testInvoice}>
              <Eye className="w-4 h-4 mr-2" />
              Factura Prueba
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!hasChanges || isLoading}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </div>
        
        {hasChanges && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">Tienes cambios sin guardar</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información de la empresa */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Información de la Empresa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="companyName">Nombre de la Empresa</Label>
                <Input
                  id="companyName"
                  value={settings.companyInfo.name}
                  onChange={(e) => updateCompanyInfo('name', e.target.value)}
                  placeholder="Nombre de tu empresa"
                />
              </div>
              
              <div>
                <Label htmlFor="taxId">CIF/NIF</Label>
                <Input
                  id="taxId"
                  value={settings.companyInfo.taxId}
                  onChange={(e) => updateCompanyInfo('taxId', e.target.value)}
                  placeholder="B12345678"
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={settings.companyInfo.phone}
                  onChange={(e) => updateCompanyInfo('phone', e.target.value)}
                  placeholder="+34 911 234 567"
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  value={settings.companyInfo.address}
                  onChange={(e) => updateCompanyInfo('address', e.target.value)}
                  placeholder="Calle Principal, 123"
                />
              </div>
              
              <div>
                <Label htmlFor="city">Ciudad</Label>
                <Input
                  id="city"
                  value={settings.companyInfo.city}
                  onChange={(e) => updateCompanyInfo('city', e.target.value)}
                  placeholder="Madrid"
                />
              </div>
              
              <div>
                <Label htmlFor="postalCode">Código Postal</Label>
                <Input
                  id="postalCode"
                  value={settings.companyInfo.postalCode}
                  onChange={(e) => updateCompanyInfo('postalCode', e.target.value)}
                  placeholder="28001"
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email de Facturación</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.companyInfo.email}
                  onChange={(e) => updateCompanyInfo('email', e.target.value)}
                  placeholder="facturacion@empresa.com"
                />
              </div>
              
              <div>
                <Label htmlFor="website">Sitio Web</Label>
                <Input
                  id="website"
                  value={settings.companyInfo.website}
                  onChange={(e) => updateCompanyInfo('website', e.target.value)}
                  placeholder="www.empresa.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuración de Documentos y Numeración */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Documentación y Numeración
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Prefijos */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Prefijos de Documentos</h3>
                <div>
                  <Label htmlFor="invoicePrefix">Prefijo de Facturas</Label>
                  <Input
                    id="invoicePrefix"
                    value={settings.documentSettings.invoicePrefix}
                    onChange={(e) => updateDocumentSettings('invoicePrefix', e.target.value)}
                    placeholder="INV-"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Ejemplo: {settings.documentSettings.invoicePrefix}2024001
                  </p>
                </div>

                <div>
                  <Label htmlFor="quotePrefix">Prefijo de Presupuestos</Label>
                  <Input
                    id="quotePrefix"
                    value={settings.documentSettings.quotePrefix}
                    onChange={(e) => updateDocumentSettings('quotePrefix', e.target.value)}
                    placeholder="PRE-"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Ejemplo: {settings.documentSettings.quotePrefix}2024001
                  </p>
                </div>

                <div>
                  <Label htmlFor="orderPrefix">Prefijo de Pedidos</Label>
                  <Input
                    id="orderPrefix"
                    value={settings.documentSettings.orderPrefix}
                    onChange={(e) => updateDocumentSettings('orderPrefix', e.target.value)}
                    placeholder="PED-"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Ejemplo: {settings.documentSettings.orderPrefix}2024001
                  </p>
                </div>
              </div>

              {/* Numeración */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Numeración Siguiente</h3>
                <div>
                  <Label htmlFor="nextInvoiceNumber">Siguiente Número de Factura</Label>
                  <Input
                    id="nextInvoiceNumber"
                    type="number"
                    value={settings.documentSettings.nextInvoiceNumber}
                    onChange={(e) => updateDocumentSettings('nextInvoiceNumber', parseInt(e.target.value))}
                    min="1"
                  />
                </div>

                <div>
                  <Label htmlFor="nextQuoteNumber">Siguiente Número de Presupuesto</Label>
                  <Input
                    id="nextQuoteNumber"
                    type="number"
                    value={settings.documentSettings.nextQuoteNumber}
                    onChange={(e) => updateDocumentSettings('nextQuoteNumber', parseInt(e.target.value))}
                    min="1"
                  />
                </div>

                <div>
                  <Label htmlFor="nextOrderNumber">Siguiente Número de Pedido</Label>
                  <Input
                    id="nextOrderNumber"
                    type="number"
                    value={settings.documentSettings.nextOrderNumber}
                    onChange={(e) => updateDocumentSettings('nextOrderNumber', parseInt(e.target.value))}
                    min="1"
                  />
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-yellow-800">
                        <strong>Atención:</strong> Cambiar estos números puede afectar la secuencia de documentos.
                        Solo modifica si sabes lo que estás haciendo.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Configuración adicional */}
              <div className="md:col-span-2 space-y-4 pt-4 border-t">
                <div>
                  <Label htmlFor="defaultTerms">Términos de Pago (días)</Label>
                  <Input
                    id="defaultTerms"
                    type="number"
                    value={settings.documentSettings.defaultTerms}
                    onChange={(e) => updateDocumentSettings('defaultTerms', parseInt(e.target.value))}
                    placeholder="30"
                    className="max-w-xs"
                  />
                </div>

                <div>
                  <Label htmlFor="footerText">Texto de Pie de Documento</Label>
                  <textarea
                    id="footerText"
                    value={settings.documentSettings.footerText}
                    onChange={(e) => updateDocumentSettings('footerText', e.target.value)}
                    placeholder="Información adicional para los documentos..."
                    className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label>Envío Automático</Label>
                      <p className="text-sm text-gray-600">Enviar documentos automáticamente por email</p>
                    </div>
                    <ColoredSwitch
                      checked={settings.documentSettings.autoSend}
                      onCheckedChange={(checked) => updateDocumentSettings('autoSend', checked)}
                      activeColor="green"
                      inactiveColor="gray"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label>Incluir Código QR</Label>
                      <p className="text-sm text-gray-600">Código QR para pagos móviles</p>
                    </div>
                    <ColoredSwitch
                      checked={settings.documentSettings.includeQR}
                      onCheckedChange={(checked) => updateDocumentSettings('includeQR', checked)}
                      activeColor="green"
                      inactiveColor="gray"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuración de impuestos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="w-5 h-5" />
              Configuración de Impuestos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="taxName">Nombre del Impuesto</Label>
                <Input
                  id="taxName"
                  value={settings.taxSettings.taxName}
                  onChange={(e) => updateTaxSettings('taxName', e.target.value)}
                  placeholder="IVA"
                />
              </div>
              
              <div>
                <Label htmlFor="defaultTaxRate">Tasa por Defecto (%)</Label>
                <Input
                  id="defaultTaxRate"
                  type="number"
                  step="0.01"
                  value={settings.taxSettings.defaultTaxRate}
                  onChange={(e) => updateTaxSettings('defaultTaxRate', parseFloat(e.target.value))}
                  placeholder="21"
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="taxNumber">Número de Identificación Fiscal</Label>
                <Input
                  id="taxNumber"
                  value={settings.taxSettings.taxNumber}
                  onChange={(e) => updateTaxSettings('taxNumber', e.target.value)}
                  placeholder="ESB12345678"
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Aplicar a Envíos</Label>
                  <p className="text-sm text-gray-600">Incluir impuestos en costes de envío</p>
                </div>
                <ColoredSwitch
                  checked={settings.taxSettings.applyToShipping}
                  onCheckedChange={(checked) => updateTaxSettings('applyToShipping', checked)}
                  activeColor="green"
                  inactiveColor="gray"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Precios con Impuestos Incluidos</Label>
                  <p className="text-sm text-gray-600">Los precios mostrados incluyen impuestos</p>
                </div>
                <ColoredSwitch
                  checked={settings.taxSettings.includedInPrice}
                  onCheckedChange={(checked) => updateTaxSettings('includedInPrice', checked)}
                  activeColor="green"
                  inactiveColor="gray"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuración de pagos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Configuración de Pagos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lateFee">Recargo por Retraso (%)</Label>
                <Input
                  id="lateFee"
                  type="number"
                  step="0.01"
                  value={settings.paymentSettings.lateFee}
                  onChange={(e) => updatePaymentSettings('lateFee', parseFloat(e.target.value))}
                  placeholder="5.0"
                />
              </div>
              
              <div>
                <Label htmlFor="lateFeeDays">Días para Recargo</Label>
                <Input
                  id="lateFeeDays"
                  type="number"
                  value={settings.paymentSettings.lateFeeDays}
                  onChange={(e) => updatePaymentSettings('lateFeeDays', parseInt(e.target.value))}
                  placeholder="15"
                />
              </div>
            </div>
            
            <div>
              <Label>Días de Recordatorio</Label>
              <p className="text-sm text-gray-600 mb-2">Enviar recordatorios antes del vencimiento</p>
              <div className="flex gap-2">
                {[7, 14, 30].map((days) => (
                  <Button
                    key={days}
                    size="sm"
                    variant={settings.paymentSettings.reminderDays.includes(days) ? "default" : "outline"}
                    className={settings.paymentSettings.reminderDays.includes(days) ? "bg-orange-600 hover:bg-orange-700" : ""}
                    onClick={() => {
                      const newReminderDays = settings.paymentSettings.reminderDays.includes(days)
                        ? settings.paymentSettings.reminderDays.filter(d => d !== days)
                        : [...settings.paymentSettings.reminderDays, days].sort((a, b) => a - b)
                      updatePaymentSettings('reminderDays', newReminderDays)
                    }}
                  >
                    {days} días
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Aceptar Pagos Parciales</Label>
                <p className="text-sm text-gray-600">Permitir pagos a plazos</p>
              </div>
              <ColoredSwitch
                checked={settings.paymentSettings.acceptPartialPayments}
                onCheckedChange={(checked) => updatePaymentSettings('acceptPartialPayments', checked)}
                activeColor="green"
                inactiveColor="gray"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vista previa de factura */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Vista Previa de Factura
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-6 bg-white">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold">{settings.companyInfo.name}</h2>
                <p className="text-gray-600">{settings.companyInfo.address}</p>
                <p className="text-gray-600">{settings.companyInfo.city}, {settings.companyInfo.postalCode}</p>
                <p className="text-gray-600">{settings.companyInfo.phone}</p>
              </div>
              <div className="text-right">
                <h3 className="text-lg font-semibold">FACTURA</h3>
                <p className="text-gray-600">{settings.documentSettings.invoicePrefix}{settings.documentSettings.nextInvoiceNumber.toString().padStart(4, '0')}</p>
                <p className="text-gray-600">Fecha: {new Date().toLocaleDateString('es-ES')}</p>
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="font-semibold mb-2">Facturar a:</h4>
              <p>Cliente de Ejemplo</p>
              <p>Dirección del Cliente</p>
              <p>Ciudad, CP</p>
            </div>
            
            <table className="w-full mb-6">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Descripción</th>
                  <th className="text-right py-2">Cantidad</th>
                  <th className="text-right py-2">Precio</th>
                  <th className="text-right py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2">Producto de ejemplo</td>
                  <td className="text-right py-2">1</td>
                  <td className="text-right py-2">100,00€</td>
                  <td className="text-right py-2">100,00€</td>
                </tr>
              </tbody>
            </table>
            
            <div className="flex justify-end">
              <div className="w-64">
                <div className="flex justify-between py-1">
                  <span>Subtotal:</span>
                  <span>100,00€</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>{settings.taxSettings.taxName} ({settings.taxSettings.defaultTaxRate}%):</span>
                  <span>{(100 * settings.taxSettings.defaultTaxRate / 100).toFixed(2)}€</span>
                </div>
                <div className="flex justify-between py-2 border-t font-semibold">
                  <span>Total:</span>
                  <span>{(100 * (1 + settings.taxSettings.defaultTaxRate / 100)).toFixed(2)}€</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 text-sm text-gray-600">
              <p>{settings.documentSettings.footerText}</p>
              <p className="mt-2">Términos de pago: {settings.documentSettings.defaultTerms} días</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}