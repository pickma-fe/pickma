import type { Order, OrderStatus } from '@/types/order';

const FALLBACK_RESERVATION_IMAGE_URL = '/images/fallback/bread.jpg';

export interface MypageReservation {
  id: string;
  orderNumber: string;
  storeName: string;
  productName: string | null;
  imageUrl: string;
  pickupDate: string;
  pickupTime: string;
  pickupCode: string | null;
  quantity: number | null;
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

export function mapOrderToMypageReservation(
  order: Omit<Order, 'items' | 'payment'>
): MypageReservation {
  return {
    id: order.id,
    orderNumber: order.storeOrderNumber ?? order.orderNumber,
    storeName: order.storeName,
    productName: null,
    imageUrl: order.image ?? FALLBACK_RESERVATION_IMAGE_URL,
    pickupDate: formatPickupDate(order.pickupAt),
    pickupTime: formatPickupTime(order.pickupAt),
    pickupCode: order.pickupNumber ?? null,
    quantity: null,
    price: order.paymentAmount,
    status: order.status,
    canReorder: false,
  };
}
