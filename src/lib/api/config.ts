import Cookies from 'js-cookie';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3307';

// Default options for fetch
export const defaultOptions = {
  headers: {
    'Content-Type': 'application/json',
  },
};

// Function to decode JWT payload
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

// Function to include auth token in request headers
export const getAuthHeaders = (token: string | null) => {
  if (!token) return { ...defaultOptions.headers };
  
  return {
    ...defaultOptions.headers,
    'Authorization': token, // API expects token directly, not with "Bearer" prefix
  };
};

// Function to handle token expiration
const handleTokenExpiration = () => {
  // Clear cookies
  Cookies.remove('token');
  Cookies.remove('user_data');
  
  // Redirect to login page
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};

// Centralized fetch function with authentication
export const fetchWithAuth = async (url: string, options: RequestInit = {}, token: string | null = null) => {
  // Check token validity before making request
  if (token && isTokenExpired(token)) {
    handleTokenExpiration();
    throw new Error('Session expired. Please log in again.');
  }
  
  const headers = token ? getAuthHeaders(token) : defaultOptions.headers;
  
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        ...headers,
        ...(options.headers || {}),
      },
    });

    // Handle authentication errors
    if (response.status === 401) {
      handleTokenExpiration();
      throw new Error('Session expired. Please log in again.');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
      throw new Error(errorData.message || errorData.messages || 'API request failed');
    }

    return response.json();
  } catch (error: any) {
    // Check if error is related to JWT expiration
    if (error.message && (
      error.message.includes('jwt expired') || 
      error.message.includes('invalid token') ||
      error.message.includes('Session expired')
    )) {
      handleTokenExpiration();
    }
    throw error;
  }
};