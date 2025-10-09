"use client"

import { useState, useRef, memo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ColoredSwitch } from "@/components/ui/ColoredSwitch"
import ThemeManager from "@/components/admin/content/ThemeManager"
import { 
  Palette, Upload, Save, Eye, RefreshCw, Settings,
  Type, Image as ImageIcon, Smartphone, Monitor, Tablet,
  Download, Copy, RotateCcw, Zap, Globe, ArrowLeft
} from "lucide-react"
import { toast } from "react-hot-toast"

interface ThemeConfig {
  id: string
  name: string
  
  // Branding
  logo: {
    primary: string // Logo principal
    secondary?: string // Logo alternativo (blanco/oscuro)
    favicon: string
    width: number
    height: number
  }
  
  // Colores
  colors: {
    primary: string // Color principal de la marca
    secondary: string // Color secundario
    accent: string // Color de acento
    success: string
    warning: string
    error: string
    
    // Neutros
    gray: {
      50: string
      100: string
      200: string
      300: string
      400: string
      500: string
      600: string
      700: string
      800: string
      900: string
    }
    
    // Fondos
    background: string
    surface: string
    
    // Textos
    textPrimary: string
    textSecondary: string
    textMuted: string
  }
  
  // Tipografía
  typography: {
    fontFamily: {
      sans: string[]
      serif: string[]
      mono: string[]
    }
    fontSize: {
      xs: string
      sm: string
      base: string
      lg: string
      xl: string
      '2xl': string
      '3xl': string
      '4xl': string
      '5xl': string
      '6xl': string
    }
    fontWeight: {
      normal: number
      medium: number
      semibold: number
      bold: number
    }
    lineHeight: {
      tight: number
      normal: number
      relaxed: number
    }
  }
  
  // Espaciado
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
    '2xl': string
  }
  
  // Bordes y sombras
  borderRadius: {
    none: string
    sm: string
    md: string
    lg: string
    full: string
  }
  
  shadows: {
    sm: string
    md: string
    lg: string
    xl: string
  }
  
  // Configuración específica del sitio
  site: {
    headerStyle: 'simple' | 'centered' | 'mega'
    footerStyle: 'minimal' | 'detailed' | 'newsletter'
    buttonStyle: 'rounded' | 'sharp' | 'pill'
    cardStyle: 'flat' | 'shadow' | 'border'
    animationsEnabled: boolean
    darkModeEnabled: boolean
  }
  
  // Metadata
  isActive: boolean
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

