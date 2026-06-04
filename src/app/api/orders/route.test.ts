import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { CreateOrderResponse, OrderListResponse } from '@/contracts/order';
import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { requireActiveUser } from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { expireUserOrders } from '@/app/api/_lib/order-expiration';

import { createOrder, getOrders } from './_lib/service';
import { GET, POST } from './route';

vi.mock('@/app/api/_lib/mock', () => ({
  isApiMockEnabled: vi.fn(),
}));

vi.mock('@/app/api/_lib/auth', () => ({
  requireActiveUser: vi.fn(),
}));

vi.mock('@/app/api/_lib/order-expiration', () => ({
  expireUserOrders: vi.fn(),
}));

vi.mock('./_lib/service', () => ({
  createOrder: vi.fn(),
  getOrders: vi.fn(),
}));

const mockServiceUser = {
  id: 'user-1',
  role: 'customer' as const,
  email: 'user@example.com',
  name: '테스트 유저',
  status: 'active' as const,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const mockOrderResponse: CreateOrderResponse = {
  id: 'order-1',
  orderNumber: 'PM20260511A1B2C3D4E5',
  orderName: '크루아상 2개',
  paymentAmount: 7200,
  expiresAt: '2026-05-11T10:10:00.000Z',
};

const mockOrderListResponse: OrderListResponse = {
  items: [],
  page: 1,
  pageSize: 20,
  totalCount: 0,
  totalPages: 0,
};

function makeGetRequest(search = '') {
  return new NextRequest(
    `http://localhost/api/orders${search ? `?${search}` : ''}`
  );
}

function makePostRequest(body: object) {
  return new Request('http://localhost/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
}

const validBody = {
  productId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  quantity: 2,
  pickupAt: '2026-05-11T11:00:00.000Z',
};

describe('GET /api/orders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('mock 모드', () => {
    it('mockOrderList 200 반환', async () => {
      vi.mocked(isApiMockEnabled).mockReturnValue(true);
      const res = await GET(makeGetRequest());
      expect(res.status).toBe(200);
      const body = (await res.json()) as { statusCode: number; data: object };
      expect(body.statusCode).toBe(200);
      expect(body.data).toBeDefined();
    });

    it('requireActiveUser, expireUserOrders, getOrders 미호출', async () => {
      vi.mocked(isApiMockEnabled).mockReturnValue(true);
      await GET(makeGetRequest());
      expect(requireActiveUser).not.toHaveBeenCalled();
      expect(expireUserOrders).not.toHaveBeenCalled();
      expect(getOrders).not.toHaveBeenCalled();
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
      vi.mocked(getOrders).mockResolvedValue(mockOrderListResponse);
    });

    it('성공 → 200 반환, expireUserOrders 후 getOrders 호출', async () => {
      const res = await GET(makeGetRequest());
      expect(res.status).toBe(200);
      const body = (await res.json()) as { statusCode: number; data: object };
      expect(body.statusCode).toBe(200);
      expect(expireUserOrders).toHaveBeenCalledWith('user-1');
      expect(getOrders).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({ page: 1, pageSize: 20 })
      );
      expect(
        vi.mocked(expireUserOrders).mock.invocationCallOrder[0]
      ).toBeLessThan(vi.mocked(getOrders).mock.invocationCallOrder[0]);
    });

    it('query 기본값 적용 (page=1, pageSize=20, sort=createdAt, order=desc)', async () => {
      await GET(makeGetRequest());
      expect(getOrders).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({
          page: 1,
          pageSize: 20,
          sort: 'createdAt',
          order: 'desc',
        })
      );
    });

    it('status 파라미터 전달 → getOrders에 그대로 전달', async () => {
      await GET(makeGetRequest('status=reserved'));
      expect(getOrders).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({ status: 'reserved' })
      );
    });

    it('UNAUTHORIZED → 401', async () => {
      vi.mocked(requireActiveUser).mockRejectedValue(
        new AppError(ERROR_CODE.UNAUTHORIZED, 401)
      );
      const res = await GET(makeGetRequest());
      expect(res.status).toBe(401);
      const body = (await res.json()) as {
        statusCode: number;
        error: { code: string };
      };
      expect(body.error.code).toBe('UNAUTHORIZED');
    });

    it('getOrders Supabase 오류 → 500', async () => {
      vi.mocked(getOrders).mockRejectedValue(
        new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500)
      );
      const res = await GET(makeGetRequest());
      expect(res.status).toBe(500);
    });

    it('유효하지 않은 sort 값 → VALIDATION_ERROR 400', async () => {
      const res = await GET(makeGetRequest('sort=invalid'));
      expect(res.status).toBe(400);
      const body = (await res.json()) as {
        statusCode: number;
        error: { code: string };
      };
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});

