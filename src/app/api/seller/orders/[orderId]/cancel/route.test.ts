import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { requireSellerStore } from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';

import { PATCH } from './route';
import { cancelSellerOrder } from '../../_lib/service';

vi.mock('@/app/api/_lib/auth', () => ({
  requireSellerStore: vi.fn(),
}));

vi.mock('@/app/api/_lib/mock', () => ({
  isApiMockEnabled: vi.fn(),
}));

vi.mock('../../_lib/service', () => ({
  cancelSellerOrder: vi.fn(),
}));

const STORE_ID = '00000000-0000-4000-8000-000000000031';
const ORDER_ID = '00000000-0000-4000-8000-000000000051';

const sellerResult = {
  authUser: {},
  serviceUser: {},
  store: { id: STORE_ID },
} as Awaited<ReturnType<typeof requireSellerStore>>;

function makeParams(orderId: string) {
  return { params: Promise.resolve({ orderId }) };
}

function makeRequest(body: unknown) {
  return new Request('http://localhost', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('PATCH /api/seller/orders/[orderId]/cancel', () => {
  beforeEach(() => vi.clearAllMocks());

  it('mock 모드에서 200을 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(true);

    const res = await PATCH(
      makeRequest({ reason: '판매자 사정으로 취소합니다' }) as never,
      makeParams(ORDER_ID)
    );

    expect(res.status).toBe(200);
    expect(requireSellerStore).not.toHaveBeenCalled();
  });

  it('UUID 형식이 아닌 orderId는 400을 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(true);

    const res = await PATCH(
      makeRequest({ reason: '취소' }) as never,
      makeParams('invalid')
    );
    const body = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('body가 없으면 400을 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireSellerStore).mockResolvedValue(sellerResult);

    const res = await PATCH(
      new Request('http://localhost', { method: 'PATCH' }) as never,
      makeParams(ORDER_ID)
    );
    const body = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('reason이 빈 문자열이면 400을 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireSellerStore).mockResolvedValue(sellerResult);

    const res = await PATCH(
      makeRequest({ reason: '' }) as never,
      makeParams(ORDER_ID)
    );
    const body = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('reason이 공백만 있으면 400을 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireSellerStore).mockResolvedValue(sellerResult);

    const res = await PATCH(
      makeRequest({ reason: '   ' }) as never,
      makeParams(ORDER_ID)
    );
    const body = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('reason이 500자를 초과하면 400을 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireSellerStore).mockResolvedValue(sellerResult);

    const res = await PATCH(
      makeRequest({ reason: 'a'.repeat(501) }) as never,
      makeParams(ORDER_ID)
    );
    const body = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('real 모드에서 cancelSellerOrder를 호출한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireSellerStore).mockResolvedValue(sellerResult);
    vi.mocked(cancelSellerOrder).mockResolvedValue(undefined);

    const res = await PATCH(
      makeRequest({ reason: '재고 부족으로 취소합니다' }) as never,
      makeParams(ORDER_ID)
    );

    expect(res.status).toBe(200);
    expect(cancelSellerOrder).toHaveBeenCalledWith(
      STORE_ID,
      ORDER_ID,
      '재고 부족으로 취소합니다'
    );
  });

  it('INVALID_ORDER_STATUS이면 409를 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireSellerStore).mockResolvedValue(sellerResult);
    vi.mocked(cancelSellerOrder).mockRejectedValue(
      new AppError(ERROR_CODE.INVALID_ORDER_STATUS, 409)
    );

    const res = await PATCH(
      makeRequest({ reason: '취소 사유' }) as never,
      makeParams(ORDER_ID)
    );
    const body = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(409);
    expect(body.error.code).toBe('INVALID_ORDER_STATUS');
  });

  it('PAYMENT_CANCEL_FAILED이면 502를 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireSellerStore).mockResolvedValue(sellerResult);
    vi.mocked(cancelSellerOrder).mockRejectedValue(
      new AppError(ERROR_CODE.PAYMENT_CANCEL_FAILED, 502)
    );

    const res = await PATCH(
      makeRequest({ reason: '취소 사유' }) as never,
      makeParams(ORDER_ID)
    );
    const body = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(502);
    expect(body.error.code).toBe('PAYMENT_CANCEL_FAILED');
  });
});
