import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { StoreResponse } from '@/contracts/store';
import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { requireSeller } from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';

import { GET, PATCH } from './route';
import { getMyStore, updateMyStore } from '../_lib/service';

vi.mock('@/app/api/_lib/mock', () => ({
  isApiMockEnabled: vi.fn(),
}));

vi.mock('@/app/api/_lib/auth', () => ({
  requireSeller: vi.fn(),
}));

vi.mock('../_lib/service', () => ({
  getMyStore: vi.fn(),
  updateMyStore: vi.fn(),
}));

const mockServiceUser = {
  id: 'user-1',
  role: 'seller' as const,
  email: 'seller@example.com',
  name: '판매자',
  status: 'active' as const,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const mockRequireSeller = {
  authUser: { id: mockServiceUser.id } as Awaited<
    ReturnType<typeof requireSeller>
  >['authUser'],
  serviceUser: mockServiceUser,
};

describe('GET /api/stores/me', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('mock 모드', () => {
    it('mockMyStore를 200으로 반환한다', async () => {
      vi.mocked(isApiMockEnabled).mockReturnValue(true);
      const res = await GET();
      expect(res.status).toBe(200);
      const body = (await res.json()) as {
        statusCode: number;
        data: StoreResponse;
      };
      expect(body.statusCode).toBe(200);
      expect(body.data).toBeDefined();
    });
  });

  describe('real 모드', () => {
    beforeEach(() => {
      vi.mocked(isApiMockEnabled).mockReturnValue(false);
      vi.mocked(requireSeller).mockResolvedValue(mockRequireSeller);
    });

    it('service가 가게를 반환하면 200을 반환한다', async () => {
      vi.mocked(getMyStore).mockResolvedValue({} as StoreResponse);
      const res = await GET();
      expect(res.status).toBe(200);
      expect(getMyStore).toHaveBeenCalledWith(
        mockServiceUser.id,
        mockServiceUser.role
      );
    });

    it('STORE_NOT_FOUND throw 시 404를 반환한다', async () => {
      vi.mocked(getMyStore).mockRejectedValue(
        new AppError(ERROR_CODE.STORE_NOT_FOUND, 404)
      );
      const res = await GET();
      expect(res.status).toBe(404);
      const body = (await res.json()) as { error: { code: string } };
      expect(body.error.code).toBe('STORE_NOT_FOUND');
    });

    it('FORBIDDEN throw 시 403을 반환한다', async () => {
      vi.mocked(requireSeller).mockRejectedValue(
        new AppError(ERROR_CODE.FORBIDDEN, 403)
      );
      const res = await GET();
      expect(res.status).toBe(403);
      const body = (await res.json()) as { error: { code: string } };
      expect(body.error.code).toBe('FORBIDDEN');
    });
  });
});

describe('PATCH /api/stores/me', () => {
  const makeRequest = (body: object) =>
    new Request('http://localhost/api/stores/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }) as unknown as Parameters<typeof PATCH>[0];

  describe('mock 모드', () => {
    it('업데이트된 가게 정보를 200으로 반환한다', async () => {
      vi.mocked(isApiMockEnabled).mockReturnValue(true);
      const res = await PATCH(makeRequest({ name: '수정된 가게' }));
      expect(res.status).toBe(200);
      const body = (await res.json()) as {
        statusCode: number;
        data: StoreResponse;
      };
      expect(body.statusCode).toBe(200);
    });
  });

  describe('real 모드', () => {
    beforeEach(() => {
      vi.mocked(isApiMockEnabled).mockReturnValue(false);
      vi.mocked(requireSeller).mockResolvedValue(mockRequireSeller);
    });

    it('service가 가게를 반환하면 200을 반환한다', async () => {
      vi.mocked(updateMyStore).mockResolvedValue({} as StoreResponse);
      const res = await PATCH(makeRequest({ name: '수정된 가게' }));
      expect(res.status).toBe(200);
      expect(updateMyStore).toHaveBeenCalledWith(
        mockServiceUser.id,
        mockServiceUser.role,
        expect.objectContaining({ name: '수정된 가게' })
      );
    });

    it('빈 body 요청 시 400을 반환한다', async () => {
      const res = await PATCH(makeRequest({}));
      expect(res.status).toBe(400);
      const body = (await res.json()) as { error: { code: string } };
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });

    it('STORE_NOT_FOUND throw 시 404를 반환한다', async () => {
      vi.mocked(updateMyStore).mockRejectedValue(
        new AppError(ERROR_CODE.STORE_NOT_FOUND, 404)
      );
      const res = await PATCH(makeRequest({ name: '수정된 가게' }));
      expect(res.status).toBe(404);
      const body = (await res.json()) as { error: { code: string } };
      expect(body.error.code).toBe('STORE_NOT_FOUND');
    });
  });
});
