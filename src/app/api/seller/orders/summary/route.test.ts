import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { SellerOrderSummaryResponse } from '@/contracts/order';
import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { requireSellerStore } from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { mockMyStore } from '@/mocks/stores';

import { GET } from './route';
import { getSellerOrderSummary } from '../_lib/service';

vi.mock('@/app/api/_lib/auth', () => ({
  requireSellerStore: vi.fn(),
}));

vi.mock('@/app/api/_lib/mock', () => ({
  isApiMockEnabled: vi.fn(),
}));

vi.mock('../_lib/service', () => ({
  getSellerOrderSummary: vi.fn(),
}));

const STORE_ID = mockMyStore.id;

const sellerResult = {
  authUser: {},
  serviceUser: {},
  store: { id: STORE_ID },
} as Awaited<ReturnType<typeof requireSellerStore>>;

const summary: SellerOrderSummaryResponse = {
  totalCount: 4,
  statusCounts: {
    reserved: 1,
    accepted: 1,
    ready: 0,
    completed: 1,
    cancelling: 0,
    cancelled: 0,
    noShow: 1,
    expired: 0,
  },
};

describe('GET /api/seller/orders/summary', () => {
  beforeEach(() => vi.clearAllMocks());

  it('mock 모드에서 mock seller orders 기준 summary를 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(true);

    const res = await GET();
    const body = (await res.json()) as { data: SellerOrderSummaryResponse };

    expect(res.status).toBe(200);
    expect(body.data.totalCount).toBeGreaterThan(0);
    expect(body.data.statusCounts.reserved).toBeGreaterThanOrEqual(0);
    expect(requireSellerStore).not.toHaveBeenCalled();
  });

  it('real 모드에서 seller store id로 summary service를 호출한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireSellerStore).mockResolvedValue(sellerResult);
    vi.mocked(getSellerOrderSummary).mockResolvedValue(summary);

    const res = await GET();
    const body = (await res.json()) as { data: SellerOrderSummaryResponse };

    expect(res.status).toBe(200);
    expect(getSellerOrderSummary).toHaveBeenCalledWith(STORE_ID);
    expect(body.data).toEqual(summary);
  });

  it('requireSellerStore가 실패하면 error envelope를 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireSellerStore).mockRejectedValue(
      new AppError(ERROR_CODE.STORE_INACTIVE, 403)
    );

    const res = await GET();
    const body = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(403);
    expect(body.error.code).toBe('STORE_INACTIVE');
  });
});
