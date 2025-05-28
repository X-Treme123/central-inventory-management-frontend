// features/auth/components/LoginForm.tsx
"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserCircle, Lock, Eye, EyeOff } from "lucide-react";
import { AuthError } from "./AuthError";
import { AuthLoading } from "./AuthLoading";

interface LoginFormProps {
  onSubmit: (username: string, password: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  onClearError?: () => void;
}

export const LoginForm = ({ onSubmit, isLoading, error, onClearError }: LoginFormProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string;
    password?: string;
  }>({});

  // Validate form
  useEffect(() => {
    const newErrors: typeof fieldErrors = {};
    
    // Username validation
    if (username.trim() === "") {
      newErrors.username = "";
    } else if (username.trim().length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    // Password validation
    if (password.trim() === "") {
      newErrors.password = "";
    } else if (password.trim().length < 3) {
      newErrors.password = "Password must be at least 3 characters";
    }

    setFieldErrors(newErrors);
    setIsFormValid(
      username.trim() !== "" && 
      password.trim() !== "" &&
      !newErrors.username &&
      !newErrors.password
    );
  }, [username, password]);

  // Clear server error when user starts typing
  useEffect(() => {
    if (error && (username || password) && onClearError) {
      onClearError();
    }
  }, [username, password, error, onClearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid || isLoading) return;
    
    await onSubmit(username.trim(), password.trim());
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Username field */}
      <div className="relative">
        <Input
          type="text"
          value={username}
          onChange={handleUsernameChange}
          placeholder="Username"
          required
          disabled={isLoading}
          className={`w-full bg-white/10 border-gray-600 text-white px-4 py-3 rounded-md focus:ring-1 focus:ring-red-500 focus:border-red-500 pl-10 ${
            fieldErrors.username ? 'border-red-500' : ''
          }`}
          autoComplete="username"
        />
        <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        {fieldErrors.username && (
          <p className="text-red-400 text-xs mt-1 pl-2">{fieldErrors.username}</p>
        )}
      </div>

      {/* Password field */}
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={handlePasswordChange}
          placeholder="Password"
          required
          disabled={isLoading}
          className={`w-full bg-white/10 border-gray-600 text-white px-4 py-3 rounded-md focus:ring-1 focus:ring-red-500 focus:border-red-500 pl-10 pr-10 ${
            fieldErrors.password ? 'border-red-500' : ''
          }`}
          autoComplete="current-password"
        />
        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          disabled={isLoading}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
        {fieldErrors.password && (
          <p className="text-red-400 text-xs mt-1 pl-2">{fieldErrors.password}</p>
        )}
      </div>

      {/* Remember me checkbox */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="remember"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          disabled={isLoading}
          className="mr-2 h-4 w-4 accent-red-500 disabled:opacity-50"
        />
        <label htmlFor="remember" className="text-gray-300 text-sm select-none">
          Remember me
        </label>
      </div>

      {/* Error message */}
      {error && (
        <AuthError 
          message={error} 
          onClose={onClearError}
        />
      )}

      {/* Sign in button */}
      <Button
        type="submit"
        disabled={isLoading || !isFormValid}
        className={`w-full py-3 rounded-md text-white font-medium transition-all duration-300 relative ${
          isFormValid && !isLoading
            ? "bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            : "bg-gray-700 cursor-not-allowed"
        }`}
      >
        {isLoading ? (
          <AuthLoading text="Signing In..." />
        ) : (
          "Sign In"
        )}
      </Button>
    </form>
  );
};