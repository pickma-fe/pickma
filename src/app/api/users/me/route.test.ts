import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { UserResponse } from '@/contracts/user';
import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { requireActiveUser } from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { mockUser } from '@/mocks/users';

import { updateUser } from './_lib/service';
import { DELETE, GET, PATCH } from './route';

vi.mock('@/app/api/_lib/auth', () => ({
  requireActiveUser: vi.fn(),
}));

vi.mock('@/app/api/_lib/mock', () => ({
  isApiMockEnabled: vi.fn(),
}));

vi.mock('./_lib/service', () => ({
  updateUser: vi.fn(),
}));

const USER_ID = '00000000-0000-4000-8000-000000000001';

const activeUserResult = {
  authUser: { id: USER_ID, app_metadata: { provider: 'kakao' } },
  serviceUser: { id: USER_ID, role: 'customer', status: 'active' },
} as unknown as Awaited<ReturnType<typeof requireActiveUser>>;

function makeGetRequest(): NextRequest {
  return new NextRequest('http://localhost/api/users/me');
}

function makePatchRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/users/me', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('GET /api/users/me', () => {
  beforeEach(() => vi.clearAllMocks());

  it('mock 모드에서 mockUser를 반환하고 requireActiveUser를 호출하지 않는다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(true);

    const res = await GET(makeGetRequest());
    const body = (await res.json()) as { data: UserResponse };

    expect(res.status).toBe(200);
    expect(body.data.email).toBe(mockUser.email);
    expect(requireActiveUser).not.toHaveBeenCalled();
  });

  it('real 모드에서 requireActiveUser 호출 후 serviceUser를 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireActiveUser).mockResolvedValue(activeUserResult);

    const res = await GET(makeGetRequest());
    const body = (await res.json()) as {
      data: { id: string; authProvider?: string };
    };

    expect(res.status).toBe(200);
    expect(requireActiveUser).toHaveBeenCalledOnce();
    expect(body.data.id).toBe(USER_ID);
    expect(body.data.authProvider).toBe('kakao');
  });

  it('requireActiveUser가 실패하면 error envelope를 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireActiveUser).mockRejectedValue(
      new AppError(ERROR_CODE.UNAUTHORIZED, 401)
    );

    const res = await GET(makeGetRequest());
    const body = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(401);
    expect(body.error.code).toBe('UNAUTHORIZED');
  });
});

describe('PATCH /api/users/me', () => {
  beforeEach(() => vi.clearAllMocks());

  it('mock 모드에서 수정된 사용자 정보를 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(true);

    const res = await PATCH(makePatchRequest({ name: '새 이름' }));
    const body = (await res.json()) as { data: UserResponse };

    expect(res.status).toBe(200);
    expect(body.data.name).toBe('새 이름');
    expect(requireActiveUser).not.toHaveBeenCalled();
  });

  it('mock 모드에서 빈 body는 400을 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(true);

    const res = await PATCH(makePatchRequest({}));
    const body = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('real 모드에서 requireActiveUser 호출 후 serviceUser.id로 updateUser를 호출한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireActiveUser).mockResolvedValue(activeUserResult);
    vi.mocked(updateUser).mockResolvedValue({
      ...mockUser,
      id: USER_ID,
      name: '새 이름',
    });

    const res = await PATCH(makePatchRequest({ name: '새 이름' }));

    expect(res.status).toBe(200);
    expect(requireActiveUser).toHaveBeenCalledOnce();
    expect(updateUser).toHaveBeenCalledWith(
      USER_ID,
      expect.objectContaining({ name: '새 이름' })
    );
  });

  it('real 모드에서 수정된 사용자 정보에 authProvider를 포함한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireActiveUser).mockResolvedValue(activeUserResult);
    vi.mocked(updateUser).mockResolvedValue({
      ...mockUser,
      id: USER_ID,
      name: '새 이름',
    });

    const res = await PATCH(makePatchRequest({ name: '새 이름' }));
    const body = (await res.json()) as {
      data: { id: string; authProvider?: string };
    };

    expect(res.status).toBe(200);
    expect(body.data.authProvider).toBe('kakao');
  });

  it('requireActiveUser가 실패하면 error envelope를 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireActiveUser).mockRejectedValue(
      new AppError(ERROR_CODE.FORBIDDEN, 403)
    );

    const res = await PATCH(makePatchRequest({ name: '새 이름' }));
    const body = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(403);
    expect(body.error.code).toBe('FORBIDDEN');
  });
});

describe('DELETE /api/users/me', () => {
  beforeEach(() => vi.clearAllMocks());

  it('mock 모드에서 null을 반환하고 requireActiveUser를 호출하지 않는다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(true);

    const res = await DELETE();
    const body = (await res.json()) as { data: null };

    expect(res.status).toBe(200);
    expect(body.data).toBeNull();
    expect(requireActiveUser).not.toHaveBeenCalled();
  });

  it('real 모드에서 requireActiveUser 호출 후 501을 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireActiveUser).mockResolvedValue(activeUserResult);

    const res = await DELETE();
    const body = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(501);
    expect(body.error.code).toBe('NOT_IMPLEMENTED');
    expect(requireActiveUser).toHaveBeenCalledOnce();
  });

  it('requireActiveUser가 실패하면 error envelope를 반환한다', async () => {
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
