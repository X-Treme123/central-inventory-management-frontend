// features/auth/components/LoginPage.tsx
"use client";

import { useAuth } from '@/context/AuthContext';
import { LoginContainer } from './LoginContainer';
import { LoginForm } from './LoginForm';
import { useState } from 'react';

export const LoginPage = () => {
  const { login, isLoading, error } = useAuth();
  const [localError, setLocalError] = useState<string | null>(null);

  const handleLogin = async (username: string, password: string) => {
    try {
      setLocalError(null);
      await login(username, password);
    } catch (err) {
      // Error will be handled by AuthContext
      console.error('Login error in LoginPage:', err);
    }
  };

  const handleClearError = () => {
    setLocalError(null);
    // You could also clear the AuthContext error here if needed
  };

  const displayError = error || localError;

  return (
    <LoginContainer>
      <LoginForm
        onSubmit={handleLogin}
        isLoading={isLoading}
        error={displayError}
        onClearError={handleClearError}
      />
    </LoginContainer>
  );
};