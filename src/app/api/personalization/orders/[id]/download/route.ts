import { NextRequest, NextResponse } from 'next/server'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db } from '@/lib/db'

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
    const { format, sideId, sideName } = await request.json()

    // Validar formato
    const validFormats = ['SVG', 'PNG', 'PDF', 'DXF', 'DXF HQ']
    if (!validFormats.includes(format)) {
      return NextResponse.json(
        { success: false, error: 'Formato no válido' },
        { status: 400 }
      )
    }

    // Obtener el pedido y verificar que existe
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
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

    // AQUÍ IRÍA LA LÓGICA REAL DE GENERACIÓN DEL ARCHIVO
    // Por ahora, creamos un archivo de ejemplo
    let fileContent: string
    let contentType: string
    let fileExtension: string

    switch (format) {
      case 'SVG':
        fileContent = generateSVGContent(designElements, sideName)
        contentType = 'image/svg+xml'
        fileExtension = 'svg'
        break
      case 'PNG':
        // En una implementación real, aquí se generaría el PNG
        fileContent = 'PNG file placeholder content'
        contentType = 'image/png'
        fileExtension = 'png'
        break
      case 'PDF':
        fileContent = generatePDFContent(order, designElements, sideName)
        contentType = 'application/pdf'
        fileExtension = 'pdf'
        break
      case 'DXF':
      case 'DXF HQ':
        fileContent = generateDXFContent(designElements, sideName)
        contentType = 'application/dxf'
        fileExtension = 'dxf'
        break
      default:
        fileContent = 'Default file content'
        contentType = 'text/plain'
        fileExtension = 'txt'
    }

    // Registrar la descarga en logs (opcional)

    // Retornar el archivo
    const buffer = Buffer.from(fileContent, 'utf-8')
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${order.orderNumber}_${sideName}_${format.toLowerCase()}.${fileExtension}"`,
        'Content-Length': buffer.length.toString(),
      },
    })

  } catch (error) {
    console.error('Error generating download file:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Funciones auxiliares para generar contenido de archivos
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

function generatePDFContent(order: any, designElements: any[], sideName: string): string {
  // En una implementación real, aquí se usaría una librería como PDFKit o similar
  return `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 200
>>
stream
BT
/F1 12 Tf
50 750 Td
(Pedido: ${order.orderNumber}) Tj
0 -20 Td
(Lado: ${sideName}) Tj
0 -20 Td
(Elementos de diseño: ${designElements.length}) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000120 00000 n 
0000000210 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
450
%%EOF`
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