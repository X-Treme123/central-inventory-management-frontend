// app/(pages)/categories/edit/[id]/page.tsx
import { EditCategoryPage } from '@/features/pages/categories/components';
import type { Metadata } from 'next';

interface EditCategoryProps {
  params: {
    id: string;
  };
}

export const metadata: Metadata = {
  title: 'Edit Category - Inventory Management',
  description: 'Update category information',
};

export default function EditCategory({ params }: EditCategoryProps) {
  return <EditCategoryPage categoryId={params.id} />;
}