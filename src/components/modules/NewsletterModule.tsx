"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, CheckCircle } from "lucide-react"

interface NewsletterProps {
  title: string
  subtitle: string
  placeholder: string
  buttonText: string
  successMessage: string
  backgroundColor?: string
  style: 'simple' | 'centered' | 'split'
  includePrivacyText: boolean
}

export default function NewsletterModule(props: NewsletterProps) {
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simular suscripción
    setTimeout(() => {
      setIsSubscribed(true)
      setIsLoading(false)
      setEmail('')
    }, 1000)
  }

  if (props.style === 'split') {
    return (
      <section 
        className="py-16 px-4 sm:px-6 lg:px-8"
        style={{ backgroundColor: props.backgroundColor || '#f9fafb' }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {props.title}
              </h2>
              {props.subtitle && (
                <p className="text-lg text-gray-600 mb-8">
                  {props.subtitle}
                </p>
              )}
              
              {isSubscribed ? (
                <div className="flex items-center gap-3 text-green-600">
                  <CheckCircle className="w-6 h-6" />
                  <span className="font-medium">{props.successMessage}</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex gap-3">
                    <Input
                      type="email"
                      placeholder={props.placeholder}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="flex-1"
                    />
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-6"
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <Mail className="w-4 h-4 mr-2" />
                          {props.buttonText}
                        </>
                      )}
                    </Button>
                  </div>
                  {props.includePrivacyText && (
                    <p className="text-xs text-gray-500">
                      Al suscribirte, aceptas recibir emails de marketing. Puedes darte de baja en cualquier momento.
                    </p>
                  )}
                </form>
              )}
            </div>

            {/* Visual */}
            <div className="hidden lg:block">
              <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl p-8 text-center">
                <Mail className="w-24 h-24 text-orange-500 mx-auto mb-4" />
                <p className="text-gray-600">Mantente al día con las últimas novedades</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section 
      className="py-16 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: props.backgroundColor || '#f9fafb' }}
    >
      <div className={`max-w-4xl mx-auto ${props.style === 'centered' ? 'text-center' : ''}`}>
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {props.title}
          </h2>
          {props.subtitle && (
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {props.subtitle}
            </p>
          )}
        </div>

        {/* Form */}
        {isSubscribed ? (
          <div className="flex items-center justify-center gap-3 text-green-600">
            <CheckCircle className="w-6 h-6" />
            <span className="font-medium text-lg">{props.successMessage}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <Input
                type="email"
                placeholder={props.placeholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1"
              />
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-orange-500 hover:bg-orange-600 text-white px-8"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    {props.buttonText}
                  </>
                )}
              </Button>
            </div>
            {props.includePrivacyText && (
              <p className="text-xs text-gray-500 max-w-lg mx-auto">
                Al suscribirte, aceptas recibir emails de marketing. Puedes darte de baja en cualquier momento.
              </p>
            )}
          </form>
        )}
      </div>
    </section>
  )
}