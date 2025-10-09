import { db } from '@/lib/db';
export interface RecurringTransactionConfig {
  description: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  category: string
  vendor?: string
  customer?: string
  paymentMethod: string
  notes?: string
  tags?: string[]
  frequency: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
  dayOfMonth?: number
  endDate?: Date
  createdBy: string
}

export class RecurringTransactionService {
  static async createRecurringTransaction(config: RecurringTransactionConfig) {
    const nextGenerationDate = this.calculateNextGenerationDate(
      new Date(),
      config.frequency,
      config.dayOfMonth
    )

    const transaction = await db.financialTransaction.create({
      data: {
        description: config.description,
        amount: config.amount,
        type: config.type,
        category: config.category,
        date: new Date(),
        vendor: config.vendor,
        customer: config.customer,
        paymentMethod: config.paymentMethod,
        notes: config.notes,
        tags: config.tags || [],
        createdBy: config.createdBy,
        isRecurring: true,
        recurringFrequency: config.frequency,
        recurringStartDate: new Date(),
        recurringEndDate: config.endDate,
        recurringDayOfMonth: config.dayOfMonth,
        nextGenerationDate
      }
    })

    return transaction
  }

  static async generatePendingRecurringTransactions() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    try {
      // Find all active recurring transactions that need generation
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

      console.log(`Found ${recurringTransactions.length} recurring transactions to process`)

      const results = []

      for (const transaction of recurringTransactions) {
        try {
          const generated = await this.generateNextOccurrence(transaction)
          results.push(generated)
        } catch (error) {
          console.error(`Error generating transaction for ${transaction.id}:`, error)
        }
      }

      console.log(`Successfully generated ${results.length} transactions`)
      return results

    } catch (error) {
      console.error('Error in generatePendingRecurringTransactions:', error)
      throw error
    }
  }

  private static async generateNextOccurrence(parentTransaction: any) {
    const nextDate = parentTransaction.nextGenerationDate

    // Create the new transaction
    const newTransaction = await db.financialTransaction.create({
      data: {
        description: `${parentTransaction.description} (Recurrente)`,
        amount: parentTransaction.amount,
        type: parentTransaction.type,
        category: parentTransaction.category,
        date: nextDate,
        vendor: parentTransaction.vendor,
        customer: parentTransaction.customer,
        status: 'PENDING',
        paymentMethod: parentTransaction.paymentMethod,
        notes: parentTransaction.notes,
        tags: parentTransaction.tags,
        createdBy: parentTransaction.createdBy,
        parentTransactionId: parentTransaction.id,
        isRecurringGenerated: true,
        isRecurring: false
      }
    })

    // Calculate and update next generation date
    const nextGenerationDate = this.calculateNextGenerationDate(
      nextDate,
      parentTransaction.recurringFrequency,
      parentTransaction.recurringDayOfMonth
    )

    // Update parent transaction
    await db.financialTransaction.update({
      where: { id: parentTransaction.id },
      data: {
        nextGenerationDate: nextGenerationDate
      }
    })

    return newTransaction
  }

  static calculateNextGenerationDate(
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
        if (dayOfMonth && dayOfMonth >= 1 && dayOfMonth <= 31) {
          const lastDayOfMonth = this.getLastDayOfMonth(next)
          next.setDate(Math.min(dayOfMonth, lastDayOfMonth))
        }
        break
      case 'QUARTERLY':
        next.setMonth(next.getMonth() + 3)
        if (dayOfMonth && dayOfMonth >= 1 && dayOfMonth <= 31) {
          const lastDayOfMonth = this.getLastDayOfMonth(next)
          next.setDate(Math.min(dayOfMonth, lastDayOfMonth))
        }
        break
      case 'YEARLY':
        next.setFullYear(next.getFullYear() + 1)
        if (dayOfMonth && dayOfMonth >= 1 && dayOfMonth <= 31) {
          const lastDayOfMonth = this.getLastDayOfMonth(next)
          next.setDate(Math.min(dayOfMonth, lastDayOfMonth))
        }
        break
      default:
        // Default to monthly
        next.setMonth(next.getMonth() + 1)
        if (dayOfMonth && dayOfMonth >= 1 && dayOfMonth <= 31) {
          const lastDayOfMonth = this.getLastDayOfMonth(next)
          next.setDate(Math.min(dayOfMonth, lastDayOfMonth))
        }
    }

    return next
  }

  private static getLastDayOfMonth(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  static async getRecurringTransactionsSummary() {
    const summary = await db.financialTransaction.groupBy({
      by: ['type', 'recurringFrequency'],
      where: {
        isRecurring: true
      },
      _count: {
        id: true
      },
      _sum: {
        amount: true
      }
    })

    const pendingGeneration = await db.financialTransaction.count({
      where: {
        isRecurring: true,
        nextGenerationDate: {
          lte: new Date()
        }
      }
    })

    return {
      summary,
      pendingGeneration
    }
  }

  static async getRecurringTransactions(filters: {
    type?: 'INCOME' | 'EXPENSE'
    frequency?: string
    active?: boolean
  } = {}) {
    const where: any = {
      isRecurring: true
    }

    if (filters.type) {
      where.type = filters.type
    }

    if (filters.frequency) {
      where.recurringFrequency = filters.frequency
    }

    if (filters.active !== undefined) {
      if (filters.active) {
        where.OR = [
          { recurringEndDate: null },
          { recurringEndDate: { gte: new Date() } }
        ]
      } else {
        where.recurringEndDate = {
          lt: new Date()
        }
      }
    }

    return await db.financialTransaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        creator: {
          select: {
            name: true,
            email: true
          }
        },
        recurringChildren: {
          select: {
            id: true,
            date: true,
            status: true
          },
          orderBy: { date: 'desc' },
          take: 5
        }
      }
    })
  }

  static async pauseRecurringTransaction(transactionId: string) {
    return await db.financialTransaction.update({
      where: { id: transactionId },
      data: {
        nextGenerationDate: null
      }
    })
  }

  static async resumeRecurringTransaction(transactionId: string) {
    const transaction = await db.financialTransaction.findUnique({
      where: { id: transactionId }
    })

    if (!transaction) {
      throw new Error('Transaction not found')
    }

    const nextDate = this.calculateNextGenerationDate(
      new Date(),
      transaction.recurringFrequency,
      transaction.recurringDayOfMonth
    )

    return await db.financialTransaction.update({
      where: { id: transactionId },
      data: {
        nextGenerationDate: nextDate
      }
    })
  }
}