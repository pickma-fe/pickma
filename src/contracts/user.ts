export interface UserResponse {
  id: string;
  email: string;
  name: string;
  phone?: string;
  profileImage?: string;
  role: 'customer' | 'seller' | 'admin';
  status: 'active' | 'suspended' | 'deleted';
  createdAt: string;
  updatedAt: string;
}

export interface UpdateMeRequest {
  name?: string;
  profileImage?: string;
}
