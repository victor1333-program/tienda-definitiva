import { Metadata } from 'next';
import DesignVariantManager from '@/components/admin/design-variants/DesignVariantManager';

export const metadata: Metadata = {
  title: 'Variantes de Diseño - Admin',
  description: 'Gestiona las variantes de diseño de tus productos',
};

export default function DesignVariantsPage() {
  return (
    <div className="container mx-auto py-6">
      <DesignVariantManager />
    </div>
  );
}