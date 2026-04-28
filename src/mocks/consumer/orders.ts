import type { Order } from '@/types';

const orderStore = {
  id: 'store-2',
  name: '집밥연구소',
  description: '한식 도시락과 반찬을 판매합니다.',
  phone: '02-222-2222',
  address: '서울 마포구 월드컵로 45',
  addressDetail: null,
  region: '마포구',
  imageUrl: null,
  status: 'approved' as const,
};

const consumerOrders: Order[] = [
  {
    id: 'order-1',
    orderNumber: 'PM20260428000001',
    status: 'reserved',
    pickupTime: '20:00',
    totalAmount: 9500,
    discountAmount: 3600,
    paymentAmount: 5900,
    createdAt: new Date('2026-04-28T18:10:00+09:00'),
    store: orderStore,
    items: [
      {
        id: 'order-item-1',
        productId: 'product-2',
        productName: '제육볶음 도시락',
        originalPrice: 9500,
        discountPrice: 5900,
        quantity: 1,
        subtotal: 5900,
      },
    ],
    payment: {
      method: 'card',
      status: 'completed',
      amount: 5900,
      paidAt: new Date('2026-04-28T18:12:00+09:00'),
    },
  },
];

const cloneOrder = (order: Order): Order => ({
  ...order,
  createdAt: new Date(order.createdAt),
  store: { ...order.store },
  items: order.items.map((item) => ({ ...item })),
  payment: order.payment
    ? {
        ...order.payment,
        paidAt: order.payment.paidAt ? new Date(order.payment.paidAt) : null,
      }
    : null,
});

export const mockConsumerOrderDetailMap: Record<string, Order> =
  Object.fromEntries(
    consumerOrders.map((order) => [order.id, cloneOrder(order)])
  );

export const mockConsumerOrders = consumerOrders.map(cloneOrder);
