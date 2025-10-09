import dynamic from 'next/dynamic'
import { ComponentType } from 'react'

// Admin Components - Lazy loaded
export const AdminSidebar = dynamic(() => import('./admin/AdminSidebar'), {
  loading: () => <div className="w-64 bg-gray-100 animate-pulse" />,
  ssr: false
})

export const AdminHeader = dynamic(() => import('./admin/AdminHeader'), {
  loading: () => <div className="h-16 bg-white border-b animate-pulse" />,
  ssr: false
})

export const NotificationCenter = dynamic(() => import('./admin/notifications/NotificationCenter'), {
  loading: () => <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />,
  ssr: false
})

// Product Editor Components - Heavy admin components
export const GeneralProductEditor = dynamic(() => import('./admin/products/GeneralProductEditor'), {
  loading: () => <div className="p-4 bg-gray-50 animate-pulse rounded-lg">Cargando editor...</div>,
  ssr: false
})

export const VariantsManager = dynamic(() => import('./admin/products/VariantsManager'), {
  loading: () => <div className="p-4 bg-gray-50 animate-pulse rounded-lg">Cargando variantes...</div>,
  ssr: false
})


// Design Canvas - Heavy editor component
export const DesignCanvas = dynamic(() => import('./editor/DesignCanvas'), {
  loading: () => <div className="w-full h-96 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
    <span className="text-gray-500">Cargando editor de diseño...</span>
  </div>,
  ssr: false
})

// Chart Components - Heavy visualization components
export const LineChart = dynamic(() => import('./charts/LineChart'), {
  loading: () => <div className="w-full h-64 bg-gray-100 animate-pulse rounded-lg" />,
  ssr: false
})

export const BarChart = dynamic(() => import('./charts/BarChart'), {
  loading: () => <div className="w-full h-64 bg-gray-100 animate-pulse rounded-lg" />,
  ssr: false
})

export const DonutChart = dynamic(() => import('./charts/DonutChart'), {
  loading: () => <div className="w-64 h-64 bg-gray-100 animate-pulse rounded-full mx-auto" />,
  ssr: false
})

// Content Builder Components
export const PageBuilder = dynamic(() => import('./admin/content/PageBuilder'), {
  loading: () => <div className="p-4 bg-gray-50 animate-pulse rounded-lg">Cargando constructor de páginas...</div>,
  ssr: false
})

export const ThemeManager = dynamic(() => import('./admin/content/ThemeManager'), {
  loading: () => <div className="p-4 bg-gray-50 animate-pulse rounded-lg">Cargando gestor de temas...</div>,
  ssr: false
})

// Performance Monitor - Development only
export const PerformanceMonitor = dynamic(() => import('./admin/PerformanceMonitor'), {
  loading: () => null,
  ssr: false
})

// Auth Modal - Only load when needed
export const AuthModal = dynamic(() => import('./auth/AuthModal'), {
  loading: () => <div className="fixed inset-0 bg-black/35 backdrop-blur-sm flex items-center justify-center">
    <div className="bg-white p-6 rounded-lg animate-pulse">Cargando...</div>
  </div>,
  ssr: false
})