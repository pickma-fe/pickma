import type { PaginatedResult } from './common';

export interface AdminStoreResponse {
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
  status: 'pending' | 'approved' | 'rejected' | 'inactive';
  rejectReason?: string;
  createdAt: string;
  updatedAt: string;
}

export type AdminStoreListResponse = PaginatedResult<AdminStoreResponse>;

export interface RejectStoreRequest {
  reason: string;
}
