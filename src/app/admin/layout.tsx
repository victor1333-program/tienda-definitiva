import { DashboardSidebar } from "@/components/admin/sidebar";
import { Toaster } from "@/components/ui/toaster";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen">
      <DashboardSidebar />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
