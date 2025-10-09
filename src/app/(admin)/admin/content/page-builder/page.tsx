"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import PageBuilder from "@/components/admin/content/PageBuilder"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Save, Settings, Eye, Smartphone, Monitor, 
  Tablet, Home, Globe, RefreshCw
} from "lucide-react"
import { toast } from "react-hot-toast"

interface PageConfig {
  id: string
  modules: any[]
  theme: {
    primaryColor: string
    secondaryColor: string
    fontFamily: string
  }
  seo: {
    title: string
    description: string
    keywords: string
  }
}

export default function PageBuilderPage() {
  const { data: session, status } = useSession()
  
  const [pageConfig, setPageConfig] = useState<PageConfig>({
    id: 'homepage',
    modules: [],
    theme: {
      primaryColor: '#f97316',
      secondaryColor: '#1f2937',
      fontFamily: 'Inter'
    },
    seo: {
      title: 'Inicio - Lovilike',
      description: 'Bienvenido a Lovilike - Productos personalizados únicos',
      keywords: 'productos personalizados, regalos, impresión'
    }
  })
  
  const [isLoading, setIsLoading] = useState(true)

  const [isSaving, setIsSaving] = useState(false)
  const [activeDevice, setActiveDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')

  // Cargar configuración inicial
  useEffect(() => {
    const loadConfig = async () => {
      try {
        console.log('🔄 Loading initial config...')
        console.log('👤 Session status:', status)
        console.log('👤 Session data:', session)
        
        const response = await fetch('/api/content/pages/homepage', {
          credentials: 'include'
        })
        console.log('📡 GET Response status:', response.status)
        console.log('📡 GET Response ok:', response.ok)
        
        if (response.ok) {
          const data = await response.json()
          console.log('📥 Loaded data:', data)
          if (data.success && data.data) {
            console.log('✅ Setting pageConfig to:', data.data)
            setPageConfig(data.data)
          }
        } else {
          console.log('❌ Failed to load config')
        }
      } catch (error) {
        console.error('💥 Error loading page config:', error)
        toast.error('Error al cargar la configuración')
      } finally {
        setIsLoading(false)
      }
    }

    // Solo cargar cuando el status de sesión esté resuelto
    if (status !== 'loading') {
      loadConfig()
    }
  }, [status, session])

  const handleSave = async (config: PageConfig) => {
    console.log('🔄 handleSave called with config:', config)
    console.log('👤 Session at save time:', session)
    console.log('👤 Session status at save time:', status)
    setIsSaving(true)
    try {
      console.log('🌐 Making PUT request to /api/content/pages/homepage')
      const response = await fetch('/api/content/pages/homepage', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
        credentials: 'include'
      })

      console.log('📡 Response status:', response.status)
      console.log('📡 Response ok:', response.ok)

      if (response.ok) {
        const responseData = await response.json()
        console.log('✅ Save successful:', responseData)
        setPageConfig(config)
        toast.success('Página guardada correctamente')
      } else {
        const errorData = await response.json()
        console.log('❌ Save failed:', errorData)
        throw new Error(errorData.error || 'Error al guardar')
      }
    } catch (error) {
      console.error('💥 Error saving page:', error)
      toast.error('Error al guardar la página')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePreview = () => {
    // Abrir vista previa en nueva ventana
    const previewUrl = `/preview/homepage?timestamp=${Date.now()}`
    window.open(previewUrl, '_blank')
  }

  const handlePublish = async () => {
    try {
      const response = await fetch('/api/content/pages/homepage/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pageConfig),
        credentials: 'include'
      })

      if (response.ok) {
        toast.success('Página publicada correctamente')
      } else {
        throw new Error('Error al publicar')
      }
    } catch (error) {
      console.error('Error publishing page:', error)
      toast.error('Error al publicar la página')
    }
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              🏗️ Page Builder
              <Badge variant="outline">Página Principal</Badge>
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Construye y personaliza la página principal de tu sitio web
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Device Preview Selector */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <Button
                size="sm"
                variant={activeDevice === 'desktop' ? 'default' : 'ghost'}
                onClick={() => setActiveDevice('desktop')}
                className="h-8"
              >
                <Monitor className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant={activeDevice === 'tablet' ? 'default' : 'ghost'}
                onClick={() => setActiveDevice('tablet')}
                className="h-8"
              >
                <Tablet className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant={activeDevice === 'mobile' ? 'default' : 'ghost'}
                onClick={() => setActiveDevice('mobile')}
                className="h-8"
              >
                <Smartphone className="h-4 w-4" />
              </Button>
            </div>

            <Button variant="outline" onClick={handlePreview}>
              <Eye className="h-4 w-4 mr-2" />
              Vista Previa
            </Button>


          </div>
        </div>
      </div>

      {/* Page Builder */}
      <div className="flex-1">
        <PageBuilder
          pageConfig={pageConfig}
          onSave={handleSave}
          onPublish={handlePublish}
          previewMode={false}
          isSaving={isSaving}
          setIsSaving={setIsSaving}
        />
      </div>

      {/* Status Bar */}
      <div className="bg-gray-50 border-t border-gray-200 px-6 py-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              Módulos: <span className="font-medium">{pageConfig.modules.length}</span>
            </span>
            <span className="text-gray-600">
              Dispositivo: <span className="font-medium capitalize">{activeDevice}</span>
            </span>
            <span className="text-gray-600">
              Guardado: <span className="font-medium">Hace 2 minutos</span>
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              ✅ Configuración válida
            </Badge>
            <Button size="sm" variant="ghost">
              <RefreshCw className="h-3 w-3 mr-1" />
              Actualizar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}