// app/(pages)/suppliers/page.tsx
import { SuppliersPage } from '@/features/pages/suppliers/components';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Suppliers - Inventory Management',
  description: 'Manage your supplier network',
};

export default function Suppliers() {
  return <SuppliersPage />;
}