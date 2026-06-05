import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ProductListItemResponse } from '@/contracts/product';
import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { requireSellerStore } from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';

import { DELETE, GET, PATCH } from './route';
import {
  deleteSellerProduct,
  getSellerProductById,
  updateSellerProduct,
} from '../_lib/service';

vi.mock('@/app/api/_lib/auth', () => ({
  requireSellerStore: vi.fn(),
}));

vi.mock('@/app/api/_lib/mock', () => ({
  isApiMockEnabled: vi.fn(),
}));

vi.mock('../_lib/service', () => ({
  deleteSellerProduct: vi.fn(),
  getSellerProductById: vi.fn(),
  updateSellerProduct: vi.fn(),
}));

const STORE_ID = '00000000-0000-4000-8000-000000000031';
const PRODUCT_ID = '00000000-0000-4000-8000-000000000051';
const INVALID_ID = 'not-a-uuid';
const product = { id: PRODUCT_ID } as ProductListItemResponse;

const sellerResult = {
  authUser: {},
  serviceUser: {},
  store: { id: STORE_ID },
} as Awaited<ReturnType<typeof requireSellerStore>>;

function makeCtx(productId: string) {
  return { params: Promise.resolve({ productId }) };
}

function makePatchRequest(body: unknown): Request {
  return new Request(`http://localhost/api/seller/products/${PRODUCT_ID}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('GET /api/seller/products/[productId]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('productId가 UUID가 아니면 400을 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);

    const res = await GET(
      new Request('http://localhost') as never,
      makeCtx(INVALID_ID)
    );
    const body = (await res.json()) as {
      error: { code: string; details: { path: string }[] };
    };

    expect(res.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.details[0].path).toBe('productId');
  });

  it('mock 모드에서는 mock product를 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(true);

    const res = await GET(
      new Request('http://localhost') as never,
      makeCtx(PRODUCT_ID)
    );

    expect(res.status).toBe(200);
    expect(requireSellerStore).not.toHaveBeenCalled();
  });

  it('real 모드에서는 requireSellerStore store id로 service를 호출한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireSellerStore).mockResolvedValue(sellerResult);
    vi.mocked(getSellerProductById).mockResolvedValue(product);

    const res = await GET(
      new Request('http://localhost') as never,
      makeCtx(PRODUCT_ID)
    );
    const body = (await res.json()) as { data: ProductListItemResponse };

    expect(res.status).toBe(200);
    expect(getSellerProductById).toHaveBeenCalledWith(STORE_ID, PRODUCT_ID);
    expect(body.data.id).toBe(PRODUCT_ID);
  });

  it('service가 PRODUCT_NOT_FOUND를 던지면 404를 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireSellerStore).mockResolvedValue(sellerResult);
    vi.mocked(getSellerProductById).mockRejectedValue(
      new AppError(ERROR_CODE.PRODUCT_NOT_FOUND, 404)
    );

    const res = await GET(
      new Request('http://localhost') as never,
      makeCtx(PRODUCT_ID)
    );

    expect(res.status).toBe(404);
  });

  it('다른 store의 상품 조회 시도 시 404를 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireSellerStore).mockResolvedValue(sellerResult);
    vi.mocked(getSellerProductById).mockRejectedValue(
      new AppError(ERROR_CODE.PRODUCT_NOT_FOUND, 404)
    );

    const res = await GET(
      new Request('http://localhost') as never,
      makeCtx(PRODUCT_ID)
    );

    expect(res.status).toBe(404);
    expect(getSellerProductById).toHaveBeenCalledWith(STORE_ID, PRODUCT_ID);
  });
});

describe('PATCH /api/seller/products/[productId]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('productId가 UUID가 아니면 400을 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);

    const res = await PATCH(
      makePatchRequest({ stock: 3 }) as never,
      makeCtx(INVALID_ID)
    );
    const body = (await res.json()) as {
      error: { code: string; details: { path: string }[] };
    };

    expect(res.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.details[0].path).toBe('productId');
  });

  it('빈 body면 400을 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);

    const res = await PATCH(makePatchRequest({}) as never, makeCtx(PRODUCT_ID));
    const body = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('mock 모드에서는 validation 후 mock product를 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(true);

    const res = await PATCH(
      makePatchRequest({ pickupStartTime: '10:00' }) as never,
      makeCtx(PRODUCT_ID)
    );

    expect(res.status).toBe(200);
    expect(requireSellerStore).not.toHaveBeenCalled();
  });

  it('real 모드에서는 requireSellerStore store id로 service를 호출한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireSellerStore).mockResolvedValue(sellerResult);
    vi.mocked(updateSellerProduct).mockResolvedValue(product);

    const res = await PATCH(
      makePatchRequest({ pickupStartTime: '10:00' }) as never,
      makeCtx(PRODUCT_ID)
    );

    expect(res.status).toBe(200);
    expect(updateSellerProduct).toHaveBeenCalledWith(
      STORE_ID,
      PRODUCT_ID,
      expect.objectContaining({ pickupStartTime: '10:00:00' })
    );
  });

  it('service가 PRODUCT_NOT_FOUND를 던지면 404를 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireSellerStore).mockResolvedValue(sellerResult);
    vi.mocked(updateSellerProduct).mockRejectedValue(
      new AppError(ERROR_CODE.PRODUCT_NOT_FOUND, 404)
    );

    const res = await PATCH(
      makePatchRequest({ stock: 3 }) as never,
      makeCtx(PRODUCT_ID)
    );

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/seller/products/[productId]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('productId가 UUID가 아니면 400을 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);

    const res = await DELETE(
      new Request('http://localhost') as never,
      makeCtx(INVALID_ID)
    );

    expect(res.status).toBe(400);
  });

  it('mock 모드에서는 null data envelope를 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(true);

    const res = await DELETE(
      new Request('http://localhost') as never,
      makeCtx(PRODUCT_ID)
    );
    const body = (await res.json()) as { data: null };

    expect(res.status).toBe(200);
    expect(body.data).toBeNull();
  });

  it('real 모드에서는 requireSellerStore store id로 soft delete를 호출한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireSellerStore).mockResolvedValue(sellerResult);
    vi.mocked(deleteSellerProduct).mockResolvedValue(null);

    const res = await DELETE(
      new Request('http://localhost') as never,
      makeCtx(PRODUCT_ID)
    );
    const body = (await res.json()) as { data: null };

    expect(res.status).toBe(200);
    expect(body.data).toBeNull();
    expect(deleteSellerProduct).toHaveBeenCalledWith(STORE_ID, PRODUCT_ID);
  });
});
