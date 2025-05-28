// app/(pages)/suppliers/edit/[id]/page.tsx
import { EditSupplierPage } from '@/features/dashboard/suppliers/components';
import type { Metadata } from 'next';

interface EditSupplierProps {
  params: {
    id: string;
  };
}

export const metadata: Metadata = {
  title: 'Edit Supplier - Inventory Management',
  description: 'Update supplier information',
};

export default function EditSupplier({ params }: EditSupplierProps) {
  return <EditSupplierPage supplierId={params.id} />;
}