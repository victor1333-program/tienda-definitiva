import { useEffect, useState } from 'react'

export interface MenuItem {
  id: string
  label: string
  url?: string | null
  linkType: string
  pageType?: string | null
  categoryId?: string | null
  category?: {
    id: string
    name: string
    slug: string
  } | null
  target: string
  sortOrder: number
  isActive: boolean
  icon?: string | null
  children?: MenuItem[]
}

export interface Menu {
  id: string
  name: string
  slug: string
  location: string
  isActive: boolean
  items: MenuItem[]
}

// Función para construir la jerarquía del menú
function buildMenuTree(items: MenuItem[]): MenuItem[] {
  const itemMap = new Map<string, MenuItem>()
  const rootItems: MenuItem[] = []

  // Crear mapa de items
  items.forEach(item => {
    itemMap.set(item.id, { ...item, children: [] })
  })

  // Construir árbol
  items.forEach(item => {
    const mappedItem = itemMap.get(item.id)!
    if (item.parentId) {
      const parent = itemMap.get(item.parentId)
      if (parent) {
        parent.children!.push(mappedItem)
      }
    } else {
      rootItems.push(mappedItem)
    }
  })

  return rootItems.sort((a, b) => a.sortOrder - b.sortOrder)
}

export function useMenu(location: string = 'HEADER') {
  const [menu, setMenu] = useState<Menu | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMenu() {
      try {
        setLoading(true)
        // Agregar timestamp para evitar caché del navegador
        const timestamp = new Date().getTime()
        const response = await fetch(`/api/menus?location=${location}&_t=${timestamp}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        })

        if (!response.ok) {
          throw new Error('Error al cargar el menú')
        }

        const menus = await response.json()

        // Tomar el primer menú activo de la ubicación solicitada
        let activeMenu = menus.find((m: Menu) => m.isActive && m.location === location)

        // Construir la jerarquía del menú
        if (activeMenu && activeMenu.items) {
          activeMenu = {
            ...activeMenu,
            items: buildMenuTree(activeMenu.items)
          }
        }

        setMenu(activeMenu || null)
        setError(null)
      } catch (err) {
        console.error('Error fetching menu:', err)
        setError(err instanceof Error ? err.message : 'Error desconocido')
        setMenu(null)
      } finally {
        setLoading(false)
      }
    }

    fetchMenu()

    // Refrescar el menú cada 30 segundos para detectar cambios
    const interval = setInterval(fetchMenu, 30000)

    return () => clearInterval(interval)
  }, [location])

  return { menu, loading, error }
}

// Helper para generar URLs basadas en el tipo de enlace
export function getMenuItemUrl(item: MenuItem): string {
  switch (item.linkType) {
    case 'HOME':
      return '/'
    case 'CATEGORY':
      if (item.category) {
        return `/categoria/${item.category.slug}`
      }
      return '#'
    case 'CUSTOMIZER':
      return '/personalizador'
    case 'PAGE':
      switch (item.pageType) {
        case 'CATALOG':
          return '/productos'
        case 'CONTACT':
          return '/contacto'
        default:
          return item.url || '#'
      }
    case 'EXTERNAL':
      return item.url || '#'
    case 'CUSTOM':
      return item.url || '#'
    default:
      return '#'
  }
}
