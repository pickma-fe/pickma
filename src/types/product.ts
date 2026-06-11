import type { Store } from './store';

export type ProductStatus = 'active' | 'closed';

export interface CreateSellerProductInput {
  menuItemId: string;
  discountPrice: number;
  stock: number;
  endAt: Date;
  pickupStartTime: string;
  pickupEndTime: string;
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