const ThemePage = memo(function ThemePage() {
  const [currentView, setCurrentView] = useState<'manager' | 'editor'>('manager')
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null)
  
  // Temas de ejemplo
  const [themes, setThemes] = useState([
    {
      id: 'lovilike-theme',
      name: 'Lovilike Original',
      description: 'Tema principal de Lovilike con colores naranja y gris',
      primaryColor: '#f97316',
      secondaryColor: '#1f2937',
      logoUrl: '/img/Logo.png',
      isActive: true,
      isDefault: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: new Date().toISOString(),
      websites: 1
    },
    {
      id: 'ocean-theme',
      name: 'Ocean Blue',
      description: 'Tema elegante con tonos azules para marca premium',
      primaryColor: '#0ea5e9',
      secondaryColor: '#0f172a',
      logoUrl: '',
      isActive: false,
      isDefault: false,
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
      websites: 0
    }
  ])
  
  const [theme, setTheme] = useState<ThemeConfig>({
    id: 'lovilike-theme',
    name: 'Lovilike Theme',
    
    logo: {
      primary: '/img/Logo.png',
      secondary: '/img/Logo_blanco.png',
      favicon: '/favicon.ico',
      width: 180,
      height: 60
    },
    
    colors: {
      primary: '#f97316', // Orange-500
      secondary: '#1f2937', // Gray-800
      accent: '#3b82f6', // Blue-500
      success: '#10b981', // Emerald-500
      warning: '#f59e0b', // Amber-500
      error: '#ef4444', // Red-500
      
      gray: {
        50: '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        400: '#9ca3af',
        500: '#6b7280',
        600: '#4b5563',
        700: '#374151',
        800: '#1f2937',
        900: '#111827'
      },
      
      background: '#ffffff',
      surface: '#f9fafb',
      
      textPrimary: '#111827',
      textSecondary: '#4b5563',
      textMuted: '#9ca3af'
    },
    
    typography: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['ui-serif', 'Georgia', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'monospace']
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        '6xl': '3.75rem'
      },
      fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      },
      lineHeight: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75
      }
    },
    
    spacing: {
      xs: '0.5rem',
      sm: '1rem',
      md: '1.5rem',
      lg: '2rem',
      xl: '3rem',
      '2xl': '4rem'
    },
    
    borderRadius: {
      none: '0px',
      sm: '0.25rem',
      md: '0.5rem',
      lg: '0.75rem',
      full: '9999px'
    },
    
    shadows: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
      xl: '0 25px 50px -12px rgb(0 0 0 / 0.25)'
    },
    
    site: {
      headerStyle: 'centered',
      footerStyle: 'detailed',
      buttonStyle: 'rounded',
      cardStyle: 'shadow',
      animationsEnabled: true,
      darkModeEnabled: false
    },
    
    isActive: true,
    isDefault: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: new Date().toISOString()
  })

  const [activeTab, setActiveTab] = useState<'branding' | 'colors' | 'typography' | 'layout' | 'preview'>('branding')
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  
  const logoInputRef = useRef<HTMLInputElement>(null)
  const logoSecondaryInputRef = useRef<HTMLInputElement>(null)
  const faviconInputRef = useRef<HTMLInputElement>(null)

  // Predefined color palettes
  const colorPalettes = [
    {
      name: 'Lovilike (Actual)',
      colors: {
        primary: '#f97316',
        secondary: '#1f2937',
        accent: '#3b82f6'
      }
    },
    {
      name: 'Ocean Blue',
      colors: {
        primary: '#0ea5e9',
        secondary: '#0f172a',
        accent: '#06b6d4'
      }
    },
    {
      name: 'Forest Green',
      colors: {
        primary: '#10b981',
        secondary: '#1f2937',
        accent: '#059669'
      }
    },
    {
      name: 'Royal Purple',
      colors: {
        primary: '#8b5cf6',
        secondary: '#1e1b4b',
        accent: '#a855f7'
      }
    },
    {
      name: 'Sunset Orange',
      colors: {
        primary: '#f59e0b',
        secondary: '#78350f',
        accent: '#fb923c'
      }
    },
    {
      name: 'Rose Pink',
      colors: {
        primary: '#ec4899',
        secondary: '#831843',
        accent: '#f472b6'
      }
    }
  ]

  // Google Fonts populares
  const googleFonts = [
    'Inter',
    'Roboto',
    'Poppins',
    'Montserrat',
    'Open Sans',
    'Lato',
    'Source Sans Pro',
    'Nunito',
    'Raleway',
    'Playfair Display',
    'Merriweather',
    'Lora'
  ]

  const updateTheme = (updates: Partial<ThemeConfig>) => {
    setTheme(prev => ({
      ...prev,
      ...updates,
      updatedAt: new Date().toISOString()
    }))
  }

  const updateColors = (colorUpdates: Partial<ThemeConfig['colors']>) => {
    updateTheme({
      colors: {
        ...theme.colors,
        ...colorUpdates
      }
    })
  }

  const updateTypography = (typographyUpdates: Partial<ThemeConfig['typography']>) => {
    updateTheme({
      typography: {
        ...theme.typography,
        ...typographyUpdates
      }
    })
  }

  const updateSite = (siteUpdates: Partial<ThemeConfig['site']>) => {
    updateTheme({
      site: {
        ...theme.site,
        ...siteUpdates
      }
    })
  }

  const applyColorPalette = (palette: typeof colorPalettes[0]) => {
    updateColors(palette.colors)
    toast.success(`Paleta "${palette.name}" aplicada`)
  }

  const handleLogoUpload = async (file: File, type: 'primary' | 'secondary' | 'favicon') => {
    setIsUploading(true)
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'branding')

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        const data = result.data || result
        
        updateTheme({
          logo: {
            ...theme.logo,
            [type]: data.secure_url || data.url
          }
        })
        
        toast.success(`${type === 'primary' ? 'Logo principal' : type === 'secondary' ? 'Logo secundario' : 'Favicon'} subido correctamente`)
      } else {
        let errorData
        try {
          errorData = await response.json()
        } catch (e) {
          errorData = { error: `Error ${response.status}: ${response.statusText}` }
        }
        throw new Error(errorData.error || 'Error al subir archivo')
      }
    } catch (error) {
      console.error('Error uploading logo:', error)
      toast.error('Error al subir el archivo')
    } finally {
      setIsUploading(false)
    }
  }

  const saveTheme = async () => {
    setIsSaving(true)
    
    try {
      const response = await fetch('/api/content/theme', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(theme),
      })

      if (response.ok) {
        toast.success('Tema guardado correctamente')
        
        // Aplicar el tema en tiempo real
        applyThemeToPage()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al guardar tema')
      }
    } catch (error) {
      console.error('Error saving theme:', error)
      toast.error('Error al guardar el tema')
    } finally {
      setIsSaving(false)
    }
  }

  const applyThemeToPage = () => {
    const root = document.documentElement
    
    // Aplicar variables CSS
    root.style.setProperty('--primary-color', theme.colors.primary)
    root.style.setProperty('--secondary-color', theme.colors.secondary)
    root.style.setProperty('--accent-color', theme.colors.accent)
    root.style.setProperty('--background-color', theme.colors.background)
    root.style.setProperty('--text-primary', theme.colors.textPrimary)
    root.style.setProperty('--font-family-sans', theme.typography.fontFamily.sans.join(', '))
    
    // Actualizar favicon
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement
    if (favicon) {
      favicon.href = theme.logo.favicon
    }
  }

  const exportTheme = () => {
    const themeJson = JSON.stringify(theme, null, 2)
    const blob = new Blob([themeJson], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${theme.name.toLowerCase().replace(/\s+/g, '-')}-theme.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Tema exportado correctamente')
  }

  const resetToDefault = () => {
    if (confirm('¿Estás seguro de restablecer el tema a los valores por defecto?')) {
      // Aquí cargarías el tema por defecto
      toast.success('Tema restablecido a valores por defecto')
    }
  }

  // Funciones del gestor de temas
  const handleSelectTheme = (themeId: string) => {
    setSelectedThemeId(themeId)
    setCurrentView('editor')
    // Cargar el tema seleccionado
    const selectedTheme = themes.find(t => t.id === themeId)
    if (selectedTheme) {
      toast.success(`Editando tema: ${selectedTheme.name}`)
    }
  }

  const handleCreateTheme = () => {
    setCurrentView('editor')
    // Crear un nuevo tema en blanco
    setSelectedThemeId(null)
    toast.success('Creando nuevo tema')
  }

  const handleDuplicateTheme = (themeId: string) => {
    const originalTheme = themes.find(t => t.id === themeId)
    if (originalTheme) {
      const newTheme = {
        ...originalTheme,
        id: `${themeId}-copy-${Date.now()}`,
        name: `${originalTheme.name} (Copia)`,
        isActive: false,
        isDefault: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        websites: 0
      }
      setThemes([...themes, newTheme])
      toast.success('Tema duplicado correctamente')
    }
  }

  const handleDeleteTheme = (themeId: string) => {
    const themeToDelete = themes.find(t => t.id === themeId)
    if (themeToDelete && !themeToDelete.isDefault) {
      if (confirm(`¿Estás seguro de eliminar el tema "${themeToDelete.name}"?`)) {
        setThemes(themes.filter(t => t.id !== themeId))
        toast.success('Tema eliminado')
      }
    } else {
      toast.error('No se puede eliminar el tema por defecto')
    }
  }

  const handleToggleActive = (themeId: string, isActive: boolean) => {
    setThemes(themes.map(t => 
      t.id === themeId ? { ...t, isActive } : t
    ))
    const theme = themes.find(t => t.id === themeId)
    toast.success(`Tema "${theme?.name}" ${isActive ? 'activado' : 'desactivado'}`)
  }

  const handleImportTheme = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedTheme = JSON.parse(e.target?.result as string)
        const newTheme = {
          ...importedTheme,
          id: `imported-${Date.now()}`,
          isActive: false,
          isDefault: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          websites: 0
        }
        setThemes([...themes, newTheme])
        toast.success('Tema importado correctamente')
      } catch (error) {
        toast.error('Error al importar el tema')
      }
    }
    reader.readAsText(file)
  }

  const handleExportTheme = (themeId: string) => {
    const themeToExport = themes.find(t => t.id === themeId)
    if (themeToExport) {
      const themeJson = JSON.stringify(themeToExport, null, 2)
      const blob = new Blob([themeJson], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${themeToExport.name.toLowerCase().replace(/\s+/g, '-')}-theme.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Tema exportado correctamente')
    }
  }

  const tabs = [
    { id: 'branding', label: 'Branding', icon: <ImageIcon className="w-4 h-4" /> },
    { id: 'colors', label: 'Colores', icon: <Palette className="w-4 h-4" /> },
    { id: 'typography', label: 'Tipografía', icon: <Type className="w-4 h-4" /> },
    { id: 'layout', label: 'Layout', icon: <Settings className="w-4 h-4" /> },
    { id: 'preview', label: 'Vista Previa', icon: <Eye className="w-4 h-4" /> }
  ]

  // Mostrar el gestor de temas o el editor
  if (currentView === 'manager') {
    return (
      <ThemeManager
        themes={themes}
        onSelectTheme={handleSelectTheme}
        onCreateTheme={handleCreateTheme}
        onDuplicateTheme={handleDuplicateTheme}
        onDeleteTheme={handleDeleteTheme}
        onToggleActive={handleToggleActive}
        onImportTheme={handleImportTheme}
        onExportTheme={handleExportTheme}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setCurrentView('manager')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Gestor
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🎨 Editor de Tema</h1>
            <p className="text-gray-600 mt-1">
              {selectedThemeId ? 
                `Editando: ${themes.find(t => t.id === selectedThemeId)?.name}` :
                'Creando nuevo tema personalizado'
              }
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={exportTheme}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" onClick={resetToDefault}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Restablecer
          </Button>
          <Button onClick={saveTheme} disabled={isSaving}>
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Guardar Tema
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tema Activo</p>
                <p className="text-lg font-bold text-gray-900">{theme.name}</p>
              </div>
              <Palette className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Color Principal</p>
                <div className="flex items-center gap-2 mt-1">
                  <div 
                    className="w-4 h-4 rounded-full border"
                    style={{ backgroundColor: theme.colors.primary }}
                  ></div>
                  <span className="text-sm font-mono">{theme.colors.primary}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Fuente Principal</p>
                <p className="text-lg font-bold">{theme.typography.fontFamily.sans[0]}</p>
              </div>
              <Type className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Última Actualización</p>
                <p className="text-sm text-gray-600">
                  {new Date(theme.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <RefreshCw className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Branding Tab */}
      {activeTab === 'branding' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Logos y Branding</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo Principal */}
              <div>
                <Label>Logo Principal</Label>
                <div className="mt-2">
                  {theme.logo.primary ? (
                    <div className="relative inline-block">
                      <img
                        src={theme.logo.primary}
                        alt="Logo principal"
                        className="h-16 border rounded bg-white p-2"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute -top-2 -right-2 h-6 w-6 p-0"
                        onClick={() => logoInputRef.current?.click()}
                      >
                        <Upload className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      onClick={() => logoInputRef.current?.click()}
                      className="h-16 w-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
                    >
                      <Upload className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleLogoUpload(file, 'primary')
                    }}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Logo Secundario */}
              <div>
                <Label>Logo Secundario (Opcional)</Label>
                <div className="mt-2">
                  {theme.logo.secondary ? (
                    <div className="relative inline-block">
                      <img
                        src={theme.logo.secondary}
                        alt="Logo secundario"
                        className="h-16 border rounded bg-gray-900 p-2"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute -top-2 -right-2 h-6 w-6 p-0"
                        onClick={() => logoSecondaryInputRef.current?.click()}
                      >
                        <Upload className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      onClick={() => logoSecondaryInputRef.current?.click()}
                      className="h-16 w-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
                    >
                      <Upload className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <input
                    ref={logoSecondaryInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleLogoUpload(file, 'secondary')
                    }}
                    className="hidden"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Para usar sobre fondos oscuros
                </p>
              </div>

              {/* Favicon */}
              <div>
                <Label>Favicon</Label>
                <div className="mt-2">
                  {theme.logo.favicon ? (
                    <div className="relative inline-block">
                      <img
                        src={theme.logo.favicon}
                        alt="Favicon"
                        className="h-8 w-8 border rounded"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute -top-2 -right-2 h-6 w-6 p-0"
                        onClick={() => faviconInputRef.current?.click()}
                      >
                        <Upload className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      onClick={() => faviconInputRef.current?.click()}
                      className="h-8 w-8 border-2 border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
                    >
                      <Upload className="w-3 h-3 text-gray-400" />
                    </div>
                  )}
                  <input
                    ref={faviconInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleLogoUpload(file, 'favicon')
                    }}
                    className="hidden"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Recomendado: 32x32px o 16x16px
                </p>
              </div>

              {/* Dimensiones del logo */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Ancho del Logo (px)</Label>
                  <Input
                    type="number"
                    value={theme.logo.width}
                    onChange={(e) => updateTheme({
                      logo: { ...theme.logo, width: parseInt(e.target.value) || 180 }
                    })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Alto del Logo (px)</Label>
                  <Input
                    type="number"
                    value={theme.logo.height}
                    onChange={(e) => updateTheme({
                      logo: { ...theme.logo, height: parseInt(e.target.value) || 60 }
                    })}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Información del Tema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Nombre del Tema</Label>
                <Input
                  value={theme.name}
                  onChange={(e) => updateTheme({ name: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Tema Activo</Label>
                  <ColoredSwitch
                    checked={theme.isActive}
                    onCheckedChange={(checked) => updateTheme({ isActive: checked })}
                    activeColor="green"
                    inactiveColor="gray"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Tema por Defecto</Label>
                  <ColoredSwitch
                    checked={theme.isDefault}
                    onCheckedChange={(checked) => updateTheme({ isDefault: checked })}
                    activeColor="green"
                    inactiveColor="gray"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ID del Tema:</span>
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                      {theme.id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Creado:</span>
                    <span>{new Date(theme.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Actualizado:</span>
                    <span>{new Date(theme.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {isUploading && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    Subiendo archivo...
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Colors Tab */}
      {activeTab === 'colors' && (
        <div className="space-y-6">
          {/* Paletas predefinidas */}
          <Card>
            <CardHeader>
              <CardTitle>Paletas de Colores Predefinidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {colorPalettes.map((palette) => (
                  <div
                    key={palette.name}
                    className="cursor-pointer border rounded-lg p-3 hover:shadow-lg transition-shadow"
                    onClick={() => applyColorPalette(palette)}
                  >
                    <div className="flex gap-1 mb-2">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: palette.colors.primary }}
                      ></div>
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: palette.colors.secondary }}
                      ></div>
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: palette.colors.accent }}
                      ></div>
                    </div>
                    <p className="text-xs font-medium">{palette.name}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Colores principales */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Colores de Marca</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Color primario */}
                <div>
                  <Label>Color Primario</Label>
                  <div className="flex gap-2 mt-2">
                    <input
                      type="color"
                      value={theme.colors.primary}
                      onChange={(e) => updateColors({ primary: e.target.value })}
                      className="w-12 h-8 rounded border"
                    />
                    <Input
                      value={theme.colors.primary}
                      onChange={(e) => updateColors({ primary: e.target.value })}
                      className="flex-1 font-mono"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigator.clipboard.writeText(theme.colors.primary)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Color secundario */}
                <div>
                  <Label>Color Secundario</Label>
                  <div className="flex gap-2 mt-2">
                    <input
                      type="color"
                      value={theme.colors.secondary}
                      onChange={(e) => updateColors({ secondary: e.target.value })}
                      className="w-12 h-8 rounded border"
                    />
                    <Input
                      value={theme.colors.secondary}
                      onChange={(e) => updateColors({ secondary: e.target.value })}
                      className="flex-1 font-mono"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigator.clipboard.writeText(theme.colors.secondary)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Color de acento */}
                <div>
                  <Label>Color de Acento</Label>
                  <div className="flex gap-2 mt-2">
                    <input
                      type="color"
                      value={theme.colors.accent}
                      onChange={(e) => updateColors({ accent: e.target.value })}
                      className="w-12 h-8 rounded border"
                    />
                    <Input
                      value={theme.colors.accent}
                      onChange={(e) => updateColors({ accent: e.target.value })}
                      className="flex-1 font-mono"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigator.clipboard.writeText(theme.colors.accent)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Colores del Sistema</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Success */}
                <div>
                  <Label>Éxito</Label>
                  <div className="flex gap-2 mt-2">
                    <input
                      type="color"
                      value={theme.colors.success}
                      onChange={(e) => updateColors({ success: e.target.value })}
                      className="w-12 h-8 rounded border"
                    />
                    <Input
                      value={theme.colors.success}
                      onChange={(e) => updateColors({ success: e.target.value })}
                      className="flex-1 font-mono"
                    />
                  </div>
                </div>

                {/* Warning */}
                <div>
                  <Label>Advertencia</Label>
                  <div className="flex gap-2 mt-2">
                    <input
                      type="color"
                      value={theme.colors.warning}
                      onChange={(e) => updateColors({ warning: e.target.value })}
                      className="w-12 h-8 rounded border"
                    />
                    <Input
                      value={theme.colors.warning}
                      onChange={(e) => updateColors({ warning: e.target.value })}
                      className="flex-1 font-mono"
                    />
                  </div>
                </div>

                {/* Error */}
                <div>
                  <Label>Error</Label>
                  <div className="flex gap-2 mt-2">
                    <input
                      type="color"
                      value={theme.colors.error}
                      onChange={(e) => updateColors({ error: e.target.value })}
                      className="w-12 h-8 rounded border"
                    />
                    <Input
                      value={theme.colors.error}
                      onChange={(e) => updateColors({ error: e.target.value })}
                      className="flex-1 font-mono"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Vista previa de colores */}
          <Card>
            <CardHeader>
              <CardTitle>Vista Previa de Colores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Botones */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Botones</h4>
                  <div className="space-y-2">
                    <button
                      className="w-full py-2 px-4 rounded font-medium text-white"
                      style={{ backgroundColor: theme.colors.primary }}
                    >
                      Botón Primario
                    </button>
                    <button
                      className="w-full py-2 px-4 rounded font-medium text-white"
                      style={{ backgroundColor: theme.colors.secondary }}
                    >
                      Botón Secundario
                    </button>
                    <button
                      className="w-full py-2 px-4 rounded font-medium text-white"
                      style={{ backgroundColor: theme.colors.accent }}
                    >
                      Botón de Acento
                    </button>
                  </div>
                </div>

                {/* Alertas */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Alertas</h4>
                  <div className="space-y-2">
                    <div
                      className="p-3 rounded text-sm"
                      style={{ 
                        backgroundColor: theme.colors.success + '20',
                        borderLeft: `4px solid ${theme.colors.success}`
                      }}
                    >
                      Mensaje de éxito
                    </div>
                    <div
                      className="p-3 rounded text-sm"
                      style={{ 
                        backgroundColor: theme.colors.warning + '20',
                        borderLeft: `4px solid ${theme.colors.warning}`
                      }}
                    >
                      Mensaje de advertencia
                    </div>
                    <div
                      className="p-3 rounded text-sm"
                      style={{ 
                        backgroundColor: theme.colors.error + '20',
                        borderLeft: `4px solid ${theme.colors.error}`
                      }}
                    >
                      Mensaje de error
                    </div>
                  </div>
                </div>

                {/* Enlaces */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Enlaces y Texto</h4>
                  <div className="space-y-2">
                    <a
                      href="#"
                      className="block text-sm underline"
                      style={{ color: theme.colors.primary }}
                    >
                      Enlace primario
                    </a>
                    <a
                      href="#"
                      className="block text-sm underline"
                      style={{ color: theme.colors.accent }}
                    >
                      Enlace de acento
                    </a>
                    <p 
                      className="text-sm"
                      style={{ color: theme.colors.textPrimary }}
                    >
                      Texto principal
                    </p>
                    <p 
                      className="text-sm"
                      style={{ color: theme.colors.textSecondary }}
                    >
                      Texto secundario
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Typography Tab */}
      {activeTab === 'typography' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Fuentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Fuente Sans */}
              <div>
                <Label>Fuente Sans Serif</Label>
                <select
                  value={theme.typography.fontFamily.sans[0]}
                  onChange={(e) => updateTypography({
                    fontFamily: {
                      ...theme.typography.fontFamily,
                      sans: [e.target.value, ...theme.typography.fontFamily.sans.slice(1)]
                    }
                  })}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-lg"
                >
                  {googleFonts.map(font => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Fuente principal para el sitio web
                </p>
              </div>

              {/* Fuente Serif */}
              <div>
                <Label>Fuente Serif</Label>
                <select
                  value={theme.typography.fontFamily.serif[0]}
                  onChange={(e) => updateTypography({
                    fontFamily: {
                      ...theme.typography.fontFamily,
                      serif: [e.target.value, ...theme.typography.fontFamily.serif.slice(1)]
                    }
                  })}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-lg"
                >
                  <option value="ui-serif">Serif por defecto</option>
                  <option value="Playfair Display">Playfair Display</option>
                  <option value="Merriweather">Merriweather</option>
                  <option value="Lora">Lora</option>
                  <option value="Crimson Text">Crimson Text</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Para títulos elegantes y contenido formal
                </p>
              </div>

              {/* Weights */}
              <div>
                <Label>Pesos de Fuente</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <label className="text-xs text-gray-600">Normal</label>
                    <Input
                      type="number"
                      min="100"
                      max="900"
                      step="100"
                      value={theme.typography.fontWeight.normal}
                      onChange={(e) => updateTypography({
                        fontWeight: {
                          ...theme.typography.fontWeight,
                          normal: parseInt(e.target.value) || 400
                        }
                      })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Negrita</label>
                    <Input
                      type="number"
                      min="100"
                      max="900"
                      step="100"
                      value={theme.typography.fontWeight.bold}
                      onChange={(e) => updateTypography({
                        fontWeight: {
                          ...theme.typography.fontWeight,
                          bold: parseInt(e.target.value) || 700
                        }
                      })}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vista Previa de Tipografía</CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="space-y-4"
                style={{ fontFamily: theme.typography.fontFamily.sans.join(', ') }}
              >
                <div>
                  <h1 className="text-4xl font-bold mb-2">
                    Título Principal H1
                  </h1>
                  <h2 className="text-3xl font-semibold mb-2">
                    Subtítulo H2
                  </h2>
                  <h3 className="text-2xl font-medium mb-2">
                    Encabezado H3
                  </h3>
                  <h4 className="text-xl font-medium mb-2">
                    Encabezado H4
                  </h4>
                </div>

                <div>
                  <p className="text-base mb-4">
                    Este es un párrafo de ejemplo con el texto normal. 
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                    Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  </p>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    Texto más pequeño con color secundario para descripciones 
                    y contenido auxiliar.
                  </p>

                  <div className="flex gap-4 text-sm">
                    <span className="font-normal">Texto normal</span>
                    <span className="font-medium">Texto medio</span>
                    <span className="font-semibold">Texto semi-negrita</span>
                    <span className="font-bold">Texto negrita</span>
                  </div>
                </div>

                <div>
                  <a 
                    href="#" 
                    className="text-base underline"
                    style={{ color: theme.colors.primary }}
                  >
                    Enlace de ejemplo
                  </a>
                </div>

                <div 
                  className="p-4 rounded border-l-4"
                  style={{ 
                    borderLeftColor: theme.colors.primary,
                    backgroundColor: theme.colors.primary + '10'
                  }}
                >
                  <p className="text-sm">
                    Cita o texto destacado con el color primario del tema.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Layout Tab */}
      {activeTab === 'layout' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Layout</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Header Style */}
              <div>
                <Label>Estilo del Header</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {[
                    { value: 'simple', label: 'Simple' },
                    { value: 'centered', label: 'Centrado' },
                    { value: 'mega', label: 'Mega Menu' }
                  ].map((style) => (
                    <Button
                      key={style.value}
                      size="sm"
                      variant={theme.site.headerStyle === style.value ? 'default' : 'outline'}
                      onClick={() => updateSite({ headerStyle: style.value as any })}
                    >
                      {style.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Footer Style */}
              <div>
                <Label>Estilo del Footer</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {[
                    { value: 'minimal', label: 'Minimal' },
                    { value: 'detailed', label: 'Detallado' },
                    { value: 'newsletter', label: 'Newsletter' }
                  ].map((style) => (
                    <Button
                      key={style.value}
                      size="sm"
                      variant={theme.site.footerStyle === style.value ? 'default' : 'outline'}
                      onClick={() => updateSite({ footerStyle: style.value as any })}
                    >
                      {style.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Button Style */}
              <div>
                <Label>Estilo de Botones</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {[
                    { value: 'rounded', label: 'Redondeado' },
                    { value: 'sharp', label: 'Rectangular' },
                    { value: 'pill', label: 'Píldora' }
                  ].map((style) => (
                    <Button
                      key={style.value}
                      size="sm"
                      variant={theme.site.buttonStyle === style.value ? 'default' : 'outline'}
                      onClick={() => updateSite({ buttonStyle: style.value as any })}
                    >
                      {style.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Card Style */}
              <div>
                <Label>Estilo de Tarjetas</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {[
                    { value: 'flat', label: 'Plano' },
                    { value: 'shadow', label: 'Sombra' },
                    { value: 'border', label: 'Borde' }
                  ].map((style) => (
                    <Button
                      key={style.value}
                      size="sm"
                      variant={theme.site.cardStyle === style.value ? 'default' : 'outline'}
                      onClick={() => updateSite({ cardStyle: style.value as any })}
                    >
                      {style.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Opciones Avanzadas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Animaciones</Label>
                  <p className="text-xs text-gray-500">
                    Habilitar transiciones y animaciones
                  </p>
                </div>
                <ColoredSwitch
                  checked={theme.site.animationsEnabled}
                  onCheckedChange={(checked) => updateSite({ animationsEnabled: checked })}
                  activeColor="green"
                  inactiveColor="gray"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Modo Oscuro</Label>
                  <p className="text-xs text-gray-500">
                    Permitir cambio a modo oscuro
                  </p>
                </div>
                <ColoredSwitch
                  checked={theme.site.darkModeEnabled}
                  onCheckedChange={(checked) => updateSite({ darkModeEnabled: checked })}
                  activeColor="green"
                  inactiveColor="gray"
                />
              </div>

              {/* Preview de estilos */}
              <div className="mt-6 space-y-4">
                <h4 className="font-medium">Vista Previa</h4>
                
                {/* Botón preview */}
                <div>
                  <p className="text-xs text-gray-600 mb-2">Estilo de botón:</p>
                  <button
                    className={`px-4 py-2 text-white font-medium ${
                      theme.site.buttonStyle === 'rounded' ? 'rounded-lg' :
                      theme.site.buttonStyle === 'sharp' ? 'rounded-none' :
                      'rounded-full'
                    }`}
                    style={{ backgroundColor: theme.colors.primary }}
                  >
                    Botón de ejemplo
                  </button>
                </div>

                {/* Card preview */}
                <div>
                  <p className="text-xs text-gray-600 mb-2">Estilo de tarjeta:</p>
                  <div
                    className={`p-4 bg-white rounded-lg ${
                      theme.site.cardStyle === 'flat' ? '' :
                      theme.site.cardStyle === 'shadow' ? 'shadow-md' :
                      'border border-gray-200'
                    }`}
                  >
                    <h5 className="font-medium mb-1">Tarjeta de ejemplo</h5>
                    <p className="text-sm text-gray-600">
                      Contenido de la tarjeta con el estilo seleccionado.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Preview Tab */}
      {activeTab === 'preview' && (
        <div className="space-y-6">
          {/* Device selector */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant={previewDevice === 'desktop' ? 'default' : 'outline'}
                  onClick={() => setPreviewDevice('desktop')}
                >
                  <Monitor className="w-4 h-4 mr-2" />
                  Desktop
                </Button>
                <Button
                  size="sm"
                  variant={previewDevice === 'tablet' ? 'default' : 'outline'}
                  onClick={() => setPreviewDevice('tablet')}
                >
                  <Tablet className="w-4 h-4 mr-2" />
                  Tablet
                </Button>
                <Button
                  size="sm"
                  variant={previewDevice === 'mobile' ? 'default' : 'outline'}
                  onClick={() => setPreviewDevice('mobile')}
                >
                  <Smartphone className="w-4 h-4 mr-2" />
                  Mobile
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preview iframe */}
          <Card>
            <CardHeader>
              <CardTitle>Vista Previa del Sitio Web</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <div
                  className={`bg-white shadow-lg transition-all duration-300 ${
                    previewDevice === 'desktop' ? 'w-full max-w-6xl h-96' :
                    previewDevice === 'tablet' ? 'w-full max-w-2xl h-80' :
                    'w-full max-w-sm h-96'
                  }`}
                  style={{
                    fontFamily: theme.typography.fontFamily.sans.join(', ')
                  }}
                >
                  {/* Mock website preview */}
                  <div className="h-full bg-gray-50 rounded-lg overflow-hidden">
                    {/* Header */}
                    <div 
                      className="p-4 bg-white border-b"
                      style={{ borderBottomColor: theme.colors.gray[200] }}
                    >
                      <div className="flex items-center justify-between">
                        <img
                          src={theme.logo.primary}
                          alt="Logo"
                          style={{ 
                            height: Math.min(theme.logo.height, 40),
                            width: 'auto'
                          }}
                        />
                        <div className="flex gap-4 text-sm">
                          <a href="#" style={{ color: theme.colors.textPrimary }}>Inicio</a>
                          <a href="#" style={{ color: theme.colors.textSecondary }}>Productos</a>
                          <a href="#" style={{ color: theme.colors.textSecondary }}>Contacto</a>
                        </div>
                      </div>
                    </div>

                    {/* Hero section */}
                    <div 
                      className="p-8 text-center"
                      style={{ backgroundColor: theme.colors.surface }}
                    >
                      <h1 
                        className="text-2xl font-bold mb-2"
                        style={{ color: theme.colors.textPrimary }}
                      >
                        Bienvenido a tu sitio web
                      </h1>
                      <p 
                        className="text-sm mb-4"
                        style={{ color: theme.colors.textSecondary }}
                      >
                        Vista previa del tema personalizado
                      </p>
                      <button
                        className={`px-6 py-2 text-white font-medium ${
                          theme.site.buttonStyle === 'rounded' ? 'rounded-lg' :
                          theme.site.buttonStyle === 'sharp' ? 'rounded-none' :
                          'rounded-full'
                        }`}
                        style={{ backgroundColor: theme.colors.primary }}
                      >
                        Ver productos
                      </button>
                    </div>

                    {/* Content cards */}
                    <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`p-4 bg-white rounded-lg ${
                            theme.site.cardStyle === 'shadow' ? 'shadow-md' :
                            theme.site.cardStyle === 'border' ? 'border border-gray-200' :
                            ''
                          }`}
                        >
                          <div 
                            className="w-full h-20 rounded mb-2"
                            style={{ backgroundColor: theme.colors.gray[200] }}
                          ></div>
                          <h3 
                            className="font-medium text-sm mb-1"
                            style={{ color: theme.colors.textPrimary }}
                          >
                            Producto {i}
                          </h3>
                          <p 
                            className="text-xs"
                            style={{ color: theme.colors.textSecondary }}
                          >
                            Descripción del producto
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Apply theme button */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Button
                  onClick={applyThemeToPage}
                  className="mr-4"
                  style={{ backgroundColor: theme.colors.primary }}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Aplicar Tema a esta Página
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open('/', '_blank')}
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Ver Sitio Completo
                </Button>
              </div>
              <p className="text-xs text-gray-500 text-center mt-2">
                Aplica el tema temporalmente a esta página para ver los cambios
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
})

ThemePage.displayName = 'ThemePage'

export default ThemePage