export interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  profileImageUrl: string | null;
  role: UserRole;
  status: UserStatus;
}

export type UserRole = 'customer' | 'seller' | 'admin';

export type UserStatus = 'active' | 'suspended';
