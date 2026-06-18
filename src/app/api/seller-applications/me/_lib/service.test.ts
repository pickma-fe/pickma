import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { createServiceRoleClient } from '@/lib/supabase/service';

import {
  cancelMySellerApplication,
  getDocumentSignedUrl,
  getMySellerApplication,
} from './service';

vi.mock('@/lib/supabase/service', () => ({
  createServiceRoleClient: vi.fn(),
}));

const USER_ID = 'user-00000000-0000-4000-8000-000000000001';
const OTHER_USER_ID = 'user-00000000-0000-4000-8000-000000000002';
const APP_ID = 'app-1';
const DOC_ID = 'doc-1';
const STORAGE_PATH = `${USER_ID}/upload-1/business_license/license.pdf`;

const MOCK_APP = {
  id: APP_ID,
  user_id: USER_ID,
  status: 'pending' as const,
  business_number: '123-45-67890',
  company_name: '테스트 주식회사',
  representative_name: '홍길동',
  business_address: '서울시 강남구',
  business_type: '소매업',
  business_category: '식품',
  document_consent_agreed: true,
  document_consent_agreed_at: '2026-05-01T00:00:00Z',
  reject_reason: null,
  reviewed_at: null,
  created_at: '2026-05-01T00:00:00Z',
  updated_at: '2026-05-01T00:00:00Z',
};

const MOCK_DOC = {
  id: DOC_ID,
  application_id: APP_ID,
  type: 'business_license' as const,
  storage_path: STORAGE_PATH,
  original_file_name: 'license.pdf',
  content_type: 'application/pdf',
  size: 1024,
  created_at: '2026-05-01T00:00:00Z',
};

function buildSupabaseMock({
  appData = MOCK_APP,
  appError = null,
  docsData = [MOCK_DOC],
  docsError = null,
  docData = { storage_path: STORAGE_PATH, application_id: APP_ID },
  docError = null,
  ownerData = { user_id: USER_ID },
  ownerError = null,
  signedUrl = 'https://example.com/signed',
  signedError = null,
  deleteError = null,
}: {
  appData?: typeof MOCK_APP | { id: string; status: string } | null;
  appError?: unknown;
  docsData?: (typeof MOCK_DOC)[];
  docsError?: unknown;
  docData?: { storage_path: string; application_id: string } | null;
  docError?: unknown;
  ownerData?: { user_id: string } | null;
  ownerError?: unknown;
  signedUrl?: string;
  signedError?: unknown;
  deleteError?: unknown;
} = {}) {
  const deleteMock = vi.fn().mockReturnValue({
    eq: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: deleteError }),
    }),
  });

  const fromMock = vi.fn().mockImplementation((table: string) => {
    if (table === 'seller_applications') {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                maybeSingle: vi
                  .fn()
                  .mockResolvedValue({ data: appData, error: appError }),
              }),
            }),
            maybeSingle: vi
              .fn()
              .mockResolvedValue({ data: ownerData, error: ownerError }),
          }),
        }),
        delete: deleteMock,
      };
    }
    return {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockImplementation((col: string) => {
          if (col === 'id') {
            return {
              maybeSingle: vi
                .fn()
                .mockResolvedValue({ data: docData, error: docError }),
            };
          }
          return Promise.resolve({ data: docsData, error: docsError });
        }),
      }),
    };
  });

  return {
    from: fromMock,
    storage: {
      from: vi.fn().mockReturnValue({
        createSignedUrl: vi.fn().mockResolvedValue({
          data: signedUrl ? { signedUrl } : null,
          error: signedError,
        }),
      }),
    },
  };
}

describe('getMySellerApplication', () => {
  beforeEach(() => vi.clearAllMocks());

  it('service role client를 사용해 seller_applications를 조회한다', async () => {
    const mock = buildSupabaseMock();
    vi.mocked(createServiceRoleClient).mockReturnValue(
      mock as unknown as ReturnType<typeof createServiceRoleClient>
    );

    await getMySellerApplication(USER_ID);

    expect(createServiceRoleClient).toHaveBeenCalledOnce();
  });

  it('eq("user_id", userId) 소유권 조건으로 본인 데이터만 조회한다', async () => {
    const mock = buildSupabaseMock();
    vi.mocked(createServiceRoleClient).mockReturnValue(
      mock as unknown as ReturnType<typeof createServiceRoleClient>
    );

    await getMySellerApplication(USER_ID);

    const eqCall = mock.from.mock.results[0]?.value.select.mock.results[0]
      ?.value.eq as ReturnType<typeof vi.fn>;
    expect(eqCall).toHaveBeenCalledWith('user_id', USER_ID);
  });

  it('신청이 없으면 SELLER_APPLICATION_NOT_FOUND를 던진다', async () => {
    const mock = buildSupabaseMock({ appData: null });
    vi.mocked(createServiceRoleClient).mockReturnValue(
      mock as unknown as ReturnType<typeof createServiceRoleClient>
    );

    await expect(getMySellerApplication(USER_ID)).rejects.toSatisfy(
      (e: unknown) =>
        e instanceof AppError &&
        e.code === ERROR_CODE.SELLER_APPLICATION_NOT_FOUND
    );
  });

  it('DB 에러 시 INTERNAL_SERVER_ERROR를 던진다', async () => {
    const mock = buildSupabaseMock({ appError: { message: 'db error' } });
    vi.mocked(createServiceRoleClient).mockReturnValue(
      mock as unknown as ReturnType<typeof createServiceRoleClient>
    );

    await expect(getMySellerApplication(USER_ID)).rejects.toSatisfy(
      (e: unknown) =>
        e instanceof AppError && e.code === ERROR_CODE.INTERNAL_SERVER_ERROR
    );
  });
});

