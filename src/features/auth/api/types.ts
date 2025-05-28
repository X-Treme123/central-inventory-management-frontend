// features/auth/api/types.ts

// User interface matching database view structure
export interface User {
  idlogin: number;
  idnik: string;
  username: string;
  position: string;
  lokasi: string;
  status_login?: string;
  last_active?: string;
  date_upload?: string;
  updatedAt?: string;
}

// Authentication types
export interface LoginResponse {
  code: string;
  message: string;
  token: string;
  refreshToken?: string;
  user: User;
}

// Refresh token request
export interface RefreshTokenRequest {
  refresh_token: string;
}

// Refresh token response
export interface RefreshTokenResponse {
  code: string;
  message: string;
  token: string;
  refreshToken: string;
}

// Check token response
export interface CheckTokenResponse {
  code: string;
  message: string;
  user: User;
}

// Common API response wrapper
export interface ApiResponse<T> {
  code: string;
  message: string;
  data?: T;
  error?: string;
}