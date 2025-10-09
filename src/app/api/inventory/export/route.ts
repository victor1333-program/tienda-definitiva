import { NextRequest, NextResponse } from 'next/server'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db as prisma } from '@/lib/db'

// GET: Exportar inventario a CSV
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role === 'CUSTOMER') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Obtener todas las variantes con datos de producto
    const variants = await prisma.productVariant.findMany({
      include: {
        product: {
          select: {
            name: true,
            basePrice: true,
            category: {
              select: {
                name: true
              }
            }
          }
        },
        _count: {
          select: {
            orderItems: true,
            inventory: true
          }
        }
      },
      orderBy: [
        { product: { name: 'asc' } },
        { sku: 'asc' }
      ]
    })

    // Crear CSV
    const csvHeaders = [
      'SKU',
      'Producto',
      'Categoría',
      'Talla',
      'Color',
      'Material',
      'Stock',
      'Estado Stock',
      'Precio',
      'Precio Base',
      'Activo',
      'Pedidos',
      'Movimientos'
    ]

    const csvRows = variants.map(variant => {
      const stockStatus = variant.stock === 0 ? 'Sin stock' : 
                         variant.stock <= 5 ? 'Stock bajo' : 'Stock OK'
      
      return [
        variant.sku,
        variant.product.name,
        variant.product.category?.name || 'Sin categoría',
        variant.size || '',
        variant.color || '',
        variant.material || '',
        variant.stock.toString(),
        stockStatus,
        (variant.price || variant.product.basePrice).toFixed(2),
        variant.product.basePrice.toFixed(2),
        variant.isActive ? 'Sí' : 'No',
        variant._count.orderItems.toString(),
        variant._count.inventory.toString()
      ]
    })

    // Combinar headers y rows
    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')

    // Crear respuesta con el CSV
    const response = new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="inventario-${new Date().toISOString().split('T')[0]}.csv"`,
        'Cache-Control': 'no-cache'
      }
    })

    return response

  } catch (error) {
    console.error('Error exporting inventory:', error)
    return NextResponse.json(
      { error: 'Error al exportar inventario' },
      { status: 500 }
    )
  }
}