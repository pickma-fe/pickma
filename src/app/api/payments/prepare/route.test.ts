import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { PreparePaymentResponse } from '@/contracts/payment';
import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { requireActiveUser } from '@/app/api/_lib/auth';
import { expireUserOrders } from '@/app/api/orders/_lib/service';

import { POST } from './route';
import { preparePayment } from '../_lib/service';

vi.mock('@/app/api/_lib/auth', () => ({
  requireActiveUser: vi.fn(),
}));

vi.mock('@/app/api/orders/_lib/service', () => ({
  expireUserOrders: vi.fn(),
}));

vi.mock('../_lib/service', () => ({
  preparePayment: vi.fn(),
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

const mockPrepareResult: PreparePaymentResponse = {
  provider: 'toss',
  flow: 'redirect',
  redirectUrl:
    '/payment/success?orderNumber=PM2026TEST&provider=toss&amount=5000',
  orderNumber: 'PM2026TEST',
  amount: 5000,
};

const validBody = { provider: 'toss', orderNumber: 'PM2026TEST' };

function makeRequest(body: object) {
  return new NextRequest('http://localhost/api/payments/prepare', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/payments/prepare', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireActiveUser).mockResolvedValue({
      authUser: {} as Awaited<ReturnType<typeof requireActiveUser>>['authUser'],
      serviceUser: mockServiceUser,
    });
    vi.mocked(expireUserOrders).mockResolvedValue(undefined);
    vi.mocked(preparePayment).mockResolvedValue(mockPrepareResult);
  });

  it('성공 → 200 + PreparePaymentResponse', async () => {
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      statusCode: number;
      data: PreparePaymentResponse;
    };
    expect(body.statusCode).toBe(200);
    expect(body.data.redirectUrl).toContain('/payment/success');
    expect(body.data.amount).toBe(5000);
  });

  it('expireUserOrders 후 preparePayment 호출', async () => {
    await POST(makeRequest(validBody));
    expect(expireUserOrders).toHaveBeenCalledWith('user-1');
    expect(preparePayment).toHaveBeenCalledWith(
      'user-1',
      validBody,
      'http://localhost/payment/success'
    );
    expect(
      vi.mocked(expireUserOrders).mock.invocationCallOrder[0]
    ).toBeLessThan(vi.mocked(preparePayment).mock.invocationCallOrder[0]);
  });

  it('UNAUTHORIZED → 401', async () => {
    vi.mocked(requireActiveUser).mockRejectedValue(
      new AppError(ERROR_CODE.UNAUTHORIZED, 401)
    );
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(401);
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  it('ORDER_NOT_FOUND → 404', async () => {
    vi.mocked(preparePayment).mockRejectedValue(
      new AppError(ERROR_CODE.ORDER_NOT_FOUND, 404)
    );
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(404);
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe('ORDER_NOT_FOUND');
  });

  it('유효하지 않은 provider → VALIDATION_ERROR 400', async () => {
    const res = await POST(
      makeRequest({ ...validBody, provider: 'invalid_provider' })
    );
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(requireActiveUser).not.toHaveBeenCalled();
  });

  it('orderNumber 누락 → VALIDATION_ERROR 400', async () => {
    const res = await POST(makeRequest({ provider: 'toss' }));
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(requireActiveUser).not.toHaveBeenCalled();
  });
});
