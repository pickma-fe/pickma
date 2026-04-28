import type { Product, ProductListItem, Store } from '@/types';

import { mockCategories } from '../shared';

function getCategoryById(categoryId: string) {
  const category = mockCategories.find((item) => item.id === categoryId);

  if (!category) {
    throw new Error(`[mock] Category not found: ${categoryId}`);
  }

  return category;
}

function makeFutureDate(offsetHours: number) {
  return new Date(Date.now() + offsetHours * 60 * 60 * 1000);
}

function toProductListItem(product: Product): ProductListItem {
  return {
    id: product.id,
    name: product.menuItem.name,
    imageUrl: product.menuItem.imageUrl,
    originalPrice: product.menuItem.originalPrice,
    discountPrice: product.discountPrice,
    discountRate: product.discountRate,
    availableStock: product.availableStock,
    endAt: product.endAt,
    pickupStartTime: product.pickupStartTime,
    pickupEndTime: product.pickupEndTime,
    isSoldOut: product.isSoldOut,
    isExpired: product.isExpired,
    storeName: product.menuItem.store.name,
    storeRegion: product.menuItem.store.region,
    categoryName: product.menuItem.category.name,
    categoryIcon: product.menuItem.category.icon,
  };
}

const bakeryCategory = getCategoryById('category-bakery');
const lunchboxSideCategory = getCategoryById('category-lunchbox-side');
const saladCategory = getCategoryById('category-salad');
const cafeDessertCategory = getCategoryById('category-cafe-dessert');
const snackCategory = getCategoryById('category-snack');

const bakeryStore: Store = {
  id: 'store-1',
  name: '해피베이커리',
  description: '당일 생산한 빵을 판매하는 동네 베이커리입니다.',
  phone: '02-111-1111',
  address: '서울 성동구 왕십리로 100',
  addressDetail: null,
  region: '성동구',
  imageUrl: null,
  status: 'approved',
};

const lunchboxStore: Store = {
  id: 'store-2',
  name: '집밥연구소',
  description: '한식 도시락과 반찬을 판매합니다.',
  phone: '02-222-2222',
  address: '서울 마포구 월드컵로 45',
  addressDetail: null,
  region: '마포구',
  imageUrl: null,
  status: 'approved',
};

const saladStore: Store = {
  id: 'store-3',
  name: '그린테이블',
  description: '신선한 샐러드와 건강식을 제공합니다.',
  phone: '02-333-3333',
  address: '서울 강남구 테헤란로 22',
  addressDetail: null,
  region: '강남구',
  imageUrl: null,
  status: 'approved',
};

const dessertStore: Store = {
  id: 'store-4',
  name: '스윗모먼트',
  description: '수제 디저트 전문 매장입니다.',
  phone: '02-444-4444',
  address: '서울 송파구 오금로 18',
  addressDetail: null,
  region: '송파구',
  imageUrl: null,
  status: 'approved',
};

const snackStore: Store = {
  id: 'store-5',
  name: '오백이네 분식',
  description: '분식 메뉴를 판매하는 매장입니다.',
  phone: '02-555-5555',
  address: '서울 광진구 능동로 77',
  addressDetail: null,
  region: '광진구',
  imageUrl: null,
  status: 'approved',
};

const consumerProducts: Product[] = [
  {
    id: 'product-1',
    menuItem: {
      id: 'menu-item-1',
      name: '버터 크루아상',
      description: '당일 생산한 크루아상을 마감 할인으로 판매합니다.',
      imageUrl: null,
      originalPrice: 4500,
      category: bakeryCategory,
      store: bakeryStore,
    },
    discountPrice: 2700,
    discountRate: 40,
    availableStock: 6,
    endAt: makeFutureDate(4),
    pickupStartTime: '20:00',
    pickupEndTime: '21:00',
    status: 'active',
    isSoldOut: false,
    isExpired: false,
  },
  {
    id: 'product-2',
    menuItem: {
      id: 'menu-item-2',
      name: '제육볶음 도시락',
      description:
        '저녁 시간 이후 남은 도시락을 할인된 가격으로 예약할 수 있습니다.',
      imageUrl: null,
      originalPrice: 9500,
      category: lunchboxSideCategory,
      store: lunchboxStore,
    },
    discountPrice: 5900,
    discountRate: 38,
    availableStock: 4,
    endAt: makeFutureDate(5),
    pickupStartTime: '19:30',
    pickupEndTime: '20:30',
    status: 'active',
    isSoldOut: false,
    isExpired: false,
  },
  {
    id: 'product-3',
    menuItem: {
      id: 'menu-item-3',
      name: '치킨 샐러드',
      description: '닭가슴살과 신선한 채소로 구성된 한 끼 샐러드입니다.',
      imageUrl: null,
      originalPrice: 8900,
      category: saladCategory,
      store: saladStore,
    },
    discountPrice: 5400,
    discountRate: 39,
    availableStock: 3,
    endAt: makeFutureDate(6),
    pickupStartTime: '20:30',
    pickupEndTime: '21:30',
    status: 'active',
    isSoldOut: false,
    isExpired: false,
  },
  {
    id: 'product-4',
    menuItem: {
      id: 'menu-item-4',
      name: '티라미수 컵디저트',
      description: '매장에서 직접 만든 티라미수를 마감 특가로 제공합니다.',
      imageUrl: null,
      originalPrice: 7000,
      category: cafeDessertCategory,
      store: dessertStore,
    },
    discountPrice: 4200,
    discountRate: 40,
    availableStock: 5,
    endAt: makeFutureDate(7),
    pickupStartTime: '21:00',
    pickupEndTime: '22:00',
    status: 'active',
    isSoldOut: false,
    isExpired: false,
  },
  {
    id: 'product-5',
    menuItem: {
      id: 'menu-item-5',
      name: '떡볶이 1인분',
      description: '마감 전 남은 떡볶이를 1인분 기준으로 할인 판매합니다.',
      imageUrl: null,
      originalPrice: 6000,
      category: snackCategory,
      store: snackStore,
    },
    discountPrice: 3500,
    discountRate: 42,
    availableStock: 7,
    endAt: makeFutureDate(3),
    pickupStartTime: '19:00',
    pickupEndTime: '20:00',
    status: 'active',
    isSoldOut: false,
    isExpired: false,
  },
];

export const mockConsumerProductDetailMap: Record<string, Product> =
  Object.fromEntries(consumerProducts.map((product) => [product.id, product]));

export const mockConsumerProducts = consumerProducts.map(toProductListItem);

export const mockConsumerSearchResults =
  consumerProducts.map(toProductListItem);
