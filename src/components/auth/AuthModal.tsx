"use client"

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Eye, EyeOff, Mail, Lock, User, ArrowLeft } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  mode?: 'login' | 'register'
  onSwitchMode?: (mode: 'login' | 'register') => void
}

export default function AuthModal({ isOpen, onClose, mode: propMode = 'login', onSwitchMode }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot-password'>(propMode)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Close modal with Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false
      })

      if (result?.error) {
        toast.error('Credenciales incorrectas')
      } else {
        toast.success('¡Bienvenido!')
        onClose()
        // Reset form
        setFormData({ email: '', password: '', name: '', confirmPassword: '' })
      }
    } catch (error) {
      toast.error('Error al iniciar sesión')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    if (formData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      })

      if (response.ok) {
        toast.success('Cuenta creada exitosamente')
        setMode('login')
        setFormData({ ...formData, password: '', confirmPassword: '' })
      } else {
        const data = await response.json()
        toast.error(data.message || 'Error al crear la cuenta')
      }
    } catch (error) {
      toast.error('Error al crear la cuenta')
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email
        })
      })

      if (response.ok) {
        toast.success('Se ha enviado un enlace de recuperación a tu email')
        setMode('login')
      } else {
        const data = await response.json()
        toast.error(data.message || 'Error al enviar el email')
      }
    } catch (error) {
      toast.error('Error al enviar el email de recuperación')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/25 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden border border-gray-200 animate-in slide-in-from-bottom-4 duration-300"
           onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors bg-white/10 rounded-full p-1"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            {mode === 'forgot-password' && (
              <button
                onClick={() => setMode('login')}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h2 className="text-2xl font-bold">
                {mode === 'login' && 'Iniciar Sesión'}
                {mode === 'register' && 'Crear Cuenta'}
                {mode === 'forgot-password' && 'Recuperar Contraseña'}
              </h2>
              <p className="text-white/90 mt-1">
                {mode === 'login' && 'Accede a tu cuenta de Lovilike'}
                {mode === 'register' && 'Únete a la familia Lovilike'}
                {mode === 'forgot-password' && 'Te enviaremos un enlace de recuperación'}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form 
          onSubmit={
            mode === 'login' ? handleLogin : 
            mode === 'register' ? handleRegister : 
            handleForgotPassword
          } 
          className="p-6 space-y-6"
        >
          {/* Register - Name Field */}
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Nombre completo *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Tu nombre completo"
                  className="pl-10 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                  required
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Email *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="tu@email.com"
                className="pl-10 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                required
              />
            </div>
          </div>

          {/* Password Field - Not shown in forgot password mode */}
          {mode !== 'forgot-password' && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Contraseña *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Tu contraseña"
                  className="pl-10 pr-10 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {mode === 'register' && (
                <p className="text-xs text-gray-600 mt-1">
                  Mínimo 6 caracteres
                </p>
              )}
            </div>
          )}

          {/* Confirm Password - Only for register */}
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Confirmar contraseña *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirma tu contraseña"
                  className="pl-10 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                  required
                />
              </div>
            </div>
          )}

          {/* Forgot Password Link - Only for login */}
          {mode === 'login' && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => setMode('forgot-password')}
                className="text-sm text-orange-600 hover:text-orange-700 transition-colors font-medium"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 shadow-lg"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Procesando...
              </div>
            ) : (
              <>
                {mode === 'login' && 'Iniciar Sesión'}
                {mode === 'register' && 'Crear Cuenta'}
                {mode === 'forgot-password' && 'Enviar Enlace'}
              </>
            )}
          </Button>

          {/* Switch Mode */}
          {mode !== 'forgot-password' && (
            <div className="text-center">
              <p className="text-gray-700">
                {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
                <button
                  type="button"
                  onClick={() => {
                    const newMode = mode === 'login' ? 'register' : 'login'
                    setMode(newMode)
                    if (onSwitchMode && newMode !== 'forgot-password') {
                      onSwitchMode(newMode)
                    }
                  }}
                  className="text-orange-600 hover:text-orange-700 font-semibold ml-1 transition-colors"
                >
                  {mode === 'login' ? 'Regístrate aquí' : 'Inicia sesión'}
                </button>
              </p>
            </div>
          )}

          {/* Social Login - Only for login and register */}
          {mode !== 'forgot-password' && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-600 font-medium">O continúa con</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => signIn('google')}
                  className="flex items-center justify-center gap-2 py-3 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="font-medium">Google</span>
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => signIn('facebook')}
                  className="flex items-center justify-center gap-2 py-3 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                >
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span className="font-medium">Facebook</span>
                </Button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  )
}