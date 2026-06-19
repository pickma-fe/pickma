import type { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { requireActiveUser } from '@/app/api/_lib/auth';
import { expireUserOrders } from '@/app/api/_lib/order-expiration';

import { POST } from './route';
import { confirmPayment } from '../_lib/service';

vi.mock('@/app/api/_lib/auth', () => ({
  requireActiveUser: vi.fn(),
}));

vi.mock('@/app/api/_lib/order-expiration', () => ({
  expireUserOrders: vi.fn(),
}));

vi.mock('../_lib/service', () => ({
  confirmPayment: vi.fn(),
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

const validBody = {
  paymentKey: 'mock_pk_test',
  orderNumber: 'PM2026TEST',
  amount: 5000,
};

function makeRequest(body: object) {
  return new Request('http://localhost/api/payments/confirm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
}

describe('POST /api/payments/confirm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireActiveUser).mockResolvedValue({
      authUser: {} as Awaited<ReturnType<typeof requireActiveUser>>['authUser'],
      serviceUser: mockServiceUser,
    });
    vi.mocked(expireUserOrders).mockResolvedValue(undefined);
    vi.mocked(confirmPayment).mockResolvedValue(undefined);
  });

  it('성공 → 200 + data null', async () => {
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { statusCode: number; data: unknown };
    expect(body.statusCode).toBe(200);
    expect(body.data).toBeNull();
  });

  it('expireUserOrders 후 confirmPayment 호출', async () => {
    await POST(makeRequest(validBody));
    expect(expireUserOrders).toHaveBeenCalledWith();
    expect(confirmPayment).toHaveBeenCalledWith(
      'user-1',
      validBody,
      expect.objectContaining({
        info: expect.any(Function),
        warn: expect.any(Function),
        error: expect.any(Function),
      })
    );
    expect(
      vi.mocked(expireUserOrders).mock.invocationCallOrder[0]
    ).toBeLessThan(vi.mocked(confirmPayment).mock.invocationCallOrder[0]);
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

  it('PAYMENT_AMOUNT_MISMATCH → 400', async () => {
    vi.mocked(confirmPayment).mockRejectedValue(
      new AppError(ERROR_CODE.PAYMENT_AMOUNT_MISMATCH, 400)
    );
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe('PAYMENT_AMOUNT_MISMATCH');
  });

  it('PAYMENT_CONFIRM_FAILED → 500', async () => {
    vi.mocked(confirmPayment).mockRejectedValue(
      new AppError(ERROR_CODE.PAYMENT_CONFIRM_FAILED, 500)
    );
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(500);
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe('PAYMENT_CONFIRM_FAILED');
  });

  it('PAYMENT_ALREADY_CONFIRMED → 409', async () => {
    vi.mocked(confirmPayment).mockRejectedValue(
      new AppError(ERROR_CODE.PAYMENT_ALREADY_CONFIRMED, 409)
    );
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(409);
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe('PAYMENT_ALREADY_CONFIRMED');
  });

  it('paymentKey 누락 → VALIDATION_ERROR 400', async () => {
    const res = await POST(
      makeRequest({ orderNumber: 'PM2026TEST', amount: 5000 })
    );
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(requireActiveUser).not.toHaveBeenCalled();
  });

  it('amount가 음수 → VALIDATION_ERROR 400', async () => {
    const res = await POST(makeRequest({ ...validBody, amount: -1 }));
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(requireActiveUser).not.toHaveBeenCalled();
  });
});
