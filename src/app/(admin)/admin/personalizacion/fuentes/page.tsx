"use client"

import { useState, useRef, useEffect } from "react"
import { 
  Type, 
  Upload, 
  Trash2, 
  Download, 
  Eye, 
  Plus,
  Search,
  Filter,
  AlertCircle,
  CheckCircle,
  X
} from "lucide-react"

interface Font {
  id: string
  name: string
  family: string
  style: string
  weight: string
  format: string
  fileName: string
  fileUrl?: string
  fileSize: number
  isActive: boolean
  uploadDate: string
  createdAt: string
  updatedAt: string
}

export default function FuentesPage() {
  const [fonts, setFonts] = useState<Font[]>([])
  const [loading, setLoading] = useState(true)

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFormat, setSelectedFormat] = useState("all")
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState<Font | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Cargar fuentes al montar el componente
  useEffect(() => {
    loadFonts()
  }, [])

  const loadFonts = async () => {
    try {
      const response = await fetch('/api/personalization/fonts')
      if (response.ok) {
        const data = await response.json()
        setFonts(data)
      } else {
        console.error('Error loading fonts:', response.statusText)
      }
    } catch (error) {
      console.error('Error loading fonts:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES')
  }

  const filteredFonts = fonts.filter(font => {
    const matchesSearch = font.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         font.family.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFormat = selectedFormat === "all" || font.format.toLowerCase() === selectedFormat.toLowerCase()
    return matchesSearch && matchesFormat
  })

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFiles = async (files: FileList) => {
    setUploading(true)
    const validFiles = Array.from(files).filter(file => 
      file.type.includes('font') || 
      file.name.endsWith('.ttf') || 
      file.name.endsWith('.otf') || 
      file.name.endsWith('.woff') || 
      file.name.endsWith('.woff2')
    )

    if (validFiles.length === 0) {
      alert('Por favor selecciona archivos de fuente válidos (.ttf, .otf, .woff, .woff2)')
      setUploading(false)
      return
    }

    let successCount = 0
    let errorCount = 0
    const errors: string[] = []

    for (const file of validFiles) {
      try {
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }))
        
        // Extraer información de la fuente
        const fontFamily = extractFontFamily(file.name)
        const fontStyle = extractFontStyle(file.name)
        const fontWeight = extractFontWeight(file.name)

        // Crear FormData para enviar el archivo
        const formData = new FormData()
        formData.append('file', file)
        formData.append('family', fontFamily)
        formData.append('style', fontStyle)
        formData.append('weight', fontWeight)

        // Simular progreso durante la subida
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            const current = prev[file.name] || 0
            if (current < 90) {
              return { ...prev, [file.name]: current + 10 }
            }
            return prev
          })
        }, 200)

        // Enviar archivo a la API
        const response = await fetch('/api/personalization/fonts', {
          method: 'POST',
          body: formData
        })

        clearInterval(progressInterval)
        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }))

        if (response.ok) {
          successCount++
          // Recargar la lista de fuentes
          await loadFonts()
        } else {
          const errorData = await response.json()
          errors.push(`${file.name}: ${errorData.error}`)
          errorCount++
        }

        // Limpiar progreso después de un breve delay
        setTimeout(() => {
          setUploadProgress(prev => {
            const newProgress = { ...prev }
            delete newProgress[file.name]
            return newProgress
          })
        }, 1000)

      } catch (error) {
        console.error('Error uploading font:', file.name, error)
        errors.push(`${file.name}: Error de conexión`)
        errorCount++
      }
    }

    setUploading(false)
    
    // Mostrar resultado
    if (successCount > 0 && errorCount === 0) {
      alert(`✅ Se ${successCount === 1 ? 'subió 1 fuente' : `subieron ${successCount} fuentes`} correctamente.`)
    } else if (successCount > 0 && errorCount > 0) {
      alert(`✅ Se subieron ${successCount} fuentes correctamente.\n❌ ${errorCount} fuentes fallaron:\n${errors.join('\n')}`)
    } else if (errorCount > 0) {
      alert(`❌ Error al subir fuentes:\n${errors.join('\n')}`)
    }
    
    setTimeout(() => {
      setShowUploadModal(false)
    }, 1500)
  }

  const extractFontFamily = (fileName: string): string => {
    // Extraer el nombre de la familia de fuente del nombre del archivo
    const name = fileName.replace(/\.[^/.]+$/, "") // Remover extensión
    const parts = name.split(/[-_]/)
    // Tomar solo la primera parte como familia
    return parts[0]?.trim() || name.trim()
  }

  const extractFontStyle = (fileName: string): string => {
    const name = fileName.toLowerCase()
    // Buscar patrones específicos en orden de prioridad
    if (name.includes('bolditalic') || name.includes('bold-italic')) return 'Bold Italic'
    if (name.includes('lightitalic') || name.includes('light-italic')) return 'Light Italic'
    if (name.includes('mediumitalic') || name.includes('medium-italic')) return 'Medium Italic'
    if (name.includes('bold')) return 'Bold'
    if (name.includes('italic')) return 'Italic'
    if (name.includes('light')) return 'Light'
    if (name.includes('thin')) return 'Thin'
    if (name.includes('medium')) return 'Medium'
    if (name.includes('black')) return 'Black'
    if (name.includes('semibold')) return 'Semibold'
    if (name.includes('extrabold')) return 'Extra Bold'
    return 'Regular'
  }

  const extractFontWeight = (fileName: string): string => {
    const name = fileName.toLowerCase()
    // Buscar patrones específicos de peso
    if (name.includes('thin')) return '100'
    if (name.includes('extralight') || name.includes('ultra-light')) return '200'
    if (name.includes('light')) return '300'
    if (name.includes('medium')) return '500'
    if (name.includes('semibold')) return '600'
    if (name.includes('bold') && !name.includes('extrabold')) return '700'
    if (name.includes('extrabold') || name.includes('ultra-bold')) return '800'
    if (name.includes('black')) return '900'
    return '400' // Regular/Normal
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }

  const toggleFontStatus = async (id: string) => {
    try {
      const font = fonts.find(f => f.id === id)
      if (!font) return

      const response = await fetch('/api/personalization/fonts', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id,
          isActive: !font.isActive
        })
      })

      if (response.ok) {
        // Actualizar el estado local
        setFonts(prev => prev.map(f => 
          f.id === id 
            ? { ...f, isActive: !f.isActive }
            : f
        ))
      } else {
        const errorData = await response.json()
        alert(`Error al cambiar estado: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error toggling font status:', error)
      alert('Error al cambiar el estado de la fuente')
    }
  }

  const deleteFont = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta fuente?')) {
      return
    }

    try {
      const response = await fetch(`/api/personalization/fonts?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Eliminar del estado local
        setFonts(prev => prev.filter(font => font.id !== id))
        alert('Fuente eliminada correctamente')
      } else {
        const errorData = await response.json()
        alert(`Error al eliminar: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error deleting font:', error)
      alert('Error al eliminar la fuente')
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Fuentes</h1>
          <p className="text-gray-600 mt-1">
            Administre las fuentes disponibles para la personalización de productos
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
        >
          <Plus className="h-4 w-4" />
          Subir Fuente
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Type className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Fuentes</p>
              <p className="text-xl font-semibold text-gray-900">{fonts.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Activas</p>
              <p className="text-xl font-semibold text-gray-900">
                {fonts.filter(f => f.isActive).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Inactivas</p>
              <p className="text-xl font-semibold text-gray-900">
                {fonts.filter(f => !f.isActive).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Download className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Formatos</p>
              <p className="text-xl font-semibold text-gray-900">
                {[...new Set(fonts.map(f => f.format))].length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar fuentes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">Todos los formatos</option>
              <option value="ttf">TTF</option>
              <option value="otf">OTF</option>
              <option value="woff">WOFF</option>
              <option value="woff2">WOFF2</option>
            </select>
          </div>
        </div>
      </div>

      {/* Fonts Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Fuente</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Familia</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Estilo</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Formato</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Tamaño</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Estado</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 px-4 text-center text-gray-500">
                    Cargando fuentes...
                  </td>
                </tr>
              ) : filteredFonts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 px-4 text-center text-gray-500">
                    No se encontraron fuentes
                  </td>
                </tr>
              ) : (
                filteredFonts.map((font) => (
                  <tr key={font.id} className="hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                          <Type className="h-4 w-4 text-orange-600" />
                        </div>
                        <div>
                          <p 
                            className="font-medium text-gray-900 text-lg"
                            style={{ 
                              fontFamily: font.family,
                              fontWeight: font.weight,
                              fontStyle: font.style.toLowerCase().includes('italic') ? 'italic' : 'normal'
                            }}
                          >
                            {font.family}
                          </p>
                          <p className="text-sm text-gray-500">Subido {formatDate(font.uploadDate)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-900">{font.family}</td>
                    <td className="py-4 px-4 text-gray-600">{font.style} ({font.weight})</td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {font.format}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{formatFileSize(font.fileSize)}</td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => toggleFontStatus(font.id)}
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          font.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {font.isActive ? 'Activa' : 'Inactiva'}
                      </button>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowPreviewModal(font)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Vista previa"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteFont(font.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/35 backdrop-blur-sm z-[100]">
          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Subir Nueva Fuente</h2>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive
                  ? 'border-orange-400 bg-orange-50'
                  : 'border-gray-300 bg-gray-50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">
                Arrastra y suelta tus archivos de fuente aquí
              </p>
              <p className="text-sm text-gray-500 mb-4">
                o haz clic para seleccionar archivos
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".ttf,.otf,.woff,.woff2"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  uploading 
                    ? "bg-gray-400 text-white cursor-not-allowed" 
                    : "bg-orange-600 hover:bg-orange-700 text-white"
                }`}
              >
                {uploading ? "Subiendo..." : "Seleccionar Archivos"}
              </button>
            </div>

            {/* Progress Bars */}
            {Object.keys(uploadProgress).length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium text-gray-900">Progreso de subida:</h4>
                {Object.entries(uploadProgress).map(([fileName, progress]) => (
                  <div key={fileName} className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span className="truncate">{fileName}</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-4 text-xs text-gray-500">
              <p>Formatos soportados: TTF, OTF, WOFF, WOFF2</p>
              <p>Tamaño máximo: 5MB por archivo</p>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/35 backdrop-blur-sm z-[100]">
          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Vista Previa: {showPreviewModal.family}
              </h2>
              <button 
                onClick={() => setShowPreviewModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Información de la Fuente</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Familia:</span>
                    <span className="ml-2 font-medium">{showPreviewModal.family}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Estilo:</span>
                    <span className="ml-2 font-medium">{showPreviewModal.style}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Peso:</span>
                    <span className="ml-2 font-medium">{showPreviewModal.weight}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Formato:</span>
                    <span className="ml-2 font-medium">{showPreviewModal.format}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                <h3 className="font-medium text-gray-900 mb-4">Vista Previa del Texto</h3>
                <div className="space-y-4">
                  <div style={{ 
                    fontFamily: showPreviewModal.family, 
                    fontSize: '24px',
                    fontWeight: showPreviewModal.weight,
                    fontStyle: showPreviewModal.style.toLowerCase().includes('italic') ? 'italic' : 'normal'
                  }}>
                    The quick brown fox jumps over the lazy dog
                  </div>
                  <div style={{ 
                    fontFamily: showPreviewModal.family, 
                    fontSize: '18px',
                    fontWeight: showPreviewModal.weight,
                    fontStyle: showPreviewModal.style.toLowerCase().includes('italic') ? 'italic' : 'normal'
                  }}>
                    ABCDEFGHIJKLMNOPQRSTUVWXYZ
                  </div>
                  <div style={{ 
                    fontFamily: showPreviewModal.family, 
                    fontSize: '18px',
                    fontWeight: showPreviewModal.weight,
                    fontStyle: showPreviewModal.style.toLowerCase().includes('italic') ? 'italic' : 'normal'
                  }}>
                    abcdefghijklmnopqrstuvwxyz
                  </div>
                  <div style={{ 
                    fontFamily: showPreviewModal.family, 
                    fontSize: '18px',
                    fontWeight: showPreviewModal.weight,
                    fontStyle: showPreviewModal.style.toLowerCase().includes('italic') ? 'italic' : 'normal'
                  }}>
                    0123456789 !@#$%^&*()
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}