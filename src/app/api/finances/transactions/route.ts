import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db';
// getServerSession replaced with auth() - import removed
import { auth } from "@/auth"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const {
      description,
      amount,
      type,
      category,
      vendor,
      customer,
      paymentMethod,
      notes,
      tags,
      isRecurring,
      recurringFrequency,
      recurringDayOfMonth,
      recurringEndDate
    } = body

    // Validate required fields
    if (!description || !amount || !type || !category || !paymentMethod) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
        { status: 400 }
      )
    }

    const transactionData: any = {
      description,
      amount: parseFloat(amount),
      type: type.toUpperCase(),
      category,
      date: new Date(),
      vendor,
      customer,
      paymentMethod,
      notes,
      tags: tags || [],
      createdBy: session.user.id,
      isRecurring: isRecurring || false
    }

    // Add recurring fields if applicable
    if (isRecurring) {
      transactionData.recurringFrequency = recurringFrequency || 'MONTHLY'
      transactionData.recurringStartDate = new Date()
      transactionData.recurringEndDate = recurringEndDate ? new Date(recurringEndDate) : null
      transactionData.recurringDayOfMonth = recurringDayOfMonth ? parseInt(recurringDayOfMonth) : null
      
      // Calculate first generation date
      transactionData.nextGenerationDate = calculateNextGenerationDate(
        new Date(),
        recurringFrequency || 'MONTHLY',
        recurringDayOfMonth ? parseInt(recurringDayOfMonth) : null
      )
    }

    const transaction = await db.financialTransaction.create({
      data: transactionData
    })

    return NextResponse.json({
      success: true,
      transaction
    })

  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json(
      { error: 'Error al crear la transacción' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')

    const where: any = {}
    
    if (type) {
      where.type = type.toUpperCase()
    }
    
    if (category && category !== 'all') {
      where.category = category
    }

    const transactions = await db.financialTransaction.findMany({
      where,
      orderBy: { date: 'desc' },
      take: limit,
      skip: (page - 1) * limit,
      include: {
        creator: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    const total = await db.financialTransaction.count({ where })

    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Error al obtener transacciones' },
      { status: 500 }
    )
  }
}

function calculateNextGenerationDate(
  currentDate: Date,
  frequency: string,
  dayOfMonth: number | null
): Date {
  const next = new Date(currentDate)

  switch (frequency) {
    case 'WEEKLY':
      next.setDate(next.getDate() + 7)
      break
    case 'MONTHLY':
      next.setMonth(next.getMonth() + 1)
      if (dayOfMonth && dayOfMonth <= 31) {
        next.setDate(Math.min(dayOfMonth, getLastDayOfMonth(next)))
      }
      break
    case 'QUARTERLY':
      next.setMonth(next.getMonth() + 3)
      break
    case 'YEARLY':
      next.setFullYear(next.getFullYear() + 1)
      break
    default:
      next.setMonth(next.getMonth() + 1)
  }

  return next
}

function getLastDayOfMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}