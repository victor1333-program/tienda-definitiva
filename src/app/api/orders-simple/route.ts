import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  
  try {
    const data = await request.json()
    // Data log removed
    console.log('Order data:', {
      customerEmail: data.customerEmail,
      itemsCount: data.items?.length || 0,
      shippingMethod: data.shippingMethod
    })
    
    
    const response = NextResponse.json({
      success: true,
      message: 'Simple orders API working perfectly!',
      timestamp: new Date().toISOString(),
      receivedDataSummary: {
        customerEmail: data.customerEmail,
        itemsCount: data.items?.length || 0,
        shippingMethod: data.shippingMethod
      }
    })
    
    return response
    
  } catch (error) {
    console.error('❌ Simple orders API error:', error)
    console.error('❌ Error type:', typeof error)
    console.error('❌ Error message:', error instanceof Error ? error.message : String(error))
    
    return NextResponse.json(
      { 
        error: 'Simple orders API failed',
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  } finally {
  }
}