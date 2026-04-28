import type { ProductStatus } from '@/types';

import { mockCategories } from '../shared';

const bakeryCategory = mockCategories[0];

interface ConsumerStore {
  id: string;
  name: string;
  region: string;
  address: string;
  image: string | null;
}

export interface ConsumerProductItem {
  id: string;
  name: string;
  description: string;
  image: string | null;
  originalPrice: number;
  discountPrice: number;
  discountRate: number;
  stock: number;
  endTime: string;
  pickupStartTime: string;
  pickupEndTime: string;
  status: ProductStatus;
  store: ConsumerStore;
  category: {
    id: string;
    name: string;
    icon: string | null;
  };
}

export const mockConsumerProducts: ConsumerProductItem[] = [
  {
    id: 'product-1',
    name: '버터 크루아상',
    description: '당일 생산한 크루아상을 마감 할인으로 판매합니다.',
    image: null,
    originalPrice: 4500,
    discountPrice: 2700,
    discountRate: 40,
    stock: 6,
    endTime: '2026-04-28T20:00:00+09:00',
    pickupStartTime: '20:00',
    pickupEndTime: '21:00',
    status: 'active',
    store: {
      id: 'store-1',
      name: '해피베이커리',
      region: '성동구',
      address: '서울 성동구 왕십리로 100',
      image: null,
    },
    category: bakeryCategory,
  },
];
