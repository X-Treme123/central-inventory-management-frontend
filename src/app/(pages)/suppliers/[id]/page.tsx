// app/(pages)/suppliers/[id]/page.tsx
import { SupplierDetailPage } from '@/features/dashboard/suppliers/components';
import type { Metadata } from 'next';

interface SupplierDetailProps {
  params: {
    id: string;
  };
}

export const metadata: Metadata = {
  title: 'Supplier Details - Inventory Management',
  description: 'View supplier information and details',
};

export default function SupplierDetail({ params }: SupplierDetailProps) {
  return <SupplierDetailPage supplierId={params.id} />;
}