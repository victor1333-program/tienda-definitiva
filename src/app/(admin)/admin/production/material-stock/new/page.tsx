'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function NewMaterialStockRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/admin/production/materials')
  }, [router])

  return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirigiendo a gestión de materiales...</p>
        <p className="text-sm text-gray-500 mt-2">
          Crear nuevo material desde la página principal
        </p>
      </div>
    </div>
  )
}