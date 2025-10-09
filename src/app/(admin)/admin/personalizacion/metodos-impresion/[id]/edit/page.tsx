'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Save, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';

interface Product {
  id: string;
  title: string;
  variants: Array<{
    id: string;
    name: string;
    color: string;
    size: string;
  }>;
  sides?: Array<{
    id: string;
    name: string;
  }>;
}

export default function EditPrintingMethodPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showProductsDropdown, setShowProductsDropdown] = useState(false);

  const [formData, setFormData] = useState({
    // Información básica
    name: '',
    isActive: true,

    // Archivos listos para imprimir
    outputFormat: 'PDF',
    dpi: 300,
    singleFile: true,
    useCMYKProfile: false,
    duplicateFiles: false,
    replaceColors: false,

    // Configuración general
    maxColors: null as number | null,

    // Configuración de texto
    allowText: true,
    allowTextArt: true,
    allowTextBox: true,
    allowCurvedText: true,
    allowBold: true,
    allowItalic: true,
    allowUppercase: true,
    maxTextElements: 0,
    defaultTextColor: '#287fb9',
    predefinedColors: [] as string[],
    textResizeMode: 'UNRESTRICTED',
    defaultFontSize: null as number | null,
    enableTextStroke: false,
    allowTextOutline: false,

    // Interlineado
    minLineSpacing: null as number | null,
    maxLineSpacing: null as number | null,

    // Espaciado de letras
    minLetterSpacing: null as number | null,
    maxLetterSpacing: null as number | null,

    // Alineación
    allowLeftAlign: true,
    allowCenterAlign: true,
    allowRightAlign: true,
    allowJustifyAlign: true,
    allowTopAlign: true,
    allowMiddleAlign: true,
    allowBottomAlign: true,

    // Configuración de imágenes
    enableImageGallery: true,
    autoFitImages: true,
    preventImageResize: false,
    allowUserUploads: true,
    allowLargeFiles: false,
    maxImages: 0,
    allowImageStretch: false,
    allowSVGColorChange: false,

    // Formatos aceptados
    acceptPNG: true,
    acceptJPG: true,
    acceptSVG: true,
    acceptPDF: true,
    acceptEPS: false,
    acceptAI: false,
    allowPDFRaster: false,
    convertPDFToRaster: false,
    resizeLargePDF: true,
    convertEPSToRaster: false,
    convertAIToRaster: false,
    allowFacebookPhotos: false,
    allowPremiumPhotos: false,

    // Herramientas de edición
    enableImageTools: true,
    enableTransform: true,
    enableFilters: true,
    enableAdjustments: true,
    enableFocus: true,
    enableBrush: true,
    enableFrames: true,
    enableOverlay: true,

    // PDF Preview
    allowPDFPreview: true,

    // Herramientas generales
    allowDuplicate: true,
    allowFlip: true,
    allowLayerOrder: true,

    // Sombras
    enableTextShadow: false,
    includeShadowInPrint: false,
    defaultShadowColor: '#000000',
    defaultShadowBlur: 2,
    minShadowBlur: 0,
    maxShadowBlur: 50,
    defaultShadowDistance: 2,
    minShadowDistance: 0,
    maxShadowDistance: 200,
    defaultShadowAngle: 45,
    minShadowAngle: 0,
    maxShadowAngle: 359,

    // Fuentes
    availableFonts: ['Adamina', 'Aladin', 'Amatic SC', 'Amiri', 'Arimo', 'Arizonia', 'Berkshire Swash', 'Cairo', 'Condiment', 'Cookie', 'Damion', 'EB Garamond', 'Fondamento', 'Gloria Hallelujah', 'IM FELL English', 'Indie Flower', 'Kaushan Script', 'Kirang Haerang', 'Leckerli One', 'Long Cang', 'Mada', 'Merienda One', 'NanumGothic', 'Noto Sans SC', 'Pacifico', 'Patrick Hand', 'Permanent Marker', 'Ramaraja', 'Rock Salt', 'Rubik', 'Shippori Mincho', 'Tinos', 'Train One', 'ZCOOL XiaoWei'],
    defaultFont: null as string | null,

    // Efectos
    enableEngraving: false,
    enableFullColorWood: false,

    // Productos asociados
    applicableProducts: [] as string[],
    productSides: {} as Record<string, string[]> // productId -> sideIds
  });

  useEffect(() => {
    if (params.id) {
      fetchPrintingMethod();
    }
  }, [params.id]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.product-search-container')) {
        setShowProductsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchProducts = async (searchTerm: string = '') => {
    try {
      const url = searchTerm 
        ? `/api/products/personalizable?limit=100&search=${encodeURIComponent(searchTerm)}`
        : '/api/products/personalizable?limit=100';
      
      const response = await fetch(url);
      if (response.ok) {
        const result = await response.json();
        console.log('API Response:', result); // Debug log
        
        // La API personalizable devuelve { products: [], total: number }
        const productsArray = result.products || [];
        setProducts(productsArray);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleSearchProducts = async (term: string) => {
    setSearchTerm(term);
    if (term.length > 0) {
      setShowProductsDropdown(true);
      await fetchProducts(term);
    } else {
      setShowProductsDropdown(false);
      setProducts([]);
    }
  };

  const handleSelectProduct = (product: Product) => {
    // Verificar si el producto ya está seleccionado
    if (!selectedProducts.find(p => p.id === product.id)) {
      const newSelectedProducts = [...selectedProducts, product];
      setSelectedProducts(newSelectedProducts);
      
      // Actualizar formData
      setFormData(prev => ({
        ...prev,
        applicableProducts: [...prev.applicableProducts, product.id],
        productSides: {
          ...prev.productSides,
          [product.id]: product.sides?.map(side => side.id) || []
        }
      }));
    }
    
    setSearchTerm('');
    setShowProductsDropdown(false);
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== productId));
    setFormData(prev => ({
      ...prev,
      applicableProducts: prev.applicableProducts.filter(id => id !== productId),
      productSides: {
        ...prev.productSides,
        [productId]: []
      }
    }));
  };

  const fetchPrintingMethod = async () => {
    try {
      const response = await fetch(`/api/printing-methods/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        const applicableProducts = JSON.parse(data.applicableProducts || '[]');
        
        setFormData({
          ...data,
          predefinedColors: JSON.parse(data.predefinedColors || '[]'),
          availableFonts: JSON.parse(data.availableFonts || '[]'),
          applicableProducts: applicableProducts,
          productSides: JSON.parse(data.productSides || '{}')
        });

        // Cargar productos seleccionados para mostrarlos
        if (applicableProducts.length > 0) {
          await loadSelectedProducts(applicableProducts);
        }
      }
    } catch (error) {
      console.error('Error fetching printing method:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const loadSelectedProducts = async (productIds: string[]) => {
    try {
      // Cargar todos los productos personalizables
      const response = await fetch('/api/products/personalizable?limit=100');
      if (response.ok) {
        const result = await response.json();
        const productsArray = result.products || [];

        // Filtrar solo los productos que están asignados
        const selectedProds = productsArray.filter((product: any) => productIds.includes(product.id));
        setSelectedProducts(selectedProds);
      }
    } catch (error) {
      console.error('Error loading selected products:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/printing-methods/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/admin/personalizacion/metodos-impresion');
      } else {
        console.error('Error updating printing method');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleColorAdd = (colorType: 'predefined' | 'shadow') => {
    const color = prompt(`Ingrese el color en formato hexadecimal (ej: #FF0000):`);
    if (color && /^#[0-9A-F]{6}$/i.test(color)) {
      if (colorType === 'predefined') {
        setFormData(prev => ({
          ...prev,
          predefinedColors: [...prev.predefinedColors, color]
        }));
      }
    }
  };

  const handleColorRemove = (index: number, colorType: 'predefined' | 'shadow') => {
    if (colorType === 'predefined') {
      setFormData(prev => ({
        ...prev,
        predefinedColors: prev.predefinedColors.filter((_, i) => i !== index)
      }));
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/personalizacion/metodos-impresion"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Editar Método de Impresión</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Información básica */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Escriba el nombre del método de impresión..."
                required
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                Método activo
              </label>
            </div>
          </div>
        </div>

        {/* Archivos listos para imprimir */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Archivos listos para imprimir</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Formato de salida estándar
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['SVG', 'PDF', 'PNG', 'DXF'].map((format) => (
                  <label key={format} className="flex items-center">
                    <input
                      type="radio"
                      name="outputFormat"
                      value={format}
                      checked={formData.outputFormat === format}
                      onChange={(e) => setFormData(prev => ({ ...prev, outputFormat: e.target.value }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-900">{format}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                DPI
              </label>
              <input
                type="number"
                value={formData.dpi}
                onChange={(e) => setFormData(prev => ({ ...prev, dpi: parseInt(e.target.value) || 300 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="72"
                max="600"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="singleFile"
                  checked={formData.singleFile}
                  onChange={(e) => setFormData(prev => ({ ...prev, singleFile: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="singleFile" className="ml-2 flex items-center text-sm text-gray-900">
                  Obtenga un único archivo de impresión para todas las áreas / lados de impresión
                  <HelpCircle className="h-4 w-4 ml-1 text-gray-400" />
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="useCMYKProfile"
                  checked={formData.useCMYKProfile}
                  onChange={(e) => setFormData(prev => ({ ...prev, useCMYKProfile: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="useCMYKProfile" className="ml-2 flex items-center text-sm text-gray-900">
                  Utilizar un perfil CMYK personalizado para la salida PDF
                  <HelpCircle className="h-4 w-4 ml-1 text-gray-400" />
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="duplicateFiles"
                  checked={formData.duplicateFiles}
                  onChange={(e) => setFormData(prev => ({ ...prev, duplicateFiles: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="duplicateFiles" className="ml-2 flex items-center text-sm text-gray-900">
                  Archivos de impresión duplicados
                  <HelpCircle className="h-4 w-4 ml-1 text-gray-400" />
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="replaceColors"
                  checked={formData.replaceColors}
                  onChange={(e) => setFormData(prev => ({ ...prev, replaceColors: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="replaceColors" className="ml-2 flex items-center text-sm text-gray-900">
                  Reemplace los colores en el archivo final listo para imprimir
                  <HelpCircle className="h-4 w-4 ml-1 text-gray-400" />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Configuración */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Configuración</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="maxColorsEnabled"
                checked={formData.maxColors !== null}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  maxColors: e.target.checked ? 5 : null 
                }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="maxColorsEnabled" className="ml-2 flex items-center text-sm text-gray-900">
                Establezca un límite para el número de colores que los clientes pueden usar en un diseño
                <HelpCircle className="h-4 w-4 ml-1 text-gray-400" />
              </label>
            </div>
            {formData.maxColors !== null && (
              <div className="ml-6">
                <input
                  type="number"
                  value={formData.maxColors}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxColors: parseInt(e.target.value) || 1 }))}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="20"
                />
              </div>
            )}
          </div>
        </div>

        {/* Permitir a los usuarios agregar texto */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Permitir a los usuarios agregar texto</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allowTextArt"
                  checked={formData.allowTextArt}
                  onChange={(e) => setFormData(prev => ({ ...prev, allowTextArt: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="allowTextArt" className="ml-2 text-sm text-gray-900">TextArt</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allowTextBox"
                  checked={formData.allowTextBox}
                  onChange={(e) => setFormData(prev => ({ ...prev, allowTextBox: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="allowTextBox" className="ml-2 text-sm text-gray-900">Cuadro de texto</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allowCurvedText"
                  checked={formData.allowCurvedText}
                  onChange={(e) => setFormData(prev => ({ ...prev, allowCurvedText: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="allowCurvedText" className="ml-2 text-sm text-gray-900">Texto curvo</label>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allowBold"
                  checked={formData.allowBold}
                  onChange={(e) => setFormData(prev => ({ ...prev, allowBold: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="allowBold" className="ml-2 text-sm text-gray-900">Audaz</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allowItalic"
                  checked={formData.allowItalic}
                  onChange={(e) => setFormData(prev => ({ ...prev, allowItalic: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="allowItalic" className="ml-2 text-sm text-gray-900">Itálico</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allowUppercase"
                  checked={formData.allowUppercase}
                  onChange={(e) => setFormData(prev => ({ ...prev, allowUppercase: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="allowUppercase" className="ml-2 text-sm text-gray-900">Mayúsculo</label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número máximo de elementos de texto
                </label>
                <input
                  type="number"
                  value={formData.maxTextElements}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxTextElements: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">0 = sin límite</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color predeterminado
                </label>
                <input
                  type="color"
                  value={formData.defaultTextColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, defaultTextColor: e.target.value }))}
                  className="w-full h-10 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            {/* Conjunto predefinido de colores */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conjunto predefinido de colores para los textos
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.predefinedColors.map((color, index) => (
                  <div key={index} className="flex items-center gap-1 bg-gray-100 rounded px-2 py-1">
                    <div
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: color }}
                    ></div>
                    <span className="text-xs">{color}</span>
                    <button
                      type="button"
                      onClick={() => handleColorRemove(index, 'predefined')}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => handleColorAdd('predefined')}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                + Agregar color
              </button>
            </div>
          </div>
        </div>

        {/* Asignación de productos y lados */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Asignación de Productos</h2>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Busca y selecciona los productos a los que se aplicará este método de impresión y especifica en qué lados estará disponible.
            </p>
            
            {/* Buscador de productos */}
            <div className="relative product-search-container">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar productos
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearchProducts(e.target.value)}
                onFocus={() => {
                  if (searchTerm) setShowProductsDropdown(true);
                  else {
                    // Mostrar todos los productos cuando haga focus sin búsqueda
                    fetchProducts('');
                    setShowProductsDropdown(true);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Escribe para buscar productos o haz click para ver todos..."
              />
              
              {/* Dropdown de productos */}
              {showProductsDropdown && products.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleSelectProduct(product)}
                      className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-sm text-gray-900">{product.title || product.name}</div>
                      {product.sku && (
                        <div className="text-xs text-gray-500">SKU: {product.sku}</div>
                      )}
                      <div className="text-xs text-blue-600 mt-1">
                        📝 Producto personalizable • {product.sides?.length || 0} lados configurados
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Mostrar si no hay resultados */}
              {showProductsDropdown && searchTerm && products.length === 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4">
                  <p className="text-sm text-gray-500">No se encontraron productos</p>
                </div>
              )}
            </div>

            {/* Productos seleccionados */}
            {selectedProducts.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700">Productos seleccionados:</h3>
                {selectedProducts.map((product) => (
                  <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{product.title}</h4>
                        <p className="text-xs text-gray-500">ID: {product.id}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveProduct(product.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remover
                      </button>
                    </div>
                    
                    {product.sides && (
                      <div className="space-y-2">
                        <p className="text-xs text-gray-600 mb-2">Selecciona los lados donde estará disponible:</p>
                        <div className="grid grid-cols-2 gap-2">
                          {product.sides.map((side) => (
                            <div key={side.id} className="flex items-center">
                              <input
                                type="checkbox"
                                id={`side-${side.id}`}
                                checked={formData.productSides[product.id]?.includes(side.id) || false}
                                onChange={(e) => {
                                  const currentSides = formData.productSides[product.id] || [];
                                  const newSides = e.target.checked
                                    ? [...currentSides, side.id]
                                    : currentSides.filter(id => id !== side.id);
                                  
                                  setFormData(prev => ({
                                    ...prev,
                                    productSides: {
                                      ...prev.productSides,
                                      [product.id]: newSides
                                    }
                                  }));
                                }}
                                className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label htmlFor={`side-${side.id}`} className="ml-2 text-xs text-gray-700">
                                {side.name}
                              </label>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2">
                          <button
                            type="button"
                            onClick={() => {
                              const allSides = product.sides?.map(side => side.id) || [];
                              const currentSides = formData.productSides[product.id] || [];
                              const allSelected = allSides.every(sideId => currentSides.includes(sideId));
                              
                              setFormData(prev => ({
                                ...prev,
                                productSides: {
                                  ...prev.productSides,
                                  [product.id]: allSelected ? [] : allSides
                                }
                              }));
                            }}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            {formData.productSides[product.id]?.length === product.sides?.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {selectedProducts.length === 0 && (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">
                  No hay productos seleccionados. Usa el buscador para agregar productos.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Vista previa PDF */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Vista previa en PDF</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="allowPDFPreview"
                checked={formData.allowPDFPreview}
                onChange={(e) => setFormData(prev => ({ ...prev, allowPDFPreview: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="allowPDFPreview" className="ml-2 flex items-center text-sm text-gray-900">
                Permitir a los usuarios generar una vista previa en PDF de sus diseños (sin calidad de impresión)
                <HelpCircle className="h-4 w-4 ml-1 text-gray-400" />
              </label>
            </div>
            <p className="text-xs text-gray-500 ml-6">
              Esta función si está habilitada dejará visible el botón de PDF que tenemos en el Editor ahora al lado de Guardar. Si no está habilitada el botón se oculta.
            </p>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end gap-4 pb-8">
          <Link
            href="/admin/personalizacion/metodos-impresion"
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Save className="h-4 w-4" />
            )}
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}