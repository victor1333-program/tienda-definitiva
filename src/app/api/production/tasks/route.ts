import { NextRequest, NextResponse } from "next/server"
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Get real order items as production tasks
    const orderItems = await db.orderItem.findMany({
      include: {
        order: true,
        product: true,
        variant: true,
        design: true
      },
      where: {
        order: {
          status: {
            in: ['CONFIRMED', 'IN_PRODUCTION', 'READY_FOR_PICKUP']
          }
        }
      },
      orderBy: {
        order: {
          createdAt: 'desc'
        }
      }
    })

    // Transform order items to production task format
    const tasks = orderItems.map(item => {
      // Map production status to frontend status format
      const statusMap: Record<string, string> = {
        'PENDING': 'pending',
        'IN_PROGRESS': 'in_progress', 
        'ON_HOLD': 'paused',
        'COMPLETED': 'completed'
      }

      // Determine task type based on product personalization type
      const taskTypeMap: Record<string, string> = {
        'DTF': 'printing',
        'SUBLIMATION': 'printing',
        'LASER_CUT': 'cutting',
        'EMBROIDERY': 'assembly',
        'VINYL': 'cutting'
      }

      const taskType = taskTypeMap[item.product.personalizationType] || 'assembly'
      
      // Calculate progress based on status
      const progressMap: Record<string, number> = {
        'pending': 0,
        'in_progress': 50,
        'paused': 30,
        'completed': 100
      }

      const status = statusMap[item.productionStatus] || 'pending'
      
      return {
        id: item.id,
        orderId: item.orderId,
        orderNumber: item.order.orderNumber,
        customerName: item.order.customerName,
        taskType,
        title: `${taskType === 'printing' ? 'Impresión' : taskType === 'cutting' ? 'Corte' : 'Producción'} - ${item.product.name}`,
        description: item.productionNotes || `Producir ${item.quantity} unidad(es) de ${item.product.name}`,
        status,
        priority: item.order.status === 'CONFIRMED' ? 'high' : 'medium',
        assignedTo: null, // We could add a worker assignment system later
        estimatedTime: 2, // Default estimated time
        actualTime: null,
        startedAt: null,
        completedAt: null,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
        dependencies: [],
        materials: [], // We could calculate this from the product materials
        equipment: null,
        progress: progressMap[status],
        notes: item.productionNotes,
        productionStage: taskType,
        orderValue: item.totalPrice
      }
    })

    return NextResponse.json(tasks)

  } catch (error) {
    console.error("Error fetching production tasks:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    
    // Here you would create a new task in your database
    // For now, we'll return a mock response
    const newTask = {
      id: `task-${Date.now()}`,
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json(newTask, { status: 201 })

  } catch (error) {
    console.error("Error creating production task:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}