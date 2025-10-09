"use client"

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Lock, CheckCircle, XCircle, Home, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { z } from 'zod'

const passwordSchema = z.string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .max(128, 'La contraseña es demasiado larga')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'La contraseña debe tener al menos una mayúscula, una minúscula y un número')

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'form' | 'success' | 'error'>('form')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<{password?: string, confirm?: string}>({})

  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Token de recuperación no válido o expirado')
    }
  }, [token])

  const validatePasswords = () => {
    const newErrors: {password?: string, confirm?: string} = {}

    // Validar contraseña
    try {
      passwordSchema.parse(password)
    } catch (error) {
      if (error instanceof z.ZodError) {
        newErrors.password = error.errors[0].message
      }
    }

    // Validar confirmación
    if (password !== confirmPassword) {
      newErrors.confirm = 'Las contraseñas no coinciden'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validatePasswords()) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password,
          confirmPassword
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage(data.message)
        
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          router.push('/auth/signin?message=password-reset')
        }, 3000)
      } else {
        setStatus('error')
        setMessage(data.message)
      }
    } catch (error) {
      console.error('Error resetting password:', error)
      setStatus('error')
      setMessage('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  const getPasswordStrength = (pass: string) => {
    let strength = 0
    if (pass.length >= 8) strength++
    if (/[a-z]/.test(pass)) strength++
    if (/[A-Z]/.test(pass)) strength++
    if (/\d/.test(pass)) strength++
    if (/[^A-Za-z0-9]/.test(pass)) strength++
    return strength
  }

  const getStrengthColor = (strength: number) => {
    if (strength < 2) return 'bg-red-500'
    if (strength < 4) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getStrengthText = (strength: number) => {
    if (strength < 2) return 'Débil'
    if (strength < 4) return 'Media'
    return 'Fuerte'
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-lg border-green-200">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                ¡Contraseña actualizada!
              </CardTitle>
            </CardHeader>
            
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">
                {message}
              </p>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 text-sm">
                  Tu contraseña ha sido cambiada correctamente. Serás redirigido al login en unos segundos...
                </p>
              </div>

              <Button asChild className="w-full">
                <Link href="/auth/signin">
                  Ir al Login
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-lg border-red-200">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <XCircle className="w-16 h-16 text-red-500" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Error de recuperación
              </CardTitle>
            </CardHeader>
            
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">
                {message}
              </p>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">
                  El enlace puede haber expirado o ser inválido. Solicita uno nuevo.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Button asChild variant="outline">
                  <Link href="/auth/forgot-password">
                    Solicitar nuevo enlace
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/">
                    <Home className="w-4 h-4 mr-2" />
                    Página Principal
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const passwordStrength = getPasswordStrength(password)

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <Lock className="w-8 h-8 text-orange-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Nueva Contraseña
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Ingresa tu nueva contraseña segura
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nueva contraseña */}
              <div className="space-y-2">
                <Label htmlFor="password">Nueva Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Ingresa tu nueva contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={errors.password ? 'border-red-500' : ''}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm">{errors.password}</p>
                )}
                
                {/* Indicador de fuerza de contraseña */}
                {password && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Fuerza de la contraseña:</span>
                      <span className={`font-medium ${
                        passwordStrength < 2 ? 'text-red-600' :
                        passwordStrength < 4 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {getStrengthText(passwordStrength)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${getStrengthColor(passwordStrength)}`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirmar contraseña */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirma tu nueva contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={errors.confirm ? 'border-red-500' : ''}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirm && (
                  <p className="text-red-500 text-sm">{errors.confirm}</p>
                )}
              </div>

              {/* Requisitos de contraseña */}
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-700 mb-2">Requisitos de contraseña:</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li className={`flex items-center gap-1 ${password.length >= 8 ? 'text-green-600' : ''}`}>
                    <div className={`w-1 h-1 rounded-full ${password.length >= 8 ? 'bg-green-500' : 'bg-gray-400'}`} />
                    Mínimo 8 caracteres
                  </li>
                  <li className={`flex items-center gap-1 ${/[A-Z]/.test(password) ? 'text-green-600' : ''}`}>
                    <div className={`w-1 h-1 rounded-full ${/[A-Z]/.test(password) ? 'bg-green-500' : 'bg-gray-400'}`} />
                    Una letra mayúscula
                  </li>
                  <li className={`flex items-center gap-1 ${/[a-z]/.test(password) ? 'text-green-600' : ''}`}>
                    <div className={`w-1 h-1 rounded-full ${/[a-z]/.test(password) ? 'bg-green-500' : 'bg-gray-400'}`} />
                    Una letra minúscula
                  </li>
                  <li className={`flex items-center gap-1 ${/\d/.test(password) ? 'text-green-600' : ''}`}>
                    <div className={`w-1 h-1 rounded-full ${/\d/.test(password) ? 'bg-green-500' : 'bg-gray-400'}`} />
                    Un número
                  </li>
                </ul>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading || !password || !confirmPassword}
              >
                {isLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
              </Button>
            </form>

            <div className="text-center mt-4">
              <Link 
                href="/auth/signin"
                className="text-sm text-orange-600 hover:text-orange-700"
              >
                Volver al login
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>¿Problemas para cambiar tu contraseña?</p>
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-lg border-blue-200">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                  <RefreshCw className="w-8 h-8 text-orange-600 animate-spin" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Cargando...
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600">Preparando restablecimiento de contraseña...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}