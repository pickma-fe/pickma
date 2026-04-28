import type { ProductStatus } from '@/types';

import type { MockCategory } from '../shared';
import { mockCategories } from '../shared';

function getCategoryById(categoryId: string) {
  const category = mockCategories.find((item) => item.id === categoryId);

  if (!category) {
    throw new Error(`Category not found: ${categoryId}`);
  }

  return category;
}

const bakeryCategory = getCategoryById('category-bakery');
const lunchboxSideCategory = getCategoryById('category-lunchbox-side');
const saladCategory = getCategoryById('category-salad');
const cafeDessertCategory = getCategoryById('category-cafe-dessert');
const snackCategory = getCategoryById('category-snack');

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
  category: MockCategory;
}

const consumerProducts: ConsumerProductItem[] = [
  {
    id: 'product-1',
    name: '버터 크루아상',
    description: '당일 생산한 크루아상을 마감 할인으로 판매합니다.',
    image: null,
    originalPrice: 4500,
    discountPrice: 2700,
    discountRate: 40,
    stock: 6,
    endTime: '2026-12-28T20:00:00+09:00',
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
  {
    id: 'product-2',
    name: '제육볶음 도시락',
    description:
      '저녁 시간 이후 남은 도시락을 할인된 가격으로 예약할 수 있습니다.',
    image: null,
    originalPrice: 9500,
    discountPrice: 5900,
    discountRate: 38,
    stock: 4,
    endTime: '2026-12-28T19:30:00+09:00',
    pickupStartTime: '19:30',
    pickupEndTime: '20:30',
    status: 'active',
    store: {
      id: 'store-2',
      name: '집밥연구소',
      region: '마포구',
      address: '서울 마포구 월드컵로 45',
      image: null,
    },
    category: lunchboxSideCategory,
  },
  {
    id: 'product-3',
    name: '치킨 샐러드',
    description: '닭가슴살과 신선한 채소로 구성된 한 끼 샐러드입니다.',
    image: null,
    originalPrice: 8900,
    discountPrice: 5400,
    discountRate: 39,
    stock: 3,
    endTime: '2026-12-28T20:30:00+09:00',
    pickupStartTime: '20:30',
    pickupEndTime: '21:30',
    status: 'active',
    store: {
      id: 'store-3',
      name: '그린테이블',
      region: '강남구',
      address: '서울 강남구 테헤란로 22',
      image: null,
    },
    category: saladCategory,
  },
  {
    id: 'product-4',
    name: '티라미수 컵디저트',
    description: '매장에서 직접 만든 티라미수를 마감 특가로 제공합니다.',
    image: null,
    originalPrice: 7000,
    discountPrice: 4200,
    discountRate: 40,
    stock: 5,
    endTime: '2026-12-28T21:00:00+09:00',
    pickupStartTime: '21:00',
    pickupEndTime: '22:00',
    status: 'active',
    store: {
      id: 'store-4',
      name: '스윗모먼트',
      region: '송파구',
      address: '서울 송파구 오금로 18',
      image: null,
    },
    category: cafeDessertCategory,
  },
  {
    id: 'product-5',
    name: '떡볶이 1인분',
    description: '마감 전 남은 떡볶이를 1인분 기준으로 할인 판매합니다.',
    image: null,
    originalPrice: 6000,
    discountPrice: 3500,
    discountRate: 42,
    stock: 7,
    endTime: '2026-12-28T19:00:00+09:00',
    pickupStartTime: '19:00',
    pickupEndTime: '20:00',
    status: 'active',
    store: {
      id: 'store-5',
      name: '오백이네 분식',
      region: '광진구',
      address: '서울 광진구 능동로 77',
      image: null,
    },
    category: snackCategory,
  },
];

const cloneProduct = (product: ConsumerProductItem): ConsumerProductItem => ({
  ...product,
  store: { ...product.store },
  category: { ...product.category },
});

export const mockConsumerProductDetailMap: Record<string, ConsumerProductItem> =
  Object.fromEntries(
    consumerProducts.map((product) => [product.id, cloneProduct(product)])
  );

export const mockConsumerProducts = consumerProducts.map(cloneProduct);
export const mockConsumerSearchResults = consumerProducts.map(cloneProduct);
