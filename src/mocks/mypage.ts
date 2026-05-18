import type {
  OrderListItemResponse,
  OrderStatusParam,
} from '@/contracts/order';
import type { ProductListItemResponse } from '@/contracts/product';

import { mockOrders } from './orders';
import { mockProducts } from './products';
import { mockUser } from './users';

export interface MockMypageReservation {
  id: string;
  orderNumber: string;
  storeName: string;
  productName: string;
  imageUrl: string;
  pickupDate: string;
  pickupTime: string;
  quantity: number;
  price: number;
  status: Exclude<OrderStatusParam, 'payment_pending' | 'processing'>;
}

function formatPickupDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  })
    .format(date)
    .replace(/\.$/, '');
}

function formatPickupTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const start = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
  const end = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(date.getTime() + 60 * 60 * 1000));

  return `${start} ~ ${end}`;
}

function findProductByOrder(
  order: OrderListItemResponse,
  index: number
): ProductListItemResponse | null {
  if (mockProducts.length === 0) {
    return null;
  }

  return (
    mockProducts.find((product) => product.storeName === order.storeName) ??
    mockProducts[index % mockProducts.length]
  );
}

export const mockMypageUser = mockUser;

export const mockMypageReservations: MockMypageReservation[] =
  mockOrders.flatMap((order, index) => {
    if (order.status === 'payment_pending' || order.status === 'processing') {
      return [];
    }

    const product = findProductByOrder(order, index);

    if (!product) {
      return [];
    }

    return [
      {
        id: order.id,
        orderNumber: order.orderNumber,
        storeName: order.storeName,
        productName: product.name,
        imageUrl: product.image ?? '/images/products/bread.jpg',
        pickupDate: formatPickupDate(order.pickupAt),
        pickupTime: formatPickupTime(order.pickupAt),
        quantity: 1,
        price: order.paymentAmount,
        status: order.status,
      },
    ];
  });

export const mockRecentlyViewedProducts = mockProducts
  .slice(0, 4)
  .map((product) => ({
    id: product.id,
    name: product.name,
    imageUrl: product.image ?? '/images/products/bread.jpg',
  }));
