'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send,
  MessageSquare,
  Facebook,
  Instagram,
  Twitter
} from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function ContactoPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    orderType: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success('Mensaje enviado correctamente. Te contactaremos pronto.')
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        orderType: ''
      })
    } catch (error) {
      toast.error('Error al enviar el mensaje. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const contactInfo = [
    {
      icon: <Phone className="w-6 h-6" />,
      title: 'Teléfono',
      content: '611 066 997',
      action: 'tel:611066997',
      description: 'Lunes a Viernes de 9:00 a 20:00h'
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: 'Email',
      content: 'info@lovilike.es',
      action: 'mailto:info@lovilike.es',
      description: 'Respuesta en menos de 24h'
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: 'Dirección',
      content: 'Hellín, Albacete',
      action: null,
      description: 'Envíos a toda España'
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Horario de Atención',
      content: 'Lun - Vie: 9:00 - 20:00',
      action: null,
      description: 'Sábados con cita previa'
    }
  ]

  const orderTypes = [
    { value: '', label: 'Selecciona el tipo de pedido' },
    { value: 'textiles', label: 'Textiles DTF (Camisetas, sudaderas...)' },
    { value: 'sublimacion', label: 'Sublimación (Tazas, cojines...)' },
    { value: 'laser', label: 'Corte láser (Llaveros, placas...)' },
    { value: 'eventos', label: 'Eventos especiales' },
    { value: 'empresarial', label: 'Pedido empresarial' },
    { value: 'otro', label: 'Otro tipo de pedido' }
  ]

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Contáctanos
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            ¿Tienes una idea en mente? Estamos aquí para ayudarte a hacerla realidad. 
            Contacta con nosotros y te daremos el mejor servicio personalizado.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Envíanos un mensaje
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre completo *
                    </label>
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Tu nombre completo"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono
                    </label>
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="611 066 997"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de pedido
                    </label>
                    <select
                      name="orderType"
                      value={formData.orderType}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      {orderTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Asunto *
                  </label>
                  <Input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="¿En qué podemos ayudarte?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mensaje *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Cuéntanos más detalles sobre tu proyecto: cantidad, diseño, fechas de entrega, etc."
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  {loading ? 'Enviando...' : 'Enviar mensaje'}
                </Button>
              </form>
            </Card>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            {/* Contact Cards */}
            {contactInfo.map((info, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-start gap-4">
                  <div className="text-primary-500">
                    {info.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {info.title}
                    </h3>
                    {info.action ? (
                      <a 
                        href={info.action}
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        {info.content}
                      </a>
                    ) : (
                      <p className="font-medium text-gray-900">
                        {info.content}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 mt-1">
                      {info.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}

            {/* WhatsApp */}
            <Card className="p-6 bg-green-50 border-green-200">
              <div className="flex items-center gap-4">
                <div className="text-green-600">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900 mb-1">
                    WhatsApp
                  </h3>
                  <a 
                    href="https://wa.me/34611066997"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-700 hover:text-green-800 font-medium"
                  >
                    +34 611 066 997
                  </a>
                  <p className="text-sm text-green-700 mt-1">
                    Respuesta inmediata
                  </p>
                </div>
              </div>
            </Card>

            {/* Social Media */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Síguenos en redes
              </h3>
              <div className="flex gap-4">
                <a 
                  href="#" 
                  className="text-blue-600 hover:text-blue-700 p-2 bg-blue-50 rounded-lg"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a 
                  href="#" 
                  className="text-pink-600 hover:text-pink-700 p-2 bg-pink-50 rounded-lg"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a 
                  href="#" 
                  className="text-blue-400 hover:text-blue-500 p-2 bg-blue-50 rounded-lg"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </Card>

            {/* FAQ Quick Links */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Preguntas frecuentes
              </h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900 text-sm">
                    ¿Cuánto tiempo tardan los pedidos?
                  </h4>
                  <p className="text-sm text-gray-600">
                    Entre 3-7 días laborables según el producto.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 text-sm">
                    ¿Hacéis envíos a toda España?
                  </h4>
                  <p className="text-sm text-gray-600">
                    Sí, envíos gratis a partir de 30€.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 text-sm">
                    ¿Podemos recoger en tienda?
                  </h4>
                  <p className="text-sm text-gray-600">
                    Sí, recogida gratuita en Hellín.
                  </p>
                </div>
              </div>
            </Card>

            {/* Emergency Contact */}
            <Card className="p-6 bg-red-50 border-red-200">
              <h3 className="font-semibold text-red-900 mb-2">
                ¿Pedido urgente?
              </h3>
              <p className="text-sm text-red-700 mb-3">
                Para pedidos con entrega en menos de 48h, contáctanos directamente por teléfono.
              </p>
              <a 
                href="tel:611066997"
                className="inline-flex items-center gap-2 text-red-700 hover:text-red-800 font-medium"
              >
                <Phone className="w-4 h-4" />
                Llamar ahora
              </a>
            </Card>
          </div>
        </div>

        {/* Map Section (Placeholder) */}
        <div className="mt-12">
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Nuestra ubicación
            </h2>
            <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  📍 Hellín, Albacete
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Ubicación exacta disponible al confirmar pedido
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}