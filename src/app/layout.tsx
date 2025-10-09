import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/providers/SessionProvider";
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import SkipLink from "@/components/ui/SkipLink";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lovilike Personalizados - Productos Únicos para Eventos Especiales",
  description: "Productos personalizados para bodas, comuniones, bautizos, baby shower y textil personalizado. Detalles únicos para tus momentos especiales.",
  keywords: "productos personalizados, bodas, comuniones, bautizos, baby shower, textil personalizado, tazas personalizadas, eventos especiales",
  robots: "index, follow",
  authors: [{ name: "Lovilike Personalizados" }],
  generator: "Next.js",
  applicationName: "Lovilike Personalizados",
  referrer: "origin-when-cross-origin",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" }
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ],
    other: [
      { rel: "android-chrome", url: "/android-chrome-192x192.png", sizes: "192x192" },
      { rel: "android-chrome", url: "/android-chrome-512x512.png", sizes: "512x512" }
    ]
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "light",
  themeColor: "#FB6D0E",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
      </head>
      <body className={`${inter.className} antialiased`}>
        <SkipLink />
        <SessionProvider>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </SessionProvider>
      </body>
    </html>
  );
}
