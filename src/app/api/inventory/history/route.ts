import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/auth"
import { getInventoryHistory, generateInventoryReport, getInventoryAlerts } from '@/lib/inventory-tracking'

// GET: Obtener historial de inventario
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'history'
    
    switch (action) {
      case 'history': {
        const productId = searchParams.get('productId')
        const variantId = searchParams.get('variantId')
        const limit = parseInt(searchParams.get('limit') || '50')
        const offset = parseInt(searchParams.get('offset') || '0')
        const dateFrom = searchParams.get('dateFrom') 
          ? new Date(searchParams.get('dateFrom')!) 
          : undefined
        const dateTo = searchParams.get('dateTo') 
          ? new Date(searchParams.get('dateTo')!) 
          : undefined
        const movementTypes = searchParams.get('movementTypes')?.split(',')

        if (!productId) {
          return NextResponse.json({ 
            error: 'Product ID es requerido para obtener historial' 
          }, { status: 400 })
        }

        const history = await getInventoryHistory(productId, variantId || undefined, {
          limit,
          offset,
          dateFrom,
          dateTo,
          movementTypes: movementTypes as any
        })

        return NextResponse.json({
          success: true,
          ...history
        })
      }

      case 'report': {
        const dateFrom = searchParams.get('dateFrom') 
          ? new Date(searchParams.get('dateFrom')!) 
          : undefined
        const dateTo = searchParams.get('dateTo') 
          ? new Date(searchParams.get('dateTo')!) 
          : undefined
        const productIds = searchParams.get('productIds')?.split(',')
        const movementTypes = searchParams.get('movementTypes')?.split(',')
        const userId = searchParams.get('userId')
        const supplierId = searchParams.get('supplierId')

        const report = await generateInventoryReport({
          dateFrom,
          dateTo,
          productIds,
          movementTypes: movementTypes as any,
          userId: userId || undefined,
          supplierId: supplierId || undefined
        })

        return NextResponse.json({
          success: true,
          report
        })
      }

      case 'alerts': {
        const alerts = await getInventoryAlerts()

        return NextResponse.json({
          success: true,
          alerts
        })
      }

      default:
        return NextResponse.json({ 
          error: `Acción '${action}' no válida` 
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Error in inventory history API:', error)
    return NextResponse.json({
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}