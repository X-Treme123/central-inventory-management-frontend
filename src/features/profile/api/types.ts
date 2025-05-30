// File: features/profile/api/types.ts

export interface UserProfileData {
  idlogin: string;
  idnik: string;
  username: string;
  position: string;
  status_login: 'Active' | 'Inactive';
  lokasi: string;
  last_active: string;
  date_upload: string;
  updatedAt: string;
}

export interface ProfileApiResponse {
  success: boolean;
  data: UserProfileData;
  message?: string;
}

export interface ProfileApiError {
  success: false;
  message: string;
  code?: string;
}