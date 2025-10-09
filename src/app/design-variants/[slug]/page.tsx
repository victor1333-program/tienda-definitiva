import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import DesignVariantDetails from '@/components/products/DesignVariantDetails';

interface DesignVariantPageProps {
  params: {
    slug: string;
  };
}

async function getDesignVariant(slug: string) {
  try {
    const designVariant = await db.productDesignVariant.findUnique({
      where: { 
        slug,
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
      return null;
    }

    // Obtener variantes relacionadas del mismo producto
    const relatedVariants = await db.productDesignVariant.findMany({
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

    return {
      ...designVariant,
      totalPrice: designVariant.basePrice + designVariant.designSurcharge,
      salesCount: designVariant._count.orderItems,
      relatedVariants
    };
  } catch (error) {
    console.error('Error fetching design variant:', error);
    return null;
  }
}

export async function generateMetadata({ params }: DesignVariantPageProps): Promise<Metadata> {
  const { slug } = await params;
  const designVariant = await getDesignVariant(slug);

  if (!designVariant) {
    return {
      title: 'Diseño no encontrado',
      description: 'El diseño solicitado no existe o no está disponible.'
    };
  }

  const title = designVariant.metaTitle || `${designVariant.name} | ${designVariant.product.name}`;
  const description = designVariant.metaDescription || 
    designVariant.shortDescription || 
    designVariant.description || 
    `${designVariant.name} - Diseño personalizado para ${designVariant.product.name}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: designVariant.thumbnailUrl ? [
        {
          url: designVariant.thumbnailUrl,
          width: 800,
          height: 600,
          alt: designVariant.name,
        }
      ] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: designVariant.thumbnailUrl ? [designVariant.thumbnailUrl] : [],
    }
  };
}

export default async function DesignVariantPage({ params }: DesignVariantPageProps) {
  const { slug } = await params;
  const designVariant = await getDesignVariant(slug);

  if (!designVariant) {
    notFound();
  }

  return <DesignVariantDetails designVariant={designVariant} />;
}