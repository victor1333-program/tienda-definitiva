"use client"

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Mail, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

function VerifyEmailChangeContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [message, setMessage] = useState('')

  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Token de verificación no válido')
      return
    }

    verifyEmailChange(token)
  }, [token])

  const verifyEmailChange = async (verificationToken: string) => {
    try {
      const response = await fetch('/api/user/verify-email-change', {
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
        
        // Redirigir al perfil después de 3 segundos
        setTimeout(() => {
          router.push('/perfil?message=email-changed')
        }, 3000)
      } else {
        setStatus('error')
        setMessage(data.message)
      }
    } catch (error) {
      console.error('Error verifying email change:', error)
      setStatus('error')
      setMessage('Error de conexión. Inténtalo de nuevo.')
    }
  }

  const getIcon = () => {
    switch (status) {
      case 'verifying':
        return <RefreshCw className="w-16 h-16 text-blue-500 animate-spin" />
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-500" />
      case 'error':
        return <XCircle className="w-16 h-16 text-red-500" />
    }
  }

  const getTitle = () => {
    switch (status) {
      case 'verifying':
        return 'Verificando cambio de email...'
      case 'success':
        return '¡Email actualizado!'
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
                  Tu dirección de email ha sido actualizada correctamente. Serás redirigido a tu perfil en unos segundos...
                </p>
              </div>
            )}

            {status === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">
                  El enlace puede haber expirado o ser inválido. Inicia sesión en tu cuenta para solicitar un nuevo cambio de email.
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button asChild variant="outline" className="flex-1">
                <Link href="/perfil">
                  <Mail className="w-4 h-4 mr-2" />
                  Mi Perfil
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

export default function VerifyEmailChangePage() {
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
      <VerifyEmailChangeContent />
    </Suspense>
  )
}