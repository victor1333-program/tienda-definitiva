import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
// getServerSession replaced with auth() - import removed;
import { auth } from "@/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== 'ADMIN' && role !== 'SUPER_ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '50');
    const imageId = searchParams.get('imageId');

    // Construir condiciones de búsqueda
    // Un producto es personalizable si:
    // 1. Tiene isPersonalizable: true, O
    // 2. Tiene lados configurados con áreas de impresión
    const whereConditions: any = {
      isActive: true,
      OR: [
        { isPersonalizable: true },
        {
          sides: {
            some: {
              isActive: true,
              printAreas: {
                some: {
                  isActive: true
                }
              }
            }
          }
        }
      ]
    };

    if (search) {
      whereConditions.AND = [
        {
          OR: [
            { isPersonalizable: true },
            {
              sides: {
                some: {
                  isActive: true,
                  printAreas: {
                    some: {
                      isActive: true
                    }
                  }
                }
              }
            }
          ]
        },
        {
          OR: [
            {
              name: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              sku: {
                contains: search,
                mode: 'insensitive',
              },
            },
          ]
        }
      ];
      // Limpiar el OR original ya que ahora usamos AND
      delete whereConditions.OR;
    }

    const products = await prisma.product.findMany({
      where: whereConditions,
      take: limit,
      select: {
        id: true,
        name: true,
        sku: true,
        slug: true,
        images: true,
        basePrice: true,
        isPersonalizable: true,
        linkedImages: imageId ? {
          where: { imageId },
          select: { id: true, isActive: true }
        } : undefined,
        sides: {
          select: {
            id: true,
            name: true,
            displayName: true,
            printAreas: {
              select: {
                id: true,
                name: true,
                displayName: true,
              },
              where: {
                isActive: true,
              },
              orderBy: {
                sortOrder: 'asc',
              },
            },
          },
          where: {
            isActive: true,
          },
          orderBy: {
            position: 'asc',
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Formatear los productos para compatibilidad
    const formattedProducts = products.map(product => {
      let productImages = []
      try {
        productImages = product.images ? JSON.parse(product.images) : []
      } catch (e) {
        productImages = []
      }

      return {
        id: product.id,
        title: product.name, // Para compatibilidad con el componente
        name: product.name,
        sku: product.sku || '',
        slug: product.slug,
        basePrice: product.basePrice,
        mainImage: productImages.length > 0 ? productImages[0] : null,
        isPersonalizable: product.isPersonalizable,
        isLinked: imageId ? (product.linkedImages && product.linkedImages.length > 0) : false,
        sides: product.sides.length > 0 ? product.sides.map(side => ({
          id: side.id,
          name: side.displayName || side.name,
          printAreas: side.printAreas
        })) : [
          // Fallback si no hay lados configurados
          { id: `${product.id}-front`, name: 'Frente' },
          { id: `${product.id}-back`, name: 'Atrás' },
          { id: `${product.id}-left`, name: 'Izquierda' },
          { id: `${product.id}-right`, name: 'Derecha' }
        ]
      }
    });

    return NextResponse.json({
      products: formattedProducts,
      total: formattedProducts.length
    });
  } catch (error) {
    console.error('Error al obtener productos personalizables:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}