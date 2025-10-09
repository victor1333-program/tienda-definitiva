"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    
    if (!email) {
      setError('Por favor, ingresa tu email')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSubmitted(true)
        setMessage(data.message)
      } else {
        setError(data.message)
      }
    } catch (error) {
      console.error('Error sending reset email:', error)
      setError('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-lg border-green-200">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                ¡Email enviado!
              </CardTitle>
            </CardHeader>
            
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">
                {message}
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-blue-800 text-sm font-medium mb-1">
                      Revisa tu bandeja de entrada
                    </p>
                    <p className="text-blue-700 text-xs">
                      Si no encuentras el email, revisa tu carpeta de spam o correo no deseado. 
                      El enlace expira en 24 horas.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Button asChild className="w-full">
                  <Link href="/auth/signin">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver al Login
                  </Link>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setIsSubmitted(false)
                    setEmail('')
                    setMessage('')
                  }}
                >
                  Enviar a otro email
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-6 text-sm text-gray-500">
            <p>¿No recibiste el email?</p>
            <button 
              onClick={() => {
                setIsSubmitted(false)
                setEmail('')
                setMessage('')
              }}
              className="text-orange-600 hover:text-orange-700 font-medium"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-orange-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              ¿Olvidaste tu contraseña?
            </CardTitle>
            <p className="text-gray-600 mt-2">
              No te preocupes, te enviaremos un enlace para recuperarla
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={error ? 'border-red-500' : ''}
                  disabled={isLoading}
                  autoFocus
                />
                {error && (
                  <p className="text-red-500 text-sm">{error}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Enviando...' : 'Enviar enlace de recuperación'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link 
                href="/auth/signin"
                className="inline-flex items-center text-sm text-orange-600 hover:text-orange-700"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Volver al login
              </Link>
            </div>

            {/* Información adicional */}
            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                ¿Cómo funciona?
              </h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Enviaremos un enlace seguro a tu email</li>
                <li>• El enlace expira en 24 horas</li>
                <li>• Podrás crear una nueva contraseña</li>
                <li>• Tu cuenta se mantendrá segura</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>¿No tienes cuenta?</p>
          <Link 
            href="/auth/register"
            className="text-orange-600 hover:text-orange-700 font-medium"
          >
            Regístrate aquí
          </Link>
        </div>
      </div>
    </div>
  )
}