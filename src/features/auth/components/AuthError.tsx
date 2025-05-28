// features/auth/components/AuthError.tsx
"use client";

import { AlertCircle, X } from "lucide-react";

interface AuthErrorProps {
  message: string;
  onClose?: () => void;
  className?: string;
}

export const AuthError = ({ message, onClose, className = "" }: AuthErrorProps) => {
  return (
    <div className={`flex items-start space-x-2 bg-red-900/30 text-red-300 p-3 rounded-lg border border-red-800/50 text-sm ${className}`}>
      <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1">{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-red-400 hover:text-red-300 transition-colors"
          aria-label="Close error message"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};