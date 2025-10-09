import { NextRequest, NextResponse } from 'next/server'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const processes = await db.workshopProcess.findMany({
      include: {
        product: true,
        steps: true,
        materialRequirements: {
          include: {
            material: true
          }
        },
        equipmentRequirements: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform data for frontend
    const transformedProcesses = processes.map(process => ({
      id: process.id,
      name: process.name,
      description: process.description,
      productId: process.productId,
      productName: process.product.name,
      category: process.category,
      difficulty: process.difficulty,
      estimatedTime: process.estimatedTime,
      isActive: process.isActive,
      stepCount: process.steps.length,
      materialCount: process.materialRequirements.length,
      equipmentCount: process.equipmentRequirements.length,
      createdAt: process.createdAt.toISOString(),
      tags: JSON.parse(process.tags || '[]'),
      designFiles: JSON.parse(process.designFiles as string || '[]'),
      instructionFiles: JSON.parse(process.instructionFiles as string || '[]'),
      referenceImages: JSON.parse(process.referenceImages as string || '[]'),
      notes: process.notes
    }))

    return NextResponse.json(transformedProcesses)

  } catch (error) {
    console.error('Error fetching workshop processes:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
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
    const {
      name,
      description,
      productId,
      category,
      difficulty,
      estimatedTime,
      tags,
      notes,
      steps,
      materialRequirements,
      equipmentRequirements,
      designFiles,
      instructionFiles,
      referenceImages
    } = body

    // Create the workshop process
    const process = await db.workshopProcess.create({
      data: {
        name,
        description,
        productId,
        category,
        difficulty: difficulty || 'MEDIUM',
        estimatedTime: estimatedTime || 0,
        tags: JSON.stringify(tags || []),
        notes,
        designFiles: JSON.stringify(designFiles || []),
        instructionFiles: JSON.stringify(instructionFiles || []),
        referenceImages: JSON.stringify(referenceImages || [])
      }
    })

    // Create steps if provided
    if (steps && steps.length > 0) {
      await Promise.all(
        steps.map((step: any, index: number) =>
          db.processStep.create({
            data: {
              processId: process.id,
              stepNumber: index + 1,
              title: step.title,
              description: step.description,
              estimatedTime: step.estimatedTime || 0,
              instructions: step.instructions,
              imageUrls: JSON.stringify(step.imageUrls || []),
              videoUrls: JSON.stringify(step.videoUrls || []),
              fileUrls: JSON.stringify(step.fileUrls || []),
              isOptional: step.isOptional || false,
              requiresQC: step.requiresQC || false,
              safetyNotes: step.safetyNotes
            }
          })
        )
      )
    }

    // Create material requirements if provided
    if (materialRequirements && materialRequirements.length > 0) {
      await Promise.all(
        materialRequirements.map((material: any) =>
          db.processMaterial.create({
            data: {
              processId: process.id,
              materialId: material.materialId || null,
              name: material.name,
              quantity: material.quantity,
              unit: material.unit,
              description: material.description,
              isOptional: material.isOptional || false,
              estimatedCost: material.estimatedCost,
              supplier: material.supplier
            }
          })
        )
      )
    }

    // Create equipment requirements if provided
    if (equipmentRequirements && equipmentRequirements.length > 0) {
      await Promise.all(
        equipmentRequirements.map((equipment: any) =>
          db.processEquipment.create({
            data: {
              processId: process.id,
              name: equipment.name,
              description: equipment.description,
              isRequired: equipment.isRequired !== false,
              specifications: JSON.stringify(equipment.specifications || {}),
              settings: JSON.stringify(equipment.settings || {}),
              alternatives: JSON.stringify(equipment.alternatives || [])
            }
          })
        )
      )
    }

    // Fetch the complete process with relations
    const completeProcess = await db.workshopProcess.findUnique({
      where: { id: process.id },
      include: {
        product: true,
        steps: true,
        materialRequirements: {
          include: {
            material: true
          }
        },
        equipmentRequirements: true
      }
    })

    return NextResponse.json(completeProcess, { status: 201 })

  } catch (error) {
    console.error('Error creating workshop process:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}