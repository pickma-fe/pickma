import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { requireActiveUser } from '@/app/api/_lib/auth';

import { PATCH } from './route';
import { cancelOrder } from '../../_lib/service';

vi.mock('@/app/api/_lib/auth', () => ({
  requireActiveUser: vi.fn(),
}));

vi.mock('../../_lib/service', () => ({
  cancelOrder: vi.fn(),
}));

const VALID_UUID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

function makeRequest(
  orderId: string,
  body?: unknown,
  options: { malformed?: boolean } = {}
) {
  const params = Promise.resolve({ orderId });
  const request = options.malformed
    ? new Request(`http://localhost/api/orders/${orderId}/cancel`, {
        method: 'PATCH',
        body: 'not-json',
        headers: { 'Content-Type': 'application/json' },
      })
    : new Request(`http://localhost/api/orders/${orderId}/cancel`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
  return { request, params };
}

describe('PATCH /api/orders/[orderId]/cancel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireActiveUser).mockResolvedValue({
      authUser: { id: 'user-1', email: 'user@test.com' } as never,
      serviceUser: { id: 'user-1', role: 'customer' } as never,
    });
    vi.mocked(cancelOrder).mockResolvedValue(undefined);
  });

  it('orderId가 uuid 형식이 아니면 400', async () => {
    const { request, params } = makeRequest('not-a-uuid', {
      reason: '단순 변심',
    });
    const res = await PATCH(request, { params });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe(ERROR_CODE.VALIDATION_ERROR);
  });

  it('인증 실패 → 401', async () => {
    vi.mocked(requireActiveUser).mockRejectedValueOnce(
      new AppError(ERROR_CODE.UNAUTHORIZED, 401)
    );
    const { request, params } = makeRequest(VALID_UUID, {
      reason: '단순 변심',
    });
    const res = await PATCH(request, { params });
    expect(res.status).toBe(401);
  });

  it('body 파싱 실패 → 400', async () => {
    const { request, params } = makeRequest(VALID_UUID, undefined, {
      malformed: true,
    });
    const res = await PATCH(request, { params });
    expect(res.status).toBe(400);
  });

  it('reason 빈 문자열 → 400', async () => {
    const { request, params } = makeRequest(VALID_UUID, { reason: '' });
    const res = await PATCH(request, { params });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe(ERROR_CODE.VALIDATION_ERROR);
  });

  it('ORDER_NOT_FOUND → 404', async () => {
    vi.mocked(cancelOrder).mockRejectedValueOnce(
      new AppError(ERROR_CODE.ORDER_NOT_FOUND, 404)
    );
    const { request, params } = makeRequest(VALID_UUID, {
      reason: '단순 변심',
    });
    const res = await PATCH(request, { params });
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error.code).toBe(ERROR_CODE.ORDER_NOT_FOUND);
  });

  it('INVALID_ORDER_STATUS → 409', async () => {
    vi.mocked(cancelOrder).mockRejectedValueOnce(
      new AppError(ERROR_CODE.INVALID_ORDER_STATUS, 409)
    );
    const { request, params } = makeRequest(VALID_UUID, {
      reason: '단순 변심',
    });
    const res = await PATCH(request, { params });
    expect(res.status).toBe(409);
  });

  it('성공 → 200, cancelOrder 올바른 인수로 호출', async () => {
    const { request, params } = makeRequest(VALID_UUID, {
      reason: '단순 변심',
    });
    const res = await PATCH(request, { params });
    expect(res.status).toBe(200);
    expect(cancelOrder).toHaveBeenCalledWith(
      'user-1',
      VALID_UUID,
      '단순 변심',
      expect.objectContaining({
        info: expect.any(Function),
        warn: expect.any(Function),
        error: expect.any(Function),
      })
    );
  });
});
