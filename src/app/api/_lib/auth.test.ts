import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createServerClient } from '@/lib/supabase/server';
import { createServiceRoleClient } from '@/lib/supabase/service';
import { getOrCreateUserByAuthUser } from '@/app/api/_lib/current-user';

import {
  checkApplicationEligibility,
  requireActiveUser,
  requireAdmin,
  requireSeller,
} from './auth';

vi.mock('@/lib/supabase/service');
vi.mock('@/lib/supabase/server');
vi.mock('@/app/api/_lib/current-user');

const mockAuthUser = { id: 'user-1', email: 'test@example.com' };
const mockServiceUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: '홍길동',
  role: 'customer' as const,
  status: 'active' as const,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

function makeSupabaseClient(
  user: unknown,
  storeResult?: { data: unknown; error: unknown }
) {
  return {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user } }) },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi
            .fn()
            .mockResolvedValue(
              storeResult ?? { data: null, error: { code: 'PGRST116' } }
            ),
        }),
      }),
    }),
  };
}

describe('requireActiveUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('미인증이면 UNAUTHORIZED를 던진다', async () => {
    vi.mocked(createServerClient).mockResolvedValue(
      makeSupabaseClient(null) as unknown as Awaited<
        ReturnType<typeof createServerClient>
      >
    );

    await expect(requireActiveUser()).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
      statusCode: 401,
    });
  });

  it('active 사용자면 authUser와 serviceUser를 반환한다', async () => {
    vi.mocked(createServerClient).mockResolvedValue(
      makeSupabaseClient(mockAuthUser) as unknown as Awaited<
        ReturnType<typeof createServerClient>
      >
    );
    vi.mocked(getOrCreateUserByAuthUser).mockResolvedValue(mockServiceUser);

    const result = await requireActiveUser();

    expect(result.authUser).toBe(mockAuthUser);
    expect(result.serviceUser).toBe(mockServiceUser);
  });

  it('suspended 사용자면 FORBIDDEN을 던진다', async () => {
    vi.mocked(createServerClient).mockResolvedValue(
      makeSupabaseClient(mockAuthUser) as unknown as Awaited<
        ReturnType<typeof createServerClient>
      >
    );
    vi.mocked(getOrCreateUserByAuthUser).mockResolvedValue({
      ...mockServiceUser,
      status: 'suspended',
    });

    await expect(requireActiveUser()).rejects.toMatchObject({
      code: 'FORBIDDEN',
      statusCode: 403,
    });
  });

  it('deleted 사용자면 FORBIDDEN을 던진다', async () => {
    vi.mocked(createServerClient).mockResolvedValue(
      makeSupabaseClient(mockAuthUser) as unknown as Awaited<
        ReturnType<typeof createServerClient>
      >
    );
    vi.mocked(getOrCreateUserByAuthUser).mockResolvedValue({
      ...mockServiceUser,
      status: 'deleted',
    });

    await expect(requireActiveUser()).rejects.toMatchObject({
      code: 'FORBIDDEN',
      statusCode: 403,
    });
  });
});

