// app/(auth)/layout.tsx
import { AuthGuard, AuthErrorBoundary } from '@/features/auth/components';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication - Inventory Management',
  description: 'Login to access the inventory management system',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthErrorBoundary>
      <AuthGuard requireAuth={false}>
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </AuthGuard>
    </AuthErrorBoundary>
  );
}