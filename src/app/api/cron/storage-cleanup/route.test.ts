import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';

import { runStorageCleanup } from './_lib/service';
import { GET } from './route';

vi.mock('./_lib/service', () => ({
  runStorageCleanup: vi.fn(),
}));

const VALID_SECRET = 'test-cron-secret';

function makeRequest(authHeader?: string): Request {
  return new Request('http://localhost/api/cron/storage-cleanup', {
    method: 'GET',
    headers: authHeader ? { Authorization: authHeader } : {},
  });
}

describe('GET /api/cron/storage-cleanup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('CRON_SECRET', VALID_SECRET);
  });

  it('CRON_SECRET 미설정 시 401을 반환한다', async () => {
    vi.stubEnv('CRON_SECRET', '');

    const res = await GET(makeRequest(`Bearer ${VALID_SECRET}`) as never);

    expect(res.status).toBe(401);
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe(ERROR_CODE.UNAUTHORIZED);
  });

  it('Authorization 헤더 불일치 시 401을 반환한다', async () => {
    const res = await GET(makeRequest('Bearer wrong-secret') as never);

    expect(res.status).toBe(401);
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe(ERROR_CODE.UNAUTHORIZED);
  });

  it('Authorization 헤더 없으면 401을 반환한다', async () => {
    const res = await GET(makeRequest() as never);

    expect(res.status).toBe(401);
  });

  it('인증 성공 시 service를 호출하고 200 + deletedCount를 반환한다', async () => {
    vi.mocked(runStorageCleanup).mockResolvedValue({ deletedCount: 3 });

    const res = await GET(makeRequest(`Bearer ${VALID_SECRET}`) as never);

    expect(res.status).toBe(200);
    const body = (await res.json()) as { data: { deletedCount: number } };
    expect(body.data.deletedCount).toBe(3);
    expect(runStorageCleanup).toHaveBeenCalledOnce();
  });

  it('service가 AppError를 던지면 500 envelope을 반환한다', async () => {
    vi.mocked(runStorageCleanup).mockRejectedValue(
      new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500)
    );

    const res = await GET(makeRequest(`Bearer ${VALID_SECRET}`) as never);

    expect(res.status).toBe(500);
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe(ERROR_CODE.INTERNAL_SERVER_ERROR);
  });
});
