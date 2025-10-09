"use client"

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Mail, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'expired'>('verifying')
  const [message, setMessage] = useState('')
  const [isResending, setIsResending] = useState(false)
  const [email, setEmail] = useState('')

  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Token de verificación no válido')
      return
    }

    verifyEmail(token)
  }, [token])

  const verifyEmail = async (verificationToken: string) => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: verificationToken }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage(data.message)
        
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          router.push('/auth/signin?message=email-verified')
        }, 3000)
      } else {
        if (data.message?.includes('expirado')) {
          setStatus('expired')
        } else {
          setStatus('error')
        }
        setMessage(data.message)
      }
    } catch (error) {
      console.error('Error verifying email:', error)
      setStatus('error')
      setMessage('Error de conexión. Inténtalo de nuevo.')
    }
  }

  const handleResendVerification = async () => {
    if (!email) {
      alert('Por favor, ingresa tu email')
      return
    }

    setIsResending(true)
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()
      alert(data.message)
      
      if (response.ok) {
        setEmail('') // Limpiar el campo
      }
    } catch (error) {
      console.error('Error resending verification:', error)
      alert('Error al reenviar el email. Inténtalo de nuevo.')
    } finally {
      setIsResending(false)
    }
  }

  const getIcon = () => {
    switch (status) {
      case 'verifying':
        return <RefreshCw className="w-16 h-16 text-blue-500 animate-spin" />
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-500" />
      case 'error':
      case 'expired':
        return <XCircle className="w-16 h-16 text-red-500" />
    }
  }

  const getTitle = () => {
    switch (status) {
      case 'verifying':
        return 'Verificando tu email...'
      case 'success':
        return '¡Email verificado!'
      case 'expired':
        return 'Token expirado'
      case 'error':
        return 'Error de verificación'
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'verifying':
        return 'border-blue-200'
      case 'success':
        return 'border-green-200'
      case 'error':
      case 'expired':
        return 'border-red-200'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className={`shadow-lg ${getStatusColor()}`}>
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              {getIcon()}
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {getTitle()}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              {message}
            </p>

            {status === 'success' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 text-sm">
                  Tu cuenta ha sido activada correctamente. Serás redirigido al login en unos segundos...
                </p>
              </div>
            )}

            {(status === 'expired' || status === 'error') && (
              <div className="space-y-4">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-800">
                      ¿Necesitas un nuevo código?
                    </span>
                  </div>
                  <p className="text-orange-700 text-sm mb-3">
                    Ingresa tu email para recibir un nuevo enlace de verificación
                  </p>
                  
                  <div className="space-y-2">
                    <input
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-orange-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      disabled={isResending}
                    />
                    <Button
                      onClick={handleResendVerification}
                      disabled={isResending || !email}
                      className="w-full"
                      size="sm"
                    >
                      {isResending ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4 mr-2" />
                          Reenviar verificación
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button asChild variant="outline" className="flex-1">
                <Link href="/auth/signin">
                  <Mail className="w-4 h-4 mr-2" />
                  Ir al Login
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/">
                  <Home className="w-4 h-4 mr-2" />
                  Página Principal
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>¿Problemas con la verificación?</p>
          <a 
            href="mailto:soporte@lovilike.es" 
            className="text-orange-600 hover:text-orange-700 font-medium"
          >
            Contacta con soporte
          </a>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-lg border-blue-200">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <RefreshCw className="w-16 h-16 text-blue-500 animate-spin" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Cargando...
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600">Preparando verificación de email...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}