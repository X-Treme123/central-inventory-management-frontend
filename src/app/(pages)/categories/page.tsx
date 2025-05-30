// app/(pages)/categories/page.tsx
import { CategoriesPage } from '@/features/pages/categories/components';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Categories - Inventory Management',
  description: 'Organize your products into categories',
};

export default function Categories() {
  return <CategoriesPage />;
}
