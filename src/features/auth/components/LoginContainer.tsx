// features/auth/components/LoginContainer.tsx
"use client";

import { ReactNode, useEffect, useState } from "react";
import Image from "next/image";

interface LoginContainerProps {
  children: ReactNode;
  className?: string;
}

export const LoginContainer = ({ children, className = "" }: LoginContainerProps) => {
  const [animate, setAnimate] = useState(false);
  const currentYear = new Date().getFullYear();

  // Trigger animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`min-h-screen flex items-center justify-center overflow-hidden relative ${className}`}>
      {/* Background image */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center z-0" 
        style={{ backgroundImage: "url('/images/mgdb-bg-2.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      </div>

      {/* Login container */}
      <div 
        className={`z-10 max-w-md p-4 rounded-xl border-3 border-gray-600 backdrop-blur-lg w-full mx-auto px-8 transition-all duration-500 ${
          animate ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
        }`}
      >
        {/* Logo header */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="p-4 rounded-lg mb-6">
            <Image
              src="/images/logo.png"
              alt="Mineral Alam Abadi Logo"
              width={200}
              height={50}
              className="w-auto h-7"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Inventory Management</h1>
          <p className="text-white/80 text-sm">Welcome to Inventory Management</p>
        </div>

        {/* Login form container */}
        <div className="bg-black/50 backdrop-blur-md rounded-lg border border-gray-700 shadow-xl overflow-hidden">
          <div className="p-6">
            {children}
          </div>
        </div>

        {/* Footer copyright */}
        <div className="mt-6 text-center text-xs text-white/60">
          <p>© {currentYear} Inventory Management ❤️ by Mineral Alam Abadi</p>
        </div>
      </div>
    </div>
  );
};