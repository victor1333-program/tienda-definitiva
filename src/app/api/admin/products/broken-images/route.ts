import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/auth';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Buscar productos con rutas locales en imágenes
    const products = await db.product.findMany({
      where: {
        images: {
          contains: '/uploads/products/'
        }
      },
      select: {
        id: true,
        name: true,
        slug: true,
        images: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // Formatear respuesta
    const brokenProducts = products.map(product => {
      const images = JSON.parse(product.images || '[]');
      const brokenImages = images.filter((img: string) => img.startsWith('/uploads/'));

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        isActive: product.isActive,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        totalImages: images.length,
        brokenImages: brokenImages.length,
        images: images,
        editUrl: `/admin/products/${product.id}/edit`
      };
    });

    return NextResponse.json({
      success: true,
      total: brokenProducts.length,
      products: brokenProducts
    });

  } catch (error) {
    console.error('Error fetching broken images:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
