import { Metadata } from 'next';
import DesignVariantForm from '@/components/admin/design-variants/DesignVariantForm';

export const metadata: Metadata = {
  title: 'Nueva Variante de Diseño - Admin',
  description: 'Crear una nueva variante de diseño',
};

interface NewDesignVariantPageProps {
  searchParams: Promise<{
    productId?: string;
    templateId?: string;
  }>;
}

export default async function NewDesignVariantPage({ searchParams }: NewDesignVariantPageProps) {
  const params = await searchParams;
  
  return (
    <div className="container mx-auto py-6">
      <DesignVariantForm
        productId={params.productId}
        templateId={params.templateId}
      />
    </div>
  );
}