describe('getDocumentSignedUrl', () => {
  beforeEach(() => vi.clearAllMocks());

  it('정상 요청 시 signed URL을 반환한다', async () => {
    const mock = buildSupabaseMock();
    vi.mocked(createServiceRoleClient).mockReturnValue(
      mock as unknown as ReturnType<typeof createServiceRoleClient>
    );

    const result = await getDocumentSignedUrl(USER_ID, DOC_ID);
    expect(result).toBe('https://example.com/signed');
  });

  it('문서가 없으면 APPLICATION_DOCUMENT_NOT_FOUND를 던진다', async () => {
    const mock = buildSupabaseMock({ docData: null });
    vi.mocked(createServiceRoleClient).mockReturnValue(
      mock as unknown as ReturnType<typeof createServiceRoleClient>
    );

    await expect(getDocumentSignedUrl(USER_ID, DOC_ID)).rejects.toSatisfy(
      (e: unknown) =>
        e instanceof AppError &&
        e.code === ERROR_CODE.APPLICATION_DOCUMENT_NOT_FOUND
    );
  });

  it('다른 사용자 문서 요청 시 FORBIDDEN을 던진다', async () => {
    const mock = buildSupabaseMock({
      ownerData: { user_id: OTHER_USER_ID },
    });
    vi.mocked(createServiceRoleClient).mockReturnValue(
      mock as unknown as ReturnType<typeof createServiceRoleClient>
    );

    await expect(getDocumentSignedUrl(USER_ID, DOC_ID)).rejects.toSatisfy(
      (e: unknown) => e instanceof AppError && e.code === ERROR_CODE.FORBIDDEN
    );
  });

  it('signed URL 생성 실패 시 INTERNAL_SERVER_ERROR를 던진다', async () => {
    const mock = buildSupabaseMock({
      signedUrl: '',
      signedError: { message: 'storage error' },
    });
    vi.mocked(createServiceRoleClient).mockReturnValue(
      mock as unknown as ReturnType<typeof createServiceRoleClient>
    );

    await expect(getDocumentSignedUrl(USER_ID, DOC_ID)).rejects.toSatisfy(
      (e: unknown) =>
        e instanceof AppError && e.code === ERROR_CODE.INTERNAL_SERVER_ERROR
    );
  });
});

describe('cancelMySellerApplication', () => {
  beforeEach(() => vi.clearAllMocks());

  it('pending 신청이 있으면 삭제 후 정상 반환한다', async () => {
    const mock = buildSupabaseMock({
      appData: { id: APP_ID, status: 'pending' },
    });
    vi.mocked(createServiceRoleClient).mockReturnValue(
      mock as unknown as ReturnType<typeof createServiceRoleClient>
    );

    await expect(cancelMySellerApplication(USER_ID)).resolves.toBeUndefined();
  });

  it('신청이 없으면 SELLER_APPLICATION_NOT_FOUND를 던진다', async () => {
    const mock = buildSupabaseMock({ appData: null });
    vi.mocked(createServiceRoleClient).mockReturnValue(
      mock as unknown as ReturnType<typeof createServiceRoleClient>
    );

    await expect(cancelMySellerApplication(USER_ID)).rejects.toSatisfy(
      (e: unknown) =>
        e instanceof AppError &&
        e.code === ERROR_CODE.SELLER_APPLICATION_NOT_FOUND
    );
  });

  it('status가 approved이면 APPLICATION_CANCEL_NOT_ALLOWED를 던진다', async () => {
    const mock = buildSupabaseMock({
      appData: { id: APP_ID, status: 'approved' },
    });
    vi.mocked(createServiceRoleClient).mockReturnValue(
      mock as unknown as ReturnType<typeof createServiceRoleClient>
    );

    await expect(cancelMySellerApplication(USER_ID)).rejects.toSatisfy(
      (e: unknown) =>
        e instanceof AppError &&
        e.code === ERROR_CODE.APPLICATION_CANCEL_NOT_ALLOWED
    );
  });

  it('status가 rejected이면 APPLICATION_CANCEL_NOT_ALLOWED를 던진다', async () => {
    const mock = buildSupabaseMock({
      appData: { id: APP_ID, status: 'rejected' },
    });
    vi.mocked(createServiceRoleClient).mockReturnValue(
      mock as unknown as ReturnType<typeof createServiceRoleClient>
    );

    await expect(cancelMySellerApplication(USER_ID)).rejects.toSatisfy(
      (e: unknown) =>
        e instanceof AppError &&
        e.code === ERROR_CODE.APPLICATION_CANCEL_NOT_ALLOWED
    );
  });

  it('DB 조회 에러 시 INTERNAL_SERVER_ERROR를 던진다', async () => {
    const mock = buildSupabaseMock({ appError: { message: 'db error' } });
    vi.mocked(createServiceRoleClient).mockReturnValue(
      mock as unknown as ReturnType<typeof createServiceRoleClient>
    );

    await expect(cancelMySellerApplication(USER_ID)).rejects.toSatisfy(
      (e: unknown) =>
        e instanceof AppError && e.code === ERROR_CODE.INTERNAL_SERVER_ERROR
    );
  });

  it('삭제 쿼리 에러 시 INTERNAL_SERVER_ERROR를 던진다', async () => {
    const mock = buildSupabaseMock({
      appData: { id: APP_ID, status: 'pending' },
      deleteError: { message: 'delete failed' },
    });
    vi.mocked(createServiceRoleClient).mockReturnValue(
      mock as unknown as ReturnType<typeof createServiceRoleClient>
    );

    await expect(cancelMySellerApplication(USER_ID)).rejects.toSatisfy(
      (e: unknown) =>
        e instanceof AppError && e.code === ERROR_CODE.INTERNAL_SERVER_ERROR
    );
  });
});
