import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { OrderDetailResponse } from '@/contracts/order';
import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { requireSellerStore } from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { mockSellerOrderDetail } from '@/mocks/seller';

import { GET } from './route';
import { getSellerOrder } from '../_lib/service';

vi.mock('@/app/api/_lib/auth', () => ({
  requireSellerStore: vi.fn(),
}));

vi.mock('@/app/api/_lib/mock', () => ({
  isApiMockEnabled: vi.fn(),
}));

vi.mock('../_lib/service', () => ({
  getSellerOrder: vi.fn(),
}));

const STORE_ID = mockSellerOrderDetail.storeId;
const ORDER_ID = mockSellerOrderDetail.id;

const sellerResult = {
  authUser: {},
  serviceUser: {},
  store: { id: STORE_ID },
} as Awaited<ReturnType<typeof requireSellerStore>>;

function makeParams(orderId: string) {
  return { params: Promise.resolve({ orderId }) };
}

describe('GET /api/seller/orders/[orderId]', () => {
  beforeEach(() => vi.clearAllMocks());

  it('mock 모드에서 mockSellerOrderDetail을 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(true);

    const res = await GET(
      new Request('http://localhost'),
      makeParams(ORDER_ID)
    );
    const body = (await res.json()) as { data: OrderDetailResponse };

    expect(res.status).toBe(200);
    expect(body.data.id).toBe(mockSellerOrderDetail.id);
    expect(requireSellerStore).not.toHaveBeenCalled();
  });

  it('UUID 형식이 아닌 orderId는 400을 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(true);

    const res = await GET(
      new Request('http://localhost'),
      makeParams('not-uuid')
    );
    const body = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('real 모드에서 requireSellerStore store id + orderId로 service를 호출한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireSellerStore).mockResolvedValue(sellerResult);
    vi.mocked(getSellerOrder).mockResolvedValue(mockSellerOrderDetail);

    const res = await GET(
      new Request('http://localhost'),
      makeParams(ORDER_ID)
    );

    expect(res.status).toBe(200);
    expect(getSellerOrder).toHaveBeenCalledWith(STORE_ID, ORDER_ID);
  });

  it('ORDER_NOT_FOUND이면 404를 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireSellerStore).mockResolvedValue(sellerResult);
    vi.mocked(getSellerOrder).mockRejectedValue(
      new AppError(ERROR_CODE.ORDER_NOT_FOUND, 404)
    );

    const res = await GET(
      new Request('http://localhost'),
      makeParams(ORDER_ID)
    );
    const body = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(404);
    expect(body.error.code).toBe('ORDER_NOT_FOUND');
  });
});
