import { NextRequest, NextResponse } from 'next/server'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const process = await db.workshopProcess.findUnique({
      where: { id: id },
      include: {
        product: true,
        steps: {
          orderBy: {
            stepNumber: 'asc'
          }
        },
        materialRequirements: {
          include: {
            material: true
          }
        },
        equipmentRequirements: true
      }
    })

    if (!process) {
      return NextResponse.json({ error: "Proceso no encontrado" }, { status: 404 })
    }

    // Transform data for frontend
    const transformedProcess = {
      id: process.id,
      name: process.name,
      description: process.description,
      productId: process.productId,
      category: process.category,
      difficulty: process.difficulty,
      estimatedTime: process.estimatedTime,
      isActive: process.isActive,
      tags: JSON.parse(process.tags || '[]'),
      notes: process.notes,
      designFiles: JSON.parse(process.designFiles as string || '[]'),
      instructionFiles: JSON.parse(process.instructionFiles as string || '[]'),
      referenceImages: JSON.parse(process.referenceImages as string || '[]'),
      createdAt: process.createdAt.toISOString(),
      updatedAt: process.updatedAt.toISOString(),
      product: {
        id: process.product.id,
        name: process.product.name,
        sku: process.product.sku,
        description: process.product.description,
        slug: process.product.slug
      },
      steps: process.steps.map(step => ({
        id: step.id,
        stepNumber: step.stepNumber,
        title: step.title,
        description: step.description,
        estimatedTime: step.estimatedTime,
        instructions: step.instructions,
        imageUrls: JSON.parse(step.imageUrls as string || '[]'),
        videoUrls: JSON.parse(step.videoUrls as string || '[]'),
        fileUrls: JSON.parse(step.fileUrls as string || '[]'),
        isOptional: step.isOptional,
        requiresQC: step.requiresQC,
        safetyNotes: step.safetyNotes
      })),
      materialRequirements: process.materialRequirements.map(material => ({
        id: material.id,
        materialId: material.materialId,
        name: material.name,
        quantity: material.quantity,
        unit: material.unit,
        description: material.description,
        isOptional: material.isOptional,
        material: material.material ? {
          id: material.material.id,
          name: material.material.name,
          sku: material.material.sku
        } : null
      })),
      equipmentRequirements: process.equipmentRequirements.map(equipment => ({
        id: equipment.id,
        name: equipment.name,
        description: equipment.description,
        isRequired: equipment.isRequired,
        specifications: JSON.parse(equipment.specifications as string || '{}')
      }))
    }

    return NextResponse.json(transformedProcess)

  } catch (error) {
    console.error('Error fetching workshop process:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Update the workshop process
    const process = await db.workshopProcess.update({
      where: { id: id },
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

    // Delete existing steps, materials, and equipment
    await db.processStep.deleteMany({
      where: { processId: id }
    })
    
    await db.processMaterial.deleteMany({
      where: { processId: id }
    })
    
    await db.processEquipment.deleteMany({
      where: { processId: id }
    })

    // Create new steps if provided
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

    // Create new material requirements if provided
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

    // Create new equipment requirements if provided
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

    // Fetch the complete updated process
    const updatedProcess = await db.workshopProcess.findUnique({
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

    return NextResponse.json(updatedProcess)

  } catch (error) {
    console.error('Error updating workshop process:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    
    const process = await db.workshopProcess.update({
      where: { id: id },
      data: body
    })

    return NextResponse.json(process)

  } catch (error) {
    console.error('Error updating workshop process:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Delete related records first
    await db.processStep.deleteMany({
      where: { processId: id }
    })
    
    await db.processMaterial.deleteMany({
      where: { processId: id }
    })
    
    await db.processEquipment.deleteMany({
      where: { processId: id }
    })

    // Delete the process
    await db.workshopProcess.delete({
      where: { id: id }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting workshop process:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}