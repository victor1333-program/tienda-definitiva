'use client'

import { useState, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send,
  MessageSquare,
  Facebook,
  Instagram,
  Twitter,
  Upload,
  X,
  FileText,
  Star,
  Quote,
  Calendar,
  AlertCircle,
  CheckCircle,
  Users,
  Award,
  Zap
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { WhatsAppContactButton } from '@/components/WhatsAppButton'

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
  const [attachments, setAttachments] = useState<File[]>([])
  const [showChat, setShowChat] = useState(false)
  const [chatMessages, setChatMessages] = useState<{id: number, text: string, sender: 'user' | 'bot', time: string}[]>([])
  const [chatInput, setChatInput] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}
    
    if (!formData.name.trim()) newErrors.name = 'El nombre es requerido'
    if (!formData.email.trim()) newErrors.email = 'El email es requerido'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Email inválido'
    if (!formData.subject.trim()) newErrors.subject = 'El asunto es requerido'
    if (!formData.message.trim()) newErrors.message = 'El mensaje es requerido'
    if (formData.message.length < 10) newErrors.message = 'El mensaje debe tener al menos 10 caracteres'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Por favor corrige los errores en el formulario')
      return
    }
    
    setLoading(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        const result = await response.json()
        toast.success(`Mensaje enviado correctamente. Referencia: #${result.id}`)
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
          orderType: ''
        })
        setAttachments([])
        setErrors({})
      } else {
        const error = await response.json()
        toast.error(error.message || 'Error al enviar el mensaje')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al enviar el mensaje. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const maxSize = 5 * 1024 * 1024 // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain']
    
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        toast.error(`${file.name} es demasiado grande. Máximo 5MB.`)
        return false
      }
      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name} no es un tipo de archivo válido.`)
        return false
      }
      return true
    })
    
    setAttachments(prev => [...prev, ...validFiles].slice(0, 3)) // Max 3 files
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const sendChatMessage = () => {
    if (!chatInput.trim()) return
    
    const newMessage = {
      id: Date.now(),
      text: chatInput,
      sender: 'user' as const,
      time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    }
    
    setChatMessages(prev => [...prev, newMessage])
    setChatInput('')
    
    // Simulate bot response
    setTimeout(() => {
      const botResponse = {
        id: Date.now(),
        text: 'Gracias por tu mensaje. Un miembro de nuestro equipo te responderá pronto. Para consultas urgentes, llámanos al 611 066 997.',
        sender: 'bot' as const,
        time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
      }
      setChatMessages(prev => [...prev, botResponse])
    }, 1000)
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

  const testimonials = [
    {
      name: "María González",
      rating: 5,
      comment: "Excelente calidad y atención al cliente. Los productos superaron mis expectativas.",
      product: "Camisetas personalizadas para evento",
      date: "Hace 2 semanas"
    },
    {
      name: "Carlos Ruiz",
      rating: 5,
      comment: "Entrega rápida y resultado perfecto. Definitivamente repetiré.",
      product: "Tazas sublimadas",
      date: "Hace 1 mes"
    },
    {
      name: "Ana López",
      rating: 5,
      comment: "Profesionales y creativos. Me ayudaron a hacer realidad mi idea.",
      product: "Llaveros personalizados",
      date: "Hace 3 semanas"
    }
  ]

  const faqItems = [
    {
      question: "¿Cuánto tiempo tardan los pedidos?",
      answer: "Los tiempos varían según el producto: Textiles DTF (3-5 días), Sublimación (2-4 días), Corte láser (1-3 días). Para pedidos urgentes ofrecemos servicio express en 24-48h."
    },
    {
      question: "¿Hacéis envíos a toda España?",
      answer: "Sí, enviamos a toda España. Envío gratuito en pedidos superiores a 50€. También ofrecemos recogida gratuita en nuestra ubicación de Hellín, Albacete."
    },
    {
      question: "¿Podemos recoger en tienda?",
      answer: "Por supuesto. Puedes recoger tu pedido en Hellín, Albacete. Te notificaremos cuando esté listo. Horario de recogida: Lunes a Viernes de 9:00 a 20:00h."
    },
    {
      question: "¿Qué formatos de archivo aceptan?",
      answer: "Aceptamos PNG, JPG, PDF, AI, PSD y SVG. Para mejor calidad recomendamos archivos vectoriales. Si no tienes el diseño, nuestro equipo puede ayudarte a crearlo."
    },
    {
      question: "¿Ofrecen garantía en sus productos?",
      answer: "Sí, todos nuestros productos tienen garantía de calidad. Si no estás satisfecho, contacta con nosotros en las primeras 48h tras recibir el pedido."
    },
    {
      question: "¿Hacen pedidos personalizados únicos?",
      answer: "Por supuesto. Nos especializamos en piezas únicas y personalizadas. Comparte tu idea y trabajaremos juntos para hacerla realidad."
    },
    {
      question: "¿Cuál es la cantidad mínima de pedido?",
      answer: "No tenemos cantidad mínima. Desde 1 pieza hasta grandes volúmenes. Los precios se ajustan según la cantidad solicitada."
    },
    {
      question: "¿Aceptan devoluciones?",
      answer: "Los productos personalizados no admiten devolución salvo defecto de fabricación. Para productos estándar, aceptamos devoluciones en 14 días."
    }
  ]

  const businessHours = [
    { day: 'Lunes a Viernes', hours: '9:00 - 20:00', special: '' },
    { day: 'Sábados', hours: 'Con cita previa', special: 'Llamar antes' },
    { day: 'Domingos', hours: 'Cerrado', special: 'WhatsApp disponible' },
    { day: 'Festivos', hours: 'Cerrado', special: 'Consultar calendario' }
  ]

  return (
    <div>
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
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.name}
                      </p>
                    )}
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
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.email}
                      </p>
                    )}
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
                    className={errors.subject ? 'border-red-500' : ''}
                  />
                  {errors.subject && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.subject}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mensaje * (mínimo 10 caracteres)
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${errors.message ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Cuéntanos más detalles sobre tu proyecto: cantidad, diseño, fechas de entrega, etc."
                  />
                  <div className="flex justify-between items-center mt-1">
                    {errors.message ? (
                      <p className="text-red-500 text-sm flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.message}
                      </p>
                    ) : (
                      <span></span>
                    )}
                    <span className={`text-sm ${formData.message.length < 10 ? 'text-red-500' : 'text-gray-500'}`}>
                      {formData.message.length}/10 min
                    </span>
                  </div>
                </div>

                {/* File Upload Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adjuntar archivos (opcional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,.pdf,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-primary-600 hover:text-primary-700 font-medium"
                        >
                          Subir archivos
                        </button>
                        {' '}o arrastra y suelta aquí
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, PDF hasta 5MB (máximo 3 archivos)
                      </p>
                    </div>
                  </div>
                  
                  {/* Show uploaded files */}
                  {attachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-700">{file.name}</span>
                            <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
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
              <div className="flex items-center gap-4 mb-4">
                <div className="text-green-600">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900 mb-1">
                    WhatsApp Business
                  </h3>
                  <p className="text-green-700 font-medium">
                    +34 611 066 997
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    ¡Respuesta inmediata! Lun-Vie 9:00-18:00
                  </p>
                </div>
              </div>
              
              <WhatsAppContactButton 
                className="w-full bg-green-600 hover:bg-green-700"
                size="lg"
                message="¡Hola! Vengo desde la página de contacto y me gustaría obtener información sobre sus productos personalizados. ¿Podrían ayudarme?"
              />
              
              <p className="text-xs text-green-600 text-center mt-3">
                💬 Chat directo • 📱 Envío de fotos • 🚀 Cotización rápida
              </p>
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

            {/* Business Hours */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-500" />
                Horarios de atención
              </h3>
              <div className="space-y-3">
                {businessHours.map((schedule, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">{schedule.day}</span>
                    <div className="text-right">
                      <span className="text-sm text-gray-900">{schedule.hours}</span>
                      {schedule.special && (
                        <p className="text-xs text-gray-500">{schedule.special}</p>
                      )}
                    </div>
                  </div>
                ))}
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



        {/* Map Section with Google Maps */}
        <div className="mt-12">
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Nuestra ubicación
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-lg p-6">
                  <MapPin className="w-8 h-8 text-primary-500 mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">Dirección</h3>
                  <p className="text-gray-700 mb-4">
                    Hellín, Albacete<br />
                    Castilla-La Mancha, España
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      • Fácil acceso desde la A-30
                    </p>
                    <p className="text-sm text-gray-600">
                      • Parking disponible
                    </p>
                    <p className="text-sm text-gray-600">
                      • Recogida con cita previa
                    </p>
                  </div>
                  <div className="mt-4">
                    <a 
                      href="https://goo.gl/maps/ejemplo" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
                    >
                      <MapPin className="w-4 h-4" />
                      Ver en Google Maps
                    </a>
                  </div>
                </div>
              </div>
              <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">
                    📍 Hellín, Albacete
                  </p>
                  <p className="text-sm text-gray-500">
                    Ubicación exacta disponible al confirmar pedido
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Google Maps se integrará próximamente
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
      
      {/* Live Chat Widget */}
      {showChat && (
        <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 z-50">
          <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white p-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Chat en vivo</h3>
              <button 
                onClick={() => setShowChat(false)}
                className="text-white hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-white/80">¿En qué podemos ayudarte?</p>
          </div>
          
          <div className="h-64 overflow-y-auto p-4 space-y-3">
            {chatMessages.length === 0 ? (
              <div className="text-center text-gray-500 text-sm">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>¡Hola! ¿Tienes alguna pregunta?</p>
              </div>
            ) : (
              chatMessages.map(message => (
                <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs p-3 rounded-lg ${
                    message.sender === 'user' 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm">{message.text}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-white/70' : 'text-gray-500'
                    }`}>
                      {message.time}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="p-4 border-t border-gray-200">
            <form onSubmit={(e) => { e.preventDefault(); sendChatMessage(); }} className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Escribe tu mensaje..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
      
      {/* Chat Widget Button */}
      {!showChat && (
        <button
          onClick={() => setShowChat(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-full shadow-lg hover:scale-110 transition-transform duration-300 flex items-center justify-center z-40"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}
    </div>
  )
}