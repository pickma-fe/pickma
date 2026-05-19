import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { StoreResponse } from '@/contracts/store';
import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { requireActiveUser } from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';

import { GET, PATCH } from './route';
import { getMyStore } from '../_lib/service';

vi.mock('@/app/api/_lib/mock', () => ({
  isApiMockEnabled: vi.fn(),
}));

vi.mock('@/app/api/_lib/auth', () => ({
  requireActiveUser: vi.fn(),
}));

vi.mock('../_lib/service', () => ({
  getMyStore: vi.fn(),
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
      vi.mocked(requireActiveUser).mockResolvedValue({
        authUser: {} as Awaited<
          ReturnType<typeof requireActiveUser>
        >['authUser'],
        serviceUser: mockServiceUser,
      });
    });

    it('service가 가게를 반환하면 200을 반환한다', async () => {
      vi.mocked(getMyStore).mockResolvedValue({} as StoreResponse);
      const res = await GET();
      expect(res.status).toBe(200);
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

    it('UNAUTHORIZED throw 시 401을 반환한다', async () => {
      vi.mocked(requireActiveUser).mockRejectedValue(
        new AppError(ERROR_CODE.UNAUTHORIZED, 401)
      );
      const res = await GET();
      expect(res.status).toBe(401);
      const body = (await res.json()) as { error: { code: string } };
      expect(body.error.code).toBe('UNAUTHORIZED');
    });
  });
});

describe('PATCH /api/stores/me', () => {
  it('NOT_IMPLEMENTED(501)을 반환한다', async () => {
    const res = await PATCH();
    expect(res.status).toBe(501);
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe('NOT_IMPLEMENTED');
  });
});
