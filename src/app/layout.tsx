import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import CartSidebar from "@/components/layout/CartSidebar";
import SessionProvider from "@/components/providers/SessionProvider";
import ConditionalLayout from "@/components/layout/ConditionalLayout";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lovilike Personalizados - Productos Personalizados en Hellín",
  description: "Especialistas en personalización DTF, sublimación y corte láser. Camisetas, regalos y productos únicos en Hellín, Albacete.",
  keywords: "personalización, DTF, sublimación, láser, camisetas, Hellín, Albacete",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} antialiased`}>
        <SessionProvider>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </SessionProvider>
      </body>
    </html>
  );
}
