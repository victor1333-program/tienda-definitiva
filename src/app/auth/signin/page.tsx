"use client"

import { useState, useEffect } from "react"
import { signIn, getCsrfToken } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, AlertCircle } from "lucide-react"

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [csrfToken, setCsrfToken] = useState("")

  useEffect(() => {
    getCsrfToken().then(token => {
      setCsrfToken(token || "")
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    
    console.log('🚀 Iniciando proceso de login...')
    console.log(`📧 Email: ${email}`)

    try {
      console.log('🔑 Llamando a signIn...')
      
      // Usar NextAuth con callbackUrl para redirección
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/admin"
      })

      console.log('📋 Resultado del signIn:', result)

      if (result?.error) {
        console.error('❌ Error de autenticación:', result.error)
        setError(`Error de autenticación: ${result.error}`)
        return
      } 
      
      if (result?.ok) {
        console.log('✅ Login exitoso, redirigiendo inmediatamente...')
        setIsSuccess(true)
        
        // Redirección inmediata usando window.location
        // Esto evita que NextAuth haga redirecciones automáticas
        window.location.replace('/admin')
        
        return
      }
      
      console.error('❌ Resultado inesperado:', result)
      setError("Error inesperado en la autenticación.")
      
    } catch (error) {
      console.error('❌ Error en handleSubmit:', error)
      setError("Error al iniciar sesión. Inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-4 shadow-2xl hover:scale-105 transition-transform duration-300 p-2">
            <img 
              src="/Social Logo.png" 
              alt="Lovilike Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Lovilike Admin</h1>
          <p className="text-slate-400">Panel de administración</p>
          <div className="mt-4 w-16 h-0.5 bg-gradient-to-r from-orange-500 to-orange-600 mx-auto rounded-full"></div>
        </div>

        <Card className="shadow-2xl border border-slate-700 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-xl font-bold text-white">
              🔐 Acceso Administrativo
            </CardTitle>
            <CardDescription className="text-slate-300">
              Solo para personal autorizado
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-slate-200">
                  Correo electrónico
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@lovilike.es"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-orange-500"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-slate-200">
                  Contraseña
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 pr-12 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-orange-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-700/50 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className={`w-full h-12 text-white font-medium shadow-lg transition-all duration-300 ${
                  isSuccess 
                    ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700' 
                    : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
                }`}
                disabled={isLoading || isSuccess}
              >
                {isSuccess ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                    ✅ Acceso autorizado. Redirigiendo...
                  </div>
                ) : isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Iniciando sesión...
                  </div>
                ) : (
                  "Iniciar Sesión"
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-700 space-y-4">
              <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
                <h4 className="font-medium text-yellow-300 mb-2">⚠️ Importante:</h4>
                <div className="text-sm text-yellow-200">
                  <p>Esta página es solo para administradores y personal autorizado.</p>
                  <p>Si eres un cliente, utiliza los botones de "Iniciar Sesión" del menú principal.</p>
                </div>
              </div>
              
              <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
                <h4 className="font-medium text-blue-300 mb-2">🔑 Credenciales de administrador:</h4>
                <div className="text-sm text-blue-200 space-y-1">
                  <p><strong>Email:</strong> admin@lovilike.es</p>
                  <p><strong>Contraseña:</strong> admin123</p>
                  <p className="text-xs text-blue-300 mt-2">⚠️ Cambia esta contraseña después del primer acceso</p>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link 
                href="/"
                className="text-sm text-slate-400 hover:text-orange-400 transition-colors inline-flex items-center gap-1"
              >
                ← Volver a la página principal
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}