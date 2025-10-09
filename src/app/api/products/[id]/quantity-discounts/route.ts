import { NextRequest, NextResponse } from 'next/server';
import { getQuantityDiscounts } from '@/lib/pricing-rules';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = id;

    const discounts = await getQuantityDiscounts(productId);

    return NextResponse.json(discounts);
  } catch (error) {
    console.error('Error al obtener descuentos por cantidad:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}