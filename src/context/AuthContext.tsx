// context/AuthContext.tsx
"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser, checkToken, refreshToken as refreshTokenService } from '@/features/auth/api/services';
import { User } from '@/features/auth/api/types';
import Cookies from 'js-cookie';

interface AuthContextType {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  checkTokenValidity: () => Promise<boolean>;
  handleRefreshToken: () => Promise<boolean>;
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

// Cookie names
const TOKEN_COOKIE = 'token';
const REFRESH_TOKEN_COOKIE = 'refresh_token';
const USER_DATA_COOKIE = 'user_data';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Clear all auth data
  const clearAuthData = () => {
    Cookies.remove(TOKEN_COOKIE);
    Cookies.remove(REFRESH_TOKEN_COOKIE);
    Cookies.remove(USER_DATA_COOKIE);
    setUser(null);
    setToken(null);
    setRefreshToken(null);
  };

  // Handle token refresh
  const handleRefreshToken = async (): Promise<boolean> => {
    try {
      const storedRefreshToken = Cookies.get(REFRESH_TOKEN_COOKIE);
      
      if (!storedRefreshToken) {
        clearAuthData();
        return false;
      }

      // Check if refresh token is expired
      if (isTokenExpired(storedRefreshToken)) {
        clearAuthData();
        router.push('/login');
        return false;
      }

      const response = await refreshTokenService(storedRefreshToken);
      
      // Store new tokens
      Cookies.set(TOKEN_COOKIE, response.token, { 
        expires: 1,
        sameSite: 'Strict'
      });
      
      Cookies.set(REFRESH_TOKEN_COOKIE, response.refreshToken, { 
        expires: 7, // Refresh token typically lasts longer
        sameSite: 'Strict'
      });

      setToken(response.token);
      setRefreshToken(response.refreshToken);
      
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      clearAuthData();
      router.push('/login');
      return false;
    }
  };

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuthentication = async () => {
      const storedToken = Cookies.get(TOKEN_COOKIE);
      const storedRefreshToken = Cookies.get(REFRESH_TOKEN_COOKIE);
      const storedUserData = Cookies.get(USER_DATA_COOKIE);
      
      if (storedToken) {
        // Check if token is expired
        if (isTokenExpired(storedToken)) {
          // Try to refresh token
          const refreshSuccess = await handleRefreshToken();
          if (!refreshSuccess) {
            setIsLoading(false);
            return;
          }
        } else {
          setToken(storedToken);
          setRefreshToken(storedRefreshToken || null);
          
          // Try to get user data from the cookie first
          if (storedUserData) {
            try {
              const parsedUserData = JSON.parse(storedUserData);
              setUser(parsedUserData);
            } catch (err) {
              console.error('Error parsing user data:', err);
              // Fallback to check token API
              try {
                const tokenCheckResponse = await checkToken();
                setUser(tokenCheckResponse.user);
                // Save user data to cookie
                Cookies.set(USER_DATA_COOKIE, JSON.stringify(tokenCheckResponse.user), { 
                  expires: 1,
                  sameSite: 'Strict'
                });
              } catch (tokenError) {
                console.error('Token check failed:', tokenError);
                clearAuthData();
              }
            }
          } else {
            // If no user data cookie, check token validity
            try {
              const tokenCheckResponse = await checkToken();
              setUser(tokenCheckResponse.user);
              // Save user data to cookie
              Cookies.set(USER_DATA_COOKIE, JSON.stringify(tokenCheckResponse.user), { 
                expires: 1,
                sameSite: 'Strict'
              });
            } catch (tokenError) {
              console.error('Token check failed:', tokenError);
              clearAuthData();
            }
          }
        }
      }
      
      setIsLoading(false);
    };
    
    checkAuthentication();
  }, [router]);

  // Function to check token validity
  const checkTokenValidity = async (): Promise<boolean> => {
    const currentToken = Cookies.get(TOKEN_COOKIE);
    
    if (!currentToken) {
      return false;
    }
    
    // Check if token is expired
    if (isTokenExpired(currentToken)) {
      // Try to refresh token
      return await handleRefreshToken();
    }
    
    return true;
  };

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await loginUser(username, password);
      
      if (response.token && response.user) {
        // Store tokens in HTTP-only cookies
        Cookies.set(TOKEN_COOKIE, response.token, { 
          expires: 1,
          sameSite: 'Strict'
        });
        
        if (response.refreshToken) {
          Cookies.set(REFRESH_TOKEN_COOKIE, response.refreshToken, { 
            expires: 7, // Refresh token typically lasts longer
            sameSite: 'Strict'
          });
          setRefreshToken(response.refreshToken);
        }
        
        // Save user data for refresh persistence
        Cookies.set(USER_DATA_COOKIE, JSON.stringify(response.user), { 
          expires: 1,
          sameSite: 'Strict'
        });
        
        // Set user data in state
        setUser(response.user);
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
    clearAuthData();
    
    // Redirect to login
    router.push('/login');
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        token,
        refreshToken,
        isLoading, 
        error, 
        login, 
        logout,
        isAuthenticated: !!token && !!user,
        checkTokenValidity,
        handleRefreshToken
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