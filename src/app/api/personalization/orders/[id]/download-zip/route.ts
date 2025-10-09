import { NextRequest, NextResponse } from 'next/server'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db } from '@/lib/db'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    
    const resolvedParams = await params;
    const session = await auth()
    
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const orderId = resolvedParams.id
    const { sideId, sideName } = await request.json()

    // Obtener el pedido y verificar que existe
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true
              }
            },
            variant: {
              select: {
                id: true,
                name: true
              }
            },
            designElements: {
              where: {
                printArea: {
                  sideId: sideId
                }
              },
              include: {
                printArea: {
                  include: {
                    side: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Pedido no encontrado' },
        { status: 404 }
      )
    }

    // Obtener elementos de diseño para el lado especificado
    const designElements = order.orderItems.flatMap(item => 
      item.designElements.filter(element => 
        element.printArea.sideId === sideId
      )
    )

    if (designElements.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No se encontraron elementos de diseño para este lado' },
        { status: 404 }
      )
    }

    // Crear el contenido del ZIP (simulado)
    // En una implementación real, usarías una librería como 'jszip'
    const zipContent = await generateZipContent(order, designElements, sideName)
    
    const buffer = Buffer.from(zipContent, 'base64')
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${order.orderNumber}_${sideName}_completo.zip"`,
        'Content-Length': buffer.length.toString(),
      },
    })

  } catch (error) {
    console.error('Error generating ZIP file:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

async function generateZipContent(order: any, designElements: any[], sideName: string): Promise<string> {
  // En una implementación real, aquí usarías JSZip o similar
  // Por ahora, simulamos el contenido del ZIP
  
  const orderSummary = generateOrderSummary(order, designElements, sideName)
  
  // Simular contenido ZIP en base64
  // En la implementación real, crearías archivos SVG, PNG, PDF, DXF reales
  const mockZipContent = {
    [`${order.orderNumber}_${sideName}.svg`]: generateSVGContent(designElements, sideName),
    [`${order.orderNumber}_${sideName}.pdf`]: 'PDF content placeholder',
    [`${order.orderNumber}_${sideName}.dxf`]: generateDXFContent(designElements, sideName),
    [`${order.orderNumber}_${sideName}_summary.txt`]: orderSummary
  }
  
  // Convertir a base64 (simplificado)
  const zipContentString = JSON.stringify(mockZipContent)
  return Buffer.from(zipContentString).toString('base64')
}

function generateOrderSummary(order: any, designElements: any[], sideName: string): string {
  const orderItems = order.orderItems.filter((item: any) => 
    item.designElements.some((element: any) => 
      element.printArea.sideId === designElements[0]?.printArea.sideId
    )
  )

  return `RESUMEN DEL PEDIDO - PERSONALIZACIÓN
========================================

Número de Pedido: ${order.orderNumber}
Fecha: ${format(new Date(order.createdAt), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}
Cliente: ${order.user.name} (${order.user.email})

PRODUCTOS CON PERSONALIZACIÓN:
${orderItems.map((item: any) => `
- ${item.product.name}
  SKU: ${item.product.sku}
  Cantidad: ${item.quantity}
  ${item.variant ? `Variante: ${item.variant.name}` : ''}
`).join('')}

LADO PERSONALIZADO: ${sideName}
========================================

ELEMENTOS DE DISEÑO:
${designElements.map((element: any, index: number) => {
  const positioning = typeof element.positioning === 'string' 
    ? JSON.parse(element.positioning) 
    : element.positioning || {}
  
  const styling = typeof element.styling === 'string'
    ? JSON.parse(element.styling)
    : element.styling || {}

  return `
${index + 1}. Tipo: ${element.type}
   Contenido: ${element.content}
   Área de impresión: ${element.printArea.name}
   Posición: x=${positioning.x || 0}, y=${positioning.y || 0}
   ${element.type === 'TEXT' ? `Color: ${styling.color || 'N/A'}, Tamaño: ${styling.fontSize || 'N/A'}` : ''}
`
}).join('')}

ARCHIVOS INCLUIDOS EN ESTE ZIP:
- ${order.orderNumber}_${sideName}.svg (Gráfico vectorial)
- ${order.orderNumber}_${sideName}.pdf (Documento listo para imprimir)
- ${order.orderNumber}_${sideName}.dxf (AutoCAD)
- ${order.orderNumber}_${sideName}_summary.txt (Este archivo)

========================================
Generado el: ${format(new Date(), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}
`
}

// Reutilizar funciones del archivo anterior
function generateSVGContent(designElements: any[], sideName: string): string {
  const elements = designElements.map(element => {
    const positioning = typeof element.positioning === 'string' 
      ? JSON.parse(element.positioning) 
      : element.positioning || {}
    
    const styling = typeof element.styling === 'string'
      ? JSON.parse(element.styling)
      : element.styling || {}

    switch (element.type) {
      case 'TEXT':
        return `<text x="${positioning.x || 0}" y="${positioning.y || 0}" 
                      fill="${styling.color || '#000000'}" 
                      font-size="${styling.fontSize || 16}" 
                      font-family="${styling.fontFamily || 'Arial'}">${element.content}</text>`
      case 'IMAGE':
        return `<image x="${positioning.x || 0}" y="${positioning.y || 0}" 
                       width="${positioning.width || 100}" height="${positioning.height || 100}" 
                       href="${element.content}"/>`
      default:
        return `<!-- ${element.type}: ${element.content} -->`
    }
  }).join('\n    ')

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <rect width="400" height="400" fill="white"/>
  <!-- Lado: ${sideName} -->
  ${elements}
</svg>`
}

function generateDXFContent(designElements: any[], sideName: string): string {
  return `0
SECTION
2
HEADER
0
ENDSEC
0
SECTION
2
TABLES
0
ENDSEC
0
SECTION
2
BLOCKS
0
ENDSEC
0
SECTION
2
ENTITIES
${designElements.map((element, index) => {
  const positioning = typeof element.positioning === 'string' 
    ? JSON.parse(element.positioning) 
    : element.positioning || {}
  
  if (element.type === 'TEXT') {
    return `0
TEXT
8
0
10
${positioning.x || 0}
20
${positioning.y || 0}
1
${element.content}`
  }
  return ''
}).join('\n')}
0
ENDSEC
0
EOF`
}