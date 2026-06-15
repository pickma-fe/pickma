import type { Store } from './store';

export type ProductStatus = 'active' | 'closed';

export type ProductDiscountOption =
  | 'all'
  | 'over-40'
  | '30-to-40'
  | '20-to-30'
  | 'under-20';

export interface ProductListQuery {
  page: number;
  pageSize: number;
  userLat?: number;
  userLng?: number;
  categoryId?: string;
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
  discountOption?: ProductDiscountOption;
  sort?:
    | 'endAt'
    | 'discountRate'
    | 'discountPrice'
    | 'distance'
    | 'popular'
    | 'aiRecommendation';
  order?: 'asc' | 'desc';
  availableOnly?: boolean;
}

export interface CreateSellerProductInput {
  menuItemId: string;
  discountPrice: number;
  stock: number;
  endAt: Date;
  pickupStartTime: string;
  pickupEndTime: string;
}

export interface UpdateSellerProductInput {
  discountPrice?: number;
  stock?: number;
  endAt?: Date;
  pickupStartTime?: string;
  pickupEndTime?: string;
  status?: ProductStatus;
}

export type ProductDisplayStatus =
  | 'available'
  | 'soldOut'
  | 'expired'
  | 'closed';

export interface Product {
  id: string;
  storeId: string;
  storeName: string;
  categoryId?: string;
  categoryName?: string;
  menuItemId: string;
  name: string;
  description?: string;
  image?: string;
  originalPrice: number;
  discountPrice: number;
  discountRate: number;
  stock: number;
  reservedStock: number;
  availableStock: number;
  endAt: Date;
  pickupStartTime: string;
  pickupEndTime: string;
  status: ProductStatus;
  isSoldOut: boolean;
  isExpired: boolean;
  displayStatus: ProductDisplayStatus;
  distanceKm?: number;
  storeLat?: number;
  storeLng?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProductDetail extends Product {
  store: Pick<
    Store,
    | 'id'
    | 'name'
    | 'description'
    | 'phone'
    | 'address'
    | 'addressDetail'
    | 'region'
    | 'image'
  >;
}
