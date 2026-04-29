export type AuthProvider = 'google' | 'kakao';

export interface AuthUser {
  id: string;
  email: string;
  provider?: AuthProvider;
}

export type UserRole = 'customer' | 'seller' | 'admin';

export type UserStatus = 'active' | 'suspended' | 'deleted';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  profileImage?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}
