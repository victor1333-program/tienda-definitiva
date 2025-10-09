import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const productId = id

    // Simple test - just get the link count first
    const linkCount = await prisma.personalizationImageProductLink.count({
      where: { productId }
    })

    // If we have links, try to get one with details
    let sampleLink = null
    if (linkCount > 0) {
      sampleLink = await prisma.personalizationImageProductLink.findFirst({
        where: { productId },
        include: {
          image: true
        }
      })
    }

    return NextResponse.json({
      productId,
      linkCount,
      sampleLink
    })
  } catch (error) {
    console.error('Debug API error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}