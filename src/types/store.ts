export interface Store {
  id: string;
  name: string;
  description: string | null;
  phone: string;
  address: string;
  addressDetail: string | null;
  region: string;
  imageUrl: string | null;
  status: StoreStatus;
}

export type StoreStatus = 'pending' | 'approved' | 'rejected' | 'suspended';
