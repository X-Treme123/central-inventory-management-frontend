// features/auth/components/AuthErrorBoundary.tsx
"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AuthError } from './AuthError';
import { Button } from '@/components/ui/button';
import Cookies from 'js-cookie';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  isAuthError: boolean;
}

export class AuthErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, isAuthError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    const isAuthError = error.message.includes('token') || 
                       error.message.includes('authentication') ||
                       error.message.includes('unauthorized') ||
                       error.message.includes('Session expired') ||
                       error.message.includes('Access Denied');

    return {
      hasError: true,
      error,
      isAuthError,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Auth Error Boundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);

    // If it's an auth error, clear session
    if (this.state.isAuthError) {
      this.clearSession();
    }
  }

  clearSession = () => {
    // Clear all auth-related cookies
    Cookies.remove('token');
    Cookies.remove('refresh_token');
    Cookies.remove('user_data');
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoToLogin = () => {
    this.clearSession();
    window.location.href = '/login';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
          <div className="max-w-md w-full">
            <AuthError 
              message={
                this.state.isAuthError 
                  ? "Session expired. Please log in again."
                  : "An unexpected error occurred. Please try again."
              }
            />
            <div className="mt-4 flex gap-2">
              <Button
                onClick={this.handleReload}
                className="flex-1"
                variant="outline"
              >
                Reload Page
              </Button>
              {this.state.isAuthError && (
                <Button
                  onClick={this.handleGoToLogin}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  Go to Login
                </Button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}