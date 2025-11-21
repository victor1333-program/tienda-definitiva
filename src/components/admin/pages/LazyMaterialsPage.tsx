"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Edit, Trash2, X, Package, AlertTriangle, TrendingDown, TrendingUp } from "lucide-react"
import { toast } from "react-hot-toast"

interface Material {
  id: string
  name: string
  category: 'ink' | 'wood' | 'acrylic' | 'fabric' | 'paper' | 'accessory' | 'other'
  sku: string
  supplier: string
  currentStock: number
  minStock: number
  maxStock: number
  unit: string
  costPrice: number
  notes?: string
  createdAt: string
  updatedAt: string
}

const categoryLabels = {
  ink: 'Tinta',
  wood: 'Madera',
  acrylic: 'Metacrilato',
  fabric: 'Tejido',
  paper: 'Papel',
  accessory: 'Accesorio',
  other: 'Otro'
}

const categoryColors = {
  ink: 'bg-purple-100 text-purple-800',
  wood: 'bg-amber-100 text-amber-800',
  acrylic: 'bg-cyan-100 text-cyan-800',
  fabric: 'bg-green-100 text-green-800',
  paper: 'bg-yellow-100 text-yellow-800',
  accessory: 'bg-pink-100 text-pink-800',
  other: 'bg-gray-100 text-gray-800'
}

