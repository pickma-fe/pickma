import type { OrderStatus } from '@/types';

interface ConsumerOrderStore {
  id: string;
  name: string;
  address: string;
  phone: string;
  image: string | null;
}

interface ConsumerOrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface ConsumerOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  pickupTime: string;
  totalAmount: number;
  discountAmount: number;
  paymentAmount: number;
  createdAt: string;
  store: ConsumerOrderStore;
  items: ConsumerOrderItem[];
}

const consumerOrders: ConsumerOrder[] = [
  {
    id: 'order-1',
    orderNumber: 'PM20260428000001',
    status: 'reserved',
    pickupTime: '20:00',
    totalAmount: 9500,
    discountAmount: 3600,
    paymentAmount: 5900,
    createdAt: '2026-04-28T18:10:00+09:00',
    store: {
      id: 'store-2',
      name: '집밥연구소',
      address: '서울 마포구 월드컵로 45',
      phone: '02-123-4567',
      image: null,
    },
    items: [
      {
        id: 'order-item-1',
        productId: 'product-2',
        productName: '제육볶음 도시락',
        quantity: 1,
        unitPrice: 5900,
        subtotal: 5900,
      },
    ],
  },
];

export const mockConsumerOrderDetailMap: Record<string, ConsumerOrder> =
  Object.fromEntries(consumerOrders.map((order) => [order.id, order]));

export const mockConsumerOrders = consumerOrders;
