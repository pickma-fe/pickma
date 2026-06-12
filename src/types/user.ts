import type { AuthProvider } from './auth';

export type UserRole = 'customer' | 'seller' | 'admin';

export type UserStatus = 'active' | 'suspended' | 'deleted';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  authProvider?: AuthProvider;
  profileImage?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateMeInput {
  name?: string;
  phone?: string;
  profileImage?: string;
}
