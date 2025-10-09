import HeroBanner from "@/components/home/HeroBanner"
import FeaturedProducts from "@/components/home/FeaturedProducts"
import TopSellingProducts from "@/components/home/TopSellingProducts"
import WhyChooseUs from "@/components/home/WhyChooseUs"
import CategoryLinks from "@/components/home/CategoryLinks"
import Testimonials from "@/components/home/Testimonials"
import { generateSEO } from "@/lib/seo"
import { Metadata } from "next"

export const metadata: Metadata = generateSEO({
  title: "Lovilike - Productos Personalizados para Eventos Especiales",
  description: "Productos personalizados únicos para bodas, comuniones, bautizos, baby shower y textil personalizado. Detalles especiales para tus momentos importantes.",
  keywords: ["productos personalizados", "bodas personalizadas", "comuniones", "bautizos", "baby shower", "textil personalizado", "tazas personalizadas", "eventos especiales"],
  url: "/"
})

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Hero Banner */}
      <HeroBanner />
      
      {/* Productos Destacados */}
      <FeaturedProducts />
      
      {/* Top Ventas */}
      <TopSellingProducts />
      
      {/* Por qué elegirnos */}
      <WhyChooseUs />
      
      {/* Enlaces a categorías importantes */}
      <CategoryLinks />
      
      {/* Testimonios */}
      <Testimonials />
    </main>
  )
}
