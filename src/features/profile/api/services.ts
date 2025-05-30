// File: features/profile/api/services.ts

import { ApiResponse, ApiError } from '@/lib/api/types';
import { UserProfileData, ProfileApiResponse, ProfileApiError } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export class ProfileApiService {
  private static instance: ProfileApiService;
  
  public static getInstance(): ProfileApiService {
    if (!ProfileApiService.instance) {
      ProfileApiService.instance = new ProfileApiService();
    }
    return ProfileApiService.instance;
  }

  /**
   * Get user profile data by user ID (idnik)
   */
  async getUserProfile(idnik: string): Promise<UserProfileData> {
    try {
      const token = this.getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/profile/${idnik}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData: ProfileApiError = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result: ProfileApiResponse = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch profile data');
      }

      return result.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
  }

  /**
   * Get current user profile (using token to identify user)
   */
  async getCurrentUserProfile(): Promise<UserProfileData> {
    try {
      const token = this.getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/profile/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData: ProfileApiError = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result: ProfileApiResponse = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch profile data');
      }

      return result.data;
    } catch (error) {
      console.error('Error fetching current user profile:', error);
      throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
  }

  /**
   * Update user last active timestamp
   */
  async updateLastActive(idnik: string): Promise<void> {
    try {
      const token = this.getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/profile/${idnik}/last-active`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData: ProfileApiError = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error updating last active:', error);
      // Don't throw error for last active update as it's not critical
    }
  }

  /**
   * Get authentication token from localStorage or cookie
   */
  private getAuthToken(): string {
    // Try to get token from cookie first (since you're using cookies)
    if (typeof document !== 'undefined') {
      const tokenMatch = document.cookie.match(/token=([^;]+)/);
      if (tokenMatch) {
        return tokenMatch[1];
      }
    }

    // Fallback to localStorage if available
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken') || '';
    }

    return '';
  }

  /**
   * Format date for display
   */
  static formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  }

  /**
   * Format time ago for last active display
   */
  static formatTimeAgo(dateString: string): string {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
      
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours} hours ago`;
      
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `${diffInDays} days ago`;
      
      return ProfileApiService.formatDate(dateString);
    } catch (error) {
      return dateString;
    }
  }

  /**
   * Get status badge variant based on status
   */
  static getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status.toLowerCase()) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'destructive';
      default:
        return 'outline';
    }
  }
}