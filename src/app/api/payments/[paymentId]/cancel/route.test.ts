import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { requireAdmin } from '@/app/api/_lib/auth';

import { POST } from './route';
import { cancelPaymentById } from '../../_lib/service';

vi.mock('@/app/api/_lib/auth', () => ({
  requireAdmin: vi.fn(),
}));

vi.mock('../../_lib/service', () => ({
  cancelPaymentById: vi.fn(),
}));

const VALID_UUID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

function makeRequest(
  paymentId: string,
  body?: unknown,
  options: { malformed?: boolean } = {}
) {
  const params = Promise.resolve({ paymentId });
  const request = options.malformed
    ? new Request(`http://localhost/api/payments/${paymentId}/cancel`, {
        method: 'POST',
        body: 'not-json',
        headers: { 'Content-Type': 'application/json' },
      })
    : new Request(`http://localhost/api/payments/${paymentId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
  return { request, params };
}

describe('POST /api/payments/[paymentId]/cancel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireAdmin).mockResolvedValue(undefined as never);
    vi.mocked(cancelPaymentById).mockResolvedValue(undefined);
  });

  it('paymentId가 uuid 형식이 아니면 400', async () => {
    const { request, params } = makeRequest('not-a-uuid', {
      reason: '관리자 취소',
    });
    const res = await POST(request, { params });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe(ERROR_CODE.VALIDATION_ERROR);
  });

  it('관리자 인증 실패 → 403', async () => {
    vi.mocked(requireAdmin).mockRejectedValueOnce(
      new AppError(ERROR_CODE.FORBIDDEN, 403)
    );
    const { request, params } = makeRequest(VALID_UUID, {
      reason: '관리자 취소',
    });
    const res = await POST(request, { params });
    expect(res.status).toBe(403);
  });

  it('body 파싱 실패 → 400', async () => {
    const { request, params } = makeRequest(VALID_UUID, undefined, {
      malformed: true,
    });
    const res = await POST(request, { params });
    expect(res.status).toBe(400);
  });

  it('reason 빈 문자열 → 400', async () => {
    const { request, params } = makeRequest(VALID_UUID, { reason: '' });
    const res = await POST(request, { params });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe(ERROR_CODE.VALIDATION_ERROR);
  });

  it('NOT_FOUND → 404', async () => {
    vi.mocked(cancelPaymentById).mockRejectedValueOnce(
      new AppError(ERROR_CODE.NOT_FOUND, 404)
    );
    const { request, params } = makeRequest(VALID_UUID, {
      reason: '관리자 취소',
    });
    const res = await POST(request, { params });
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error.code).toBe(ERROR_CODE.NOT_FOUND);
  });

  it('PAYMENT_CANCEL_FAILED → 502', async () => {
    vi.mocked(cancelPaymentById).mockRejectedValueOnce(
      new AppError(ERROR_CODE.PAYMENT_CANCEL_FAILED, 502)
    );
    const { request, params } = makeRequest(VALID_UUID, {
      reason: '관리자 취소',
    });
    const res = await POST(request, { params });
    expect(res.status).toBe(502);
  });

  it('성공 → 200, cancelPaymentById 올바른 인수로 호출', async () => {
    const { request, params } = makeRequest(VALID_UUID, {
      reason: '관리자 취소',
    });
    const res = await POST(request, { params });
    expect(res.status).toBe(200);
    expect(cancelPaymentById).toHaveBeenCalledWith(VALID_UUID, '관리자 취소');
  });
});
