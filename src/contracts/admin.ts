import type { PaginatedResult } from './common';
import type { SellerApplicationDocumentResponse } from './seller-application';

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
  status: 'approved' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export type AdminStoreListResponse = PaginatedResult<AdminStoreResponse>;

export interface AdminPendingSellerApplicationResponse {
  id: string;
  userId: string;
  applicantEmail: string;
  applicantName: string;
  applicantPhone?: string;
  status: 'pending';
  businessNumber: string;
  companyName: string;
  representativeName: string;
  businessAddress: string;
  businessType: string;
  businessCategory: string;
  documents: SellerApplicationDocumentResponse[];
  createdAt: string;
  updatedAt: string;
}

export type AdminPendingSellerApplicationListResponse =
  PaginatedResult<AdminPendingSellerApplicationResponse>;

export interface RejectSellerApplicationRequest {
  reason: string;
}
