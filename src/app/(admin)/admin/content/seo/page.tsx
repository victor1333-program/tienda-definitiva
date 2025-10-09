"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { 
  Search, Save, Eye, AlertCircle, CheckCircle, 
  Globe, TrendingUp, FileText, Image, Link as LinkIcon,
  Plus, Trash2, Edit3
} from "lucide-react"
import { toast } from "react-hot-toast"

interface SEOConfig {
  global: {
    siteName: string
    siteDescription: string
    defaultTitle: string
    titleTemplate: string
    defaultMetaDescription: string
    keywords: string[]
    author: string
    language: string
    robots: string
    canonicalUrl: string
  }
  social: {
    ogImage: string
    twitterCard: string
    twitterSite: string
    facebookAppId: string
  }
  analytics: {
    googleAnalyticsId: string
    googleTagManagerId: string
    googleSearchConsole: string
    bingWebmasterTools: string
  }
  structured: {
    organizationSchema: boolean
    breadcrumbSchema: boolean
    productSchema: boolean
    reviewSchema: boolean
  }
}

interface PageSEO {
  id: string
  path: string
  title: string
  description: string
  keywords: string[]
  ogImage?: string
  noindex: boolean
  nofollow: boolean
  canonical?: string
}

export default function SEOPage() {
  const [config, setConfig] = useState<SEOConfig>({
    global: {
      siteName: 'Lovilike Personalizados',
      siteDescription: 'Tienda online de productos personalizados para bodas, eventos y celebraciones especiales',
      defaultTitle: 'Lovilike Personalizados - Productos únicos para momentos especiales',
      titleTemplate: '%s | Lovilike Personalizados',
      defaultMetaDescription: 'Descubre nuestra colección de productos personalizados para bodas, comuniones, baby showers y más. Calidad premium y entrega rápida.',
      keywords: ['productos personalizados', 'bodas', 'eventos', 'comuniones', 'baby shower', 'textil personalizado'],
      author: 'Lovilike Team',
      language: 'es-ES',
      robots: 'index,follow',
      canonicalUrl: 'https://lovilike.es'
    },
    social: {
      ogImage: '/img/social-preview.jpg',
      twitterCard: 'summary_large_image',
      twitterSite: '@lovilike',
      facebookAppId: ''
    },
    analytics: {
      googleAnalyticsId: '',
      googleTagManagerId: '',
      googleSearchConsole: '',
      bingWebmasterTools: ''
    },
    structured: {
      organizationSchema: true,
      breadcrumbSchema: true,
      productSchema: true,
      reviewSchema: true
    }
  })

  const [pages, setPages] = useState<PageSEO[]>([
    {
      id: '1',
      path: '/',
      title: 'Inicio - Productos Personalizados',
      description: 'Descubre nuestra colección de productos personalizados para eventos especiales',
      keywords: ['inicio', 'productos personalizados', 'tienda online'],
      noindex: false,
      nofollow: false
    },
    {
      id: '2', 
      path: '/productos',
      title: 'Catálogo de Productos Personalizados',
      description: 'Explora nuestro catálogo completo de productos personalizados para bodas, comuniones y eventos',
      keywords: ['catálogo', 'productos', 'personalización'],
      noindex: false,
      nofollow: false
    }
  ])

  const [newKeyword, setNewKeyword] = useState('')
  const [editingPage, setEditingPage] = useState<PageSEO | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const updateConfig = (section: keyof SEOConfig, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const addKeyword = () => {
    if (newKeyword.trim() && !config.global.keywords.includes(newKeyword.trim())) {
      updateConfig('global', 'keywords', [...config.global.keywords, newKeyword.trim()])
      setNewKeyword('')
    }
  }

  const removeKeyword = (keyword: string) => {
    updateConfig('global', 'keywords', config.global.keywords.filter(k => k !== keyword))
  }

  const savePage = (page: PageSEO) => {
    if (editingPage?.id) {
      setPages(prev => prev.map(p => p.id === page.id ? page : p))
    } else {
      setPages(prev => [...prev, { ...page, id: Date.now().toString() }])
    }
    setEditingPage(null)
    toast.success('Página guardada correctamente')
  }

  const deletePage = (pageId: string) => {
    if (confirm('¿Estás seguro de eliminar esta configuración SEO?')) {
      setPages(prev => prev.filter(p => p.id !== pageId))
      toast.success('Página eliminada')
    }
  }

  const saveSEOConfig = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/content/seo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, pages })
      })

      if (response.ok) {
        toast.success('Configuración SEO guardada correctamente')
      } else {
        throw new Error('Error al guardar configuración')
      }
    } catch (error) {
      console.error('Error saving SEO config:', error)
      toast.error('Error al guardar la configuración SEO')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Search className="w-8 h-8 text-orange-500" />
            Configuración SEO
          </h1>
          <p className="text-gray-600 mt-1">
            Optimiza tu sitio web para motores de búsqueda
          </p>
        </div>
        <Button onClick={saveSEOConfig} disabled={isSaving}>
          {isSaving ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Guardar Configuración
        </Button>
      </div>

      <Tabs defaultValue="global" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="global">Global</TabsTrigger>
          <TabsTrigger value="social">Redes Sociales</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="structured">Datos Estructurados</TabsTrigger>
          <TabsTrigger value="pages">Páginas</TabsTrigger>
        </TabsList>

        {/* Configuración Global */}
        <TabsContent value="global">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Configuración Global SEO
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="siteName">Nombre del Sitio</Label>
                  <Input
                    id="siteName"
                    value={config.global.siteName}
                    onChange={(e) => updateConfig('global', 'siteName', e.target.value)}
                    placeholder="Nombre de tu sitio web"
                  />
                </div>
                <div>
                  <Label htmlFor="canonicalUrl">URL Canónica</Label>
                  <Input
                    id="canonicalUrl"
                    value={config.global.canonicalUrl}
                    onChange={(e) => updateConfig('global', 'canonicalUrl', e.target.value)}
                    placeholder="https://tusitio.com"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="siteDescription">Descripción del Sitio</Label>
                  <Textarea
                    id="siteDescription"
                    value={config.global.siteDescription}
                    onChange={(e) => updateConfig('global', 'siteDescription', e.target.value)}
                    placeholder="Describe tu sitio web..."
                  />
                </div>
                <div>
                  <Label htmlFor="defaultTitle">Título por Defecto</Label>
                  <Input
                    id="defaultTitle"
                    value={config.global.defaultTitle}
                    onChange={(e) => updateConfig('global', 'defaultTitle', e.target.value)}
                    placeholder="Título principal del sitio"
                  />
                </div>
                <div>
                  <Label htmlFor="titleTemplate">Plantilla de Título</Label>
                  <Input
                    id="titleTemplate"
                    value={config.global.titleTemplate}
                    onChange={(e) => updateConfig('global', 'titleTemplate', e.target.value)}
                    placeholder="%s | Nombre del Sitio"
                  />
                </div>
              </div>

              {/* Keywords */}
              <div>
                <Label>Palabras Clave Globales</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    placeholder="Agregar palabra clave..."
                    onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                  />
                  <Button onClick={addKeyword}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {config.global.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm"
                    >
                      {keyword}
                      <button
                        onClick={() => removeKeyword(keyword)}
                        className="hover:text-orange-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Redes Sociales */}
        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="w-5 h-5" />
                Redes Sociales y Open Graph
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="ogImage">Imagen Open Graph</Label>
                  <Input
                    id="ogImage"
                    value={config.social.ogImage}
                    onChange={(e) => updateConfig('social', 'ogImage', e.target.value)}
                    placeholder="/img/social-preview.jpg"
                  />
                </div>
                <div>
                  <Label htmlFor="twitterSite">Twitter Site</Label>
                  <Input
                    id="twitterSite"
                    value={config.social.twitterSite}
                    onChange={(e) => updateConfig('social', 'twitterSite', e.target.value)}
                    placeholder="@tusitio"
                  />
                </div>
                <div>
                  <Label htmlFor="twitterCard">Tipo de Twitter Card</Label>
                  <select
                    id="twitterCard"
                    value={config.social.twitterCard}
                    onChange={(e) => updateConfig('social', 'twitterCard', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="summary">Summary</option>
                    <option value="summary_large_image">Summary Large Image</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="facebookAppId">Facebook App ID</Label>
                  <Input
                    id="facebookAppId"
                    value={config.social.facebookAppId}
                    onChange={(e) => updateConfig('social', 'facebookAppId', e.target.value)}
                    placeholder="123456789"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Analytics y Herramientas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
                  <Input
                    id="googleAnalyticsId"
                    value={config.analytics.googleAnalyticsId}
                    onChange={(e) => updateConfig('analytics', 'googleAnalyticsId', e.target.value)}
                    placeholder="GA-XXXXXXXXX"
                  />
                </div>
                <div>
                  <Label htmlFor="googleTagManagerId">Google Tag Manager ID</Label>
                  <Input
                    id="googleTagManagerId"
                    value={config.analytics.googleTagManagerId}
                    onChange={(e) => updateConfig('analytics', 'googleTagManagerId', e.target.value)}
                    placeholder="GTM-XXXXXXX"
                  />
                </div>
                <div>
                  <Label htmlFor="googleSearchConsole">Google Search Console</Label>
                  <Input
                    id="googleSearchConsole"
                    value={config.analytics.googleSearchConsole}
                    onChange={(e) => updateConfig('analytics', 'googleSearchConsole', e.target.value)}
                    placeholder="código de verificación"
                  />
                </div>
                <div>
                  <Label htmlFor="bingWebmasterTools">Bing Webmaster Tools</Label>
                  <Input
                    id="bingWebmasterTools"
                    value={config.analytics.bingWebmasterTools}
                    onChange={(e) => updateConfig('analytics', 'bingWebmasterTools', e.target.value)}
                    placeholder="código de verificación"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Datos Estructurados */}
        <TabsContent value="structured">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Datos Estructurados (Schema.org)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {Object.entries(config.structured).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <Label className="capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </Label>
                      <p className="text-sm text-gray-600">
                        {key === 'organizationSchema' && 'Información de la empresa'}
                        {key === 'breadcrumbSchema' && 'Migas de pan para navegación'}
                        {key === 'productSchema' && 'Datos estructurados de productos'}
                        {key === 'reviewSchema' && 'Reseñas y valoraciones'}
                      </p>
                    </div>
                    <Switch
                      checked={value}
                      onCheckedChange={(checked) => updateConfig('structured', key, checked)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Páginas */}
        <TabsContent value="pages">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="w-5 h-5" />
                SEO por Páginas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={() => setEditingPage({ 
                  id: '', 
                  path: '', 
                  title: '', 
                  description: '', 
                  keywords: [], 
                  noindex: false, 
                  nofollow: false 
                })}>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Página
                </Button>

                <div className="space-y-3">
                  {pages.map((page) => (
                    <div key={page.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{page.title}</h3>
                          <p className="text-sm text-gray-600">{page.path}</p>
                          <p className="text-sm text-gray-500 mt-1">{page.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingPage(page)}
                          >
                            <Edit3 className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deletePage(page.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de edición de página (simplificado) */}
      {editingPage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingPage.id ? 'Editar' : 'Agregar'} Página SEO
            </h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="pagePath">Ruta de la Página</Label>
                <Input
                  id="pagePath"
                  value={editingPage.path}
                  onChange={(e) => setEditingPage(prev => prev ? {...prev, path: e.target.value} : null)}
                  placeholder="/ruta-de-la-pagina"
                />
              </div>
              
              <div>
                <Label htmlFor="pageTitle">Título SEO</Label>
                <Input
                  id="pageTitle"
                  value={editingPage.title}
                  onChange={(e) => setEditingPage(prev => prev ? {...prev, title: e.target.value} : null)}
                  placeholder="Título optimizado para SEO"
                />
              </div>
              
              <div>
                <Label htmlFor="pageDescription">Meta Descripción</Label>
                <Textarea
                  id="pageDescription"
                  value={editingPage.description}
                  onChange={(e) => setEditingPage(prev => prev ? {...prev, description: e.target.value} : null)}
                  placeholder="Descripción para motores de búsqueda (160 caracteres max)"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setEditingPage(null)}>
                Cancelar
              </Button>
              <Button onClick={() => editingPage && savePage(editingPage)}>
                Guardar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}