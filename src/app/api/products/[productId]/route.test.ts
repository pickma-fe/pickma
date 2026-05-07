import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ProductDetailResponse } from '@/contracts/product';
import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { isApiMockEnabled } from '@/app/api/_lib/mock';

import { GET } from './route';
import { getProductById } from '../_lib/service';

vi.mock('@/app/api/_lib/mock', () => ({
  isApiMockEnabled: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn().mockResolvedValue({}),
}));

vi.mock('../_lib/service', () => ({
  getProductById: vi.fn(),
}));

const MOCK_UUID = '00000000-0000-4000-8000-000000000001';
const NONEXISTENT_UUID = '00000000-0000-4000-8000-000000000099';
const INVALID_ID = 'not-a-uuid';

function makeCtx(productId: string) {
  return { params: Promise.resolve({ productId }) };
}

describe('GET /api/products/[productId]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('UUID 검증', () => {
    it('UUID가 아니면 real 모드에서 400을 반환한다', async () => {
      vi.mocked(isApiMockEnabled).mockReturnValue(false);
      const res = await GET(
        new Request('http://localhost'),
        makeCtx(INVALID_ID)
      );
      expect(res.status).toBe(400);
      const body = (await res.json()) as {
        error: { details: { path: string }[] };
      };
      expect(body.error.details[0].path).toBe('productId');
    });

    it('UUID가 아니면 mock 모드에서도 400을 반환한다', async () => {
      vi.mocked(isApiMockEnabled).mockReturnValue(true);
      const res = await GET(
        new Request('http://localhost'),
        makeCtx(INVALID_ID)
      );
      expect(res.status).toBe(400);
      const body = (await res.json()) as {
        error: { details: { path: string }[] };
      };
      expect(body.error.details[0].path).toBe('productId');
    });
  });

  describe('mock 모드', () => {
    beforeEach(() => {
      vi.mocked(isApiMockEnabled).mockReturnValue(true);
    });

    it('map에 있는 UUID → 200을 반환한다', async () => {
      const res = await GET(
        new Request('http://localhost'),
        makeCtx(MOCK_UUID)
      );
      expect(res.status).toBe(200);
    });

    it('map에 없는 UUID → 404를 반환한다', async () => {
      const res = await GET(
        new Request('http://localhost'),
        makeCtx(NONEXISTENT_UUID)
      );
      expect(res.status).toBe(404);
    });
  });

  describe('real 모드', () => {
    beforeEach(() => {
      vi.mocked(isApiMockEnabled).mockReturnValue(false);
    });

    it('service가 상품을 반환하면 200을 반환한다', async () => {
      vi.mocked(getProductById).mockResolvedValue(
        {} as unknown as ProductDetailResponse
      );
      const res = await GET(
        new Request('http://localhost'),
        makeCtx(MOCK_UUID)
      );
      expect(res.status).toBe(200);
    });

    it('service가 PRODUCT_NOT_FOUND를 throw하면 404를 반환한다', async () => {
      vi.mocked(getProductById).mockRejectedValue(
        new AppError(ERROR_CODE.PRODUCT_NOT_FOUND, 404)
      );
      const res = await GET(
        new Request('http://localhost'),
        makeCtx(MOCK_UUID)
      );
      expect(res.status).toBe(404);
    });
  });
});
