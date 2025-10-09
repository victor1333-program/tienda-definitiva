"use client"

import { lazy, Suspense } from 'react'
import AdminTableSkeleton from '@/components/admin/loading/AdminTableSkeleton'

// Lazy load del componente principal
const InvoicesPageContent = lazy(() => import('./InvoicesPageContent'))

export default function LazyInvoicesPage() {
  return (
    <Suspense fallback={
      <AdminTableSkeleton 
        rows={10} 
        columns={6}
        showHeader={true}
        showPagination={true}
        showFilters={true}
      />
    }>
      <InvoicesPageContent />
    </Suspense>
  )
}