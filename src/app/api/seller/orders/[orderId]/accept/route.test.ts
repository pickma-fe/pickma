import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { requireSellerStore } from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';

import { PATCH } from './route';
import { acceptSellerOrder } from '../../_lib/service';

vi.mock('@/app/api/_lib/auth', () => ({
  requireSellerStore: vi.fn(),
}));

vi.mock('@/app/api/_lib/mock', () => ({
  isApiMockEnabled: vi.fn(),
}));

vi.mock('../../_lib/service', () => ({
  acceptSellerOrder: vi.fn(),
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

describe('PATCH /api/seller/orders/[orderId]/accept', () => {
  beforeEach(() => vi.clearAllMocks());

  it('mock 모드에서 200을 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(true);

    const res = await PATCH(
      new Request('http://localhost'),
      makeParams(ORDER_ID)
    );

    expect(res.status).toBe(200);
    expect(requireSellerStore).not.toHaveBeenCalled();
  });

  it('UUID 형식이 아닌 orderId는 400을 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(true);

    const res = await PATCH(
      new Request('http://localhost'),
      makeParams('invalid')
    );
    const body = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('real 모드에서 acceptSellerOrder를 호출한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireSellerStore).mockResolvedValue(sellerResult);
    vi.mocked(acceptSellerOrder).mockResolvedValue(undefined);

    const res = await PATCH(
      new Request('http://localhost'),
      makeParams(ORDER_ID)
    );

    expect(res.status).toBe(200);
    expect(acceptSellerOrder).toHaveBeenCalledWith(STORE_ID, ORDER_ID);
  });

  it('INVALID_ORDER_STATUS이면 409를 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireSellerStore).mockResolvedValue(sellerResult);
    vi.mocked(acceptSellerOrder).mockRejectedValue(
      new AppError(ERROR_CODE.INVALID_ORDER_STATUS, 409)
    );

    const res = await PATCH(
      new Request('http://localhost'),
      makeParams(ORDER_ID)
    );
    const body = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(409);
    expect(body.error.code).toBe('INVALID_ORDER_STATUS');
  });
});
