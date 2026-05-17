import type {
  CreateOrderResponse,
  OrderDetailResponse,
  OrderListItemResponse,
  OrderListResponse,
} from '@/contracts/order';

import { mockPaymentResponse } from './payments';

const MOCK_ORDER_ID_1 = '00000000-0000-4000-8000-000000000701';
const MOCK_ORDER_ID_2 = '00000000-0000-4000-8000-000000000702';
const MOCK_ORDER_ID_3 = '00000000-0000-4000-8000-000000000703';
const MOCK_ORDER_ITEM_ID_1 = '00000000-0000-4000-8000-000000000801';
const MOCK_ORDER_ITEM_ID_2 = '00000000-0000-4000-8000-000000000802';
const MOCK_ORDER_ITEM_ID_3 = '00000000-0000-4000-8000-000000000803';

export const mockCreatedOrder: CreateOrderResponse = {
  id: MOCK_ORDER_ID_1,
  orderNumber: 'PM20260429A1B2C3D4E5',
  orderName: '마감 할인 크루아상 세트 1개',
  paymentAmount: 7200,
  expiresAt: '2026-04-29T10:10:00.000Z',
};

export const mockOrderItems = [
  {
    id: MOCK_ORDER_ITEM_ID_1,
    orderId: MOCK_ORDER_ID_1,
    productId: 'product_1',
    productName: '마감 할인 크루아상 세트',
    originalPrice: 12000,
    discountPrice: 7200,
    quantity: 1,
    subtotal: 7200,
    createdAt: '2026-04-29T10:00:00.000Z',
  },
  {
    id: MOCK_ORDER_ITEM_ID_2,
    orderId: MOCK_ORDER_ID_2,
    productId: 'product_2',
    productName: '오늘의 샐러드 박스',
    originalPrice: 9800,
    discountPrice: 5900,
    quantity: 1,
    subtotal: 5900,
    createdAt: '2026-04-29T10:10:00.000Z',
  },
  {
    id: MOCK_ORDER_ITEM_ID_3,
    orderId: MOCK_ORDER_ID_3,
    productId: 'product_3',
    productName: '제육볶음 도시락',
    originalPrice: 11000,
    discountPrice: 7700,
    quantity: 1,
    subtotal: 7700,
    createdAt: '2026-04-28T10:30:00.000Z',
  },
];

export const mockOrders: OrderListItemResponse[] = [
  {
    id: MOCK_ORDER_ID_1,
    orderNumber: 'PM20260429A1B2C3D4E5',
    storeId: 'store_1',
    storeName: '픽마 베이커리',
    totalAmount: 12000,
    discountAmount: 4800,
    paymentAmount: 7200,
    status: 'reserved',
    pickupAt: '2026-04-29T11:30:00.000Z',
    pickupServiceDate: '2026-04-29',
    storeOrderNumber: '20260429-0000001',
    pickupNumber: 'A-01',
    expiresAt: '2026-04-29T10:10:00.000Z',
    createdAt: '2026-04-29T10:00:00.000Z',
    updatedAt: '2026-04-29T10:01:00.000Z',
  },
  {
    id: MOCK_ORDER_ID_2,
    orderNumber: 'PM20260429F6A7B8C9D0',
    storeId: 'store_2',
    storeName: '그린 샐러드',
    totalAmount: 9800,
    discountAmount: 3900,
    paymentAmount: 5900,
    status: 'payment_pending',
    pickupAt: '2026-04-29T12:00:00.000Z',
    pickupServiceDate: '2026-04-29',
    expiresAt: '2026-04-29T10:20:00.000Z',
    createdAt: '2026-04-29T10:10:00.000Z',
    updatedAt: '2026-04-29T10:10:00.000Z',
  },
  {
    id: MOCK_ORDER_ID_3,
    orderNumber: 'PM20260429E1F2A3B4C5',
    storeId: 'store_3',
    storeName: '든든도시락 역삼점',
    totalAmount: 11000,
    discountAmount: 3300,
    paymentAmount: 7700,
    status: 'completed',
    pickupAt: '2026-04-28T13:00:00.000Z',
    pickupServiceDate: '2026-04-28',
    storeOrderNumber: '20260428-0000003',
    pickupNumber: 'B-03',
    createdAt: '2026-04-28T10:30:00.000Z',
    updatedAt: '2026-04-28T13:05:00.000Z',
  },
];

export const mockOrderDetail: OrderDetailResponse = {
  ...mockOrders[0],
  items: mockOrderItems.filter((item) => item.orderId === mockOrders[0].id),
  payment: mockPaymentResponse,
};

export const mockOrderDetailsMap: Record<string, OrderDetailResponse> =
  Object.fromEntries(
    mockOrders.map((order) => [
      order.id,
      {
        ...order,
        items: mockOrderItems.filter((item) => item.orderId === order.id),
        payment: mockPaymentResponse,
      },
    ])
  );

export const mockOrderList: OrderListResponse = {
  items: mockOrders,
  page: 1,
  pageSize: 20,
  totalCount: mockOrders.length,
  totalPages: 1,
};
