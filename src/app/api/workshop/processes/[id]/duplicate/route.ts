import { NextRequest, NextResponse } from 'next/server'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Get the original process with all its relations
    const originalProcess = await db.workshopProcess.findUnique({
      where: { id: id },
      include: {
        steps: {
          orderBy: { stepNumber: 'asc' }
        },
        materialRequirements: true,
        equipmentRequirements: true
      }
    })

    if (!originalProcess) {
      return NextResponse.json({ error: "Proceso no encontrado" }, { status: 404 })
    }

    // Create the duplicated process
    const duplicatedProcess = await db.workshopProcess.create({
      data: {
        name: `${originalProcess.name} (Copia)`,
        description: originalProcess.description,
        productId: originalProcess.productId,
        category: originalProcess.category,
        difficulty: originalProcess.difficulty,
        estimatedTime: originalProcess.estimatedTime,
        tags: originalProcess.tags,
        notes: originalProcess.notes,
        designFiles: originalProcess.designFiles,
        instructionFiles: originalProcess.instructionFiles,
        referenceImages: originalProcess.referenceImages,
        isActive: false // Start as inactive
      }
    })

    // Duplicate steps
    if (originalProcess.steps.length > 0) {
      await Promise.all(
        originalProcess.steps.map(step =>
          db.processStep.create({
            data: {
              processId: duplicatedProcess.id,
              stepNumber: step.stepNumber,
              title: step.title,
              description: step.description,
              estimatedTime: step.estimatedTime,
              instructions: step.instructions,
              imageUrls: step.imageUrls,
              videoUrls: step.videoUrls,
              fileUrls: step.fileUrls,
              isOptional: step.isOptional,
              requiresQC: step.requiresQC,
              safetyNotes: step.safetyNotes
            }
          })
        )
      )
    }

    // Duplicate material requirements
    if (originalProcess.materialRequirements.length > 0) {
      await Promise.all(
        originalProcess.materialRequirements.map(material =>
          db.processMaterial.create({
            data: {
              processId: duplicatedProcess.id,
              materialId: material.materialId,
              name: material.name,
              quantity: material.quantity,
              unit: material.unit,
              description: material.description,
              isOptional: material.isOptional,
              estimatedCost: material.estimatedCost,
              supplier: material.supplier
            }
          })
        )
      )
    }

    // Duplicate equipment requirements
    if (originalProcess.equipmentRequirements.length > 0) {
      await Promise.all(
        originalProcess.equipmentRequirements.map(equipment =>
          db.processEquipment.create({
            data: {
              processId: duplicatedProcess.id,
              name: equipment.name,
              description: equipment.description,
              isRequired: equipment.isRequired,
              specifications: equipment.specifications,
              settings: equipment.settings,
              alternatives: equipment.alternatives
            }
          })
        )
      )
    }

    // Fetch the complete duplicated process
    const completeProcess = await db.workshopProcess.findUnique({
      where: { id: duplicatedProcess.id },
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
    console.error('Error duplicating workshop process:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}