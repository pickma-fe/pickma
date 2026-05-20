import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { OrderDetailResponse } from '@/contracts/order';
import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { requireActiveUser } from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { mockOrders } from '@/mocks/orders';

import { GET } from './route';
import { expireUserOrders, getOrder } from '../_lib/service';

vi.mock('@/app/api/_lib/mock', () => ({
  isApiMockEnabled: vi.fn(),
}));

vi.mock('@/app/api/_lib/auth', () => ({
  requireActiveUser: vi.fn(),
}));

vi.mock('../_lib/service', () => ({
  expireUserOrders: vi.fn(),
  getOrder: vi.fn(),
}));

const VALID_UUID = mockOrders[0].id;
const INVALID_ID = 'not-a-uuid';

const mockServiceUser = {
  id: 'user-1',
  role: 'customer' as const,
  email: 'user@example.com',
  name: '테스트 유저',
  status: 'active' as const,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const mockOrderDetailResponse: OrderDetailResponse = {
  id: VALID_UUID,
  orderNumber: 'PM20260101A1B2C3D4E5',
  storeId: 'store-uuid-1',
  storeName: '크루아상 베이커리',
  totalAmount: 10000,
  discountAmount: 2000,
  paymentAmount: 8000,
  status: 'reserved',
  pickupAt: '2026-05-12T10:00:00.000Z',
  pickupServiceDate: '2026-05-12',
  createdAt: '2026-05-12T08:00:00.000Z',
  updatedAt: '2026-05-12T08:00:00.000Z',
  items: [],
};

function makeParams(orderId: string) {
  return { params: Promise.resolve({ orderId }) };
}

describe('GET /api/orders/:orderId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('mock 모드', () => {
    it('유효 UUID → mockOrderDetail 200 반환', async () => {
      vi.mocked(isApiMockEnabled).mockReturnValue(true);
      const res = await GET(
        new Request('http://localhost'),
        makeParams(VALID_UUID)
      );
      expect(res.status).toBe(200);
      const body = (await res.json()) as { statusCode: number; data: object };
      expect(body.statusCode).toBe(200);
      expect(body.data).toBeDefined();
    });

    it('비UUID → VALIDATION_ERROR 400, path: "orderId"', async () => {
      vi.mocked(isApiMockEnabled).mockReturnValue(true);
      const res = await GET(
        new Request('http://localhost'),
        makeParams(INVALID_ID)
      );
      expect(res.status).toBe(400);
      const body = (await res.json()) as {
        statusCode: number;
        error: { code: string; details?: { path: string }[] };
      };
      expect(body.error.code).toBe('VALIDATION_ERROR');
      expect(body.error.details).toContainEqual(
        expect.objectContaining({ path: 'orderId' })
      );
    });

    it('requireActiveUser, expireUserOrders, getOrder 미호출', async () => {
      vi.mocked(isApiMockEnabled).mockReturnValue(true);
      await GET(new Request('http://localhost'), makeParams(VALID_UUID));
      expect(requireActiveUser).not.toHaveBeenCalled();
      expect(expireUserOrders).not.toHaveBeenCalled();
      expect(getOrder).not.toHaveBeenCalled();
    });
  });

  describe('real 모드', () => {
    beforeEach(() => {
      vi.mocked(isApiMockEnabled).mockReturnValue(false);
      vi.mocked(requireActiveUser).mockResolvedValue({
        authUser: {} as Awaited<
          ReturnType<typeof requireActiveUser>
        >['authUser'],
        serviceUser: mockServiceUser,
      });
      vi.mocked(expireUserOrders).mockResolvedValue(undefined);
      vi.mocked(getOrder).mockResolvedValue(mockOrderDetailResponse);
    });

    it('성공 → 200 반환, expireUserOrders 후 getOrder(serviceUser.id, orderId) 호출', async () => {
      const res = await GET(
        new Request('http://localhost'),
        makeParams(VALID_UUID)
      );
      expect(res.status).toBe(200);
      expect(expireUserOrders).toHaveBeenCalledWith('user-1');
      expect(getOrder).toHaveBeenCalledWith('user-1', VALID_UUID);
      expect(
        vi.mocked(expireUserOrders).mock.invocationCallOrder[0]
      ).toBeLessThan(vi.mocked(getOrder).mock.invocationCallOrder[0]);
    });

    it('UNAUTHORIZED → 401', async () => {
      vi.mocked(requireActiveUser).mockRejectedValue(
        new AppError(ERROR_CODE.UNAUTHORIZED, 401)
      );
      const res = await GET(
        new Request('http://localhost'),
        makeParams(VALID_UUID)
      );
      expect(res.status).toBe(401);
      const body = (await res.json()) as { error: { code: string } };
      expect(body.error.code).toBe('UNAUTHORIZED');
    });

    it('비UUID → VALIDATION_ERROR 400 (requireActiveUser, getOrder 미호출)', async () => {
      const res = await GET(
        new Request('http://localhost'),
        makeParams(INVALID_ID)
      );
      expect(res.status).toBe(400);
      const body = (await res.json()) as { error: { code: string } };
      expect(body.error.code).toBe('VALIDATION_ERROR');
      expect(requireActiveUser).not.toHaveBeenCalled();
      expect(getOrder).not.toHaveBeenCalled();
    });

    it('ORDER_NOT_FOUND → 404', async () => {
      vi.mocked(getOrder).mockRejectedValue(
        new AppError(ERROR_CODE.ORDER_NOT_FOUND, 404)
      );
      const res = await GET(
        new Request('http://localhost'),
        makeParams(VALID_UUID)
      );
      expect(res.status).toBe(404);
      const body = (await res.json()) as { error: { code: string } };
      expect(body.error.code).toBe('ORDER_NOT_FOUND');
    });

    it('Supabase 오류 → 500', async () => {
      vi.mocked(getOrder).mockRejectedValue(
        new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500)
      );
      const res = await GET(
        new Request('http://localhost'),
        makeParams(VALID_UUID)
      );
      expect(res.status).toBe(500);
    });
  });
});
