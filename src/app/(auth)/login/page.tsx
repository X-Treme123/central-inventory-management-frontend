// app/(auth)/login/page.tsx
import { LoginPage } from '@/features/auth/components';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - Inventory Management',
  description: 'Sign in to your account',
};

export default function Login() {
  return <LoginPage />;
}