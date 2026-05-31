import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { OrderListResponse } from '@/contracts/order';
import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { requireSellerStore } from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { mockSellerOrderList } from '@/mocks/seller';
import { mockMyStore } from '@/mocks/stores';

import { getSellerOrders } from './_lib/service';
import { GET } from './route';

vi.mock('@/app/api/_lib/auth', () => ({
  requireSellerStore: vi.fn(),
}));

vi.mock('@/app/api/_lib/mock', () => ({
  isApiMockEnabled: vi.fn(),
}));

vi.mock('./_lib/service', () => ({
  getSellerOrders: vi.fn(),
}));

const STORE_ID = mockMyStore.id;

const sellerResult = {
  authUser: {},
  serviceUser: {},
  store: { id: STORE_ID },
} as Awaited<ReturnType<typeof requireSellerStore>>;

function makeGetRequest(search = ''): NextRequest {
  return new NextRequest(
    `http://localhost/api/seller/orders${search ? `?${search}` : ''}`
  );
}

describe('GET /api/seller/orders', () => {
  beforeEach(() => vi.clearAllMocks());

  it('mock 모드에서 mockSellerOrderList를 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(true);

    const res = await GET(makeGetRequest());
    const body = (await res.json()) as { data: OrderListResponse };

    expect(res.status).toBe(200);
    expect(body.data.items).toHaveLength(mockSellerOrderList.items.length);
    expect(requireSellerStore).not.toHaveBeenCalled();
  });

  it('mock 모드에서 잘못된 query는 400을 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(true);

    const res = await GET(makeGetRequest('unknown=value'));
    const body = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('mock 모드에서 payment_pending status는 400을 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(true);

    const res = await GET(makeGetRequest('status=payment_pending'));
    const body = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('real 모드에서 requireSellerStore store id로 service를 호출한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireSellerStore).mockResolvedValue(sellerResult);
    vi.mocked(getSellerOrders).mockResolvedValue(mockSellerOrderList);

    const res = await GET(makeGetRequest());

    expect(res.status).toBe(200);
    expect(getSellerOrders).toHaveBeenCalledWith(
      STORE_ID,
      expect.objectContaining({ page: 1, pageSize: 20 })
    );
  });

  it('requireSellerStore가 실패하면 error envelope를 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireSellerStore).mockRejectedValue(
      new AppError(ERROR_CODE.STORE_NOT_APPROVED, 403)
    );

    const res = await GET(makeGetRequest());
    const body = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(403);
    expect(body.error.code).toBe('STORE_NOT_APPROVED');
  });
});
