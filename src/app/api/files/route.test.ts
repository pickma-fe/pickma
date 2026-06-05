import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { requireActiveUser } from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';

import { deleteStorageFiles } from './_lib/service';
import { DELETE } from './route';

vi.mock('@/app/api/_lib/auth', () => ({
  requireActiveUser: vi.fn(),
}));

vi.mock('@/app/api/_lib/mock', () => ({
  isApiMockEnabled: vi.fn(),
}));

vi.mock('./_lib/service', () => ({
  deleteStorageFiles: vi.fn(),
}));

const USER_ID = '00000000-0000-4000-8000-000000000001';
const STORAGE_PATH = `${USER_ID}/upload-1/business_license/file.pdf`;

const activeUserResult = {
  authUser: { id: USER_ID },
  serviceUser: {},
} as unknown as Awaited<ReturnType<typeof requireActiveUser>>;

function makeDeleteRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/files', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('DELETE /api/files', () => {
  beforeEach(() => vi.clearAllMocks());

  it('mock 모드에서 null을 반환하고 requireActiveUser를 호출하지 않는다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(true);

    const res = await DELETE(
      makeDeleteRequest({ storagePaths: [STORAGE_PATH] })
    );
    const body = (await res.json()) as { data: null };

    expect(res.status).toBe(200);
    expect(body.data).toBeNull();
    expect(requireActiveUser).not.toHaveBeenCalled();
  });

  it('body 없이 호출하면 400 VALIDATION_ERROR를 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);

    const res = await DELETE(makeDeleteRequest({}));
    const body = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('storagePaths가 빈 배열이면 400 VALIDATION_ERROR를 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);

    const res = await DELETE(makeDeleteRequest({ storagePaths: [] }));
    const body = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('real 모드에서 requireActiveUser 호출 후 deleteStorageFiles를 호출한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireActiveUser).mockResolvedValue(activeUserResult);
    vi.mocked(deleteStorageFiles).mockResolvedValue(undefined);

    const res = await DELETE(
      makeDeleteRequest({ storagePaths: [STORAGE_PATH] })
    );

    expect(res.status).toBe(200);
    expect(requireActiveUser).toHaveBeenCalledOnce();
    expect(deleteStorageFiles).toHaveBeenCalledWith(USER_ID, [STORAGE_PATH]);
  });

  it('타인 소유 경로 포함 시 403 FORBIDDEN을 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireActiveUser).mockResolvedValue(activeUserResult);
    vi.mocked(deleteStorageFiles).mockRejectedValue(
      new AppError(ERROR_CODE.FORBIDDEN, 403)
    );

    const res = await DELETE(
      makeDeleteRequest({ storagePaths: ['other-user/path.pdf'] })
    );
    const body = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(403);
    expect(body.error.code).toBe('FORBIDDEN');
  });

  it('인증 실패 시 401을 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireActiveUser).mockRejectedValue(
      new AppError(ERROR_CODE.UNAUTHORIZED, 401)
    );

    const res = await DELETE(
      makeDeleteRequest({ storagePaths: [STORAGE_PATH] })
    );
    const body = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(401);
    expect(body.error.code).toBe('UNAUTHORIZED');
  });
});
