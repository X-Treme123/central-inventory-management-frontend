// app/(pages)/categories/create/page.tsx
import { CreateCategoryPage } from '@/features/pages/categories/components';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Category - Inventory Management',
  description: 'Add a new product category to your inventory',
};

export default function CreateCategory() {
  return <CreateCategoryPage />;
}