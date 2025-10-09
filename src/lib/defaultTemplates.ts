// Plantillas predefinidas para la tienda

export const defaultTemplates = [
  {
    name: "Camiseta Motivacional",
    description: "Plantilla perfecta para frases motivacionales en camisetas",
    category: "motivational",
    tags: ["motivacion", "texto", "simple"],
    elements: [
      {
        id: "text-main",
        type: "text",
        x: 400,
        y: 250,
        width: 300,
        height: 60,
        rotation: 0,
        zIndex: 1,
        text: "NUNCA TE RINDAS",
        fontSize: 32,
        fontFamily: "Arial Black",
        fontWeight: "bold",
        textAlign: "center",
        color: "#ffffff"
      },
      {
        id: "text-subtitle",
        type: "text",
        x: 400,
        y: 320,
        width: 250,
        height: 30,
        rotation: 0,
        zIndex: 2,
        text: "La persistencia vence",
        fontSize: 16,
        fontFamily: "Arial",
        fontWeight: "normal",
        textAlign: "center",
        color: "#cccccc"
      }
    ],
    canvasSize: { width: 800, height: 600 },
    canvasBackground: "#1f2937"
  },
  {
    name: "Logo Empresarial",
    description: "Plantilla clásica para logos de empresa",
    category: "business",
    tags: ["empresa", "logo", "profesional"],
    elements: [
      {
        id: "company-name",
        type: "text",
        x: 400,
        y: 200,
        width: 400,
        height: 50,
        rotation: 0,
        zIndex: 1,
        text: "TU EMPRESA",
        fontSize: 36,
        fontFamily: "Times New Roman",
        fontWeight: "bold",
        textAlign: "center",
        color: "#1e40af"
      },
      {
        id: "tagline",
        type: "text",
        x: 400,
        y: 260,
        width: 300,
        height: 25,
        rotation: 0,
        zIndex: 2,
        text: "Excelencia en cada detalle",
        fontSize: 14,
        fontFamily: "Arial",
        fontWeight: "normal",
        textAlign: "center",
        color: "#6b7280"
      },
      {
        id: "decoration",
        type: "shape",
        x: 350,
        y: 300,
        width: 100,
        height: 3,
        rotation: 0,
        zIndex: 3,
        shapeType: "rectangle",
        fillColor: "#1e40af",
        strokeColor: "#1e40af",
        strokeWidth: 0
      }
    ],
    canvasSize: { width: 800, height: 600 },
    canvasBackground: "#ffffff"
  },
  {
    name: "Evento Festivo",
    description: "Diseño colorido para eventos y celebraciones",
    category: "events",
    tags: ["fiesta", "evento", "colorido"],
    elements: [
      {
        id: "event-title",
        type: "text",
        x: 400,
        y: 150,
        width: 350,
        height: 60,
        rotation: 0,
        zIndex: 3,
        text: "¡GRAN CELEBRACIÓN!",
        fontSize: 28,
        fontFamily: "Arial Black",
        fontWeight: "bold",
        textAlign: "center",
        color: "#ffffff"
      },
      {
        id: "date-info",
        type: "text",
        x: 400,
        y: 220,
        width: 200,
        height: 30,
        rotation: 0,
        zIndex: 4,
        text: "15 de Diciembre 2024",
        fontSize: 16,
        fontFamily: "Arial",
        fontWeight: "normal",
        textAlign: "center",
        color: "#fef3c7"
      },
      {
        id: "background-circle",
        type: "shape",
        x: 250,
        y: 100,
        width: 300,
        height: 300,
        rotation: 0,
        zIndex: 1,
        shapeType: "circle",
        fillColor: "#dc2626",
        strokeColor: "#b91c1c",
        strokeWidth: 3
      },
      {
        id: "accent-circle",
        type: "shape",
        x: 450,
        y: 200,
        width: 80,
        height: 80,
        rotation: 0,
        zIndex: 2,
        shapeType: "circle",
        fillColor: "#fbbf24",
        strokeColor: "#f59e0b",
        strokeWidth: 2
      }
    ],
    canvasSize: { width: 800, height: 600 },
    canvasBackground: "#1f2937"
  },
  {
    name: "Promoción Descuento",
    description: "Llamativo diseño para promociones y ofertas",
    category: "marketing",
    tags: ["descuento", "oferta", "promocion"],
    elements: [
      {
        id: "discount-percent",
        type: "text",
        x: 400,
        y: 200,
        width: 200,
        height: 80,
        rotation: 0,
        zIndex: 2,
        text: "50%",
        fontSize: 72,
        fontFamily: "Arial Black",
        fontWeight: "bold",
        textAlign: "center",
        color: "#ffffff"
      },
      {
        id: "discount-text",
        type: "text",
        x: 400,
        y: 280,
        width: 150,
        height: 30,
        rotation: 0,
        zIndex: 3,
        text: "DESCUENTO",
        fontSize: 18,
        fontFamily: "Arial",
        fontWeight: "bold",
        textAlign: "center",
        color: "#ffffff"
      },
      {
        id: "promo-bg",
        type: "shape",
        x: 300,
        y: 150,
        width: 200,
        height: 200,
        rotation: 45,
        zIndex: 1,
        shapeType: "rectangle",
        fillColor: "#dc2626",
        strokeColor: "#b91c1c",
        strokeWidth: 4
      },
      {
        id: "limited-time",
        type: "text",
        x: 400,
        y: 350,
        width: 200,
        height: 25,
        rotation: 0,
        zIndex: 4,
        text: "¡Tiempo limitado!",
        fontSize: 14,
        fontFamily: "Arial",
        fontWeight: "normal",
        textAlign: "center",
        color: "#374151"
      }
    ],
    canvasSize: { width: 800, height: 600 },
    canvasBackground: "#f9fafb"
  },
  {
    name: "Diploma Certificado",
    description: "Elegante plantilla para diplomas y certificados",
    category: "education",
    tags: ["diploma", "certificado", "educacion"],
    elements: [
      {
        id: "certificate-title",
        type: "text",
        x: 400,
        y: 100,
        width: 300,
        height: 40,
        rotation: 0,
        zIndex: 1,
        text: "CERTIFICADO DE",
        fontSize: 24,
        fontFamily: "Times New Roman",
        fontWeight: "bold",
        textAlign: "center",
        color: "#1f2937"
      },
      {
        id: "achievement",
        type: "text",
        x: 400,
        y: 150,
        width: 400,
        height: 50,
        rotation: 0,
        zIndex: 2,
        text: "EXCELENCIA",
        fontSize: 36,
        fontFamily: "Times New Roman",
        fontWeight: "bold",
        textAlign: "center",
        color: "#b91c1c"
      },
      {
        id: "recipient-label",
        type: "text",
        x: 400,
        y: 250,
        width: 200,
        height: 25,
        rotation: 0,
        zIndex: 3,
        text: "Se otorga a:",
        fontSize: 16,
        fontFamily: "Times New Roman",
        fontWeight: "normal",
        textAlign: "center",
        color: "#374151"
      },
      {
        id: "recipient-name",
        type: "text",
        x: 400,
        y: 290,
        width: 350,
        height: 40,
        rotation: 0,
        zIndex: 4,
        text: "[Nombre del Recipiente]",
        fontSize: 28,
        fontFamily: "Times New Roman",
        fontWeight: "normal",
        fontStyle: "italic",
        textAlign: "center",
        color: "#1f2937"
      },
      {
        id: "border-decoration",
        type: "shape",
        x: 50,
        y: 50,
        width: 700,
        height: 500,
        rotation: 0,
        zIndex: 0,
        shapeType: "rectangle",
        fillColor: "transparent",
        strokeColor: "#d97706",
        strokeWidth: 8
      }
    ],
    canvasSize: { width: 800, height: 600 },
    canvasBackground: "#fffbeb"
  },
  {
    name: "Tarjeta Personal",
    description: "Diseño minimalista para tarjetas personales",
    category: "personal",
    tags: ["personal", "minimalista", "tarjeta"],
    elements: [
      {
        id: "personal-name",
        type: "text",
        x: 400,
        y: 200,
        width: 300,
        height: 50,
        rotation: 0,
        zIndex: 1,
        text: "Juan Pérez",
        fontSize: 32,
        fontFamily: "Helvetica",
        fontWeight: "normal",
        textAlign: "center",
        color: "#1f2937"
      },
      {
        id: "personal-title",
        type: "text",
        x: 400,
        y: 250,
        width: 250,
        height: 25,
        rotation: 0,
        zIndex: 2,
        text: "Diseñador Gráfico",
        fontSize: 16,
        fontFamily: "Helvetica",
        fontWeight: "normal",
        textAlign: "center",
        color: "#6b7280"
      },
      {
        id: "contact-info",
        type: "text",
        x: 400,
        y: 320,
        width: 200,
        height: 40,
        rotation: 0,
        zIndex: 3,
        text: "juan@email.com\n+34 123 456 789",
        fontSize: 12,
        fontFamily: "Helvetica",
        fontWeight: "normal",
        textAlign: "center",
        color: "#9ca3af"
      },
      {
        id: "accent-line",
        type: "shape",
        x: 350,
        y: 290,
        width: 100,
        height: 2,
        rotation: 0,
        zIndex: 4,
        shapeType: "rectangle",
        fillColor: "#3b82f6",
        strokeColor: "#3b82f6",
        strokeWidth: 0
      }
    ],
    canvasSize: { width: 800, height: 600 },
    canvasBackground: "#ffffff"
  }
]

export const createDefaultTemplates = async () => {
  try {
    const response = await fetch('/api/templates/install-defaults', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templates: defaultTemplates })
    })

    if (!response.ok) throw new Error('Error al instalar plantillas')
    
    const result = await response.json()
    return result
  } catch (error) {
    console.error('Error installing default templates:', error)
    throw error
  }
}