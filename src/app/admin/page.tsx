import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AdminDashboard() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Panel de Administración</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Tarjetas de secciones */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">Dashboard</h2>
          <p className="mb-4">Resumen de actividad</p>
          <Button href="/admin/dashboard">Ver Dashboard</Button>
        </Card>
        <Card>
          <h2 className="text-xl font-semibold mb-4">Pedidos</h2>
          <p className="mb-4">Gestión de pedidos</p>
          <Button href="/admin/orders">Ver Pedidos</Button>
        </Card>
        <Card>
          <h2 className="text-xl font-semibold mb-4">Productos</h2>
          <p className="mb-4">Catálogo y gestión</p>
          <Button href="/admin/products">Ver Productos</Button>
        </Card>
        <Card>
          <h2 className="text-xl font-semibold mb-4">Inventario</h2>
          <p className="mb-4">Control de stock</p>
          <Button href="/admin/inventory">Ver Inventario</Button>
        </Card>
        <Card>
          <h2 className="text-xl font-semibold mb-4">Finanzas</h2>
          <p className="mb-4">Gestión financiera</p>
          <Button href="/admin/finances">Ver Finanzas</Button>
        </Card>
        <Card>
          <h2 className="text-xl font-semibold mb-4">Clientes</h2>
          <p className="mb-4">Gestión de clientes</p>
          <Button href="/admin/customers">Ver Clientes</Button>
        </Card>
      </div>
    </div>
  );
}
