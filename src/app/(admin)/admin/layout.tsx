import { auth } from "../../../../auth"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import AdminSidebar from "@/components/admin/AdminSidebar"
import AdminHeader from "@/components/admin/AdminHeader"
import AdminPageSkeleton from "@/components/admin/loading/AdminPageSkeleton"
import { Toaster } from "react-hot-toast"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    redirect("/auth/signin")
  }

  return (
    <div className="min-h-screen bg-gray-50 admin-layout">
      {/* Header fijo que ocupa todo el ancho */}
      <AdminHeader user={session.user} />
      
      {/* Sidebar fijo */}
      <AdminSidebar />
      
      {/* Contenido principal posicionado correctamente */}
      <main className="fixed top-20 left-56 right-0 bottom-0 overflow-y-scroll bg-gray-50 admin-content">
        <div className="p-4 pb-40">
          <Suspense fallback={
            <AdminPageSkeleton 
              showHeader={true}
              showStats={true}
              showTable={true}
              showActions={true}
            />
          }>
            {children}
          </Suspense>
        </div>
      </main>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4aed88',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ff4b4b',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  )
}