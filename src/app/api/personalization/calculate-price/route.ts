import { NextRequest, NextResponse } from 'next/server';
import { calculatePersonalizationPrice } from '@/lib/pricing-rules';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, quantity = 1, sides = [], areas = [] } = body;

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID es requerido' },
        { status: 400 }
      );
    }

    const pricingBreakdown = await calculatePersonalizationPrice({
      productId,
      quantity,
      sides,
      areas,
    });

    return NextResponse.json(pricingBreakdown);
  } catch (error) {
    console.error('Error al calcular precio de personalización:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}