export interface CreateStoreRequest {
  name: string;
  description?: string;
  businessNumber: string;
  phone: string;
  address: string;
  addressDetail?: string;
  region: string;
  image?: string;
  openTime?: string;
  closeTime?: string;
}

export interface StoreResponse {
  id: string;
  userId: string;
  name: string;
  description?: string;
  businessNumber: string;
  phone: string;
  address: string;
  addressDetail?: string;
  region: string;
  image?: string;
  openTime?: string;
  closeTime?: string;
  status: 'approved' | 'inactive';
  canSell: boolean;
  createdAt: string;
  updatedAt: string;
}