export default function LazyMaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    category: 'ink' as Material['category'],
    sku: '',
    supplier: '',
    currentStock: 0,
    minStock: 0,
    maxStock: 0,
    unit: 'unidades',
    costPrice: 0,
    notes: ''
  })

  // Cargar materiales mock
  useEffect(() => {
    loadMaterials()
  }, [])

  const loadMaterials = () => {
    // Mock data
    const mockMaterials: Material[] = [
      {
        id: '1',
        name: 'Tinta Epson Cyan 1L',
        category: 'ink',
        sku: 'INK-CYA-1L',
        supplier: 'Epson España',
        currentStock: 15,
        minStock: 5,
        maxStock: 50,
        unit: 'litros',
        costPrice: 45.50,
        notes: 'Para impresora DTF principal',
        createdAt: '2025-01-15',
        updatedAt: '2025-06-10'
      },
      {
        id: '2',
        name: 'Tinta Epson Magenta 1L',
        category: 'ink',
        sku: 'INK-MAG-1L',
        supplier: 'Epson España',
        currentStock: 12,
        minStock: 5,
        maxStock: 50,
        unit: 'litros',
        costPrice: 45.50,
        createdAt: '2025-01-15',
        updatedAt: '2025-06-08'
      },
      {
        id: '3',
        name: 'Tabla Madera DM 3mm',
        category: 'wood',
        sku: 'MAD-DM-3MM',
        supplier: 'Maderas García SL',
        currentStock: 3,
        minStock: 10,
        maxStock: 100,
        unit: 'planchas',
        costPrice: 8.50,
        notes: 'Stock bajo - reorden necesario',
        createdAt: '2025-02-01',
        updatedAt: '2025-06-12'
      },
      {
        id: '4',
        name: 'Algodón Premium 100g',
        category: 'fabric',
        sku: 'FAB-ALG-100',
        supplier: 'Textiles García',
        currentStock: 250,
        minStock: 100,
        maxStock: 500,
        unit: 'metros',
        costPrice: 3.50,
        createdAt: '2025-03-10',
        updatedAt: '2025-06-11'
      },
      {
        id: '5',
        name: 'Papel Transfer A4',
        category: 'paper',
        sku: 'PAP-TRA-A4',
        supplier: 'Papelería Industrial',
        currentStock: 45,
        minStock: 20,
        maxStock: 200,
        unit: 'hojas',
        costPrice: 0.25,
        createdAt: '2025-04-05',
        updatedAt: '2025-06-09'
      },
      {
        id: '6',
        name: 'Etiquetas Adhesivas',
        category: 'accessory',
        sku: 'ACC-ETI-100',
        supplier: 'Suministros Varios',
        currentStock: 8,
        minStock: 15,
        maxStock: 50,
        unit: 'rollos',
        costPrice: 8.50,
        notes: 'Reorden urgente',
        createdAt: '2025-05-01',
        updatedAt: '2025-06-13'
      },
      {
        id: '7',
        name: 'Plancha Metacrilato Transparente 3mm',
        category: 'acrylic',
        sku: 'MET-TRA-3MM',
        supplier: 'Plásticos Industriales',
        currentStock: 25,
        minStock: 10,
        maxStock: 60,
        unit: 'planchas',
        costPrice: 15.50,
        notes: 'Para corte láser',
        createdAt: '2025-03-15',
        updatedAt: '2025-06-14'
      }
    ]

    setMaterials(mockMaterials)
    setFilteredMaterials(mockMaterials)
  }

  // Filtrar materiales
  useEffect(() => {
    let filtered = materials.filter(material => {
      const matchesSearch =
        material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.supplier.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory = categoryFilter === "all" || material.category === categoryFilter

      return matchesSearch && matchesCategory
    })

    setFilteredMaterials(filtered)
  }, [materials, searchTerm, categoryFilter])

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'ink',
      sku: '',
      supplier: '',
      currentStock: 0,
      minStock: 0,
      maxStock: 0,
      unit: 'unidades',
      costPrice: 0,
      notes: ''
    })
  }

  const handleAddMaterial = () => {
    if (!formData.name || !formData.sku || !formData.supplier) {
      toast.error('Por favor completa los campos obligatorios')
      return
    }

    setIsLoading(true)

    setTimeout(() => {
      const newMaterial: Material = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      }

      setMaterials([newMaterial, ...materials])
      toast.success('Material agregado correctamente')
      setShowAddModal(false)
      resetForm()
      setIsLoading(false)
    }, 500)
  }

  const handleEditMaterial = () => {
    if (!selectedMaterial || !formData.name || !formData.sku || !formData.supplier) {
      toast.error('Por favor completa los campos obligatorios')
      return
    }

    setIsLoading(true)

    setTimeout(() => {
      setMaterials(materials.map(m =>
        m.id === selectedMaterial.id
          ? { ...m, ...formData, updatedAt: new Date().toISOString().split('T')[0] }
          : m
      ))

      toast.success('Material actualizado correctamente')
      setShowEditModal(false)
      setSelectedMaterial(null)
      resetForm()
      setIsLoading(false)
    }, 500)
  }

  const handleDeleteMaterial = (materialId: string) => {
    if (!confirm('¿Estás seguro de eliminar este material?')) return

    setMaterials(materials.filter(m => m.id !== materialId))
    toast.success('Material eliminado')
  }

  const openEditModal = (material: Material) => {
    setSelectedMaterial(material)
    setFormData({
      name: material.name,
      category: material.category,
      sku: material.sku,
      supplier: material.supplier,
      currentStock: material.currentStock,
      minStock: material.minStock,
      maxStock: material.maxStock,
      unit: material.unit,
      costPrice: material.costPrice,
      notes: material.notes || ''
    })
    setShowEditModal(true)
  }

  const getStockStatus = (material: Material) => {
    if (material.currentStock <= material.minStock) {
      return { label: 'Crítico', color: 'text-red-600', icon: AlertTriangle }
    } else if (material.currentStock <= material.minStock * 1.5) {
      return { label: 'Bajo', color: 'text-orange-600', icon: TrendingDown }
    } else if (material.currentStock >= material.maxStock) {
      return { label: 'Exceso', color: 'text-blue-600', icon: TrendingUp }
    }
    return { label: 'Normal', color: 'text-green-600', icon: Package }
  }

  const lowStockCount = materials.filter(m => m.currentStock <= m.minStock).length
  const totalValue = materials.reduce((sum, m) => sum + (m.currentStock * m.costPrice), 0)

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Materiales</h1>
          <p className="text-gray-600 mt-1">Control de inventario de materiales de producción</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowAddModal(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
        >
          <Plus className="w-4 h-4" />
          Nuevo Material
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Materiales</p>
              <p className="text-2xl font-bold text-gray-900">{materials.length}</p>
            </div>
            <Package className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Stock Bajo</p>
              <p className="text-2xl font-bold text-red-600">{lowStockCount}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Valor Total</p>
              <p className="text-2xl font-bold text-gray-900">€{totalValue.toFixed(2)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Categorías</p>
              <p className="text-2xl font-bold text-gray-900">{Object.keys(categoryLabels).length}</p>
            </div>
            <Package className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre, SKU o proveedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">Todas las categorías</option>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Materials Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Proveedor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMaterials.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No se encontraron materiales
                  </td>
                </tr>
              ) : (
                filteredMaterials.map((material) => {
                  const stockStatus = getStockStatus(material)
                  const StockIcon = stockStatus.icon

                  return (
                    <tr key={material.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{material.name}</p>
                          <p className="text-sm text-gray-500">SKU: {material.sku}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${categoryColors[material.category]}`}>
                          {categoryLabels[material.category]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{material.supplier}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">{material.currentStock} {material.unit}</p>
                          <p className="text-xs text-gray-500">Min: {material.minStock} / Max: {material.maxStock}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`flex items-center gap-1 ${stockStatus.color}`}>
                          <StockIcon className="w-4 h-4" />
                          <span className="text-sm font-medium">{stockStatus.label}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        €{material.costPrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(material)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteMaterial(material.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add/Edit Material */}
      {(showAddModal || showEditModal) && (
        <div className="fixed top-20 left-56 right-0 bottom-0 bg-black/35 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[85vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                  {showAddModal ? 'Nuevo Material' : 'Editar Material'}
                </h2>
                <button
                  onClick={() => {
                    showAddModal ? setShowAddModal(false) : setShowEditModal(false)
                    resetForm()
                    setSelectedMaterial(null)
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del Material *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Ej: Tinta Epson Cyan"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SKU *
                    </label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Ej: INK-CYA-1L"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categoría *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as Material['category'] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      {Object.entries(categoryLabels).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Proveedor *
                    </label>
                    <input
                      type="text"
                      value={formData.supplier}
                      onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Ej: Epson España"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock Actual
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.currentStock}
                      onChange={(e) => setFormData({ ...formData, currentStock: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock Mínimo
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.minStock}
                      onChange={(e) => setFormData({ ...formData, minStock: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock Máximo
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.maxStock}
                      onChange={(e) => setFormData({ ...formData, maxStock: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unidad de Medida
                    </label>
                    <input
                      type="text"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Ej: litros, metros, unidades"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Precio de Coste (€)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.costPrice}
                      onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Notas adicionales sobre el material..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    showAddModal ? setShowAddModal(false) : setShowEditModal(false)
                    resetForm()
                    setSelectedMaterial(null)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={isLoading}
                >
                  Cancelar
                </button>
                <button
                  onClick={showAddModal ? handleAddMaterial : handleEditMaterial}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Guardando...
                    </div>
                  ) : (
                    showAddModal ? 'Crear Material' : 'Guardar Cambios'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
