"use client"

import { usePathname } from "next/navigation"
import dynamic from "next/dynamic"
import Header from "./Header"
import Footer from "./Footer"

// Test both lazy components
const CartSidebar = dynamic(() => import("./CartSidebar"), {
  loading: () => null,
  ssr: false
})

const WhatsAppWidget = dynamic(() => import("../WhatsAppWidget"), {
  loading: () => null,
  ssr: false
})

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAdminRoute = pathname.startsWith('/admin')
  const isAuthRoute = pathname.startsWith('/auth')
  const isEditorRoute = pathname.startsWith('/editor')

  if (isAdminRoute || isAuthRoute || isEditorRoute) {
    return (
      <main className="min-h-screen" id="main-content" tabIndex={-1}>
        {children}
      </main>
    )
  }

  // Test with both components added
  return (
    <>
      <Header />
      <main className="min-h-screen" id="main-content" tabIndex={-1}>
        {children}
      </main>
      <Footer />
      <CartSidebar />
      <WhatsAppWidget />
    </>
  )
}