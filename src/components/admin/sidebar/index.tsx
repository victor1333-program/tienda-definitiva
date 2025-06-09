import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

const DashboardSidebar = () => {
  return (
    <div className="flex flex-col w-64 border-r">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-6">
          <img src="/logo.png" alt="Logo" className="h-8 w-8" />
          <h1 className="text-xl font-bold">Dashboard</h1>
        </div>
        <nav className="space-y-2">
          {/* Secciones principales */}
          <Link href="/admin" className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted">
            <span className="text-lg">📊</span>
            <span>Dashboard</span>
          </Link>
          
          {/* Gestión */}
          <div className="space-y-1">
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">Gestión</div>
            <Link href="/admin/orders" className="flex items-center gap-2 p-3 pl-6 rounded-lg hover:bg-muted">
              <span className="text-lg">📦</span>
              <span>Pedidos</span>
            </Link>
            <Link href="/admin/products" className="flex items-center gap-2 p-3 pl-6 rounded-lg hover:bg-muted">
              <span className="text-lg">🏷️</span>
              <span>Productos</span>
            </Link>
            <Link href="/admin/inventory" className="flex items-center gap-2 p-3 pl-6 rounded-lg hover:bg-muted">
              <span className="text-lg">📦</span>
              <span>Inventario</span>
            </Link>
          </div>

          {/* Finanzas */}
          <div className="space-y-1">
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">Finanzas</div>
            <Link href="/admin/finances/dashboard" className="flex items-center gap-2 p-3 pl-6 rounded-lg hover:bg-muted">
              <span className="text-lg">📊</span>
              <span>Dashboard</span>
            </Link>
            <Link href="/admin/finances/invoices" className="flex items-center gap-2 p-3 pl-6 rounded-lg hover:bg-muted">
              <span className="text-lg">📄</span>
              <span>Facturas</span>
            </Link>
            <Link href="/admin/finances/expenses" className="flex items-center gap-2 p-3 pl-6 rounded-lg hover:bg-muted">
              <span className="text-lg">💰</span>
              <span>Gastos</span>
            </Link>
          </div>

          {/* Clientes */}
          <div className="space-y-1">
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">Clientes</div>
            <Link href="/admin/customers" className="flex items-center gap-2 p-3 pl-6 rounded-lg hover:bg-muted">
              <span className="text-lg">👥</span>
              <span>Clientes</span>
            </Link>
            <Link href="/admin/support" className="flex items-center gap-2 p-3 pl-6 rounded-lg hover:bg-muted">
              <span className="text-lg">📞</span>
              <span>Soporte</span>
            </Link>
          </div>

          {/* Configuración */}
          <div className="space-y-1">
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">Configuración</div>
            <Link href="/admin/settings/general" className="flex items-center gap-2 p-3 pl-6 rounded-lg hover:bg-muted">
              <span className="text-lg">⚙️</span>
              <span>General</span>
            </Link>
            <Link href="/admin/settings/payment-methods" className="flex items-center gap-2 p-3 pl-6 rounded-lg hover:bg-muted">
              <span className="text-lg">💳</span>
              <span>Métodos de Pago</span>
            </Link>
            <Link href="/admin/settings/security" className="flex items-center gap-2 p-3 pl-6 rounded-lg hover:bg-muted">
              <span className="text-lg">🔒</span>
              <span>Seguridad</span>
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default DashboardSidebar;
