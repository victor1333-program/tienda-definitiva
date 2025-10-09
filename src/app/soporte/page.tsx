"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-hot-toast"
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  Clock, 
  Search,
  HelpCircle,
  FileText,
  Video,
  Users,
  Zap,
  Shield,
  Truck,
  CreditCard,
  Package,
  Settings,
  ChevronRight,
  ExternalLink
} from "lucide-react"

export default function SoportePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    priority: "medium"
  })

  const faqs = [
    {
      id: 1,
      category: "pedidos",
      question: "¿Cómo puedo realizar un pedido personalizado?",
      answer: "Puedes usar nuestro personalizador online o contactarnos directamente para diseños especiales."
    },
    {
      id: 2,
      category: "envios",
      question: "¿Cuánto tiempo tarda en llegar mi pedido?",
      answer: "Los envíos estándar tardan 3-5 días laborables. Los productos personalizados pueden tardar 7-10 días."
    },
    {
      id: 3,
      category: "pagos",
      question: "¿Qué métodos de pago aceptan?",
      answer: "Aceptamos tarjetas de crédito/débito, PayPal, transferencias y pago contra reembolso."
    },
    {
      id: 4,
      category: "productos",
      question: "¿Puedo modificar mi diseño después de realizar el pedido?",
      answer: "Las modificaciones son posibles hasta 24 horas después del pedido, dependiendo del estado de producción."
    },
    {
      id: 5,
      category: "devoluciones",
      question: "¿Cuál es su política de devoluciones?",
      answer: "Productos estándar: 30 días. Productos personalizados: solo por defectos de fabricación."
    }
  ]

  const categories = [
    { id: "all", name: "Todas", icon: HelpCircle },
    { id: "pedidos", name: "Pedidos", icon: Package },
    { id: "envios", name: "Envíos", icon: Truck },
    { id: "pagos", name: "Pagos", icon: CreditCard },
    { id: "productos", name: "Productos", icon: Settings },
    { id: "devoluciones", name: "Devoluciones", icon: Shield }
  ]

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Aquí iría la lógica para enviar el formulario
      toast.success("Mensaje enviado correctamente. Te responderemos pronto.")
      setContactForm({
        name: "",
        email: "",
        subject: "",
        message: "",
        priority: "medium"
      })
    } catch (error) {
      toast.error("Error al enviar el mensaje. Inténtalo de nuevo.")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Centro de Soporte
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Estamos aquí para ayudarte. Encuentra respuestas rápidas o contáctanos directamente.
            </p>
            
            {/* Búsqueda */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Buscar en preguntas frecuentes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 py-3 text-lg"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Columna principal - FAQs */}
          <div className="lg:col-span-2">
            {/* Categorías */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    className={selectedCategory === category.id ? "bg-orange-600 hover:bg-orange-700" : ""}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <category.icon className="w-4 h-4 mr-2" />
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* FAQs */}
            <div className="space-y-4">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq) => (
                  <Card key={faq.id}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-start gap-3">
                        <HelpCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                        {faq.question}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-gray-600 ml-8">{faq.answer}</p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No encontramos resultados</h3>
                    <p className="text-gray-600">Intenta con otros términos de búsqueda o contacta con nosotros directamente.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Columna lateral - Contacto */}
          <div className="space-y-6">
            {/* Contacto rápido */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-orange-600" />
                  ¿Necesitas más ayuda?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <Phone className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">Teléfono</p>
                    <p className="text-sm text-green-700">+34 XXX XXX XXX</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">Email</p>
                    <p className="text-sm text-blue-700">soporte@lovilike.es</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="font-medium text-orange-900">Horario</p>
                    <p className="text-sm text-orange-700">L-V: 9:00 - 18:00</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Formulario de contacto */}
            <Card>
              <CardHeader>
                <CardTitle>Envíanos un mensaje</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nombre</Label>
                    <Input
                      id="name"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="subject">Asunto</Label>
                    <Input
                      id="subject"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="priority">Prioridad</Label>
                    <select
                      id="priority"
                      value={contactForm.priority}
                      onChange={(e) => setContactForm({...contactForm, priority: e.target.value})}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="low">Baja</option>
                      <option value="medium">Media</option>
                      <option value="high">Alta</option>
                      <option value="urgent">Urgente</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="message">Mensaje</Label>
                    <textarea
                      id="message"
                      value={contactForm.message}
                      onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                      rows={4}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700">
                    Enviar Mensaje
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Recursos adicionales */}
            <Card>
              <CardHeader>
                <CardTitle>Recursos útiles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <a href="/guia-personalizacion" className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <Video className="w-5 h-5 text-purple-600" />
                    <span>Guía de personalización</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </a>
                
                <a href="/politicas" className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span>Términos y condiciones</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </a>
                
                <a href="/comunidad" className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-green-600" />
                    <span>Comunidad de usuarios</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}