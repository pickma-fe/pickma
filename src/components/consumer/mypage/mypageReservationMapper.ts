import type { Order, OrderStatus } from '@/types/order';
import type { ProductListItemResponse } from '@/contracts/product';
import { mockProducts } from '@/mocks/products';

export interface MypageReservation {
  id: string;
  orderNumber: string;
  storeName: string;
  productName: string;
  imageUrl: string;
  pickupDate: string;
  pickupTime: string;
  quantity: number;
  price: number;
  status: OrderStatus;
  canReorder: boolean;
}

function formatPickupDate(value: Date) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  })
    .format(value)
    .replace(/\.$/, '');
}

function formatPickupTime(value: Date) {
  const start = new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(value);
  const end = new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(value.getTime() + 60 * 60 * 1000));

  return `${start} ~ ${end}`;
}

function findProductByOrder(
  order: Omit<Order, 'items' | 'payment'>,
  index: number
): ProductListItemResponse {
  return (
    mockProducts.find((product) => product.storeName === order.storeName) ??
    mockProducts[index % mockProducts.length]
  );
}

export function mapOrderToMypageReservation(
  order: Omit<Order, 'items' | 'payment'>,
  index: number
): MypageReservation {
  const product = findProductByOrder(order, index);
  const canReorder =
    product.status === 'active' &&
    product.displayStatus === 'available' &&
    !product.isExpired &&
    !product.isSoldOut &&
    product.availableStock > 0;

  return {
    id: order.id,
    orderNumber: order.storeOrderNumber ?? order.orderNumber,
    storeName: order.storeName,
    productName: product.name,
    imageUrl: product.image ?? '/images/products/bread.jpg',
    pickupDate: formatPickupDate(order.pickupAt),
    pickupTime: formatPickupTime(order.pickupAt),
    quantity: 1,
    price: order.paymentAmount,
    status: order.status,
    canReorder,
  };
}
