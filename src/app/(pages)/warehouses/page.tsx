// app/(pages)/warehouses/page.tsx
import { WarehousePage } from '@/features/dashboard/warehouses/components';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Warehouses - Inventory Management',
  description: 'Manage your warehouse locations and storage',
};

export default function Warehouses() {
  return <WarehousePage />;
}