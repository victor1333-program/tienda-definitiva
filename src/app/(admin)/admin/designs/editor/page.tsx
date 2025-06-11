'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import DesignCanvas from '@/components/editor/DesignCanvas'
import { toast } from 'react-hot-toast'

export default function DesignEditorPage() {
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [designData, setDesignData] = useState(null)
  
  const productId = searchParams.get('productId')
  const variantId = searchParams.get('variantId')
  const templateId = searchParams.get('templateId')
  const designId = searchParams.get('designId')

  useEffect(() => {
    if (designId) {
      loadDesign()
    } else {
      setIsLoading(false)
    }
  }, [designId])

  const loadDesign = async () => {
    try {
      const response = await fetch(`/api/designs/${designId}`)
      if (!response.ok) throw new Error('Error al cargar diseño')
      
      const data = await response.json()
      setDesignData(data)
    } catch (error) {
      toast.error('Error al cargar el diseño')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveDesign = async (designData: any) => {
    try {
      const method = designId ? 'PUT' : 'POST'
      const url = designId ? `/api/designs/${designId}` : '/api/designs'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...designData,
          name: `Diseño ${new Date().toLocaleDateString()}`
        })
      })

      if (!response.ok) throw new Error('Error al guardar diseño')
      
      const savedDesign = await response.json()
      toast.success('Diseño guardado correctamente')
      
      // Actualizar URL si es un diseño nuevo
      if (!designId) {
        window.history.replaceState(
          null, 
          '', 
          `?designId=${savedDesign.id}${productId ? `&productId=${productId}` : ''}${variantId ? `&variantId=${variantId}` : ''}`
        )
      }
    } catch (error) {
      toast.error('Error al guardar el diseño')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <DesignCanvas
      productId={productId || undefined}
      variantId={variantId || undefined}
      templateId={templateId || undefined}
      onSave={handleSaveDesign}
      initialElements={designData?.elements || []}
    />
  )
}