import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const designVariant = await prisma.productDesignVariant.findUnique({
      where: { 
        slug: params.slug,
        isActive: true,
        isPublic: true
      },
      include: {
        product: {
          include: {
            variants: {
              where: { isActive: true },
              orderBy: [
                { size: 'asc' },
                { colorName: 'asc' }
              ]
            },
            categories: {
              include: {
                category: true
              }
            }
          }
        },
        template: {
          select: {
            id: true,
            name: true,
            category: true,
            allowTextEdit: true,
            allowColorEdit: true,
            allowImageEdit: true
          }
        },
        categories: {
          include: {
            category: true
          }
        },
        _count: {
          select: {
            orderItems: true
          }
        }
      }
    });

    if (!designVariant) {
      return NextResponse.json(
        { error: 'Variante de diseño no encontrada' },
        { status: 404 }
      );
    }

    // Obtener variantes relacionadas del mismo producto
    const relatedVariants = await prisma.productDesignVariant.findMany({
      where: {
        productId: designVariant.productId,
        id: { not: designVariant.id },
        isActive: true,
        isPublic: true
      },
      select: {
        id: true,
        name: true,
        slug: true,
        thumbnailUrl: true,
        basePrice: true,
        designSurcharge: true,
        featured: true
      },
      take: 6,
      orderBy: {
        featured: 'desc'
      }
    });

    // Calcular precio total
    const totalPrice = designVariant.basePrice + designVariant.designSurcharge;

    return NextResponse.json({
      ...designVariant,
      totalPrice,
      relatedVariants
    });

  } catch (error) {
    console.error('Error fetching design variant by slug:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}