describe('requireSeller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function setupUser(role: 'customer' | 'seller' | 'admin') {
    vi.mocked(getOrCreateUserByAuthUser).mockResolvedValue({
      ...mockServiceUser,
      role,
    });
  }

  it('role이 customer면 FORBIDDEN을 던진다', async () => {
    vi.mocked(createServerClient).mockResolvedValue(
      makeSupabaseClient(mockAuthUser) as unknown as Awaited<
        ReturnType<typeof createServerClient>
      >
    );
    setupUser('customer');

    await expect(requireSeller()).rejects.toMatchObject({
      code: 'FORBIDDEN',
      statusCode: 403,
    });
  });

  it('role이 admin이면 FORBIDDEN을 던진다', async () => {
    vi.mocked(createServerClient).mockResolvedValue(
      makeSupabaseClient(mockAuthUser) as unknown as Awaited<
        ReturnType<typeof createServerClient>
      >
    );
    setupUser('admin');

    await expect(requireSeller()).rejects.toMatchObject({
      code: 'FORBIDDEN',
      statusCode: 403,
    });
  });

  it('seller이고 store 조회에서 PGRST116 외 에러면 INTERNAL_SERVER_ERROR를 던진다', async () => {
    vi.mocked(createServerClient).mockResolvedValue(
      makeSupabaseClient(mockAuthUser, {
        data: null,
        error: { code: '42501' },
      }) as unknown as Awaited<ReturnType<typeof createServerClient>>
    );
    setupUser('seller');

    await expect(requireSeller()).rejects.toMatchObject({
      code: 'INTERNAL_SERVER_ERROR',
      statusCode: 500,
    });
  });

  it('seller이고 store가 없으면 STORE_NOT_FOUND를 던진다', async () => {
    vi.mocked(createServerClient).mockResolvedValue(
      makeSupabaseClient(mockAuthUser, {
        data: null,
        error: { code: 'PGRST116' },
      }) as unknown as Awaited<ReturnType<typeof createServerClient>>
    );
    setupUser('seller');

    await expect(requireSeller()).rejects.toMatchObject({
      code: 'STORE_NOT_FOUND',
      statusCode: 404,
    });
  });

  it.each(['pending', 'rejected', 'inactive'] as const)(
    'seller이고 store status가 %s면 STORE_NOT_APPROVED를 던진다',
    async (status) => {
      vi.mocked(createServerClient).mockResolvedValue(
        makeSupabaseClient(mockAuthUser, {
          data: { id: 'store-1', status },
          error: null,
        }) as unknown as Awaited<ReturnType<typeof createServerClient>>
      );
      setupUser('seller');

      await expect(requireSeller()).rejects.toMatchObject({
        code: 'STORE_NOT_APPROVED',
        statusCode: 403,
      });
    }
  );

  it('seller이고 approved store가 있으면 결과를 반환한다', async () => {
    vi.mocked(createServerClient).mockResolvedValue(
      makeSupabaseClient(mockAuthUser, {
        data: { id: 'store-1', status: 'approved' },
        error: null,
      }) as unknown as Awaited<ReturnType<typeof createServerClient>>
    );
    setupUser('seller');

    const result = await requireSeller();
    expect(result.serviceUser.role).toBe('seller');
    expect(result.store).toEqual({ id: 'store-1' });
  });
});

describe('checkApplicationEligibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function setupServiceClient(applications: unknown[]) {
    vi.mocked(createServiceRoleClient).mockReturnValue({
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            in: vi.fn().mockReturnValue({
              limit: vi
                .fn()
                .mockResolvedValue({ data: applications, error: null }),
            }),
          }),
        }),
      }),
    } as unknown as ReturnType<typeof createServiceRoleClient>);
  }

  it('role이 seller면 seller_already_registered를 반환한다', async () => {
    const result = await checkApplicationEligibility('user-1', 'seller');
    expect(result).toEqual({
      eligible: false,
      reason: 'seller_already_registered',
    });
  });

  it('pending 신청이 있으면 application_already_submitted를 반환한다', async () => {
    setupServiceClient([{ id: 'app-1' }]);
    const result = await checkApplicationEligibility('user-1', 'customer');
    expect(result).toEqual({
      eligible: false,
      reason: 'application_already_submitted',
    });
  });

  it('신청이 없으면 eligible true를 반환한다', async () => {
    setupServiceClient([]);
    const result = await checkApplicationEligibility('user-1', 'customer');
    expect(result).toEqual({ eligible: true });
  });
});

describe('requireAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function setupUser(role: 'customer' | 'seller' | 'admin') {
    vi.mocked(createServerClient).mockResolvedValue(
      makeSupabaseClient(mockAuthUser) as unknown as Awaited<
        ReturnType<typeof createServerClient>
      >
    );
    vi.mocked(getOrCreateUserByAuthUser).mockResolvedValue({
      ...mockServiceUser,
      role,
    });
  }

  it('role이 customer면 FORBIDDEN을 던진다', async () => {
    setupUser('customer');
    await expect(requireAdmin()).rejects.toMatchObject({
      code: 'FORBIDDEN',
      statusCode: 403,
    });
  });

  it('role이 seller면 FORBIDDEN을 던진다', async () => {
    setupUser('seller');
    await expect(requireAdmin()).rejects.toMatchObject({
      code: 'FORBIDDEN',
      statusCode: 403,
    });
  });

  it('role이 admin이면 authUser와 serviceUser를 반환한다', async () => {
    setupUser('admin');
    const result = await requireAdmin();
    expect(result.authUser).toBe(mockAuthUser);
    expect(result.serviceUser.role).toBe('admin');
  });
});
