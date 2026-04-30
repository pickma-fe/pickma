import type { PaginatedResult } from './common';

export interface ProductListParams {
  page: number;
  pageSize: number;
  region?: string;
  categoryId?: string;
  keyword?: string;
  sort?: 'endAt' | 'discountRate' | 'createdAt';
  order?: 'asc' | 'desc';
}

export interface ProductListItemResponse {
  id: string;
  storeId: string;
  storeName: string;
  categoryId?: string;
  categoryName?: string;
  menuItemId: string;
  name: string;
  image?: string;
  originalPrice: number;
  discountPrice: number;
  discountRate: number;
  stock: number;
  reservedStock: number;
  availableStock: number;
  isSoldOut: boolean;
  isExpired: boolean;
  displayStatus: 'available' | 'soldOut' | 'expired' | 'closed';
  endAt: string;
  pickupStartTime: string;
  pickupEndTime: string;
  status: 'active' | 'closed';
}

export type ProductListResponse = PaginatedResult<ProductListItemResponse>;

export interface ProductDetailResponse extends ProductListItemResponse {
  description?: string;
  store: {
    id: string;
    name: string;
    description?: string;
    phone: string;
    address: string;
    addressDetail?: string;
    region: string;
    image?: string;
  };
}

export interface CreateSellerProductRequest {
  menuItemId: string;
  discountPrice: number;
  stock: number;
  endAt: string;
  pickupStartTime: string;
  pickupEndTime: string;
}

export interface UpdateSellerProductRequest {
  discountPrice?: number;
  stock?: number;
  endAt?: string;
  pickupStartTime?: string;
  pickupEndTime?: string;
}
