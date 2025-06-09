import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">Bienvenido a Tienda Definitiva</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Cards de secciones principales */}
        <div className="bg-card p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Administración</h2>
          <p className="mb-4">Gestiona tu negocio de manera eficiente</p>
          <Button href="/admin">Ir a Administración</Button>
        </div>
        <div className="bg-card p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Productos</h2>
          <p className="mb-4">Gestiona tu catálogo de productos</p>
          <Button href="/admin/products">Ver Productos</Button>
        </div>
        <div className="bg-card p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Pedidos</h2>
          <p className="mb-4">Gestiona tus pedidos y ventas</p>
          <Button href="/admin/orders">Ver Pedidos</Button>
        </div>
      </div>
    </div>
  );
}
