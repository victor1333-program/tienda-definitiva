import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db';
export async function POST(request: NextRequest) {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Find all recurring transactions that need to be generated
    const recurringTransactions = await db.financialTransaction.findMany({
      where: {
        isRecurring: true,
        OR: [
          { recurringEndDate: null },
          { recurringEndDate: { gte: today } }
        ],
        nextGenerationDate: {
          lte: today
        }
      }
    })

    const generatedTransactions = []

    for (const transaction of recurringTransactions) {
      if (!transaction.nextGenerationDate) continue

      // Generate the next occurrence
      const newTransaction = await db.financialTransaction.create({
        data: {
          description: transaction.description,
          amount: transaction.amount,
          type: transaction.type,
          category: transaction.category,
          date: transaction.nextGenerationDate,
          vendor: transaction.vendor,
          customer: transaction.customer,
          status: 'PENDING',
          paymentMethod: transaction.paymentMethod,
          notes: transaction.notes,
          tags: transaction.tags,
          createdBy: transaction.createdBy,
          parentTransactionId: transaction.id,
          isRecurringGenerated: true,
          isRecurring: false
        }
      })

      // Update the parent transaction with next generation date
      const nextDate = calculateNextGenerationDate(
        transaction.nextGenerationDate,
        transaction.recurringFrequency,
        transaction.recurringDayOfMonth
      )

      await db.financialTransaction.update({
        where: { id: transaction.id },
        data: {
          nextGenerationDate: nextDate
        }
      })

      generatedTransactions.push(newTransaction)
    }

    return NextResponse.json({
      success: true,
      generated: generatedTransactions.length,
      transactions: generatedTransactions
    })

  } catch (error) {
    console.error('Error generating recurring transactions:', error)
    return NextResponse.json(
      { error: 'Error al generar transacciones recurrentes' },
      { status: 500 }
    )
  }
}

function calculateNextGenerationDate(
  currentDate: Date,
  frequency: string | null,
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
      next.setMonth(next.getMonth() + 1) // Default to monthly
  }

  return next
}

function getLastDayOfMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}

export async function GET() {
  try {
    // Get summary of recurring transactions
    const recurringCount = await db.financialTransaction.count({
      where: { isRecurring: true }
    })

    const pendingGeneration = await db.financialTransaction.count({
      where: {
        isRecurring: true,
        nextGenerationDate: {
          lte: new Date()
        }
      }
    })

    return NextResponse.json({
      recurringTransactions: recurringCount,
      pendingGeneration: pendingGeneration
    })

  } catch (error) {
    console.error('Error getting recurring transactions summary:', error)
    return NextResponse.json(
      { error: 'Error al obtener resumen de transacciones recurrentes' },
      { status: 500 }
    )
  }
}