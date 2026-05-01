export type StoreStatus = 'pending' | 'approved' | 'rejected' | 'inactive';

export interface CreateStoreInput {
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

export interface Store {
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
  status: StoreStatus;
  rejectReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MyStore extends Store {
  canSell: boolean;
}
