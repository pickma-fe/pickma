import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { requireAdmin } from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';

import { POST } from './route';
import { rejectSellerApplication } from '../../_lib/service';

const mockLogger = { info: vi.fn(), error: vi.fn() };

vi.mock('@/app/api/_lib/logger', () => ({
  generateReqId: vi.fn(() => 'test-req-id'),
  createLogger: vi.fn(() => mockLogger),
}));

vi.mock('@/app/api/_lib/auth', () => ({
  requireAdmin: vi.fn(),
}));

vi.mock('@/app/api/_lib/mock', () => ({
  isApiMockEnabled: vi.fn(),
}));

vi.mock('../../_lib/service', () => ({
  rejectSellerApplication: vi.fn(),
}));

const APPLICATION_ID = '00000000-0000-4000-8000-000000000001';
const REJECT_REASON = '서류 미제출';
const ADMIN_USER_ID = 'admin-user-uuid';

const adminResult = {
  authUser: { id: ADMIN_USER_ID },
  serviceUser: {},
} as Awaited<ReturnType<typeof requireAdmin>>;

function makePostRequest(body: unknown): NextRequest {
  return new NextRequest(
    `http://localhost/api/admin/sellers/${APPLICATION_ID}/reject`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );
}

function makeParams(applicationId = APPLICATION_ID) {
  return { params: Promise.resolve({ applicationId }) };
}

describe('POST /api/admin/sellers/[applicationId]/reject', () => {
  beforeEach(() => vi.clearAllMocks());

  it('mock 모드에서 null을 반환하고 requireAdmin을 호출하지 않는다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(true);

    const res = await POST(
      makePostRequest({ reason: REJECT_REASON }),
      makeParams()
    );
    const body = (await res.json()) as { data: null };

    expect(res.status).toBe(200);
    expect(body.data).toBeNull();
    expect(requireAdmin).not.toHaveBeenCalled();
  });

  it('real 모드에서 reason 없는 body는 400을 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireAdmin).mockResolvedValue(adminResult);

    const res = await POST(makePostRequest({}), makeParams());
    const body = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('real 모드에서 requireAdmin 호출 후 rejectSellerApplication을 호출하고 감사 로그를 기록한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireAdmin).mockResolvedValue(adminResult);
    vi.mocked(rejectSellerApplication).mockResolvedValue(undefined);

    const res = await POST(
      makePostRequest({ reason: REJECT_REASON }),
      makeParams()
    );

    expect(res.status).toBe(200);
    expect(requireAdmin).toHaveBeenCalledOnce();
    expect(rejectSellerApplication).toHaveBeenCalledWith(
      APPLICATION_ID,
      REJECT_REASON
    );
    expect(mockLogger.info).toHaveBeenCalledWith(
      'ADMIN_REJECT_SELLER_SUCCEEDED',
      expect.objectContaining({
        adminUserId: ADMIN_USER_ID,
        applicationId: APPLICATION_ID,
      })
    );
  });

  it('잘못된 UUID params는 400을 반환하고 service를 호출하지 않는다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireAdmin).mockResolvedValue(adminResult);

    const res = await POST(
      makePostRequest({ reason: REJECT_REASON }),
      makeParams('not-a-uuid')
    );
    const body = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(rejectSellerApplication).not.toHaveBeenCalled();
  });

  it('requireAdmin이 실패하면 error envelope를 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireAdmin).mockRejectedValue(
      new AppError(ERROR_CODE.FORBIDDEN, 403)
    );

    const res = await POST(
      makePostRequest({ reason: REJECT_REASON }),
      makeParams()
    );
    const body = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(403);
    expect(body.error.code).toBe('FORBIDDEN');
  });
});
