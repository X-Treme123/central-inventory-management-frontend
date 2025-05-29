// app/(pages)/suppliers/create/page.tsx
import { CreateSupplierPage } from '@/features/pages/suppliers/components';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Supplier - Inventory Management',
  description: 'Add a new supplier to your network',
};

export default function CreateSupplier() {
  return <CreateSupplierPage />;
}