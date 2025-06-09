import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

const Sidebar = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-64">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-6">
            <img src="/logo.png" alt="Logo" className="h-8 w-8" />
            <h1 className="text-xl font-bold">Tienda Definitiva</h1>
          </div>
          <nav className="space-y-2">
            {/* Enlaces principales */}
            <Link href="/" className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted">
              <span className="text-lg">🏠</span>
              <span>Inicio</span>
            </Link>
            <Link href="/admin" className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted">
              <span className="text-lg">⚙️</span>
              <span>Administración</span>
            </Link>
            <Link href="/admin/products" className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted">
              <span className="text-lg">📦</span>
              <span>Productos</span>
            </Link>
            <Link href="/admin/orders" className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted">
              <span className="text-lg">📦</span>
              <span>Pedidos</span>
            </Link>
            <Link href="/admin/finances" className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted">
              <span className="text-lg">💰</span>
              <span>Finanzas</span>
            </Link>
            <Link href="/admin/customers" className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted">
              <span className="text-lg">👥</span>
              <span>Clientes</span>
            </Link>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Sidebar;
