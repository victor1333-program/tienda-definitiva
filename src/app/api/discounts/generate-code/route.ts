import { NextRequest, NextResponse } from 'next/server'
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"
import { db } from '@/lib/db'

function generateRandomCode(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role === 'CUSTOMER') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { prefix = '', length = 8 } = body

    let attempts = 0
    let code = ''
    let isUnique = false

    // Intentar generar un código único hasta 10 veces
    while (!isUnique && attempts < 10) {
      const randomPart = generateRandomCode(length)
      code = prefix ? `${prefix}${randomPart}` : randomPart
      
      const existingCode = await db.discount.findUnique({
        where: { code }
      })
      
      if (!existingCode) {
        isUnique = true
      }
      
      attempts++
    }

    if (!isUnique) {
      return NextResponse.json(
        { error: 'No se pudo generar un código único' },
        { status: 500 }
      )
    }

    return NextResponse.json({ code })

  } catch (error) {
    console.error('Error generating discount code:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}