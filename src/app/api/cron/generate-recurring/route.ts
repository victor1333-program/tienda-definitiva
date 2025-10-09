import { NextRequest, NextResponse } from 'next/server'
import { RecurringTransactionService } from '@/lib/recurring-transactions'

export async function POST(request: NextRequest) {
  try {
    // Validate cron secret if provided in environment
    const cronSecret = process.env.CRON_SECRET
    if (cronSecret) {
      const authorization = request.headers.get('authorization')
      if (authorization !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    
    const startTime = Date.now()
    const results = await RecurringTransactionService.generatePendingRecurringTransactions()
    const endTime = Date.now()


    return NextResponse.json({
      success: true,
      generated: results.length,
      executionTime: endTime - startTime,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in recurring transactions cron job:', error)
    return NextResponse.json(
      { 
        error: 'Error generating recurring transactions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const summary = await RecurringTransactionService.getRecurringTransactionsSummary()
    
    return NextResponse.json({
      summary: summary.summary,
      pendingGeneration: summary.pendingGeneration,
      nextRun: 'Runs daily at midnight UTC'
    })

  } catch (error) {
    console.error('Error getting recurring transactions summary:', error)
    return NextResponse.json(
      { error: 'Error getting summary' },
      { status: 500 }
    )
  }
}