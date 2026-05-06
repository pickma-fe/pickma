export interface UserResponse {
  id: string;
  email: string;
  name: string;
  phone?: string;
  profileImage?: string;
  role: 'customer' | 'seller' | 'admin';
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
}
