"use client"

import { usePathname } from "next/navigation"
import Header from "./Header"
import Footer from "./Footer"
import CartSidebar from "./CartSidebar"

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAdminRoute = pathname.startsWith('/admin')

  if (isAdminRoute) {
    // Solo el contenido para rutas de admin, sin header ni footer del frontend
    return (
      <main className="min-h-screen">
        {children}
      </main>
    )
  }

  // Layout normal del frontend con header, footer y carrito
  return (
    <>
      <Header />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
      <CartSidebar />
    </>
  )
}