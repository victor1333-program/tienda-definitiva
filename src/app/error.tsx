'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Error capturado:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center">
          <AlertCircle className="h-10 w-10 text-red-400" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">
            Algo salió mal
          </h2>
          <p className="text-slate-400">
            Ha ocurrido un error inesperado. Por favor, intenta de nuevo.
          </p>
          {error.digest && (
            <p className="text-xs text-slate-500 font-mono">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        <div className="flex gap-4 justify-center">
          <Button
            onClick={reset}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            Intentar de nuevo
          </Button>
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            Ir al inicio
          </Button>
        </div>
      </div>
    </div>
  )
}
