import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ProductListItemResponse } from '@/contracts/product';
import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { requireSellerStore } from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';

import { createSellerProduct, getSellerProducts } from './_lib/service';
import { GET, POST } from './route';

vi.mock('@/app/api/_lib/auth', () => ({
  requireSellerStore: vi.fn(),
}));

vi.mock('@/app/api/_lib/mock', () => ({
  isApiMockEnabled: vi.fn(),
}));

vi.mock('./_lib/service', () => ({
  createSellerProduct: vi.fn(),
  getSellerProducts: vi.fn(),
}));

const STORE_ID = '00000000-0000-4000-8000-000000000031';
const product = { id: 'product-1' } as ProductListItemResponse;

const sellerResult = {
  authUser: {},
  serviceUser: {},
  store: { id: STORE_ID },
} as Awaited<ReturnType<typeof requireSellerStore>>;

function makeRequest(body: unknown): Request {
  return new Request('http://localhost/api/seller/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('GET /api/seller/products', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('mock 모드에서는 mock seller products를 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(true);

    const res = await GET();

    expect(res.status).toBe(200);
    expect(requireSellerStore).not.toHaveBeenCalled();
  });

  it('real 모드에서는 requireSellerStore store id로 service를 호출한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireSellerStore).mockResolvedValue(sellerResult);
    vi.mocked(getSellerProducts).mockResolvedValue([product]);

    const res = await GET();

    expect(res.status).toBe(200);
    expect(getSellerProducts).toHaveBeenCalledWith(STORE_ID);
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

describe('POST /api/seller/products', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validBody = {
    menuItemId: '00000000-0000-4000-8000-000000000041',
    discountPrice: 7200,
    stock: 8,
    endAt: '2099-12-31T23:59:59.000Z',
    pickupStartTime: '10:00',
    pickupEndTime: '13:30',
  };

  it('mock 모드에서도 body validation 후 201을 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(true);

    const res = await POST(makeRequest(validBody) as never);

    expect(res.status).toBe(201);
    expect(requireSellerStore).not.toHaveBeenCalled();
  });

  it('validation 실패 시 400을 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);

    const res = await POST(
      makeRequest({ ...validBody, pickupStartTime: '10:00:00.000' }) as never
    );
    const body = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('real 모드에서는 requireSellerStore store id로 service를 호출한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireSellerStore).mockResolvedValue(sellerResult);
    vi.mocked(createSellerProduct).mockResolvedValue(product);

    const res = await POST(makeRequest(validBody) as never);

    expect(res.status).toBe(201);
    expect(createSellerProduct).toHaveBeenCalledWith(
      STORE_ID,
      expect.objectContaining({
        pickupStartTime: '10:00:00',
        pickupEndTime: '13:30:00',
      })
    );
  });
});