describe('POST /api/orders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('mock 모드', () => {
    it('유효 body → mockCreatedOrder 201 반환', async () => {
      vi.mocked(isApiMockEnabled).mockReturnValue(true);
      const res = await POST(makePostRequest(validBody));
      expect(res.status).toBe(201);
      const body = (await res.json()) as {
        statusCode: number;
        data: CreateOrderResponse;
      };
      expect(body.statusCode).toBe(201);
      expect(body.data.orderNumber).toBeDefined();
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
      vi.mocked(createOrder).mockResolvedValue(mockOrderResponse);
    });

    it('성공 → 201 반환', async () => {
      const res = await POST(makePostRequest(validBody));
      expect(res.status).toBe(201);
      const body = (await res.json()) as {
        statusCode: number;
        data: CreateOrderResponse;
      };
      expect(body.statusCode).toBe(201);
      expect(body.data.orderNumber).toBeDefined();
      expect(body.data.paymentAmount).toBeGreaterThan(0);
    });

    it('성공 시 expireUserOrders(serviceUser.id) 후 createOrder(serviceUser.id, body) 호출', async () => {
      await POST(makePostRequest(validBody));
      expect(expireUserOrders).toHaveBeenCalledWith('user-1');
      expect(createOrder).toHaveBeenCalledWith('user-1', validBody);

      const expireCallOrder =
        vi.mocked(expireUserOrders).mock.invocationCallOrder[0];
      const createCallOrder =
        vi.mocked(createOrder).mock.invocationCallOrder[0];
      expect(expireCallOrder).toBeLessThan(createCallOrder);
    });

    it('UNAUTHORIZED throw → 401', async () => {
      vi.mocked(requireActiveUser).mockRejectedValue(
        new AppError(ERROR_CODE.UNAUTHORIZED, 401)
      );
      const res = await POST(makePostRequest(validBody));
      expect(res.status).toBe(401);
      const body = (await res.json()) as {
        statusCode: number;
        error: { code: string };
      };
      expect(body.statusCode).toBe(res.status);
      expect(body.error.code).toBe('UNAUTHORIZED');
      expect(expireUserOrders).not.toHaveBeenCalled();
      expect(createOrder).not.toHaveBeenCalled();
    });

    it('PRODUCT_NOT_FOUND throw → 404', async () => {
      vi.mocked(createOrder).mockRejectedValue(
        new AppError(ERROR_CODE.PRODUCT_NOT_FOUND, 404)
      );
      const res = await POST(makePostRequest(validBody));
      expect(res.status).toBe(404);
      const body = (await res.json()) as {
        statusCode: number;
        error: { code: string };
      };
      expect(body.statusCode).toBe(res.status);
      expect(body.error.code).toBe('PRODUCT_NOT_FOUND');
    });

    it('OUT_OF_STOCK throw → 409', async () => {
      vi.mocked(createOrder).mockRejectedValue(
        new AppError(ERROR_CODE.OUT_OF_STOCK, 409)
      );
      const res = await POST(makePostRequest(validBody));
      expect(res.status).toBe(409);
      const body = (await res.json()) as {
        statusCode: number;
        error: { code: string };
      };
      expect(body.statusCode).toBe(res.status);
      expect(body.error.code).toBe('OUT_OF_STOCK');
    });

    it('PRODUCT_EXPIRED throw → 409', async () => {
      vi.mocked(createOrder).mockRejectedValue(
        new AppError(ERROR_CODE.PRODUCT_EXPIRED, 409)
      );
      const res = await POST(makePostRequest(validBody));
      expect(res.status).toBe(409);
      const body = (await res.json()) as {
        statusCode: number;
        error: { code: string };
      };
      expect(body.statusCode).toBe(res.status);
      expect(body.error.code).toBe('PRODUCT_EXPIRED');
    });

    it('PRODUCT_NOT_AVAILABLE throw → 409', async () => {
      vi.mocked(createOrder).mockRejectedValue(
        new AppError(ERROR_CODE.PRODUCT_NOT_AVAILABLE, 409)
      );
      const res = await POST(makePostRequest(validBody));
      expect(res.status).toBe(409);
      const body = (await res.json()) as {
        statusCode: number;
        error: { code: string };
      };
      expect(body.statusCode).toBe(res.status);
      expect(body.error.code).toBe('PRODUCT_NOT_AVAILABLE');
    });

    it('DUPLICATE_PRODUCT_IN_ORDER throw → 400', async () => {
      vi.mocked(createOrder).mockRejectedValue(
        new AppError(ERROR_CODE.DUPLICATE_PRODUCT_IN_ORDER, 400)
      );
      const res = await POST(makePostRequest(validBody));
      expect(res.status).toBe(400);
      const body = (await res.json()) as {
        statusCode: number;
        error: { code: string };
      };
      expect(body.statusCode).toBe(res.status);
      expect(body.error.code).toBe('DUPLICATE_PRODUCT_IN_ORDER');
    });

    it('ORDER_NUMBER_EXHAUSTED throw → 503', async () => {
      vi.mocked(createOrder).mockRejectedValue(
        new AppError(ERROR_CODE.ORDER_NUMBER_EXHAUSTED, 503)
      );
      const res = await POST(makePostRequest(validBody));
      expect(res.status).toBe(503);
      const body = (await res.json()) as {
        statusCode: number;
        error: { code: string };
      };
      expect(body.statusCode).toBe(res.status);
      expect(body.error.code).toBe('ORDER_NUMBER_EXHAUSTED');
    });

    it('INVALID_PICKUP_TIME → VALIDATION_ERROR 400 (details.path=pickupAt)', async () => {
      vi.mocked(createOrder).mockRejectedValue(
        new AppError(ERROR_CODE.VALIDATION_ERROR, 400, undefined, [
          { path: 'pickupAt', message: 'INVALID_PICKUP_TIME' },
        ])
      );
      const res = await POST(makePostRequest(validBody));
      expect(res.status).toBe(400);
      const body = (await res.json()) as {
        statusCode: number;
        error: { code: string; details?: { path: string }[] };
      };
      expect(body.statusCode).toBe(res.status);
      expect(body.error.code).toBe('VALIDATION_ERROR');
      expect(body.error.details).toContainEqual(
        expect.objectContaining({ path: 'pickupAt' })
      );
    });

    it('productId가 UUID 아님 → VALIDATION_ERROR 400 (requireActiveUser 미호출)', async () => {
      const res = await POST(
        makePostRequest({ ...validBody, productId: 'not-a-uuid' })
      );
      expect(res.status).toBe(400);
      const body = (await res.json()) as {
        statusCode: number;
        error: { code: string; details?: { path: string }[] };
      };
      expect(body.statusCode).toBe(res.status);
      expect(body.error.code).toBe('VALIDATION_ERROR');
      expect(body.error.details).toContainEqual(
        expect.objectContaining({ path: 'productId' })
      );
      expect(requireActiveUser).not.toHaveBeenCalled();
      expect(expireUserOrders).not.toHaveBeenCalled();
      expect(createOrder).not.toHaveBeenCalled();
    });

    it('quantity가 음수 → VALIDATION_ERROR 400 (requireActiveUser 미호출)', async () => {
      const res = await POST(makePostRequest({ ...validBody, quantity: -1 }));
      expect(res.status).toBe(400);
      const body = (await res.json()) as {
        statusCode: number;
        error: { code: string; details?: { path: string }[] };
      };
      expect(body.statusCode).toBe(res.status);
      expect(body.error.code).toBe('VALIDATION_ERROR');
      expect(body.error.details).toContainEqual(
        expect.objectContaining({ path: 'quantity' })
      );
      expect(requireActiveUser).not.toHaveBeenCalled();
      expect(expireUserOrders).not.toHaveBeenCalled();
      expect(createOrder).not.toHaveBeenCalled();
    });

    it('pickupAt이 빈 문자열 → VALIDATION_ERROR 400 (requireActiveUser 미호출)', async () => {
      const res = await POST(makePostRequest({ ...validBody, pickupAt: '' }));
      expect(res.status).toBe(400);
      const body = (await res.json()) as {
        statusCode: number;
        error: { code: string; details?: { path: string }[] };
      };
      expect(body.statusCode).toBe(res.status);
      expect(body.error.code).toBe('VALIDATION_ERROR');
      expect(body.error.details).toContainEqual(
        expect.objectContaining({ path: 'pickupAt' })
      );
      expect(requireActiveUser).not.toHaveBeenCalled();
      expect(expireUserOrders).not.toHaveBeenCalled();
      expect(createOrder).not.toHaveBeenCalled();
    });
  });
});
