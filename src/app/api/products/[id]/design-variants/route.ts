import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db as prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';
    
    // Verificar permisos para variantes inactivas
    let includeInactiveVariants = false;
    if (includeInactive) {
      const session = await auth();
      includeInactiveVariants = session?.user?.role === 'ADMIN';
    }

    const where: any = {
      productId: params.id,
      isPublic: true
    };

    if (!includeInactiveVariants) {
      where.isActive = true;
    }

    const designVariants = await prisma.productDesignVariant.findMany({
      where,
      include: {
        template: {
          select: {
            id: true,
            name: true,
            category: true,
            thumbnailUrl: true
          }
        },
        categories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        },
        _count: {
          select: {
            orderItems: true
          }
        }
      },
      orderBy: [
        { featured: 'desc' },
        { sortOrder: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    // Obtener información del producto base
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        slug: true,
        basePrice: true,
        stock: true,
        isPersonalizable: true,
        variants: {
          where: { isActive: true },
          select: {
            id: true,
            sku: true,
            size: true,
            colorName: true,
            colorHex: true,
            stock: true,
            price: true
          }
        }
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      product,
      designVariants: designVariants.map(variant => ({
        ...variant,
        totalPrice: variant.basePrice + variant.designSurcharge,
        salesCount: variant._count.orderItems
      }))
    });

  } catch (error) {
    console.error('Error fetching product design variants:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const data = await request.json();
    
    // Verificar que el producto existe y es personalizable
    const product = await prisma.product.findUnique({
      where: { id: params.id }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    if (!product.isPersonalizable) {
      return NextResponse.json(
        { error: 'El producto debe ser personalizable para crear variantes de diseño' },
        { status: 400 }
      );
    }

    // Crear la variante usando el endpoint principal
    const createRequest = new NextRequest(request.url, {
      method: 'POST',
      headers: request.headers,
      body: JSON.stringify({
        ...data,
        productId: params.id
      })
    });

    // Reutilizar la lógica del endpoint principal
    const response = await fetch(`${request.nextUrl.origin}/api/design-variants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || ''
      },
      body: JSON.stringify({
        ...data,
        productId: params.id
      })
    });

    const result = await response.json();
    
    return NextResponse.json(result, { status: response.status });

  } catch (error) {
    console.error('Error creating product design variant:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}