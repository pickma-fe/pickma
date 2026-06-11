import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Order } from '@/types/order';
import type {
  OrderDetailResponse,
  OrderListResponse,
  SellerOrderSummaryResponse,
} from '@/contracts/order';

import { sellerOrderApi } from './sellerOrderApi';
import { mapSellerOrder, mapSellerOrderListItem } from './sellerOrderMapper';
import { apiClient } from '../../apiClient';

vi.mock('../../apiClient', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    apiClient: {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    },
  };
});

vi.mock('./sellerOrderMapper', () => ({
  mapSellerOrder: vi.fn(),
  mapSellerOrderListItem: vi.fn(),
}));

const ORDER_ID = 'order-1';

const mockListItemResponse = {
  id: ORDER_ID,
  orderNumber: 'ORD-001',
  storeId: 'store-1',
  storeName: '픽마 베이커리',
  totalAmount: 7200,
  discountAmount: 0,
  paymentAmount: 7200,
  status: 'reserved' as const,
  pickupAt: '2026-05-19T10:00:00.000Z',
  pickupServiceDate: '2026-05-19',
  createdAt: '2026-05-19T09:00:00.000Z',
  updatedAt: '2026-05-19T09:00:00.000Z',
};

const mockListResponse: OrderListResponse = {
  items: [mockListItemResponse],
  page: 1,
  pageSize: 20,
  totalCount: 1,
  totalPages: 1,
};

const mockDetailResponse: OrderDetailResponse = {
  ...mockListItemResponse,
  items: [],
};

const mockOrder = { id: ORDER_ID } as Order;
const mockOrderListItem = { id: ORDER_ID } as Omit<Order, 'items' | 'payment'>;
const mockSummaryResponse: SellerOrderSummaryResponse = {
  totalCount: 3,
  statusCounts: {
    reserved: 1,
    accepted: 0,
    ready: 0,
    completed: 1,
    cancelling: 0,
    cancelled: 0,
    noShow: 1,
    expired: 0,
  },
};

describe('sellerOrderApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mapSellerOrder).mockReturnValue(mockOrder);
    vi.mocked(mapSellerOrderListItem).mockReturnValue(mockOrderListItem);
  });

  describe('getOrders', () => {
    it('params 없이 목록 endpoint를 호출하고 items를 mapper로 변환한다', async () => {
      vi.mocked(apiClient.get).mockResolvedValue(mockListResponse);

      const result = await sellerOrderApi.getOrders();

      expect(apiClient.get).toHaveBeenCalledWith(
        '/api/seller/orders',
        undefined
      );
      expect(vi.mocked(mapSellerOrderListItem).mock.calls[0][0]).toBe(
        mockListItemResponse
      );
      expect(result.items).toEqual([mockOrderListItem]);
      expect(result.totalCount).toBe(1);
      expect(result.page).toBe(1);
    });

    it('params를 endpoint에 전달한다', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        ...mockListResponse,
        items: [],
      });

      await sellerOrderApi.getOrders({ status: 'reserved', page: 2 });

      expect(apiClient.get).toHaveBeenCalledWith('/api/seller/orders', {
        status: 'reserved',
        page: 2,
      });
    });
  });

  describe('getOrder', () => {
    it('단건 endpoint를 호출하고 mapSellerOrder 결과를 반환한다', async () => {
      vi.mocked(apiClient.get).mockResolvedValue(mockDetailResponse);

      const result = await sellerOrderApi.getOrder(ORDER_ID);

      expect(apiClient.get).toHaveBeenCalledWith(
        `/api/seller/orders/${ORDER_ID}`
      );
      expect(mapSellerOrder).toHaveBeenCalledWith(mockDetailResponse);
      expect(result).toBe(mockOrder);
    });
  });

  describe('getOrderSummary', () => {
    it('summary endpoint를 호출하고 응답을 반환한다', async () => {
      vi.mocked(apiClient.get).mockResolvedValue(mockSummaryResponse);

      const result = await sellerOrderApi.getOrderSummary();

      expect(apiClient.get).toHaveBeenCalledWith('/api/seller/orders/summary');
      expect(result).toBe(mockSummaryResponse);
    });
  });

  describe('acceptOrder', () => {
    it('accept endpoint를 호출한다', async () => {
      vi.mocked(apiClient.patch).mockResolvedValue(undefined);

      await sellerOrderApi.acceptOrder(ORDER_ID);

      expect(apiClient.patch).toHaveBeenCalledWith(
        `/api/seller/orders/${ORDER_ID}/accept`
      );
    });
  });

  describe('markOrderReady', () => {
    it('ready endpoint를 호출한다', async () => {
      vi.mocked(apiClient.patch).mockResolvedValue(undefined);

      await sellerOrderApi.markOrderReady(ORDER_ID);

      expect(apiClient.patch).toHaveBeenCalledWith(
        `/api/seller/orders/${ORDER_ID}/ready`
      );
    });
  });

  describe('completeOrder', () => {
    it('complete endpoint를 호출한다', async () => {
      vi.mocked(apiClient.patch).mockResolvedValue(undefined);

      await sellerOrderApi.completeOrder(ORDER_ID);

      expect(apiClient.patch).toHaveBeenCalledWith(
        `/api/seller/orders/${ORDER_ID}/complete`
      );
    });
  });
});
