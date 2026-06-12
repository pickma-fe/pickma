import type { AuthProvider } from '@/types/auth';

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  phone?: string;
  authProvider?: AuthProvider;
  profileImage?: string;
  locationLat?: number;
  locationLng?: number;
  locationAddress?: string;
  role: 'customer' | 'seller' | 'admin';
  status: 'active' | 'suspended' | 'deleted';
  createdAt: string;
  updatedAt: string;
}

export interface UpdateMeRequest {
  name?: string;
  phone?: string | null;
  profileImage?: string;
  locationLat?: number | null;
  locationLng?: number | null;
  locationAddress?: string | null;
}
