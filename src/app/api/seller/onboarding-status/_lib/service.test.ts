import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { createServiceRoleClient } from '@/lib/supabase/service';

import { getSellerOnboardingStatus } from './service';

vi.mock('@/lib/supabase/service', () => ({
  createServiceRoleClient: vi.fn(),
}));

const USER_ID = 'user-00000000-0000-4000-8000-000000000001';
const DB_ERROR = { message: 'connection error' };

type MockResult<T> = { data: T | null; error: unknown };

function buildClient(opts: {
  role?: string;
  application?: { status: string; reject_reason: string | null } | null;
  hasStore?: boolean;
  errors?: { users?: unknown; applications?: unknown; stores?: unknown };
}) {
  const role = opts.role ?? 'customer';
  const application = opts.application !== undefined ? opts.application : null;
  const hasStore = opts.hasStore ?? false;
  const errors = opts.errors ?? {};

  const mockFrom = vi.fn().mockImplementation((table: string) => {
    if (table === 'users') {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi
              .fn()
              .mockResolvedValue({
                data: { role },
                error: errors.users ?? null,
              }),
          }),
        }),
      };
    }
    if (table === 'seller_applications') {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: application ? [application] : [],
                error: errors.applications ?? null,
              } satisfies MockResult<(typeof application)[]>),
            }),
          }),
        }),
      };
    }
    // stores
    return {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({
            data: hasStore ? [{ id: 'store-1' }] : [],
            error: errors.stores ?? null,
          }),
        }),
      }),
    };
  });

  return { from: mockFrom };
}

describe('getSellerOnboardingStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('신청 이력이 없으면 applicationStatus = none', async () => {
    vi.mocked(createServiceRoleClient).mockReturnValue(
      buildClient({ role: 'customer' }) as unknown as ReturnType<
        typeof createServiceRoleClient
      >
    );

    const result = await getSellerOnboardingStatus(USER_ID);
    expect(result.applicationStatus).toBe('none');
    expect(result.role).toBe('customer');
    expect(result.hasStore).toBe(false);
  });

  it('pending 신청이 있으면 applicationStatus = pending', async () => {
    vi.mocked(createServiceRoleClient).mockReturnValue(
      buildClient({
        role: 'customer',
        application: { status: 'pending', reject_reason: null },
      }) as unknown as ReturnType<typeof createServiceRoleClient>
    );

    const result = await getSellerOnboardingStatus(USER_ID);
    expect(result.applicationStatus).toBe('pending');
  });

  it('rejected 신청이 있으면 latestRejectReason 포함', async () => {
    vi.mocked(createServiceRoleClient).mockReturnValue(
      buildClient({
        role: 'customer',
        application: { status: 'rejected', reject_reason: '서류 미비' },
      }) as unknown as ReturnType<typeof createServiceRoleClient>
    );

    const result = await getSellerOnboardingStatus(USER_ID);
    expect(result.applicationStatus).toBe('rejected');
    expect(result.latestRejectReason).toBe('서류 미비');
  });

  it('가게가 있으면 hasStore = true', async () => {
    vi.mocked(createServiceRoleClient).mockReturnValue(
      buildClient({ hasStore: true }) as unknown as ReturnType<
        typeof createServiceRoleClient
      >
    );

    const result = await getSellerOnboardingStatus(USER_ID);
    expect(result.hasStore).toBe(true);
  });

  it('approved + seller role 상태 그대로 반환', async () => {
    vi.mocked(createServiceRoleClient).mockReturnValue(
      buildClient({
        role: 'seller',
        application: { status: 'approved', reject_reason: null },
        hasStore: true,
      }) as unknown as ReturnType<typeof createServiceRoleClient>
    );

    const result = await getSellerOnboardingStatus(USER_ID);
    expect(result.role).toBe('seller');
    expect(result.applicationStatus).toBe('approved');
    expect(result.hasStore).toBe(true);
  });

  it.each([
    ['users', { users: DB_ERROR }],
    ['seller_applications', { applications: DB_ERROR }],
    ['stores', { stores: DB_ERROR }],
  ] as const)(
    '%s 쿼리 에러 시 INTERNAL_SERVER_ERROR를 던진다',
    async (_, errors) => {
      vi.mocked(createServiceRoleClient).mockReturnValue(
        buildClient({ errors }) as unknown as ReturnType<
          typeof createServiceRoleClient
        >
      );

      await expect(getSellerOnboardingStatus(USER_ID)).rejects.toSatisfy(
        (e: unknown) =>
          e instanceof AppError && e.code === ERROR_CODE.INTERNAL_SERVER_ERROR
      );
    }
  );
});
