"use client"

import { useState, useEffect } from "react"
import { useParams, useSearchParams } from "next/navigation"
import useSWR from "swr"
import fetcher from "@/lib/fetcher"
import ZakekeAdvancedEditor from "@/components/editor/ZakekeAdvancedEditor"
import SizeQuantityModal from "@/components/editor/SizeQuantityModal"
import { useCartStore } from "@/lib/store"
import Link from "next/link"
import { toast } from "react-hot-toast"
import { ShoppingCart, FileText } from "lucide-react"

interface Product {
  id: string
  name: string
  basePrice: number
  images: string[]
  isPersonalizable?: boolean
  personalizationData?: any
  personalizationSettings?: any
  sides?: Array<{
    id: string
    name: string
    displayName?: string
    position: number
    image2D?: string
    image3D?: string
    printAreas: Array<{
      id: string
      name: string
      x: number
      y: number
      width: number
      height: number
      printingMethod: string
      allowText: boolean
      allowImages: boolean
      allowShapes?: boolean
      allowClipart?: boolean
      maxColors?: number
      basePrice?: number
    }>
    variantSideImages?: Array<{
      id: string
      variantId: string
      sideId: string
      imageUrl: string
    }>
  }>
  variants: Array<{
    id: string
    sku: string
    size: string
    colorName: string
    colorHex: string
    stock: number
    price: number
    width: number
    height: number
  }>
}

export default function EditorPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const productId = params.productId as string
  const templateId = searchParams.get('template')
  const [activeSideId, setActiveSideId] = useState('')
  const [showSizeModal, setShowSizeModal] = useState(false)
  const { addItem } = useCartStore()

  const { data, error, isLoading } = useSWR(
    productId ? `/api/products/public/${productId}?include=personalization,variants` : null,
    fetcher,
    { 
      timeout: 60000, // 60 seconds timeout
      errorRetryCount: 1,
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  )

  const product: Product = data
  
  
  // Usar lados reales de la base de datos o fallback a lados de ejemplo
  const sides = product?.sides && product.sides.length > 0 ? product.sides : [
    {
      id: 'front',
      name: 'Frente',
      image2D: product?.images?.[0] || '/placeholder-product.png',
      printAreas: [
        {
          id: 'front-chest',
          name: 'Pecho',
          x: 200,
          y: 150,
          width: 200,
          height: 100,
          printingMethod: 'DTG', // Valor por defecto, se puede cambiar en la configuración
          allowText: true,
          allowImages: true,
          allowShapes: true,
          allowClipart: true,
          maxColors: 5,
          basePrice: 5.00
        }
      ]
    },
    {
      id: 'back',
      name: 'Espalda',
      image2D: product?.images?.[1] || product?.images?.[0] || '/placeholder-product.png',
      printAreas: [
        {
          id: 'back-center',
          name: 'Centro Espalda',
          x: 200,
          y: 150,
          width: 200,
          height: 150,
          printingMethod: 'DTG', // Valor por defecto, se puede cambiar en la configuración
          allowText: true,
          allowImages: true,
          allowShapes: true,
          allowClipart: true,
          maxColors: 5,
          basePrice: 7.00
        }
      ]
    }
  ]
  
  
  // Establecer el primer lado como activo si no hay uno seleccionado
  useEffect(() => {
    if (sides.length > 0 && !activeSideId) {
      setActiveSideId(sides[0].id)
    }
  }, [sides, activeSideId])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600">No se pudo cargar el producto</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-gray-600">Error cargando el producto: {error.message}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  if (isLoading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando editor...</p>
          <p className="text-sm text-gray-400 mt-2">
            {isLoading ? 'Obteniendo datos del producto...' : 'Inicializando...'}
          </p>
        </div>
      </div>
    )
  }

  if (!product?.isPersonalizable) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Producto no personalizable</h1>
          <p className="text-gray-600">Este producto no tiene configuración de personalización</p>
          <p className="text-xs text-gray-400 mt-2">Debug: isPersonalizable = {JSON.stringify(product?.isPersonalizable)}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen bg-gray-900 flex flex-col">
      {/* Header del editor con logo y carrito */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-3">
            <img 
              src="/img/Social_Logo.png" 
              alt="Lovilike"
              className="h-10 w-auto"
            />
            <span className="text-xl font-bold text-gray-900">Lovilike</span>
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          <Link
            href="/carrito"
            className="p-3 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
          >
            <ShoppingCart className="w-8 h-8" />
          </Link>
        </div>
      </div>

      {/* Editor avanzado - ocupa el espacio disponible */}
      <div className="flex-1 overflow-hidden">
        <ZakekeAdvancedEditor 
          productId={product.id}
          sides={sides}
          variants={product.variants}
          templateId={templateId}
          onSave={(designData) => {
            // Design saved successfully
            toast.success('Diseño guardado correctamente')
          }}
          onDownloadPDF={() => {
            // This will be called from within the ZakekeAdvancedEditor
            // The actual PDF generation is handled internally
          }}
          initialDesign={null}
          isReadOnly={false}
          allowPersonalization={true}
        />
      </div>

      {/* Footer del editor con controles - SIEMPRE VISIBLE */}
      <div 
        className="bg-white border-t border-gray-200 p-4 flex-shrink-0"
        style={{ 
          position: 'relative',
          zIndex: 1000,
          minHeight: '100px',
          backgroundColor: 'white'
        }}
      >
        <div className="flex items-center justify-between">
          {/* Solo Volver al producto - izquierda */}
          <div className="flex items-center">
            <Link
              href={`/productos/${product.id}`}
              className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
            >
              ← Volver al producto
            </Link>
          </div>

          {/* Información del producto y acciones - derecha */}
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                {product?.name || 'Producto'}
              </div>
              <div className="text-lg font-bold text-gray-900">
                €{product?.basePrice || '0.00'}
              </div>
            </div>
            <button 
              onClick={() => {
                // Get the PDF download function from the editor
                const pdfButton = document.querySelector('[data-pdf-download]') as HTMLButtonElement
                if (pdfButton) {
                  pdfButton.click()
                } else {
                  toast.error('Editor no está listo para generar PDF')
                }
              }}
              className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              PDF
            </button>
            <button 
              onClick={() => {
                // Saving design...
                toast.success('Diseño guardado correctamente')
              }}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              Guardar
            </button>
            <button 
              onClick={() => setShowSizeModal(true)}
              className="bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
            >
              Elegir talla y Cantidad
            </button>
          </div>
        </div>
      </div>

      {/* Size and Quantity Modal */}
      <SizeQuantityModal
        isOpen={showSizeModal}
        onClose={() => setShowSizeModal(false)}
        variants={product?.variants || []}
        productName={product?.name || 'Producto'}
        basePrice={product?.basePrice || 0}
        onAddToCart={(selectedItems) => {
          // Adding selected items to cart
          
          // Add each selected item to the cart
          selectedItems.forEach((item) => {
            addItem({
              productId: product.id,
              variantId: item.variantId,
              name: product.name,
              variant: item.size,
              price: item.price,
              quantity: item.quantity,
              image: product?.images?.[0] || '/placeholder-product.png',
              size: item.size,
              isCustomized: true, // Since it's from the editor
              customDesignId: `design-${Date.now()}` // Temporary design ID
            })
          })
          
          const totalItems = selectedItems.reduce((total, item) => total + item.quantity, 0)
          toast.success(`${totalItems} artículo(s) añadido(s) al carrito`)
        }}
      />
    </div>
  )
}