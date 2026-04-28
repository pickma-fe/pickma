import type { Store } from './store';

export interface Category {
  id: string;
  name: string;
  icon: string | null;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  originalPrice: number;
  category: Category;
  store: Store;
}

export interface Product {
  id: string;
  menuItem: MenuItem;
  discountPrice: number;
  discountRate: number;
  availableStock: number;
  endAt: Date;
  pickupStartTime: string;
  pickupEndTime: string;
  status: ProductStatus;
  isSoldOut: boolean;
  isExpired: boolean;
}

export interface ProductListItem {
  id: string;
  name: string;
  imageUrl: string | null;
  originalPrice: number;
  discountPrice: number;
  discountRate: number;
  availableStock: number;
  endAt: Date;
  pickupStartTime: string;
  pickupEndTime: string;
  isSoldOut: boolean;
  isExpired: boolean;
  storeName: string;
  storeRegion: string;
  categoryName: string;
  categoryIcon: string | null;
}

export type ProductStatus = 'active' | 'soldout' | 'expired' | 'hidden';
