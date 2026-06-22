import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { requireActiveUser } from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { mockSellerApplication } from '@/mocks/seller';

import {
  cancelMySellerApplication,
  getMySellerApplication,
} from './_lib/service';
import { DELETE, GET } from './route';

vi.mock('@/app/api/_lib/auth', () => ({
  requireActiveUser: vi.fn(),
}));

vi.mock('@/app/api/_lib/mock', () => ({
  isApiMockEnabled: vi.fn(),
}));

vi.mock('./_lib/service', () => ({
  getMySellerApplication: vi.fn(),
  cancelMySellerApplication: vi.fn(),
}));

const USER_ID = '00000000-0000-4000-8000-000000000001';

const activeUserResult = {
  authUser: { id: USER_ID },
  serviceUser: { role: 'consumer', status: 'active' },
} as unknown as Awaited<ReturnType<typeof requireActiveUser>>;

describe('GET /api/seller-applications/me', () => {
  beforeEach(() => vi.clearAllMocks());

  it('mock 모드에서 mockSellerApplication을 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(true);

    const res = await GET();
    const body = (await res.json()) as { data: typeof mockSellerApplication };

    expect(res.status).toBe(200);
    expect(body.data.id).toBe(mockSellerApplication.id);
    expect(requireActiveUser).not.toHaveBeenCalled();
  });

  it('real 모드에서 getMySellerApplication 결과를 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireActiveUser).mockResolvedValue(activeUserResult);
    vi.mocked(getMySellerApplication).mockResolvedValue(mockSellerApplication);

    const res = await GET();
    const body = (await res.json()) as { data: typeof mockSellerApplication };

    expect(res.status).toBe(200);
    expect(body.data.id).toBe(mockSellerApplication.id);
    expect(getMySellerApplication).toHaveBeenCalledWith(USER_ID);
  });

  it('SELLER_APPLICATION_NOT_FOUND 시 404를 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireActiveUser).mockResolvedValue(activeUserResult);
    vi.mocked(getMySellerApplication).mockRejectedValue(
      new AppError(ERROR_CODE.SELLER_APPLICATION_NOT_FOUND, 404)
    );

    const res = await GET();
    const body = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(404);
    expect(body.error.code).toBe('SELLER_APPLICATION_NOT_FOUND');
  });
});

describe('DELETE /api/seller-applications/me', () => {
  beforeEach(() => vi.clearAllMocks());

  it('mock 모드에서 null을 반환하고 requireActiveUser를 호출하지 않는다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(true);

    const res = await DELETE();
    const body = (await res.json()) as { data: null };

    expect(res.status).toBe(200);
    expect(body.data).toBeNull();
    expect(requireActiveUser).not.toHaveBeenCalled();
  });

  it('real 모드에서 cancelMySellerApplication을 호출하고 null을 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireActiveUser).mockResolvedValue(activeUserResult);
    vi.mocked(cancelMySellerApplication).mockResolvedValue(undefined);

    const res = await DELETE();
    const body = (await res.json()) as { data: null };

    expect(res.status).toBe(200);
    expect(body.data).toBeNull();
    expect(cancelMySellerApplication).toHaveBeenCalledWith(USER_ID);
  });

  it('SELLER_APPLICATION_NOT_FOUND 시 404를 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireActiveUser).mockResolvedValue(activeUserResult);
    vi.mocked(cancelMySellerApplication).mockRejectedValue(
      new AppError(ERROR_CODE.SELLER_APPLICATION_NOT_FOUND, 404)
    );

    const res = await DELETE();
    const body = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(404);
    expect(body.error.code).toBe('SELLER_APPLICATION_NOT_FOUND');
  });

  it('APPLICATION_CANCEL_NOT_ALLOWED 시 409를 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireActiveUser).mockResolvedValue(activeUserResult);
    vi.mocked(cancelMySellerApplication).mockRejectedValue(
      new AppError(ERROR_CODE.APPLICATION_CANCEL_NOT_ALLOWED, 409)
    );

    const res = await DELETE();
    const body = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(409);
    expect(body.error.code).toBe('APPLICATION_CANCEL_NOT_ALLOWED');
  });

  it('UNAUTHORIZED 시 401을 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireActiveUser).mockRejectedValue(
      new AppError(ERROR_CODE.UNAUTHORIZED, 401)
    );

    const res = await DELETE();
    const body = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(401);
    expect(body.error.code).toBe('UNAUTHORIZED');
  });
});
