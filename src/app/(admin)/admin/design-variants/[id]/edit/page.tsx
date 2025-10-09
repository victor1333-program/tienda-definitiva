import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db as prisma } from '@/lib/db';
import DesignVariantForm from '@/components/admin/design-variants/DesignVariantForm';

export const metadata: Metadata = {
  title: 'Editar Variante de Diseño - Admin',
  description: 'Editar variante de diseño existente',
};

interface EditDesignVariantPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getDesignVariant(id: string) {
  try {
    const designVariant = await prisma.productDesignVariant.findUnique({
      where: { id },
      include: {
        product: true,
        template: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        categories: {
          include: {
            category: true
          }
        }
      }
    });

    return designVariant;
  } catch (error) {
    console.error('Error fetching design variant:', error);
    return null;
  }
}

export default async function EditDesignVariantPage({ params }: EditDesignVariantPageProps) {
  const { id } = await params;
  const designVariant = await getDesignVariant(id);

  if (!designVariant) {
    notFound();
  }

  return (
    <div className="container mx-auto py-6">
      <DesignVariantForm designVariant={designVariant} />
    </div>
  );
}