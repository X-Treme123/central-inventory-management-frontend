"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  Eye,
  EyeOff,
  UserCircle,
  Lock,
  AlertCircle,
} from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [animate, setAnimate] = useState(false);
  const { login, isLoading, error } = useAuth();
  const currentYear = new Date().getFullYear();

  // Check if form is valid
  useEffect(() => {
    setIsFormValid(email.trim() !== "" && password.trim() !== "");
  }, [email, password]);

  // Trigger animation on mount
  useEffect(() => {
    setAnimate(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden relative">
      {/* Background image */}
      <div className="absolute inset-0 w-full h-full bg-cover bg-center z-0" 
           style={{ backgroundImage: "url('/images/mgdb-bg-2.jpg')" }}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      </div>

      {/* Login container */}
      <div className={`z-10 max-w-md p-4 rounded-xl border-3 border-gray-600 backdrop-blur-lg w-full mx-auto px-8 transition-all duration-500 ${animate ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}>
        {/* Logo header */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="p-4 rounded-lg mb-6">
            <Image
              src="/images/logo.png"
              alt="Mineral Alam Abadi Logo"
              width={200}
              height={50}
              className="w-auto h-7"
            />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Inventory Management</h1>
          <p className="text-white/80 text-sm">Welcome to Inventory Management</p>
        </div>

        {/* Login form */}
        <div className="bg-black/50 backdrop-blur-md rounded-lg border border-gray-700 shadow-xl overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Email field */}
            <div className="relative">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="w-full bg-white/10 border-gray-600 text-white px-4 py-3 rounded-md focus:ring-1 focus:ring-red-500 focus:border-red-500 pl-10"
              />
              <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            </div>

            {/* Password field */}
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full bg-white/10 border-gray-600 text-white px-4 py-3 rounded-md focus:ring-1 focus:ring-red-500 focus:border-red-500 pl-10"
              />
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Remember me checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="mr-2 h-4 w-4 accent-red-500"
              />
              <label htmlFor="remember" className="text-gray-300 text-sm">
                Remember me
              </label>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-start space-x-2 bg-red-900/30 text-red-300 p-3 rounded-lg border border-red-800/50 text-sm">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>{error}</div>
              </div>
            )}

            {/* Sign in button */}
            <Button
              type="submit"
              disabled={isLoading || !isFormValid}
              className={`w-full py-3 rounded-md text-white font-medium transition-all duration-300 ${
                isFormValid
                  ? "background hover:bg-red-700"
                  : "bg-gray-700 cursor-not-allowed"
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Signing In</span>
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </div>

        {/* Footer copyright */}
        <div className="mt-6 text-center text-xs text-white/60">
          <p>© {currentYear} Inventory Management ❤️ by Mineral Alam Abadi</p>
        </div>
      </div>
    </div>
  );
}