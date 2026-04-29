export interface UserResponse {
  id: string;
  email: string;
  name: string;
  phone?: string;
  profileImage?: string;
  role: 'customer' | 'seller' | 'admin';
  status: string;
  createdAt: string;
  updatedAt: string;
}
