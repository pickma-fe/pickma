import type { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { CreateOrderResponse } from '@/contracts/order';
import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { requireActiveUser } from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';

import { createOrder, expireUserOrders } from './_lib/service';
import { GET, POST } from './route';

vi.mock('@/app/api/_lib/mock', () => ({
  isApiMockEnabled: vi.fn(),
}));

vi.mock('@/app/api/_lib/auth', () => ({
  requireActiveUser: vi.fn(),
}));

vi.mock('./_lib/service', () => ({
  createOrder: vi.fn(),
  expireUserOrders: vi.fn(),
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
  it('mock 모드 → mockOrderList 200 반환', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(true);
    const res = await GET();
    expect(res.status).toBe(200);
    const body = (await res.json()) as { statusCode: number; data: object };
    expect(body.statusCode).toBe(200);
    expect(body.data).toBeDefined();
  });

  it('real 모드 → NOT_IMPLEMENTED 501', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    const res = await GET();
    expect(res.status).toBe(501);
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe('NOT_IMPLEMENTED');
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
      const body = (await res.json()) as { error: { code: string } };
      expect(body.error.code).toBe('UNAUTHORIZED');
    });

    it('PRODUCT_NOT_FOUND throw → 404', async () => {
      vi.mocked(createOrder).mockRejectedValue(
        new AppError(ERROR_CODE.PRODUCT_NOT_FOUND, 404)
      );
      const res = await POST(makePostRequest(validBody));
      expect(res.status).toBe(404);
      const body = (await res.json()) as { error: { code: string } };
      expect(body.error.code).toBe('PRODUCT_NOT_FOUND');
    });

    it('OUT_OF_STOCK throw → 409', async () => {
      vi.mocked(createOrder).mockRejectedValue(
        new AppError(ERROR_CODE.OUT_OF_STOCK, 409)
      );
      const res = await POST(makePostRequest(validBody));
      expect(res.status).toBe(409);
      const body = (await res.json()) as { error: { code: string } };
      expect(body.error.code).toBe('OUT_OF_STOCK');
    });

    it('productId가 UUID 아님 → VALIDATION_ERROR 400 (requireActiveUser 미호출)', async () => {
      const res = await POST(
        makePostRequest({ ...validBody, productId: 'not-a-uuid' })
      );
      expect(res.status).toBe(400);
      const body = (await res.json()) as { error: { code: string } };
      expect(body.error.code).toBe('VALIDATION_ERROR');
      expect(requireActiveUser).not.toHaveBeenCalled();
      expect(expireUserOrders).not.toHaveBeenCalled();
      expect(createOrder).not.toHaveBeenCalled();
    });

    it('quantity가 음수 → VALIDATION_ERROR 400 (requireActiveUser 미호출)', async () => {
      const res = await POST(makePostRequest({ ...validBody, quantity: -1 }));
      expect(res.status).toBe(400);
      const body = (await res.json()) as { error: { code: string } };
      expect(body.error.code).toBe('VALIDATION_ERROR');
      expect(requireActiveUser).not.toHaveBeenCalled();
    });
  });
});
