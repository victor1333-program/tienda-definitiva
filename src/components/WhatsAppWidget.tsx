'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, X, Clock, Phone, User, ArrowUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

interface WhatsAppConfig {
  phone: string
  businessName: string
  welcomeMessage: string
  availability: {
    enabled: boolean
    schedule: string
    timezone: string
  }
  quickReplies: string[]
  enabled: boolean
}

interface WhatsAppWidgetProps {
  config?: Partial<WhatsAppConfig>
  className?: string
}

const defaultConfig: WhatsAppConfig = {
  phone: '+34612345678',
  businessName: 'Lovilike Personalizados',
  welcomeMessage: '¡Hola! 👋\n\n¿En qué podemos ayudarte? Estamos aquí para resolver todas tus dudas sobre nuestros productos personalizados.',
  availability: {
    enabled: true,
    schedule: 'Lunes a Viernes: 9:00 - 18:00',
    timezone: 'Europe/Madrid'
  },
  quickReplies: [
    '¿Cómo personalizar mi producto?',
    'Información sobre envíos',
    'Consultar mi pedido',
    'Precios y descuentos',
    'Hablar con un experto'
  ],
  enabled: true
}

export default function WhatsAppWidget({ config = {}, className = '' }: WhatsAppWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [currentConfig, setCurrentConfig] = useState<WhatsAppConfig>({ ...defaultConfig, ...config })
  const [isOnline, setIsOnline] = useState(false)

  useEffect(() => {
    // Cargar configuración desde API
    const loadConfig = async () => {
      try {
        const response = await fetch('/api/whatsapp/config')
        if (response.ok) {
          const data = await response.json()
          setCurrentConfig({ ...defaultConfig, ...data })
        }
      } catch (error) {
        console.error('Error loading WhatsApp config:', error)
      }
    }

    loadConfig()
  }, [])

  useEffect(() => {
    // Simular estado online basado en horario
    const checkAvailability = () => {
      if (!currentConfig.availability.enabled) {
        setIsOnline(false)
        return
      }

      const now = new Date()
      const hour = now.getHours()
      const day = now.getDay()

      // Lunes a Viernes (1-5), 9:00 a 18:00
      const isBusinessHours = day >= 1 && day <= 5 && hour >= 9 && hour < 18
      setIsOnline(isBusinessHours)
    }

    checkAvailability()
    const interval = setInterval(checkAvailability, 60000) // Revisar cada minuto

    return () => clearInterval(interval)
  }, [currentConfig.availability])

  useEffect(() => {
    // Auto-ocultar en ciertas páginas
    const hideOnPages = ['/admin', '/auth', '/checkout']
    const shouldHide = hideOnPages.some(page => window.location.pathname.startsWith(page))
    setIsVisible(!shouldHide)

    // Mostrar después de un delay inicial
    const timer = setTimeout(() => {
      if (!shouldHide) setIsVisible(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  const formatPhoneForURL = (phone: string) => {
    return phone.replace(/[^\d+]/g, '')
  }

  const sendMessage = (message: string = '') => {
    const finalMessage = message || currentConfig.welcomeMessage
    const encodedMessage = encodeURIComponent(finalMessage)
    const phoneFormatted = formatPhoneForURL(currentConfig.phone)
    const whatsappURL = `https://wa.me/${phoneFormatted}?text=${encodedMessage}`
    
    window.open(whatsappURL, '_blank')
    setIsOpen(false)

    // Analytics tracking
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'whatsapp_click', {
        event_category: 'engagement',
        event_label: message ? 'quick_reply' : 'welcome_message'
      })
    }
  }

  if (!currentConfig.enabled || !isVisible) {
    return null
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-80 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-green-600 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-green-600" />
                  </div>
                  {isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{currentConfig.businessName}</h3>
                  <p className="text-xs text-green-100">
                    {isOnline ? 'En línea' : 'Fuera de línea'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-green-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Welcome Message */}
            <div className="mb-4">
              <div className="bg-gray-100 rounded-lg p-3 text-sm">
                <div className="flex items-center space-x-2 mb-2">
                  <User className="w-4 h-4 text-gray-600" />
                  <span className="font-medium text-gray-800">{currentConfig.businessName}</span>
                </div>
                <p className="text-gray-700 whitespace-pre-line">
                  {currentConfig.welcomeMessage}
                </p>
              </div>
            </div>

            {/* Quick Replies */}
            <div className="space-y-2 mb-4">
              <p className="text-xs text-gray-600 font-medium mb-2">Mensajes rápidos:</p>
              {currentConfig.quickReplies.map((reply, index) => (
                <button
                  key={index}
                  onClick={() => sendMessage(reply)}
                  className="w-full text-left p-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-green-300 transition-colors"
                >
                  {reply}
                </button>
              ))}
            </div>

            {/* Availability */}
            {currentConfig.availability.enabled && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Horario de atención</span>
                </div>
                <p className="text-blue-700 text-xs mt-1">
                  {currentConfig.availability.schedule}
                </p>
                {!isOnline && (
                  <p className="text-blue-600 text-xs mt-1">
                    Estamos fuera de horario, pero te responderemos pronto!
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button
                onClick={() => sendMessage()}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Abrir WhatsApp
              </Button>
              
              <button
                onClick={() => sendMessage('Hola, me gustaría hablar por teléfono. ¿Cuál es el mejor horario para llamar?')}
                className="w-full p-2 text-sm text-green-600 border border-green-200 rounded-lg hover:bg-green-50 transition-colors flex items-center justify-center"
              >
                <Phone className="w-4 h-4 mr-2" />
                Solicitar llamada
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-2 bg-gray-50 border-t">
            <p className="text-xs text-gray-500 text-center">
              Powered by WhatsApp Business
            </p>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative group w-14 h-14 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center ${
          isOpen ? 'rotate-180' : 'animate-pulse'
        }`}
        aria-label="Abrir chat de WhatsApp"
      >
        {isOpen ? (
          <ArrowUp className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
        
        {/* Online indicator */}
        {isOnline && !isOpen && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full animate-ping"></div>
        )}

        {/* Unread indicator */}
        {!isOpen && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-bounce">
            !
          </div>
        )}

        {/* Tooltip */}
        <div className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          {isOpen ? 'Cerrar chat' : 'Chatea con nosotros'}
        </div>
      </button>

      {/* Floating message bubble (first time visitors) */}
      {!isOpen && (
        <div className="absolute -top-12 right-0 max-w-xs">
          <div className="bg-white rounded-lg shadow-lg p-3 border relative animate-bounce">
            <p className="text-sm text-gray-800">
              ¡Hola! ¿Necesitas ayuda? 👋
            </p>
            <div className="absolute bottom-0 right-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-white border-r border-b"></div>
          </div>
        </div>
      )}
    </div>
  )
}