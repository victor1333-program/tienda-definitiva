"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function AuthDebugPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    // Recopilar información de debug
    setDebugInfo({
      sessionStatus: status,
      sessionData: session,
      cookies: document.cookie,
      localStorage: typeof window !== 'undefined' ? {
        hasNextAuth: !!localStorage.getItem('nextauth.message'),
        keys: Object.keys(localStorage)
      } : 'N/A',
      userAgent: navigator.userAgent,
      currentUrl: window.location.href,
      timestamp: new Date().toISOString()
    })
  }, [session, status])

  const testAdminAccess = async () => {
    try {
      const response = await fetch('/api/admin/test', {
        method: 'GET',
        credentials: 'include'
      })
      
      const result = await response.json()
      console.log('Test admin access result:', result)
      
      if (response.ok) {
        alert('✅ Acceso admin exitoso. Puedes acceder a /admin')
        router.push('/admin')
      } else {
        alert(`❌ Error de acceso: ${result.error}`)
      }
    } catch (error) {
      console.error('Error testing admin access:', error)
      alert('❌ Error de conexión')
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">🔍 Debug de Autenticación</h1>
        
        <div className="grid gap-6">
          {/* Status de sesión */}
          <div className="bg-slate-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">📊 Estado de la Sesión</h2>
            <div className="space-y-2">
              <p><strong>Status:</strong> <span className={`px-2 py-1 rounded ${status === 'authenticated' ? 'bg-green-600' : status === 'loading' ? 'bg-yellow-600' : 'bg-red-600'}`}>{status}</span></p>
              <p><strong>Usuario autenticado:</strong> {session?.user ? '✅ SÍ' : '❌ NO'}</p>
              {session?.user && (
                <div className="ml-4 space-y-1">
                  <p><strong>Email:</strong> {session.user.email}</p>
                  <p><strong>Nombre:</strong> {session.user.name}</p>
                  <p><strong>Role:</strong> <span className="font-mono bg-slate-700 px-2 py-1 rounded">{(session.user as any).role}</span></p>
                  <p><strong>ID:</strong> <span className="font-mono text-sm">{(session.user as any).id}</span></p>
                </div>
              )}
            </div>
          </div>

          {/* Información técnica */}
          <div className="bg-slate-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">🔧 Información Técnica</h2>
            <div className="bg-slate-900 p-4 rounded overflow-x-auto">
              <pre className="text-sm text-green-400">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          </div>

          {/* Acciones */}
          <div className="bg-slate-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">⚡ Acciones</h2>
            <div className="space-y-4">
              <button
                onClick={() => router.push('/auth/signin')}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded mr-4"
              >
                🔐 Ir a Login
              </button>
              
              <button
                onClick={() => router.push('/admin')}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded mr-4"
              >
                🏠 Ir a Admin
              </button>
              
              <button
                onClick={testAdminAccess}
                className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded mr-4"
              >
                🧪 Test Acceso Admin
              </button>

              <button
                onClick={() => window.location.reload()}
                className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded"
              >
                🔄 Recargar Página
              </button>
            </div>
          </div>

          {/* Instrucciones */}
          <div className="bg-slate-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">📋 Instrucciones</h2>
            <div className="space-y-2 text-sm">
              <p>1. <strong>Si el status es "authenticated":</strong> Deberías poder acceder a /admin</p>
              <p>2. <strong>Si el role es "SUPER_ADMIN":</strong> Tienes permisos completos</p>
              <p>3. <strong>Si ves cookies de sesión:</strong> NextAuth está funcionando</p>
              <p>4. <strong>Si "Test Acceso Admin" falla:</strong> Hay problema en el middleware</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}