// features/auth/components/AuthGuard.tsx
"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";
import { AuthLoading } from "./AuthLoading";

interface AuthGuardProps {
  children: ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
}

export const AuthGuard = ({ 
  children, 
  redirectTo = "/login", 
  requireAuth = true 
}: AuthGuardProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        router.push(redirectTo);
      } else if (!requireAuth && isAuthenticated) {
        router.push("/dashboard");
      }
    }
  }, [isAuthenticated, isLoading, requireAuth, redirectTo, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <AuthLoading text="Loading application..." size="lg" />
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  if (!requireAuth && isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
};