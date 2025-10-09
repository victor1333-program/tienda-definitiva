import { NextRequest, NextResponse } from 'next/server'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db } from '@/lib/db'
import { z } from 'zod'

const updateProfileSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional()
})

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      )
    }

    const user = await db.user.findUnique({
      where: {
        id: session.user.id
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        addresses: {
          where: { isDefault: true },
          select: {
            name: true,
            street: true,
            city: true,
            postalCode: true,
            country: true
          },
          take: 1
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Mapear la dirección por defecto si existe
    const defaultAddress = user.addresses[0]
    const userProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: defaultAddress?.street || null,
      city: defaultAddress?.city || null,
      postalCode: defaultAddress?.postalCode || null,
      createdAt: user.createdAt
    }

    return NextResponse.json(userProfile)

  } catch (error) {
    console.error('Error al obtener perfil:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = updateProfileSchema.parse(body)

    // Actualizar datos básicos del usuario
    const updatedUser = await db.user.update({
      where: {
        id: session.user.id
      },
      data: {
        name: validatedData.name,
        phone: validatedData.phone || null
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true
      }
    })

    // Manejar la dirección si se proporciona
    if (validatedData.address || validatedData.city || validatedData.postalCode) {
      // Buscar dirección por defecto existente
      const existingAddress = await db.address.findFirst({
        where: {
          userId: session.user.id,
          isDefault: true
        }
      })

      if (existingAddress) {
        // Actualizar dirección existente
        await db.address.update({
          where: { id: existingAddress.id },
          data: {
            name: updatedUser.name || "Dirección principal",
            street: validatedData.address || "",
            city: validatedData.city || "",
            state: validatedData.city || "",
            postalCode: validatedData.postalCode || ""
          }
        })
      } else {
        // Crear nueva dirección
        await db.address.create({
          data: {
            userId: session.user.id,
            name: updatedUser.name || "Dirección principal",
            street: validatedData.address || "",
            city: validatedData.city || "",
            state: validatedData.city || "",
            postalCode: validatedData.postalCode || "",
            country: "ES",
            isDefault: true
          }
        })
      }
    }

    // Obtener el usuario actualizado con su dirección
    const userWithAddress = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        addresses: {
          where: { isDefault: true },
          select: {
            street: true,
            city: true,
            postalCode: true
          },
          take: 1
        }
      }
    })

    const defaultAddress = userWithAddress?.addresses[0]
    const userProfile = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      address: defaultAddress?.street || null,
      city: defaultAddress?.city || null,
      postalCode: defaultAddress?.postalCode || null,
      createdAt: updatedUser.createdAt
    }

    return NextResponse.json(userProfile)

  } catch (error) {
    console.error('Error al actualizar perfil:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}