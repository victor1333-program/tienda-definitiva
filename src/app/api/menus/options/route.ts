import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Por ahora usamos datos estáticos para evitar problemas de base de datos
    const categories = [
      { id: '1', name: 'Bodas & Eventos', slug: 'bodas-eventos', description: 'Productos para bodas', icon: '💍' },
      { id: '2', name: 'Comuniones & Bautizos', slug: 'comuniones-bautizos', description: 'Productos religiosos', icon: '✝️' },
      { id: '3', name: 'Baby Shower', slug: 'baby-shower', description: 'Productos para bebés', icon: '👶' },
      { id: '4', name: 'Textil Personalizado', slug: 'textil-personalizado', description: 'Ropa personalizada', icon: '👕' },
      { id: '5', name: 'Tazas & Accesorios', slug: 'tazas-accesorios', description: 'Accesorios personalizados', icon: '☕' }
    ]
    
    const featuredProducts = [
      { id: '1', name: 'Taza Personalizada', slug: 'taza-personalizada', description: 'Taza con diseño personalizado' },
      { id: '2', name: 'Camiseta Personalizada', slug: 'camiseta-personalizada', description: 'Camiseta con tu diseño' }
    ]

    // Tipos de página predefinidos
    const pageTypes = [
      { id: 'HOME', label: 'Inicio', url: '/' },
      { id: 'ABOUT', label: 'Sobre Nosotros', url: '/about' },
      { id: 'CONTACT', label: 'Contacto', url: '/contact' },
      { id: 'CUSTOMIZER', label: 'Personalizador', url: '/customizer' },
      { id: 'CATALOG', label: 'Catálogo Completo', url: '/catalog' },
      { id: 'TERMS', label: 'Términos y Condiciones', url: '/terms' },
      { id: 'PRIVACY', label: 'Política de Privacidad', url: '/privacy' },
      { id: 'FAQ', label: 'Preguntas Frecuentes', url: '/faq' },
      { id: 'BLOG', label: 'Blog', url: '/blog' },
      { id: 'GALLERY', label: 'Galería', url: '/gallery' },
      { id: 'SERVICES', label: 'Servicios', url: '/services' }
    ]

    // Iconos disponibles (algunos ejemplos de Lucide React) con nombres en español
    const availableIcons = [
      { id: 'Home', label: '🏠 Casa/Inicio' },
      { id: 'Package', label: '📦 Paquete/Producto' },
      { id: 'Users', label: '👥 Usuarios' },
      { id: 'Mail', label: '✉️ Correo' },
      { id: 'Phone', label: '📞 Teléfono' },
      { id: 'Info', label: 'ℹ️ Información' },
      { id: 'Settings', label: '⚙️ Configuración' },
      { id: 'ShoppingCart', label: '🛒 Carrito de Compras' },
      { id: 'Heart', label: '❤️ Corazón/Favoritos' },
      { id: 'Star', label: '⭐ Estrella/Destacado' },
      { id: 'Search', label: '🔍 Buscar' },
      { id: 'Menu', label: '☰ Menú' },
      { id: 'X', label: '❌ Cerrar' },
      { id: 'ChevronDown', label: '⬇️ Flecha Abajo' },
      { id: 'ChevronRight', label: '➡️ Flecha Derecha' },
      { id: 'ArrowRight', label: '→ Flecha Derecha Grande' },
      { id: 'ExternalLink', label: '🔗 Enlace Externo' },
      { id: 'FileText', label: '📄 Documento' },
      { id: 'Image', label: '🖼️ Imagen' },
      { id: 'Palette', label: '🎨 Paleta/Diseño' },
      { id: 'Scissors', label: '✂️ Tijeras' },
      { id: 'Printer', label: '🖨️ Impresora' },
      { id: 'Shirt', label: '👕 Camiseta/Textil' },
      { id: 'Gift', label: '🎁 Regalo' },
      { id: 'Camera', label: '📷 Cámara' },
      { id: 'Brush', label: '🖌️ Pincel' },
      { id: 'Pen', label: '🖊️ Bolígrafo' },
      { id: 'Layers', label: '📚 Capas' },
      { id: 'Grid', label: '⊞ Cuadrícula' },
      { id: 'List', label: '📋 Lista' },
      { id: 'Tag', label: '🏷️ Etiqueta' },
      { id: 'Tags', label: '🏷️ Etiquetas' }
    ]

    return NextResponse.json({
      categories,
      featuredProducts,
      pageTypes,
      availableIcons,
      linkTypes: [
        { id: 'HOME', label: 'Página de Inicio' },
        { id: 'CATEGORY', label: 'Categoría de Productos' },
        { id: 'PRODUCT', label: 'Producto Específico' },
        { id: 'PAGE', label: 'Página Interna' },
        { id: 'CUSTOMIZER', label: 'Personalizador' },
        { id: 'EXTERNAL', label: 'URL Externa' },
        { id: 'CUSTOM', label: 'URL Personalizada' }
      ],
      targets: [
        { id: 'SELF', label: 'Misma ventana (_self)' },
        { id: 'BLANK', label: 'Nueva ventana (_blank)' },
        { id: 'PARENT', label: 'Ventana padre (_parent)' },
        { id: 'TOP', label: 'Ventana superior (_top)' }
      ]
    })
  } catch (error) {
    console.error('Error fetching menu options:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}