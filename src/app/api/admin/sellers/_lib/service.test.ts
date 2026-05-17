import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { createServiceRoleClient } from '@/lib/supabase/service';

import {
  approveSellerApplication,
  getPendingSellerApplications,
  rejectSellerApplication,
} from './service';

vi.mock('@/lib/supabase/service', () => ({
  createServiceRoleClient: vi.fn(),
}));

const APP_ID = 'app-00000000-0000-4000-8000-000000000001';
const USER_ID = 'user-00000000-0000-4000-8000-000000000001';

const MOCK_APPLICATION = {
  id: APP_ID,
  user_id: USER_ID,
  status: 'pending' as const,
  business_number: '123-45-67890',
  company_name: '테스트 주식회사',
  representative_name: '홍길동',
  business_address: '서울시 강남구',
  business_type: '소매업',
  business_category: '식품',
  reject_reason: null,
  reviewed_at: null,
  created_at: '2026-05-01T00:00:00Z',
  updated_at: '2026-05-01T00:00:00Z',
};

const MOCK_USER = {
  id: USER_ID,
  email: 'test@example.com',
  name: '홍길동',
  phone: null,
};

function buildListClient() {
  return {
    from: vi.fn().mockImplementation((table: string) => {
      if (table === 'seller_applications') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                range: vi.fn().mockResolvedValue({
                  data: [MOCK_APPLICATION],
                  count: 1,
                  error: null,
                }),
              }),
            }),
          }),
        };
      }
      if (table === 'users') {
        return {
          select: vi.fn().mockReturnValue({
            in: vi.fn().mockResolvedValue({
              data: [MOCK_USER],
              error: null,
            }),
          }),
        };
      }
      // seller_application_documents
      return {
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      };
    }),
  };
}

describe('getPendingSellerApplications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('pending 신청 목록을 반환한다', async () => {
    vi.mocked(createServiceRoleClient).mockReturnValue(
      buildListClient() as unknown as ReturnType<typeof createServiceRoleClient>
    );

    const result = await getPendingSellerApplications(1, 20);
    expect(result.items).toHaveLength(1);
    expect(result.totalCount).toBe(1);
    expect(result.items[0].status).toBe('pending');
    expect(result.items[0].applicantEmail).toBe('test@example.com');
  });
});

describe('approveSellerApplication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('존재하지 않는 신청이면 SELLER_APPLICATION_NOT_FOUND를 던진다', async () => {
    vi.mocked(createServiceRoleClient).mockReturnValue({
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' },
            }),
          }),
        }),
      }),
    } as unknown as ReturnType<typeof createServiceRoleClient>);

    await expect(approveSellerApplication(APP_ID)).rejects.toSatisfy(
      (e: unknown) =>
        e instanceof AppError &&
        e.code === ERROR_CODE.SELLER_APPLICATION_NOT_FOUND
    );
  });

  it('DB 에러 시 INTERNAL_SERVER_ERROR를 던진다', async () => {
    vi.mocked(createServiceRoleClient).mockReturnValue({
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: '500', message: 'db error' },
            }),
          }),
        }),
      }),
    } as unknown as ReturnType<typeof createServiceRoleClient>);

    await expect(approveSellerApplication(APP_ID)).rejects.toSatisfy(
      (e: unknown) =>
        e instanceof AppError && e.code === ERROR_CODE.INTERNAL_SERVER_ERROR
    );
  });

  it('RPC 오류면 VALIDATION_ERROR를 던진다', async () => {
    vi.mocked(createServiceRoleClient).mockReturnValue({
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: APP_ID },
              error: null,
            }),
          }),
        }),
      }),
      rpc: vi
        .fn()
        .mockResolvedValue({ error: { message: 'APPLICATION_NOT_PENDING' } }),
    } as unknown as ReturnType<typeof createServiceRoleClient>);

    await expect(approveSellerApplication(APP_ID)).rejects.toSatisfy(
      (e: unknown) =>
        e instanceof AppError && e.code === ERROR_CODE.VALIDATION_ERROR
    );
  });
});

describe('rejectSellerApplication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('존재하지 않는 신청이면 SELLER_APPLICATION_NOT_FOUND를 던진다', async () => {
    vi.mocked(createServiceRoleClient).mockReturnValue({
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' },
            }),
          }),
        }),
      }),
    } as unknown as ReturnType<typeof createServiceRoleClient>);

    await expect(
      rejectSellerApplication(APP_ID, '서류 미비')
    ).rejects.toSatisfy(
      (e: unknown) =>
        e instanceof AppError &&
        e.code === ERROR_CODE.SELLER_APPLICATION_NOT_FOUND
    );
  });

  it('DB 에러 시 INTERNAL_SERVER_ERROR를 던진다', async () => {
    vi.mocked(createServiceRoleClient).mockReturnValue({
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: '500', message: 'db error' },
            }),
          }),
        }),
      }),
    } as unknown as ReturnType<typeof createServiceRoleClient>);

    await expect(
      rejectSellerApplication(APP_ID, '서류 미비')
    ).rejects.toSatisfy(
      (e: unknown) =>
        e instanceof AppError && e.code === ERROR_CODE.INTERNAL_SERVER_ERROR
    );
  });

  it('이미 처리된 신청이면 VALIDATION_ERROR를 던진다', async () => {
    vi.mocked(createServiceRoleClient).mockReturnValue({
      from: vi.fn().mockImplementation((table: string) => {
        if (table === 'seller_applications') {
          const mockChain = {
            select: vi.fn(),
            update: vi.fn(),
            eq: vi.fn(),
            single: vi.fn(),
          };
          mockChain.select.mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi
                .fn()
                .mockResolvedValue({ data: { id: APP_ID }, error: null }),
            }),
          });
          mockChain.update.mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                select: vi.fn().mockResolvedValue({ data: [], error: null }),
              }),
            }),
          });
          return mockChain;
        }
        return {};
      }),
    } as unknown as ReturnType<typeof createServiceRoleClient>);

    await expect(
      rejectSellerApplication(APP_ID, '서류 미비')
    ).rejects.toSatisfy(
      (e: unknown) =>
        e instanceof AppError && e.code === ERROR_CODE.VALIDATION_ERROR
    );
  });
});
