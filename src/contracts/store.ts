export interface UpdateStoreRequest {
  name?: string;
  description?: string;
  phone?: string;
  address?: string;
  addressDetail?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  image?: string;
  openTime?: string;
  closeTime?: string;
  operationStatus?: 'open' | 'closed';
}

export interface CreateStoreRequest {
  name: string;
  description?: string;
  businessNumber: string;
  phone: string;
  address: string;
  addressDetail?: string;
  region: string;
  latitude?: number;
  longitude?: number;
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
  latitude?: number;
  longitude?: number;
  image?: string;
  openTime?: string;
  closeTime?: string;
  status: 'active' | 'inactive';
  operationStatus: 'open' | 'closed';
  canSell: boolean;
  createdAt: string;
  updatedAt: string;
}
