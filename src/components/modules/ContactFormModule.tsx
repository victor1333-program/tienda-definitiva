"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react"

interface ContactInfo {
  email: string
  phone: string
  address: string
}

interface ContactFormProps {
  title: string
  subtitle: string
  layout: 'form-only' | 'form-with-info' | 'split'
  contactInfo?: ContactInfo
  showMap: boolean
  mapUrl?: string
  requiredFields: string[]
}

export default function ContactFormModule(props: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simular envío
    setTimeout(() => {
      setIsSubmitted(true)
      setIsLoading(false)
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      })
    }, 1500)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const ContactForm = () => (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Envíanos un mensaje</h3>
      
      {isSubmitted ? (
        <div className="text-center py-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h4 className="text-xl font-semibold text-gray-900 mb-2">¡Mensaje enviado!</h4>
          <p className="text-gray-600">Te responderemos lo antes posible.</p>
          <Button 
            onClick={() => setIsSubmitted(false)}
            variant="outline"
            className="mt-4"
          >
            Enviar otro mensaje
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name">
                Nombre {props.requiredFields.includes('name') && '*'}
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required={props.requiredFields.includes('name')}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email">
                Email {props.requiredFields.includes('email') && '*'}
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required={props.requiredFields.includes('email')}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="phone">
                Teléfono {props.requiredFields.includes('phone') && '*'}
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                required={props.requiredFields.includes('phone')}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="subject">
                Asunto {props.requiredFields.includes('subject') && '*'}
              </Label>
              <Input
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required={props.requiredFields.includes('subject')}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="message">
              Mensaje {props.requiredFields.includes('message') && '*'}
            </Label>
            <Textarea
              id="message"
              name="message"
              rows={6}
              value={formData.message}
              onChange={handleChange}
              required={props.requiredFields.includes('message')}
              className="mt-1"
              placeholder="Cuéntanos cómo podemos ayudarte..."
            />
          </div>

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            {isLoading ? 'Enviando...' : 'Enviar Mensaje'}
          </Button>
        </form>
      )}
    </div>
  )

  const ContactInfoPanel = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Información de contacto</h3>
        <div className="space-y-4">
          {props.contactInfo?.email && (
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-orange-500" />
              <a 
                href={`mailto:${props.contactInfo.email}`}
                className="text-gray-700 hover:text-orange-600 transition-colors"
              >
                {props.contactInfo.email}
              </a>
            </div>
          )}
          {props.contactInfo?.phone && (
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-orange-500" />
              <a 
                href={`tel:${props.contactInfo.phone}`}
                className="text-gray-700 hover:text-orange-600 transition-colors"
              >
                {props.contactInfo.phone}
              </a>
            </div>
          )}
          {props.contactInfo?.address && (
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-orange-500 mt-1" />
              <span className="text-gray-700">{props.contactInfo.address}</span>
            </div>
          )}
        </div>
      </div>

      {props.showMap && props.mapUrl && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-4">Nuestra ubicación</h4>
          <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
            <iframe
              src={props.mapUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      )}
    </div>
  )

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {props.title}
          </h2>
          {props.subtitle && (
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {props.subtitle}
            </p>
          )}
        </div>

        {/* Content */}
        {props.layout === 'form-only' ? (
          <div className="max-w-2xl mx-auto">
            <ContactForm />
          </div>
        ) : props.layout === 'split' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <ContactForm />
            <ContactInfoPanel />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <ContactForm />
            </div>
            <div>
              <ContactInfoPanel />
            </div>
          </div>
        )}
      </div>
    </section>
  )
}