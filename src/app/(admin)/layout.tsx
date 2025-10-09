"use client"

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // OPTIMIZACIÓN: Verificación más eficiente y menos bloqueos
    if (status === "loading") return;
    
    // Add delay to prevent rapid redirects
    const timer = setTimeout(() => {
      if (status === "unauthenticated") {
        router.push("/auth/signin");
        return;
      }

      if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
        router.push("/");
        return;
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" || (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN")) {
    return null; // Evitar flash de contenido mientras redirige
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <AdminSidebar />
      
      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}