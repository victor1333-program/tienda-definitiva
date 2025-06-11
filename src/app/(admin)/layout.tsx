import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Panel Admin - Lovilike Personalizados",
  description: "Panel de administración para gestión del negocio",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Solo el contenido del admin, sin header ni footer del frontend */}
      <main className="min-h-screen">
        {children}
      </main>
    </div>
  );
}