import type { PaginatedResult } from './common';
import type { OrderListItemResponse, OrderStatusParam } from './order';
import type { ProductListItemResponse } from './product';
import type { SellerApplicationDocumentResponse } from './seller-application';
import type { UserResponse } from './user';

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
  status: 'active' | 'inactive';
  operationStatus: 'open' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export type AdminStoreListResponse = PaginatedResult<AdminStoreResponse>;

export interface AdminStoreListQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: 'active' | 'inactive';
  region?: string;
}

export interface AdminDashboardStatsResponse {
  totalStores: number;
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  dailyMetrics: AdminDashboardDailyMetricResponse[];
  recentPendingApplications: AdminDashboardPendingApplicationSummaryResponse[];
  recentOrders: AdminDashboardRecentOrderResponse[];
  recentUsers: AdminDashboardRecentUserResponse[];
}

export interface AdminDashboardDailyMetricResponse {
  date: string;
  orderCount: number;
  salesAmount: number;
}

export interface AdminDashboardPendingApplicationSummaryResponse {
  id: string;
  companyName: string;
  businessCategory: string;
  createdAt: string;
}

export interface AdminDashboardRecentOrderResponse {
  id: string;
  productName: string;
  storeName: string;
  paymentAmount: number;
  status: OrderStatusParam;
  createdAt: string;
}

export interface AdminDashboardRecentUserResponse {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

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

export interface AdminPendingSellerApplicationListQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
  createdDate?: string;
  businessCategory?: string;
}

export interface RejectSellerApplicationRequest {
  reason: string;
}

export type AdminUserResponse = UserResponse;

export type AdminUserListResponse = PaginatedResult<AdminUserResponse>;

export interface AdminUserListQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
  role?: AdminUserResponse['role'];
  status?: AdminUserResponse['status'];
}

export type AdminProductResponse = ProductListItemResponse;

export type AdminProductListResponse = PaginatedResult<AdminProductResponse>;

export interface AdminProductListQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: AdminProductResponse['status'];
  storeId?: string;
}

export type AdminOrderResponse = OrderListItemResponse;

export type AdminOrderListResponse = PaginatedResult<AdminOrderResponse>;

export interface AdminOrderListQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: OrderStatusParam;
  sort?: 'createdAt' | 'pickupAt';
  order?: 'asc' | 'desc';
}
