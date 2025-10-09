"use client";

{/* 
 * PÁGINA COMENTADA - SISTEMA ANTIGUO DE DISEÑOS
 * USAR /admin/personalizacion EN SU LUGAR
 *
 * El sistema de "Diseños" ha sido reemplazado por el nuevo sistema de "Personalización".
 * 
 * Migración:
 * - /admin/designs → /admin/personalizacion
 * - Design model → Personalization model
 * - AdvancedDesign model → PersonalizationOrder model
 * 
 * El nuevo sistema ofrece:
 * - Áreas de personalización estructuradas con formas geométricas
 * - Sistema de mockups por variante de producto
 * - Templates reutilizables de áreas
 * - Mejor integración con el sistema de productos
 */}

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DesignsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir automáticamente al nuevo sistema
    router.replace("/admin/personalizacion");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          Sistema Migrado
        </h2>
        <p className="text-gray-600 mb-4">
          El sistema de Diseños ha sido reemplazado por Personalización
        </p>
        <p className="text-sm text-gray-500">
          Redirigiendo al nuevo sistema...
        </p>
      </div>
    </div>
  );
}