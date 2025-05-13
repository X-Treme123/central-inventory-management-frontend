// context/AuthContext.tsx
"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/lib/api/services';
import Cookies from 'js-cookie';

interface User {
  id: number;
  name: string;
  email: string;
  divisi: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  checkTokenValidity: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Function to decode JWT payload without a library
const decodeJWT = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    return payload;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

// Function to check if token is expired
const isTokenExpired = (token: string): boolean => {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) return true;
  
  // exp is in seconds, JS Date expects milliseconds
  const expiry = payload.exp * 1000;
  return Date.now() >= expiry;
};

// Create a secure way to store user data that doesn't use localStorage
// but still persists across refreshes
const USER_DATA_COOKIE = 'user_data';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuthentication = async () => {
      const storedToken = Cookies.get('token');
      const storedUserData = Cookies.get(USER_DATA_COOKIE);
      
      if (storedToken) {
        // Check if token is expired
        if (isTokenExpired(storedToken)) {
          // Token is expired, perform logout
          Cookies.remove('token');
          Cookies.remove(USER_DATA_COOKIE);
          setUser(null);
          setToken(null);
          router.push('/login');
          setIsLoading(false);
          return;
        }
        
        setToken(storedToken);
        
        // Try to get user data from the cookie first
        if (storedUserData) {
          try {
            const parsedUserData = JSON.parse(storedUserData);
            setUser(parsedUserData);
          } catch (err) {
            console.error('Error parsing user data:', err);
            // Fallback to extract from JWT if JSON parsing fails
            extractUserFromToken(storedToken);
          }
        } else {
          // If no user data cookie, extract from token
          extractUserFromToken(storedToken);
        }
      }
      
      setIsLoading(false);
    };
    
    checkAuthentication();
  }, [router]);

  // Function to extract user data from token
  const extractUserFromToken = (token: string) => {
    const payload = decodeJWT(token);
    if (payload && payload.id) {
      const userData = {
        id: payload.id,
        name: payload.name || 'User',
        email: payload.email || '',
        divisi: payload.divisi || 'Admin'
      };
      setUser(userData);
      
      // Save user data to cookie for persistence across refreshes
      Cookies.set(USER_DATA_COOKIE, JSON.stringify(userData), { 
        expires: 1,
        sameSite: 'Strict'
      });
    }
  };

  // Function to check token validity
  const checkTokenValidity = async (): Promise<boolean> => {
    const currentToken = Cookies.get('token');
    
    if (!currentToken) {
      return false;
    }
    
    // Check if token is expired
    if (isTokenExpired(currentToken)) {
      // Perform logout
      Cookies.remove('token');
      Cookies.remove(USER_DATA_COOKIE);
      setUser(null);
      setToken(null);
      router.push('/login');
      return false;
    }
    
    return true;
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await loginUser(email, password);
      
      if (response.token) {
        // Store token in HTTP-only cookie
        Cookies.set('token', response.token, { 
          expires: 1,
          sameSite: 'Strict'
        });
        
        // Create user object from response
        const userData = {
          id: response.user?.id || 1,
          name: response.user?.name || email.split('@')[0],
          email: response.user?.email || email,
          divisi: response.user?.divisi || 'Default Division',
          avatar: response.user?.avatar || undefined
        };
        
        // Save user data for refresh persistence
        Cookies.set(USER_DATA_COOKIE, JSON.stringify(userData), { 
          expires: 1,
          sameSite: 'Strict'
        });
        
        // Set user data in state
        setUser(userData);
        setToken(response.token);
        
        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        throw new Error('Login failed: No token received');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to login');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Clear cookies
    Cookies.remove('token');
    Cookies.remove(USER_DATA_COOKIE);
    
    // Clear state
    setUser(null);
    setToken(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        token, 
        isLoading, 
        error, 
        login, 
        logout,
        isAuthenticated: !!token,
        checkTokenValidity
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};