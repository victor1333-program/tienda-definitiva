import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/auth"
import { db as prisma } from '@/lib/db'

interface ProductionStep {
  id?: string
  name: string
  description?: string
  duration?: number // en minutos
  order: number
  isRequired: boolean
  materials?: string[]
  tools?: string[]
  skills?: string[]
  instructions?: string
  estimatedCost?: number
}

interface UpdateStepsRequest {
  steps: ProductionStep[]
}

// PUT: Actualizar pasos de producción del producto
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json() as UpdateStepsRequest

    // Verificar que el producto existe
    const product = await prisma.product.findUnique({
      where: { id }
    })

    if (!product) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    // Validar pasos
    if (!Array.isArray(body.steps)) {
      return NextResponse.json({ error: 'Los pasos deben ser un array' }, { status: 400 })
    }

    // Validar cada paso
    for (const step of body.steps) {
      if (!step.name || typeof step.name !== 'string') {
        return NextResponse.json({ 
          error: 'Cada paso debe tener un nombre válido' 
        }, { status: 400 })
      }
      
      if (typeof step.order !== 'number') {
        return NextResponse.json({ 
          error: 'Cada paso debe tener un orden numérico' 
        }, { status: 400 })
      }
    }

    // Actualizar pasos de producción en una transacción
    const result = await prisma.$transaction(async (tx) => {
      // Eliminar pasos existentes
      await tx.workshopProcess.deleteMany({
        where: { productId: id }
      })

      // Crear nuevos pasos
      const createdSteps = []
      for (const step of body.steps) {
        const createdStep = await tx.workshopProcess.create({
          data: {
            productId: id,
            name: step.name,
            description: step.description || '',
            duration: step.duration || 60,
            order: step.order,
            isRequired: step.isRequired ?? true,
            materials: JSON.stringify(step.materials || []),
            tools: JSON.stringify(step.tools || []),
            skills: JSON.stringify(step.skills || []),
            instructions: step.instructions || '',
            estimatedCost: step.estimatedCost || 0
          }
        })
        createdSteps.push(createdStep)
      }

      return createdSteps
    })

    // Obtener pasos actualizados con relaciones
    const updatedSteps = await prisma.workshopProcess.findMany({
      where: { productId: id },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json({
      success: true,
      message: `${updatedSteps.length} pasos de producción actualizados exitosamente`,
      steps: updatedSteps
    })

  } catch (error) {
    console.error('Error updating production steps:', error)
    return NextResponse.json({
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}

// GET: Obtener pasos de producción del producto
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params

    // Obtener pasos de producción
    const steps = await prisma.workshopProcess.findMany({
      where: { productId: id },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json({
      success: true,
      steps
    })

  } catch (error) {
    console.error('Error fetching production steps:', error)
    return NextResponse.json({
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}