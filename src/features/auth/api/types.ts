// features/auth/api/types.ts - Updated with department field

// User interface matching database view structure
export interface User {
  idlogin: number;
  idnik: string;
  username: string;
  position: string;
  department: string; // Added department field
  lokasi: string;
  status_login?: string;
  last_active?: string;
  date_upload?: string;
  updatedAt?: string;
}

// Department interface for dropdown selection
export interface Department {
  id: string;
  name: string;
  user_count?: number;
  description?: string;
}

// User list interface for requestor selection
export interface UserListItem {
  idlogin: number;
  idnik: string;
  username: string;
  position: string;
  department: string;
  lokasi: string;
  status_login: string;
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

// Departments response
export interface DepartmentsResponse {
  code: string;
  message: string;
  data: Department[];
}

// Users response
export interface UsersResponse {
  code: string;
  message: string;
  data: UserListItem[];
}

// Current user info response
export interface CurrentUserResponse {
  code: string;
  message: string;
  data: User;
}

// Common API response wrapper
export interface ApiResponse<T> {
  code: string;
  message: string;
  data?: T;
  error?: string;
}